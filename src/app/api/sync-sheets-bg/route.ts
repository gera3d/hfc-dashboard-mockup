import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { google } from 'googleapis';
import { parseCsvToObjects } from '../../../lib/parseSheets';

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID || '';
const SHEET_NAME = process.env.GOOGLE_SHEET_NAME || 'Reviews';

export const maxDuration = 300;

const syncStatus = new Map<string, {
  status: 'idle' | 'downloading' | 'processing' | 'saving' | 'complete' | 'error';
  progress: number;
  message: string;
  error?: string;
  lastUpdated?: string;
  stats?: {
    size: number;
    lines: number;
    rows?: number;
  };
}>();

function hasGoogleSheetId(): boolean {
  return !!process.env.GOOGLE_SHEET_ID;
}

async function downloadSheetData(syncId: string): Promise<string> {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔄 [SYNC START]', syncId);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  syncStatus.set(syncId, {
    status: 'downloading',
    progress: 10,
    message: 'Connecting...'
  });

  const spreadsheetId = SPREADSHEET_ID;

  // Check if we have existing data for quick comparison
  const dataPath = join(process.cwd(), 'src', 'data', 'cached-sheets-data.json');
  let lastRowCount = 0;
  
  try {
    if (existsSync(dataPath)) {
      const { readFile } = await import('fs/promises');
      const existing = JSON.parse(await readFile(dataPath, 'utf-8'));
      lastRowCount = existing.stats?.rows || existing.stats?.lines - 1 || 0;
      console.log('[Sync] 📊 Last sync had', lastRowCount, 'data rows');
    }
  } catch (err) {
    console.log('[Sync] 📝 No previous sync data, doing initial sync');
  }

  syncStatus.set(syncId, {
    status: 'downloading',
    progress: 30,
    message: 'Downloading from Google Sheets API...'
  });

  // Use Google Sheets API with service account credentials
  console.log('[Sync] 📥 Using Google Sheets API...');
  
  let csvText: string;
  
  try {
    // Load credentials from file
    const { readFile: readFileFs } = await import('fs/promises');
    const credentialsPath = join(process.cwd(), 'google-sheets-credentials.json');
    const credentials = JSON.parse(await readFileFs(credentialsPath, 'utf-8'));
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    syncStatus.set(syncId, {
      status: 'downloading',
      progress: 50,
      message: 'Fetching data...'
    });
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_NAME}!A:Z`,
      valueRenderOption: 'FORMATTED_VALUE',
    });

    const rows = response.data.values || [];
    
    console.log('[Sync] ✓ API returned', rows.length, 'rows');
    
    // Convert to CSV format
    csvText = rows.map(row => 
      row.map(cell => {
        const cellStr = String(cell || '');
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',')
    ).join('\n');
    
    console.log('[Sync] ✓ Converted to CSV:', csvText.length, 'bytes');
  } catch (error: any) {
    console.error('[Sync] ❌ API download failed:', error.message);
    throw new Error(`Failed to download from Google Sheets: ${error.message}`);
  }

  const lines = csvText.split('\n').filter(line => line.trim());
  const totalRows = lines.length;
  const dataRows = totalRows > 0 ? totalRows - 1 : 0;
  
  console.log('[Sync] 📏 CSV has', totalRows, 'total lines (', dataRows, 'data rows)');
  
  // Quick check: if row count hasn't changed, skip processing
  if (dataRows === lastRowCount && lastRowCount > 0) {
    console.log('[Sync] ✅ Already up to date! No new rows.');
    syncStatus.set(syncId, {
      status: 'complete',
      progress: 100,
      message: `Already up to date (${dataRows} rows)`,
      lastUpdated: new Date().toISOString(),
      stats: { size: csvText.length, lines: totalRows, rows: dataRows }
    });
    throw new Error(`NO_NEW_DATA:Already up to date with ${dataRows} rows`);
  }
  
  const newRowCount = dataRows - lastRowCount;
  console.log('[Sync] 🆕 Found', newRowCount, 'new rows!');

  syncStatus.set(syncId, {
    status: 'processing',
    progress: 60,
    message: `Processing ${dataRows} rows...`
  });

  return csvText;
}

async function backgroundSync(syncId: string): Promise<void> {
  try {
    syncStatus.set(syncId, {
      status: 'downloading',
      progress: 0,
      message: 'Starting...'
    });

    if (!hasGoogleSheetId()) {
      throw new Error('Google Sheet ID not configured');
    }

    console.log('[Sync] Background sync started for', syncId);

    // Add timeout wrapper (2 minutes max)
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Sync timeout after 120 seconds')), 120000)
    );

    const csvText = await Promise.race([
      downloadSheetData(syncId),
      timeoutPromise
    ]);

    console.log('[Sync] Download complete, CSV length:', csvText.length);

    syncStatus.set(syncId, {
      status: 'saving',
      progress: 90,
      message: 'Saving...'
    });

    const lastUpdated = new Date().toISOString();

    // Parse first, then save only the parsed data to avoid huge JSON files
    console.log('[Sync] Parsing CSV...');
    const parsed = parseCsvToObjects(csvText);
    console.log('[Sync] Parsed', parsed.rows.length, 'rows');

    const parsedPath = join(process.cwd(), 'src', 'data', 'cached-sheets-parsed.json');
    await writeFile(parsedPath, JSON.stringify({ 
      headers: parsed.headers, 
      rows: parsed.rows, 
      lastUpdated 
    }, null, 2), 'utf-8');
    
    console.log('[Sync] Saved parsed data to', parsedPath);

    // Save minimal metadata only (no CSV text to avoid huge files)
    const dataToSave = {
      lastUpdated,
      stats: {
        size: csvText.length,
        lines: csvText.split('\n').length,
        rows: parsed.rows.length
      }
    };

    const filePath = join(process.cwd(), 'src', 'data', 'cached-sheets-data.json');
    await writeFile(filePath, JSON.stringify(dataToSave, null, 2), 'utf-8');
    
    console.log('[Sync] Saved metadata to', filePath);

    console.log('[Sync] Saved metadata to', filePath);

    syncStatus.set(syncId, {
      status: 'complete',
      progress: 100,
      message: 'Complete!',
      lastUpdated,
      stats: dataToSave.stats
    });
    
    console.log('✅ [SYNC COMPLETE]', dataToSave.stats.rows, 'reviews synced');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (err: unknown) {
    const errMessage = (err as { message?: string })?.message || 'Unknown error';
    const errStack = (err as { stack?: string })?.stack;
    
    // Handle "no new data" case gracefully
    if (errMessage.startsWith('NO_NEW_DATA:')) {
      console.log('✓ [SYNC SKIPPED] No new data detected - already up to date');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      // Status already set in downloadSheetData
      return;
    }
    
    console.error('❌ [SYNC ERROR]:', errMessage);
    if (errStack) console.error('Stack:', errStack);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    syncStatus.set(syncId, {
      status: 'error',
      progress: 0,
      message: 'Sync failed',
      error: errMessage
    });
  }
}

export async function POST() {
  const syncId = `sync-${Date.now()}`;
  
  syncStatus.set(syncId, {
    status: 'idle',
    progress: 0,
    message: 'Starting...'
  });

  backgroundSync(syncId).catch(err => {
    console.error('[Sync]:', err);
  });

  return NextResponse.json({
    success: true,
    syncId,
    message: 'Sync started'
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const syncId = searchParams.get('syncId');

  if (!syncId) {
    return NextResponse.json({ error: 'syncId required' }, { status: 400 });
  }

  const status = syncStatus.get(syncId);

  if (!status) {
    return NextResponse.json({ error: 'Sync not found' }, { status: 404 });
  }

  return NextResponse.json(status);
}
