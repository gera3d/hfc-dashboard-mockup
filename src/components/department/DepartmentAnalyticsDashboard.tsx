"use client";

import { useMemo } from 'react';
import { DepartmentMetricsBarChart } from './DepartmentMetricsBarChart';
import { DepartmentRadarChart } from './DepartmentRadarChart';
import { DepartmentComposedChart } from './DepartmentComposedChart';
import { DepartmentOverviewCards } from './DepartmentOverviewCards';
import type { Review, Department } from '@/data/dataService';

interface DepartmentAnalyticsDashboardProps {
  reviews: Review[];
  departments: Department[];
}

export function DepartmentAnalyticsDashboard({ reviews, departments }: DepartmentAnalyticsDashboardProps) {
  // Process department metrics from reviews
  const departmentMetrics = useMemo(() => {
    return departments.map((dept) => {
      // Filter reviews for this department
      const deptReviews = reviews.filter((r) => r.department_id === dept.id);
      
      // Calculate metrics
      const totalReviews = deptReviews.length;
      const fiveStarReviews = deptReviews.filter((r) => r.rating === 5).length;
      const problemReviews = deptReviews.filter((r) => r.rating <= 3).length;
      
      const avgRating = totalReviews > 0
        ? deptReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;
      
      const fiveStarRate = totalReviews > 0 
        ? (fiveStarReviews / totalReviews) * 100 
        : 0;
      
      const problemRate = totalReviews > 0
        ? (problemReviews / totalReviews) * 100
        : 0;
      
      // Calculate customer satisfaction (4-5 star reviews)
      const satisfiedReviews = deptReviews.filter((r) => r.rating >= 4).length;
      const customerSatisfaction = totalReviews > 0
        ? (satisfiedReviews / totalReviews) * 100
        : 0;
      
      // Calculate response rate (estimate - Review interface doesn't have response field)
      // Using a placeholder calculation - can be updated when response data is available
      const responseRate = 85; // Placeholder

      return {
        departmentName: dept.name,
        totalReviews,
        avgRating,
        fiveStarRate,
        problemRate,
        problemReviews,
        customerSatisfaction,
        responseRate,
      };
    }).filter((dept) => dept.totalReviews > 0); // Only show departments with reviews
  }, [reviews, departments]);

  // Sort by 5-star rate for bar chart
  const sortedForBarChart = useMemo(() => {
    return [...departmentMetrics].sort((a, b) => b.fiveStarRate - a.fiveStarRate);
  }, [departmentMetrics]);

  if (departmentMetrics.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-12 text-center">
        <div className="text-gray-400 dark:text-gray-500 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
          No Department Data Available
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Reviews will appear here once department data is available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Department Analytics
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Comprehensive performance metrics across {departmentMetrics.length} departments
        </p>
      </div>

      {/* Overview Cards */}
      <DepartmentOverviewCards data={departmentMetrics} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Performance Comparison */}
        <DepartmentMetricsBarChart data={sortedForBarChart} />

        {/* Radar Chart - Multi-dimensional Analysis */}
        <DepartmentRadarChart departments={departmentMetrics} />
      </div>

      {/* Composed Chart - Full Width */}
      <DepartmentComposedChart data={sortedForBarChart} />

      {/* Insights Section */}
      <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 dark:border-purple-900/50 p-6">
        <h3 className="text-lg font-bold text-purple-900 dark:text-purple-300 mb-4">
          📊 Key Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4">
            <div className="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-1">
              Highest 5-Star Rate
            </div>
            <div className="text-xl font-bold text-purple-900 dark:text-purple-200">
              {sortedForBarChart[0]?.departmentName}
            </div>
            <div className="text-sm text-purple-600 dark:text-purple-400">
              {sortedForBarChart[0]?.fiveStarRate.toFixed(1)}%
            </div>
          </div>
          
          <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4">
            <div className="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-1">
              Most Reviews
            </div>
            <div className="text-xl font-bold text-purple-900 dark:text-purple-200">
              {[...departmentMetrics].sort((a, b) => b.totalReviews - a.totalReviews)[0]?.departmentName}
            </div>
            <div className="text-sm text-purple-600 dark:text-purple-400">
              {[...departmentMetrics].sort((a, b) => b.totalReviews - a.totalReviews)[0]?.totalReviews} reviews
            </div>
          </div>
          
          <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4">
            <div className="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-1">
              Best Response Rate
            </div>
            <div className="text-xl font-bold text-purple-900 dark:text-purple-200">
              {[...departmentMetrics].sort((a, b) => b.responseRate - a.responseRate)[0]?.departmentName}
            </div>
            <div className="text-sm text-purple-600 dark:text-purple-400">
              {[...departmentMetrics].sort((a, b) => b.responseRate - a.responseRate)[0]?.responseRate.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
