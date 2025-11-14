-- SQL to create department management tables in Supabase
-- Run this in the SQL Editor: https://supabase.com/dashboard/project/yncbcjaymepacfyjsoyj/sql/new

-- ============================================
-- Table 1: Custom Departments
-- ============================================
-- Stores user-created custom departments
CREATE TABLE IF NOT EXISTS public.custom_departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_custom_departments_name ON public.custom_departments(name);

-- Enable Row Level Security (RLS)
ALTER TABLE public.custom_departments ENABLE ROW LEVEL SECURITY;

-- Create policies for custom_departments
CREATE POLICY "Allow public read access" ON public.custom_departments
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert" ON public.custom_departments
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update" ON public.custom_departments
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete" ON public.custom_departments
  FOR DELETE
  USING (true);

-- Add comment
COMMENT ON TABLE public.custom_departments IS 'Stores custom departments created by users';

-- ============================================
-- Table 2: Agent Department Assignments
-- ============================================
-- Stores overrides for agent-to-department assignments
CREATE TABLE IF NOT EXISTS public.agent_department_assignments (
  id BIGSERIAL PRIMARY KEY,
  agent_id TEXT NOT NULL UNIQUE,
  department_id TEXT NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_agent_dept_assignments_agent_id ON public.agent_department_assignments(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_dept_assignments_dept_id ON public.agent_department_assignments(department_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.agent_department_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for agent_department_assignments
CREATE POLICY "Allow public read access" ON public.agent_department_assignments
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert" ON public.agent_department_assignments
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update" ON public.agent_department_assignments
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete" ON public.agent_department_assignments
  FOR DELETE
  USING (true);

-- Add comment
COMMENT ON TABLE public.agent_department_assignments IS 'Stores department assignment overrides for agents';

-- ============================================
-- Function: Update timestamp on row update
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to auto-update updated_at
CREATE TRIGGER update_custom_departments_updated_at
  BEFORE UPDATE ON public.custom_departments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_dept_assignments_updated_at
  BEFORE UPDATE ON public.agent_department_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Verification Queries
-- ============================================
-- Run these after creating tables to verify setup:

-- Check custom_departments table
-- SELECT * FROM public.custom_departments;

-- Check agent_department_assignments table
-- SELECT * FROM public.agent_department_assignments;

-- View all policies
-- SELECT * FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('custom_departments', 'agent_department_assignments');
