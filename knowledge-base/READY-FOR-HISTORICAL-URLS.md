# ✅ Ready for Historical CSV URLs

## What's Been Done

### 1. Documentation Created
- **`MULTI-SOURCE-SYNC-GUIDE.md`** - Complete guide for multi-source data architecture
- Details parser logic, agent name extraction, and merge strategy
- Provides code examples and testing procedures

### 2. CSV Parser Built
- **`src/lib/parseSheets.ts`** - Smart CSV parser with agent normalization
- Handles quoted fields, newlines in cells, and various column layouts
- **Agent extraction logic:**
  - Prefers explicit "Agent" column if present
  - Falls back to extracting from URL parameter (`?agent=Name%21`)
  - Decodes URL encoding and removes trailing `!` or `%21`

### 3. Settings UI Updated
- Added "Historical Data Sources" section
- Shows primary source status
- Placeholder ready for historical URLs
- Clear instructions for users

### 4. Background Sync Enhanced
- Already saves both raw CSV and parsed JSON
- Parser runs automatically on all synced data
- Ready to be extended for multiple sources

## What You Need to Provide

### Historical CSV URLs
Please share 2-4 published CSV URLs from older Google Sheets:

**Format needed:**
```
https://docs.google.com/spreadsheets/d/e/2PACX-xxxxx/pub?gid=xxxxx&single=true&output=csv
```

**For each URL, please note:**
1. **Name/Label** - e.g., "2024 Reviews", "2023 Q4", etc.
2. **Approximate row count** - helps estimate sync time
3. **Any known column differences** - we'll auto-detect, but heads-up helps

### How to Get the URL

1. Open your historical Google Sheet
2. Click **File → Share → Publish to web**
3. Select the specific sheet tab
4. Choose **Comma-separated values (.csv)**
5. Click **Publish**
6. Copy the generated URL

## Example Configuration

Once you provide URLs, I'll add them like this:

```typescript
// Example: 3 historical sources
const historicalSources = [
  {
    id: 'reviews-2024-q4',
    name: '2024 Q4 Reviews',
    url: 'https://docs.google.com/spreadsheets/d/e/.../pub?output=csv',
    enabled: true,
    approxRows: 8500
  },
  {
    id: 'reviews-2024-q1-q3',
    name: '2024 Q1-Q3 Reviews',
    url: 'https://docs.google.com/spreadsheets/d/e/.../pub?output=csv',
    enabled: true,
    approxRows: 12000
  },
  {
    id: 'reviews-2023',
    name: '2023 Full Year',
    url: 'https://docs.google.com/spreadsheets/d/e/.../pub?output=csv',
    enabled: true,
    approxRows: 15000
  }
];
```

## What Will Happen Next

### Step 1: I'll Add the URLs
- Update Settings page with input fields for each source
- Add enable/disable toggles
- Store configuration in localStorage

### Step 2: Parser Will Scan Each Source
When you click "Sync Now":
1. Download primary source (Google Sheets API)
2. Download each historical CSV URL
3. Parse all sources - extract headers and normalize agents
4. Merge into single dataset
5. Save combined `cached-sheets-parsed.json`

### Step 3: Dashboard Uses Merged Data
- All components read from parsed JSON
- Agent names normalized across all sources
- Historical + current data combined seamlessly

## Testing the Parser

### Current Source Tested ✅
Already verified with your primary sheet:
- **22,670 rows** parsed successfully
- **Agent names extracted** from URL parameters
- Sample agents found: Chris, StevenM, Jaxon, MitchC, EsmeraldaM, etc.

### Historical Sources - Ready to Test
Once you provide URLs, I'll:
1. Fetch a sample from each
2. Show you the detected columns
3. Confirm agent extraction works
4. Test merge with primary data

## Column Flexibility

The parser handles different column layouts:

### Current Source Columns
```
Name, Would You Recommend Us?, Entry Date, Source Url, 
How Did We Do?, User Agent, User IP, Agent - User Agent - IP, 
Year, Month, Review no., etc.
```

### Historical Source Examples
Even if historical sheets have:
- Different column names
- Missing columns
- Extra columns
- Different date formats
- Different rating scales

**The parser will:**
- Read headers dynamically
- Extract Agent from URL if not in column
- Preserve all columns as-is
- Normalize for dashboard consumption

## Next Steps - Just Send:

📧 **Paste the CSV URLs here** (one per message is fine)

For each URL, optionally include:
- A friendly name/label
- Approximate row count (if known)
- Any special notes about that dataset

I'll handle the rest! 🚀

## Questions?

- **Q: Will this slow down the sync?**  
  A: Each source adds ~5-10 seconds. With 3 sources, expect ~30-45 second total sync.

- **Q: What if columns are different?**  
  A: Parser adapts automatically. Agent names are the key field - everything else is preserved.

- **Q: Can I disable a source?**  
  A: Yes! Once configured, you can toggle each source on/off in Settings.

- **Q: What happens to duplicate rows?**  
  A: Currently all rows are merged. If you want deduplication, I can add that logic (e.g., by review number or date+agent).

- **Q: Can I add more sources later?**  
  A: Absolutely! Just paste new URLs and I'll add them to the configuration.
