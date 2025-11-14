/**
 * localStorage utilities for persisting department assignments and custom departments
 * This ensures user changes survive page refreshes and data syncs
 */

import { Agent, Department } from '@/data/dataService'

const STORAGE_KEYS = {
  AGENT_DEPARTMENTS: 'hfc_agent_departments',
  CUSTOM_DEPARTMENTS: 'hfc_custom_departments',
  LAST_UPDATE: 'hfc_last_update',
  HIDDEN_AGENTS: 'hfc_hidden_agents'
}

export interface AgentDepartmentOverride {
  agentId: string
  departmentId: string
  timestamp: string
}

export interface CustomDepartment {
  id: string
  name: string
  createdAt: string
}

/**
 * Save an agent's department assignment to localStorage
 */
export const saveAgentDepartment = (agentId: string, departmentId: string) => {
  try {
    const overrides = getAgentDepartmentOverrides()
    overrides[agentId] = {
      agentId,
      departmentId,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem(STORAGE_KEYS.AGENT_DEPARTMENTS, JSON.stringify(overrides))
    localStorage.setItem(STORAGE_KEYS.LAST_UPDATE, new Date().toISOString())
    console.log(`💾 Saved ${agentId} → ${departmentId} to localStorage`)
  } catch (error) {
    console.error('Failed to save to localStorage:', error)
  }
}

/**
 * Get all agent department overrides from localStorage
 */
export const getAgentDepartmentOverrides = (): Record<string, AgentDepartmentOverride> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.AGENT_DEPARTMENTS)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.error('Failed to read from localStorage:', error)
    return {}
  }
}

/**
 * Save a custom department to localStorage
 */
export const saveCustomDepartment = (department: Department) => {
  try {
    const customDepts = getCustomDepartments()
    const customDept: CustomDepartment = {
      id: department.id,
      name: department.name,
      createdAt: new Date().toISOString()
    }
    customDepts.push(customDept)
    localStorage.setItem(STORAGE_KEYS.CUSTOM_DEPARTMENTS, JSON.stringify(customDepts))
    console.log(`💾 Saved custom department "${department.name}" to localStorage`)
  } catch (error) {
    console.error('Failed to save custom department:', error)
  }
}

/**
 * Get all custom departments from localStorage
 */
export const getCustomDepartments = (): CustomDepartment[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_DEPARTMENTS)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Failed to read custom departments:', error)
    return []
  }
}

/**
 * Apply localStorage overrides to agents array
 */
export const applyAgentOverrides = (agents: Agent[]): Agent[] => {
  const overrides = getAgentDepartmentOverrides()
  
  if (Object.keys(overrides).length === 0) {
    return agents
  }
  
  console.log(`📝 Applying ${Object.keys(overrides).length} agent department overrides from localStorage`)
  
  return agents.map(agent => {
    const override = overrides[agent.id]
    if (override) {
      return {
        ...agent,
        department_id: override.departmentId
      }
    }
    return agent
  })
}

/**
 * Merge custom departments with standard departments
 */
export const mergeDepartments = (standardDepts: Department[]): Department[] => {
  const customDepts = getCustomDepartments()
  
  if (customDepts.length === 0) {
    return standardDepts
  }
  
  console.log(`📝 Adding ${customDepts.length} custom departments from localStorage`)
  
  // Convert custom departments to Department format
  const customDepartments: Department[] = customDepts.map(cd => ({
    id: cd.id,
    name: cd.name
  }))
  
  // Merge, avoiding duplicates
  const existingIds = new Set(standardDepts.map(d => d.id))
  const newCustomDepts = customDepartments.filter(cd => !existingIds.has(cd.id))
  
  return [...standardDepts, ...newCustomDepts]
}

/**
 * Get the last update timestamp
 */
export const getLastUpdateTime = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.LAST_UPDATE)
}

/**
 * Clear all local overrides (reset to Google Sheets data)
 */
export const clearAllOverrides = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.AGENT_DEPARTMENTS)
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_DEPARTMENTS)
    localStorage.removeItem(STORAGE_KEYS.LAST_UPDATE)
    localStorage.removeItem(STORAGE_KEYS.HIDDEN_AGENTS)
    console.log('🗑️ Cleared all localStorage overrides')
  } catch (error) {
    console.error('Failed to clear localStorage:', error)
  }
}

/**
 * Get count of local changes
 */
export const getChangeCount = (): { agentChanges: number; customDepartments: number } => {
  return {
    agentChanges: Object.keys(getAgentDepartmentOverrides()).length,
    customDepartments: getCustomDepartments().length
  }
}

/**
 * Export all changes as JSON (for manual Google Sheets update)
 */
export const exportChanges = () => {
  const overrides = getAgentDepartmentOverrides()
  const customDepts = getCustomDepartments()
  
  return {
    agentDepartments: Object.values(overrides),
    customDepartments: customDepts,
    exportedAt: new Date().toISOString()
  }
}

/**
 * Get list of hidden agent IDs from localStorage
 */
export const getHiddenAgents = (): string[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.HIDDEN_AGENTS)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Failed to read hidden agents:', error)
    return []
  }
}

/**
 * Hide an agent by adding to hidden list
 */
export const hideAgent = (agentId: string) => {
  try {
    const hidden = getHiddenAgents()
    if (!hidden.includes(agentId)) {
      hidden.push(agentId)
      localStorage.setItem(STORAGE_KEYS.HIDDEN_AGENTS, JSON.stringify(hidden))
      console.log(`👁️ Hidden agent: ${agentId}`)
    }
  } catch (error) {
    console.error('Failed to hide agent:', error)
  }
}

/**
 * Unhide an agent by removing from hidden list
 */
export const unhideAgent = (agentId: string) => {
  try {
    const hidden = getHiddenAgents()
    const filtered = hidden.filter(id => id !== agentId)
    localStorage.setItem(STORAGE_KEYS.HIDDEN_AGENTS, JSON.stringify(filtered))
    console.log(`👁️ Unhidden agent: ${agentId}`)
  } catch (error) {
    console.error('Failed to unhide agent:', error)
  }
}

/**
 * Check if an agent is hidden
 */
export const isAgentHidden = (agentId: string): boolean => {
  const hidden = getHiddenAgents()
  return hidden.includes(agentId)
}

/**
 * Filter out hidden agents from an array
 */
export const filterHiddenAgents = <T extends { agent_id: string }>(items: T[]): T[] => {
  const hidden = getHiddenAgents()
  if (hidden.length === 0) return items
  return items.filter(item => !hidden.includes(item.agent_id))
}
