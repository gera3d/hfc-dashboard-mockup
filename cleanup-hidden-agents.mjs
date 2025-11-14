/**
 * Clean up duplicate hidden agents with different cases
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yncbcjaymepacfyjsoyj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InluY2JjamF5bWVwYWNmeWpzb3lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwODE5NjUsImV4cCI6MjA3ODY1Nzk2NX0.b5mMGy8eb_hDfFCEn6RtP1JNAYvTIFliYc86ku8pUdo'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function cleanup() {
  console.log('🧹 Cleaning up hidden agents table...\n')
  
  // Delete all entries (we'll re-hide properly if needed)
  const { error } = await supabase
    .from('hidden_agents')
    .delete()
    .neq('id', 0) // Delete all rows
  
  if (error) {
    console.error('❌ Error cleaning up:', error)
    return
  }
  
  console.log('✅ All hidden agents cleared!')
  console.log('\nYou can now test hiding David again from the UI.')
  console.log('The agent ID will be properly normalized to lowercase.')
}

cleanup()
