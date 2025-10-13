"use client";

import Badge from "@/components/tailadmin/ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon } from "@/icons";
import { Star, MessageCircle, Award, AlertTriangle, ThumbsUp, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { MetricsSummary } from "@/data/dataService";
import { useEffect, useState } from "react";

interface EnhancedMetricsGridProps {
  metrics: MetricsSummary;
  previousMetrics?: MetricsSummary | null;
  showComparison?: boolean;
}

export default function EnhancedMetricsGrid({ metrics, previousMetrics, showComparison }: EnhancedMetricsGridProps) {
  // Disabled animations for now
  const [displayedFiveStarRate, setDisplayedFiveStarRate] = useState(0);
  const [displayedTotal, setDisplayedTotal] = useState(0);
  const [displayedAvgRating, setDisplayedAvgRating] = useState(0);
  const [displayedProblems, setDisplayedProblems] = useState(0);
  
  // Calculate key metrics
  const fiveStarRate = (metrics.star_5 / metrics.total) * 100;
  const prevFiveStarRate = previousMetrics ? (previousMetrics.star_5 / previousMetrics.total) * 100 : null;
  
  const problemReviews = metrics.star_1 + metrics.star_2;
  const prevProblemReviews = previousMetrics ? previousMetrics.star_1 + previousMetrics.star_2 : null;
  
  const positiveReviews = metrics.star_4 + metrics.star_5;
  const positiveRate = (positiveReviews / metrics.total) * 100;

  // Helper to calculate percentage change
  const getChange = (current: number, previous: number | null) => {
    if (!showComparison || previous === null || previous === 0) return null;
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(2),
      isPositive: change >= 0,
      isNegative: change < 0,
    };
  };

  const satisfactionChange = getChange(fiveStarRate, prevFiveStarRate);
  const totalChange = getChange(metrics.total, previousMetrics?.total || null);
  const ratingChange = getChange(metrics.avg_rating, previousMetrics?.avg_rating || null);
  const problemChange = getChange(problemReviews, prevProblemReviews);

  // Purpose: Determine if business health requires attention
  const getHealthStatus = () => {
    if (fiveStarRate >= 90) return { status: "Excellent", color: "success", description: "Outstanding performance" };
    if (fiveStarRate >= 75) return { status: "Good", color: "success", description: "Solid performance" };
    if (fiveStarRate >= 60) return { status: "Fair", color: "warning", description: "Room for improvement" };
    return { status: "Needs Attention", color: "error", description: "Action required" };
  };

  const healthStatus = getHealthStatus();
  const isProblemIncreasing = problemChange?.isPositive;
  
  // Detect big positive changes for celebration animations
  const isSatisfactionSurging = satisfactionChange?.isPositive && parseFloat(satisfactionChange.value) >= 5; // 5%+ improvement
  const isReviewsOnFire = totalChange?.isPositive && parseFloat(totalChange.value) >= 20; // 20%+ increase

  // Check if status is excellent for special styling
  const isExcellent = healthStatus.status === "Excellent";
  
  // Count-up animation effect
  useEffect(() => {
    const duration = 1500; // Even slower, more relaxed (was 1200ms)
    const steps = 90; // More steps for ultra-smooth motion (was 80)
    const stepDuration = duration / steps;
    
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      // Even gentler ease-out curve
      const easeOutQuint = 1 - Math.pow(1 - progress, 5); 
      
      setDisplayedFiveStarRate(fiveStarRate * easeOutQuint);
      setDisplayedTotal(Math.floor(metrics.total * easeOutQuint));
      setDisplayedAvgRating(metrics.avg_rating * easeOutQuint);
      setDisplayedProblems(Math.floor(problemReviews * easeOutQuint));
      
      if (currentStep >= steps) {
        clearInterval(interval);
        // Set final values to ensure precision
        setDisplayedFiveStarRate(fiveStarRate);
        setDisplayedTotal(metrics.total);
        setDisplayedAvgRating(metrics.avg_rating);
        setDisplayedProblems(problemReviews);
      }
    }, stepDuration);
    
    return () => clearInterval(interval);
  }, [fiveStarRate, metrics.total, metrics.avg_rating, problemReviews]);
  
  return (
    <div className="space-y-6">
      {/* ALL METRICS - RESPONSIVE GRID: 2 cols mobile, 4 cols desktop (Rating Distribution moved to standalone widget) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 md:gap-6">
        
        {/* 1. CUSTOMER SATISFACTION */}
        <div 
          className={`relative flex flex-col rounded-lg sm:rounded-2xl border p-3 sm:p-6 ${
            isExcellent 
              ? 'border-green-300 bg-gradient-to-br from-green-50 to-white dark:border-green-700 dark:from-green-950/30 dark:to-gray-900 shadow-green-100 dark:shadow-green-900/20' 
              : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]'
          }`}
        >
          {/* Top Section - Icon + Badge */}
          <div className="flex items-start justify-between mb-2 sm:mb-4">
            <div className={`flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl transition-all duration-700 ${
              isSatisfactionSurging ? 'animate-bounce-subtle' : ''
            } ${
              isExcellent 
                ? 'bg-green-500 shadow-lg shadow-green-200 dark:shadow-green-900/50' 
                : 'bg-green-100 dark:bg-green-900/20'
            }`}>
              <ThumbsUp className={`size-4 sm:size-6 transition-colors duration-700 ${
                isExcellent 
                  ? 'text-white' 
                  : 'text-green-600 dark:text-green-400'
              }`} />
            </div>
            <div className="flex flex-col items-end gap-0.5 sm:gap-1">
              <Badge color={healthStatus.color as any}>
                <span className="text-[10px] sm:text-xs">{healthStatus.status}</span>
              </Badge>
              {isSatisfactionSurging && (
                <span 
                  className="text-[10px] sm:text-xs font-bold text-green-600 dark:text-green-400 animate-pulse cursor-help hidden sm:inline" 
                  title="Amazing! Customer satisfaction jumped 5%+ compared to last period!"
                >
                  🚀 SURGE
                </span>
              )}
            </div>
          </div>

          {/* Middle Section - Label + Value */}
          <div className="flex-1">
            <span className={`block text-[10px] sm:text-sm text-gray-500 dark:text-gray-400 mb-1 sm:mb-2`} style={{ animationDelay: '250ms' }}>
              Customer Satisfaction
            </span>
            <h4 className={`font-bold text-lg sm:text-title-xl transition-all duration-700 ${
              isExcellent 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-gray-800 dark:text-white/90'
            }`}>
              {displayedFiveStarRate.toFixed(1)}%
            </h4>
            <span className={`text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 block`} style={{ animationDelay: '350ms' }}>5-star rate</span>
          </div>

          {/* Bottom Section - Trend */}
          {satisfactionChange && (
            <div className="flex items-center gap-1 sm:gap-2 mt-2 sm:mt-4 pt-2 sm:pt-4 border-t border-gray-100 dark:border-gray-800">
              <Badge color={satisfactionChange.isPositive ? "success" : "error"}>
                <span className="text-[10px] sm:text-xs flex items-center gap-0.5">
                  {satisfactionChange.isPositive ? <ArrowUpIcon /> : <ArrowDownIcon />}
                  {satisfactionChange.value}%
                </span>
              </Badge>
              <span className="text-[10px] sm:text-xs text-gray-500 hidden sm:inline">vs last period</span>
            </div>
          )}
        </div>

        {/* 2. TOTAL REVIEWS */}
        <div 
          className="flex flex-col rounded-lg sm:rounded-2xl border border-gray-200 bg-white p-3 sm:p-6 dark:border-gray-800 dark:bg-white/[0.03]"
        >
          {/* Top Section - Icon */}
          <div className="flex items-start justify-between mb-2 sm:mb-4">
            <div className={`flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 bg-blue-100 rounded-lg sm:rounded-xl dark:bg-blue-900/20 ${
              isReviewsOnFire ? 'animate-bounce-subtle' : ''
            }`} style={{ animationDelay: '250ms' }}>
              <MessageCircle className="text-blue-600 size-4 sm:size-6 dark:text-blue-400" />
            </div>
            {isReviewsOnFire && (
              <span 
                className="text-lg sm:text-2xl animate-pulse cursor-help hidden sm:inline" 
                title="On fire! Review volume increased 20%+ compared to last period!"
              >
                🔥
              </span>
            )}
          </div>

          {/* Middle Section - Label + Value */}
          <div className="flex-1">
            <span className={`block text-[10px] sm:text-sm text-gray-500 dark:text-gray-400 mb-1 sm:mb-2`} style={{ animationDelay: '350ms' }}>
              Total Reviews
            </span>
            <h4 className="font-bold text-gray-800 text-lg sm:text-title-xl dark:text-white/90 transition-all duration-500">
              {displayedTotal.toLocaleString()}
            </h4>
          </div>

          {/* Bottom Section - Trend */}
          {totalChange && (
            <div className="flex items-center gap-1 sm:gap-2 mt-2 sm:mt-4 pt-2 sm:pt-4 border-t border-gray-100 dark:border-gray-800">
              <Badge color={totalChange.isPositive ? "success" : "error"}>
                <span className="text-[10px] sm:text-xs flex items-center gap-0.5">
                  {totalChange.isPositive ? <ArrowUpIcon /> : <ArrowDownIcon />}
                  {totalChange.value}%
                </span>
              </Badge>
              <span className="text-[10px] sm:text-xs text-gray-500 hidden sm:inline">vs last period</span>
            </div>
          )}
        </div>

        {/* 3. AVERAGE RATING */}
        <div 
          className="flex flex-col rounded-lg sm:rounded-2xl border border-gray-200 bg-white p-3 sm:p-6 dark:border-gray-800 dark:bg-white/[0.03]"
        >
          {/* Top Section - Icon */}
          <div className={`flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 mb-2 sm:mb-4 bg-amber-100 rounded-lg sm:rounded-xl dark:bg-amber-900/20`} style={{ animationDelay: '350ms' }}>
            <Star className="text-amber-600 size-4 sm:size-6 dark:text-amber-400 fill-amber-600 dark:fill-amber-400" />
          </div>

          {/* Middle Section - Label + Value */}
          <div className="flex-1">
            <span className={`block text-[10px] sm:text-sm text-gray-500 dark:text-gray-400 mb-1 sm:mb-2`} style={{ animationDelay: '450ms' }}>
              Average Rating
            </span>
            <div className="flex items-baseline gap-0.5 sm:gap-1">
              <h4 className="font-bold text-gray-800 text-lg sm:text-title-xl dark:text-white/90 transition-all duration-500">
                {displayedAvgRating.toFixed(2)}
              </h4>
              <span className="text-amber-500 text-lg sm:text-2xl leading-none">★</span>
            </div>
          </div>

          {/* Bottom Section - Trend */}
          {ratingChange && (
            <div className="flex items-center gap-1 sm:gap-2 mt-2 sm:mt-4 pt-2 sm:pt-4 border-t border-gray-100 dark:border-gray-800">
              <Badge color={ratingChange.isPositive ? "success" : "error"}>
                <span className="text-[10px] sm:text-xs flex items-center gap-0.5">
                  {ratingChange.isPositive ? <ArrowUpIcon /> : <ArrowDownIcon />}
                  {ratingChange.value}%
                </span>
              </Badge>
              <span className="text-[10px] sm:text-xs text-gray-500 hidden sm:inline">vs last period</span>
            </div>
          )}
        </div>

        {/* 4. PROBLEM REVIEWS */}
        <div 
          className={`flex flex-col rounded-lg sm:rounded-2xl border p-3 sm:p-6 ${
            isProblemIncreasing 
              ? "border-red-300 bg-red-50 dark:border-red-900/50 dark:bg-red-900/10 animate-pulse-subtle" 
              : "border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
          }`}
        >
          {/* Top Section - Icon + Alert Badge */}
          <div className={`flex items-start justify-between mb-2 sm:mb-4`} style={{ animationDelay: '450ms' }}>
            <div className={`flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl ${
              isProblemIncreasing 
                ? "bg-red-500 animate-shake" 
                : "bg-orange-100 dark:bg-orange-900/20"
            }`}>
              <AlertTriangle className={`size-4 sm:size-6 ${
                isProblemIncreasing 
                  ? "text-white" 
                  : "text-orange-600 dark:text-orange-400"
              }`} />
            </div>
            {isProblemIncreasing && (
              <span className="text-[10px] sm:text-xs font-bold text-red-600 dark:text-red-400 animate-pulse hidden sm:inline">
                ⚠️ ALERT
              </span>
            )}
          </div>

          {/* Middle Section - Label + Value */}
          <div className="flex-1">
            <span className={`block text-[10px] sm:text-sm text-gray-500 dark:text-gray-400 mb-1 sm:mb-2`} style={{ animationDelay: '550ms' }}>
              Problem Reviews
            </span>
            <h4 className="font-bold text-gray-800 text-lg sm:text-title-xl dark:text-white/90 transition-all duration-500">
              {displayedProblems}
            </h4>
            <span className={`text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 block`} style={{ animationDelay: '650ms' }}>1★+2★</span>
          </div>

          {/* Bottom Section - Trend */}
          {problemChange && (
            <div className="flex items-center gap-1 sm:gap-2 mt-2 sm:mt-4 pt-2 sm:pt-4 border-t border-gray-100 dark:border-gray-800">
              <Badge color={problemChange.isNegative ? "success" : "error"}>
                <span className="text-[10px] sm:text-xs flex items-center gap-0.5">
                  {problemChange.isPositive ? <ArrowUpIcon /> : <ArrowDownIcon />}
                  {problemChange.value}%
                </span>
              </Badge>
              <span className="text-[10px] sm:text-xs text-gray-500 hidden sm:inline">vs last period</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}


