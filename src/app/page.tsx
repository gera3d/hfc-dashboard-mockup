'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import GlobalFilters from '@/components/GlobalFilters'
import KPITiles from '@/components/KPITiles'
import { TimeSeriesChart, AgentLeaderboard } from '@/components/Charts'
import { AgentTable, ReviewTable } from '@/components/DataTables'
import { 
  reviews,
  getDateRanges,
  filterReviewsByDate,
  filterReviewsByDepartments,
  filterReviewsByAgents,
  calculateMetrics,
  getAgentMetrics,
  getDailyMetrics,
  DateRange
} from '@/data/dataService'

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
  
  const [filters, setFilters] = useState<Filters>({
    dateRange: dateRanges.last7Days,
    selectedDepartments: [],
    selectedAgents: [],
    selectedSources: [],
    compareMode: false
  })
  
  // Calculate filtered data
  const filteredData = useMemo(() => {
    let filtered = reviews
    
    // Apply filters
    filtered = filterReviewsByDate(filtered, filters.dateRange)
    filtered = filterReviewsByDepartments(filtered, filters.selectedDepartments)
    filtered = filterReviewsByAgents(filtered, filters.selectedAgents)
    
    if (filters.selectedSources.length > 0) {
      filtered = filtered.filter(review => filters.selectedSources.includes(review.source))
    }
    
    return filtered
  }, [filters])
  
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
  }, [filters])
  
  // Calculate metrics
  const currentMetrics = calculateMetrics(filteredData)
  const agentMetrics = getAgentMetrics(filteredData)
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
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">HFC Reviews Dashboard</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Track customer reviews and agent performance across departments
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {filters.dateRange.label || 'Custom Range'}{getFilterSummary()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {filteredData.length} reviews • Last updated: {new Date().toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Global Filters */}
        <GlobalFilters filters={filters} onFiltersChange={setFilters} />
        
        {/* KPI Tiles */}
        <KPITiles 
          metrics={currentMetrics} 
          previousMetrics={comparisonData}
          showComparison={filters.compareMode}
        />
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <TimeSeriesChart data={dailyMetrics} />
          <AgentLeaderboard data={agentMetrics} />
        </div>
        
        {/* Data Tables */}
        <AgentTable data={agentMetrics} onAgentClick={handleAgentClick} />
        <ReviewTable data={filteredData} />
      </div>
    </div>
  )
}
