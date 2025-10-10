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
  // Only show agents with reviews
  const chartData = data
    .filter(agent => agent.total > 0)
    .slice(0, limit)
    .map(agent => ({
      name: agent.agent_name,
      reviews: agent.total,
      rating: agent.avg_rating,
      percent_5_star: agent.percent_5_star,
      department: agent.department_name
    }))
  
  console.log('AgentLeaderboard - Input data:', data.slice(0, 3))
  console.log('AgentLeaderboard - Chart data:', chartData.slice(0, 3))

  return (
    <div className="bg-white rounded-md border border-[#E3E8EE] p-6 mb-6 transition-all duration-150 hover:shadow-soft">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#0A2540] tracking-tight">
          Agent Performance Rankings
        </h3>
        <p className="text-sm text-[#6B7C93] mt-1">
          Top agents by review volume and quality
        </p>
        <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
          <p className="text-xs text-[#0A2540] font-medium mb-1">💡 Why This Matters</p>
          <p className="text-xs text-[#425466]">
            Identify your star agents for recognition and struggling agents for coaching. 
            High volume with high ratings = replicate their approach. High volume with low ratings = need training.
          </p>
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#E3E8EE" horizontal={true} vertical={false} />
            <XAxis 
              type="number" 
              stroke="#6B7C93" 
              fontSize={11}
              axisLine={false}
              tickLine={false}
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
              formatter={(value: number, name: string) => {
                if (name === 'Reviews Handled') return [value, 'Reviews']
                if (name === 'Avg Rating') return [value.toFixed(2) + ' / 5.00', 'Rating']
                return [value, name]
              }}
            />
            <Legend />
            <Bar 
              dataKey="reviews" 
              fill={COLORS.primary}
              name="Reviews Handled"
              radius={[0, 4, 4, 0]}
              barSize={14}
            />
            <Bar 
              dataKey="rating" 
              fill={COLORS.success}
              name="Avg Rating"
              radius={[0, 4, 4, 0]}
              barSize={14}
            />
          </BarChart>
        </ResponsiveContainer>
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