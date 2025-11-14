# Hidden Agents Integration Documentation

## Overview
This document describes the complete implementation of the **cross-user persistent hidden agents** feature that allows users to hide specific agents from all dashboard views with real-time synchronization across all browsers and users.

## Architecture

### Data Flow
```
User Action (Settings/Agent Page)
    ↓
Supabase Database (hidden_agents table)
    ↓
Real-time Subscription (WebSocket)
    ↓
Dashboard State Update (hiddenAgentIds Set)
    ↓
Filtered Data (visibleReviews, visibleAgents)
    ↓
All Components Render with Filtered Data
```

## Database Setup

### Supabase Table Schema
**Table Name:** `hidden_agents`

```sql
CREATE TABLE hidden_agents (
  id BIGSERIAL PRIMARY KEY,
  agent_id TEXT NOT NULL UNIQUE,
  hidden_at TIMESTAMPTZ DEFAULT NOW(),
  hidden_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security (RLS)
- **SELECT**: Public access (anyone can read)
- **INSERT**: Public access (anyone can hide)
- **DELETE**: Public access (anyone can unhide)

This allows the feature to work without authentication while maintaining data consistency.

## Core Implementation Files

### 1. Supabase Client (`src/lib/supabase.ts`)
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface HiddenAgent {
  id: number
  agent_id: string
  hidden_at: string
  hidden_by: string | null
  created_at: string
}
```

**Environment Variables Required:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Supabase Service Layer (`src/lib/supabaseService.ts`)

#### Key Functions

**`getHiddenAgents(): Promise<string[]>`**
- Fetches all hidden agent IDs from database
- Returns array of lowercase agent IDs
- Used on component mount to initialize state

**`hideAgent(agentId: string, hiddenBy?: string): Promise<boolean>`**
- Normalizes agent ID to lowercase
- Inserts record into `hidden_agents` table
- Handles duplicate constraint violations gracefully
- Returns true on success

**`unhideAgent(agentId: string): Promise<boolean>`**
- Normalizes agent ID to lowercase
- Deletes record from `hidden_agents` table
- Returns true on success

**`isAgentHidden(agentId: string): Promise<boolean>`**
- Checks if specific agent is hidden
- Used for UI state (toggle buttons)

**`subscribeToHiddenAgents(callback: () => void): () => void`**
- Sets up real-time WebSocket subscription
- Listens for INSERT, UPDATE, DELETE on `hidden_agents`
- Calls callback when changes occur
- Returns cleanup function for useEffect

**`filterHiddenAgents<T extends { agent_id: string }>(items: T[]): Promise<T[]>`**
- Generic async filter for any array with `agent_id` property
- Fetches hidden IDs and filters them out
- Preserves TypeScript types

#### Critical Implementation Details

**Agent ID Normalization:**
```typescript
const normalizedId = agentId.toLowerCase();
```
All agent IDs are normalized to lowercase because the data service generates agent IDs using:
```typescript
agentName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
```

**Error Handling:**
All functions have try-catch blocks that:
- Log errors to console
- Return safe defaults (empty arrays, false, etc.)
- Never throw exceptions to prevent app crashes

## Dashboard Integration Pattern

### State Management
Every dashboard page needs these three state variables:

```typescript
const [hiddenAgentIds, setHiddenAgentIds] = useState<Set<string>>(new Set());
const [hiddenAgentsLoaded, setHiddenAgentsLoaded] = useState(false);
```

**Why Set instead of Array?**
- O(1) lookup time for `.has()` checks
- No duplicates
- More efficient for filtering large datasets

**Why `hiddenAgentsLoaded` flag?**
- Prevents race condition where filtering happens before IDs load
- Ensures `useMemo` dependencies trigger correctly
- Avoids showing all agents briefly before hiding them

### useEffect Hooks

#### Load Hidden Agents on Mount
```typescript
useEffect(() => {
  const loadHiddenAgents = async () => {
    try {
      console.log('🔒 Loading hidden agents from Supabase...');
      const hiddenIds = await getHiddenAgents();
      console.log('🔒 Received hidden agent IDs:', hiddenIds);
      const hiddenSet = new Set(hiddenIds);
      setHiddenAgentIds(hiddenSet);
      setHiddenAgentsLoaded(true);
      console.log('🔒 Loaded hidden agents on mount:', Array.from(hiddenSet));
    } catch (error) {
      console.error('❌ Error loading hidden agents:', error);
      setHiddenAgentsLoaded(true); // Set to true anyway so app doesn't hang
    }
  };
  loadHiddenAgents();
}, []);
```

