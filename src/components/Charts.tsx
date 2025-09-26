'use client'

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { AgentMetrics } from '@/data/dataService'

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

export function TimeSeriesChart({ data }: TimeSeriesChartProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Trends Over Time</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#666"
              fontSize={12}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis stroke="#666" fontSize={12} />
            <Tooltip
              labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
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
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="total" 
              stroke="#3b82f6" 
              strokeWidth={3}
              name="Total Reviews"
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="star_5" 
              stroke="#10b981" 
              strokeWidth={2}
              name="5★ Reviews"
              dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="star_1" 
              stroke="#ef4444" 
              strokeWidth={2}
              name="1★ Reviews"
              dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function AgentLeaderboard({ data, limit = 10 }: AgentLeaderboardProps) {
  const chartData = data.slice(0, limit).map(agent => ({
    name: agent.agent_name,
    total: agent.total,
    avg_rating: agent.avg_rating,
    percent_5_star: agent.percent_5_star,
    department: agent.department_name
  }))

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Agents by Total Reviews</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" stroke="#666" fontSize={12} />
            <YAxis 
              type="category" 
              dataKey="name" 
              stroke="#666" 
              fontSize={12}
              width={100}
            />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === 'total') return [value, 'Total Reviews']
                if (name === 'avg_rating') return [value.toFixed(2), 'Average Rating']
                if (name === 'percent_5_star') return [`${value.toFixed(1)}%`, '5★ Rate']
                return [value, name]
              }}
              labelFormatter={(label) => `Agent: ${label}`}
            />
            <Bar 
              dataKey="total" 
              fill="#3b82f6"
              name="Total Reviews"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}