'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import GlobalFilters from '@/components/GlobalFilters'
import KPITiles from '@/components/KPITiles'
import { 
  SatisfactionTrend,
  DepartmentComparison,
  ProblemSpotlight
} from '@/components/Charts'
import { AgentLeaderboard } from '@/components/AgentLeaderboard'
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
    dateRange: dateRanges.thisYear, // Changed to show all data for the year
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
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header - Dark mode header matching shadcn */}
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-2xl font-semibold text-foreground">
                  HFC Reviews Dashboard
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Track customer reviews and agent performance across departments
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right px-4 py-2 rounded-lg border bg-card">
                  <div className="text-sm font-medium text-card-foreground">
                    {filters.dateRange.label || 'Custom Range'}{getFilterSummary()}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span className="font-mono">{filteredData.length}</span> reviews • Updated {lastRefresh.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
                <Button
                  onClick={refreshData}
                  disabled={loading || syncing}
                  title="Reload from local cache (fast)"
                  className="gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </>
                  )}
                </Button>
                <Button
                  onClick={syncData}
                  disabled={loading || syncing}
                  variant="outline"
                  title="Sync from Google Sheets (slow, updates local copy)"
                  className="gap-2"
                >
                  {syncing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      Syncing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Sync
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setShowAgentManager(!showAgentManager)}
                  variant="outline"
                  title="Manage agent department assignments"
                  className="gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {showAgentManager ? 'Hide' : 'Manage'} Agents
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content - Dark mode background */}
      <div className="bg-background pb-12">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Global Filters - Clean compact filters */}
          <GlobalFilters filters={filters} onFiltersChange={setFilters} />
          
          {/* Local Changes Indicator */}
          {(() => {
            const changeCount = getChangeCount()
            const totalChanges = changeCount.agentChanges + changeCount.customDepartments
            if (totalChanges > 0) {
              return (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-amber-900">
                        {totalChanges} Local Change{totalChanges > 1 ? 's' : ''} Saved
                      </p>
                      <p className="text-xs text-amber-700 mt-0.5">
                        {changeCount.agentChanges} agent assignment{changeCount.agentChanges !== 1 ? 's' : ''}, 
                        {' '}{changeCount.customDepartments} custom department{changeCount.customDepartments !== 1 ? 's' : ''}
                        {' '}• These survive page refreshes but need Google Sheets sync for permanence
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClearLocalChanges}
                    className="px-4 py-2 text-sm font-medium text-amber-700 bg-white border border-amber-300 rounded-md hover:bg-amber-50 transition-all shadow-sm"
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
        <div className="max-w-7xl mx-auto px-6 mb-6">
          <AgentDepartmentManager
            agents={agents}
            departments={departments}
            onUpdate={handleAgentDepartmentUpdate}
          />
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {/* Container for responsive stat cards */}
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            {/* KPI Tiles - Beautiful stat cards with gradients */}
            <KPITiles 
              metrics={currentMetrics} 
              previousMetrics={comparisonData}
              showComparison={filters.compareMode}
            />
          </div>
        </div>
        
        {/* Agent Performance Rankings - Your original podium design with personality */}
        <div className="mb-6">
          <AgentLeaderboard data={agentMetrics} limit={10} />
        </div>
        
        {/* Section Title - Clear hierarchy */}
        <div className="mt-12 mb-6">
          <h2 className="text-lg font-semibold text-foreground">Performance Insights</h2>
          <p className="text-sm text-muted-foreground mt-1">Strategic business metrics</p>
        </div>
        
        {/* Charts - Strategic 3-chart layout for insurance agency */}
        {/* Row 1: Satisfaction Trend - Most important metric */}
        <div className="mb-6">
          <SatisfactionTrend data={satisfactionTrendData} />
        </div>
        
        {/* Row 2: Department Comparison & Problem Spotlight */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <DepartmentComparison reviews={filteredData} departments={departments} />
          <ProblemSpotlight reviews={filteredData} departments={departments} />
        </div>
        
        {/* Section Title */}
        <div className="mt-12 mb-6">
          <h2 className="text-lg font-semibold text-foreground">Detailed Reports</h2>
          <p className="text-sm text-muted-foreground mt-1">Tabular data</p>
        </div>
        
        {/* Data Tables - Clean tables with proper spacing */}
        <div className="space-y-6">
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
