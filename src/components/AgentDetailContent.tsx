'use client'

import { useState, useMemo, useEffect } from 'react'
import { ArrowLeft, Star, TrendingUp, TrendingDown, Award, AlertTriangle, EyeOff, Eye } from 'lucide-react'
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
import { hideAgent, unhideAgent, isAgentHidden } from '@/lib/supabaseService'

interface AgentDetailContentProps {
  agentId: string | null
  onClose?: () => void
  isModal?: boolean
}

export default function AgentDetailContent({ agentId, onClose, isModal = true }: AgentDetailContentProps) {
  const dateRanges = getDateRanges()
  
  const [reviews, setReviews] = useState<Review[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>(dateRanges.thisMonth)
  const [isHidden, setIsHidden] = useState(false)
  const showBackButton = isModal && typeof onClose === 'function'
  
  // Load data when agentId is set
  useEffect(() => {
    if (!agentId) return
    
    setLoading(true)
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
  }, [agentId])
  
  const agent = agents.find(a => a.id === agentId)
  const department = departments.find(d => d.id === agent?.department_id)
  
  // Check if agent is hidden
  useEffect(() => {
    const checkHidden = async () => {
      if (agent) {
        const hidden = await isAgentHidden(agent.id)
        setIsHidden(hidden)
      }
    }
    checkHidden()
  }, [agent])
  
  const toggleHidden = async () => {
    if (!agent) return
    
    try {
      if (isHidden) {
        const success = await unhideAgent(agent.id)
        if (success) setIsHidden(false)
      } else {
        const success = await hideAgent(agent.id)
        if (success) setIsHidden(true)
      }
    } catch (error) {
      console.error('Error toggling hidden state:', error)
    }
  }
  
  const agentReviews = useMemo(() => {
    if (!agent) return []
    let filtered = filterReviewsByAgents(reviews, [agent.id])
    filtered = filterReviewsByDate(filtered, selectedDateRange)
    return filtered
  }, [agent, selectedDateRange, reviews])
  
  const currentMetrics = calculateMetrics(agentReviews)
  const dailyMetrics = getDailyMetrics(agentReviews, selectedDateRange)
  
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
  
  const lifetimeReviews = useMemo(() => {
    if (!agent) return []
    return filterReviewsByAgents(reviews, [agent.id])
  }, [agent, reviews])
  
  const lifetimeMetrics = calculateMetrics(lifetimeReviews)
  
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
  
  const problemCount = agentReviews.filter(r => r.rating <= 2).length

  if (!agent && !loading) return null

  return (
    <div className="h-full w-full overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100">
      {loading || !agent ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl text-gray-600">Loading agent details...</div>
        </div>
      ) : (
        <div className="min-h-full pb-12">
          {/* Header with Back Button */}
          <div className="bg-gradient-to-r from-[#0066cc] via-[#0077dd] to-[#0066cc] text-white">
            {/* Back Button Row */}
            {showBackButton && (
              <div className="px-4 md:px-6 pt-3 md:pt-4 pb-2">
                <button
                  onClick={onClose}
                  className="inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all font-bold text-sm md:text-base"
                >
                  <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Back to Dashboard</span>
                </button>
              </div>
            )}
            
            {/* Agent Info Section */}
            <div className="px-4 md:px-6 py-4 md:py-6">
              <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
                          <div className="relative">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-white">
                              <img
                                src={agent.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.display_name)}&background=0066cc&color=fff&size=256`}
                                alt={agent.display_name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-[#00ca6f] text-white rounded-full px-2 py-1 text-xs font-bold shadow-lg flex items-center gap-1">
                              <Star className="w-3 h-3 fill-current" />
                              {lifetimeMetrics.avg_rating.toFixed(2)}
                            </div>
                          </div>
                          
                          <div className="flex-1 w-full">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <h2 className="text-2xl md:text-3xl font-bold">{agent.display_name}</h2>
                              <button
                                onClick={toggleHidden}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                                  isHidden 
                                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                                    : 'bg-white/20 hover:bg-white/30 text-white border border-white/40'
                                }`}
                              >
                                {isHidden ? (
                                  <>
                                    <Eye className="w-4 h-4" />
                                    <span>Show</span>
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="w-4 h-4" />
                                    <span>Hide</span>
                                  </>
                                )}
                              </button>
                            </div>
                            
                            <div className="flex items-center gap-3 text-sm text-white/90 mb-4">
                              <span>{department?.name}</span>
                              <span className="text-white/60">•</span>
                              <span className="text-xs md:text-sm">ID: {agent.agent_key}</span>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                              <div className="bg-white rounded-xl p-2 md:p-3 border-2 border-white/50 shadow-xl">
                                <div className="text-xl md:text-2xl font-black tabular-nums text-[#0066cc]">{lifetimeMetrics.total.toLocaleString()}</div>
                                <div className="text-[10px] md:text-xs font-semibold text-gray-600">Total Reviews</div>
                              </div>
                              <div className="bg-white rounded-xl p-2 md:p-3 border-2 border-white/50 shadow-xl">
                                <div className="text-xl md:text-2xl font-black tabular-nums text-[#0066cc]">{lifetimeMetrics.avg_rating.toFixed(2)}</div>
                                <div className="text-[10px] md:text-xs font-semibold text-gray-600">Avg Rating</div>
                              </div>
                              <div className="bg-white rounded-xl p-2 md:p-3 border-2 border-white/50 shadow-xl">
                                <div className="text-xl md:text-2xl font-black tabular-nums text-[#0066cc]">{lifetimeMetrics.percent_5_star.toFixed(0)}%</div>
                                <div className="text-[10px] md:text-xs font-semibold text-gray-600">5-Star Rate</div>
                              </div>
                              <div className="bg-white rounded-xl p-2 md:p-3 border-2 border-white/50 shadow-xl">
                                <div className="text-xl md:text-2xl font-black tabular-nums text-[#0066cc]">{lifetimeReviews.filter(r => r.rating >= 4).length.toLocaleString()}</div>
                                <div className="text-[10px] md:text-xs font-semibold text-gray-600">4-5★ Reviews</div>
                              </div>
                            </div>
                          </div>
                        </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            {/* Date Range Selector */}
            <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200/80 p-3 md:p-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm font-bold text-gray-700">Period:</span>
                  <div className="text-xs md:text-sm font-bold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                    {agentReviews.length} reviews
                  </div>
                </div>
                <div className="grid grid-cols-3 md:flex md:flex-wrap gap-2">
                  {Object.entries(dateRanges).map(([key, range]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedDateRange(range)}
                      className={`px-2 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
                        selectedDateRange.label === range.label
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Metrics Grid - Simplified for modal */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              <div className="bg-white rounded-xl border-2 border-gray-200 p-4 md:p-5">
                <div className="flex items-center justify-between mb-2 md:mb-3">
                  <h3 className="text-xs md:text-sm font-bold text-gray-600">Avg Rating</h3>
                  <Star className="w-5 h-5 md:w-6 md:h-6 text-amber-500 fill-amber-500" />
                </div>
                <div className="text-3xl md:text-4xl font-black text-gray-900">{currentMetrics.avg_rating.toFixed(2)}</div>
              </div>
              
              <div className="bg-white rounded-xl border-2 border-gray-200 p-4 md:p-5">
                <div className="flex items-center justify-between mb-2 md:mb-3">
                  <h3 className="text-xs md:text-sm font-bold text-gray-600">Reviews</h3>
                  <Award className="w-5 h-5 md:w-6 md:h-6 text-indigo-500" />
                </div>
                <div className="text-3xl md:text-4xl font-black text-gray-900">{currentMetrics.total}</div>
              </div>
              
              <div className="bg-white rounded-xl border-2 border-gray-200 p-4 md:p-5">
                <div className="flex items-center justify-between mb-2 md:mb-3">
                  <h3 className="text-xs md:text-sm font-bold text-gray-600">5-Star Rate</h3>
                  <Star className="w-5 h-5 md:w-6 md:h-6 text-green-500 fill-green-500" />
                </div>
                <div className="text-3xl md:text-4xl font-black text-gray-900">{currentMetrics.percent_5_star.toFixed(1)}%</div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200/80 p-4 md:p-6">
              <h3 className="text-base md:text-lg font-black text-gray-900 mb-3 md:mb-4">Performance Trend</h3>
              <TimeSeriesChart data={dailyMetrics} />
            </div>

            {/* Reviews Table */}
            <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200/80 p-4 md:p-6">
              <h3 className="text-base md:text-lg font-black text-gray-900 mb-3 md:mb-4">Recent Reviews</h3>
                        <ReviewTable data={agentReviews.slice(0, 10)} agents={agents} departments={departments} />
                      </div>
                    </div>
                  </div>
                )}
    </div>
  )
}
