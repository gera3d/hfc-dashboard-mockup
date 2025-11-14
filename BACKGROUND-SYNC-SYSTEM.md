# Background Sync System - Implementation Guide

## 🎯 Overview

The new background sync system allows Google Sheets data synchronization to happen in the background without blocking the UI. Users can continue working while data loads, with real-time progress updates visible on both the Settings and Dashboard pages.

## ✨ Key Features

### 1. **Non-Blocking Background Sync**
- Sync runs asynchronously without freezing the UI
- Users can navigate between pages while sync is in progress
- No more timeout errors or waiting on loading screens

### 2. **Real-Time Progress Tracking**
- Live progress bar showing completion percentage (0-100%)
- Status updates through each phase:
  - **Downloading** (0-60%): Fetching data from Google Sheets
  - **Processing** (60-80%): Parsing and validating CSV data
  - **Saving** (80-100%): Writing to local cache
  - **Complete**: Successfully synced
  - **Error**: Failed with error details

### 3. **Global Sync State**
- Single source of truth for sync status across all pages
- Start sync from Settings, see progress on Dashboard
- Prevents multiple simultaneous syncs

### 4. **Automatic Data Refresh**
- Dashboard automatically reloads when sync completes
- No manual refresh needed after sync
- Seamless data updates

### 5. **Enhanced Timeout Handling**
- Extended timeout from 30s to 90s for large datasets
- Maximum route duration: 5 minutes
- Better error messages with actionable suggestions

## 🏗️ Architecture

### Components

```
┌─────────────────────────────────────────────────────────┐
│                    SyncProvider                          │
│  (Global context - manages sync state across app)        │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Settings    │  │  Dashboard   │  │   Any Page   │
│    Page      │  │    Page      │  │              │
├──────────────┤  ├──────────────┤  ├──────────────┤
│ • Full UI    │  │ • Badge      │  │ • Access via │
│ • Progress   │  │ • Auto-      │  │   useSyncP-  │
│   bar        │  │   refresh    │  │   rogress()  │
└──────────────┘  └──────────────┘  └──────────────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          ▼
            ┌──────────────────────────┐
            │  /api/sync-sheets-bg     │
            │  (Background API)        │
            └──────────────────────────┘
                          │
                          ▼
            ┌──────────────────────────┐
            │    Google Sheets API     │
            └──────────────────────────┘
```

### File Structure

```
src/
├── app/
│   ├── api/
│   │   └── sync-sheets-bg/
│   │       └── route.ts          # Background sync API
│   ├── layout.tsx                # Added SyncProvider wrapper
│   ├── page.tsx                  # Dashboard with sync badge
│   └── settings/
│       └── page.tsx              # Settings with full sync UI
├── components/
│   └── SyncProgressIndicator.tsx # UI components for sync
└── context/
    └── SyncContext.tsx           # Global sync state management
```

## 📡 API Endpoints

### POST `/api/sync-sheets-bg`

Starts a background sync operation.

**Request:**
```typescript
POST /api/sync-sheets-bg
```

**Response:**
```json
{
  "success": true,
  "syncId": "sync-1234567890",
  "message": "Background sync started"
}
```

### GET `/api/sync-sheets-bg?syncId=<id>`

Get current status of a sync operation.

**Request:**
```typescript
GET /api/sync-sheets-bg?syncId=sync-1234567890
```

**Response:**
```json
{
  "status": "downloading",
  "progress": 45,
  "message": "Downloading data from Google Sheets...",
  "lastUpdated": "2025-11-11T10:30:00.000Z",
  "stats": {
    "size": 524288,
    "lines": 1523
  }
}
```

**Status Values:**
- `idle` - Sync initialized
- `downloading` - Fetching from Google Sheets
- `processing` - Parsing CSV data
- `saving` - Writing to cache
- `complete` - Successfully finished
- `error` - Failed (includes error message)

## 🎨 UI Components

### SyncProgressIndicator (Full Version)

