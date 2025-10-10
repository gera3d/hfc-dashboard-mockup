'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SectionCards } from "@/components/section-cards"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
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

export default function DashboardV2() {
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
    dateRange: dateRanges.thisYear,
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
        
        const agentsWithOverrides = applyAgentOverrides(agentsData)
        const departmentsWithCustom = mergeDepartments(departmentsData)
        
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
  
  // Refresh data from local cache
  const refreshData = async () => {
    setLoading(true)
    try {
      const [reviewsData, agentsData, departmentsData] = await Promise.all([
        refreshReviews(),
        refreshAgents(),
        refreshDepartments()
      ])
      
      const agentsWithOverrides = applyAgentOverrides(agentsData)
      const departmentsWithCustom = mergeDepartments(departmentsData)
      
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
      console.log('Data refreshed from local cache')
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // Sync from Google Sheets
  const handleSync = async () => {
    setSyncing(true)
    try {
      await syncFromGoogleSheets()
      await refreshData()
      console.log('✅ Data synced from Google Sheets')
    } catch (error) {
      console.error('Error syncing from Google Sheets:', error)
      alert('❌ Failed to sync from Google Sheets. Check console for details.')
    } finally {
      setSyncing(false)
    }
  }
  
  // Filter data
  const filteredData = useMemo(() => {
    let filtered = reviews
    filtered = filterReviewsByDate(filtered, filters.dateRange)
    if (filters.selectedDepartments.length > 0) {
      filtered = filterReviewsByDepartments(filtered, filters.selectedDepartments)
    }
    if (filters.selectedAgents.length > 0) {
      filtered = filterReviewsByAgents(filtered, filters.selectedAgents)
    }
    if (filters.selectedSources.length > 0) {
      filtered = filtered.filter(review => filters.selectedSources.includes(review.source))
    }
    return filtered
  }, [filters, reviews])
  
  // Comparison data
  const comparisonData = useMemo(() => {
    if (!filters.compareMode) return null
    
    const previousRange = filters.dateRange.label === 'This year' 
      ? dateRanges.lastYear 
      : dateRanges.thisYear
    
    let previousFiltered = filterReviewsByDate(reviews, previousRange)
    if (filters.selectedDepartments.length > 0) {
      previousFiltered = filterReviewsByDepartments(previousFiltered, filters.selectedDepartments)
    }
    if (filters.selectedAgents.length > 0) {
      previousFiltered = filterReviewsByAgents(previousFiltered, filters.selectedAgents)
    }
    if (filters.selectedSources.length > 0) {
      previousFiltered = previousFiltered.filter(review => filters.selectedSources.includes(review.source))
    }
    
    return calculateMetrics(previousFiltered)
  }, [filters, reviews, dateRanges])
  
  // Calculate metrics
  const currentMetrics = calculateMetrics(filteredData)
  const agentMetrics = getAgentMetrics(filteredData, agents, departments)
  const dailyMetrics = getDailyMetrics(filteredData, filters.dateRange)
  
  // Satisfaction trend data
  const satisfactionTrendData = useMemo(() => {
    return dailyMetrics
      .filter(day => day.total > 0)
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
    router.push(`/agent/${agentId}`)
  }
  
  const handleAgentDepartmentUpdate = async (agentId: string, departmentId: string) => {
    try {
      saveAgentDepartment(agentId, departmentId)
      
      setAgents(prevAgents => 
        prevAgents.map(agent => 
          agent.id === agentId 
            ? { ...agent, department_id: departmentId }
            : agent
        )
      )
      
      setReviews(prevReviews =>
        prevReviews.map(review =>
          review.agent_id === agentId
            ? { ...review, department_id: departmentId }
            : review
        )
      )
      
      await updateAgentDepartment(agentId, departmentId)
      
      const agent = agents.find(a => a.id === agentId)
      const dept = departments.find(d => d.id === departmentId)
      
      if (agent && dept) {
        console.log(`✅ ${agent.display_name} moved to ${dept.name}`)
      }
    } catch (error) {
      console.error('Error updating agent department:', error)
    }
  }
  
  const handleCreateDepartment = async (departmentName: string): Promise<string> => {
    try {
      const newDeptId = `dept-${Date.now()}`
      const newDepartment = {
        id: newDeptId,
        name: departmentName
      }
      
      saveCustomDepartment(newDepartment)
      setDepartments(prev => [...prev, newDepartment])
      
      console.log(`✅ Department "${departmentName}" created`)
      return newDeptId
    } catch (error) {
      console.error('Error creating department:', error)
      throw error
    }
  }
  
  const handleClearLocalChanges = async () => {
    const changeCount = getChangeCount()
    const message = `This will reset ${changeCount.agentChanges} agent assignments and ${changeCount.customDepartments} custom departments. Are you sure?`
    
    if (confirm(message)) {
      clearAllOverrides()
      await refreshData()
      console.log('✅ Local changes cleared')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg font-medium">Loading dashboard...</div>
          <div className="text-sm text-muted-foreground mt-2">Please wait</div>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        
        {/* Main Content */}
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              
              {/* Filters */}
              <div className="px-4 lg:px-6">
                <GlobalFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  dateRanges={dateRanges}
                  departments={departments}
                  agents={agents}
                  reviewCount={filteredData.length}
                  lastRefresh={lastRefresh}
                  onRefresh={refreshData}
                  onSync={handleSync}
                  syncing={syncing}
                  onManageAgents={() => setShowAgentManager(!showAgentManager)}
                />
              </div>

              {/* Local Changes Warning */}
              {(() => {
                const changeCount = getChangeCount()
                const hasChanges = changeCount.agentChanges > 0 || changeCount.customDepartments > 0
                
                if (hasChanges) {
                  return (
                    <div className="px-4 lg:px-6">
                      <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
                        <div>
                          <p className="font-medium text-yellow-900 dark:text-yellow-100">
                            {changeCount.agentChanges + changeCount.customDepartments} Local Changes Saved
                          </p>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            {changeCount.agentChanges} agent assignments, {changeCount.customDepartments} custom departments
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleClearLocalChanges}
                          className="border-yellow-300 dark:border-yellow-800"
                        >
                          Reset to Sheets
                        </Button>
                      </div>
                    </div>
                  )
                }
                return null
              })()}

              {/* Agent Manager */}
              {showAgentManager && (
                <div className="px-4 lg:px-6">
                  <AgentDepartmentManager
                    agents={agents}
                    departments={departments}
                    onUpdate={handleAgentDepartmentUpdate}
                  />
                </div>
              )}

              {/* KPI Cards - Shadcn Style */}
              <div className="px-4 lg:px-6">
                <KPITiles 
                  metrics={currentMetrics} 
                  previousMetrics={comparisonData}
                  showComparison={filters.compareMode}
                />
              </div>

              {/* Agent Leaderboard */}
              <div className="px-4 lg:px-6">
                <AgentLeaderboard data={agentMetrics} limit={10} />
              </div>

              {/* Charts Section */}
              <div className="px-4 lg:px-6">
                <h3 className="text-lg font-semibold mb-4">Performance Insights</h3>
                <div className="space-y-6">
                  <SatisfactionTrend data={satisfactionTrendData} />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <DepartmentComparison reviews={filteredData} departments={departments} />
                    <ProblemSpotlight reviews={filteredData} departments={departments} />
                  </div>
                </div>
              </div>

              {/* Data Tables */}
              <div className="px-4 lg:px-6">
                <h3 className="text-lg font-semibold mb-4">Detailed Reports</h3>
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
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
