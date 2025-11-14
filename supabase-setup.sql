-- SQL to create hidden_agents table in Supabase
-- Run this in the SQL Editor: https://supabase.com/dashboard/project/yncbcjaymepacfyjsoyj/sql/new

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

-- Create policy to allow public read access (anyone can see which agents are hidden)
CREATE POLICY "Allow public read access" ON public.hidden_agents
  FOR SELECT
  USING (true);

-- Create policy to allow public insert (anyone can hide an agent)
CREATE POLICY "Allow public insert" ON public.hidden_agents
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow public delete (anyone can unhide an agent)
CREATE POLICY "Allow public delete" ON public.hidden_agents
  FOR DELETE
  USING (true);

-- Optional: Add a comment
COMMENT ON TABLE public.hidden_agents IS 'Stores which agents are hidden from the dashboard';
