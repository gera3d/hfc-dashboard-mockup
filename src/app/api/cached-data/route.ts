import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

// In-memory cache to avoid re-merging on every request
interface CachedData {
  csv: string;
  lastUpdated: string;
  stats: {
    size: number;
    lines: number;
    current: number;
    historical: number;
    historical1: number;
    historical2: number;
    total: number;
    sources: Array<{ name: string; count: number }>;
  };
  timestamp: number;
  etag: string;
}
let cachedResponse: CachedData | null = null;
const CACHE_DURATION = 10000; // Cache for 10 seconds

// Helper function to convert JSON rows back to CSV format
function jsonToCsv(headers: string[], rows: any[]): string {
  const headerLine = headers.map(h => {
    if (h.includes(',') || h.includes('"') || h.includes('\n')) {
      return `"${h.replace(/"/g, '""')}"`;
    }
    return h;
  }).join(',');

  const dataLines = rows.map(row => {
    return headers.map(h => {
      const value = String(row[h] || '');
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });

  return [headerLine, ...dataLines].join('\n');
}

// GET endpoint to read and merge cached data with historical data
export async function GET(request: Request) {
  try {
    // Check cache first
    const now = Date.now();
    if (cachedResponse && (now - cachedResponse.timestamp) < CACHE_DURATION) {
      console.log('[Cache] ✓ Hit - serving from memory');
      // Return JSON with all metadata (not just CSV)
      return NextResponse.json({
        csv: cachedResponse.csv,
        lastUpdated: cachedResponse.lastUpdated,
        stats: cachedResponse.stats
      }, {
        headers: {
          'Cache-Control': 'public, max-age=10',
          'ETag': cachedResponse.etag
        },
      });
    }

    console.log('[Cache] ⟳ Miss - regenerating merged data...');
    // Load current parsed data
    const currentParsedPath = join(process.cwd(), 'src', 'data', 'cached-sheets-parsed.json');
    const currentParsedContent = await readFile(currentParsedPath, 'utf-8');
    const currentParsed = JSON.parse(currentParsedContent);

    // Load metadata
    const metadataPath = join(process.cwd(), 'src', 'data', 'cached-sheets-data.json');
    const metadataContent = await readFile(metadataPath, 'utf-8');
    const metadata = JSON.parse(metadataContent);

    // Try to load historical data sources
    const historicalSources = [];
    
    // Historical source 1 (May 2024 archive)
    try {
      const historical1Path = join(process.cwd(), 'src', 'data', 'historical-reviews.json');
      const historical1Content = await readFile(historical1Path, 'utf-8');
      const historical1Data = JSON.parse(historical1Content);
      if (historical1Data.rows && historical1Data.rows.length > 0) {
        historicalSources.push({
          name: 'May 2024 Archive',
          data: historical1Data,
          count: historical1Data.rows.length
        });
      }
    } catch (error) {
      // Historical source 1 not found, skip
    }

    // Historical source 2 (Older archive)
    try {
      const historical2Path = join(process.cwd(), 'src', 'data', 'historical-reviews-2.json');
      const historical2Content = await readFile(historical2Path, 'utf-8');
      const historical2Data = JSON.parse(historical2Content);
      if (historical2Data.rows && historical2Data.rows.length > 0) {
        historicalSources.push({
          name: 'Older Archive',
          data: historical2Data,
          count: historical2Data.rows.length
        });
      }
    } catch (error) {
      // Historical source 2 not found, skip
    }

    // If we have historical sources, merge them
    if (historicalSources.length > 0) {
      console.log(`[Cached Data] Merging ${historicalSources.length} historical sources with current data...`);
      
      // Use headers from current parsed data
      const mergedHeaders = currentParsed.headers;
      
      // Get current rows
      const currentRows = currentParsed.rows || [];
      
      // Combine all rows (historical sources + current)
      const allHistoricalRows = historicalSources.flatMap(source => source.data.rows);
      const allRows = [...allHistoricalRows, ...currentRows];
      
      // Convert back to CSV
      const mergedCsv = jsonToCsv(mergedHeaders, allRows);
      
      const historicalCounts = historicalSources.map(s => s.count);
      const totalHistorical = historicalCounts.reduce((a, b) => a + b, 0);
      
      console.log(`[Cache] ✓ Merged ${totalHistorical} historical + ${currentRows.length} current = ${allRows.length} total rows`);
      
      // Store in cache with full metadata
      const etag = `"${now}-${allRows.length}"`;
      const responseData = {
        csv: mergedCsv,
        lastUpdated: currentParsed.lastUpdated || metadata.lastUpdated,
        stats: {
          size: mergedCsv.length,
          lines: allRows.length + 1, // +1 for header
          current: currentRows.length,
          historical: totalHistorical,
          historical1: historicalSources[0]?.count || 0,
          historical2: historicalSources[1]?.count || 0,
          total: allRows.length,
          sources: historicalSources.map(s => ({ name: s.name, count: s.count }))
        },
        timestamp: now,
        etag
      };
      cachedResponse = responseData;
      
      return NextResponse.json(responseData);
    }

    // If no historical data, return current data only
    const currentCsv = jsonToCsv(currentParsed.headers, currentParsed.rows);
    
    // Store in cache with full metadata
    const etag = `"${now}-${currentParsed.rows.length}"`;
    const responseData = {
      csv: currentCsv,
      lastUpdated: currentParsed.lastUpdated || metadata.lastUpdated,
      stats: {
        size: currentCsv.length,
        lines: currentParsed.rows.length + 1,
        current: currentParsed.rows.length,
        historical: 0,
        historical1: 0,
        historical2: 0,
        total: currentParsed.rows.length,
        sources: []
      },
      timestamp: now,
      etag
    };
    cachedResponse = responseData;
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('[Cached Data] Error reading cached data:', error);
    return NextResponse.json(
      { 
        csv: '', 
        lastUpdated: null,
        stats: { size: 0, lines: 0 }
      },
      { status: 200 }
    );
  }
}
