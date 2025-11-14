/**
 * Setup script for Supabase hidden_agents table
 * Run with: node setup-supabase.mjs
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yncbcjaymepacfyjsoyj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InluY2JjamF5bWVwYWNmeWpzb3lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwODE5NjUsImV4cCI6MjA3ODY1Nzk2NX0.b5mMGy8eb_hDfFCEn6RtP1JNAYvTIFliYc86ku8pUdo'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('🔧 Setting up Supabase hidden_agents table...\n')

// SQL statements to run
const sqlStatements = [
  {
    name: 'Create table',
    sql: `
      CREATE TABLE IF NOT EXISTS public.hidden_agents (
        id BIGSERIAL PRIMARY KEY,
        agent_id TEXT NOT NULL UNIQUE,
        hidden_at TIMESTAMPTZ DEFAULT NOW(),
        hidden_by TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  },
  {
    name: 'Create index',
    sql: `
      CREATE INDEX IF NOT EXISTS idx_hidden_agents_agent_id 
      ON public.hidden_agents(agent_id);
    `
  },
  {
    name: 'Enable RLS',
    sql: `
      ALTER TABLE public.hidden_agents ENABLE ROW LEVEL SECURITY;
    `
  },
  {
    name: 'Create SELECT policy',
    sql: `
      DROP POLICY IF EXISTS "Allow public read access" ON public.hidden_agents;
      CREATE POLICY "Allow public read access" ON public.hidden_agents
        FOR SELECT USING (true);
    `
  },
  {
    name: 'Create INSERT policy',
    sql: `
      DROP POLICY IF EXISTS "Allow public insert" ON public.hidden_agents;
      CREATE POLICY "Allow public insert" ON public.hidden_agents
        FOR INSERT WITH CHECK (true);
    `
  },
  {
    name: 'Create DELETE policy',
    sql: `
      DROP POLICY IF EXISTS "Allow public delete" ON public.hidden_agents;
      CREATE POLICY "Allow public delete" ON public.hidden_agents
        FOR DELETE USING (true);
    `
  }
]

async function setupTable() {
  console.log('⚠️  NOTE: This script requires ADMIN access to run DDL statements.')
  console.log('⚠️  The anon key cannot create tables - you need to use the service_role key.\n')
  console.log('📋 Here is what needs to be created:\n')
  
  // Print all SQL
  sqlStatements.forEach(({ name, sql }) => {
    console.log(`-- ${name}`)
    console.log(sql.trim())
    console.log('')
  })
  
  console.log('\n📝 To create the table, please:')
  console.log('1. Go to: https://supabase.com/dashboard/project/yncbcjaymepacfyjsoyj/sql/new')
  console.log('2. Copy and paste ALL the SQL above into the editor')
  console.log('3. Click the "RUN" button\n')
  
  // Try to test connection
  console.log('🔍 Testing connection to Supabase...')
  const { data, error } = await supabase
    .from('hidden_agents')
    .select('count')
    .limit(1)
  
  if (error) {
    if (error.message.includes('relation "public.hidden_agents" does not exist')) {
      console.log('❌ Table does not exist yet - please create it using the SQL Editor above')
    } else if (error.message.includes('permission denied')) {
      console.log('❌ Permission denied - this is expected with the anon key')
      console.log('   Please use the SQL Editor in Supabase Dashboard instead')
    } else {
      console.log('❌ Error:', error.message)
    }
  } else {
    console.log('✅ Table exists and is accessible!')
    console.log('✅ Setup complete!')
  }
}

setupTable()
