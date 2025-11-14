# Supabase Implementation Guide

## Project Overview

This document details the Supabase integration for the HFC Dashboard's hidden agents feature. Supabase provides PostgreSQL database, real-time subscriptions, and Row Level Security without requiring authentication.

## Supabase Project Details

### Project Information
- **Project URL**: `https://yncbcjaymepacfyjsoyj.supabase.co`
- **Project Region**: Auto-selected by Supabase
- **Database**: PostgreSQL 15.x
- **Realtime**: Enabled for WebSocket subscriptions

### Authentication
- **Mode**: Anonymous (no user authentication required)
- **Security**: Row Level Security (RLS) with public policies
- **API Key**: Anon key used for all operations

## Environment Configuration

### Required Environment Variables

Create `.env.local` in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://yncbcjaymepacfyjsoyj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InluY2JjamF5bWVwYWNmeWpzb3lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2MjUxNDMsImV4cCI6MjA1MjIwMTE0M30.I4w_wqy_cqSLiKNXAqZIJQDELd8wTLpbg7aDbuRvdQw
```

### Environment Variable Usage

**Why NEXT_PUBLIC prefix?**
- Exposes variables to browser (client-side code)
- Required for client components in Next.js App Router
- Anon key is safe to expose (RLS handles security)

**Security Considerations:**
- Anon key is public-safe (designed for client exposure)
- RLS policies control what data can be accessed
- Service role key should NEVER be in client code
- No sensitive data in `hidden_agents` table

## Database Schema

### Table: `hidden_agents`

```sql
CREATE TABLE public.hidden_agents (
    id BIGSERIAL PRIMARY KEY,
    agent_id TEXT NOT NULL UNIQUE,
    hidden_at TIMESTAMPTZ DEFAULT NOW(),
    hidden_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Column Details

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | BIGSERIAL | NO | Auto-increment | Primary key |
| `agent_id` | TEXT | NO | - | Unique lowercase agent identifier |
| `hidden_at` | TIMESTAMPTZ | NO | NOW() | When agent was hidden |
| `hidden_by` | TEXT | YES | NULL | Optional: who hid the agent |
| `created_at` | TIMESTAMPTZ | NO | NOW() | Record creation timestamp |

#### Constraints

**Primary Key:**
```sql
CONSTRAINT hidden_agents_pkey PRIMARY KEY (id)
```

**Unique Constraint:**
```sql
CONSTRAINT hidden_agents_agent_id_key UNIQUE (agent_id)
```
- Prevents duplicate entries
- Enforces one record per agent
- INSERT operations fail gracefully if agent already hidden

#### Indexes

**Automatic Indexes:**
1. Primary key index on `id`
2. Unique index on `agent_id` (for constraint)

**Optional Performance Index:**
```sql
CREATE INDEX idx_hidden_agents_created_at ON hidden_agents(created_at DESC);
```
Useful if querying by creation time or need chronological ordering.

## Row Level Security (RLS)

### RLS Configuration

**Enable RLS:**
```sql
ALTER TABLE public.hidden_agents ENABLE ROW LEVEL SECURITY;
```

### Public Access Policies

#### SELECT Policy
```sql
CREATE POLICY "Public read access"
ON public.hidden_agents
FOR SELECT
USING (true);
```
- Allows anyone to read all hidden agents
- No authentication required
- Used by `getHiddenAgents()` function

#### INSERT Policy
```sql
CREATE POLICY "Public insert access"
ON public.hidden_agents
FOR INSERT
WITH CHECK (true);
```
- Allows anyone to hide agents
- No authentication required
- Used by `hideAgent()` function

#### DELETE Policy
```sql
CREATE POLICY "Public delete access"
ON public.hidden_agents
FOR DELETE
USING (true);
```
- Allows anyone to unhide agents
- No authentication required
- Used by `unhideAgent()` function

### Why Public Policies?

**Design Decision:**
This is an internal dashboard where:
- All users should see the same hidden agents
- Any user can hide/unhide agents
- No user-specific filtering needed
- Simplifies implementation (no auth required)

**Alternative Approach:**
For user-specific hiding, modify policies:
```sql
-- Example: User-specific access
CREATE POLICY "Users see own hidden agents"
ON public.hidden_agents
FOR SELECT
USING (auth.uid() = user_id);
```

## Realtime Configuration

### Enable Realtime on Table

In Supabase Dashboard:
1. Navigate to Database → Replication
2. Find `hidden_agents` table
3. Enable replication for:
   - ✅ INSERT events
   - ✅ UPDATE events
   - ✅ DELETE events

**Via SQL:**
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE hidden_agents;
```

### Realtime Channels

**How it works:**
1. Client subscribes to `postgres_changes` channel
2. Listens for INSERT, UPDATE, DELETE on `hidden_agents`
3. Supabase sends event via WebSocket when changes occur
4. Client callback executes to refresh data

**Network Protocol:**
- Uses WebSocket (ws:// or wss://)
- Falls back to polling if WebSocket unavailable
- Automatic reconnection on disconnect

## Client Implementation

### 1. Supabase Client Setup

**File:** `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create singleton client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// TypeScript interface matching database schema
export interface HiddenAgent {
  id: number
  agent_id: string
  hidden_at: string
  hidden_by: string | null
  created_at: string
}
```

**Key Points:**
- Single client instance (singleton pattern)
- Environment variables with `!` assertion (guaranteed to exist)
- TypeScript interface matches database schema exactly
- Client exported for use across application

### 2. Service Layer Functions

**File:** `src/lib/supabaseService.ts`

#### getHiddenAgents()

```typescript
export const getHiddenAgents = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('hidden_agents')
      .select('agent_id')
    
    if (error) {
      console.error('Error fetching hidden agents:', error)
      return []
    }
    
    return data?.map(item => item.agent_id) || []
  } catch (error) {
    console.error('Failed to get hidden agents:', error)
    return []
  }
}
```

**Query Details:**
- `.from('hidden_agents')` - Target table
- `.select('agent_id')` - Only fetch agent_id column (optimization)
- Returns array of strings (agent IDs only)
- Error handling returns empty array (fail gracefully)

**SQL Equivalent:**
```sql
SELECT agent_id FROM hidden_agents;
```

#### hideAgent()

```typescript
export const hideAgent = async (agentId: string, hiddenBy?: string): Promise<boolean> => {
  try {
    // Normalize to lowercase
    const normalizedId = agentId.toLowerCase();
    
    const { error } = await supabase
      .from('hidden_agents')
      .insert({
        agent_id: normalizedId,
        hidden_by: hiddenBy
      })
    
    if (error) {
      // Unique constraint violation = already hidden
      if (error.code === '23505') {
        console.log(`Agent ${normalizedId} is already hidden`)
        return true
      }
      console.error('Error hiding agent:', error)
      return false
    }
    
    console.log(`✅ Agent ${normalizedId} hidden successfully`)
    return true
  } catch (error) {
    console.error('Failed to hide agent:', error)
    return false
  }
}
```

**Query Details:**
- `.insert()` - Add new record
- Normalizes agent_id to lowercase before insert
- Handles duplicate constraint gracefully (error code 23505)
- Returns boolean success status

**SQL Equivalent:**
```sql
INSERT INTO hidden_agents (agent_id, hidden_by) 
VALUES ('esmeraldam', 'unknown');
```

**Error Codes:**
- `23505` - Unique constraint violation (DUPLICATE_KEY)
- Treat as success (agent already hidden)

#### unhideAgent()

```typescript
export const unhideAgent = async (agentId: string): Promise<boolean> => {
  try {
    const normalizedId = agentId.toLowerCase();
    
    const { error } = await supabase
      .from('hidden_agents')
      .delete()
      .eq('agent_id', normalizedId)
    
    if (error) {
      console.error('Error unhiding agent:', error)
      return false
    }
    
    console.log(`✅ Agent ${normalizedId} unhidden successfully`)
    return true
  } catch (error) {
    console.error('Failed to unhide agent:', error)
    return false
  }
}
```

**Query Details:**
- `.delete()` - Remove records
- `.eq('agent_id', normalizedId)` - WHERE clause
- Normalizes agent_id to lowercase
- Returns boolean success status

**SQL Equivalent:**
```sql
DELETE FROM hidden_agents 
WHERE agent_id = 'esmeraldam';
```

#### isAgentHidden()

```typescript
export const isAgentHidden = async (agentId: string): Promise<boolean> => {
  try {
    const normalizedId = agentId.toLowerCase();
    
    const { data, error } = await supabase
      .from('hidden_agents')
      .select('agent_id')
      .eq('agent_id', normalizedId)
      .single()
    
    if (error) {
      // PGRST116 = No rows found (not hidden)
      if (error.code === 'PGRST116') {
        return false
      }
      console.error('Error checking if agent is hidden:', error)
      return false
    }
    
    return !!data
  } catch (error) {
    console.error('Failed to check if agent is hidden:', error)
    return false
  }
}
```

**Query Details:**
- `.select('agent_id')` - Minimal data fetch
- `.eq('agent_id', normalizedId)` - Filter by ID
- `.single()` - Expect single result (throws if 0 or 2+ rows)
- Returns boolean (is hidden or not)

**SQL Equivalent:**
```sql
SELECT agent_id FROM hidden_agents 
WHERE agent_id = 'esmeraldam' 
LIMIT 1;
```

**Error Codes:**
- `PGRST116` - No rows found (agent not hidden)
- Treat as false (agent is visible)

#### subscribeToHiddenAgents()

```typescript
export const subscribeToHiddenAgents = (callback: () => void): (() => void) => {
  const subscription = supabase
    .channel('hidden-agents-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'hidden_agents'
      },
      (payload) => {
        console.log('🔄 Hidden agents changed:', payload)
        callback()
      }
    )
    .subscribe()
  
  return () => {
    console.log('Unsubscribing from hidden agents channel')
    subscription.unsubscribe()
  }
}
```

**Subscription Details:**
- `.channel('hidden-agents-changes')` - Unique channel name
- `event: '*'` - Listen for INSERT, UPDATE, DELETE
- `schema: 'public'` - Database schema
- `table: 'hidden_agents'` - Target table
- Callback executes when any change occurs
- Returns cleanup function for React useEffect

**Realtime Flow:**
1. Client subscribes to channel
2. Database change occurs (INSERT/DELETE)
3. Supabase broadcasts event via WebSocket
4. Client receives event in callback
5. Callback triggers state refresh

**Cleanup Function:**
```typescript
useEffect(() => {
  const unsubscribe = subscribeToHiddenAgents(() => {
    // Refresh data
  });
  
  return () => unsubscribe(); // Cleanup on unmount
}, []);
```

#### filterHiddenAgents()

```typescript
export const filterHiddenAgents = async <T extends { agent_id: string }>(
  items: T[]
): Promise<T[]> => {
  try {
    const hiddenIds = await getHiddenAgents()
    const hiddenSet = new Set(hiddenIds)
    
    return items.filter(item => !hiddenSet.has(item.agent_id))
  } catch (error) {
    console.error('Failed to filter hidden agents:', error)
    return items
  }
}
```

**Generic Function:**
- Works with any type `T` that has `agent_id: string`
- Fetches hidden IDs once
- Uses Set for O(1) lookup performance
- Preserves TypeScript types
- Error returns unfiltered data (fail-safe)

**Usage Examples:**
```typescript
// Filter reviews
const visibleReviews = await filterHiddenAgents(reviews);

