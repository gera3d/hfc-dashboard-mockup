'use client'

import { useState, useMemo, use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  const [isHidden, setIsHidden] = useState(false)
  
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
    
    console.log('🔄 Toggling hidden state for agent:', agent.id, 'Current state:', isHidden)
    
    try {
      if (isHidden) {
        const success = await unhideAgent(agent.id)
        console.log('✅ Unhide result:', success)
        if (success) {
          setIsHidden(false)
          alert('Agent is now visible on the dashboard')
        } else {
          alert('Failed to unhide agent. Check console for errors.')
        }
      } else {
        const success = await hideAgent(agent.id)
        console.log('✅ Hide result:', success)
        if (success) {
          setIsHidden(true)
          alert('Agent is now hidden from the dashboard')
        } else {
          alert('Failed to hide agent. Check console for errors.')
        }
      }
    } catch (error) {
      console.error('❌ Error toggling hidden state:', error)
      alert('Error: ' + (error as Error).message)
    }
  }
  
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
      <div className="bg-gradient-to-r from-[#0066cc] via-[#0077dd] to-[#0066cc] text-white">
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
                  src={agent.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.display_name)}&background=0066cc&color=fff&size=256`}
                  alt={agent.display_name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.display_name)}&background=0066cc&color=fff&size=256`;
                  }}
                />
              </div>
              {/* Lifetime 5-star badge */}
              <div className="absolute -bottom-2 -right-2 bg-[#00ca6f] text-white rounded-full px-3 py-1 text-xs font-bold shadow-lg flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                {lifetimeMetrics.avg_rating.toFixed(2)}
              </div>
            </div>
            
            {/* Agent Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-4xl font-bold">{agent.display_name}</h1>
                
                {/* Hide/Unhide Button */}
                <button
                  onClick={toggleHidden}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    isHidden 
                      ? 'bg-green-500 hover:bg-green-600 text-white' 
                      : 'bg-white/20 hover:bg-white/30 text-white border border-white/40'
                  }`}
                  title={isHidden ? 'This agent is hidden from the dashboard' : 'Hide this agent from the dashboard'}
                >
                  {isHidden ? (
                    <>
                      <Eye className="w-4 h-4" />
                      <span>Show on Dashboard</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-4 h-4" />
                      <span>Hide from Dashboard</span>
                    </>
                  )}
                </button>
              </div>
              
              <div className="flex items-center gap-4 text-white/90 mb-6">
                <span className="text-lg">{department?.name}</span>
                <span className="text-white/60">•</span>
                <span>ID: {agent.agent_key}</span>
                {isHidden && (
                  <>
                    <span className="text-white/60">•</span>
                    <span className="flex items-center gap-1 text-yellow-300">
                      <EyeOff className="w-4 h-4" />
                      Hidden from Dashboard
                    </span>
                  </>
                )}
              </div>
              
              {/* Lifetime Stats Row */}
              <div className="grid grid-cols-4 gap-4">
                {/* Total Reviews */}
                <div className="bg-white rounded-2xl p-5 border-2 border-white/50 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                  <div className="text-4xl font-black tabular-nums mb-1 text-[#0066cc]">{lifetimeMetrics.total.toLocaleString()}</div>
                  <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Reviews</div>
                </div>
                {/* Lifetime Avg */}
                <div className="bg-white rounded-2xl p-5 border-2 border-white/50 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                  <div className="text-4xl font-black tabular-nums mb-1 flex items-baseline gap-1 text-[#0066cc]">
                    {lifetimeMetrics.avg_rating.toFixed(2)}
                    <Star className="size-5 fill-[#00ca6f] text-[#00ca6f] mb-1" />
                  </div>
                  <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Lifetime Avg</div>
                </div>
                {/* 5-Star Rate */}
                <div className="bg-white rounded-2xl p-5 border-2 border-white/50 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                  <div className="text-4xl font-black tabular-nums mb-1 text-[#0066cc]">{lifetimeMetrics.percent_5_star.toFixed(0)}%</div>
                  <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">5-Star Rate</div>
                </div>
                {/* 4-5 Star Reviews */}
                <div className="bg-white rounded-2xl p-5 border-2 border-white/50 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                  <div className="text-4xl font-black tabular-nums mb-1 text-[#0066cc]">{lifetimeReviews.filter(r => r.rating >= 4).length.toLocaleString()}</div>
                  <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">4-5 Star Reviews</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Range Selector */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200/80 p-6 mb-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">Performance Period:</span>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(dateRanges).map(([key, range]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedDateRange(range)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                      selectedDateRange.label === range.label
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-300/50 scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-sm font-bold text-gray-600 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
              {agentReviews.length} reviews in selected period
            </div>
          </div>
        </div>
        
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Average Rating Card */}
          <div className={`group relative flex flex-col rounded-2xl border-2 p-7 transition-all duration-500 cursor-pointer overflow-hidden
            hover:scale-[1.03] hover:-translate-y-1 active:scale-[0.99]
            ${currentMetrics.avg_rating >= 4.8
              ? 'border-amber-400/80 bg-gradient-to-br from-amber-100/80 via-white to-yellow-100/60 shadow-2xl shadow-amber-300/80'
              : 'border-gray-300/70 bg-white shadow-lg hover:shadow-xl'
          }`}>
            {/* Premium gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/30 to-transparent pointer-events-none" />
            
            {/* Accent bar */}
            <div className={`absolute top-0 left-0 right-0 h-2 transition-all duration-700 ${
              currentMetrics.avg_rating >= 4.8 
                ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 shadow-lg shadow-amber-500/60' 
                : 'bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 opacity-0 group-hover:opacity-100'
            }`} />
            
            <div className="flex items-center justify-between mb-5 relative z-10">
              <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider">Average Rating</h3>
              <div className={`flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-500 ${
                currentMetrics.avg_rating >= 4.8 
                  ? 'bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 shadow-xl shadow-amber-400/70 scale-105' 
                  : 'bg-gradient-to-br from-amber-100 to-amber-100 group-hover:scale-105 group-hover:shadow-md'
              }`}>
                <Star className={`size-7 transition-all duration-500 ${
                  currentMetrics.avg_rating >= 4.8 
                    ? 'text-white fill-white drop-shadow-lg' 
                    : 'text-amber-700 fill-amber-700'
                }`} strokeWidth={2.5} />
              </div>
            </div>
            
            <div className="flex-1 relative z-10">
              <div className="flex items-end gap-2 mb-2">
                <div className={`text-5xl font-black tabular-nums leading-none ${
                  currentMetrics.avg_rating >= 4.8 
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-600 drop-shadow-sm' 
                    : 'text-gray-900'
                }`}>
                  {currentMetrics.avg_rating.toFixed(2)}
                </div>
                <div className="text-xl font-semibold text-gray-400 mb-2">/ 5.00</div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100 relative z-10">
              {trends.rating.value !== 0 ? (
                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-sm ${
                  trends.rating.isPositive 
                    ? 'bg-green-600 text-white shadow-md' 
                    : 'bg-red-600 text-white shadow-md'
                }`}>
                  {trends.rating.isPositive ? <TrendingUp className="w-4 h-4" strokeWidth={3} /> : <TrendingDown className="w-4 h-4" strokeWidth={3} />}
                  <span className="font-black">
                    {trends.rating.isPositive ? '+' : ''}{Math.abs(trends.rating.value).toFixed(2)}
                  </span>
                  <span className="font-medium opacity-90">vs previous</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm bg-gray-600 text-white shadow-md">
                  <span>No change</span>
                </div>
              )}
            </div>
          </div>

          {/* Review Volume Card */}
          <div className={`group relative flex flex-col rounded-2xl border-2 p-7 transition-all duration-500 cursor-pointer overflow-hidden
            hover:scale-[1.03] hover:-translate-y-1 active:scale-[0.99]
            ${trends.volume.isPositive && Math.abs(trends.volume.value) >= 10
              ? 'border-indigo-400/80 bg-gradient-to-br from-indigo-100/80 via-white to-purple-100/60 shadow-2xl shadow-indigo-300/80'
              : 'border-gray-300/70 bg-white shadow-lg hover:shadow-xl'
          }`}>
            {/* Premium gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/30 to-transparent pointer-events-none" />
            
            {/* Accent bar */}
            <div className={`absolute top-0 left-0 right-0 h-2 transition-all duration-700 ${
              trends.volume.isPositive && Math.abs(trends.volume.value) >= 10
                ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 shadow-lg shadow-indigo-500/60' 
                : 'bg-gradient-to-r from-indigo-300 via-indigo-400 to-indigo-300 opacity-0 group-hover:opacity-100'
            }`} />
            
            <div className="flex items-center justify-between mb-5 relative z-10">
              <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider">Review Volume</h3>
              <div className={`flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-500 ${
                trends.volume.isPositive && Math.abs(trends.volume.value) >= 10
                  ? 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 shadow-xl shadow-indigo-400/70 scale-105' 
                  : 'bg-gradient-to-br from-indigo-100 to-indigo-100 group-hover:scale-105 group-hover:shadow-md'
              }`}>
                <Award className={`size-7 transition-all duration-500 ${
                  trends.volume.isPositive && Math.abs(trends.volume.value) >= 10
                    ? 'text-white drop-shadow-lg' 
                    : 'text-indigo-700'
                }`} strokeWidth={2.5} />
              </div>
            </div>
            
            <div className="flex-1 relative z-10">
              <div className="flex items-end gap-2 mb-2">
                <div className={`text-5xl font-black tabular-nums leading-none ${
                  trends.volume.isPositive && Math.abs(trends.volume.value) >= 10
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 drop-shadow-sm' 
                    : 'text-gray-900'
                }`}>
                  {currentMetrics.total}
                </div>
                <div className="text-xl font-semibold text-gray-400 mb-2">reviews</div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100 relative z-10">
              {trends.volume.value !== 0 ? (
                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-sm ${
                  trends.volume.isPositive 
                    ? 'bg-green-600 text-white shadow-md' 
                    : 'bg-red-600 text-white shadow-md'
                }`}>
                  {trends.volume.isPositive ? <TrendingUp className="w-4 h-4" strokeWidth={3} /> : <TrendingDown className="w-4 h-4" strokeWidth={3} />}
                  <span className="font-black">
                    {trends.volume.isPositive ? '+' : ''}{Math.abs(trends.volume.value)}
                  </span>
                  <span className="font-medium opacity-90">vs previous</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm bg-gray-600 text-white shadow-md">
                  <span>No change</span>
                </div>
              )}
            </div>
          </div>

          {/* 5-Star Rate Card */}
          <div className={`group relative flex flex-col rounded-2xl border-2 p-7 transition-all duration-500 cursor-pointer overflow-hidden
            hover:scale-[1.03] hover:-translate-y-1 active:scale-[0.99]
            ${currentMetrics.percent_5_star >= 90
              ? 'border-green-400/80 bg-gradient-to-br from-green-100/80 via-white to-emerald-100/60 shadow-2xl shadow-green-300/80'
              : 'border-gray-300/70 bg-white shadow-lg hover:shadow-xl'
          }`}>
            {/* Premium gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/30 to-transparent pointer-events-none" />
            
            {/* Accent bar */}
            <div className={`absolute top-0 left-0 right-0 h-2 transition-all duration-700 ${
              currentMetrics.percent_5_star >= 90
                ? 'bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-500 shadow-lg shadow-green-500/60' 
                : 'bg-gradient-to-r from-green-300 via-green-400 to-green-300 opacity-0 group-hover:opacity-100'
            }`} />
            
            <div className="flex items-center justify-between mb-5 relative z-10">
              <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider">5-Star Rate</h3>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 transition-all duration-500 ${
                    currentMetrics.percent_5_star >= 90
                      ? 'text-green-600 fill-green-600'
                      : 'text-yellow-400 fill-yellow-400'
                  }`} />
                ))}
              </div>
            </div>
            
            <div className="flex-1 relative z-10">
              <div className="flex items-baseline gap-1 mb-2">
                <div className={`text-5xl font-black tabular-nums leading-none ${
                  currentMetrics.percent_5_star >= 90
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 drop-shadow-sm' 
                    : 'text-gray-900'
                }`}>
                  {currentMetrics.percent_5_star.toFixed(1)}%
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100 relative z-10">
              {trends.fiveStar.value !== 0 ? (
                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-sm ${
                  trends.fiveStar.isPositive 
                    ? 'bg-green-600 text-white shadow-md' 
                    : 'bg-red-600 text-white shadow-md'
                }`}>
                  {trends.fiveStar.isPositive ? <TrendingUp className="w-4 h-4" strokeWidth={3} /> : <TrendingDown className="w-4 h-4" strokeWidth={3} />}
                  <span className="font-black">
                    {trends.fiveStar.isPositive ? '+' : ''}{Math.abs(trends.fiveStar.value).toFixed(1)}%
                  </span>
                  <span className="font-medium opacity-90">vs previous</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm bg-gray-600 text-white shadow-md">
                  <span>No change</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rating Distribution & Problem Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Rating Distribution */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200/80 p-7 hover:shadow-xl transition-all duration-300">
            <h3 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-wide">Rating Distribution</h3>
            <div className="space-y-4">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 w-16">
                    <span className="text-sm font-bold text-gray-900">{rating}</span>
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  </div>
                  <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className={`h-full transition-all duration-700 shadow-md ${
                        rating === 5 ? 'bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600' :
                        rating === 4 ? 'bg-gradient-to-r from-lime-400 via-lime-500 to-lime-500' :
                        rating === 3 ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-500' :
                        rating === 2 ? 'bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600' :
                        'bg-gradient-to-r from-red-400 via-red-500 to-red-600'
                      }`}
                      style={{ width: `${ratingDistribution.percentages[rating as keyof typeof ratingDistribution.percentages]}%` }}
                    />
                  </div>
                  <div className="w-24 text-right">
                    <span className="text-base font-black text-gray-900">{ratingDistribution.counts[rating as keyof typeof ratingDistribution.counts]}</span>
                    <span className="text-sm text-gray-500 font-semibold ml-2">({ratingDistribution.percentages[rating as keyof typeof ratingDistribution.percentages].toFixed(0)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Problem Reviews */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200/80 p-7 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-wide">Problem Reviews</h3>
              {problemCount > 0 && (
                <div className="flex items-center gap-1.5 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-black shadow-md">
                  <AlertTriangle className="w-5 h-5" />
                  {problemCount}
                </div>
              )}
            </div>
            <div className="space-y-3">
              {problemCount === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl shadow-green-300/50">
                    <Award className="w-10 h-10 text-white" strokeWidth={2.5} />
                  </div>
                  <p className="font-black text-gray-900 text-lg mb-1">No problem reviews!</p>
                  <p className="text-sm font-semibold text-gray-500">Excellent performance in selected period</p>
                </div>
              ) : (
                agentReviews
                  .filter(r => r.rating <= 2)
                  .slice(0, 5)
                  .map(review => (
                    <div key={review.id} className="p-4 bg-red-50 border-2 border-red-200 rounded-xl hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center gap-1.5 mt-0.5 bg-red-600 text-white px-2 py-1 rounded-lg shadow-md">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm font-black">{review.rating}</span>
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-gray-600 mb-2">
                            {new Date(review.review_ts).toLocaleDateString()} • {review.source}
                          </div>
                          <div className="text-sm font-medium text-gray-900">
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
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200/80 p-7 mb-8 hover:shadow-xl transition-all duration-300">
          <h3 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-wide">Performance Trend</h3>
          <TimeSeriesChart data={dailyMetrics} />
        </div>

        {/* Reviews Table */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200/80 p-7 hover:shadow-xl transition-all duration-300">
          <h3 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-wide">All Reviews</h3>
          <ReviewTable data={agentReviews} agents={agents} departments={departments} />
        </div>
      </div>
    </div>
  )
}