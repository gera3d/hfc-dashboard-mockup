# Google Sheets Sync - Timeout Error Fix

## 🔴 Problem: 524 Timeout Error

**Error Message:**
```
Failed to load resource: the server responded with a status of 524
[Google Sheets] Sync error: Error: Sync failed
```

## ✅ Solutions Implemented

### 1. **Reduced Timeout Duration**
- **Changed:** 90 seconds → 30 seconds
- **Why:** Prevents hitting gateway/proxy timeouts
- **Benefit:** Faster failure with retry capability

### 2. **Increased Retry Attempts**
- **Changed:** 2 retries → 3 retries  
- **Why:** More chances to succeed during temporary slowdowns
- **Retry delays:** 1s, 2s, 3s (progressive)

### 3. **Better Error Handling**
- **Client-side:** More helpful error messages
- **Timeout detection:** Specific messaging for timeout scenarios
- **User guidance:** Suggests alternatives (use cached data)

### 4. **Route Configuration**
- **Added:** `maxDuration = 60` for API route
- **Why:** Ensures platform allows enough time for retries

## 🛠️ How to Use

### Option 1: Use Cached Data (Recommended)
Instead of syncing, use the **Refresh** button in Settings:
- ✅ Instant loading
- ✅ Uses locally cached data
- ✅ Updated whenever you successfully sync

### Option 2: Sync with Retry
If you need fresh data:
1. Click **Sync from Google Sheets**
2. Wait for automatic retries (up to 3 attempts)
3. If timeout occurs, wait 2-3 minutes and try again

### Option 3: Manual CSV Download
If sync continues to fail:
1. Visit your Google Sheet
2. File → Download → CSV
3. Place in `public/sample-reviews.csv`
4. The app will use this file

## 🐛 Why Does This Happen?

### Common Causes:
1. **Large Spreadsheet:** Many rows take time to export
2. **Google Sheets Load:** Google's servers are busy
3. **Network Issues:** Slow connection or proxy
4. **Docker Networking:** Additional network layer latency

### Docker-Specific Issues:
- Container networking adds latency
- May need to adjust network settings
- Consider increasing container resources

## 📊 Timeline Expectations

| Action | Expected Time |
|--------|--------------|
| Cached Data Load | < 1 second |
| Google Sheets Sync | 10-30 seconds |
| With Retries | 30-90 seconds |
| Timeout Threshold | 30 seconds per attempt |

## 🔧 Advanced Solutions

### Increase Docker Memory (if needed)
```yaml
# docker-compose.yml
services:
  hfc-dashboard:
    # ... existing config ...
    deploy:
      resources:
        limits:
          memory: 1G
```

### Check Network from Container
```powershell
# Test connectivity from inside container
docker exec hfc-dashboard wget -O - "https://docs.google.com/spreadsheets/..." --timeout=30
```

### Alternative: Use Environment Variable for CSV URL
If Google's CDN is problematic, you could host the CSV elsewhere:

```env
# .env.local
NEXT_PUBLIC_GOOGLE_SHEETS_CSV_URL=https://your-cdn.com/data.csv
```

## 📝 Best Practices

### For Development (Local):
- ✅ Use **Refresh** (loads from cache)
- ✅ Sync once daily or when needed
- ✅ Keep a backup CSV in `public/`

### For Production (Docker):
- ✅ Pre-sync data before building
- ✅ Include cached data in Docker image
- ✅ Set up scheduled sync (cron job)
- ✅ Monitor sync success rates

## 🚀 Recommended Workflow

1. **Initial Setup:**
   - Sync once to get initial data
   - Data is cached automatically

2. **Daily Use:**
   - Use Refresh button (instant)
   - Sync when you need latest updates

3. **If Sync Fails:**
   - Don't panic - cached data still works
   - Try again in 5-10 minutes
   - Check Google Sheets accessibility

## 🔍 Debugging

### Check Sync Status:
```javascript
// In browser console
fetch('/api/sync-sheets', { method: 'POST' })
  .then(r => r.json())
  .then(console.log)
```

### View Cached Data Age:
- Settings page shows "Last Sync Time"
- Cached data location: `src/data/cached-sheets-data.json`

### Container Logs:
```powershell
docker logs hfc-dashboard --tail 50
```

Look for:
```
[Sync] Attempt 1/3 - Downloading from Google Sheets...
[Sync] Attempt 1 succeeded in 15432ms
```

## ✅ Changes Made

### Files Updated:
1. `src/app/api/sync-sheets/route.ts`
   - Reduced timeout: 90s → 30s
   - Increased retries: 2 → 3
   - Added `maxDuration` export
   - Better error messages
   - Faster retry delays

2. `src/app/settings/page.tsx`
   - Enhanced error handling
   - User-friendly timeout messages
   - Suggests alternatives

## 💡 Tips

- **Morning syncs work better:** Less Google traffic
- **Keep cache fresh:** Sync when you remember
- **Backup CSV:** Download CSV monthly as backup
- **Monitor size:** Large sheets (>10k rows) may timeout

---

**Updated:** October 29, 2025
**Status:** ✅ Timeout handling improved
**Action Required:** None - changes are automatic
