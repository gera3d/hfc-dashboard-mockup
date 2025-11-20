# Sync System Quick Troubleshooting Guide

**For rapid diagnosis of common sync issues**

## 🚨 Common Symptoms & Solutions

### ❌ "Sync already in progress"
**Symptom:** Console message when clicking Sync Now  
**Cause:** Sync lock is active  
**Solution:** Wait for current sync to complete (~30-60 seconds)  
**Prevention:** Button should be disabled during sync

### ❌ "Sync cooldown active - please wait X seconds"
**Symptom:** Console message when clicking Sync Now rapidly  
**Cause:** 3-second cooldown between sync attempts  
**Solution:** Wait the indicated number of seconds  
**Prevention:** Don't spam-click the sync button

### ❌ 500 Internal Server Error
**Symptom:** Error in browser console when polling  
**Likely Causes:**
1. GET endpoint crashed
2. Google Sheets credentials missing/invalid
3. Network error

**How to diagnose:**
1. Check server terminal for error details
2. Look for `[Sync API GET] Unexpected error:` message
3. Verify `google-sheets-credentials.json` exists
4. Check file permissions

**Solutions:**
```bash
# Verify credentials file exists
ls google-sheets-credentials.json

# Check file content is valid JSON
Get-Content google-sheets-credentials.json | ConvertFrom-Json
```

### ❌ 404 Not Found
**Symptom:** Error when polling for sync status  
**Likely Causes:**
1. Next.js hot-reload cleared the status Map (dev only)
2. Sync ID was cleaned up prematurely
3. Wrong sync ID being polled

**How to diagnose:**
Check server logs for:
```
[Sync API GET] Status not found for syncId: sync-XXXXX
[Sync API GET] Available syncIds: [...]
```

**Solutions:**
- **Development:** Restart dev server if frequent
- **Production:** Shouldn't happen - file a bug report
- **Workaround:** Sync will complete successfully, polling just can't find status

### ❌ Sync appears stuck at X%
**Symptom:** Progress bar stops updating  
**Likely Causes:**
1. Large dataset (>10k rows)
2. Network timeout
3. Server crashed

**How to diagnose:**
1. Check network tab for failed requests
2. Look for timeout errors in console
3. Check server terminal is still running

**Solutions:**
```bash
# Check if node processes are running
Get-Process node

# If stuck, restart dev server
npm run dev
```

### ❌ "Credentials file not found"
**Symptom:** Sync fails immediately with error message  
**Cause:** `google-sheets-credentials.json` missing  
**Solution:**
1. Download credentials from Google Cloud Console
2. Place in project root (same level as `package.json`)
3. Verify filename is exactly `google-sheets-credentials.json`
4. Try sync again

### ❌ "Invalid credentials file"
**Symptom:** Sync fails with credentials error  
**Cause:** Credentials JSON is malformed or incomplete  
**Solution:**
```bash
# Validate JSON structure
Get-Content google-sheets-credentials.json | ConvertFrom-Json

# Should have these fields:
# - client_email
# - private_key
# - project_id
```

## 🔍 Quick Diagnosis Checklist

When sync fails, check in this order:

1. **Browser Console**
   - [ ] Any red error messages?
   - [ ] "Sync already in progress"?
   - [ ] "Cooldown active"?
   - [ ] 500 or 404 errors?

2. **Server Terminal**
   - [ ] Server still running?
   - [ ] Any error messages?
   - [ ] `[Sync]` log messages present?
   - [ ] Last log message status?

3. **Network Tab**
   - [ ] POST to `/api/sync-sheets-bg` succeeded?
   - [ ] GET requests polling successfully?
   - [ ] Any failed requests?

4. **File System**
   - [ ] `google-sheets-credentials.json` exists?
   - [ ] File is valid JSON?
   - [ ] Has `client_email` and `private_key`?

