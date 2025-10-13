'use client'

import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart, Scatter, ScatterChart, ZAxis
} from 'recharts'
import { AgentMetrics } from '@/data/dataService'
import { Review, Agent, Department } from '@/data/dataService'

interface TimeSeriesChartProps {
  data: Array<{
    date: string
    total: number
    star_1: number
    star_2: number
    star_3: number
    star_4: number
    star_5: number
  }>
}

interface AgentLeaderboardProps {
  data: AgentMetrics[]
  limit?: number
}

interface RatingDistributionProps {
  reviews: Review[]
}

interface DepartmentPerformanceProps {
  reviews: Review[]
  departments: Department[]
}

interface SourceBreakdownProps {
  reviews: Review[]
}

interface SatisfactionTrendProps {
  data: Array<{
    date: string
    satisfaction_score: number
    avg_rating: number
    total: number
  }>
}

interface DepartmentComparisonProps {
  reviews: Review[]
  departments: Department[]
}

interface AgentRadarProps {
  agents: AgentMetrics[]
  limit?: number
}

interface ReviewVelocityProps {
  reviews: Review[]
}

interface ProblemSpotlightProps {
  reviews: Review[]
  departments: Department[]
}

const COLORS = {
  primary: '#635BFF',
  success: '#00CA6F',
  warning: '#FFB020',
  danger: '#FF4A4C',
  info: '#0096FA',
  purple: '#8B5CF6',
  pink: '#EC4899',
  teal: '#14B8A6',
  orange: '#F97316',
  slate: '#64748B'
}

const RATING_COLORS = ['#FF4A4C', '#FF8A4C', '#FFB020', '#8BC34A', '#00CA6F']