// Filter agents
const visibleAgents = await filterHiddenAgents(agents);

// Filter metrics
const visibleMetrics = await filterHiddenAgents(agentMetrics);
```

## Data Normalization

### Agent ID Format

**Data Service Generation:**
```typescript
// From dataService.ts
const agentId = agentName
  .toLowerCase()
  .replace(/\s+/g, '_')
  .replace(/[^a-z0-9_]/g, '');
```

**Examples:**
- "EsmeraldaM" → "esmeraldam"
- "Steven M" → "steven_m"
- "Gary B." → "gary_b"
- "Mitch C" → "mitch_c"

**Critical Rules:**
1. Always lowercase
2. Spaces become underscores
3. Special characters removed
4. Numbers preserved

### Service Layer Normalization

Every Supabase function normalizes input:
```typescript
const normalizedId = agentId.toLowerCase();
```

**Why necessary:**
- Database stores lowercase IDs
- User input might have mixed case
- Ensures consistent matching
- Prevents duplicate entries with different cases

## Error Handling Strategy

### Error Response Structure

Supabase errors contain:
```typescript
{
  message: string,      // Human-readable error
  details: string,      // Technical details
  hint: string,         // Suggested fix
  code: string          // Error code (e.g., '23505', 'PGRST116')
}
```

### Common Error Codes

| Code | Meaning | Handling |
|------|---------|----------|
| `23505` | Unique constraint violation | Treat as success (already exists) |
| `PGRST116` | No rows found | Treat as false (not found) |
| `PGRST301` | Too many rows | Use .single() or .limit() |
| Network errors | Connection failed | Retry or fail gracefully |

### Error Handling Pattern

```typescript
try {
  const { data, error } = await supabase.operation();
  
  if (error) {
    // Handle specific error codes
    if (error.code === '23505') {
      return handleDuplicate();
    }
    
    // Log and return safe default
    console.error('Operation failed:', error);
    return safeDefault;
  }
  
  return data;
} catch (error) {
  // Catch network/unexpected errors
  console.error('Unexpected error:', error);
  return safeDefault;
}
```

**Principles:**
- Never throw errors to UI
- Always return safe defaults
- Log errors for debugging
- Handle specific codes explicitly

## Performance Optimization

### Query Optimization

**Select Only Needed Columns:**
```typescript
// Good: Only fetch agent_id
.select('agent_id')

