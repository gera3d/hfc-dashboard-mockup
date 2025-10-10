# localStorage Persistence for Department Assignments

## Problem Solved

**Before**: When you changed agent departments, the changes disappeared when you:
- Refreshed the page
- Clicked "Refresh" or "Sync from Sheets"
- Closed and reopened the browser

**Now**: All your department changes are automatically saved to your browser's localStorage and persist across refreshes! 🎉

## How It Works

### Automatic Saving
Every time you:
- Change an agent's department → **Saved instantly to localStorage**
- Create a new department → **Saved instantly to localStorage**

No action needed on your part!

### Automatic Loading
When you:
- Open the dashboard → **Your changes are restored automatically**
- Refresh the page → **Your changes are still there**
- Click "Refresh" button → **Your changes are preserved**
- Click "Sync from Sheets" → **Your changes are reapplied after sync**

## Visual Indicator

When you have unsaved local changes, you'll see an amber banner below the filters:

```
⚠️ 💾 5 Local Changes Saved
3 agent assignments, 2 custom departments • These survive page refreshes
but need Google Sheets sync for permanence
                                                    [Reset to Sheets]
```

This shows:
- How many agent reassignments you've made
- How many custom departments you've created
- A button to reset everything back to Google Sheets data

## Where Data is Stored

Your changes are stored in **browser localStorage** under these keys:
- `hfc_agent_departments` - Agent department assignments
- `hfc_custom_departments` - Custom departments you created
- `hfc_last_update` - Timestamp of last change

### Important Notes

✅ **Pros:**
- Survives page refreshes and browser restarts
- Fast and instant
- No server required
- Private to your browser

❌ **Cons:**
- Only stored in THIS browser (not synced across devices)
- Doesn't update Google Sheets automatically
- Cleared if you clear browser data
- Not shared with other users

## Making Changes Permanent

Your local changes are great for immediate work, but to make them permanent:

### Option 1: Manual Google Sheets Update (Current)
1. Make your department changes in the dashboard
2. Note which agents you reassigned
3. Open your Google Sheet
4. Update the `department_id` column manually
5. Add any new departments to your departments list
6. Come back to dashboard and click "Sync from Sheets"

### Option 2: Export Changes (Coming Soon)
We're working on an export feature that will give you a list of all your changes to copy into Google Sheets.

### Option 3: Automatic Sync (Future)
Direct Google Sheets API write-back is planned!

## Resetting Changes

If you want to discard your local changes and go back to what's in Google Sheets:

1. Click the **"Reset to Sheets"** button in the amber banner
2. Confirm the reset
3. All local changes are cleared
4. Data reloads from Google Sheets

**Warning**: This cannot be undone! Make sure you've updated Google Sheets first if you want to keep the changes.

## Use Cases

### Scenario 1: Planning Department Reorganization
```
1. Try different agent assignments in the dashboard
2. See how it affects your department metrics
3. When satisfied, update Google Sheets
4. Click "Sync from Sheets" to make it official
```

### Scenario 2: Testing New Departments
```
1. Create a new "Life Insurance" department
2. Assign a few agents to test
3. See how reports look with the new structure
4. If good: Add to Google Sheets
5. If not: Click "Reset to Sheets" and try again
```

### Scenario 3: Daily Operations
```
1. New agent joins → Assign to department in dashboard
2. Changes persist while you work
3. At end of day, update Google Sheet once
4. Done!
```

## Technical Details

### Data Structure

**Agent Department Assignment:**
```json
{
  "agentId": "agent-123",
  "departmentId": "dept-456",
  "timestamp": "2025-10-09T10:30:00.000Z"
}
```

**Custom Department:**
```json
{
  "id": "dept-1728475800000",
  "name": "Life Insurance",
  "createdAt": "2025-10-09T10:30:00.000Z"
}
```

### How Changes Apply

1. **Page Loads** → Fetch data from Google Sheets
2. **Apply Overrides** → Merge localStorage changes with fresh data
3. **Display** → Show combined result
4. **User Makes Change** → Save to localStorage + update UI
5. **Page Refreshes** → Repeat from step 1 (your changes persist!)

### Browser Compatibility

localStorage is supported in:
- ✅ Chrome/Edge (all recent versions)
- ✅ Firefox (all recent versions)
- ✅ Safari (all recent versions)
- ✅ Mobile browsers

### Storage Limits

- localStorage typically has 5-10 MB per domain
- Your department assignments use < 1 KB per change
- You can store thousands of changes with no issues

## Troubleshooting

### "My changes disappeared!"

**Possible causes:**
1. Browser data was cleared (Settings → Clear browsing data)
2. Using a different browser or incognito mode
3. Someone else synced from Google Sheets on a shared account

**Solution**: If you haven't updated Google Sheets yet, the changes are lost. Always update Google Sheets to make changes permanent!

### "I see old changes I don't want"

**Solution**: Click the "Reset to Sheets" button to clear all local changes.

### "Changes work on my laptop but not my phone"

**Expected**: localStorage is per-browser, not synced across devices. You need to update Google Sheets to share changes.

### "I accidentally cleared my changes!"

**Solution**: If you clicked "Reset to Sheets" by accident, you'll need to redo the changes. There's no undo. Always update Google Sheets first to have a backup!

## Best Practices

### ✅ DO:
- Make multiple changes in the dashboard (fast and easy)
- Use the dashboard for planning and testing
- Update Google Sheets in batches (end of day/week)
- Check the amber banner to see pending changes

### ❌ DON'T:
- Rely on localStorage as your only copy (update Google Sheets!)
- Clear browser data without checking for pending changes
- Forget you have local changes when making decisions
- Share a browser with someone else doing the same work

## Summary

**localStorage persistence means**:
- ✅ Your changes survive refreshes
- ✅ You can work without constant Google Sheets updates
- ✅ You can experiment safely
- ✅ Fast, responsive UI

**But remember**:
- ⚠️ Update Google Sheets to make changes permanent
- ⚠️ Changes are browser-specific, not synced
- ⚠️ Watch the amber banner for pending changes

---

**Bottom Line**: You can now confidently make department changes without fear of losing them! Just remember to sync to Google Sheets when you're done. 🎉
