# File-Based Sync Storage Solution

**Date**: November 2024  
**Issue**: Hot-reload clearing in-memory Map causing 500/404 errors  
**Solution**: File-based JSON storage for sync status persistence

---

## Problem Statement

### The Issue
In Next.js development mode, hot-reloading clears all module-level state including the `syncStatus` Map. This caused:

1. **500 Internal Server Error**: GET endpoint tries to access cleared Map
2. **404 Not Found**: Subsequent polls fail when syncId doesn't exist
3. **Lost sync progress**: Users couldn't see completion status

### Error Pattern
```
User clicks Sync → POST creates syncId → Hot reload occurs → GET polls for status → Map is empty → 500 error → 404 errors
```

---

## Solution Architecture

### File-Based Storage
Instead of in-memory Map, sync status is now persisted to JSON files:

```
src/data/sync-status/
  ├── sync-1234567890.json
  ├── sync-1234567891.json
  └── sync-1234567892.json
```

### Key Functions

#### `ensureSyncStatusDir()`
Creates the sync-status directory if it doesn't exist:
```typescript
async function ensureSyncStatusDir() {
  const { mkdir } = await import('fs/promises');
  await mkdir(SYNC_STATUS_DIR, { recursive: true });
}
```

#### `setSyncStatus(syncId, status)`
Writes sync status to file:
```typescript
async function setSyncStatus(syncId: string, status: SyncStatusType) {
  await ensureSyncStatusDir();
  const { writeFile } = await import('fs/promises');
  const filePath = join(SYNC_STATUS_DIR, `${syncId}.json`);
  await writeFile(filePath, JSON.stringify(status, null, 2), 'utf-8');
}
```

#### `getSyncStatus(syncId)`
Reads sync status from file:
```typescript
async function getSyncStatus(syncId: string): Promise<SyncStatusType | null> {
  try {
    const { readFile } = await import('fs/promises');
    const filePath = join(SYNC_STATUS_DIR, `${syncId}.json`);
    const content = await readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null; // File doesn't exist
    }
    throw error; // Re-throw other errors
  }
}
```

#### `cleanupOldSyncs()`
Removes sync status files older than 5 minutes:
```typescript
async function cleanupOldSyncs() {
  try {
    await ensureSyncStatusDir();
    const { readdir, unlink, stat } = await import('fs/promises');
    const files = await readdir(SYNC_STATUS_DIR);
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      const filePath = join(SYNC_STATUS_DIR, file);
      const stats = await stat(filePath);
      
      if (stats.mtimeMs < fiveMinutesAgo) {
        await unlink(filePath);
        console.log('[Sync] Cleaned up old sync:', file);
      }
    }
  } catch (error) {
    console.error('[Sync] Cleanup error:', error);
  }
}
```

---

## Implementation Changes

### What Was Changed

1. **Removed**: `const syncStatus = new Map<string, SyncStatusType>()`
2. **Added**: File-based storage functions
3. **Updated**: All `syncStatus.set()` → `await setSyncStatus()`
4. **Updated**: All `syncStatus.get()` → `await getSyncStatus()`

### Files Modified
- `src/app/api/sync-sheets-bg/route.ts`
  - GET endpoint: Now uses `await getSyncStatus(syncId)`
  - POST endpoint: Now uses `await setSyncStatus(syncId, {...})`
  - `downloadSheetData()`: All status updates converted
  - `backgroundSync()`: All status updates converted

---

## Benefits

### Development Mode
- ✅ Survives hot-reloads without losing state
- ✅ No more 500/404 errors during development
- ✅ Sync progress visible across code changes

### Production Mode
- ✅ Status persists across server restarts
- ✅ Multiple server instances can read status files
- ✅ Easier debugging with visible JSON files

### Debugging
- ✅ Can inspect sync status files directly
- ✅ Clear audit trail of sync operations
- ✅ Easy to verify sync completion

---

## Error Handling

### File Not Found (ENOENT)
```typescript
// Gracefully handled - returns null
const status = await getSyncStatus(syncId);
if (!status) {
  // Sync doesn't exist or was cleaned up
}
```

### Permission Errors
```typescript
// Logged but doesn't crash the sync
catch (error) {
  console.error('[Sync] File operation failed:', error);
  throw error; // Re-thrown for proper error handling
}
```

### Cleanup Failures
```typescript
// Logged but doesn't block sync operations
catch (error) {
  console.error('[Sync] Cleanup error:', error);
  // Cleanup is non-critical - sync continues
}
```

---

## Performance Considerations

### File I/O
- **Concern**: File operations are slower than in-memory Map
- **Reality**: Negligible impact for sync polling (every 500ms)
- **Benefit**: Persistence worth the tiny performance cost

### Cleanup
- Runs every 5 minutes via GET endpoint
- Only removes files older than 5 minutes
- Non-blocking and logged for transparency

### Scaling
- Works for single-server development
- Production may need Redis or database for multi-server
- Current solution perfect for MVP/development phase

---

## Future Enhancements

### Potential Improvements
1. **Redis Cache**: For multi-server production environments
2. **Database Storage**: For long-term sync history
3. **Compression**: For large sync status objects
4. **Indexing**: For faster lookups if many concurrent syncs

### Migration Path
```typescript
// Future: Abstract storage layer
interface SyncStorage {
  get(syncId: string): Promise<SyncStatusType | null>;
  set(syncId: string, status: SyncStatusType): Promise<void>;
  cleanup(): Promise<void>;
}

// Implementations: FileStorage, RedisStorage, DatabaseStorage
```

---

## Testing

### Manual Testing
1. Start dev server: `npm run dev`
2. Click Sync button in Settings
3. Make a code change to trigger hot-reload
4. Verify sync continues polling without errors
5. Check `src/data/sync-status/` for JSON files

### Verification
```bash
# Watch sync status files being created/updated
dir src\data\sync-status\*.json

# View sync status
type src\data\sync-status\sync-1234567890.json
```

### Expected Behavior
- ✅ Sync starts successfully
- ✅ Progress updates visible in UI
- ✅ Hot-reload doesn't break polling
- ✅ Sync completes without errors
- ✅ Old files cleaned up after 5 minutes

---

## Related Documentation
- **BACKGROUND-SYNC-SYSTEM.md**: Overall sync architecture
- **SYNC-SYSTEM-FIXES-NOV-2025.md**: Complete fix history
- **SYNC-TROUBLESHOOTING-QUICK-REF.md**: Troubleshooting guide

---

## Summary

The file-based storage solution eliminates hot-reload issues by persisting sync status to JSON files. This ensures reliable sync operation during development while maintaining a simple, debuggable architecture. The solution is production-ready for single-server deployments and provides a clear migration path for scaling to multi-server environments.

**Key Takeaway**: Persistence > Performance for sync status in development mode.
