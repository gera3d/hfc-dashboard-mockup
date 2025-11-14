/**
 * API Route to set up the hidden_agents table in Supabase
 * Access this at: /api/setup-supabase
 */

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('🔧 Setting up hidden_agents table in Supabase...')
    
    // Create the table using raw SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create the hidden_agents table
        CREATE TABLE IF NOT EXISTS public.hidden_agents (
          id BIGSERIAL PRIMARY KEY,
          agent_id TEXT NOT NULL UNIQUE,
          hidden_at TIMESTAMPTZ DEFAULT NOW(),
          hidden_by TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Add index for faster lookups
        CREATE INDEX IF NOT EXISTS idx_hidden_agents_agent_id ON public.hidden_agents(agent_id);

        -- Enable Row Level Security (RLS)
        ALTER TABLE public.hidden_agents ENABLE ROW LEVEL SECURITY;

        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Allow public read access" ON public.hidden_agents;
        DROP POLICY IF EXISTS "Allow public insert" ON public.hidden_agents;
        DROP POLICY IF EXISTS "Allow public delete" ON public.hidden_agents;

        -- Create policy to allow public read access
        CREATE POLICY "Allow public read access" ON public.hidden_agents
          FOR SELECT
          USING (true);

        -- Create policy to allow public insert
        CREATE POLICY "Allow public insert" ON public.hidden_agents
          FOR INSERT
          WITH CHECK (true);

        -- Create policy to allow public delete
        CREATE POLICY "Allow public delete" ON public.hidden_agents
          FOR DELETE
          USING (true);
      `
    })

    if (error) {
      console.error('❌ Error creating table:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        hint: 'The exec_sql function might not exist. You need to create the table manually in Supabase SQL Editor.'
      }, { status: 500 })
    }

    // Test if table was created by querying it
    const { data: testData, error: testError } = await supabase
      .from('hidden_agents')
      .select('*')
      .limit(1)

    if (testError) {
      console.error('❌ Table verification failed:', testError)
      return NextResponse.json({
        success: false,
        error: testError.message,
        message: 'Table creation may have failed. Please create it manually.'
      }, { status: 500 })
    }

    console.log('✅ Table setup complete!')
    return NextResponse.json({
      success: true,
      message: 'hidden_agents table created successfully!',
      data: testData
    })

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
      message: 'Please create the table manually using the SQL Editor in Supabase Dashboard'
    }, { status: 500 })
  }
}
