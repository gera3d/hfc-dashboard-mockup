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
      {/* ALL METRICS IN ONE ROW - PROPERLY BALANCED */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 md:gap-6">
        
        {/* 1. CUSTOMER SATISFACTION */}
        <div 
          className={`relative flex flex-col rounded-2xl border p-6 ${
            isExcellent 
              ? 'border-green-300 bg-gradient-to-br from-green-50 to-white dark:border-green-700 dark:from-green-950/30 dark:to-gray-900 shadow-green-100 dark:shadow-green-900/20' 
              : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]'
          }`}
        >
          {/* Top Section - Icon + Badge */}
          <div className="flex items-start justify-between mb-4">
            <div className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-700 ${
              isExcellent 
                ? 'bg-green-500 shadow-lg shadow-green-200 dark:shadow-green-900/50' 
                : 'bg-green-100 dark:bg-green-900/20'
            }`}>
              <ThumbsUp className={`size-6 transition-colors duration-700 ${
                isExcellent 
                  ? 'text-white' 
                  : 'text-green-600 dark:text-green-400'
              }`} />
            </div>
            <Badge color={healthStatus.color as any}>
              {healthStatus.status}
            </Badge>
          </div>

          {/* Middle Section - Label + Value */}
          <div className="flex-1">
            <span className={`block text-sm text-gray-500 dark:text-gray-400 mb-2 ${isAnimating ? 'animate-fade-in' : ''}`} style={{ animationDelay: '250ms' }}>
              Customer Satisfaction
            </span>
            <h4 className={`font-bold text-title-xl transition-all duration-700 ${
              isExcellent 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-gray-800 dark:text-white/90'
            }`}>
              {displayedFiveStarRate.toFixed(1)}%
            </h4>
            <span className={`text-xs text-gray-500 mt-1 block ${isAnimating ? 'animate-fade-in' : ''}`} style={{ animationDelay: '350ms' }}>5-star rate</span>
          </div>

          {/* Bottom Section - Trend */}
          {satisfactionChange && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <Badge color={satisfactionChange.isPositive ? "success" : "error"}>
                {satisfactionChange.isPositive ? <ArrowUpIcon /> : <ArrowDownIcon />}
                {satisfactionChange.value}%
              </Badge>
              <span className="text-xs text-gray-500">vs last period</span>
            </div>
          )}
        </div>

        {/* 2. TOTAL REVIEWS */}
        <div 
          className={`flex flex-col rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] ${
            isExiting ? 'animate-zoom-out' : ''
          } ${
            isAnimating ? 'animate-slide-in-up' : ''
          }`}
          style={isAnimating ? { animationDelay: '100ms' } : undefined}
        >
          {/* Top Section - Icon */}
          <div className={`flex items-center justify-center w-12 h-12 mb-4 bg-blue-100 rounded-xl dark:bg-blue-900/20 ${isAnimating ? 'animate-slide-in-right' : ''}`} style={{ animationDelay: '250ms' }}>
            <MessageCircle className="text-blue-600 size-6 dark:text-blue-400" />
          </div>

          {/* Middle Section - Label + Value */}
          <div className="flex-1">
            <span className={`block text-sm text-gray-500 dark:text-gray-400 mb-2 ${isAnimating ? 'animate-fade-in' : ''}`} style={{ animationDelay: '350ms' }}>
              Total Reviews
            </span>
            <h4 className="font-bold text-gray-800 text-title-xl dark:text-white/90 transition-all duration-500">
              {displayedTotal.toLocaleString()}
            </h4>
          </div>

          {/* Bottom Section - Trend */}
          {totalChange && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <Badge color={totalChange.isPositive ? "success" : "error"}>
                {totalChange.isPositive ? <ArrowUpIcon /> : <ArrowDownIcon />}
                {totalChange.value}%
              </Badge>
              <span className="text-xs text-gray-500">vs last period</span>
            </div>
          )}
        </div>

        {/* 3. AVERAGE RATING */}
        <div 
          className={`flex flex-col rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] ${
            isExiting ? 'animate-zoom-out' : ''
          } ${
            isAnimating ? 'animate-slide-in-up' : ''
          }`}
          style={isAnimating ? { animationDelay: '200ms' } : undefined}
        >
          {/* Top Section - Icon */}
          <div className={`flex items-center justify-center w-12 h-12 mb-4 bg-amber-100 rounded-xl dark:bg-amber-900/20 ${isAnimating ? 'animate-slide-in-right' : ''}`} style={{ animationDelay: '350ms' }}>
            <Star className="text-amber-600 size-6 dark:text-amber-400 fill-amber-600 dark:fill-amber-400" />
          </div>

          {/* Middle Section - Label + Value */}
          <div className="flex-1">
            <span className={`block text-sm text-gray-500 dark:text-gray-400 mb-2 ${isAnimating ? 'animate-fade-in' : ''}`} style={{ animationDelay: '450ms' }}>
              Average Rating
            </span>
            <h4 className="font-bold text-gray-800 text-title-xl dark:text-white/90 transition-all duration-500">
              {displayedAvgRating.toFixed(2)} ★
            </h4>
          </div>

          {/* Bottom Section - Trend */}
          {ratingChange && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <Badge color={ratingChange.isPositive ? "success" : "error"}>
                {ratingChange.isPositive ? <ArrowUpIcon /> : <ArrowDownIcon />}
                {ratingChange.value}%
              </Badge>
              <span className="text-xs text-gray-500">vs last period</span>
            </div>
          )}
        </div>

        {/* 4. PROBLEM REVIEWS */}
        <div 
          className={`flex flex-col rounded-2xl border p-6 ${
            isExiting ? 'animate-zoom-out' : ''
          } ${
            isAnimating ? 'animate-slide-in-up' : ''
          } ${
            isProblemIncreasing 
              ? "border-red-300 bg-red-50 dark:border-red-900/50 dark:bg-red-900/10 animate-pulse-subtle" 
              : "border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
          }`}
          style={isAnimating ? { animationDelay: '300ms' } : undefined}
        >
          {/* Top Section - Icon + Alert Badge */}
          <div className={`flex items-start justify-between mb-4 ${isAnimating ? 'animate-slide-in-right' : ''}`} style={{ animationDelay: '450ms' }}>
            <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${
              isProblemIncreasing 
                ? "bg-red-500 animate-shake" 
                : "bg-orange-100 dark:bg-orange-900/20"
            }`}>
              <AlertTriangle className={`size-6 ${
                isProblemIncreasing 
                  ? "text-white" 
                  : "text-orange-600 dark:text-orange-400"
              }`} />
            </div>
            {isProblemIncreasing && (
              <span className="text-xs font-bold text-red-600 dark:text-red-400 animate-pulse">
                ⚠️ ALERT
              </span>
            )}
          </div>

          {/* Middle Section - Label + Value */}
          <div className="flex-1">
            <span className={`block text-sm text-gray-500 dark:text-gray-400 mb-2 ${isAnimating ? 'animate-fade-in' : ''}`} style={{ animationDelay: '550ms' }}>
              Problem Reviews
            </span>
            <h4 className="font-bold text-gray-800 text-title-xl dark:text-white/90 transition-all duration-500">
              {displayedProblems}
            </h4>
            <span className={`text-xs text-gray-500 mt-1 block ${isAnimating ? 'animate-fade-in' : ''}`} style={{ animationDelay: '650ms' }}>1★+2★</span>
          </div>

          {/* Bottom Section - Trend */}
          {problemChange && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <Badge color={problemChange.isNegative ? "success" : "error"}>
                {problemChange.isPositive ? <ArrowUpIcon /> : <ArrowDownIcon />}
                {problemChange.value}%
              </Badge>
              <span className="text-xs text-gray-500">vs last period</span>
            </div>
          )}
        </div>

        {/* 5. RATING DISTRIBUTION PIE CHART */}
        <div 
          className={`flex flex-col rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] ${
            isExiting ? 'animate-zoom-out' : ''
          } ${
            isAnimating ? 'animate-slide-in-up' : ''
          }`}
          style={isAnimating ? { animationDelay: '400ms' } : undefined}
        >
          {/* Top Section - Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="block text-sm text-gray-500 dark:text-gray-400">
                Rating Distribution
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {positiveRate.toFixed(1)}% positive
              </p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg dark:bg-gray-800">
              <BarChart3 className="text-gray-600 size-5 dark:text-gray-400" />
            </div>
          </div>

          {/* Middle Section - Pie Chart */}
          <div className="flex-1 flex items-center justify-center">
            <svg viewBox="0 0 200 200" className="w-full max-w-[120px]">
              {/* Calculate pie slices */}
              {(() => {
                const data = [
                  { stars: 5, count: metrics.star_5, color: "#22c55e" },
                  { stars: 4, count: metrics.star_4, color: "#3b82f6" },
                  { stars: 3, count: metrics.star_3, color: "#eab308" },
                  { stars: 2, count: metrics.star_2, color: "#f97316" },
                  { stars: 1, count: metrics.star_1, color: "#ef4444" },
                ];
                
                let cumulativePercent = 0;
                
                const getCoordinatesForPercent = (percent: number) => {
                  const x = Math.cos(2 * Math.PI * percent);
                  const y = Math.sin(2 * Math.PI * percent);
                  return [x, y];
                };

                return data.map((item, index) => {
                  const percentage = item.count / metrics.total;
                  if (percentage === 0) return null;
                  
                  const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
                  cumulativePercent += percentage;
                  const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
                  
                  const largeArcFlag = percentage > 0.5 ? 1 : 0;
                  
                  const pathData = [
                    `M 100 100`,
                    `L ${100 + startX * 80} ${100 + startY * 80}`,
                    `A 80 80 0 ${largeArcFlag} 1 ${100 + endX * 80} ${100 + endY * 80}`,
                    `Z`,
                  ].join(' ');

                  return (
                    <path
                      key={index}
                      d={pathData}
                      fill={item.color}
                      className="transition-all duration-300 hover:opacity-80"
                    />
                  );
                });
              })()}
              
              {/* Center circle for donut effect */}
              <circle cx="100" cy="100" r="55" fill="white" className="dark:fill-gray-800" />
              
              {/* Center text */}
              <text
                x="100"
                y="95"
                textAnchor="middle"
                className="text-2xl font-bold fill-gray-800 dark:fill-white"
              >
                {metrics.total.toLocaleString()}
              </text>
              <text
                x="100"
                y="112"
                textAnchor="middle"
                className="text-xs fill-gray-500 dark:fill-gray-400"
              >
                reviews
              </text>
            </svg>
          </div>

          {/* Compact Legend */}
          <div className="flex justify-between gap-1 w-full text-xs">
            {[
              { stars: 5, color: "bg-green-500", count: metrics.star_5 },
              { stars: 4, color: "bg-blue-500", count: metrics.star_4 },
              { stars: 3, color: "bg-yellow-500", count: metrics.star_3 },
              { stars: 2, color: "bg-orange-500", count: metrics.star_2 },
              { stars: 1, color: "bg-red-500", count: metrics.star_1 },
            ].map((item) => (
              <div key={item.stars} className="flex flex-col items-center flex-1">
                <div className={`w-2.5 h-2.5 ${item.color} rounded-full mb-1`} />
                <span className="text-gray-600 dark:text-gray-400 font-medium text-xs">{item.stars}★</span>
                <span className="text-gray-500 dark:text-gray-500 text-xs">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
