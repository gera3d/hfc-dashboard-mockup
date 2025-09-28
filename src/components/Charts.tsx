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
  const chartData = data.slice(0, limit).map(agent => ({
    name: agent.agent_name,
    total: agent.total,
    avg_rating: agent.avg_rating,
    percent_5_star: agent.percent_5_star,
    department: agent.department_name
  }))

  return (
    <div className="bg-white rounded-md border border-[#E3E8EE] p-6 mb-6 transition-all duration-150 hover:shadow-soft">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#0A2540] tracking-tight">
          Top Agents by Total Reviews
        </h3>
        <p className="text-sm text-[#6B7C93] mt-1">
          Performance ranking based on review volume
        </p>
      </div>
      
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#E3E8EE" horizontal={true} vertical={false} />
            <XAxis 
              type="number" 
              stroke="#6B7C93" 
              fontSize={11}
              axisLine={false}
              tickLine={false}
              padding={{ left: 0, right: 10 }}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              stroke="#6B7C93" 
              fontSize={11}
              width={90}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7C93' }}
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
                if (name === 'total') return [value, 'Total Reviews']
                if (name === 'avg_rating') return [value.toFixed(2), 'Average Rating']
                if (name === 'percent_5_star') return [`${value.toFixed(1)}%`, '5★ Rate']
                return [value, name]
              }}
              labelFormatter={(label) => `Agent: ${label}`}
              animationDuration={150}
              animationEasing="ease-out"
            />
            <Bar 
              dataKey="total" 
              fill="#635BFF"
              name="Total Reviews"
              radius={[0, 4, 4, 0]}
              barSize={16}
              animationDuration={800}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}