Used on Settings page for detailed progress display.

```tsx
import { SyncProgressIndicator } from '@/components/SyncProgressIndicator';

<SyncProgressIndicator 
  variant="full"
  onSyncComplete={(success) => {
    if (success) {
      // Handle successful sync
    }
  }}
/>
```

**Features:**
- Large progress bar with percentage
- Status icons that change with phase
- Success/error messages
- Stats display (file size, record count)
- Dismiss button when complete

### SyncProgressBadge (Compact Version)

Used on Dashboard page for minimal status display.

```tsx
import { SyncProgressBadge } from '@/components/SyncProgressIndicator';

<SyncProgressBadge />
```

**Features:**
- Small floating badge
- Progress percentage during sync
- Success/error indicator when complete
- Auto-hides when idle

## 🔧 Usage

### Starting a Sync

```tsx
import { useSyncProgress } from '@/context/SyncContext';

function MyComponent() {
  const { startSync, syncStatus } = useSyncProgress();
  
  const handleSyncClick = async () => {
    await startSync();
  };
  
  return (
    <button 
      onClick={handleSyncClick}
      disabled={syncStatus.isActive}
    >
      {syncStatus.isActive ? 'Syncing...' : 'Sync Now'}
    </button>
  );
}
```

### Monitoring Progress

```tsx
import { useSyncProgress } from '@/context/SyncContext';

function MyComponent() {
  const { syncStatus } = useSyncProgress();
  
  return (
    <div>
      <p>Status: {syncStatus.status}</p>
      <p>Progress: {syncStatus.progress}%</p>
      <p>Message: {syncStatus.message}</p>
      
      {syncStatus.error && (
        <p className="text-red-600">Error: {syncStatus.error}</p>
      )}
    </div>
  );
}
```

### Auto-Refresh on Completion

```tsx
import { useEffect } from 'react';
import { useSyncProgress } from '@/context/SyncContext';

function MyComponent() {
  const { syncStatus } = useSyncProgress();
  
  useEffect(() => {
    if (syncStatus.status === 'complete') {
      // Reload your data
      loadData();
    }
  }, [syncStatus.status]);
  
  // ... rest of component
}
```

## 🚀 Benefits

### For Users
✅ No more waiting for sync to complete  
✅ Continue working while data loads  
✅ Visual feedback on progress  
✅ No timeout errors on large datasets  
✅ Automatic data refresh when sync completes  

### For Developers
✅ Clean separation of concerns  
✅ Reusable components  
✅ Easy to add sync to new pages  
✅ Better error handling  
✅ Polling architecture is scalable  

## ⚙️ Configuration

### Timeout Settings

In `/api/sync-sheets-bg/route.ts`:

```typescript
const FETCH_TIMEOUT = 90000; // 90 seconds
export const maxDuration = 300; // 5 minutes route timeout
```

### Polling Interval

In `SyncContext.tsx`:

```typescript
pollIntervalRef.current = setInterval(() => {
  pollStatus(newSyncId);
}, 1000); // Poll every 1 second
```

## 🔒 Error Handling

### Race Condition Prevention
- **Sync Lock**: Prevents multiple concurrent syncs using a ref-based lock
- **Cooldown Period**: 3-second cooldown between sync attempts
- **State Validation**: Double-checks both lock and active state before starting

### Timeout Errors
- Automatically handled with extended timeout (120 seconds)
- Clear error messages
- Cached data remains available

### Network Errors
- Retry logic in fetch
- User-friendly error messages
- Graceful degradation

### Server Errors
- Detailed error reporting with full logging
- Status preserved for debugging
- Easy retry from UI
- Comprehensive error tracking in both client and server

### Hot Reload Protection
- Enhanced logging to detect module reloading issues
- Status verification after creation
- Graceful handling of missing sync IDs

## 📊 Performance

