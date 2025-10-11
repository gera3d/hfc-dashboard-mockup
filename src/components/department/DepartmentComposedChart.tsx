"use client";

import { 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface DepartmentComposedChartProps {
  data: Array<{
    departmentName: string;
    totalReviews: number;
    avgRating: number;
    fiveStarRate: number;
    problemReviews: number;
  }>;
}

export function DepartmentComposedChart({ data }: DepartmentComposedChartProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
          Department Volume vs Quality
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Review volume (bars) with quality overlay (lines)
        </p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis 
            dataKey="departmentName" 
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            className="dark:fill-gray-400"
          />
          <YAxis 
            yAxisId="left"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            label={{ value: 'Review Count', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            domain={[0, 5]}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            label={{ value: 'Rating', angle: 90, position: 'insideRight', style: { fill: '#6b7280' } }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
            formatter={(value: any, name: string) => {
              if (name === 'avgRating') return [value.toFixed(2) + '★', 'Avg Rating'];
              if (name === 'fiveStarRate') return [value.toFixed(1) + '%', '5-Star %'];
              return [value, name];
            }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          
          {/* Bars for volume */}
          <Bar 
            yAxisId="left"
            dataKey="totalReviews" 
            fill="#3b82f6" 
            name="Total Reviews"
            radius={[8, 8, 0, 0]}
            opacity={0.8}
          />
          <Bar 
            yAxisId="left"
            dataKey="problemReviews" 
            fill="#ef4444" 
            name="Problem Reviews"
            radius={[8, 8, 0, 0]}
            opacity={0.8}
          />
          
          {/* Lines for quality metrics */}
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="avgRating" 
            stroke="#22c55e" 
            strokeWidth={3}
            name="Avg Rating"
            dot={{ r: 5, fill: '#22c55e' }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-900/50">
        <p className="text-xs text-blue-800 dark:text-blue-300">
          <strong>💡 Insight:</strong> This chart shows the relationship between review volume and quality. 
          High volume with high ratings indicates strong performance. High volume with low ratings needs immediate attention.
        </p>
      </div>
    </div>
  );
}
