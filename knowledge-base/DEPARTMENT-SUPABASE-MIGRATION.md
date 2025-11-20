# Department Management Migration to Supabase

## Overview

This guide documents the migration of department management from localStorage to Supabase, enabling cross-user data persistence and real-time synchronization.

## What Changed?

### Before: localStorage
- Department assignments stored per browser/user
- Custom departments limited to one device
- Data lost when clearing browser cache
- No cross-user or cross-device sync

### After: Supabase
- ✅ Department assignments stored in cloud database
- ✅ Custom departments available across all users
- ✅ Data persists permanently
- ✅ Real-time synchronization across devices
- ✅ Multi-user collaboration support

## Database Schema

Two new tables were created in Supabase:

### 1. `custom_departments`
Stores user-created custom departments.

```sql
CREATE TABLE public.custom_departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. `agent_department_assignments`
Stores agent-to-department assignment overrides.

```sql
CREATE TABLE public.agent_department_assignments (
  id BIGSERIAL PRIMARY KEY,
  agent_id TEXT NOT NULL UNIQUE,
  department_id TEXT NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Setup Instructions

### Step 1: Run Database Migration

1. Open Supabase SQL Editor: https://supabase.com/dashboard/project/yncbcjaymepacfyjsoyj/sql/new
2. Copy and paste the contents of `supabase-departments-setup.sql`
3. Click "Run" to execute the SQL

### Step 2: Verify Tables Created

Run these queries in SQL Editor to verify:

```sql
-- Check tables exist
SELECT * FROM public.custom_departments;
SELECT * FROM public.agent_department_assignments;

-- Verify policies
SELECT * FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('custom_departments', 'agent_department_assignments');
```

### Step 3: Test the Application

1. Start your development server: `npm run dev`
2. Navigate to the dashboard
3. If you have existing localStorage data, you'll see a migration prompt
4. Click "OK" to migrate your data to Supabase

## Features

### Automatic Migration

When you first load the dashboard after this update:
- System checks for localStorage data
- If found, prompts you to migrate to Supabase
- Migration preserves all custom departments and agent assignments
- One-time operation per browser

### Real-Time Sync

Changes made by any user are synchronized in real-time:
- Create a department → All users see it instantly
- Reassign an agent → Updates across all sessions
- Uses Supabase real-time subscriptions

### API Functions

New functions available in `src/lib/supabaseService.ts`:

#### Department Management
```typescript
// Get all custom departments
await getCustomDepartments()

// Create a new custom department
await createCustomDepartment(id, name, createdBy?)

// Delete a custom department
await deleteCustomDepartment(departmentId)

// Update department name
await updateCustomDepartment(departmentId, name)
```

#### Agent Assignments
```typescript
// Get all agent assignments
await getAgentDepartmentAssignments()

// Assign agent to department
await assignAgentToDepartment(agentId, departmentId, assignedBy?)

// Remove assignment (revert to default)
await removeAgentDepartmentAssignment(agentId)

// Clear all assignments
await clearAllAgentAssignments()
```

#### Helper Functions
```typescript
// Apply assignments to agents array
await applyAgentDepartmentAssignments(agents)

// Merge custom departments with standard ones
await mergeCustomDepartments(standardDepartments)

// Subscribe to real-time changes
subscribeToDepartmentChanges(callback)
```

## Migration Utility

Located in `src/lib/departmentMigration.ts`:

### Manual Migration
```typescript
import { migrateDepartmentDataToSupabase } from '@/lib/departmentMigration'

// Migrate data
const result = await migrateDepartmentDataToSupabase(userId?)

// Check result
console.log(`Migrated: ${result.customDepartmentsMigrated} departments`)
console.log(`Migrated: ${result.agentAssignmentsMigrated} assignments`)
```

### Check Migration Status
```typescript
import { checkMigrationNeeded } from '@/lib/departmentMigration'

const status = await checkMigrationNeeded()
if (status.needed) {
  console.log(`Found ${status.localCustomDepts} departments to migrate`)
  console.log(`Found ${status.localAssignments} assignments to migrate`)
}
```

## Updated Components

### Dashboard (`src/app/dashboard/page.tsx`)
- ✅ Loads departments from Supabase on mount
- ✅ Real-time subscription to department changes
- ✅ Auto-migration prompt for localStorage data
- ✅ All department operations use Supabase

### Changes to Component Logic
```typescript
// Old (localStorage)
saveAgentDepartment(agentId, departmentId)
saveCustomDepartment(newDepartment)

// New (Supabase)
await assignAgentToDepartment(agentId, departmentId)
await createCustomDepartment(newDeptId, departmentName)
```

## Testing Checklist

- [ ] Run SQL migration in Supabase
- [ ] Verify tables created successfully
- [ ] Start development server
- [ ] Accept migration prompt (if shown)
- [ ] Create a new custom department
- [ ] Assign an agent to a department
- [ ] Refresh the page - changes should persist
- [ ] Open in another browser - changes should sync
- [ ] Test real-time updates with multiple tabs

## Troubleshooting

### Migration Prompt Not Showing
- Check browser console for errors
- Verify you have localStorage data: Open DevTools → Application → Local Storage
- Look for keys: `hfc_agent_departments` and `hfc_custom_departments`

### Changes Not Persisting
- Verify Supabase tables exist (see Step 2)
- Check browser console for API errors
- Verify RLS policies are enabled on tables

### Real-Time Updates Not Working
- Check network tab for WebSocket connection to Supabase
- Verify subscription setup in browser console (look for 📡 emoji logs)
- Ensure multiple tabs/windows are authenticated

## Benefits

1. **Cross-Device Sync**: Access your department setup from any device
2. **Team Collaboration**: Multiple users can manage departments together
3. **Data Permanence**: No risk of losing data from browser cache clear
4. **Real-Time Updates**: See changes instantly across all sessions
5. **Scalability**: Database-backed storage ready for production

## Next Steps

Consider adding:
- User-specific department views (filter by created_by)
- Department edit history/audit log
- Batch operations for agent assignments
- Import/export department configurations
- Department templates or presets

## Files Modified

- `src/lib/supabaseService.ts` - Added department CRUD functions
- `src/app/dashboard/page.tsx` - Updated to use Supabase
- `src/lib/departmentMigration.ts` - New migration utility

## Files Created

- `supabase-departments-setup.sql` - Database schema
- `DEPARTMENT-SUPABASE-MIGRATION.md` - This documentation
