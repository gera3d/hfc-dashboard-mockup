/**
 * Supabase service for managing hidden agents and department assignments
 * This replaces localStorage for cross-user persistence
 */

import { supabase } from './supabase'
import { Department, Agent } from '@/data/dataService'

// ============================================
// Types
// ============================================

export interface AgentDepartmentAssignment {
  id?: number
  agent_id: string
  department_id: string
  assigned_at?: string
  assigned_by?: string
  updated_at?: string
}

export interface CustomDepartment {
  id: string
  name: string
  created_at?: string
  created_by?: string
  updated_at?: string
}

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

// ============================================
// DEPARTMENT MANAGEMENT
// ============================================

/**
 * Get all custom departments from Supabase
 */
export const getCustomDepartments = async (): Promise<CustomDepartment[]> => {
  try {
    const { data, error } = await supabase
      .from('custom_departments')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error('Error fetching custom departments:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Failed to get custom departments:', error)
    return []
  }
}

/**
 * Create a new custom department in Supabase
 */
export const createCustomDepartment = async (
  id: string, 
  name: string, 
  createdBy?: string
): Promise<boolean> => {
  try {
    console.log(`🏢 Attempting to create custom department: "${name}" (ID: ${id})`)
    
    const { data, error } = await supabase
      .from('custom_departments')
      .insert({
        id,
        name,
        created_by: createdBy
      })
      .select()
    
    if (error) {
      // If department already exists, this is fine
      if (error.code === '23505') { // Unique constraint violation
        console.log(`⚠️ Custom department "${name}" already exists`)
        return true
      }
      
      // Check if table doesn't exist
      if (error.code === '42P01') {
        console.error(`❌ Table 'custom_departments' does not exist!`)
        console.error(`Please run the SQL migration: supabase-departments-setup.sql`)
        console.error(`Visit: https://supabase.com/dashboard/project/yncbcjaymepacfyjsoyj/sql/new`)
      }
      
      console.error('❌ Error creating custom department:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      return false
    }
    
    console.log(`✅ Created custom department: ${name}`, data)
    return true
  } catch (error) {
    console.error('❌ Failed to create custom department:', error)
    return false
  }
}

/**
 * Delete a custom department from Supabase
 */
export const deleteCustomDepartment = async (departmentId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('custom_departments')
      .delete()
      .eq('id', departmentId)
    
    if (error) {
      console.error('Error deleting custom department:', error)
      return false
    }
    
    console.log(`🗑️ Deleted custom department: ${departmentId}`)
    return true
  } catch (error) {
    console.error('Failed to delete custom department:', error)
    return false
  }
}

/**
 * Update a custom department name
 */
export const updateCustomDepartment = async (
  departmentId: string, 
  name: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('custom_departments')
      .update({ name })
      .eq('id', departmentId)
    
    if (error) {
      console.error('Error updating custom department:', error)
      return false
    }
    
    console.log(`✏️ Updated custom department: ${departmentId} → ${name}`)
    return true
  } catch (error) {
    console.error('Failed to update custom department:', error)
    return false
  }
}

// ============================================
// AGENT DEPARTMENT ASSIGNMENTS
// ============================================

/**
 * Get all agent department assignments from Supabase
 */
export const getAgentDepartmentAssignments = async (): Promise<Record<string, string>> => {
  try {
    const { data, error } = await supabase
      .from('agent_department_assignments')
      .select('agent_id, department_id')
    
    if (error) {
      console.error('Error fetching agent department assignments:', error)
      return {}
    }
    
    // Convert array to map of agent_id -> department_id
    const assignments: Record<string, string> = {}
    data?.forEach(item => {
      assignments[item.agent_id] = item.department_id
    })
    
    return assignments
  } catch (error) {
    console.error('Failed to get agent department assignments:', error)
    return {}
  }
}

/**
 * Assign an agent to a department (or update existing assignment)
 */
