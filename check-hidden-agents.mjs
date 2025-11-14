/**
 * Check what agents are currently marked as hidden
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yncbcjaymepacfyjsoyj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InluY2JjamF5bWVwYWNmeWpzb3lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwODE5NjUsImV4cCI6MjA3ODY1Nzk2NX0.b5mMGy8eb_hDfFCEn6RtP1JNAYvTIFliYc86ku8pUdo'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkHiddenAgents() {
  console.log('🔍 Checking currently hidden agents...\n')
  
  const { data, error } = await supabase
    .from('hidden_agents')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('❌ Error fetching hidden agents:', error)
    return
  }
  
  if (!data || data.length === 0) {
    console.log('✅ No agents are currently hidden')
    return
  }
  
  console.log(`📋 Found ${data.length} hidden agent(s):\n`)
  
  data.forEach((item, index) => {
    console.log(`${index + 1}. Agent ID: "${item.agent_id}"`)
    console.log(`   Hidden at: ${new Date(item.hidden_at).toLocaleString()}`)
    console.log(`   Hidden by: ${item.hidden_by || 'unknown'}`)
    console.log('')
  })
  
  const agentIds = data.map(item => item.agent_id)
  console.log('📝 Agent IDs as array:', agentIds)
  console.log('📝 Agent IDs as Set:', new Set(agentIds))
}

checkHiddenAgents()