- **Memory**: Sync status stored in-memory (Map) with file-based backup option
- **Cleanup**: Auto-cleanup after 5 minutes for completed syncs
- **Network**: 1 request per second during active sync
- **Scalability**: Can handle concurrent syncs with unique IDs
- **Race Condition Prevention**: Ref-based lock prevents duplicate sync requests
- **Click Protection**: 3-second cooldown prevents accidental rapid clicks

## 🔮 Future Enhancements

Potential improvements:
- [ ] WebSocket for real-time updates (eliminate polling)
- [ ] Progress chunking for very large files
- [ ] Sync history/logs
- [ ] Scheduled automatic syncs
- [ ] Push notifications when sync completes
- [ ] Sync queue for multiple sources
- [ ] Rate limiting and throttling

## 📝 Migration Notes

### Old System
- Blocking synchronous sync
- 30-second timeout
- No progress feedback
- Manual refresh required

### New System
- Non-blocking background sync
- 90-second timeout (5 min max)
- Real-time progress tracking
- Automatic data refresh

### Backward Compatibility
- Old `/api/sync-sheets` endpoint still works
- Can be removed once confirmed stable
- All old functionality preserved

## 🎓 Example Use Cases

### 1. Settings Page
User initiates sync, sees full progress bar, data updates when complete.

### 2. Dashboard Page
Shows small badge during sync, auto-refreshes when complete.

### 3. Agent Page
Can monitor sync status, auto-refresh when new data available.

### 4. Any Custom Page
Import `useSyncProgress()` hook and access sync state.

## 🐛 Troubleshooting

**Sync Not Starting**
- Check console for API errors
- Verify SyncProvider is wrapping app
- Ensure no other sync is running
- Check for cooldown message (3-second wait between attempts)
- Verify sync lock is not stuck (should auto-release on error)

**Progress Not Updating**
- Check network tab for polling requests
- Verify syncId is correct
- Check for errors in console
- Look for 500/404 errors indicating module reload issues
- Check server terminal for detailed sync logs

**Data Not Refreshing**
- Verify onSyncComplete callback
- Check data loading logic
- Ensure useEffect dependencies correct

**Timeout Issues**
- Review maxDuration setting (currently 300s)
- Check Google Sheets response time
- Consider chunking for large files
- Review sync timeout (currently 120s)

**500/404 Errors During Polling**
- Usually indicates Next.js hot-reload cleared the status Map
- Check server logs for "Sync not found" or "Available syncIds" messages
- Verify credentials file exists and is valid
- Check for file system errors when writing status

**Duplicate Sync Requests**
- Sync lock should prevent this automatically
- Check browser console for "Sync already in progress" messages
- Verify cooldown is working (3-second minimum between attempts)
- Button should be disabled during active sync

---

**Created:** November 11, 2025  
**Last Updated:** November 14, 2025  
**Version:** 1.1  
**Status:** ✅ Production Ready

## 🔄 Recent Updates (v1.1 - Nov 14, 2025)

### Bug Fixes
- ✅ **Fixed race condition**: Added sync lock to prevent duplicate concurrent syncs
- ✅ **Added cooldown protection**: 3-second minimum between sync attempts
- ✅ **Enhanced error handling**: Better 500/404 error detection and logging
- ✅ **Improved logging**: Comprehensive server-side logs for debugging
- ✅ **Credentials validation**: Added validation for Google Sheets credentials file

### Improvements
- ✅ **Extended cleanup period**: Changed from 60s to 5 minutes
- ✅ **Better state management**: Sync lock releases automatically on error
- ✅ **Enhanced debugging**: Added detailed logging for sync ID tracking
- ✅ **Timeout increase**: Sync timeout increased to 120 seconds

### Known Issues
- ⚠️ **Hot Reload**: In development mode, Next.js hot-reloading can clear the in-memory sync status Map, causing 404 errors. This doesn't affect production builds.
  - **Workaround**: Server logs will show "Sync not found" messages. The sync will complete successfully but polling may fail. File-based status storage is available if needed.
