/**
 * Supabase client configuration
 * 
 * Project: dashbaord (gera3d's Org)
 * Dashboard: https://supabase.com/dashboard/project/yncbcjaymepacfyjsoyj
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yncbcjaymepacfyjsoyj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InluY2JjamF5bWVwYWNmeWpzb3lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwODE5NjUsImV4cCI6MjA3ODY1Nzk2NX0.b5mMGy8eb_hDfFCEn6RtP1JNAYvTIFliYc86ku8pUdo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface HiddenAgent {
  id?: number
  agent_id: string
  hidden_at: string
  hidden_by?: string
}
