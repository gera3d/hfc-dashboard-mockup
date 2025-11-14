/**
 * Test Supabase connection and hidden_agents table
 * Run this to verify everything is set up correctly
 */

import { supabase } from './supabase'

export async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...')
  
  try {
    // Test 1: Check if we can connect
    const { data, error } = await supabase
      .from('hidden_agents')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Supabase connection error:', error)
      if (error.message.includes('relation "public.hidden_agents" does not exist')) {
        console.error('⚠️ The hidden_agents table does not exist!')
        console.log('📋 Please run the SQL from supabase-setup.sql in your Supabase dashboard')
        console.log('🔗 Go to: https://supabase.com/dashboard/project/yncbcjaymepacfyjsoyj/sql/new')
      }
      return { success: false, error }
    }
    
    console.log('✅ Supabase connection successful!')
    console.log('📊 Current hidden agents:', data)
    
    // Test 2: Try to insert a test record
    const testAgentId = 'test-agent-' + Date.now()
    const { data: insertData, error: insertError } = await supabase
      .from('hidden_agents')
      .insert({ agent_id: testAgentId })
      .select()
    
    if (insertError) {
      console.error('❌ Insert test failed:', insertError)
      return { success: false, error: insertError }
    }
    
    console.log('✅ Insert test successful:', insertData)
    
    // Test 3: Try to delete the test record
    const { error: deleteError } = await supabase
      .from('hidden_agents')
      .delete()
      .eq('agent_id', testAgentId)
    
    if (deleteError) {
      console.error('❌ Delete test failed:', deleteError)
      return { success: false, error: deleteError }
    }
    
    console.log('✅ Delete test successful')
    console.log('🎉 All Supabase tests passed!')
    
    return { success: true }
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return { success: false, error }
  }
}

// Auto-run test in development
if (typeof window !== 'undefined') {
  testSupabaseConnection()
}
