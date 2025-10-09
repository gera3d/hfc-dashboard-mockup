'use client'

import { useState, useMemo, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, Building2, Calendar, Star, TrendingUp } from 'lucide-react'
import KPITiles from '@/components/KPITiles'
import { TimeSeriesChart } from '@/components/Charts'
import { ReviewTable } from '@/components/DataTables'
import { 
  reviews,
  agents,
  departments,
  getDateRanges,
  filterReviewsByDate,
  filterReviewsByAgents,
  calculateMetrics,
  getDailyMetrics,
  DateRange
} from '@/data/dataService'

interface AgentDetailProps {
  params: Promise<{
    id: string
  }>
}

export default function AgentDetail({ params }: AgentDetailProps) {
  const router = useRouter()
  const dateRanges = getDateRanges()
  const { id: agentId } = use(params)
  
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>(dateRanges.thisMonth)
  
  // Find the agent
  const agent = agents.find(a => a.id === agentId)
  const department = departments.find(d => d.id === agent?.department_id)
  
  // Filter reviews for this agent - always call hooks in the same order
  const agentReviews = useMemo(() => {
    if (!agent) return []
    let filtered = filterReviewsByAgents(reviews, [agent.id])
    filtered = filterReviewsByDate(filtered, selectedDateRange)
    return filtered
  }, [agent, selectedDateRange])
  
  // Calculate metrics - always call hooks
  const currentMetrics = calculateMetrics(agentReviews)
  const dailyMetrics = getDailyMetrics(agentReviews, selectedDateRange)
  
  // Calculate comparison data (previous period) - always call hooks
  const comparisonData = useMemo(() => {
    if (!agent) return calculateMetrics([])
    
    const periodLength = selectedDateRange.to.getTime() - selectedDateRange.from.getTime()
    const previousDateRange: DateRange = {
      from: new Date(selectedDateRange.from.getTime() - periodLength),
      to: selectedDateRange.from
    }
    
    let previousFiltered = filterReviewsByAgents(reviews, [agent.id])
    previousFiltered = filterReviewsByDate(previousFiltered, previousDateRange)
    
    return calculateMetrics(previousFiltered)
  }, [agent, selectedDateRange])
  
  // Early return after all hooks are called
  if (!agent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Agent Not Found</h1>
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:text-blue-800"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }
  
  // Get agent's lifetime stats
  const lifetimeReviews = filterReviewsByAgents(reviews, [agent.id])
  const lifetimeMetrics = calculateMetrics(lifetimeReviews)
  
  // Find most recent review
  const latestReview = lifetimeReviews
    .sort((a, b) => new Date(b.review_ts).getTime() - new Date(a.review_ts).getTime())[0]
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </button>
            </div>
            
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-6">
                {/* Agent Avatar */}
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                
                {/* Agent Info */}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{agent.display_name}</h1>
                  <div className="flex items-center gap-4 mt-2 text-gray-600">
                    <div className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      <span>{department?.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{agent.agent_key}</span>
                    </div>
                    {latestReview && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Last review: {new Date(latestReview.review_ts).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Lifetime Stats */}
              <div className="text-right">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{lifetimeMetrics.total}</div>
                    <div className="text-sm text-gray-600">Total Reviews</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-2xl font-bold text-purple-600">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      {lifetimeMetrics.avg_rating.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Avg Rating</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{lifetimeMetrics.percent_5_star.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">5-Star Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Range Selector */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Date Range:</span>
            <div className="flex gap-2">
              {Object.entries(dateRanges).map(([key, range]) => (
                <button
                  key={key}
                  onClick={() => setSelectedDateRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedDateRange.label === range.label
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
            <div className="ml-auto text-sm text-gray-600">
              {agentReviews.length} reviews in selected period
            </div>
          </div>
        </div>
        
        {/* KPI Tiles */}
        <KPITiles 
          metrics={currentMetrics} 
          previousMetrics={comparisonData}
          showComparison={true}
        />
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 mb-8">
          <TimeSeriesChart data={dailyMetrics} />
        </div>
        
        {/* Performance Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-green-800">5-Star Performance</div>
                  <div className="text-xs text-green-600">Above department average</div>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-bold text-green-700">{currentMetrics.percent_5_star.toFixed(1)}%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-blue-800">Review Volume</div>
                  <div className="text-xs text-blue-600">Last {selectedDateRange.label?.toLowerCase()}</div>
                </div>
                <div className="text-sm font-bold text-blue-700">{currentMetrics.total} reviews</div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-purple-800">Average Rating</div>
                  <div className="text-xs text-purple-600">Weighted average</div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-bold text-purple-700">{currentMetrics.avg_rating.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {agentReviews.slice(0, 5).map(review => (
                <div key={review.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className={`w-4 h-4 ${review.rating >= 4 ? 'text-green-500' : review.rating >= 3 ? 'text-yellow-500' : 'text-red-500'} fill-current`} />
                    <span className="text-sm font-medium">{review.rating}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1">
                      {new Date(review.review_ts).toLocaleDateString()} • {review.source}
                    </div>
                    <div className="text-sm text-gray-900">
                      {review.comment ? (review.comment.length > 80 ? review.comment.substring(0, 80) + '...' : review.comment) : 'No comment'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Reviews Table */}
        <ReviewTable data={agentReviews} />
      </div>
    </div>
  )
}