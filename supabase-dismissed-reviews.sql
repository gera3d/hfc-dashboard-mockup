-- SQL to create dismissed_reviews table in Supabase
-- Run this in the SQL Editor: https://supabase.com/dashboard/project/yncbcjaymepacfyjsoyj/sql/new

-- Create the dismissed_reviews table
CREATE TABLE IF NOT EXISTS public.dismissed_reviews (
  id BIGSERIAL PRIMARY KEY,
  review_id TEXT NOT NULL UNIQUE,
  dismissed_at TIMESTAMPTZ DEFAULT NOW(),
  dismissed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_dismissed_reviews_review_id ON public.dismissed_reviews(review_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.dismissed_reviews ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access (anyone can see which reviews are dismissed)
CREATE POLICY "Allow public read access" ON public.dismissed_reviews
  FOR SELECT
  USING (true);

-- Create policy to allow public insert (anyone can dismiss a review)
CREATE POLICY "Allow public insert" ON public.dismissed_reviews
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow public delete (anyone can restore a review)
CREATE POLICY "Allow public delete" ON public.dismissed_reviews
  FOR DELETE
  USING (true);

-- Optional: Add a comment
COMMENT ON TABLE public.dismissed_reviews IS 'Stores which problem feedback reviews have been dismissed from the dashboard';
