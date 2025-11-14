/**
 * Migration utility to move department data from localStorage to Supabase
 * Run this once to migrate existing data
 */

import { 
  getAgentDepartmentOverrides, 
  getCustomDepartments as getLocalCustomDepartments 
} from './localStorage'
import { 
  createCustomDepartment, 
  assignAgentToDepartment,
  getCustomDepartments as getSupabaseCustomDepartments,
  getAgentDepartmentAssignments
} from './supabaseService'

export interface MigrationResult {
  success: boolean
  customDepartmentsMigrated: number
  agentAssignmentsMigrated: number
  errors: string[]
}

/**
 * Migrate all department data from localStorage to Supabase
 */
export const migrateDepartmentDataToSupabase = async (userId?: string): Promise<MigrationResult> => {
  const result: MigrationResult = {
    success: true,
    customDepartmentsMigrated: 0,
    agentAssignmentsMigrated: 0,
    errors: []
  }

  console.log('🔄 Starting migration from localStorage to Supabase...')

  try {
    // Step 1: Migrate custom departments
    const localCustomDepts = getLocalCustomDepartments()
    console.log(`📦 Found ${localCustomDepts.length} custom departments in localStorage`)

    if (localCustomDepts.length > 0) {
      // Check which departments already exist in Supabase
      const existingDepts = await getSupabaseCustomDepartments()
      const existingIds = new Set(existingDepts.map(d => d.id))

      for (const dept of localCustomDepts) {
        if (existingIds.has(dept.id)) {
          console.log(`⏭️  Custom department "${dept.name}" already exists in Supabase, skipping`)
          continue
        }

        const success = await createCustomDepartment(dept.id, dept.name, userId)
        if (success) {
          result.customDepartmentsMigrated++
        } else {
          result.errors.push(`Failed to migrate custom department: ${dept.name}`)
        }
      }
    }

    // Step 2: Migrate agent department assignments
    const localAssignments = getAgentDepartmentOverrides()
    const assignmentCount = Object.keys(localAssignments).length
    console.log(`📦 Found ${assignmentCount} agent assignments in localStorage`)

    if (assignmentCount > 0) {
      // Check which assignments already exist in Supabase
      const existingAssignments = await getAgentDepartmentAssignments()

      for (const [agentId, override] of Object.entries(localAssignments)) {
        if (existingAssignments[agentId] === override.departmentId) {
          console.log(`⏭️  Agent assignment for ${agentId} already exists in Supabase, skipping`)
          continue
        }

        const success = await assignAgentToDepartment(
          agentId, 
          override.departmentId, 
          userId
        )
        if (success) {
          result.agentAssignmentsMigrated++
        } else {
          result.errors.push(`Failed to migrate agent assignment: ${agentId}`)
        }
      }
    }

    // Step 3: Summary
    console.log('✅ Migration complete!')
    console.log(`   - Custom departments migrated: ${result.customDepartmentsMigrated}/${localCustomDepts.length}`)
    console.log(`   - Agent assignments migrated: ${result.agentAssignmentsMigrated}/${assignmentCount}`)
    
    if (result.errors.length > 0) {
      console.warn(`⚠️  Encountered ${result.errors.length} errors during migration:`)
      result.errors.forEach(err => console.warn(`   - ${err}`))
      result.success = false
    }

    return result

  } catch (error) {
    console.error('❌ Migration failed:', error)
    result.success = false
    result.errors.push(error instanceof Error ? error.message : 'Unknown error')
    return result
  }
}

/**
 * Check if migration is needed (has localStorage data but not in Supabase)
 */
export const checkMigrationNeeded = async (): Promise<{
  needed: boolean
  localCustomDepts: number
  localAssignments: number
  supabaseCustomDepts: number
  supabaseAssignments: number
}> => {
  try {
    const localCustomDepts = getLocalCustomDepartments()
    const localAssignments = getAgentDepartmentOverrides()
    const supabaseCustomDepts = await getSupabaseCustomDepartments()
    const supabaseAssignments = await getAgentDepartmentAssignments()

    const hasLocalData = localCustomDepts.length > 0 || Object.keys(localAssignments).length > 0
    const hasSupabaseData = supabaseCustomDepts.length > 0 || Object.keys(supabaseAssignments).length > 0

    return {
      needed: hasLocalData && !hasSupabaseData,
      localCustomDepts: localCustomDepts.length,
      localAssignments: Object.keys(localAssignments).length,
      supabaseCustomDepts: supabaseCustomDepts.length,
      supabaseAssignments: Object.keys(supabaseAssignments).length
    }
  } catch (error) {
    console.error('Error checking migration status:', error)
    return {
      needed: false,
      localCustomDepts: 0,
      localAssignments: 0,
      supabaseCustomDepts: 0,
      supabaseAssignments: 0
    }
  }
}

/**
 * Display a migration prompt to the user
 */
export const getMigrationPromptMessage = async (): Promise<string | null> => {
  const status = await checkMigrationNeeded()
  
  if (!status.needed) {
    return null
  }

  let message = '📦 Migration Available: You have department data saved locally.\n\n'
  
  if (status.localCustomDepts > 0) {
    message += `• ${status.localCustomDepts} custom department${status.localCustomDepts > 1 ? 's' : ''}\n`
  }
  
  if (status.localAssignments > 0) {
    message += `• ${status.localAssignments} agent assignment${status.localAssignments > 1 ? 's' : ''}\n`
  }
  
  message += '\nWould you like to migrate this data to Supabase for permanent storage and cross-device sync?'
  
  return message
}