export function TimeSeriesChart({ data }: TimeSeriesChartProps) {
  return (
    <div className="bg-white rounded-md border border-[#E3E8EE] p-6 mb-6 transition-all duration-150 hover:shadow-soft">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#0A2540] tracking-tight">
          Review Trends Over Time
        </h3>
        <p className="text-sm text-[#6B7C93] mt-1">
          Track daily review volume and rating distribution
        </p>
      </div>
      
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E3E8EE" vertical={false} />
            
            <XAxis 
              dataKey="date" 
              stroke="#6B7C93"
              fontSize={11}
              axisLine={false}
              tickLine={false}
              padding={{ left: 10, right: 10 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis 
              stroke="#6B7C93" 
              fontSize={11} 
              axisLine={false}
              tickLine={false}
              width={25}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '4px',
                boxShadow: '0 2px 5px 0 rgba(60,66,87,0.08), 0 1px 1px 0 rgba(0,0,0,0.12)',
                border: '1px solid #E3E8EE',
                backgroundColor: '#FFFFFF',
                padding: '8px 12px',
              }}
              labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric' 
              })}
              formatter={(value: number, name: string) => {
                const labels: Record<string, string> = {
                  total: 'Total Reviews',
                  star_5: '5★ Reviews',
                  star_4: '4★ Reviews',
                  star_3: '3★ Reviews',
                  star_2: '2★ Reviews',
                  star_1: '1★ Reviews'
                }
                return [value, labels[name] || name]
              }}
              animationDuration={150}
              animationEasing="ease-out"
            />
            <Legend 
              iconType="circle" 
              wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
            />
            
            <Line 
              type="monotone" 
              dataKey="total" 
              stroke="#635BFF" 
              strokeWidth={2}
              name="Total Reviews"
              dot={false}
              activeDot={{ r: 4, stroke: '#635BFF', strokeWidth: 2, fill: '#FFFFFF' }}
            />
            <Line 
              type="monotone" 
              dataKey="star_5" 
              stroke="#00CA6F" 
              strokeWidth={2}
              name="5★ Reviews"
              dot={false}
              activeDot={{ r: 4, stroke: '#00CA6F', strokeWidth: 2, fill: '#FFFFFF' }}
            />
            <Line 
              type="monotone" 
              dataKey="star_1" 
              stroke="#FF4A4C" 
              strokeWidth={2}
              name="1★ Reviews"
              dot={false}
              activeDot={{ r: 4, stroke: '#FF4A4C', strokeWidth: 2, fill: '#FFFFFF' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function AgentLeaderboard({ data, limit = 10 }: AgentLeaderboardProps) {
  // DEBUG: Log what data this component receives
  console.log('🎯 AgentLeaderboard RECEIVED data prop:', {
    totalAgents: data.length,
    first5: data.slice(0, 5).map(a => ({ name: a.agent_name, total: a.total, rating: a.avg_rating }))
  });
  
  // Only show agents with reviews, SORT by total reviews descending
  const chartData = data
    .filter(agent => agent.total > 0)
    .sort((a, b) => b.total - a.total)  // ✅ SORT BY REVIEW COUNT DESCENDING
    .slice(0, limit)
    .map(agent => ({
      name: agent.agent_name,
      reviews: agent.total,
      rating: agent.avg_rating,
      percent_5_star: agent.percent_5_star,
      department: agent.department_name,
      image_url: agent.image_url
    }))
  
  // DEBUG: Log what chartData looks like after transformation
  console.log('📊 AgentLeaderboard chartData after transformation:', {
    totalInChart: chartData.length,
    first5: chartData.slice(0, 5).map(c => ({ name: c.name, reviews: c.reviews, rating: c.rating }))
  });
  
  // Calculate team average for comparison
  const teamAvgRating = chartData.length > 0 
    ? chartData.reduce((sum, a) => sum + a.rating, 0) / chartData.length 
    : 0
  
  // Generate performance badges based on multiple criteria
  const getBadges = (agent: typeof chartData[0], rank: number) => {
    const badges: Array<{ icon: string; label: string; color: string; tooltip: string }> = []
    
    if (rank === 0) badges.push({ icon: '👑', label: 'Top Performer', color: 'bg-gradient-to-r from-yellow-400 to-yellow-600', tooltip: 'Highest overall performance' })
    if (agent.rating >= 4.9) badges.push({ icon: '⭐', label: 'Quality Star', color: 'bg-gradient-to-r from-green-400 to-green-600', tooltip: '4.9+ star rating' })
    else if (agent.rating >= 4.5) badges.push({ icon: '✨', label: 'Excellent', color: 'bg-gradient-to-r from-blue-400 to-blue-600', tooltip: '4.5+ star rating' })
    else if (agent.rating < 4.0) badges.push({ icon: '🎯', label: 'Needs Coaching', color: 'bg-gradient-to-r from-orange-400 to-orange-600', tooltip: 'Below 4.0 - coaching recommended' })
    
    if (agent.reviews >= 50) badges.push({ icon: '🏆', label: 'Volume Champion', color: 'bg-gradient-to-r from-purple-400 to-purple-600', tooltip: '50+ reviews handled' })
    if (agent.percent_5_star >= 95) badges.push({ icon: '💎', label: 'Customer Favorite', color: 'bg-gradient-to-r from-cyan-400 to-cyan-600', tooltip: '95%+ gave 5 stars' })
    
    return badges
  }
  
  // Calculate trend indicator (comparing to team average)
  const getTrendIndicator = (agent: typeof chartData[0]) => {
    const delta = agent.rating - teamAvgRating
    if (delta > 0.2) return { icon: '📈', text: `+${delta.toFixed(1)} vs avg`, color: 'text-green-600', bg: 'bg-green-50' }
    if (delta < -0.2) return { icon: '📉', text: `${delta.toFixed(1)} vs avg`, color: 'text-red-600', bg: 'bg-red-50' }
    return { icon: '➡️', text: 'On target', color: 'text-blue-600', bg: 'bg-blue-50' }
  }
  
  // If no data, show empty state
  if (chartData.length === 0) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl border-2 border-blue-100 p-12 mb-8 shadow-xl">
        <div className="text-center max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-[#0A2540] mb-3">No Agent Data Yet</h3>
          <p className="text-[#6B7C93] mb-6">
            No agents have reviews in the selected date range. Try adjusting your filters or selecting "This Year" to see more data.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative mb-8 overflow-hidden">
      {/* Hero Background with Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 rounded-2xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.1),transparent_50%)]" />
      
      {/* Main Container */}
      <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-blue-100 shadow-2xl shadow-blue-500/10">
        
        {/* Header Section */}
        <div className="p-8 border-b border-blue-100/50">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-[#0A2540] tracking-tight">Agent Performance Rankings</h2>
                  <p className="text-[#6B7C93] mt-1">
                    Top {chartData.length} agent{chartData.length !== 1 ? 's' : ''} by review volume and quality
                  </p>
                </div>
              </div>
            </div>
            
            {/* Quick Stats - Enhanced with 3rd card for team average */}
            <div className="flex gap-4">
              <div className="text-center px-5 py-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 shadow-lg">
                <div className="text-3xl font-bold text-green-700 mb-1">
                  {chartData.filter(a => a.rating >= 4.5).length}
                </div>
                <div className="text-xs text-green-600 font-semibold tracking-wide">Star Agents</div>
              </div>
              <div className="text-center px-5 py-3 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200 shadow-lg">
                <div className="text-3xl font-bold text-orange-700 mb-1">
                  {chartData.filter(a => a.rating < 4.0).length}
                </div>
                <div className="text-xs text-orange-600 font-semibold tracking-wide">Need Coaching</div>
              </div>
              <div className="text-center px-5 py-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 shadow-lg">
                <div className="text-3xl font-bold text-blue-700 mb-1">
                  {teamAvgRating.toFixed(2)}
                </div>
                <div className="text-xs text-blue-600 font-semibold tracking-wide">Team Average</div>
              </div>
            </div>
          </div>
          
          {/* Dynamic Insights Banner - Enhanced with pulsing animation */}
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 rounded-lg">
            <p className="text-sm text-[#0A2540] font-medium flex items-center gap-2">
              <span className="text-lg animate-pulse">💡</span> 
              <span><span className="font-bold">{chartData[0]?.name}</span> is leading with {chartData[0]?.rating.toFixed(2)} stars across {chartData[0]?.reviews} reviews
              {chartData[0]?.percent_5_star >= 95 && ' and an exceptional 5-star rate!'}</span>
            </p>
          </div>
        </div>

        {/* Leaderboard Grid */}
        <div className="p-8">
          {/* Top 3 Podium */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {chartData.slice(0, 3).map((agent, index) => {
              const badges = getBadges(agent, index)
              const trend = getTrendIndicator(agent)
              const rankColors = [
                { bg: 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600', border: 'border-yellow-400', text: 'text-yellow-600', glow: 'shadow-yellow-500/50', statBg: 'bg-gradient-to-br from-yellow-50 to-amber-50' },
                { bg: 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500', border: 'border-gray-400', text: 'text-gray-600', glow: 'shadow-gray-500/50', statBg: 'bg-gradient-to-br from-gray-50 to-slate-50' },
                { bg: 'bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600', border: 'border-orange-400', text: 'text-orange-600', glow: 'shadow-orange-500/50', statBg: 'bg-gradient-to-br from-orange-50 to-red-50' }
              ][index]
              
              return (
                <div
                  key={index}
                  className={`group relative bg-white rounded-2xl border-2 ${rankColors.border} p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${rankColors.glow} cursor-pointer`}
                >
                  {/* Rank Badge */}
                  <div className={`absolute -top-4 -left-4 w-12 h-12 ${rankColors.bg} rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg z-10 ${index === 0 ? 'animate-shine' : ''}`}>
                    {index + 1}
                  </div>
                  
                  {/* Crown Icon for #1 */}
                  {index === 0 && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-4xl animate-bounce">
                      👑
                    </div>
                  )}
                  
                  {/* Agent Avatar */}
                  <div className={`flex flex-col items-center mb-4`}>
                    <div className={`relative mb-3 group-hover:scale-110 transition-transform duration-300`}>
                      <div className={`absolute inset-0 ${rankColors.bg} rounded-full blur-xl opacity-50`} />
                      <img 
                        src={agent.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name)}&background=4F46E5&color=fff&size=256`}
                        alt={agent.name}
                        className={`relative ${index === 0 ? 'w-24 h-24' : 'w-20 h-20'} rounded-full object-cover object-center border-4 ${rankColors.border} shadow-xl`}
                        onError={(e) => e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name)}&background=4F46E5&color=fff&size=256`}
                      />
                    </div>
                    <h3 className={`${index === 0 ? 'text-2xl' : 'text-xl'} font-bold text-[#0A2540] text-center`}>{agent.name}</h3>
                    <p className="text-xs text-[#6B7C93] mt-1">{agent.department}</p>
                    
                    {/* Trend Indicator */}
                    <div className={`mt-2 px-3 py-1 ${trend.bg} rounded-full flex items-center gap-1`}>
                      <span>{trend.icon}</span>
                      <span className={`text-xs font-semibold ${trend.color}`}>{trend.text}</span>
                    </div>
                  </div>
                  
                  {/* Stats - Premium Design with gradients and icons */}
                  <div className="space-y-3">
                    <div className={`relative overflow-hidden flex items-center justify-between p-4 ${rankColors.statBg} rounded-xl border border-${index === 0 ? 'yellow' : index === 1 ? 'gray' : 'orange'}-200 shadow-md`}>
                      <div className="absolute top-0 right-0 text-6xl opacity-10">⭐</div>
                      <div className="relative z-10 w-full">
                        <span className="text-xs text-[#6B7C93] font-semibold block mb-1">Rating</span>
                        <span className={`${index === 0 ? 'text-2xl' : 'text-lg'} font-bold text-[#0A2540]`}>{agent.rating.toFixed(2)}/5.00</span>
                      </div>
                    </div>
                    <div className={`relative overflow-hidden flex items-center justify-between p-4 ${rankColors.statBg} rounded-xl border border-${index === 0 ? 'yellow' : index === 1 ? 'gray' : 'orange'}-200 shadow-md`}>
                      <div className="absolute top-0 right-0 text-6xl opacity-10">📊</div>
                      <div className="relative z-10 w-full">
                        <span className="text-xs text-[#6B7C93] font-semibold block mb-1">Reviews</span>
                        <span className={`${index === 0 ? 'text-2xl' : 'text-lg'} font-bold text-[#0A2540]`}>{agent.reviews}</span>
                      </div>
                    </div>
                    <div className={`relative overflow-hidden flex items-center justify-between p-4 ${rankColors.statBg} rounded-xl border border-${index === 0 ? 'yellow' : index === 1 ? 'gray' : 'orange'}-200 shadow-md`}>
                      <div className="absolute top-0 right-0 text-6xl opacity-10">💎</div>
                      <div className="relative z-10 w-full">
                        <span className="text-xs text-[#6B7C93] font-semibold block mb-1">5-Star Rate</span>
                        <span className={`${index === 0 ? 'text-2xl' : 'text-lg'} font-bold text-[#0A2540]`}>{agent.percent_5_star.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Badges with Tooltips */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {badges.map((badge, i) => (
                      <div 
                        key={i} 
                        className={`group/badge relative ${badge.color} text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md hover:scale-110 transition-transform cursor-help`}
                        title={badge.tooltip}
                      >
                        <span>{badge.icon}</span>
                        <span>{badge.label}</span>
                        
                        {/* Tooltip on Hover */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/badge:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-50">
                          {badge.tooltip}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Section Divider with styled badge */}
          {chartData.length > 3 && (
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
              <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-bold rounded-full shadow-lg flex items-center gap-2">
                <span>🌟</span>
                <span>Rising Stars</span>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent" />
            </div>
          )}

          {/* Remaining Agents (4-10) with trend indicators */}
          {chartData.length > 3 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {chartData.slice(3).map((agent, index) => {
                const actualRank = index + 4
                const badges = getBadges(agent, actualRank - 1)
                const trend = getTrendIndicator(agent)
                
                return (
                  <div
                    key={actualRank}
                    className="group relative bg-white rounded-xl border border-gray-200 transition-all duration-200 hover:border-blue-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer overflow-hidden"
                  >
                    {/* Colorful top bar */}
                    <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                    
                    {/* Card Content */}
                    <div className="p-4">
                      {/* Avatar and Rank */}
                      <div className="flex justify-center mb-3">
                        <div className="relative">
                          <img 
                            src={agent.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name)}&background=4F46E5&color=fff&size=128`}
                            alt={agent.name}
                            className="w-16 h-16 rounded-full object-cover object-center border-2 border-gray-200 shadow-md"
                            onError={(e) => e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name)}&background=4F46E5&color=fff&size=128`}
                          />
                          {/* Rank badge */}
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center border-2 border-white shadow-md">
                            <span className="text-xs font-bold text-white">{actualRank}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Name and Department */}
                      <div className="text-center mb-3">
                        <h4 className="font-semibold text-[#0A2540] text-sm truncate">{agent.name}</h4>
                        <p className="text-xs text-[#6B7C93] truncate">{agent.department}</p>
                      </div>
                      
                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-[10px] text-[#6B7C93] mb-0.5">Reviews</div>
                          <div className="text-sm font-bold text-indigo-600">{agent.reviews}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-[#6B7C93] mb-0.5">Rating</div>
                          <div className="text-sm font-bold text-indigo-600">{agent.rating.toFixed(2)}★</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-[#6B7C93] mb-0.5">5-Star</div>
                          <div className="text-sm font-bold text-indigo-600">{agent.percent_5_star.toFixed(0)}%</div>
                        </div>
                      </div>
                      
                      {/* Badges - Show only 1-2 most important */}
                      {badges.length > 0 && (
                        <div className="mt-3 flex justify-center gap-1">
                          {badges.slice(0, 1).map((badge, i) => (
                            <div 
                              key={i} 
                              className={`${badge.color} text-white text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-0.5 shadow-sm`}
                              title={badge.tooltip}
                            >
                              <span className="text-xs">{badge.icon}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


// Rating Distribution Pie Chart
export function RatingDistribution({ reviews }: RatingDistributionProps) {
  const ratingCounts = [1, 2, 3, 4, 5].map(rating => ({
    name: `${rating} Star`,
    value: reviews.filter(r => r.rating === rating).length,
    rating
  }))

  return (
    <div className="bg-white rounded-md border border-[#E3E8EE] p-6 mb-6 transition-all duration-150 hover:shadow-soft">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#0A2540] tracking-tight">
          Rating Distribution
        </h3>
        <p className="text-sm text-[#6B7C93] mt-1">
          Breakdown of all reviews by star rating
        </p>
      </div>
      
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={ratingCounts}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry: any) => `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {ratingCounts.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={RATING_COLORS[index]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: '4px',
                boxShadow: '0 2px 5px 0 rgba(60,66,87,0.08), 0 1px 1px 0 rgba(0,0,0,0.12)',
                border: '1px solid #E3E8EE',
                backgroundColor: '#FFFFFF',
                padding: '8px 12px',
              }}
              formatter={(value: number) => [value, 'Reviews']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// Department Performance Bar Chart
export function DepartmentPerformance({ reviews, departments }: DepartmentPerformanceProps) {
  const deptData = departments.map(dept => {
    const deptReviews = reviews.filter(r => r.department_id === dept.id)
    const totalRating = deptReviews.reduce((sum, r) => sum + r.rating, 0)
    const avgRating = deptReviews.length > 0 ? totalRating / deptReviews.length : 0
    const fiveStarCount = deptReviews.filter(r => r.rating === 5).length
    const fiveStarPercent = deptReviews.length > 0 ? (fiveStarCount / deptReviews.length) * 100 : 0

    return {
      name: dept.name,
      total: deptReviews.length,
      avg_rating: avgRating,
      five_star_rate: fiveStarPercent
    }
  }).sort((a, b) => b.total - a.total)

  return (
    <div className="bg-white rounded-md border border-[#E3E8EE] p-6 mb-6 transition-all duration-150 hover:shadow-soft">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#0A2540] tracking-tight">
          Department Performance
        </h3>
        <p className="text-sm text-[#6B7C93] mt-1">
          Review volume and ratings by department
        </p>
      </div>
      
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={deptData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E3E8EE" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#6B7C93"
              fontSize={11}
              axisLine={false}
              tickLine={false}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              stroke="#6B7C93" 
              fontSize={11} 
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '4px',
                boxShadow: '0 2px 5px 0 rgba(60,66,87,0.08), 0 1px 1px 0 rgba(0,0,0,0.12)',
                border: '1px solid #E3E8EE',
                backgroundColor: '#FFFFFF',
                padding: '8px 12px',
              }}
              formatter={(value: number, name: string) => {
                if (name === 'total') return [value, 'Total Reviews']
                if (name === 'avg_rating') return [value.toFixed(2), 'Avg Rating']
                if (name === 'five_star_rate') return [`${value.toFixed(1)}%`, '5★ Rate']
                return [value, name]
              }}
            />
            <Legend />
            <Bar dataKey="total" fill={COLORS.primary} name="Total Reviews" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// Source Breakdown Pie Chart
export function SourceBreakdown({ reviews }: SourceBreakdownProps) {
  const sourceCounts = reviews.reduce((acc, review) => {
    const source = review.source || 'Unknown'
    acc[source] = (acc[source] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const sourceData = Object.entries(sourceCounts).map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const pieColors = [
    COLORS.primary, COLORS.success, COLORS.warning, COLORS.danger, 
    COLORS.info, COLORS.purple, COLORS.pink, COLORS.teal
  ]

  return (
    <div className="bg-white rounded-md border border-[#E3E8EE] p-6 mb-6 transition-all duration-150 hover:shadow-soft">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#0A2540] tracking-tight">
          Review Source Breakdown
        </h3>
        <p className="text-sm text-[#6B7C93] mt-1">
          Where your reviews are coming from
        </p>
      </div>
      
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={sourceData}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={(entry: any) => `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {sourceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: '4px',
                boxShadow: '0 2px 5px 0 rgba(60,66,87,0.08), 0 1px 1px 0 rgba(0,0,0,0.12)',
                border: '1px solid #E3E8EE',
                backgroundColor: '#FFFFFF',
                padding: '8px 12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// Satisfaction Trend Area Chart
export function SatisfactionTrend({ data }: SatisfactionTrendProps) {
  return (
    <div className="bg-white rounded-md border border-[#E3E8EE] p-6 mb-6 transition-all duration-150 hover:shadow-soft">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#0A2540] tracking-tight">
          Customer Satisfaction Trend
        </h3>
        <p className="text-sm text-[#6B7C93] mt-1">
          Track overall customer satisfaction over time
        </p>
        <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
          <p className="text-xs text-[#0A2540] font-medium mb-1">💡 Why This Matters</p>
          <p className="text-xs text-[#425466]">
            In insurance, happy customers renew policies and refer others. Track this trend to ensure your 
            service quality stays competitive. The red benchmark line shows the 80% industry standard.
          </p>
        </div>
      </div>
      
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorSatisfaction" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={COLORS.success} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E3E8EE" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#6B7C93"
              fontSize={11}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis 
              stroke="#6B7C93" 
              fontSize={11} 
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '4px',
                boxShadow: '0 2px 5px 0 rgba(60,66,87,0.08), 0 1px 1px 0 rgba(0,0,0,0.12)',
                border: '1px solid #E3E8EE',
                backgroundColor: '#FFFFFF',
                padding: '8px 12px',
              }}
              formatter={(value: number, name: string) => {
                if (name === 'satisfaction_score') return [`${value.toFixed(1)}%`, 'Satisfaction Score']
                if (name === 'avg_rating') return [value.toFixed(2), 'Avg Rating']
                if (name === 'benchmark') return [`${value}%`, 'Industry Benchmark']
                return [value, name]
              }}
              labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric' 
              })}
            />
            <Legend />
            {/* Benchmark line at 80% */}
            <Line 
              type="monotone" 
              dataKey={() => 80}
              stroke={COLORS.danger} 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Industry Benchmark (80%)"
              dot={false}
            />
            <Area 
              type="monotone" 
              dataKey="satisfaction_score" 
              stroke={COLORS.success} 
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSatisfaction)"
              name="Your Satisfaction Score"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// Department Comparison Multi-metric
export function DepartmentComparison({ reviews, departments }: DepartmentComparisonProps) {
  const deptData = departments
    .map(dept => {
      const deptReviews = reviews.filter(r => r.department_id === dept.id)
      if (deptReviews.length === 0) return null
      
      const totalRating = deptReviews.reduce((sum, r) => sum + r.rating, 0)
      const avgRating = totalRating / deptReviews.length

      return {
        name: dept.name.length > 25 ? dept.name.substring(0, 25) + '...' : dept.name,
        fullName: dept.name,
        volume: deptReviews.length,
        rating: avgRating
      }
    })
    .filter((d): d is NonNullable<typeof d> => d !== null) // Remove nulls and type guard
    .sort((a, b) => b.volume - a.volume) // Sort by volume
    .slice(0, 10) // Top 10
  
  console.log('DepartmentComparison - Reviews:', reviews.length)
  console.log('DepartmentComparison - Departments:', departments.length)
  console.log('DepartmentComparison - Chart data:', deptData)

  return (
    <div className="bg-white rounded-md border border-[#E3E8EE] p-6 mb-6 transition-all duration-150 hover:shadow-soft">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#0A2540] tracking-tight">
          Department Performance Comparison
        </h3>
        <p className="text-sm text-[#6B7C93] mt-1">
          Compare insurance product lines across volume and quality
        </p>
        <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
          <p className="text-xs text-[#0A2540] font-medium mb-1">💡 Why This Matters</p>
          <p className="text-xs text-[#425466]">
            Different insurance products (Auto, Home, Health, Life) have different service challenges. 
            Identify which product lines need process improvements or additional training resources.
          </p>
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={deptData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E3E8EE" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#6B7C93"
              fontSize={11}
              axisLine={false}
              tickLine={false}
              angle={-45}
              textAnchor="end"
              height={120}
              interval={0}
            />
            <YAxis 
              yAxisId="left"
              stroke="#6B7C93" 
              fontSize={11} 
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="#6B7C93" 
              fontSize={11} 
              axisLine={false}
              tickLine={false}
              domain={[0, 5]}
              ticks={[0, 1, 2, 3, 4, 5]}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '4px',
                boxShadow: '0 2px 5px 0 rgba(60,66,87,0.08), 0 1px 1px 0 rgba(0,0,0,0.12)',
                border: '1px solid #E3E8EE',
                backgroundColor: '#FFFFFF',
                padding: '8px 12px',
              }}
              formatter={(value: number, name: string) => {
                if (name === 'Review Volume') return [value, 'Reviews']
                if (name === 'Avg Rating') return [value.toFixed(2) + ' / 5.00', 'Rating']
                return [value, name]
              }}
              labelFormatter={(label, payload) => {
                if (payload && payload[0]) {
                  return payload[0].payload.fullName
                }
                return label
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar 
              yAxisId="left"
              dataKey="volume" 
              fill={COLORS.primary} 
              name="Review Volume" 
              radius={[4, 4, 0, 0]}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="rating" 
              stroke={COLORS.success} 
              strokeWidth={3}
              name="Avg Rating"
              dot={{ r: 6, fill: COLORS.success, strokeWidth: 2, stroke: '#fff' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// Agent Performance Radar Chart
export function AgentRadar({ agents, limit = 6 }: AgentRadarProps) {
  const topAgents = agents.slice(0, limit)
  
  // Prepare data for radar chart
  const metrics = ['Total Reviews', 'Avg Rating', '5★ Rate', 'Response Rate']
  const radarData = metrics.map(metric => {
    const dataPoint: any = { metric }
    topAgents.forEach(agent => {
      if (metric === 'Total Reviews') {
        // Normalize to 0-100 scale (assuming max is the top agent's total)
        const maxTotal = topAgents[0].total
        dataPoint[agent.agent_name] = (agent.total / maxTotal) * 100
      } else if (metric === 'Avg Rating') {
        dataPoint[agent.agent_name] = (agent.avg_rating / 5) * 100
      } else if (metric === '5★ Rate') {
        dataPoint[agent.agent_name] = agent.percent_5_star
      } else if (metric === 'Response Rate') {
        // Placeholder - you can calculate actual response rate if you have comment data
        dataPoint[agent.agent_name] = Math.random() * 100
      }
    })
    return dataPoint
  })

  return (
    <div className="bg-white rounded-md border border-[#E3E8EE] p-6 mb-6 transition-all duration-150 hover:shadow-soft">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#0A2540] tracking-tight">
          Top Agent Performance Radar
        </h3>
        <p className="text-sm text-[#6B7C93] mt-1">
          Multi-dimensional performance comparison
        </p>
      </div>
      
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData}>
            <PolarGrid stroke="#E3E8EE" />
            <PolarAngleAxis dataKey="metric" stroke="#6B7C93" fontSize={11} />
            <PolarRadiusAxis stroke="#6B7C93" fontSize={10} domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                borderRadius: '4px',
                boxShadow: '0 2px 5px 0 rgba(60,66,87,0.08), 0 1px 1px 0 rgba(0,0,0,0.12)',
                border: '1px solid #E3E8EE',
                backgroundColor: '#FFFFFF',
                padding: '8px 12px',
              }}
              formatter={(value: number) => value.toFixed(1)}
            />
            {topAgents.map((agent, index) => (
              <Radar
                key={agent.agent_name}
                name={agent.agent_name}
                dataKey={agent.agent_name}
                stroke={Object.values(COLORS)[index % Object.values(COLORS).length]}
                fill={Object.values(COLORS)[index % Object.values(COLORS).length]}
                fillOpacity={0.2}
                strokeWidth={2}
              />
            ))}
            <Legend wrapperStyle={{ fontSize: '11px' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// Review Velocity - Shows review volume acceleration/deceleration
export function ReviewVelocity({ reviews }: ReviewVelocityProps) {
  // Group by week and calculate weekly totals
  const weeklyData = reviews.reduce((acc, review) => {
    const date = new Date(review.review_ts)
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay())
    const weekKey = weekStart.toISOString().split('T')[0]
    
    if (!acc[weekKey]) {
      acc[weekKey] = { date: weekKey, count: 0 }
    }
    acc[weekKey].count++
    return acc
  }, {} as Record<string, { date: string; count: number }>)

  const velocityData = Object.values(weeklyData)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-12) // Last 12 weeks
    .map((week, index, arr) => {
      const prevWeek = index > 0 ? arr[index - 1].count : week.count
      const change = prevWeek > 0 ? ((week.count - prevWeek) / prevWeek) * 100 : 0
      return {
        ...week,
        velocity: change
      }
    })

  return (
    <div className="bg-white rounded-md border border-[#E3E8EE] p-6 mb-6 transition-all duration-150 hover:shadow-soft">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#0A2540] tracking-tight">
          Review Velocity
        </h3>
        <p className="text-sm text-[#6B7C93] mt-1">
          Week-over-week growth rate (last 12 weeks)
        </p>
      </div>
      
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={velocityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E3E8EE" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#6B7C93"
              fontSize={11}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis 
              yAxisId="left"
              stroke="#6B7C93" 
              fontSize={11} 
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="#6B7C93" 
              fontSize={11} 
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '4px',
                boxShadow: '0 2px 5px 0 rgba(60,66,87,0.08), 0 1px 1px 0 rgba(0,0,0,0.12)',
                border: '1px solid #E3E8EE',
                backgroundColor: '#FFFFFF',
                padding: '8px 12px',
              }}
              formatter={(value: number, name: string) => {
                if (name === 'count') return [value, 'Reviews']
                if (name === 'velocity') return [`${value.toFixed(1)}%`, 'Growth Rate']
                return [value, name]
              }}
              labelFormatter={(value) => `Week of ${new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="count" fill={COLORS.primary} name="Weekly Reviews" radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="velocity" stroke={COLORS.success} strokeWidth={2} name="Growth Rate (%)" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// Problem Spotlight - Shows low rating concentration by department
export function ProblemSpotlight({ reviews, departments }: ProblemSpotlightProps) {
  const deptData = departments.map(dept => {
    const deptReviews = reviews.filter(r => r.department_id === dept.id)
    const lowRatingCount = deptReviews.filter(r => r.rating <= 2).length
    const lowRatingPercent = deptReviews.length > 0 ? (lowRatingCount / deptReviews.length) * 100 : 0

    return {
      name: dept.name.length > 20 ? dept.name.substring(0, 20) + '...' : dept.name,
      fullName: dept.name,
      total: deptReviews.length,
      lowRatingCount: lowRatingCount,
      lowRatingPercent: lowRatingPercent,
      isHighRisk: lowRatingPercent > 10 // Flag if >10% are low ratings
    }
  })
  .filter(d => d.total > 0) // Only show departments with reviews
  .sort((a, b) => b.lowRatingPercent - a.lowRatingPercent) // Sort by worst first
  .slice(0, 10) // Top 10 worst
  
  console.log('ProblemSpotlight - Reviews:', reviews.length)
  console.log('ProblemSpotlight - Departments:', departments.length) 
  console.log('ProblemSpotlight - Chart data:', deptData)

  return (
    <div className="bg-white rounded-md border border-[#E3E8EE] p-6 mb-6 transition-all duration-150 hover:shadow-soft">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#0A2540] tracking-tight">
          Problem Spotlight: Low Ratings by Department
        </h3>
        <p className="text-sm text-[#6B7C93] mt-1">
          Identify departments with highest concentration of 1-2 star reviews
        </p>
        <div className="mt-3 p-3 bg-red-50 border-l-4 border-red-400 rounded">
          <p className="text-xs text-[#0A2540] font-medium mb-1">🚨 Why This Matters</p>
          <p className="text-xs text-[#425466]">
            In insurance, bad reviews hurt retention and reputation. Departments with {'>'} 10% low ratings (shown in red) 
            need immediate attention. These are compliance risks and indicate broken processes that need fixing now.
          </p>
        </div>
      </div>
      
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={deptData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#E3E8EE" horizontal={true} vertical={false} />
            <XAxis 
              type="number" 
              stroke="#6B7C93" 
              fontSize={11}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${value}%`}
              domain={[0, 'auto']}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              stroke="#6B7C93" 
              fontSize={11}
              width={120}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(246, 249, 252, 0.5)' }}
              contentStyle={{
                borderRadius: '4px',
                boxShadow: '0 2px 5px 0 rgba(60,66,87,0.08), 0 1px 1px 0 rgba(0,0,0,0.12)',
                border: '1px solid #E3E8EE',
                backgroundColor: '#FFFFFF',
                padding: '8px 12px',
              }}
              formatter={(value: number, name: string, props: any) => {
                if (name === 'lowRatingPercent') {
                  return [
                    `${value.toFixed(1)}% (${props.payload.lowRatingCount} of ${props.payload.total} reviews)`,
                    '1-2 Star Rate'
                  ]
                }
                return [value, name]
              }}
              labelFormatter={(label, payload) => {
                if (payload && payload[0]) {
                  return payload[0].payload.fullName
                }
                return label
              }}
            />
            <Bar 
              dataKey="lowRatingPercent" 
              name="Low Rating %"
              radius={[0, 4, 4, 0]}
              barSize={16}
            >
              {deptData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isHighRisk ? COLORS.danger : COLORS.warning}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend explaining colors */}
      <div className="mt-4 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.danger }}></div>
          <span className="text-[#425466]">High Risk ({'>'} 10%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.warning }}></div>
          <span className="text-[#425466]">Needs Monitoring ({'<'} 10%)</span>
        </div>
      </div>
    </div>
  )
}