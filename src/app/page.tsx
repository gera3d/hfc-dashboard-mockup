'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import GlobalFilters from '@/components/GlobalFilters'
import KPITiles from '@/components/KPITiles'
import { 
  SatisfactionTrend,
  AgentLeaderboard,
  DepartmentComparison,
  ProblemSpotlight
} from '@/components/Charts'
import { AgentTable, ReviewTable, CustomerFeedbackTable } from '@/components/DataTables'
import { AgentDepartmentManager } from '@/components/AgentDepartmentManager'
import { 
  loadReviews,
  loadAgents,
  loadDepartments,
  refreshReviews,
  refreshAgents,
  refreshDepartments,
  getDateRanges,
  filterReviewsByDate,
  filterReviewsByDepartments,
  filterReviewsByAgents,
  calculateMetrics,
  getAgentMetrics,
  getDailyMetrics,
  updateAgentDepartment,
  DateRange,
  Review,
  Agent,
  Department
} from '@/data/dataService'
import { syncFromGoogleSheets } from '@/data/googleSheetsService'
import {
  applyAgentOverrides,
  mergeDepartments,
  saveAgentDepartment,
  saveCustomDepartment,
  clearAllOverrides,
  getChangeCount
} from '@/lib/localStorage'

interface Filters {
  dateRange: DateRange
  selectedDepartments: string[]
  selectedAgents: string[]
  selectedSources: string[]
  compareMode: boolean
}

