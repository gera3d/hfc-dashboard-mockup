"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Department } from '@/data/dataService';

interface DepartmentMetricsBarChartProps {
  data: Array<{
    departmentName: string;
    totalReviews: number;
    avgRating: number;
    fiveStarRate: number;
    problemRate: number;
  }>;
}

export function DepartmentMetricsBarChart({ data }: DepartmentMetricsBarChartProps) {
  // Color coding based on performance
  const getBarColor = (fiveStarRate: number) => {
    if (fiveStarRate >= 90) return '#22c55e'; // green-500
    if (fiveStarRate >= 75) return '#3b82f6'; // blue-500
    if (fiveStarRate >= 60) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
          Department Performance Comparison
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Compare key metrics across all departments
        </p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis type="number" className="text-xs fill-gray-600 dark:fill-gray-400" />
          <YAxis 
            type="category" 
            dataKey="departmentName" 
            width={90}
            className="text-xs fill-gray-600 dark:fill-gray-400"
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
            formatter={(value: any, name: string) => {
              if (name === 'avgRating') return [value.toFixed(2) + '★', 'Avg Rating'];
              if (name === 'fiveStarRate') return [value.toFixed(1) + '%', '5-Star Rate'];
              if (name === 'problemRate') return [value.toFixed(1) + '%', 'Problem Rate'];
              return [value, name];
            }}
          />
          <Legend />
          <Bar dataKey="totalReviews" fill="#3b82f6" name="Total Reviews" radius={[0, 4, 4, 0]} />
          <Bar dataKey="fiveStarRate" name="5-Star Rate (%)" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.fiveStarRate)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend explanation */}
      <div className="mt-4 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500"></div>
          <span>Excellent (≥90%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500"></div>
          <span>Good (75-89%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-amber-500"></div>
          <span>Fair (60-74%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500"></div>
          <span>Needs Attention (&lt;60%)</span>
        </div>
      </div>
    </div>
  );
}
