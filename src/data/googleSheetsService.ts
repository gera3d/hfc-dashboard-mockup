import { Review, Agent, Department } from './dataService';

// Direct CSV URL from published Google Sheet (with specific sheet gid)
const CSV_URL = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_CSV_URL || 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSc40v9L1K1kWHKVyM_c4lip9tLvqwuImTjYLfTAVXGmSSaiHTV77rrqqHNua6vokeybcwqUZKQRVH0/pub?gid=1256929149&single=true&output=csv';

interface ParsedData {
  reviews: Review[];
  agents: Agent[];
  departments: Department[];
}

// Helper function to parse CSV text
function parseCSV(csvText: string): ParsedData {
  const lines = csvText.trim().split('\n');
  console.log('[CSV Parser] Total lines:', lines.length);
  
  if (lines.length < 2) {
    throw new Error('CSV file appears to be empty or malformed');
  }

  // Parse header row
  const headerLine = lines[0];
  const headers = headerLine.split(',').map(h => h.trim().replace(/"/g, '').toLowerCase());
  console.log('[CSV Parser] Headers found:', headers.slice(0, 10).join(', '));

  const reviews: Review[] = [];
  const agentsMap = new Map<string, Agent>();
  const departmentsMap = new Map<string, Department>();

  // Find column indices - handle various column name formats
  const getColumnIndex = (names: string[]) => {
    for (const name of names) {
      const idx = headers.findIndex(h => h === name.toLowerCase() || h.includes(name.toLowerCase()));
      if (idx >= 0) {
        console.log(`[CSV Parser] Found column "${name}" at index ${idx}`);
        return idx;
      }
    }
    console.warn(`[CSV Parser] Column not found for any of:`, names);
    return -1;
  };

  const reviewNoIdx = getColumnIndex(['review no.', 'review no', 'review_no']);
  const ratingIdx = getColumnIndex(['how did we do?', 'how did we do', 'rating']);
  const dateIdx = getColumnIndex(['entry date', 'created', 'date', 'timestamp']);
  const agentIdx = getColumnIndex(['agent']);
  const sourceIdx = getColumnIndex(['source url', 'source']);
  const commentIdx = getColumnIndex(['please provide your feedback below.', 'feedback', 'comment']);
  const customerNameIdx = getColumnIndex(['name', 'customer name', 'reviewer name']);

  console.log('[CSV Parser] Column indices:', {
    reviewNoIdx,
    ratingIdx,
    dateIdx,
    agentIdx,
    sourceIdx,
    commentIdx,
    customerNameIdx
  });
  console.log('[CSV Parser] All headers:', headers);

  // Parse data rows
  lines.slice(1).forEach((line, index) => {
    if (!line.trim()) return; // Skip empty lines

    try {
      // Simple CSV parsing (handles quoted fields)
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim()); // Push last value

      // Log first data row for debugging
      if (index === 0) {
        console.log('[CSV Parser] First data row sample:', {
          reviewNo: values[reviewNoIdx],
          rating: values[ratingIdx],
          date: values[dateIdx],
          agent: values[agentIdx]
        });
      }

      // Extract review data
      const reviewId = values[reviewNoIdx] || `review_${index + 1}`;
      const ratingStr = values[ratingIdx];
      const rating = parseInt(ratingStr) || 0;
      const dateStr = values[dateIdx] || new Date().toISOString();
      const agentName = values[agentIdx] || 'Unknown';
      const sourceUrl = values[sourceIdx] || 'unknown';
      const customerName = values[customerNameIdx] || '';
      const feedbackComment = values[commentIdx] || '';
      
      // Combine customer name with comment for display
      let comment = '';
      if (customerName && feedbackComment) {
        comment = `${customerName}: ${feedbackComment}`;
      } else if (customerName) {
        comment = `Review by ${customerName}`;
      } else if (feedbackComment) {
        comment = feedbackComment;
      }

      // Skip if no valid rating
      if (rating < 1 || rating > 5) {
        return;
      }

      // Create agent ID from name
      const agentId = agentName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').replace(/!$/, '');
      
      // Determine department from agent name or default to 'general'
      const departmentId = 'general';
      const departmentName = 'General';

      // Store department
      if (!departmentsMap.has(departmentId)) {
        departmentsMap.set(departmentId, {
          id: departmentId,
          name: departmentName
        });
      }

      // Store agent
      if (!agentsMap.has(agentId)) {
        agentsMap.set(agentId, {
          id: agentId,
          agent_key: agentId,
          display_name: agentName.replace(/!$/, ''), // Remove trailing !
          department_id: departmentId
        });
      }

      // Determine source from URL
      let source = 'unknown';
      if (sourceUrl.includes('google')) source = 'google';
      else if (sourceUrl.includes('yelp')) source = 'yelp';
      else if (sourceUrl.includes('facebook')) source = 'facebook';
      else if (sourceUrl.includes('why57') || sourceUrl.includes('hello.')) source = 'website';

      // Parse date - handle various formats
      let reviewDate: string;
      try {
        // Handle format: "2024/Jan/01 1:00:52 AM"
        reviewDate = new Date(dateStr).toISOString();
      } catch {
        reviewDate = new Date().toISOString();
      }

      // Add review
      reviews.push({
        id: reviewId.toString(),
        ext_review_id: reviewId.toString(),
        agent_id: agentId,
        department_id: departmentId,
        rating: rating,
        comment: comment,
        review_ts: reviewDate,
        source: source
      });

    } catch (error) {
      console.warn(`[CSV Parser] Error parsing line ${index + 2}:`, error);
    }
  });

  console.log('[CSV Parser] Parsed results:', {
    reviews: reviews.length,
    agents: agentsMap.size,
    departments: departmentsMap.size,
    agentsList: Array.from(agentsMap.keys()).slice(0, 10),
    dateRange: reviews.length > 0 ? {
      first: reviews[0]?.review_ts,
      last: reviews[reviews.length - 1]?.review_ts
    } : null
  });

  return {
    reviews,
    agents: Array.from(agentsMap.values()),
    departments: Array.from(departmentsMap.values())
  };
}

// Fetch data from local cached file (fast)
export async function fetchCachedData(): Promise<ParsedData | null> {
  try {
    console.log('[Google Sheets] Loading from local cache...');
    
    // Fetch cached data from API route (avoids HMR issues with direct JSON import)
    const response = await fetch('/api/cached-data', {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error('[Google Sheets] Failed to fetch cached data:', response.status);
      return null;
    }
    
    const cachedSheetsData = await response.json();
    
    if (!cachedSheetsData.csv || cachedSheetsData.csv.length === 0) {
      console.log('[Google Sheets] No cached data available. Please sync from Google Sheets.');
      return null;
    }

    console.log('[Google Sheets] Found cached data from:', cachedSheetsData.lastUpdated);
    const parsedData = parseCSV(cachedSheetsData.csv);
    console.log(`[Google Sheets] Loaded ${parsedData.reviews.length} reviews, ${parsedData.agents.length} agents from cache`);
    
    return parsedData;
  } catch (error) {
    console.error('[Google Sheets] Error loading cached data:', error);
    return null;
  }
}

// Sync fresh data from Google Sheets (slow, saves to local cache)
export async function syncFromGoogleSheets(): Promise<{ success: boolean; message: string; lastUpdated?: string }> {
  try {
    console.log('[Google Sheets] Syncing from Google Sheets...');
    
    const response = await fetch('/api/sync-sheets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || 'Sync failed');
    }

    const result = await response.json();
    console.log('[Google Sheets] Sync successful:', result);
    
    return {
      success: true,
      message: 'Data synced successfully',
      lastUpdated: result.lastUpdated
    };
  } catch (error) {
    console.error('[Google Sheets] Sync error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Sync failed'
    };
  }
}

// Fetch data from Google Sheets CSV directly (fallback if no cache)
export async function fetchGoogleSheetsData(): Promise<ParsedData | null> {
  // Try cached data first
  const cached = await fetchCachedData();
  if (cached) {
    return cached;
  }

  console.log('[Google Sheets] No cache available, attempting direct fetch...');
  return null;
}

// Cache management
let cachedData: ParsedData | null = null;
let cacheExpiry: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getCachedGoogleSheetsData(): Promise<ParsedData | null> {
  const now = Date.now();

  if (cachedData && now < cacheExpiry) {
    return cachedData;
  }

  const freshData = await fetchGoogleSheetsData();

  if (freshData) {
    cachedData = freshData;
    cacheExpiry = now + CACHE_DURATION;
  }

  return freshData;
}

// Refresh function to clear cache and fetch fresh data
export async function refreshGoogleSheetsData(): Promise<ParsedData | null> {
  // Force fresh fetch by clearing cache
  cachedData = null;
  cacheExpiry = 0;
  
  return await getCachedGoogleSheetsData();
}