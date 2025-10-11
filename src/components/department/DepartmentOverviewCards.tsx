"use client";

import { TrendingUp, TrendingDown, Star, AlertCircle, MessageSquare, CheckCircle } from 'lucide-react';

interface DepartmentOverviewCardsProps {
  data: Array<{
    departmentName: string;
    totalReviews: number;
    avgRating: number;
    fiveStarRate: number;
    problemReviews: number;
    customerSatisfaction: number;
    responseRate: number;
  }>;
}

export function DepartmentOverviewCards({ data }: DepartmentOverviewCardsProps) {
  // Calculate summary stats
  const totalReviews = data.reduce((sum, dept) => sum + dept.totalReviews, 0);
  const avgOverallRating = data.reduce((sum, dept) => sum + (dept.avgRating * dept.totalReviews), 0) / totalReviews;
  const avgFiveStarRate = data.reduce((sum, dept) => sum + dept.fiveStarRate, 0) / data.length;
  const totalProblemReviews = data.reduce((sum, dept) => sum + dept.problemReviews, 0);
  const avgCustomerSat = data.reduce((sum, dept) => sum + dept.customerSatisfaction, 0) / data.length;
  const avgResponseRate = data.reduce((sum, dept) => sum + dept.responseRate, 0) / data.length;

  // Find best and worst performers
  const bestPerformer = data.reduce((best, dept) => 
    dept.fiveStarRate > best.fiveStarRate ? dept : best
  );
  const needsAttention = data.reduce((worst, dept) => 
    dept.problemReviews > worst.problemReviews ? dept : worst
  );

  const cards = [
    {
      title: 'Total Reviews',
      value: totalReviews.toLocaleString(),
      subtitle: 'Across all departments',
      icon: MessageSquare,
      color: 'blue',
      trend: null,
    },
    {
      title: 'Overall Rating',
      value: avgOverallRating.toFixed(2),
      subtitle: `${avgFiveStarRate.toFixed(1)}% are 5-star`,
      icon: Star,
      color: 'yellow',
      trend: avgOverallRating >= 4.5 ? 'up' : avgOverallRating >= 4.0 ? null : 'down',
    },
    {
      title: 'Customer Satisfaction',
      value: `${avgCustomerSat.toFixed(1)}%`,
      subtitle: 'Average across departments',
      icon: CheckCircle,
      color: 'green',
      trend: avgCustomerSat >= 90 ? 'up' : avgCustomerSat >= 75 ? null : 'down',
    },
    {
      title: 'Problem Reviews',
      value: totalProblemReviews.toLocaleString(),
      subtitle: `${needsAttention.departmentName} needs attention`,
      icon: AlertCircle,
      color: 'red',
      trend: 'down', // We want this to go down
    },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/10',
          border: 'border-blue-200 dark:border-blue-900/50',
          icon: 'text-blue-600 dark:text-blue-400',
          iconBg: 'bg-blue-100 dark:bg-blue-900/30',
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/10',
          border: 'border-yellow-200 dark:border-yellow-900/50',
          icon: 'text-yellow-600 dark:text-yellow-400',
          iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
        };
      case 'green':
        return {
          bg: 'bg-green-50 dark:bg-green-900/10',
          border: 'border-green-200 dark:border-green-900/50',
          icon: 'text-green-600 dark:text-green-400',
          iconBg: 'bg-green-100 dark:bg-green-900/30',
        };
      case 'red':
        return {
          bg: 'bg-red-50 dark:bg-red-900/10',
          border: 'border-red-200 dark:border-red-900/50',
          icon: 'text-red-600 dark:text-red-400',
          iconBg: 'bg-red-100 dark:bg-red-900/30',
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-900/10',
          border: 'border-gray-200 dark:border-gray-900/50',
          icon: 'text-gray-600 dark:text-gray-400',
          iconBg: 'bg-gray-100 dark:bg-gray-900/30',
        };
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
          Department Performance Overview
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Key metrics across all {data.length} departments
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => {
          const colors = getColorClasses(card.color);
          const Icon = card.icon;
          
          return (
            <div
              key={index}
              className={`rounded-2xl border ${colors.bg} ${colors.border} p-6 transition-all hover:shadow-lg`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`rounded-xl p-3 ${colors.iconBg}`}>
                  <Icon className={`w-5 h-5 ${colors.icon}`} />
                </div>
                {card.trend && (
                  <div className={`flex items-center gap-1 ${
                    card.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {card.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                  </div>
                )}
              </div>
              
              <div>
                <div className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
                  {card.value}
                </div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  {card.title}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {card.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top and Bottom Performers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Best Performer */}
        <div className="rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 dark:border-green-900/50 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-2">
              <Star className="w-5 h-5 text-green-600 dark:text-green-400 fill-current" />
            </div>
            <h4 className="font-bold text-green-800 dark:text-green-300">Top Performer</h4>
          </div>
          <div className="text-2xl font-bold text-green-900 dark:text-green-200 mb-1">
            {bestPerformer.departmentName}
          </div>
          <div className="text-sm text-green-700 dark:text-green-400">
            {bestPerformer.fiveStarRate.toFixed(1)}% 5-star rate • {bestPerformer.avgRating.toFixed(2)}★ average
          </div>
        </div>

        {/* Needs Attention */}
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 dark:border-amber-900/50 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-2">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h4 className="font-bold text-amber-800 dark:text-amber-300">Needs Attention</h4>
          </div>
          <div className="text-2xl font-bold text-amber-900 dark:text-amber-200 mb-1">
            {needsAttention.departmentName}
          </div>
          <div className="text-sm text-amber-700 dark:text-amber-400">
            {needsAttention.problemReviews} problem reviews • {needsAttention.avgRating.toFixed(2)}★ average
          </div>
        </div>
      </div>
    </div>
  );
}
