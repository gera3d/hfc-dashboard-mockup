import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { google } from 'googleapis';
import { parseCsvToObjects } from '../../../lib/parseSheets';

// Google Sheets configuration
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID || '1h_yl1WPIQhOJWfRN8g4AZSV2GbZXpVh_w6_CQX2QRw0';
const SHEET_NAME = '1 Reviews'; // Correct sheet tab name
const BATCH_SIZE = 1000; // Rows per batch for pagination

// Fallback to CSV if API credentials not available
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSc40v9L1K1kWHKVyM_c4lip9tLvqwuImTjYLfTAVXGmSSaiHTV77rrqqHNua6vokeybcwqUZKQRVH0/pub?gid=1256929149&single=true&output=csv';
const FETCH_TIMEOUT = 180000; // 180 seconds fallback timeout

// Increase max duration for this route
export const maxDuration = 300; // 5 minutes for large datasets

// In-memory storage for sync status (in production, use Redis or database)
const syncStatus = new Map<string, {
  status: 'idle' | 'downloading' | 'processing' | 'saving' | 'complete' | 'error';
  progress: number;
  message: string;
  error?: string;
  lastUpdated?: string;
  stats?: {
    size: number;
    lines: number;
  };
}>();

// Check if Google Sheets API is configured
function hasGoogleSheetsAPI(): boolean {
  return !!(process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GOOGLE_SHEET_ID);
}