// Bad: Fetch entire row
.select('*')
```

**Use Single for One Result:**
```typescript
// Good: Expects exactly one row
.select('agent_id').eq('agent_id', id).single()

// Bad: Returns array with one item
.select('agent_id').eq('agent_id', id)
```

### Client-Side Optimization

**Use Set for Lookups:**
```typescript
// Good: O(1) lookup
const hiddenSet = new Set(hiddenIds);
items.filter(item => !hiddenSet.has(item.agent_id));

// Bad: O(n) lookup per item
items.filter(item => !hiddenIds.includes(item.agent_id));
```

**Cache Results:**
```typescript
// Store in state, only refresh when needed
const [hiddenAgentIds, setHiddenAgentIds] = useState<Set<string>>(new Set());
```

### Connection Pooling

Supabase automatically handles:
- Connection pooling
- Connection reuse
- Automatic reconnection
- WebSocket heartbeats

**No configuration needed** - works out of the box.

## Testing & Debugging

### Manual Testing with Supabase Dashboard

**Insert Record:**
```sql
INSERT INTO hidden_agents (agent_id, hidden_by) 
VALUES ('test_agent', 'manual_test');
```

**Query Records:**
```sql
SELECT * FROM hidden_agents 
ORDER BY created_at DESC;
```

**Delete Record:**
```sql
DELETE FROM hidden_agents 
WHERE agent_id = 'test_agent';
```

**Truncate Table:**
```sql
TRUNCATE hidden_agents;
```

### Testing with Node Scripts

**Create test script** (`test-supabase.mjs`):
```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://yncbcjaymepacfyjsoyj.supabase.co',
  'your-anon-key'
)

