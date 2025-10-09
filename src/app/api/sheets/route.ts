import { NextResponse } from 'next/server';

// Use the direct CSV download URL with specific sheet ID
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSc40v9L1K1kWHKVyM_c4lip9tLvqwuImTjYLfTAVXGmSSaiHTV77rrqqHNua6vokeybcwqUZKQRVH0/pub?gid=1256929149&single=true&output=csv';

const FETCH_TIMEOUT = 90000; // 90 seconds for server-side fetch

// Server-side fetch with timeout, retry, and redirect following
async function fetchWithTimeout(url: string, timeout = FETCH_TIMEOUT, retries = 2): Promise<Response> {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      console.log(`[API] Attempt ${attempt}/${retries} - Starting fetch with timeout: ${timeout}ms`);
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/csv,text/plain,application/csv,*/*',
          'Accept-Encoding': 'gzip, deflate, br',
        },
        redirect: 'follow', // Follow redirects
        cache: 'no-store',
      });
      clearTimeout(timeoutId);
      console.log(`[API] Attempt ${attempt} succeeded! Status: ${response.status}`);
      return response;
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err;
      console.error(`[API] Attempt ${attempt} failed:`, err);
      
      if (attempt < retries) {
        const delay = 2000 * attempt; // Exponential backoff: 2s, 4s
        console.log(`[API] Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

export async function GET() {
  try {
    console.log('[API] Downloading CSV file from Google Sheets...');
    
    const response = await fetchWithTimeout(CSV_URL);
    
    if (!response.ok) {
      const text = await response.text().catch(() => response.statusText);
      console.error('[API] Failed to download CSV:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Failed to download CSV: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }
    
    const csvText = await response.text();
    const lines = csvText.trim().split('\n');
    console.log('[API] Successfully downloaded CSV from Google Sheets:', {
      size: csvText.length,
      lines: lines.length,
      firstLine: lines[0]?.substring(0, 100)
    });
    
    return NextResponse.json({ csv: csvText }, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
    
  } catch (err: unknown) {
    const errName = (err as { name?: string })?.name;
    const errMessage = (err as { message?: string })?.message || 'Unknown error';
    
    console.error('[API] Error downloading CSV:', errMessage);
    
    if (errName === 'AbortError') {
      return NextResponse.json(
        { error: `CSV download timed out after ${FETCH_TIMEOUT}ms` },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { error: errMessage },
      { status: 500 }
    );
  }
}