// Download using Google Sheets API with pagination
async function downloadWithSheetsAPI(syncId: string): Promise<string> {
  syncStatus.set(syncId, {
    status: 'downloading',
    progress: 5,
    message: 'Initializing Google Sheets API...'
  });

  // Authenticate
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || './google-sheets-credentials.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  syncStatus.set(syncId, {
    status: 'downloading',
    progress: 10,
    message: 'Getting sheet metadata...'
  });

  // Get sheet dimensions to calculate batches
  const metadata = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });

  // Debug: List all available sheets
  console.log('[Sheets API] Available sheets:', metadata.data.sheets?.map(s => ({
    title: s.properties?.title,
    gid: s.properties?.sheetId,
    rows: s.properties?.gridProperties?.rowCount,
    cols: s.properties?.gridProperties?.columnCount
  })));

  const sheet = metadata.data.sheets?.find(s => s.properties?.title === SHEET_NAME);
  
  if (!sheet) {
    throw new Error(`Sheet "${SHEET_NAME}" not found. Available sheets: ${metadata.data.sheets?.map(s => s.properties?.title).join(', ')}`);
  }

  const rowCount = sheet?.properties?.gridProperties?.rowCount || 0;

  console.log('[Sheets API] Found sheet:', {
    title: sheet.properties?.title,
    gid: sheet.properties?.sheetId,
    totalRows: rowCount,
    totalCols: sheet.properties?.gridProperties?.columnCount
  });

  // Download all data first to see what we're working with
  syncStatus.set(syncId, {
    status: 'downloading',
    progress: 15,
    message: 'Fetching all data from sheet...'
  });

  // Try to get all data at once first (Google Sheets API is smart about this)
  const fullRangeResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}`, // Just the sheet name gets all data
  });

  const allDataRows = fullRangeResponse.data.values || [];
  
  console.log('[Sheets API] Full data fetch:', {
    rowsReturned: allDataRows.length,
    firstRowSample: allDataRows[0]?.slice(0, 5),
    lastRowSample: allDataRows[allDataRows.length - 1]?.slice(0, 5)
  });

  // If we got data, use it directly
  if (allDataRows.length > 0) {
    console.log('[Sheets API] Using direct fetch (all data retrieved)');
    
    syncStatus.set(syncId, {
      status: 'processing',
      progress: 85,
      message: `Processing ${allDataRows.length} rows...`
    });

    // Convert to CSV format
    const csvText = allDataRows
      .map(row => row.map(cell => {
        const cellStr = String(cell || '');
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(','))
      .join('\n');

    console.log('[Sheets API] CSV generated:', {
      size: csvText.length,
      rows: allDataRows.length
    });

    return csvText;
  }

  // Fallback to batching if no data (shouldn't happen)
  console.log('[Sheets API] No data from direct fetch, trying batch approach...');

  // Download in batches
  const batches = Math.ceil(rowCount / BATCH_SIZE);
  let allRows: string[][] = [];
  
  for (let i = 0; i < batches; i++) {
    const startRow = i * BATCH_SIZE + 1; // +1 for 1-based indexing
    const endRow = Math.min((i + 1) * BATCH_SIZE, rowCount);
    const range = `${SHEET_NAME}!A${startRow}:ZZ${endRow}`; // A to ZZ columns
    
    const progress = 10 + Math.floor((i / batches) * 70); // 10-80%
    syncStatus.set(syncId, {
      status: 'downloading',
      progress,
      message: `Downloading batch ${i + 1}/${batches} (rows ${startRow}-${endRow})...`
    });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range,
    });

    const rows = response.data.values || [];
    allRows = allRows.concat(rows);
    
    console.log(`[Sheets API] Batch ${i + 1}/${batches}: ${rows.length} rows`);
  }

  // Convert to CSV format
  syncStatus.set(syncId, {
    status: 'processing',
    progress: 85,
    message: 'Converting to CSV format...'
  });

  const csvText = allRows
    .map(row => row.map(cell => {
      // Escape quotes and wrap in quotes if needed
      const cellStr = String(cell || '');
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(','))
    .join('\n');

  console.log('[Sheets API] CSV generated:', {
    size: csvText.length,
    rows: allRows.length
  });

  return csvText;
}

// Fallback: Download using CSV URL
async function downloadWithCSV(syncId: string): Promise<string> {
  syncStatus.set(syncId, {
    status: 'downloading',
    progress: 10,
    message: 'Connecting to Google Sheets CSV...'
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  
  syncStatus.set(syncId, {
    status: 'downloading',
    progress: 30,
    message: 'Downloading data from Google Sheets (this may take a while)...'
  });

  const response = await fetch(CSV_URL, {
    signal: controller.signal,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/csv,text/plain,*/*',
      'Cache-Control': 'no-cache',
    },
    redirect: 'follow',
    // @ts-ignore - Next.js specific
    next: { revalidate: 0 },
  });
  
  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error(`Failed to download CSV: ${response.status}`);
  }

  syncStatus.set(syncId, {
    status: 'downloading',
    progress: 70,
    message: 'Receiving data...'
  });

  const csvText = await response.text();
  
  console.log('[CSV Fallback] Downloaded:', {
    size: csvText.length,
    lines: csvText.split('\n').length
  });

  return csvText;
}

// Background sync with progress tracking
async function backgroundSync(syncId: string): Promise<void> {
  try {
    // Step 1: Download (0-85%)
    syncStatus.set(syncId, {
      status: 'downloading',
      progress: 0,
      message: 'Starting download...'
    });

    let csvText: string;
    
    // Try Sheets API first, fallback to CSV
    if (hasGoogleSheetsAPI()) {
      console.log('[Background Sync] Using Google Sheets API');
      try {
        csvText = await downloadWithSheetsAPI(syncId);
      } catch (apiError) {
        console.error('[Background Sync] API failed, falling back to CSV:', apiError);
        syncStatus.set(syncId, {
          status: 'downloading',
          progress: 5,
          message: 'API unavailable, using CSV fallback...'
        });
        csvText = await downloadWithCSV(syncId);
      }
    } else {
      console.log('[Background Sync] Using CSV fallback (API not configured)');
      csvText = await downloadWithCSV(syncId);
    }
    
    // Step 2: Process (85-90%)
    syncStatus.set(syncId, {
      status: 'processing',
      progress: 88,
      message: 'Processing data...'
    });

    const lines = csvText.trim().split('\n');
    
    console.log('[Background Sync] Data processed:', {
      size: csvText.length,
      lines: lines.length
    });

    // Step 3: Save (90-100%)
    syncStatus.set(syncId, {
      status: 'saving',
      progress: 93,
      message: 'Saving to cache...'
    });

    const dataToSave = {
      csv: csvText,
      lastUpdated: new Date().toISOString(),
      stats: {
        size: csvText.length,
        lines: lines.length
      }
    };

    const filePath = join(process.cwd(), 'src', 'data', 'cached-sheets-data.json');
    await writeFile(filePath, JSON.stringify(dataToSave, null, 2), 'utf-8');

    // Also produce a parsed JSON file with header->value mapping and normalized Agent field.
    try {
      const parsed = parseCsvToObjects(csvText);
      const parsedPath = join(process.cwd(), 'src', 'data', 'cached-sheets-parsed.json');
      await writeFile(parsedPath, JSON.stringify({ headers: parsed.headers, rows: parsed.rows, lastUpdated: dataToSave.lastUpdated }, null, 2), 'utf-8');
      console.log('[Background Sync] Parsed JSON saved to:', parsedPath);
    } catch (e) {
      console.error('[Background Sync] Failed to parse CSV to JSON:', e);
    }
    
    console.log('[Background Sync] Data saved to:', filePath);

    // Complete!
    syncStatus.set(syncId, {
      status: 'complete',
      progress: 100,
      message: 'Sync complete!',
      lastUpdated: dataToSave.lastUpdated,
      stats: dataToSave.stats
    });

  } catch (err: unknown) {
    const errMessage = (err as { message?: string })?.message || 'Unknown error';
    console.error('[Background Sync] Error:', errMessage);
    
    syncStatus.set(syncId, {
      status: 'error',
      progress: 0,
      message: 'Sync failed',
      error: errMessage
    });
  }
}

// Start a background sync
export async function POST() {
  const syncId = `sync-${Date.now()}`;
  
  // Initialize status
  syncStatus.set(syncId, {
    status: 'idle',
    progress: 0,
    message: 'Starting sync...'
  });

  // Start background sync (don't await)
  backgroundSync(syncId).catch(err => {
    console.error('[Background Sync] Unexpected error:', err);
  });

  return NextResponse.json({
    success: true,
    syncId,
    message: 'Background sync started'
  });
}

// Get sync status
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const syncId = searchParams.get('syncId');

  if (!syncId) {
    return NextResponse.json(
      { error: 'syncId required' },
      { status: 400 }
    );
  }

  const status = syncStatus.get(syncId);
  
  if (!status) {
    return NextResponse.json(
      { error: 'Sync not found' },
      { status: 404 }
    );
  }

  // Clean up completed/error status after retrieval
  if (status.status === 'complete' || status.status === 'error') {
    setTimeout(() => syncStatus.delete(syncId), 60000); // Clean up after 1 minute
  }

  return NextResponse.json(status);
}
