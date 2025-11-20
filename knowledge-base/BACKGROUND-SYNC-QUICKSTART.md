# Background Sync - Quick Start Guide

## 🎯 What Changed?

Your Google Sheets sync now runs **in the background** with **real-time progress tracking**. No more waiting, no more timeouts!

## ✨ New Features

### 1. **Background Syncing**
- Sync happens in the background - you can keep working
- No more freezing or blocking the UI
- Extended timeout: 90 seconds (was 30s)

### 2. **Progress Tracking**
Watch your sync progress in real-time:
- **0-50%** → Downloading from Google Sheets
- **50-80%** → Processing data
- **80-100%** → Saving to cache
- **100%** → Complete! ✅

### 3. **Visible Everywhere**
- **Settings Page**: Full progress bar with details
- **Dashboard**: Small floating badge in top-right corner
- Both update in real-time!

### 4. **Auto-Refresh**
When sync completes, the dashboard automatically reloads with new data. No manual refresh needed!

## 📍 Where to See It

### Settings Page (`/settings`)
Click **"Sync Now"** and you'll see:
- Large progress indicator
- Status messages
- Progress bar (0-100%)
- Stats when complete (file size, record count)
- Success/error messages

### Dashboard Page (`/`)
Look in the **top-right corner** for:
- Small badge showing progress
- Changes color based on status
- Shows percentage during sync
- ✅ "Synced" when complete

## 🚀 How to Use

1. **Start Sync** (from Settings page)
   - Click "Sync from Google Sheets" button
   - Progress bar appears immediately
   - You can navigate away if needed

2. **Monitor Progress**
   - Watch the progress bar fill up
   - Status messages update in real-time
   - See current phase (downloading/processing/saving)

3. **Automatic Completion**
   - Dashboard auto-refreshes when done
   - Success message shows stats
   - Click "Done" to dismiss

## 💡 Benefits

### Before
❌ Had to wait 30+ seconds  
❌ Timeout errors on large files  
❌ No progress feedback  
❌ UI froze during sync  
❌ Manual refresh needed  

### Now
✅ Continue working during sync  
✅ 90-second timeout (5 min max)  
✅ Real-time progress updates  
✅ UI stays responsive  
✅ Auto-refresh on completion  

## 🎨 Visual Indicators

### During Sync
- **Blue** → Downloading
- **Purple** → Processing
- **Orange** → Saving

### After Sync
- **Green** → Success! ✅
- **Red** → Error ❌

## 🔧 Technical Details

- **API**: `/api/sync-sheets-bg`
- **Polling**: Updates every 1 second
- **Timeout**: 90 seconds fetch, 5 minutes max
- **Storage**: In-memory (clears after 60s)

## 📊 What You'll See

### Settings Page
```
┌────────────────────────────────────┐
│  🔄  Syncing Data...               │
│  Downloading data from Google...   │
│                                    │
│  Progress                    45%   │
│  ████████████░░░░░░░░░░░░░░       │
└────────────────────────────────────┘
```

### Dashboard Badge
```
┌──────────┐
│ 🔄 45%   │  ← Top-right corner
└──────────┘
```

## 🎓 Tips

1. **Large Files**: No problem! Extended timeout handles them.
2. **Navigate Away**: Feel free to browse other pages while syncing.
3. **Check Dashboard**: Badge shows status from anywhere.
4. **Auto-Update**: Dashboard reloads automatically when complete.
5. **Old Sync**: The old "Sync Now" button still works but blocks UI.

## 🐛 Troubleshooting

**Sync not starting?**
- Check your internet connection
- Verify Google Sheets URL is accessible

**Taking too long?**
- Normal for large files (1000+ rows)
- Watch progress - as long as it's moving, it's working

**Error occurred?**
- Error message shows what went wrong
- Try again in a few moments
- Your cached data is still available

---

**Version:** 1.0  
**Status:** ✅ Live  
**Date:** November 11, 2025
