/**
 * Quick test to verify hiding/unhiding agents works
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yncbcjaymepacfyjsoyj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InluY2JjamF5bWVwYWNmeWpzb3lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwODE5NjUsImV4cCI6MjA3ODY1Nzk2NX0.b5mMGy8eb_hDfFCEn6RtP1JNAYvTIFliYc86ku8pUdo'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testHideAgent() {
  console.log('🧪 Testing hide/unhide functionality...\n')
  
  // Test 1: Get current hidden agents
  console.log('1️⃣ Fetching current hidden agents...')
  const { data: currentHidden, error: fetchError } = await supabase
    .from('hidden_agents')
    .select('*')
  
  if (fetchError) {
    console.error('❌ Error fetching:', fetchError)
    return
  }
  
  console.log('✅ Current hidden agents:', currentHidden)
  console.log('')
  
  // Test 2: Try to hide "David"
  console.log('2️⃣ Hiding agent "David"...')
  const { data: hideData, error: hideError } = await supabase
    .from('hidden_agents')
    .insert({
      agent_id: 'David',
      hidden_by: 'test-script'
    })
    .select()
  
  if (hideError) {
    if (hideError.code === '23505') {
      console.log('⚠️  David is already hidden (this is fine)')
    } else {
      console.error('❌ Error hiding:', hideError)
      return
    }
  } else {
    console.log('✅ Successfully hid David:', hideData)
  }
  console.log('')
  
  // Test 3: Verify David is hidden
  console.log('3️⃣ Checking if David is hidden...')
  const { data: checkData, error: checkError } = await supabase
    .from('hidden_agents')
    .select('*')
    .eq('agent_id', 'David')
    .single()
  
  if (checkError && checkError.code !== 'PGRST116') {
    console.error('❌ Error checking:', checkError)
  } else if (checkData) {
    console.log('✅ Confirmed David is hidden:', checkData)
  } else {
    console.log('❌ David is NOT hidden!')
  }
  console.log('')
  
  // Test 4: Get all hidden agents again
  console.log('4️⃣ Fetching all hidden agents...')
  const { data: allHidden, error: allError } = await supabase
    .from('hidden_agents')
    .select('agent_id')
  
  if (allError) {
    console.error('❌ Error fetching:', allError)
  } else {
    const hiddenIds = allHidden?.map(h => h.agent_id) || []
    console.log('✅ Hidden agent IDs:', hiddenIds)
  }
  console.log('')
  
  console.log('✅ Test complete! Check the results above.')
  console.log('\nTo unhide David, run:')
  console.log('  DELETE FROM hidden_agents WHERE agent_id = \'David\';')
}

testHideAgent()
