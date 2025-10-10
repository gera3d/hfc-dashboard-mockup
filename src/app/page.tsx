'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import GlobalFilters from '@/components/GlobalFilters'
import KPITiles from '@/components/KPITiles'
import { TimeSeriesChart, AgentLeaderboard } from '@/components/Charts'
import { AgentTable, ReviewTable, CustomerFeedbackTable } from '@/components/DataTables'
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
  DateRange,
  Review,
  Agent,
  Department
} from '@/data/dataService'
import { syncFromGoogleSheets } from '@/data/googleSheetsService'

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
        setReviews(reviewsData)
        setAgents(agentsData)
        setDepartments(departmentsData)
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
      setReviews(reviewsData)
      setAgents(agentsData)
      setDepartments(departmentsData)
      setLastRefresh(new Date())
      console.log('Data refreshed from local cache')
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
  
  const handleAgentClick = (agentId: string) => {
    // In a real app, this would navigate to the agent detail page
    router.push(`/agent/${agentId}`)
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
        </div>
      </div>
      
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
          <span className="text-sm text-[#6B7C93]">Data visualization</span>
        </div>
        
        {/* Charts - Clean cards with minimal styling */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <TimeSeriesChart data={dailyMetrics} />
          <AgentLeaderboard data={agentMetrics} />
        </div>
        
        {/* Section Title */}
        <div className="flex items-baseline justify-between mt-12 mb-6">
          <h2 className="text-xl tracking-tight font-semibold text-[#0A2540]">Detailed Reports</h2>
          <span className="text-sm text-[#6B7C93]">Tabular data</span>
        </div>
        
        {/* Data Tables - Stripe clean tables with proper spacing */}
        <AgentTable data={agentMetrics} onAgentClick={handleAgentClick} />
        <ReviewTable data={filteredData} agents={agents} departments={departments} />
        <CustomerFeedbackTable data={filteredData} agents={agents} departments={departments} />
      </div>
    </div>
  )
}