5. **Environment**
   - [ ] `GOOGLE_SHEET_ID` set in `.env.local`?
   - [ ] Correct Google Sheet ID?
   - [ ] Service account has access to sheet?

## 📊 Expected Behavior

### Normal Sync Flow

1. **Click "Sync Now"**
   - Button becomes disabled
   - Progress bar appears
   - Status: "Starting..."

2. **Downloading (0-50%)**
   - "Connecting..."
   - "Downloading from Google Sheets API..."
   - "Fetching data..."

3. **Processing (50-90%)**
   - "Processing X rows..."
   - Parse CSV data
   - Validate records

4. **Saving (90-100%)**
   - "Saving..."
   - Write to cache files
   - Update metadata

5. **Complete (100%)**
   - "Complete!"
   - Shows stats (X rows synced)
   - Data refreshes automatically
   - Button re-enables

### Server Logs (Normal)

```
[Sync API POST] Creating new sync: sync-1763158449286
[Sync API POST] Initial status set successfully
🔄 [SYNC START] sync-1763158449286
[Sync] Loading credentials from: /path/to/google-sheets-credentials.json
[Sync] Credentials loaded for: service-account@project.iam.gserviceaccount.com
[Sync] ✓ API returned 1234 rows
[Sync] ✓ Converted to CSV: 524288 bytes
[Sync] 🆕 Found 10 new rows!
[Sync] Parsing CSV...
[Sync] Parsed 1234 rows
[Sync] Saved parsed data to /path/to/cached-sheets-parsed.json
✅ [SYNC COMPLETE] 1234 reviews synced
```

## 🛠️ Emergency Commands

### Restart Everything
```bash
# Kill all Node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Restart dev server
npm run dev
```

### Clear Sync Cache
```bash
# Remove cached data (will force full re-sync)
Remove-Item src/data/cached-sheets-data.json -ErrorAction SilentlyContinue
Remove-Item src/data/cached-sheets-parsed.json -ErrorAction SilentlyContinue
Remove-Item src/data/sync-status/*.json -ErrorAction SilentlyContinue
```

### View Recent Logs
```bash
# In PowerShell, check terminal scrollback
# Or redirect to file:
npm run dev > dev-log.txt 2>&1
```

## 📞 Getting Help

### Information to Provide

When reporting sync issues, include:

1. **Error Message**
   - Exact text from browser console
   - Exact text from server terminal

2. **Timing**
   - When did it fail? (which percentage?)
   - How long did it run before failing?

3. **Environment**
   - Development or production?
   - Windows/Mac/Linux?
   - Node version: `node --version`

4. **Logs**
   - Last 20 lines from server terminal
   - Browser console screenshot
   - Network tab screenshot (if relevant)

5. **Reproducibility**
   - Does it happen every time?
   - Only on first sync?
   - Only after X successful syncs?

### Debug Mode

Enable verbose logging:

```typescript
// In SyncContext.tsx, add console.logs:
console.log('[DEBUG] Sync status:', syncStatus);
console.log('[DEBUG] Sync lock:', syncLockRef.current);
console.log('[DEBUG] Last attempt:', lastSyncAttemptRef.current);
```

## 🎯 Performance Benchmarks

Expected timing for various dataset sizes:

| Rows | Download | Parse | Total | Notes |
|------|----------|-------|-------|-------|
| 100 | 2-5s | <1s | 3-6s | Small dataset |
| 1,000 | 5-10s | 1-2s | 7-12s | Medium dataset |
| 10,000 | 15-30s | 3-5s | 20-35s | Large dataset |
| 50,000 | 45-90s | 10-15s | 60-105s | Very large (near timeout) |

If your sync is slower than these benchmarks:
- Check internet connection speed
- Verify Google Sheets API quota
- Consider network latency
- Check server resources (CPU/RAM)

---

**Last Updated:** November 14, 2025  
**Version:** 1.0  
**For:** HFC Dashboard Background Sync System
