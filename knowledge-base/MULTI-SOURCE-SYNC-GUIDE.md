# Multi-Source Google Sheets Sync - Configuration Guide

## Overview
The dashboard now supports syncing from **multiple Google Sheets sources** to handle:
- Current/recent reviews (primary source)
- Historical review data (legacy sources with different column structures)
- Automatic parsing and normalization of agent names across all sources

## Architecture

### Data Sources
1. **Primary Source** (Google Sheets API)
   - Current reviews with service account authentication
   - Pagination support (1,000 rows per batch)
   - Sheet: `1 Reviews`
   
2. **Historical Sources** (CSV URLs)
   - Older review data with potentially different column layouts
   - Configured as published CSV URLs from Google Sheets
   - Parser automatically adapts to each source's structure

### Files Created During Sync

#### 1. `src/data/cached-sheets-data.json`
Raw CSV cache from primary source:
```json
{
  "csv": "Name,Rating,Date,Agent,...",
  "lastUpdated": "2025-11-12T04:38:16.331Z",
  "stats": {
    "size": 13173701,
    "lines": 22670
  }
}
```

#### 2. `src/data/cached-sheets-parsed.json`
Parsed and normalized data:
```json
{
  "headers": ["Name", "Would You Recommend Us?", "Entry Date", "Source Url", ...],
  "rows": [
    {
      "Name": "",
      "Entry Date": "2025/Nov/11 10:51:55 AM",
      "Source Url": "https://hello.why57.com/reviews/...?agent=MitchC%21",
      "Agent": "MitchC",  // ← Normalized from URL or explicit column
      "How Did We Do?": "5",
      ...
    }
  ],
  "lastUpdated": "2025-11-12T04:38:16.331Z"
}
```

#### 3. `src/data/historical-source-[index].json` (planned)
Cached data from each historical CSV URL.

## CSV Parser (`src/lib/parseSheets.ts`)

### Agent Name Normalization
The parser intelligently extracts agent names:

1. **Explicit Column** (preferred)
   - Looks for columns matching `/agent/i` (case-insensitive)
   - Uses value directly from that column

2. **URL Parameter Extraction** (fallback)
   - Searches for columns like `Source Url`, `Source`, `URL`, `Link`, `Page`
   - Extracts from URL pattern: `?agent=Name%21` or `&agent=Name`
   - Decodes URL encoding and removes trailing `!` or `%21`

### Example Extractions
```javascript
// From URL column:
"https://.../?agent=MitchC%21" → Agent: "MitchC"
"https://.../?agent=Chris%21&imgurl=..." → Agent: "Chris"

// From explicit Agent column:
"Agent" column value: "StevenM" → Agent: "StevenM"
```

## Configuration in Settings

### Current Setup (Environment Variables)
```env
# .env.local
GOOGLE_SHEET_ID=10ooffH9zMhvadCs0LlJXTWti0U2Vm38s7quYfeZGOe4
GOOGLE_APPLICATION_CREDENTIALS=./google-sheets-credentials.json
```

### Adding Historical Sources
To add additional CSV URLs, update the Settings page configuration:

1. **In Settings UI**: Add URL input fields for each historical source
2. **Storage**: Save URLs in localStorage or database
3. **Sync Process**: Fetch each URL sequentially during background sync
4. **Merging**: Combine all sources during dashboard data load

Example configuration object:
```typescript
interface DataSource {
  id: string;
  name: string;
  type: 'sheets-api' | 'csv-url';
  url?: string; // For CSV sources
  sheetId?: string; // For API sources
  sheetName?: string;
  enabled: boolean;
  lastSynced?: string;
}

const dataSources: DataSource[] = [
  {
    id: 'primary',
    name: 'Current Reviews',
    type: 'sheets-api',
    sheetId: process.env.GOOGLE_SHEET_ID,
    sheetName: '1 Reviews',
    enabled: true
  },
  {
    id: 'historical-2024',
    name: '2024 Reviews Archive',
    type: 'csv-url',
    url: 'https://docs.google.com/spreadsheets/d/e/.../pub?output=csv',
    enabled: true
  },
  {
    id: 'historical-2023',
    name: '2023 Reviews Archive',
    type: 'csv-url',
    url: 'https://docs.google.com/spreadsheets/d/e/.../pub?output=csv',
    enabled: true
  }
];
```

## Background Sync Process

### Multi-Source Sync Flow
```
1. User clicks "Sync Now"
   ↓
2. POST /api/sync-sheets-bg with source list
   ↓
3. For each enabled source:
   a. Download data (API or CSV fetch)
   b. Update progress: "Downloading source 1/3..."
   c. Parse CSV → normalize Agent field
   d. Save to cache file
   ↓
4. Merge all sources in memory
   ↓
5. Save combined parsed output
   ↓
6. Mark sync complete
```

