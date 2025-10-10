"use client";
import React from "react";
import Badge from "@/components/tailadmin/ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon } from "@/icons";
import { Star, Users, MessageSquare, TrendingUp } from "lucide-react";
import { MetricsSummary } from "@/data/dataService";

interface ReviewMetricsProps {
  metrics: MetricsSummary;
  previousMetrics?: MetricsSummary | null;
}

export const ReviewMetrics: React.FC<ReviewMetricsProps> = ({ 
  metrics, 
  previousMetrics 
}) => {
  const calculatePercentChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const getChangeData = (current: number, previous?: number) => {
    if (!previous) return null;
    const change = calculatePercentChange(current, previous);
    return {
      change: Math.abs(change).toFixed(2),
      isPositive: change >= 0,
    };
  };

  const avgChange = previousMetrics 
    ? getChangeData(metrics.avg_rating, previousMetrics.avg_rating)
    : null;
  
  const totalChange = previousMetrics 
    ? getChangeData(metrics.total, previousMetrics.total)
    : null;

  const fiveStarChange = previousMetrics 
    ? getChangeData(metrics.percent_5_star, previousMetrics.percent_5_star)
    : null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
      {/* Average Rating */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-amber-100 rounded-xl dark:bg-amber-900/20">
          <Star className="text-amber-600 size-6 dark:text-amber-400 fill-amber-600 dark:fill-amber-400" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Average Rating
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {metrics.avg_rating.toFixed(2)} ★
            </h4>
          </div>
          {avgChange && (
            <Badge color={avgChange.isPositive ? "success" : "error"}>
              {avgChange.isPositive ? <ArrowUpIcon /> : <ArrowDownIcon />}
              {avgChange.change}%
            </Badge>
          )}
        </div>
      </div>

      {/* Total Reviews */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl dark:bg-blue-900/20">
          <MessageSquare className="text-blue-600 size-6 dark:text-blue-400" />
        </div>
        
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Reviews
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {metrics.total.toLocaleString()}
            </h4>
          </div>
          {totalChange && (
            <Badge color={totalChange.isPositive ? "success" : "error"}>
              {totalChange.isPositive ? <ArrowUpIcon /> : <ArrowDownIcon />}
              {totalChange.change}%
            </Badge>
          )}
        </div>
      </div>

      {/* 5-Star Percentage */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl dark:bg-green-900/20">
          <TrendingUp className="text-green-600 size-6 dark:text-green-400" />
        </div>
        
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              5-Star Reviews
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {metrics.percent_5_star.toFixed(1)}%
            </h4>
          </div>
          {fiveStarChange && (
            <Badge color={fiveStarChange.isPositive ? "success" : "error"}>
              {fiveStarChange.isPositive ? <ArrowUpIcon /> : <ArrowDownIcon />}
              {fiveStarChange.change}%
            </Badge>
          )}
        </div>
      </div>

      {/* Star Distribution Preview */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl dark:bg-purple-900/20">
          <Users className="text-purple-600 size-6 dark:text-purple-400" />
        </div>
        
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Star Distribution
            </span>
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <span className="w-8">5★</span>
                <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500" 
                    style={{ width: `${(metrics.star_5 / metrics.total) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right">{metrics.star_5}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <span className="w-8">4★</span>
                <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500" 
                    style={{ width: `${(metrics.star_4 / metrics.total) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right">{metrics.star_4}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