async function test() {
  // Test insert
  const { data: inserted, error: insertError } = await supabase
    .from('hidden_agents')
    .insert({ agent_id: 'test_agent' })
    
  console.log('Insert:', inserted, insertError)
  
  // Test select
  const { data: selected, error: selectError } = await supabase
    .from('hidden_agents')
    .select('*')
    
  console.log('Select:', selected, selectError)
  
  // Test delete
  const { error: deleteError } = await supabase
    .from('hidden_agents')
    .delete()
    .eq('agent_id', 'test_agent')
    
  console.log('Delete:', deleteError)
}

test()
```

**Run:**
```bash
node test-supabase.mjs
```

### Browser Console Testing

**Test from browser console:**
```javascript
// Import client
import { supabase } from './src/lib/supabase'

// Test query
const { data, error } = await supabase
  .from('hidden_agents')
  .select('*')
  
console.log(data, error)
```

### Debugging Real-time Subscriptions

**Check WebSocket connection:**
```javascript
// Monitor subscription status
const subscription = supabase
  .channel('test-channel')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'hidden_agents'
  }, (payload) => {
    console.log('Event received:', payload)
  })
  .subscribe((status) => {
    console.log('Subscription status:', status)
  })
```

**Subscription states:**
- `SUBSCRIBED` - Connected and listening
- `TIMED_OUT` - Connection failed
- `CLOSED` - Subscription closed
- `CHANNEL_ERROR` - Configuration error

## Security Best Practices

### Environment Variables

**DO:**
- ✅ Store in `.env.local`
- ✅ Add `.env.local` to `.gitignore`
- ✅ Use `NEXT_PUBLIC_` prefix for client-side
- ✅ Use anon key for client operations

**DON'T:**
- ❌ Commit keys to Git
- ❌ Use service role key in client code
- ❌ Hardcode keys in source files
- ❌ Share keys in screenshots/documentation

### RLS Policies

**Current Setup (Public Access):**
```sql
-- Anyone can read/write
FOR ALL USING (true)
```

**Production Recommendation:**
```sql
-- Add rate limiting
-- Add user authentication
-- Add audit logging
-- Add data validation
```

### Data Validation

**Server-Side Validation (Future):**
```sql
-- Add CHECK constraint
ALTER TABLE hidden_agents
ADD CONSTRAINT agent_id_format
CHECK (agent_id ~ '^[a-z0-9_]+$');
```

**Client-Side Validation (Current):**
```typescript
const normalizedId = agentId
  .toLowerCase()
  .replace(/[^a-z0-9_]/g, '');
