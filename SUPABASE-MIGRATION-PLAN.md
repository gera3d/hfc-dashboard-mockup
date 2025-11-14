# Supabase Migration Plan

**Status**: Ready to implement when needed  
**Created**: November 14, 2025  
**Purpose**: Transition from cached JSON files to Supabase database for review data

---

## Executive Summary

**Current State**: Google Sheets → CSV download → Parsed JSON cache (`cached-sheets-parsed.json`)  
**Target State**: Google Sheets → Sync Service → Supabase PostgreSQL → Next.js App

**Why Migrate?**
- ✅ Query performance with database indexes
- ✅ Incremental updates (only sync new records)
- ✅ Data integrity with type validation
- ✅ Concurrent access without file locking
- ✅ Built-in analytics and aggregation
- ✅ Scalability from 1K to 100K+ reviews
- ✅ Row-level security capabilities

---

## Architecture Overview

```
┌─────────────────┐
│  Google Sheets  │ (Source of Truth)
│  (Live Data)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Sync Service   │ (Cron/Webhook)
│  /api/sync      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Supabase     │ (Cache + Analytics)
│   PostgreSQL    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Next.js App   │ (Queries Supabase)
│   Dashboard     │
└─────────────────┘
```

---

## Phase 1: Database Schema

### Reviews Table (Main Cache)

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_no INTEGER UNIQUE NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  entry_date TIMESTAMPTZ NOT NULL,
  source_url TEXT,
  agent_name TEXT NOT NULL,
  user_agent TEXT,
  user_ip INET,
  
  -- Customer feedback fields
  name TEXT,
  would_recommend BOOLEAN,
  feedback TEXT,
  wants_response BOOLEAN,
  email TEXT,
  phone TEXT,
  
  -- Computed fields
  year INTEGER,
  month TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_reviews_agent_name ON reviews(agent_name);
CREATE INDEX idx_reviews_entry_date ON reviews(entry_date DESC);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_year_month ON reviews(year, month);
CREATE INDEX idx_reviews_review_no ON reviews(review_no);
```

### Agents Table (Normalized Dimension)

```sql
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_key TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  department_id UUID REFERENCES departments(id),
  is_active BOOLEAN DEFAULT true,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agents_agent_key ON agents(agent_key);
CREATE INDEX idx_agents_department ON agents(department_id);
CREATE INDEX idx_agents_active ON agents(is_active) WHERE is_active = true;
```

### Departments Table

```sql
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default departments
INSERT INTO departments (name, description) VALUES
  ('Sales', 'Sales team agents'),
  ('Support', 'Customer support agents'),
  ('Service', 'Service department agents');
```

### Sync Metadata Table

```sql
CREATE TABLE sync_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT CHECK (status IN ('running', 'success', 'error')) NOT NULL,
  records_processed INTEGER DEFAULT 0,
  new_records INTEGER DEFAULT 0,
  updated_records INTEGER DEFAULT 0,
  error_message TEXT,
  sync_type TEXT CHECK (sync_type IN ('full', 'incremental')) DEFAULT 'incremental'
);

CREATE INDEX idx_sync_runs_status ON sync_runs(status);
CREATE INDEX idx_sync_runs_started ON sync_runs(started_at DESC);
```

### Row-Level Security (RLS) Policies

```sql
-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Public read access (for dashboard)
CREATE POLICY "Public read access" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Public read access" ON agents
  FOR SELECT USING (true);

CREATE POLICY "Public read access" ON departments
  FOR SELECT USING (true);

-- Service role can do everything (for sync)
CREATE POLICY "Service role full access" ON reviews
  FOR ALL USING (auth.role() = 'service_role');
```

---

## Phase 2: Data Migration Script

Create `scripts/migrate-to-supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import cachedData from '../src/data/cached-sheets-parsed.json';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for migration
);