### Progress Messages
- "Starting sync (3 sources)..."
- "Downloading primary source (1/3)..."
- "Parsing historical-2024 (2/3)..."
- "Merging 45,123 total rows..."
- "Sync complete!"

## API Route Updates Needed

### Enhanced `/api/sync-sheets-bg/route.ts`
```typescript
// Accept source list in POST body
export async function POST(request: Request) {
  const { sources } = await request.json();
  const syncId = `sync-${Date.now()}`;
  
  backgroundSyncMultipleSources(syncId, sources);
  
  return NextResponse.json({ success: true, syncId });
}

async function backgroundSyncMultipleSources(
  syncId: string,
  sources: DataSource[]
) {
  const enabledSources = sources.filter(s => s.enabled);
  let allRows: ParsedRow[] = [];
  
  for (let i = 0; i < enabledSources.length; i++) {
    const source = enabledSources[i];
    updateProgress(syncId, {
      status: 'downloading',
      progress: (i / enabledSources.length) * 80,
      message: `Downloading ${source.name} (${i+1}/${enabledSources.length})...`
    });
    
    const csvText = await downloadSource(source);
    const parsed = parseCsvToObjects(csvText);
    allRows = allRows.concat(parsed.rows);
    
    // Save individual source cache
    await saveCacheFile(`cached-${source.id}.json`, { 
      csv: csvText, 
      parsed: parsed.rows 
    });
  }
  
  // Save combined output
  await saveCacheFile('cached-sheets-parsed.json', {
    headers: [...new Set(allRows.flatMap(r => Object.keys(r)))],
    rows: allRows,
    sources: enabledSources.map(s => s.name),
    lastUpdated: new Date().toISOString()
  });
}
```

## Dashboard Data Loading

### Reading Combined Data
```typescript
// In dashboard components
import parsedData from '@/data/cached-sheets-parsed.json';

const reviews = parsedData.rows.filter(row => {
  // Filter and aggregate as needed
  return row.Agent && row['How Did We Do?'];
});

// Group by agent
const agentStats = reviews.reduce((acc, row) => {
  const agent = row.Agent;
  if (!acc[agent]) {
    acc[agent] = { total: 0, ratings: [] };
  }
  acc[agent].total++;
  acc[agent].ratings.push(parseInt(row['How Did We Do?']));
  return acc;
}, {});
```

## Testing Multi-Source Sync

### 1. Prepare Test Sources
- Get CSV URLs for 2-3 historical sheets
- Verify each publishes correctly
- Note any column differences

### 2. Update Settings UI
- Add input fields for historical URLs
- Add enable/disable toggles
- Add "Test Connection" buttons

### 3. Test Sync
```bash
# Trigger sync with multiple sources
curl -X POST http://localhost:3001/api/sync-sheets-bg \
  -H "Content-Type: application/json" \
  -d '{
    "sources": [
      {
        "id": "primary",
        "type": "sheets-api",
        "enabled": true
      },
      {
        "id": "hist-2024",
        "type": "csv-url",
        "url": "https://docs.google.com/.../pub?output=csv",
        "enabled": true
      }
    ]
  }'
```

### 4. Verify Output
- Check `cached-sheets-parsed.json` has all rows
- Confirm Agent field normalized across sources
- Test dashboard displays merged data correctly

## Next Steps

1. **Provide Historical URLs**
   - Share 2-3 historical CSV URLs
   - Note approximate row counts
   - Identify column differences

2. **Update Settings Page**
   - Add multi-source configuration UI
   - Save source list to localStorage
   - Pass sources to sync API

3. **Enhance Sync API**
   - Accept source list
   - Download each sequentially
   - Merge and save combined output

4. **Update Dashboard**
   - Load from parsed JSON
   - Handle agent name variations
   - Display source attribution if needed

## Column Mapping Reference

### Current Source Columns
- Name
- Would You Recommend Us?
- Please provide your feedback below.
- Would you like a response?
- What is your email?
- What is your number?
- Review no.
- How Did We Do?
- Entry Date
- **Source Url** (contains agent parameter)
- User Agent
- User IP
- Agent - User Agent - IP
- Year
- Month

### Common Historical Variations
- May have different rating scales
- Agent might be in URL or separate column
- Date formats may vary
- Additional or missing metadata fields

Parser handles these automatically by:
- Reading headers dynamically
- Normalizing Agent field
- Preserving all other columns as-is