export default function Dashboard() {
  const router = useRouter()
  const dateRanges = getDateRanges()
  
  const [reviews, setReviews] = useState<Review[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [showAgentManager, setShowAgentManager] = useState(false)
  
  const [filters, setFilters] = useState<Filters>({
    dateRange: dateRanges.last7Days,
    selectedDepartments: [],
    selectedAgents: [],
    selectedSources: [],
    compareMode: false
  })
  
  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [reviewsData, agentsData, departmentsData] = await Promise.all([
          loadReviews(),
          loadAgents(),
          loadDepartments()
        ])
        
        // Apply localStorage overrides to preserve user changes
        const agentsWithOverrides = applyAgentOverrides(agentsData)
        const departmentsWithCustom = mergeDepartments(departmentsData)
        
        // Update reviews to match agent department changes
        const updatedReviews = reviewsData.map(review => {
          const agent = agentsWithOverrides.find(a => a.id === review.agent_id)
          if (agent && agent.department_id !== review.department_id) {
            return { ...review, department_id: agent.department_id }
          }
          return review
        })
        
        setReviews(updatedReviews)
        setAgents(agentsWithOverrides)
        setDepartments(departmentsWithCustom)
        
        const changeCount = getChangeCount()
        if (changeCount.agentChanges > 0 || changeCount.customDepartments > 0) {
          console.log(`✅ Restored ${changeCount.agentChanges} agent assignments and ${changeCount.customDepartments} custom departments from localStorage`)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])
  
  // Refresh data from local cache (fast)
  const refreshData = async () => {
    setLoading(true)
    try {
      const [reviewsData, agentsData, departmentsData] = await Promise.all([
        refreshReviews(),
        refreshAgents(),
        refreshDepartments()
      ])
      
      // Apply localStorage overrides to preserve user changes
      const agentsWithOverrides = applyAgentOverrides(agentsData)
      const departmentsWithCustom = mergeDepartments(departmentsData)
      
      // Update reviews to match agent department changes
      const updatedReviews = reviewsData.map(review => {
        const agent = agentsWithOverrides.find(a => a.id === review.agent_id)
        if (agent && agent.department_id !== review.department_id) {
          return { ...review, department_id: agent.department_id }
        }
        return review
      })
      
      setReviews(updatedReviews)
      setAgents(agentsWithOverrides)
      setDepartments(departmentsWithCustom)
      setLastRefresh(new Date())
      console.log('Data refreshed from local cache (with localStorage overrides)')
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // Sync from Google Sheets (slow, updates local cache)
  const syncData = async () => {
    setSyncing(true)
    try {
      const result = await syncFromGoogleSheets()
      if (result.success) {
        // After successful sync, reload the data from the updated cache
        await refreshData()
        alert(`✅ Data synced successfully!\n\nLast updated: ${result.lastUpdated}\n\nThe dashboard now shows the latest data from Google Sheets.`)
      } else {
        alert(`❌ Sync failed: ${result.message}`)
      }
    } catch (error) {
      console.error('Error syncing data:', error)
      alert('❌ Failed to sync data from Google Sheets')
    } finally {
      setSyncing(false)
    }
  }
  
  // Filter reviews based on current filters
  const filteredData = useMemo(() => {
    let filtered = reviews
    filtered = filterReviewsByDate(filtered, filters.dateRange)
    filtered = filterReviewsByDepartments(filtered, filters.selectedDepartments)
    filtered = filterReviewsByAgents(filtered, filters.selectedAgents)
    
    if (filters.selectedSources.length > 0) {
      filtered = filtered.filter(review => filters.selectedSources.includes(review.source))
    }
    
    return filtered
  }, [filters, reviews])
  
  // Calculate comparison data (previous period)
  const comparisonData = useMemo(() => {
    if (!filters.compareMode) return null
    
    const periodLength = filters.dateRange.to.getTime() - filters.dateRange.from.getTime()
    const previousDateRange: DateRange = {
      from: new Date(filters.dateRange.from.getTime() - periodLength),
      to: filters.dateRange.from
    }
    
    let previousFiltered = reviews
    previousFiltered = filterReviewsByDate(previousFiltered, previousDateRange)
    previousFiltered = filterReviewsByDepartments(previousFiltered, filters.selectedDepartments)
    previousFiltered = filterReviewsByAgents(previousFiltered, filters.selectedAgents)
    
    if (filters.selectedSources.length > 0) {
      previousFiltered = previousFiltered.filter(review => filters.selectedSources.includes(review.source))
    }
    
    return calculateMetrics(previousFiltered)
  }, [filters, reviews])
  
  // Calculate metrics
  const currentMetrics = calculateMetrics(filteredData)
  const agentMetrics = getAgentMetrics(filteredData, agents, departments)
  const dailyMetrics = getDailyMetrics(filteredData, filters.dateRange)
  
  // Calculate satisfaction trend data
  const satisfactionTrendData = useMemo(() => {
    return dailyMetrics
      .filter(day => day.total > 0) // Only include days with reviews
      .map(day => {
        const satisfactionScore = ((day.star_5 + day.star_4) / day.total) * 100
        const avgRating = (day.star_5 * 5 + day.star_4 * 4 + day.star_3 * 3 + day.star_2 * 2 + day.star_1 * 1) / day.total
        return {
          date: day.date,
          satisfaction_score: satisfactionScore,
          avg_rating: avgRating,
          total: day.total
        }
      })
  }, [dailyMetrics])
  
  const handleAgentClick = (agentId: string) => {
    // In a real app, this would navigate to the agent detail page
    router.push(`/agent/${agentId}`)
  }
  
  const handleAgentDepartmentUpdate = async (agentId: string, departmentId: string) => {
    try {
      // Save to localStorage FIRST for persistence
      saveAgentDepartment(agentId, departmentId)
      
      // Update local state immediately for responsive UI
      setAgents(prevAgents => 
        prevAgents.map(agent => 
          agent.id === agentId 
            ? { ...agent, department_id: departmentId }
            : agent
        )
      )
      
      // Also update reviews to reflect the new department
      setReviews(prevReviews =>
        prevReviews.map(review =>
          review.agent_id === agentId
            ? { ...review, department_id: departmentId }
            : review
        )
      )
      
      // Attempt to sync with backend (currently just logs)
      const result = await updateAgentDepartment(agentId, departmentId)
      
      // Show appropriate message
      const agent = agents.find(a => a.id === agentId)
      const dept = departments.find(d => d.id === departmentId)
      
      if (agent && dept) {
        console.log(`✅ ${agent.display_name} moved to ${dept.name} (saved to localStorage)`)
      }
    } catch (error) {
      console.error('Error updating agent department:', error)
      alert('❌ Failed to update agent department')
    }
  }
  
  const handleCreateDepartment = async (departmentName: string): Promise<string> => {
    try {
      // Generate a new department ID
      const newDeptId = `dept-${Date.now()}`
      
      // Add to local state
      const newDepartment = {
        id: newDeptId,
        name: departmentName
      }
      
      // Save to localStorage FIRST
      saveCustomDepartment(newDepartment)
      
      setDepartments(prev => [...prev, newDepartment])
      
      // Show success message
      console.log(`✅ Department "${departmentName}" created and saved to localStorage`)
      
      return newDeptId
    } catch (error) {
      console.error('Error creating department:', error)
      throw error
    }
  }
  
  // Clear local changes and reload from Google Sheets
  const handleClearLocalChanges = async () => {
    const changeCount = getChangeCount()
    const message = `This will reset ${changeCount.agentChanges} agent assignments and ${changeCount.customDepartments} custom departments back to what's in your Google Sheet.\n\nAre you sure?`
    
    if (confirm(message)) {
      clearAllOverrides()
      await refreshData()
      alert('✅ Local changes cleared. Data reloaded from Google Sheets.')
    }
  }
  
  // Get filter summary for display
  const getFilterSummary = () => {
    const parts = []
    if (filters.selectedDepartments.length > 0) {
      parts.push(`${filters.selectedDepartments.length} department${filters.selectedDepartments.length > 1 ? 's' : ''}`)
    }
    if (filters.selectedAgents.length > 0) {
      parts.push(`${filters.selectedAgents.length} agent${filters.selectedAgents.length > 1 ? 's' : ''}`)
    }
    if (filters.selectedSources.length > 0) {
      parts.push(`${filters.selectedSources.length} source${filters.selectedSources.length > 1 ? 's' : ''}`)
    }
    
    return parts.length > 0 ? ` (${parts.join(', ')})` : ''
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-[#00CA6F]"></div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-white">
      {/* Header - Stripe-style clean white header with subtle bottom border */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl tracking-tight font-bold stripe-heading">
                  HFC Reviews Dashboard
                </h1>
                <p className="mt-1 text-sm text-[#6B7C93]">
                  Track customer reviews and agent performance across departments
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right px-4 py-2 rounded-md border border-gray-200">
                  <div className="text-sm font-medium text-[#0A2540]">
                    {filters.dateRange.label || 'Custom Range'}{getFilterSummary()}
                  </div>
                  <div className="text-xs text-[#6B7C93] mt-1 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#00CA6F] rounded-full"></div>
                    <span className="font-mono">{filteredData.length}</span> reviews • Updated {lastRefresh.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    <button
                      onClick={refreshData}
                      disabled={loading || syncing}
                      className="ml-4 px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-1"
                      title="Reload from local cache (fast)"
                    >
                      {loading ? (
                        <>
                          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                          Loading...
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Refresh
                        </>
                      )}
                    </button>
                    <button
                      onClick={syncData}
                      disabled={loading || syncing}
                      className="px-3 py-1 text-xs bg-[#635BFF] text-white rounded-md hover:bg-[#5a52e8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-1"
                      title="Sync from Google Sheets (slow, updates local copy)"
                    >
                      {syncing ? (
                        <>
                          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                          Syncing...
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          Sync from Sheets
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setShowAgentManager(!showAgentManager)}
                      className="px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center gap-1"
                      title="Manage agent department assignments"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {showAgentManager ? 'Hide' : 'Manage'} Agents
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content - Stripe-inspired clean white background with subtle gray sections */}
      <div className="bg-[#F6F9FC] pb-12">
        <div className="max-w-6xl mx-auto px-6 sm:px-6 lg:px-8 py-6">
          {/* Global Filters - Stripe-style compact filters with subtle borders */}
          <GlobalFilters filters={filters} onFiltersChange={setFilters} />
          
          {/* Local Changes Indicator */}
          {(() => {
            const changeCount = getChangeCount()
            const totalChanges = changeCount.agentChanges + changeCount.customDepartments
            if (totalChanges > 0) {
              return (
                <div className="mt-4 p-3 bg-amber-50 border-l-4 border-amber-400 rounded flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-amber-900">
                        💾 {totalChanges} Local Change{totalChanges > 1 ? 's' : ''} Saved
                      </p>
                      <p className="text-xs text-amber-700">
                        {changeCount.agentChanges} agent assignment{changeCount.agentChanges !== 1 ? 's' : ''}, 
                        {' '}{changeCount.customDepartments} custom department{changeCount.customDepartments !== 1 ? 's' : ''}
                        {' '}• These survive page refreshes but need Google Sheets sync for permanence
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClearLocalChanges}
                    className="px-3 py-1 text-xs font-medium text-amber-700 bg-amber-100 rounded hover:bg-amber-200 transition-colors"
                  >
                    Reset to Sheets
                  </button>
                </div>
              )
            }
            return null
          })()}
        </div>
      </div>
      
      {/* Agent Department Manager - Collapsible Section */}
      {showAgentManager && (
        <div className="max-w-6xl mx-auto px-6 sm:px-6 lg:px-8 mb-8">
          <AgentDepartmentManager
            agents={agents}
            departments={departments}
            onUpdate={handleAgentDepartmentUpdate}
          />
        </div>
      )}
      
      <div className="max-w-6xl mx-auto px-6 sm:px-6 lg:px-8 -mt-8">
        {/* KPI Tiles - Stripe card style with sharp corners and subtle shadows */}
        <KPITiles 
          metrics={currentMetrics} 
          previousMetrics={comparisonData}
          showComparison={filters.compareMode}
        />
        
        {/* Section Title - Stripe uses clear section titles */}
        <div className="flex items-baseline justify-between mt-12 mb-6">
          <h2 className="text-xl tracking-tight font-semibold text-[#0A2540]">Performance Insights</h2>
          <span className="text-sm text-[#6B7C93]">Strategic business metrics</span>
        </div>
        
        {/* Charts - Strategic 4-chart layout for insurance agency */}
        {/* Row 1: Satisfaction Trend - Most important metric */}
        <div className="mb-6">
          <SatisfactionTrend data={satisfactionTrendData} />
        </div>
        
        {/* Row 2: Agent Performance & Department Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <AgentLeaderboard data={agentMetrics} limit={10} />
          <DepartmentComparison reviews={filteredData} departments={departments} />
        </div>
        
        {/* Row 3: Problem Spotlight - Critical for insurance compliance */}
        <div className="mb-12">
          <ProblemSpotlight reviews={filteredData} departments={departments} />
        </div>
        
        {/* Section Title */}
        <div className="flex items-baseline justify-between mt-12 mb-6">
          <h2 className="text-xl tracking-tight font-semibold text-[#0A2540]">Detailed Reports</h2>
          <span className="text-sm text-[#6B7C93]">Tabular data</span>
        </div>
        
        {/* Data Tables - Stripe clean tables with proper spacing */}
        <div className="space-y-8">
          <AgentTable 
            data={agentMetrics} 
            onAgentClick={handleAgentClick}
            departments={departments}
            onDepartmentChange={handleAgentDepartmentUpdate}
            onCreateDepartment={handleCreateDepartment}
          />
          <ReviewTable data={filteredData} agents={agents} departments={departments} />
          <CustomerFeedbackTable data={filteredData} agents={agents} departments={departments} />
        </div>
      </div>
    </div>
  )
}
