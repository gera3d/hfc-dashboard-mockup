'use client'

import { useState, useMemo, use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Star, TrendingUp, TrendingDown, Award, AlertTriangle } from 'lucide-react'
import { TimeSeriesChart } from '@/components/Charts'
import { ReviewTable } from '@/components/DataTables'
import { 
  loadReviews,
  loadAgents,
  loadDepartments,
  getDateRanges,
  filterReviewsByDate,
  filterReviewsByAgents,
  calculateMetrics,
  getDailyMetrics,
  DateRange,
  Review,
  Agent,
  Department
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
  
  const [reviews, setReviews] = useState<Review[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>(dateRanges.thisMonth)
  
  // Load data on mount
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
  
  // Find the agent
  const agent = agents.find(a => a.id === agentId)
  const department = departments.find(d => d.id === agent?.department_id)
  
  // Filter reviews for this agent
  const agentReviews = useMemo(() => {
    if (!agent) return []
    let filtered = filterReviewsByAgents(reviews, [agent.id])
    filtered = filterReviewsByDate(filtered, selectedDateRange)
    return filtered
  }, [agent, selectedDateRange, reviews])
  
  // Calculate metrics
  const currentMetrics = calculateMetrics(agentReviews)
  const dailyMetrics = getDailyMetrics(agentReviews, selectedDateRange)
  
  // Calculate comparison data (previous period)
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
  }, [agent, selectedDateRange, reviews])
  
  // Get agent's lifetime stats
  const lifetimeReviews = useMemo(() => {
    if (!agent) return []
    return filterReviewsByAgents(reviews, [agent.id])
  }, [agent, reviews])
  
  const lifetimeMetrics = calculateMetrics(lifetimeReviews)
  
  // Calculate rating distribution
  const ratingDistribution = useMemo(() => {
    const dist = {
      5: agentReviews.filter(r => r.rating === 5).length,
      4: agentReviews.filter(r => r.rating === 4).length,
      3: agentReviews.filter(r => r.rating === 3).length,
      2: agentReviews.filter(r => r.rating === 2).length,
      1: agentReviews.filter(r => r.rating === 1).length,
    }
    const total = agentReviews.length
    return {
      counts: dist,
      percentages: {
        5: total > 0 ? (dist[5] / total) * 100 : 0,
        4: total > 0 ? (dist[4] / total) * 100 : 0,
        3: total > 0 ? (dist[3] / total) * 100 : 0,
        2: total > 0 ? (dist[2] / total) * 100 : 0,
        1: total > 0 ? (dist[1] / total) * 100 : 0,
      }
    }
  }, [agentReviews])
  
  // Calculate trends
  const trends = useMemo(() => {
    const ratingChange = currentMetrics.avg_rating - comparisonData.avg_rating
    const volumeChange = currentMetrics.total - comparisonData.total
    const fiveStarChange = currentMetrics.percent_5_star - comparisonData.percent_5_star
    
    return {
      rating: { value: ratingChange, isPositive: ratingChange >= 0 },
      volume: { value: volumeChange, isPositive: volumeChange >= 0 },
      fiveStar: { value: fiveStarChange, isPositive: fiveStarChange >= 0 }
    }
  }, [currentMetrics, comparisonData])
  
  // Early return after all hooks
  if (!agent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Agent Not Found</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const problemCount = agentReviews.filter(r => r.rating <= 2).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          
          <div className="flex items-start gap-8">
            {/* Large Agent Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-white">
                <img
                  src={agent.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.display_name)}&background=4F46E5&color=fff&size=256`}
                  alt={agent.display_name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.display_name)}&background=4F46E5&color=fff&size=256`;
                  }}
                />
              </div>
              {/* Lifetime 5-star badge */}
              <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 rounded-full px-3 py-1 text-xs font-bold shadow-lg flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                {lifetimeMetrics.avg_rating.toFixed(2)}
              </div>
            </div>
            
            {/* Agent Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{agent.display_name}</h1>
              <div className="flex items-center gap-4 text-white/90 mb-6">
                <span className="text-lg">{department?.name}</span>
                <span className="text-white/60">•</span>
                <span>ID: {agent.agent_key}</span>
              </div>
              
              {/* Lifetime Stats Row */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-bold">{lifetimeMetrics.total}</div>
                  <div className="text-sm text-white/80">Total Reviews</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-bold">{lifetimeMetrics.avg_rating.toFixed(2)}★</div>
                  <div className="text-sm text-white/80">Lifetime Avg</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-bold">{lifetimeMetrics.percent_5_star.toFixed(0)}%</div>
                  <div className="text-sm text-white/80">5-Star Rate</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-bold">{lifetimeReviews.filter(r => r.rating >= 4).length}</div>
                  <div className="text-sm text-white/80">4-5 Star Reviews</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Range Selector */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-gray-700">Performance Period:</span>
              <div className="flex gap-2">
                {Object.entries(dateRanges).map(([key, range]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedDateRange(range)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedDateRange.label === range.label
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600">
              {agentReviews.length} reviews in selected period
            </div>
          </div>
        </div>
        
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Average Rating Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600 uppercase">Average Rating</h3>
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
            </div>
            <div className="flex items-end gap-2 mb-2">
              <div className="text-4xl font-bold text-gray-900">{currentMetrics.avg_rating.toFixed(2)}</div>
              <div className="text-lg text-gray-400 mb-1">/ 5.00</div>
            </div>
            {trends.rating.value !== 0 && (
              <div className={`flex items-center gap-1 text-sm font-medium ${trends.rating.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trends.rating.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {Math.abs(trends.rating.value).toFixed(2)} vs previous period
              </div>
            )}
          </div>

          {/* Review Volume Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600 uppercase">Review Volume</h3>
              <Award className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex items-end gap-2 mb-2">
              <div className="text-4xl font-bold text-gray-900">{currentMetrics.total}</div>
              <div className="text-lg text-gray-400 mb-1">reviews</div>
            </div>
            {trends.volume.value !== 0 && (
              <div className={`flex items-center gap-1 text-sm font-medium ${trends.volume.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trends.volume.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {Math.abs(trends.volume.value)} vs previous period
              </div>
            )}
          </div>

          {/* 5-Star Rate Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600 uppercase">5-Star Rate</h3>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                ))}
              </div>
            </div>
            <div className="flex items-end gap-2 mb-2">
              <div className="text-4xl font-bold text-gray-900">{currentMetrics.percent_5_star.toFixed(1)}%</div>
            </div>
            {trends.fiveStar.value !== 0 && (
              <div className={`flex items-center gap-1 text-sm font-medium ${trends.fiveStar.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trends.fiveStar.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {Math.abs(trends.fiveStar.value).toFixed(1)}% vs previous period
              </div>
            )}
          </div>
        </div>

        {/* Rating Distribution & Problem Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Rating Distribution */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Rating Distribution</h3>
            <div className="space-y-4">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-4">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm font-medium text-gray-700">{rating}</span>
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  </div>
                  <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        rating === 5 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' :
                        rating === 4 ? 'bg-gradient-to-r from-lime-400 to-lime-500' :
                        rating === 3 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                        rating === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                        'bg-gradient-to-r from-red-400 to-red-600'
                      }`}
                      style={{ width: `${ratingDistribution.percentages[rating as keyof typeof ratingDistribution.percentages]}%` }}
                    />
                  </div>
                  <div className="w-20 text-right">
                    <span className="text-sm font-bold text-gray-900">{ratingDistribution.counts[rating as keyof typeof ratingDistribution.counts]}</span>
                    <span className="text-xs text-gray-500 ml-1">({ratingDistribution.percentages[rating as keyof typeof ratingDistribution.percentages].toFixed(0)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Problem Reviews */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Problem Reviews</h3>
              {problemCount > 0 && (
                <div className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                  <AlertTriangle className="w-4 h-4" />
                  {problemCount}
                </div>
              )}
            </div>
            <div className="space-y-3">
              {problemCount === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Award className="w-12 h-12 mx-auto mb-3 text-green-500" />
                  <p className="font-medium">No problem reviews!</p>
                  <p className="text-sm">Excellent performance in selected period</p>
                </div>
              ) : (
                agentReviews
                  .filter(r => r.rating <= 2)
                  .slice(0, 5)
                  .map(review => (
                    <div key={review.id} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="w-4 h-4 text-red-500 fill-current" />
                          <span className="text-sm font-bold text-red-700">{review.rating}</span>
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-600 mb-1">
                            {new Date(review.review_ts).toLocaleDateString()} • {review.source}
                          </div>
                          <div className="text-sm text-gray-900">
                            {review.comment || 'No comment provided'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Trend</h3>
          <TimeSeriesChart data={dailyMetrics} />
        </div>

        {/* Reviews Table */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">All Reviews</h3>
          <ReviewTable data={agentReviews} agents={agents} departments={departments} />
        </div>
      </div>
    </div>
  )
}