#### Real-time Subscription
```typescript
useEffect(() => {
  console.log('📡 Setting up real-time subscription for hidden agents...');
  const unsubscribe = subscribeToHiddenAgents(async () => {
    console.log('🔄 Hidden agents changed, reloading...');
    const hiddenIds = await getHiddenAgents();
    setHiddenAgentIds(new Set(hiddenIds));
    console.log('🔒 Updated hidden agents:', hiddenIds);
  });

  return () => {
    console.log('🔌 Unsubscribing from hidden agents updates');
    unsubscribe();
  };
}, []);
```

**Cleanup Function Critical:**
- Prevents memory leaks
- Removes WebSocket listeners
- Called when component unmounts

### Filtered Data with useMemo

#### Filter Reviews
```typescript
const visibleReviews = useMemo(() => {
  if (!hiddenAgentsLoaded) {
    console.log('⏳ Hidden agents not loaded yet, returning all filtered data');
    return filteredData; // Return unfiltered until IDs load
  }
  
  console.log('🔍 visibleReviews useMemo - hiddenAgentIds:', Array.from(hiddenAgentIds));
  console.log('📊 filteredData length:', filteredData.length);
  
  const visible = filteredData.filter(review => {
    const isHidden = hiddenAgentIds.has(review.agent_id);
    if (isHidden) {
      console.log(`🚫 Filtering out review from hidden agent: ${review.agent_id}`);
    }
    return !isHidden;
  });
  
  console.log(`👁️ Filtered reviews: ${filteredData.length} -> ${visible.length} (removed ${filteredData.length - visible.length})`);
  return visible;
}, [filteredData, hiddenAgentIds, hiddenAgentsLoaded]);
```

#### Filter Agents
```typescript
const visibleAgents = useMemo(() => {
  if (!hiddenAgentsLoaded) {
    console.log('⏳ Agents: Hidden agents not loaded yet');
    return agents;
  }
  
  console.log('🔍 visibleAgents useMemo - hiddenAgentIds:', Array.from(hiddenAgentIds));
  console.log('👥 Total agents:', agents.length);
  
  const visible = agents.filter(agent => {
    const isHidden = hiddenAgentIds.has(agent.id);
    if (isHidden) {
      console.log(`🚫 Filtering out hidden agent: ${agent.id} (${agent.display_name})`);
    }
    return !isHidden;
  });
  
  console.log(`👁️ Filtered agents: ${agents.length} -> ${visible.length}`);
  return visible;
}, [agents, hiddenAgentIds, hiddenAgentsLoaded]);
```

**Critical Dependencies:**
- Must include `hiddenAgentsLoaded` to retrigger when IDs finish loading
- Must include source data (`filteredData`, `agents`)
- Must include `hiddenAgentIds` to retrigger on changes

### Update Metrics Calculations

**BEFORE (Wrong):**
```typescript
const currentMetrics = calculateMetrics(filteredData);
const agentMetrics = getAgentMetrics(filteredData, agents, departments);
```

**AFTER (Correct):**
```typescript
const currentMetrics = calculateMetrics(visibleReviews);
const agentMetrics = getAgentMetrics(visibleReviews, visibleAgents, departments);
```

**Why this matters:**
- Metrics must reflect only visible data
- Using `filteredData` includes hidden agents in calculations
- Using `visibleReviews`/`visibleAgents` excludes them

### Update All Component Props

Replace all instances:
- `reviews={filteredData}` → `reviews={visibleReviews}`
- `agents={agents}` → `agents={visibleAgents}`

**Components that need updates:**
- `<DepartmentPerformanceRankings />`
- `<UnifiedAgentRankings />`
- `<ProblemFeedback />`
- `<DepartmentComparison />`
- `<ProblemSpotlight />`
- `<RatingTrendChart />`
- All chart components
- All table components

### Update Inline Filtering

**Example - Department Stats:**
```typescript
// BEFORE
const deptReviews = filteredData.filter(r => r.department_id === dept.id);
const deptAgentMetrics = getAgentMetrics(deptReviews, agents, departments);

// AFTER
const deptReviews = visibleReviews.filter(r => r.department_id === dept.id);
const deptAgentMetrics = getAgentMetrics(deptReviews, visibleAgents, departments);
```

**Example - Agent Lookups:**
```typescript
// BEFORE
const agent = agents.find(a => a.id === agentId);

// AFTER
const agent = visibleAgents.find(a => a.id === agentId);
```

## UI Integration

### Settings Page (`src/app/settings/page.tsx`)

Shows list of currently hidden agents with unhide buttons:

```typescript
const [hiddenAgents, setHiddenAgents] = useState<HiddenAgent[]>([]);

useEffect(() => {
  const loadHiddenAgents = async () => {
    const ids = await getHiddenAgents();
    // Fetch full agent details for display
    const agentDetails = ids.map(id => 
      agents.find(a => a.id === id)
    ).filter(Boolean);
    setHiddenAgents(agentDetails);
  };
  
  loadHiddenAgents();
  
  const unsubscribe = subscribeToHiddenAgents(() => {
    loadHiddenAgents(); // Reload when changes occur
  });
  
  return () => unsubscribe();
}, [agents]);
```

