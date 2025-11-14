/**
 * Supabase service for managing hidden agents
 * This replaces localStorage for cross-user persistence
 */

import { supabase } from './supabase'

/**
 * Get list of hidden agent IDs from Supabase
 */
export const getHiddenAgents = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('hidden_agents')
      .select('agent_id')
    
    if (error) {
      console.error('Error fetching hidden agents:', error)
      return []
    }
    
    return data?.map(item => item.agent_id) || []
  } catch (error) {
    console.error('Failed to get hidden agents:', error)
    return []
  }
}

/**
 * Hide an agent by adding to Supabase
 * Agent IDs are normalized to lowercase to match data service
 */
export const hideAgent = async (agentId: string, hiddenBy?: string): Promise<boolean> => {
  try {
    // Normalize agent ID to lowercase to match data service
    const normalizedId = agentId.toLowerCase();
    
    const { error } = await supabase
      .from('hidden_agents')
      .insert({
        agent_id: normalizedId,
        hidden_by: hiddenBy
      })
    
    if (error) {
      // If agent is already hidden, this is fine
      if (error.code === '23505') { // Unique constraint violation
        console.log(`Agent ${normalizedId} is already hidden`)
        return true
      }
      console.error('Error hiding agent:', error)
      return false
    }
    
    console.log(`👁️ Hidden agent: ${normalizedId}`)
    return true
  } catch (error) {
    console.error('Failed to hide agent:', error)
    return false
  }
}

/**
 * Unhide an agent by removing from Supabase
 * Agent IDs are normalized to lowercase to match data service
 */
export const unhideAgent = async (agentId: string): Promise<boolean> => {
  try {
    // Normalize agent ID to lowercase to match data service
    const normalizedId = agentId.toLowerCase();
    
    const { error } = await supabase
      .from('hidden_agents')
      .delete()
      .eq('agent_id', normalizedId)
    
    if (error) {
      console.error('Error unhiding agent:', error)
      return false
    }
    
    console.log(`👁️ Unhidden agent: ${normalizedId}`)
    return true
  } catch (error) {
    console.error('Failed to unhide agent:', error)
    return false
  }
}

/**
 * Check if an agent is hidden
 * Agent IDs are normalized to lowercase to match data service
 */
export const isAgentHidden = async (agentId: string): Promise<boolean> => {
  try {
    // Normalize agent ID to lowercase to match data service
    const normalizedId = agentId.toLowerCase();
    
    const { data, error } = await supabase
      .from('hidden_agents')
      .select('agent_id')
      .eq('agent_id', normalizedId)
      .single()
    
    if (error) {
      // Not found is expected for non-hidden agents
      if (error.code === 'PGRST116') {
        return false
      }
      console.error('Error checking if agent is hidden:', error)
      return false
    }
    
    return !!data
  } catch (error) {
    console.error('Failed to check if agent is hidden:', error)
    return false
  }
}

/**
 * Filter out hidden agents from an array (async version)
 */
export const filterHiddenAgents = async <T extends { agent_id: string }>(items: T[]): Promise<T[]> => {
  try {
    const hiddenAgentIds = await getHiddenAgents()
    if (hiddenAgentIds.length === 0) return items
    
    const hiddenSet = new Set(hiddenAgentIds)
    return items.filter(item => !hiddenSet.has(item.agent_id))
  } catch (error) {
    console.error('Failed to filter hidden agents:', error)
    return items
  }
}

/**
 * Subscribe to changes in hidden agents (real-time updates)
 */
export const subscribeToHiddenAgents = (callback: (agentIds: string[]) => void) => {
  const channel = supabase
    .channel('hidden-agents-changes')
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'hidden_agents'
      },
      async (payload) => {
        console.log('Hidden agents changed:', payload)
        const hiddenAgents = await getHiddenAgents()
        callback(hiddenAgents)
      }
    )
    .subscribe()
  
  return () => {
    supabase.removeChannel(channel)
  }
}