```

## Deployment Considerations

### Environment Variables in Production

**Vercel:**
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**Netlify:**
```bash
netlify env:set NEXT_PUBLIC_SUPABASE_URL "https://..."
netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "eyJ..."
```

**Docker:**
```dockerfile
ENV NEXT_PUBLIC_SUPABASE_URL=https://...
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Database Migration

**Export Schema:**
```bash
# From Supabase Dashboard
# Settings → Database → Connection string
# Use pg_dump for schema export
```

**Import to New Project:**
```sql
-- Copy SQL from old project
-- Execute in new project SQL editor
```

### Backup Strategy

**Automatic Backups:**
- Supabase Pro/Team plans include daily backups
- Free tier: Manual exports recommended

**Manual Export:**
```bash
# Via Supabase CLI
supabase db dump > backup.sql
```

## Monitoring & Logging

### Supabase Dashboard Metrics

**Monitor:**
- API requests per hour
- Database connections
- Realtime connections
- Storage usage

**Location:** Project → Reports → API

### Application Logging

**Console Logs:**
```typescript
console.log('🔒 Loading hidden agents...')  // Info
console.error('❌ Error:', error)           // Errors
console.log('✅ Success')                   // Success
```

**Production Logging:**
Consider services like:
- Sentry (error tracking)
- LogRocket (session replay)
- Datadog (monitoring)

## Troubleshooting

### Issue: "Failed to fetch"

**Cause:** Network/CORS issues  
**Check:**
- Environment variables correct
- Supabase project URL accessible
- Browser network tab for errors
- CORS enabled in Supabase settings

### Issue: "Row level security policy"

**Cause:** RLS blocking operation  
**Check:**
- RLS enabled on table
- Policies exist for operation (SELECT/INSERT/DELETE)
- Policy conditions allow access

### Issue: "Unique constraint violation"

**Cause:** Trying to insert duplicate agent_id  
**Solution:** This is expected, handle with error code check:
```typescript
if (error.code === '23505') {
  return true; // Already hidden
}
```

### Issue: "Realtime not working"

**Cause:** Subscription not configured  
**Check:**
- Realtime enabled in Supabase Dashboard
- Table added to publication
- WebSocket connection in Network tab
- Subscription callback executing

## Migration from localStorage

### Why Migrate?

**localStorage limitations:**
- Browser-specific (not cross-user)
- Not real-time
- Limited storage (5-10MB)
- No backup/recovery

**Supabase benefits:**
- Cross-user synchronization
- Real-time updates
- Unlimited storage
- Automatic backups
- Query capabilities

### Migration Steps

1. **Install Supabase:**
```bash
npm install @supabase/supabase-js --legacy-peer-deps
```

2. **Create table in Supabase Dashboard**

3. **Replace localStorage calls:**
```typescript
// Before
localStorage.setItem('hiddenAgents', JSON.stringify(agents))
const hidden = JSON.parse(localStorage.getItem('hiddenAgents'))

// After
await hideAgent(agentId)
const hidden = await getHiddenAgents()
```

4. **Add real-time subscriptions:**
```typescript
useEffect(() => {
  const unsubscribe = subscribeToHiddenAgents(() => {
    refreshData()
  })
  return unsubscribe
}, [])
```

## Resources

### Official Documentation
- **Supabase Docs**: https://supabase.com/docs
- **JavaScript Client**: https://supabase.com/docs/reference/javascript
- **Realtime**: https://supabase.com/docs/guides/realtime
- **RLS**: https://supabase.com/docs/guides/auth/row-level-security

### Community Resources
- **Discord**: https://discord.supabase.com
- **GitHub**: https://github.com/supabase/supabase
- **Examples**: https://github.com/supabase/supabase/tree/master/examples

### TypeScript Support
- **Generated Types**: Use Supabase CLI to generate types
```bash
supabase gen types typescript --project-id "yncbcjaymepacfyjsoyj" > types/supabase.ts
```

## Summary

This Supabase implementation provides:
- ✅ Simple PostgreSQL database for hidden agents
- ✅ Row Level Security for public access control
- ✅ Real-time WebSocket subscriptions
- ✅ Type-safe TypeScript client
- ✅ Comprehensive error handling
- ✅ Performance optimizations
- ✅ Production-ready deployment

The implementation is minimal, maintainable, and scalable for future enhancements like user authentication, audit logging, and advanced filtering.