**Unhide Button:**
```typescript
<button onClick={async () => {
  const success = await unhideAgent(agent.id);
  if (success) {
    // State updates automatically via subscription
  }
}}>
  Unhide
</button>
```

### Agent Profile Page (`src/app/agent/[id]/page.tsx`)

Toggle button to hide/unhide from agent profile:

```typescript
const [isHidden, setIsHidden] = useState(false);

useEffect(() => {
  const checkHidden = async () => {
    const hidden = await isAgentHidden(agentId);
    setIsHidden(hidden);
  };
  checkHidden();
}, [agentId]);

const toggleHidden = async () => {
  if (isHidden) {
    const success = await unhideAgent(agentId);
    if (success) {
      setIsHidden(false);
      alert('Agent is now visible on the dashboard');
    }
  } else {
    const success = await hideAgent(agentId);
    if (success) {
      setIsHidden(true);
      alert('Agent hidden from dashboard');
    }
  }
};
```

## Pages Requiring Integration

### ✅ Completed Pages
1. **Home Page** (`src/app/page.tsx`)
   - Main dashboard with all sections
   - Agent rankings
   - Department rankings
   - Problem feedback
   - All charts and metrics

2. **Dashboard Page** (`src/app/dashboard/page.tsx`)
   - Alternative dashboard view
   - Same filtering requirements
   - All sections updated

3. **Settings Page** (`src/app/settings/page.tsx`)
   - Hidden agents management UI
   - Real-time list updates

4. **Agent Profile Page** (`src/app/agent/[id]/page.tsx`)
   - Hide/unhide toggle button
   - Visual feedback on state changes

### Components Already Filtering Correctly
These components receive `visibleReviews`/`visibleAgents` and don't need internal changes:
- `<DepartmentPerformanceRankings />` - Receives filtered props
- `<UnifiedAgentRankings />` - Uses agentMetrics (calculated from visible data)
- All chart components - Receive `reviews={visibleReviews}`
- All table components - Receive filtered data

## Debugging & Logging Strategy

### Console Log Emojis
Consistent emoji prefixes make logs easy to scan:
- 🔒 - Hidden agents loading/state changes
- 🔍 - Filtering operations
- 🚫 - Specific items being filtered out
- 👁️ - Visible data counts
- 👥 - Agent-related operations
- 📊 - Metrics/data calculations
- 📡 - Real-time subscription events
- 🔌 - Cleanup/unsubscribe events
- ⏳ - Waiting/loading states
- ❌ - Errors

### Key Debug Points

**On Mount:**
```
🔒 Loading hidden agents from Supabase...
🔒 Received hidden agent IDs: ["anya", "david", "scott", "esmeraldam"]
🔒 Loaded hidden agents on mount: ["anya", "david", "scott", "esmeraldam"]
```

**During Filtering:**
```
🔍 visibleReviews useMemo - hiddenAgentIds: ["anya", "david", "scott", "esmeraldam"]
📊 filteredData length: 308
🚫 Filtering out review from hidden agent: esmeraldam
👁️ Filtered reviews: 308 -> 275 (removed 33)
```

**Real-time Updates:**
```
🔄 Hidden agents changed, reloading...
🔒 Updated hidden agents: ["anya", "david", "scott"]
```

## Common Pitfalls & Solutions

### Problem: Hidden agents show briefly then disappear
**Cause:** `visibleReviews` useMemo doesn't wait for `hiddenAgentsLoaded`  
**Solution:** Add guard clause checking `hiddenAgentsLoaded` before filtering

### Problem: Changes in one browser don't appear in another
**Cause:** Missing real-time subscription or cleanup function  
**Solution:** Ensure subscription useEffect is present with proper cleanup

### Problem: Agent IDs don't match database records
**Cause:** Case sensitivity mismatch  
**Solution:** All service functions normalize to `.toLowerCase()`

### Problem: Metrics still include hidden agents
**Cause:** Metrics calculated from `filteredData` instead of `visibleReviews`  
**Solution:** Update all metric calculations to use visible data

### Problem: Some components still show hidden agents
**Cause:** Inline filtering using `filteredData` or `agents` directly  
**Solution:** Search for all `.filter()` calls and replace with visible data

### Problem: Race condition on initial load
**Cause:** Multiple async operations competing  
**Solution:** Use `hiddenAgentsLoaded` flag and proper useMemo dependencies

## Testing Checklist

### Manual Testing Steps

1. **Basic Hiding**
   - [ ] Navigate to agent profile
   - [ ] Click "Hide from Dashboard" button
   - [ ] Verify agent disappears from all rankings
   - [ ] Check settings page shows hidden agent

