import { Review, Agent, Department } from './dataService';

// Direct CSV URL from published Google Sheet (with specific sheet gid)
const CSV_URL = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_CSV_URL || 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSc40v9L1K1kWHKVyM_c4lip9tLvqwuImTjYLfTAVXGmSSaiHTV77rrqqHNua6vokeybcwqUZKQRVH0/pub?gid=1256929149&single=true&output=csv';

interface ParsedData {
  reviews: Review[];
  agents: Agent[];
  departments: Department[];
}

// IndexedDB helper functions
const DB_NAME = 'GoogleSheetsCache';
const DB_VERSION = 1;
const STORE_NAME = 'parsedData';
const CACHE_KEY = 'google_sheets_data';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not available'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

async function getFromIndexedDB(key: string): Promise<{ data: ParsedData; timestamp: number } | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn('[IndexedDB] Failed to read:', error);
    return null;
  }
}

async function saveToIndexedDB(key: string, data: ParsedData, timestamp: number): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({ data, timestamp }, key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn('[IndexedDB] Failed to write:', error);
  }
}

export async function clearIndexedDB(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn('[IndexedDB] Failed to clear:', error);
  }
}

// Helper function to parse CSV text
function parseCSV(csvText: string): ParsedData {
  const lines = csvText.trim().split('\n');
  
  if (lines.length < 2) {
    throw new Error('CSV file appears to be empty or malformed');
  }

  // Parse header row
  const headerLine = lines[0];
  const headers = headerLine.split(',').map(h => h.trim().replace(/"/g, '').toLowerCase());

  const reviews: Review[] = [];
  const agentsMap = new Map<string, Agent>();
  const departmentsMap = new Map<string, Department>();

  // Find column indices - handle various column name formats
  const getColumnIndex = (names: string[]) => {
    for (const name of names) {
      const idx = headers.findIndex(h => h === name.toLowerCase() || h.includes(name.toLowerCase()));
      if (idx >= 0) {
        return idx;
      }
    }
    return -1;
  };

  const reviewNoIdx = getColumnIndex(['review no.', 'review no', 'review_no']);
  const ratingIdx = getColumnIndex(['how did we do?', 'how did we do', 'rating']);
  const dateIdx = getColumnIndex(['entry date', 'created', 'date', 'timestamp']);
  const agentIdx = getColumnIndex(['agent']);
  const sourceIdx = getColumnIndex(['source url', 'source']);
  const commentIdx = getColumnIndex(['please provide your feedback below.', 'feedback', 'comment']);
  const customerNameIdx = getColumnIndex(['name', 'customer name', 'reviewer name']);

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
        // Try to extract image URL from sourceUrl's imgurl parameter
        let imageUrl: string | undefined;
        try {
          const url = new URL(sourceUrl);
          const imgUrlParam = url.searchParams.get('imgurl');
          if (imgUrlParam) {
            const decodedUrl = decodeURIComponent(imgUrlParam);
            
            // If it's a relative path (starts with /), prepend the hello.why57.com domain
            if (decodedUrl.startsWith('/')) {
              imageUrl = `https://hello.why57.com${decodedUrl}`;
            }
            // If it's already a full URL from hello.why57.com, use it as-is
            else if (decodedUrl.includes('hello.why57.com')) {
              imageUrl = decodedUrl;
            }
            // Otherwise use the URL as-is
            else {
              imageUrl = decodedUrl;
            }
          }
        } catch {
          // If URL parsing fails, generate default image URL using the why57 format
          // Extract the base name from agentName (e.g., "Greg H." -> "GregH")
          const baseName = agentName.replace(/[.\s!]/g, '');
          imageUrl = `https://hello.why57.com/wp-content/uploads/2025/08/${baseName}.png`;
        }
        
        agentsMap.set(agentId, {
          id: agentId,
          agent_key: agentId,
          display_name: agentName.replace(/!$/, ''), // Remove trailing !
          department_id: departmentId,
          image_url: imageUrl
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
        const parsed = new Date(dateStr);
        if (isNaN(parsed.getTime())) {
          console.warn(`[CSV Parser] Invalid date: "${dateStr}" at line ${index + 2}`);
          reviewDate = new Date().toISOString();
        } else {
          reviewDate = parsed.toISOString();
        }
      } catch (error) {
        console.warn(`[CSV Parser] Error parsing date: "${dateStr}" at line ${index + 2}:`, error);
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
      // Silently skip malformed rows
    }
  });

  // --- Merge short-name agents into their full-name counterparts ---
  // The CSV transitioned from short names (e.g., "Billy") to full names with
  // last initial (e.g., "BillyH").  The parser creates separate agent IDs
  // (billy vs billyh) so reviews are split across two "agents" that are really
  // the same person.  We merge the short-name agent into the full-name agent
  // so that Supabase department assignments (which reference the full-name ID)
  // cover ALL of that agent's reviews.

  const allIds = Array.from(agentsMap.keys());

  // Build a merge map: shortId → canonicalLongId
  const mergeMap = new Map<string, string>();

  for (const shortId of allIds) {
    // Find all longer IDs that start with this shortId + exactly one extra letter
    const candidates = allIds.filter(
      longId => longId !== shortId &&
        longId.length === shortId.length + 1 &&
        longId.startsWith(shortId)
    );

    if (candidates.length === 1) {
      // Unambiguous: one full-name match (e.g., billy → billyh)
      mergeMap.set(shortId, candidates[0]);
    } else if (candidates.length > 1) {
      // Ambiguous (e.g., jacob → jacobl, jacobh).  The short name was the
      // original agent before last-initials were added.  Merge into the
      // candidate with the most reviews — that's overwhelmingly the same person.
      const reviewCounts = candidates.map(c => ({
        id: c,
        count: reviews.filter(r => r.agent_id === c).length
      }));
      reviewCounts.sort((a, b) => b.count - a.count);
      mergeMap.set(shortId, reviewCounts[0].id);
      console.log(`[Agent Merge] Ambiguous merge for "${shortId}" → choosing "${reviewCounts[0].id}" (${reviewCounts[0].count} reviews) over ${reviewCounts.slice(1).map(r => `"${r.id}" (${r.count})`).join(', ')}`);
    }
    // candidates.length === 0 → no merge needed (standalone agent like "chris", "jaxon", "rodney")
  }

  if (mergeMap.size > 0) {
    console.log(`[Agent Merge] Merging ${mergeMap.size} short-name agents into full-name counterparts:`,
      Array.from(mergeMap.entries()).map(([s, l]) => `${s}→${l}`).join(', '));

    // Remap review agent_ids
    for (const review of reviews) {
      const canonical = mergeMap.get(review.agent_id);
      if (canonical) {
        review.agent_id = canonical;
      }
    }

    // Remove merged (short-name) agent entries from the map
    for (const shortId of mergeMap.keys()) {
      agentsMap.delete(shortId);
    }
  }

  return {
    reviews,
    agents: Array.from(agentsMap.values()),
    departments: Array.from(departmentsMap.values())
  };
}

// Fetch data from local cached file (fast)
export async function fetchCachedData(): Promise<ParsedData | null> {
  const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
  
  try {
    // Check IndexedDB first (only in browser)
    if (typeof window !== 'undefined') {
      const cached = await getFromIndexedDB(CACHE_KEY);
      
      if (cached) {
        const now = Date.now();
        
        if (now - cached.timestamp < CACHE_DURATION_MS) {
          console.log('[Google Sheets] 💾 Using IndexedDB cache');
          console.log('[Google Sheets] ✅ Loaded', cached.data.reviews.length, 'reviews from cache');
          return cached.data;
        } else {
          console.log('[Google Sheets] ⏰ IndexedDB cache expired');
        }
      }
    }
    
    console.log('[Google Sheets] 📥 Loading from API...');
    
    // Fetch cached data from API route
    // Rely on server-side caching, not timestamp cache-busting
    const response = await fetch(`/api/cached-data`, {
      cache: 'default', // Allow browser HTTP caching with ETag
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('[Google Sheets] ❌ Failed to fetch:', response.status);
      return null;
    }
    
    const cachedSheetsData = await response.json();
    
    if (!cachedSheetsData.csv || cachedSheetsData.csv.length === 0) {
      console.log('[Google Sheets] ⚠️  No cached data available. Please sync from Google Sheets.');
      return null;
    }

    console.log('[Google Sheets] 📊 Parsing', cachedSheetsData.stats.total, 'rows...');
    const parsedData = parseCSV(cachedSheetsData.csv);
    console.log('[Google Sheets] ✅ Loaded', parsedData.reviews.length, 'reviews,', parsedData.agents.length, 'agents');
    
    // Store in IndexedDB (only in browser)
    if (typeof window !== 'undefined') {
      const dataStr = JSON.stringify(parsedData);
      const dataSizeKB = Math.round(dataStr.length / 1024);
      
      await saveToIndexedDB(CACHE_KEY, parsedData, Date.now());
      console.log(`[Google Sheets] 💾 Saved to IndexedDB cache (${dataSizeKB}KB)`);
    }
    
    return parsedData;
  } catch (error) {
    console.error('[Google Sheets] ❌ Error loading cached data:', error);
    return null;
  }
}

// Sync fresh data from Google Sheets (slow, saves to local cache)
export async function syncFromGoogleSheets(): Promise<{ success: boolean; message: string; lastUpdated?: string }> {
  try {
    // Clear IndexedDB cache before syncing (only in browser)
    if (typeof window !== 'undefined') {
      await clearIndexedDB();
      console.log('[Google Sheets] 🗑️ Cleared IndexedDB cache');
    }
    
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

  // Use in-memory cache to avoid parsing 62K rows repeatedly
  if (cachedData && now < cacheExpiry) {
    // Cache hit - return silently (no log spam)
    return cachedData;
  }

  if (cachedData && now >= cacheExpiry) {
    console.log('[Google Sheets] ⟳ Cache expired, fetching fresh data...');
  } else {
    console.log('[Google Sheets] → First load, fetching data...');
  }
  
  const freshData = await fetchGoogleSheetsData();

  if (freshData) {
    cachedData = freshData;
    cacheExpiry = now + CACHE_DURATION;
    console.log('[Google Sheets] ✓ Data cached for', CACHE_DURATION / 1000, 'seconds');
  }

  return freshData;
}

// Refresh function to clear cache and fetch fresh data
export async function refreshGoogleSheetsData(): Promise<ParsedData | null> {
  // Force fresh fetch by clearing all caches
  cachedData = null;
  cacheExpiry = 0;
  
  // Clear IndexedDB cache (only in browser)
  if (typeof window !== 'undefined') {
    await clearIndexedDB();
    console.log('[Google Sheets] 🗑️ Cleared all caches');
  }
  
  return await getCachedGoogleSheetsData();
}