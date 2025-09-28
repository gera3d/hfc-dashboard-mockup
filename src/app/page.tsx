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
                    <span className="font-mono">{filteredData.length}</span> reviews • Updated {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
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
        <ReviewTable data={filteredData} />
      </div>
    </div>
  )
}