export const assignAgentToDepartment = async (
  agentId: string,
  departmentId: string,
  assignedBy?: string
): Promise<boolean> => {
  try {
    console.log(`👤 Attempting to assign agent ${agentId} to department ${departmentId}`)
    
    const { data, error } = await supabase
      .from('agent_department_assignments')
      .upsert({
        agent_id: agentId,
        department_id: departmentId,
        assigned_by: assignedBy
      }, {
        onConflict: 'agent_id'
      })
      .select()
    
    if (error) {
      // Check if table doesn't exist
      if (error.code === '42P01') {
        console.error(`❌ Table 'agent_department_assignments' does not exist!`)
        console.error(`Please run the SQL migration: supabase-departments-setup.sql`)
        console.error(`Visit: https://supabase.com/dashboard/project/yncbcjaymepacfyjsoyj/sql/new`)
      }
      
      console.error('❌ Error assigning agent to department:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      return false
    }
    
    console.log(`✅ Assigned agent ${agentId} to department ${departmentId}`, data)
    return true
  } catch (error) {
    console.error('❌ Failed to assign agent to department:', error)
    return false
  }
}

/**
 * Remove an agent's department assignment (revert to default)
 */
export const removeAgentDepartmentAssignment = async (agentId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('agent_department_assignments')
      .delete()
      .eq('agent_id', agentId)
    
    if (error) {
      console.error('Error removing agent department assignment:', error)
      return false
    }
    
    console.log(`🔄 Removed department assignment for agent ${agentId}`)
    return true
  } catch (error) {
    console.error('Failed to remove agent department assignment:', error)
    return false
  }
}

/**
 * Clear all agent department assignments
 */
export const clearAllAgentAssignments = async (): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('agent_department_assignments')
      .delete()
      .neq('id', 0) // Delete all rows
    
    if (error) {
      console.error('Error clearing all agent assignments:', error)
      return false
    }
    
    console.log(`🗑️ Cleared all agent department assignments`)
    return true
  } catch (error) {
    console.error('Failed to clear all agent assignments:', error)
    return false
  }
}

/**
 * Clear all custom departments
 */
export const clearAllCustomDepartments = async (): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('custom_departments')
      .delete()
      .neq('id', '') // Delete all rows
    
    if (error) {
      console.error('Error clearing all custom departments:', error)
      return false
    }
    
    console.log(`🗑️ Cleared all custom departments`)
    return true
  } catch (error) {
    console.error('Failed to clear all custom departments:', error)
    return false
  }
}

/**
 * Apply Supabase department assignments to agents array
 */
export const applyAgentDepartmentAssignments = async (agents: Agent[]): Promise<Agent[]> => {
  try {
    const assignments = await getAgentDepartmentAssignments()
    
    if (Object.keys(assignments).length === 0) {
      return agents
    }
    
    console.log(`📝 Applying ${Object.keys(assignments).length} agent department assignments from Supabase`)
    
    return agents.map(agent => {
      const assignedDeptId = assignments[agent.id]
      if (assignedDeptId) {
        return {
          ...agent,
          department_id: assignedDeptId
        }
      }
      return agent
    })
  } catch (error) {
    console.error('Failed to apply agent department assignments:', error)
    return agents
  }
}

/**
 * Merge custom departments from Supabase with standard departments
 */
export const mergeCustomDepartments = async (standardDepts: Department[]): Promise<Department[]> => {
  try {
    const customDepts = await getCustomDepartments()
    
    if (customDepts.length === 0) {
      return standardDepts
    }
    
    console.log(`📝 Adding ${customDepts.length} custom departments from Supabase`)
    
    // Convert custom departments to Department format
    const customDepartments: Department[] = customDepts.map(cd => ({
      id: cd.id,
      name: cd.name
    }))
    
    // Merge, avoiding duplicates
    const existingIds = new Set(standardDepts.map(d => d.id))
    const newCustomDepts = customDepartments.filter(cd => !existingIds.has(cd.id))
    
    return [...standardDepts, ...newCustomDepts]
  } catch (error) {
    console.error('Failed to merge custom departments:', error)
    return standardDepts
  }
}

/**
 * Subscribe to department changes (real-time updates)
 */
export const subscribeToDepartmentChanges = (callback: () => void) => {
  const customDeptChannel = supabase
    .channel('department-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'custom_departments'
      },
      () => {
        console.log('Custom departments changed')
        callback()
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'agent_department_assignments'
      },
      () => {
        console.log('Agent department assignments changed')
        callback()
      }
    )
    .subscribe()
  
  return () => {
    supabase.removeChannel(customDeptChannel)
  }
}