2. **Real-time Sync**
   - [ ] Open dashboard in two browsers
   - [ ] Hide agent in browser A
   - [ ] Verify agent disappears in browser B automatically
   - [ ] Unhide in browser B
   - [ ] Verify agent appears in browser A

3. **Data Integrity**
   - [ ] Check top 5 agents don't include hidden ones
   - [ ] Verify review counts exclude hidden agent reviews
   - [ ] Check department stats exclude hidden agents
   - [ ] Verify metrics calculations are correct

4. **Page Navigation**
   - [ ] Hide agents on home page (`/`)
   - [ ] Navigate to `/dashboard`
   - [ ] Verify same agents are hidden
   - [ ] Check settings page
   - [ ] Verify hidden agents list is consistent

5. **Edge Cases**
   - [ ] Hide all agents in a department
   - [ ] Verify department still shows but with 0 agents
   - [ ] Hide top performer
   - [ ] Verify next agent becomes #1
   - [ ] Unhide all agents
   - [ ] Verify everything returns to normal

### Console Verification

Check browser console for:
- ✅ No errors or warnings
- ✅ Filtering logs show correct agent IDs
- ✅ Review counts decrease after filtering
- ✅ Agent counts decrease after filtering
- ✅ Real-time subscription connected
- ✅ Cleanup functions called on unmount

## Performance Considerations

### Optimization Strategies

**useMemo Dependencies:**
- Only include necessary dependencies
- Avoid object/array literals in dependency arrays
- Use primitive values when possible

**Set vs Array:**
- Using Set for O(1) lookups is critical with 45+ agents
- Converting to/from Array only for display purposes

**Subscription Management:**
- Only one subscription per page
- Proper cleanup prevents memory leaks
- Callback should be lightweight (just reload IDs)

**Database Queries:**
- `getHiddenAgents()` fetches all IDs at once
- No per-agent queries
- Filtered locally after initial load

## Future Enhancements

### Potential Improvements

1. **User-specific hiding** - Add authentication and user_id to hidden_agents table
2. **Hide by department** - Extend to allow hiding entire departments
3. **Temporary hiding** - Add expiration timestamps
4. **Hide reasons** - Add optional reason field for documentation
5. **Bulk operations** - UI for hiding/unhiding multiple agents at once
6. **Export hidden list** - Download CSV of current hidden agents
7. **Hiding history** - Track when agents were hidden/unhidden and by whom

### Migration Path

To add user-specific hiding:
1. Add `user_id` column to `hidden_agents` table
2. Update RLS policies to filter by user_id
3. Modify `getHiddenAgents()` to pass user context
4. Update UI to show "Hide for me" vs "Hide for everyone"

## Troubleshooting Guide

### Issue: "No hidden agents loading"
**Check:**
1. `.env.local` has correct Supabase credentials
2. Network tab shows successful API calls
3. Database table exists and has correct schema
4. RLS policies allow SELECT

### Issue: "Real-time not working"
**Check:**
1. Supabase Realtime enabled in project settings
2. Browser WebSocket connection active
3. Subscription cleanup function not called prematurely
4. Console shows subscription setup messages

### Issue: "Agent IDs don't match"
**Check:**
1. All service functions use `.toLowerCase()`
2. Database records use lowercase IDs
3. Data service generates lowercase IDs
4. No manual database entries with uppercase

### Issue: "Performance degradation"
**Check:**
1. useMemo dependencies not causing excessive rerenders
2. Subscription not triggering infinite loops
3. Console logs not overwhelming (remove or reduce in production)
4. Set operations used instead of Array.find()

## Dependencies

### NPM Packages
```json
{
  "@supabase/supabase-js": "^2.x.x"
}
```

**Installation:**
```bash
npm install @supabase/supabase-js --legacy-peer-deps
```

Note: `--legacy-peer-deps` required for React 19 compatibility

### Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Deployment Checklist

- [ ] Environment variables set in production
- [ ] Supabase project RLS policies verified
- [ ] Database table created in production
- [ ] Console logs reduced or removed for production
- [ ] Error handling tested
- [ ] Real-time subscription tested across deployments
- [ ] Browser compatibility verified (WebSocket support)

## Summary

This integration provides:
- ✅ Cross-user persistent storage via Supabase
- ✅ Real-time synchronization across browsers
- ✅ Consistent filtering across all pages
- ✅ Clean UI for management in settings
- ✅ Easy toggle from agent profiles
- ✅ Race condition prevention with loading flags
- ✅ Comprehensive error handling
- ✅ Performance optimization with useMemo and Set
- ✅ Extensive debugging capabilities

The pattern is highly reusable for other filtering features (departments, date ranges, sources, etc.) by following the same state management and useMemo approach.
