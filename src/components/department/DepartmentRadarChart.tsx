"use client";

import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface DepartmentRadarChartProps {
  departments: Array<{
    departmentName: string;
    totalReviews: number;
    avgRating: number;
    fiveStarRate: number;
    responseRate: number;
    customerSatisfaction: number;
  }>;
}

export function DepartmentRadarChart({ departments }: DepartmentRadarChartProps) {
  // Transform data for radar chart - normalize all metrics to 0-100 scale
  const radarData = [
    {
      metric: '5-Star Rate',
      ...Object.fromEntries(
        departments.map(dept => [dept.departmentName, dept.fiveStarRate])
      )
    },
    {
      metric: 'Avg Rating',
      ...Object.fromEntries(
        departments.map(dept => [dept.departmentName, (dept.avgRating / 5) * 100])
      )
    },
    {
      metric: 'Customer Sat.',
      ...Object.fromEntries(
        departments.map(dept => [dept.departmentName, dept.customerSatisfaction])
      )
    },
    {
      metric: 'Response Rate',
      ...Object.fromEntries(
        departments.map(dept => [dept.departmentName, dept.responseRate])
      )
    },
    {
      metric: 'Volume',
      ...Object.fromEntries(
        departments.map(dept => [
          dept.departmentName, 
          Math.min((dept.totalReviews / Math.max(...departments.map(d => d.totalReviews))) * 100, 100)
        ])
      )
    }
  ];

  // Color palette for departments
  const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
          Department Performance Radar
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Multi-dimensional performance comparison across departments
        </p>
      </div>

      <ResponsiveContainer width="100%" height={500}>
        <RadarChart data={radarData}>
          <PolarGrid stroke="#e5e7eb" className="dark:stroke-gray-700" />
          <PolarAngleAxis 
            dataKey="metric" 
            tick={{ fill: '#6b7280', fontSize: 12 }}
            className="dark:fill-gray-400"
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]}
            tick={{ fill: '#9ca3af', fontSize: 10 }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
            formatter={(value: any) => value.toFixed(1) + '%'}
          />
          <Legend />
          {departments.map((dept, index) => (
            <Radar
              key={dept.departmentName}
              name={dept.departmentName}
              dataKey={dept.departmentName}
              stroke={colors[index % colors.length]}
              fill={colors[index % colors.length]}
              fillOpacity={0.3}
              strokeWidth={2}
            />
          ))}
        </RadarChart>
      </ResponsiveContainer>

      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          <strong>How to read:</strong> Each axis represents a different performance metric normalized to 0-100%. 
          Larger shapes indicate better overall performance. Compare departments to identify strengths and improvement areas.
        </p>
      </div>
    </div>
  );
}