interface CachedRow {
  'Review no.': string;
  'How Did We Do?': string;
  'Entry Date': string;
  'Agent': string;
  'User Agent': string;
  'User IP': string;
  'Name': string;
  'Would You Recommend Us?': string;
  'Please provide your feedback below.': string;
  'Would you like a response?': string;
  'What is your email?': string;
  'What is your number?': string;
  'Year': string;
  'Month': string;
  'Source Url': string;
}

async function migrateData() {
  console.log('🚀 Starting migration to Supabase...\n');
  console.log(`Total rows in cached file: ${cachedData.rows.length}`);
  
  // Transform cached rows to DB format
  const reviews = (cachedData.rows as CachedRow[])
    .filter(row => row['Review no.'] && row['Review no.'] !== '') // Skip empty rows
    .map(row => ({
      review_no: parseInt(row['Review no.'] || '0'),
      rating: parseInt(row['How Did We Do?'] || '0'),
      entry_date: row['Entry Date'],
      agent_name: row['Agent'],
      user_agent: row['User Agent'],
      user_ip: row['User IP'],
      name: row['Name'],
      would_recommend: row['Would You Recommend Us?'] === 'Yes',
      feedback: row['Please provide your feedback below.'],
      wants_response: row['Would you like a response?'] === 'Yes',
      email: row['What is your email?'],
      phone: row['What is your number?'],
      year: parseInt(row['Year'] || '0'),
      month: row['Month'],
      source_url: row['Source Url']
    }));

  console.log(`Valid reviews to migrate: ${reviews.length}\n`);

  // Batch insert (Supabase has 1000 row limit per insert)
  const BATCH_SIZE = 500;
  let totalMigrated = 0;
  let totalErrors = 0;

  for (let i = 0; i < reviews.length; i += BATCH_SIZE) {
    const batch = reviews.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(reviews.length / BATCH_SIZE);
    
    console.log(`📦 Processing batch ${batchNum}/${totalBatches} (${batch.length} reviews)...`);
    
    const { data, error } = await supabase
      .from('reviews')
      .upsert(batch, {
        onConflict: 'review_no', // Prevent duplicates
        ignoreDuplicates: false // Update existing records
      });
    
    if (error) {
      console.error(`❌ Batch ${batchNum} failed:`, error.message);
      totalErrors += batch.length;
    } else {
      console.log(`✅ Batch ${batchNum} migrated successfully`);
      totalMigrated += batch.length;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🎉 Migration Summary:');
  console.log(`   Total processed: ${reviews.length}`);
  console.log(`   Successfully migrated: ${totalMigrated}`);
  console.log(`   Errors: ${totalErrors}`);
  console.log('='.repeat(50));
}

// Extract unique agents and populate agents table
async function migrateAgents() {
  console.log('\n📋 Migrating agents...\n');
  
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('agent_name')
    .not('agent_name', 'is', null);
  
  if (error) {
    console.error('Failed to fetch reviews:', error);
    return;
  }
  
  // Get unique agent names
  const uniqueAgents = [...new Set(reviews.map(r => r.agent_name))];
  console.log(`Found ${uniqueAgents.length} unique agents`);
  
  const agents = uniqueAgents.map(name => ({
    agent_key: name.toLowerCase().replace(/\s+/g, '-'),
    display_name: name,
    is_active: true,
    is_hidden: false
  }));
  
  const { error: insertError } = await supabase
    .from('agents')
    .upsert(agents, {
      onConflict: 'agent_key',
      ignoreDuplicates: true
    });
  
  if (insertError) {
    console.error('Failed to migrate agents:', insertError);
  } else {
    console.log(`✅ Migrated ${agents.length} agents`);
  }
}

// Run migration
async function main() {
  try {
    await migrateData();
    await migrateAgents();
    console.log('\n✨ Migration complete!\n');
  } catch (error) {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  }
}

main();
```

### Run Migration

```bash
# Add to package.json scripts
"scripts": {
  "migrate:supabase": "tsx scripts/migrate-to-supabase.ts"
}

# Execute migration
npm run migrate:supabase
```

---

## Phase 3: Sync Service

Create `src/app/api/sync-reviews/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SHEET_CSV_URL = process.env.GOOGLE_SHEET_CSV_URL!;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role for write access
);

export async function POST(request: Request) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Create sync run record
    const { data: syncRun, error: syncError } = await supabase
      .from('sync_runs')
      .insert({ status: 'running', sync_type: 'incremental' })
      .select()
      .single();

    if (syncError) throw syncError;

    console.log(`[Sync ${syncRun.id}] Started at ${new Date().toISOString()}`);

    // Fetch CSV from Google Sheets
    const response = await fetch(SHEET_CSV_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    console.log(`[Sync ${syncRun.id}] Fetched CSV (${csvText.length} bytes)`);
    
    // Parse CSV
    const rows = parseCSV(csvText);
    console.log(`[Sync ${syncRun.id}] Parsed ${rows.length} rows`);
    
    // Get last synced review number to only process new/updated records
    const { data: lastReview } = await supabase
      .from('reviews')
      .select('review_no')
      .order('review_no', { ascending: false })
      .limit(1)
      .single();

    const lastReviewNo = lastReview?.review_no || 0;
    console.log(`[Sync ${syncRun.id}] Last review in DB: #${lastReviewNo}`);

    // Filter for new or updated records
    const newRows = rows.filter(r => r.review_no > lastReviewNo);
    console.log(`[Sync ${syncRun.id}] Found ${newRows.length} new reviews`);

    let recordsProcessed = 0;

    if (newRows.length > 0) {
      // Batch upsert
      const BATCH_SIZE = 500;
      for (let i = 0; i < newRows.length; i += BATCH_SIZE) {
        const batch = newRows.slice(i, i + BATCH_SIZE);
        
        const { error: upsertError } = await supabase
          .from('reviews')
          .upsert(batch, {
            onConflict: 'review_no'
          });

        if (upsertError) {
          throw upsertError;
        }
        
        recordsProcessed += batch.length;
      }
    }

    // Mark sync complete
    await supabase
      .from('sync_runs')
      .update({ 
        status: 'success', 
        completed_at: new Date().toISOString(),
        records_processed: rows.length,
        new_records: newRows.length
      })
      .eq('id', syncRun.id);

    console.log(`[Sync ${syncRun.id}] Completed successfully`);

    return NextResponse.json({ 
      success: true, 
      syncId: syncRun.id,
      totalRows: rows.length,
      newRecords: newRows.length,
      processed: recordsProcessed 
    });

  } catch (error) {
    console.error('[Sync] Failed:', error);
    
    return NextResponse.json({ 
      error: 'Sync failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function parseCSV(csvText: string) {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row: any = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    // Transform to database format
    const review = {
      review_no: parseInt(row['Review no.'] || '0'),
      rating: parseInt(row['How Did We Do?'] || '0'),
      entry_date: row['Entry Date'],
      agent_name: row['Agent'],
      user_agent: row['User Agent'],
      user_ip: row['User IP'],
      name: row['Name'],
      would_recommend: row['Would You Recommend Us?'] === 'Yes',
      feedback: row['Please provide your feedback below.'],
      wants_response: row['Would you like a response?'] === 'Yes',
      email: row['What is your email?'],
      phone: row['What is your number?'],
      year: parseInt(row['Year'] || '0'),
      month: row['Month'],
      source_url: row['Source Url']
    };
    
    if (review.review_no > 0) {
      rows.push(review);
    }
  }
  
  return rows;
}
```

### Cron Configuration

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/sync-reviews",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

Or use GitHub Actions for cron:

```yaml
# .github/workflows/sync-reviews.yml
name: Sync Reviews
on:
  schedule:
    - cron: '*/15 * * * *' # Every 15 minutes
  workflow_dispatch: # Manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger sync
        run: |
          curl -X POST https://your-app.vercel.app/api/sync-reviews \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

---

## Phase 4: Update Data Service

Update `src/data/dataService.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const isDevelopment = process.env.NODE_ENV === 'development';
const USE_SUPABASE = process.env.NEXT_PUBLIC_USE_SUPABASE === 'true';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface Review {
  id: string;
  review_no: number;
  rating: number;
  entry_date: string;
  agent_name: string;
  name?: string;
  feedback?: string;
  would_recommend?: boolean;
  wants_response?: boolean;
  email?: string;
  phone?: string;
  year: number;
  month: string;
}

export interface ReviewFilters {
  dateRange?: {
    from: Date;
    to: Date;
  };
  agentId?: string;
  rating?: number;
  hasText?: boolean;
}

/**
 * Get reviews with optional filters
 */
export async function getReviews(filters?: ReviewFilters): Promise<Review[]> {
  // Development fallback to cached JSON
  if (isDevelopment && !USE_SUPABASE) {
    const cachedData = await import('./cached-sheets-parsed.json');
    return transformCachedData(cachedData.rows, filters);
  }

  // Query Supabase
  let query = supabase
    .from('reviews')
    .select('*')
    .order('entry_date', { ascending: false });

  // Apply filters
  if (filters?.dateRange) {
    query = query
      .gte('entry_date', filters.dateRange.from.toISOString())
      .lte('entry_date', filters.dateRange.to.toISOString());
  }

  if (filters?.agentId) {
    query = query.eq('agent_name', filters.agentId);
  }

  if (filters?.rating) {
    query = query.eq('rating', filters.rating);
  }

  if (filters?.hasText) {
    query = query.not('feedback', 'is', null).neq('feedback', '');
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
  
  return data as Review[];
}

/**
 * Get agent metrics and statistics
 */
export async function getAgentMetrics(dateRange: { from: Date; to: Date }) {
  if (isDevelopment && !USE_SUPABASE) {
    // Use existing logic for development
    const cachedData = await import('./cached-sheets-parsed.json');
    return calculateMetricsFromCache(cachedData.rows, dateRange);
  }

  // Use Supabase database function for performance
  const { data, error } = await supabase.rpc('calculate_agent_metrics', {
    start_date: dateRange.from.toISOString(),
    end_date: dateRange.to.toISOString()
  });
  
  if (error) {
    console.error('Error calculating metrics:', error);
    throw error;
  }
  
  return data;
}

/**
 * Get list of all agents
 */
export async function getAgents() {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('is_active', true)
    .order('display_name');

  if (error) throw error;
  return data;
}

/**
 * Get recent reviews (for homepage)
 */
export async function getRecentReviews(limit = 10) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('entry_date', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

/**
 * Get review by ID
 */
export async function getReviewById(reviewNo: number) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('review_no', reviewNo)
    .single();

  if (error) throw error;
  return data;
}

// Helper functions for development mode
function transformCachedData(rows: any[], filters?: ReviewFilters) {
  // Existing transformation logic
  // ...
}

function calculateMetricsFromCache(rows: any[], dateRange: any) {
  // Existing metrics calculation
  // ...
}
```

### Create Database Function for Metrics

```sql
-- Function to calculate agent metrics efficiently
CREATE OR REPLACE FUNCTION calculate_agent_metrics(
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ
)
RETURNS TABLE (
  agent_name TEXT,
  total_reviews BIGINT,
  average_rating NUMERIC,
  five_star_count BIGINT,
  four_star_count BIGINT,
  three_star_count BIGINT,
  two_star_count BIGINT,
  one_star_count BIGINT,
  recommend_rate NUMERIC,
  response_requested_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.agent_name,
    COUNT(*)::BIGINT AS total_reviews,
    ROUND(AVG(r.rating)::NUMERIC, 2) AS average_rating,
    COUNT(*) FILTER (WHERE r.rating = 5)::BIGINT AS five_star_count,
    COUNT(*) FILTER (WHERE r.rating = 4)::BIGINT AS four_star_count,
    COUNT(*) FILTER (WHERE r.rating = 3)::BIGINT AS three_star_count,
    COUNT(*) FILTER (WHERE r.rating = 2)::BIGINT AS two_star_count,
    COUNT(*) FILTER (WHERE r.rating = 1)::BIGINT AS one_star_count,
    ROUND(
      (COUNT(*) FILTER (WHERE r.would_recommend = true)::NUMERIC / 
       NULLIF(COUNT(*) FILTER (WHERE r.would_recommend IS NOT NULL), 0)) * 100, 
      2
    ) AS recommend_rate,
    COUNT(*) FILTER (WHERE r.wants_response = true)::BIGINT AS response_requested_count
  FROM reviews r
  WHERE r.entry_date >= start_date 
    AND r.entry_date <= end_date
  GROUP BY r.agent_name
  ORDER BY total_reviews DESC;
END;
$$ LANGUAGE plpgsql;
```

---

## Phase 5: Environment Variables

Update `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Sheets CSV URL (for sync)
GOOGLE_SHEET_CSV_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv

# Sync Security
CRON_SECRET=your-random-secret-key

# Feature Flags
NEXT_PUBLIC_USE_SUPABASE=true  # Toggle between JSON cache and Supabase
```

---

## Phase 6: Testing

### Test Migration

```bash
# 1. Run migration script
npm run migrate:supabase

# 2. Verify data in Supabase dashboard
# - Check reviews table row count
# - Check agents table
# - Verify indexes are created

# 3. Test queries
# Run test queries in Supabase SQL editor:
SELECT COUNT(*) FROM reviews;
SELECT agent_name, COUNT(*) FROM reviews GROUP BY agent_name;
SELECT * FROM reviews ORDER BY entry_date DESC LIMIT 10;
```

### Test Sync Service

```bash
# 1. Test sync endpoint locally
curl -X POST http://localhost:3000/api/sync-reviews \
  -H "Authorization: Bearer your-cron-secret"

# 2. Check sync_runs table
SELECT * FROM sync_runs ORDER BY started_at DESC LIMIT 5;

# 3. Verify new records were added
SELECT COUNT(*) FROM reviews;
```

### Test Data Service

```typescript
// Create test file: src/tests/dataService.test.ts
import { getReviews, getAgentMetrics } from '@/data/dataService';

async function testDataService() {
  // Test 1: Get all reviews
  const reviews = await getReviews();
  console.log(`Total reviews: ${reviews.length}`);

  // Test 2: Filter by date range
  const filtered = await getReviews({
    dateRange: {
      from: new Date('2024-01-01'),
      to: new Date('2024-12-31')
    }
  });
  console.log(`Reviews in 2024: ${filtered.length}`);

  // Test 3: Get metrics
  const metrics = await getAgentMetrics({
    from: new Date('2024-01-01'),
    to: new Date('2024-12-31')
  });
  console.log('Metrics:', metrics);
}

testDataService();
```

---

## Phase 7: Deployment Checklist

### Pre-Deployment

- [ ] Create Supabase project (if not exists)
- [ ] Run SQL schema in Supabase SQL Editor
- [ ] Create database indexes
- [ ] Set up RLS policies
- [ ] Add environment variables to Vercel
- [ ] Test migration script with sample data

### Deployment

- [ ] Run full migration script
- [ ] Verify all data migrated correctly
- [ ] Deploy sync API endpoint
- [ ] Set up cron job (Vercel Cron or GitHub Actions)
- [ ] Update dataService.ts to use Supabase
- [ ] Set `NEXT_PUBLIC_USE_SUPABASE=true`
- [ ] Deploy to Vercel

### Post-Deployment

- [ ] Monitor first sync run
- [ ] Check sync_runs table for errors
- [ ] Verify dashboard displays correct data
- [ ] Test filtering and search
- [ ] Monitor query performance
- [ ] Set up database backups (Supabase auto-backup)

### Rollback Plan

If issues occur:

1. Set `NEXT_PUBLIC_USE_SUPABASE=false` to use JSON cache
2. Redeploy
3. Investigate Supabase issues
4. Fix and re-enable

---

## Cost Analysis

### Supabase Free Tier

- **Database**: 500 MB (current usage: ~1-2 MB)
- **Bandwidth**: 2 GB/month
- **API Requests**: Unlimited
- **Users**: 50,000 MAU

### Estimated Usage

- **Current**: ~1000 reviews = ~1 MB
- **Growth (10x)**: ~10,000 reviews = ~10 MB
- **Growth (100x)**: ~100,000 reviews = ~100 MB

**Verdict**: Well within free tier limits for foreseeable future.

---

## Performance Expectations

### Query Performance

| Operation | JSON File | Supabase | Improvement |
|-----------|-----------|----------|-------------|
| Get all reviews | ~50ms | ~20ms | 2.5x faster |
| Filter by agent | ~50ms | ~5ms | 10x faster |
| Filter by date | ~50ms | ~5ms | 10x faster |
| Calculate metrics | ~100ms | ~10ms | 10x faster |
| Complex aggregations | ~200ms | ~15ms | 13x faster |

### Sync Performance

- **Full sync** (1000 reviews): ~5-10 seconds
- **Incremental sync** (10 new reviews): ~1-2 seconds
- **Cron frequency**: Every 15 minutes (adjustable)

---

## Hybrid Development Approach

Keep both systems during transition:

```typescript
// dataService.ts
const USE_SUPABASE = process.env.NEXT_PUBLIC_USE_SUPABASE === 'true';

export async function getReviews(filters?: ReviewFilters) {
  if (USE_SUPABASE) {
    return getReviewsFromSupabase(filters);
  } else {
    return getReviewsFromJSON(filters);
  }
}
```

**Benefits**:
- Fast local development (JSON cache)
- Production performance (Supabase)
- Easy rollback if needed
- A/B testing capability

---

## Future Enhancements

Once basic migration is complete, consider:

1. **Real-time updates**: Use Supabase Realtime for live dashboard updates
2. **Advanced analytics**: Create materialized views for pre-computed metrics
3. **Data archival**: Move old reviews to separate table for performance
4. **Multi-source sync**: Support multiple Google Sheets or data sources
5. **Webhook integration**: Google Sheets Apps Script → webhook for instant sync
6. **API endpoints**: Expose public API for external integrations
7. **Data exports**: CSV/Excel export functionality from Supabase
8. **Audit logging**: Track all data changes with triggers

---

## Support & Troubleshooting

### Common Issues

**Issue**: Migration fails with "duplicate key" error  
**Solution**: Set `ignoreDuplicates: true` in upsert options

**Issue**: Sync returns 401 Unauthorized  
**Solution**: Check CRON_SECRET matches in both .env and request header

**Issue**: Queries are slow  
**Solution**: Verify indexes are created, run `ANALYZE` on tables

**Issue**: RLS blocks queries  
**Solution**: Check RLS policies allow public read access

### Monitoring

```sql
-- Check recent sync runs
SELECT * FROM sync_runs 
ORDER BY started_at DESC 
LIMIT 10;

-- Check for failed syncs
SELECT * FROM sync_runs 
WHERE status = 'error' 
ORDER BY started_at DESC;

-- Review count by date
SELECT 
  entry_date::DATE as date, 
  COUNT(*) as count 
FROM reviews 
GROUP BY entry_date::DATE 
ORDER BY date DESC 
LIMIT 30;
```

---

## Conclusion

This migration plan provides a complete roadmap for transitioning from JSON cache to Supabase. The phased approach allows for testing at each step and easy rollback if needed.

**Recommended Timeline**:
- **Week 1**: Schema setup + migration script
- **Week 2**: Sync service + testing
- **Week 3**: Update data service + integration testing
- **Week 4**: Production deployment + monitoring

**When ready to proceed, reference this document and implement phase by phase.**

---

## Quick Reference Commands

```bash
# Migration
npm run migrate:supabase

# Test sync
curl -X POST http://localhost:3000/api/sync-reviews -H "Authorization: Bearer $CRON_SECRET"

# Deploy
vercel --prod

# Monitor logs
vercel logs --follow

# Check Supabase
open https://app.supabase.com/project/YOUR_PROJECT_ID
```
