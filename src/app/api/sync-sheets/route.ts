import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSc40v9L1K1kWHKVyM_c4lip9tLvqwuImTjYLfTAVXGmSSaiHTV77rrqqHNua6vokeybcwqUZKQRVH0/pub?gid=1256929149&single=true&output=csv';
const FETCH_TIMEOUT = 90000; // 90 seconds

// Server-side fetch with timeout and retry
async function fetchWithTimeout(url: string, timeout = FETCH_TIMEOUT, retries = 2): Promise<Response> {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      console.log(`[Sync] Attempt ${attempt}/${retries} - Downloading from Google Sheets...`);
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/csv,text/plain,*/*',
        },
        redirect: 'follow',
        cache: 'no-store',
      });
      clearTimeout(timeoutId);
      console.log(`[Sync] Attempt ${attempt} succeeded!`);
      return response;
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err;
      console.error(`[Sync] Attempt ${attempt} failed:`, err);
      
      if (attempt < retries) {
        const delay = 2000 * attempt;
        console.log(`[Sync] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

// POST endpoint to sync data from Google Sheets
export async function POST() {
  try {
    console.log('[Sync] Starting sync from Google Sheets...');
    
    const response = await fetchWithTimeout(CSV_URL);
    
    if (!response.ok) {
      throw new Error(`Failed to download CSV: ${response.status}`);
    }
    
    const csvText = await response.text();
    const lines = csvText.trim().split('\n');
    
    console.log('[Sync] CSV downloaded:', {
      size: csvText.length,
      lines: lines.length
    });

    // Save to local file with timestamp
    const dataToSave = {
      csv: csvText,
      lastUpdated: new Date().toISOString(),
      stats: {
        size: csvText.length,
        lines: lines.length
      }
    };

    // Save to src/data/cached-sheets-data.json
    const filePath = join(process.cwd(), 'src', 'data', 'cached-sheets-data.json');
    await writeFile(filePath, JSON.stringify(dataToSave, null, 2), 'utf-8');
    
    console.log('[Sync] Data saved to:', filePath);

    return NextResponse.json({
      success: true,
      message: 'Data synced successfully',
      lastUpdated: dataToSave.lastUpdated,
      stats: dataToSave.stats
    });
    
  } catch (err: unknown) {
    const errMessage = (err as { message?: string })?.message || 'Unknown error';
    console.error('[Sync] Error:', errMessage);
    
    return NextResponse.json(
      { error: errMessage },
      { status: 500 }
    );
  }
}
