"use client";

import Badge from "@/components/tailadmin/ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon } from "@/icons";
import { Star, MessageCircle, Award, AlertTriangle, ThumbsUp, TrendingUp, TrendingDown, BarChart3, Sparkles, ChevronRight } from "lucide-react";
import { MetricsSummary } from "@/data/dataService";
import { useEffect, useState, useRef } from "react";

interface EnhancedMetricsGridProps {
  metrics: MetricsSummary;
  previousMetrics?: MetricsSummary | null;
  showComparison?: boolean;
}

export default function EnhancedMetricsGrid({ metrics, previousMetrics, showComparison }: EnhancedMetricsGridProps) {
  // State for smooth count-up animations
  const [displayedFiveStarRate, setDisplayedFiveStarRate] = useState(0);
  const [displayedTotal, setDisplayedTotal] = useState(0);
  const [displayedAvgRating, setDisplayedAvgRating] = useState(0);
  const [displayedProblems, setDisplayedProblems] = useState(0);
  
  // Animation state for staggered entrance
  const [isVisible, setIsVisible] = useState(false);
  
  // Reduced motion preference
  const prefersReducedMotion = useRef(false);
  
  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.current = mediaQuery.matches;
    
    // Trigger entrance animation
    setIsVisible(true);
  }, []);
  
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
      raw: change
    };
  };

  const satisfactionChange = getChange(fiveStarRate, prevFiveStarRate);
  const totalChange = getChange(metrics.total, previousMetrics?.total || null);
  const ratingChange = getChange(metrics.avg_rating, previousMetrics?.avg_rating || null);
  const problemChange = getChange(problemReviews, prevProblemReviews);

  // Purpose: Determine if business health requires attention
  const getHealthStatus = () => {
    if (fiveStarRate >= 90) return { 
      status: "Excellent", 
      color: "success", 
      description: "Outstanding performance",
      message: "Keep up the amazing work!"
    };
    if (fiveStarRate >= 75) return { 
      status: "Good", 
      color: "success", 
      description: "Solid performance",
      message: "On the right track"
    };
    if (fiveStarRate >= 60) return { 
      status: "Fair", 
      color: "warning", 
      description: "Room for improvement",
      message: "Let's boost this up"
    };
    return { 
      status: "Needs Attention", 
      color: "error", 
      description: "Action required",
      message: "Immediate focus needed"
    };
  };

  const healthStatus = getHealthStatus();
  const isProblemIncreasing = problemChange?.isPositive;
  
  // Detect big positive changes for celebration animations
  const isSatisfactionSurging = satisfactionChange?.isPositive && parseFloat(satisfactionChange.value) >= 5;
  const isReviewsOnFire = totalChange?.isPositive && parseFloat(totalChange.value) >= 20;

  // Check if status is excellent for special styling
  const isExcellent = healthStatus.status === "Excellent";
  
  // Count-up animation with staggered timing
  useEffect(() => {
    if (prefersReducedMotion.current) {
      // Skip animation for reduced motion preference
      setDisplayedFiveStarRate(fiveStarRate);
      setDisplayedTotal(metrics.total);
      setDisplayedAvgRating(metrics.avg_rating);
      setDisplayedProblems(problemReviews);
      return;
    }
    
    // Reset to 0 first for the animation effect
    setDisplayedFiveStarRate(0);
    setDisplayedTotal(0);
    setDisplayedAvgRating(0);
    setDisplayedProblems(0);
    
    const duration = 1800; // Slightly longer for more elegance
    const steps = 100; // More steps for ultra-smooth motion
    const stepDuration = duration / steps;
    
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      // Elegant ease-out curve
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      setDisplayedFiveStarRate(fiveStarRate * easeOutQuart);
      setDisplayedTotal(Math.floor(metrics.total * easeOutQuart));
      setDisplayedAvgRating(metrics.avg_rating * easeOutQuart);
      setDisplayedProblems(Math.floor(problemReviews * easeOutQuart));
      
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
  
  // Mini sparkline component for trends
  const TrendSparkline = ({ change }: { change: any }) => {
    if (!change) return null;
    const isUp = change.isPositive;
    const points = isUp ? "M0,20 L10,15 L20,10 L30,8 L40,5" : "M0,5 L10,8 L20,10 L30,15 L40,20";
    
    return (
      <svg width="40" height="20" className="opacity-30 ml-2" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
        <path 
          d={points} 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };
  
  return (
    <div className="space-y-6">
      {/* ALL METRICS - RESPONSIVE GRID: 2 cols mobile, 4 cols desktop */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 md:gap-6">
        
        {/* 1. CUSTOMER SATISFACTION - Primary Metric for Business Owner */}
        <div 
          className={`group relative flex flex-col rounded-xl sm:rounded-2xl border-2 p-5 sm:p-7 transition-all duration-500 cursor-pointer overflow-hidden
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            hover:scale-[1.03] hover:-translate-y-1 active:scale-[0.99]
            ${isExcellent 
              ? 'border-green-400/80 bg-gradient-to-br from-green-100/80 via-white to-emerald-100/60 dark:border-green-500/70 dark:from-green-900/50 dark:via-gray-800 dark:to-emerald-900/40 shadow-2xl shadow-green-300/80 dark:shadow-green-700/60' 
              : 'border-gray-300/70 bg-white dark:border-gray-600/60 dark:bg-gray-800/70 hover:border-green-300/70 dark:hover:border-green-600/60 hover:shadow-xl shadow-md'
          }`}
          style={{ 
            transitionDelay: '0ms'
          }}
          role="button"
          tabIndex={0}
          aria-label={`Customer Satisfaction: ${displayedFiveStarRate.toFixed(1)}% - ${healthStatus.status}`}
        >
          {/* Premium gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/30 to-transparent pointer-events-none" />
          
          {/* Refined accent bar with gradient and glow */}
          <div className={`absolute top-0 left-0 right-0 h-1.5 sm:h-2 transition-all duration-700 ${
            isExcellent 
              ? 'bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-500 shadow-lg shadow-green-500/60' 
              : 'bg-gradient-to-r from-green-300 via-green-400 to-green-300 opacity-0 group-hover:opacity-100'
          }`} />

          {/* Top Section - Icon + Badge */}
          <div className="flex items-start justify-between mb-4 sm:mb-5 relative z-10">
            <div className={`flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl transition-all duration-700 ${
              isSatisfactionSurging ? 'animate-bounce-subtle' : ''
            } ${
              isExcellent 
                ? 'bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 shadow-xl shadow-green-400/70 dark:shadow-green-500/50 scale-105' 
                : 'bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-800/40 dark:to-emerald-800/30 group-hover:scale-105 group-hover:shadow-md'
            }`}>
              <ThumbsUp className={`size-6 sm:size-9 transition-all duration-700 ${
                isExcellent 
                  ? 'text-white drop-shadow-lg' 
                  : 'text-green-700 dark:text-green-300'
              }`} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <Badge color={healthStatus.color as any}>
                <span className="text-xs sm:text-sm font-bold tracking-wide px-1">{healthStatus.status}</span>
              </Badge>
              {isSatisfactionSurging && (
                <div className="flex items-center gap-1 bg-green-600/20 dark:bg-green-500/20 px-2.5 py-1 rounded-full border border-green-400/50 dark:border-green-500/40 shadow-sm">
                  <Sparkles className="size-3.5 text-green-700 dark:text-green-300" />
                  <span className="text-[10px] sm:text-xs font-bold text-green-700 dark:text-green-300 uppercase tracking-wider">
                    Surge
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Middle Section - Label + Value */}
          <div className="flex-1 relative z-10">
            <span className="block text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300 mb-2 sm:mb-3 uppercase tracking-wider">
              Customer Satisfaction
            </span>
            <div className="flex items-baseline gap-2 mb-2">
              <h4 className={`font-black text-3xl sm:text-5xl transition-all duration-700 tabular-nums leading-none ${
                isExcellent 
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 dark:from-green-400 dark:via-emerald-400 dark:to-green-400 drop-shadow-sm' 
                  : 'text-gray-900 dark:text-white'
              }`}>
                {displayedFiveStarRate.toFixed(1)}
                <span className="text-2xl sm:text-3xl ml-0.5">%</span>
              </h4>
              {satisfactionChange && <TrendSparkline change={satisfactionChange} />}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className={`text-xs sm:text-sm ${
                isExcellent ? 'text-green-700 dark:text-green-300 font-bold' : 'text-gray-600 dark:text-gray-300 font-semibold'
              }`}>
                5-star rate
              </span>
              {isExcellent && (
                <span className="text-xs text-green-600 dark:text-green-400 italic font-medium">
                  {healthStatus.message}
                </span>
              )}
            </div>
          </div>

          {/* Bottom Section - Trend with enhanced visual */}
          {satisfactionChange && (
            <div className="flex items-center justify-between gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100/80 dark:border-gray-700/50 relative z-10">
              <div className="flex items-center gap-1.5">
                <Badge color={satisfactionChange.isPositive ? "success" : "error"}>
                  <span className="text-[10px] sm:text-xs flex items-center gap-1 font-semibold shadow-sm">
                    {satisfactionChange.isPositive ? <ArrowUpIcon className="size-3" /> : <ArrowDownIcon className="size-3" />}
                    {satisfactionChange.value}%
                  </span>
                </Badge>
                <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">vs last period</span>
              </div>
              <ChevronRight className="size-4 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
          
          {/* Hover glow effect */}
          <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-400/0 via-green-400/0 to-green-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </div>

        {/* 2. TOTAL REVIEWS - Volume Indicator */}
        <div 
          className={`group relative flex flex-col rounded-xl sm:rounded-2xl border-2 p-5 sm:p-7 transition-all duration-500 cursor-pointer overflow-hidden
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            hover:scale-[1.03] hover:-translate-y-1 active:scale-[0.99]
            ${isReviewsOnFire
              ? 'border-blue-400/80 bg-gradient-to-br from-blue-100/80 via-white to-orange-100/50 dark:border-blue-500/70 dark:from-blue-900/50 dark:via-gray-800 dark:to-orange-900/30 shadow-2xl shadow-blue-300/80 dark:shadow-blue-700/60'
              : 'border-gray-300/70 bg-white dark:border-gray-600/60 dark:bg-gray-800/70 hover:border-blue-300/70 dark:hover:border-blue-600/60 hover:shadow-xl shadow-md'
          }`}
          style={{ 
            transitionDelay: '100ms'
          }}
          role="button"
          tabIndex={0}
          aria-label={`Total Reviews: ${displayedTotal.toLocaleString()}`}
        >
          {/* Premium gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/30 to-transparent pointer-events-none" />
          
          {/* Refined accent bar */}
          <div className={`absolute top-0 left-0 right-0 h-1.5 sm:h-2 transition-all duration-700 ${
            isReviewsOnFire 
              ? 'bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 shadow-lg shadow-orange-500/60' 
              : 'bg-gradient-to-r from-blue-300 via-blue-400 to-blue-300 opacity-0 group-hover:opacity-100'
          }`} />

          {/* Top Section */}
          <div className="flex items-start justify-between mb-4 sm:mb-5 relative z-10">
            <div className={`flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl transition-all duration-500 ${
              isReviewsOnFire 
                ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-600 animate-bounce-subtle shadow-xl shadow-blue-400/70 dark:shadow-blue-500/50 scale-105' 
                : 'bg-gradient-to-br from-blue-100 to-blue-100 dark:from-blue-800/40 dark:to-blue-800/30 group-hover:scale-105 group-hover:shadow-md'
            }`}>
              <MessageCircle className={`size-6 sm:size-9 transition-colors duration-500 ${
                isReviewsOnFire ? 'text-white drop-shadow-lg' : 'text-blue-700 dark:text-blue-300'
              }`} strokeWidth={2.5} />
            </div>
            {isReviewsOnFire && (
              <div className="text-4xl sm:text-5xl animate-pulse drop-shadow-lg" title="On fire! Review volume increased 20%+ compared to last period!">
                🔥
              </div>
            )}
          </div>

          {/* Middle Section */}
          <div className="flex-1 relative z-10">
            <span className="block text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300 mb-2 sm:mb-3 uppercase tracking-wider">
              Total Reviews
            </span>
            <div className="flex items-baseline gap-2 mb-2">
              <h4 className={`font-black text-3xl sm:text-5xl transition-all duration-500 tabular-nums leading-none ${
                isReviewsOnFire 
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 dark:from-blue-400 dark:via-blue-500 dark:to-blue-400 drop-shadow-sm' 
                  : 'text-gray-900 dark:text-white'
              }`}>
                {displayedTotal.toLocaleString()}
              </h4>
              {totalChange && <TrendSparkline change={totalChange} />}
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs sm:text-sm ${
                isReviewsOnFire ? 'text-blue-700 dark:text-blue-300 font-bold' : 'text-gray-600 dark:text-gray-300 font-semibold'
              }`}>
                all sources
              </span>
            </div>
          </div>

          {/* Bottom Section */}
          {totalChange && (
            <div className="flex items-center justify-between gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100/80 dark:border-gray-700/50 relative z-10">
              <div className="flex items-center gap-1.5">
                <Badge color={totalChange.isPositive ? "success" : "error"}>
                  <span className="text-[10px] sm:text-xs flex items-center gap-1 font-semibold shadow-sm">
                    {totalChange.isPositive ? <ArrowUpIcon className="size-3" /> : <ArrowDownIcon className="size-3" />}
                    {totalChange.value}%
                  </span>
                </Badge>
                <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">vs last period</span>
              </div>
              <ChevronRight className="size-4 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
          
          {/* Hover glow effect */}
          <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-400/0 via-blue-400/0 to-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </div>

        {/* 3. AVERAGE RATING - Quality Metric */}
        <div 
          className={`group relative flex flex-col rounded-xl sm:rounded-2xl border-2 p-5 sm:p-7 transition-all duration-500 cursor-pointer overflow-hidden
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            hover:scale-[1.03] hover:-translate-y-1 active:scale-[0.99]
            ${metrics.avg_rating >= 4.8
              ? 'border-amber-400/80 bg-gradient-to-br from-amber-100/80 via-white to-yellow-100/60 dark:border-amber-500/70 dark:from-amber-900/50 dark:via-gray-800 dark:to-yellow-900/40 shadow-2xl shadow-amber-300/80 dark:shadow-amber-700/60'
              : 'border-gray-300/70 bg-white dark:border-gray-600/60 dark:bg-gray-800/70 hover:border-amber-300/70 dark:hover:border-amber-600/60 hover:shadow-xl shadow-md'
          }`}
          style={{ 
            transitionDelay: '200ms'
          }}
          role="button"
          tabIndex={0}
          aria-label={`Average Rating: ${displayedAvgRating.toFixed(2)} out of 5`}
        >
          {/* Premium gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/30 to-transparent pointer-events-none" />
          
          {/* Refined accent bar */}
          <div className={`absolute top-0 left-0 right-0 h-1.5 sm:h-2 transition-all duration-700 ${
            metrics.avg_rating >= 4.8 
              ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 shadow-lg shadow-amber-500/60' 
              : 'bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 opacity-0 group-hover:opacity-100'
          }`} />

          {/* Top Section */}
          <div className="flex items-start justify-between mb-4 sm:mb-5 relative z-10">
            <div className={`flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl transition-all duration-500 ${
              metrics.avg_rating >= 4.8 
                ? 'bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 shadow-xl shadow-amber-400/70 dark:shadow-amber-500/50 scale-105' 
                : 'bg-gradient-to-br from-amber-100 to-amber-100 dark:from-amber-800/40 dark:to-amber-800/30 group-hover:scale-105 group-hover:shadow-md'
            }`}>
              <Star className={`size-6 sm:size-9 transition-all duration-500 ${
                metrics.avg_rating >= 4.8 
                  ? 'text-white fill-white drop-shadow-lg' 
                  : 'text-amber-700 dark:text-amber-300 fill-amber-700 dark:fill-amber-300'
              }`} strokeWidth={2.5} />
            </div>
            {metrics.avg_rating >= 4.8 && (
              <div className="flex items-center gap-1 bg-amber-600/20 dark:bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-400/50 dark:border-amber-500/40 shadow-sm">
                <Sparkles className="size-3.5 text-amber-700 dark:text-amber-300" />
                <span className="text-[10px] sm:text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                  Elite
                </span>
              </div>
            )}
          </div>

          {/* Middle Section */}
          <div className="flex-1 relative z-10">
            <span className="block text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300 mb-2 sm:mb-3 uppercase tracking-wider">
              Average Rating
            </span>
            <div className="flex items-baseline gap-2 mb-2">
              <h4 className={`font-black text-3xl sm:text-5xl transition-all duration-500 tabular-nums leading-none ${
                metrics.avg_rating >= 4.8 
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-600 dark:from-amber-400 dark:via-yellow-400 dark:to-amber-400 drop-shadow-sm' 
                  : 'text-gray-900 dark:text-white'
              }`}>
                {displayedAvgRating.toFixed(2)}
              </h4>
              <Star className={`size-6 sm:size-7 ${
                metrics.avg_rating >= 4.8 ? 'text-amber-600 fill-amber-600 dark:text-amber-400 dark:fill-amber-400' : 'text-amber-500 fill-amber-500 dark:text-amber-400 dark:fill-amber-400'
              }`} />
              {ratingChange && <TrendSparkline change={ratingChange} />}
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs sm:text-sm ${
                metrics.avg_rating >= 4.8 ? 'text-amber-700 dark:text-amber-300 font-bold' : 'text-gray-600 dark:text-gray-300 font-semibold'
              }`}>
                out of 5.0
              </span>
            </div>
          </div>

          {/* Bottom Section */}
          {ratingChange && (
            <div className="flex items-center justify-between gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100/80 dark:border-gray-700/50 relative z-10">
              <div className="flex items-center gap-1.5">
                <Badge color={ratingChange.isPositive ? "success" : "error"}>
                  <span className="text-[10px] sm:text-xs flex items-center gap-1 font-semibold shadow-sm">
                    {ratingChange.isPositive ? <ArrowUpIcon className="size-3" /> : <ArrowDownIcon className="size-3" />}
                    {ratingChange.value}%
                  </span>
                </Badge>
                <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">vs last period</span>
              </div>
              <ChevronRight className="size-4 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
          
          {/* Hover glow effect */}
          <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-400/0 via-amber-400/0 to-amber-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </div>


        {/* 4. PROBLEM REVIEWS - Critical Alert Metric */}
        <div 
          className={`group relative flex flex-col rounded-xl sm:rounded-2xl border-2 p-5 sm:p-7 transition-all duration-500 cursor-pointer overflow-hidden
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            hover:scale-[1.03] hover:-translate-y-1 active:scale-[0.99]
            ${isProblemIncreasing 
              ? "border-red-500/90 bg-gradient-to-br from-red-100/90 via-white to-red-100/70 dark:border-red-500/80 dark:from-red-900/60 dark:via-gray-800 dark:to-red-900/50 shadow-2xl shadow-red-400/90 dark:shadow-red-700/70" 
              : problemReviews > 10
              ? "border-orange-400/80 bg-gradient-to-br from-orange-100/80 via-white to-orange-100/60 dark:border-orange-500/70 dark:from-orange-900/50 dark:via-gray-800 dark:to-orange-900/40 shadow-2xl shadow-orange-300/80 dark:shadow-orange-700/60"
              : problemReviews > 0
              ? "border-orange-300/70 bg-white dark:border-orange-600/60 dark:bg-gray-800/70 hover:border-orange-400/80 dark:hover:border-orange-500/70 hover:shadow-xl shadow-md"
              : "border-gray-300/70 bg-white dark:border-gray-600/60 dark:bg-gray-800/70 hover:border-green-300/70 dark:hover:border-green-600/60 hover:shadow-xl shadow-md"
          }`}
          style={{ 
            transitionDelay: '300ms'
          }}
          role="button"
          tabIndex={0}
          aria-label={`Problem Reviews: ${displayedProblems} - ${isProblemIncreasing ? 'Alert Increasing' : problemReviews === 0 ? 'All Clear' : 'Review Required'}`}
        >
          {/* Premium gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/30 to-transparent pointer-events-none" />
          
          {/* Refined accent bar with multiple states */}
          <div className={`absolute top-0 left-0 right-0 h-1.5 sm:h-2 transition-all duration-700 ${
            isProblemIncreasing 
              ? 'bg-gradient-to-r from-red-500 via-red-600 to-red-500 shadow-lg shadow-red-500/70' 
              : problemReviews > 10
              ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 shadow-lg shadow-orange-500/60'
              : problemReviews > 0
              ? 'bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400'
              : 'bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 opacity-0 group-hover:opacity-100 group-hover:from-green-400 group-hover:via-green-500 group-hover:to-green-400'
          }`} />

          {/* Top Section - Icon + Alert Badge */}
          <div className="flex items-start justify-between mb-4 sm:mb-5 relative z-10">
            <div className={`flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl transition-all duration-500 ${
              isProblemIncreasing 
                ? "bg-gradient-to-br from-red-500 via-red-600 to-red-600 shadow-xl shadow-red-400/80 dark:shadow-red-500/60 animate-shake scale-105" 
                : problemReviews > 10
                ? "bg-gradient-to-br from-orange-500 via-orange-600 to-orange-600 shadow-xl shadow-orange-400/70 dark:shadow-orange-500/50 scale-105"
                : problemReviews > 0
                ? "bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-800/40 dark:to-orange-800/30 group-hover:scale-105 group-hover:shadow-md"
                : "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700/40 dark:to-gray-700/30 group-hover:scale-105 group-hover:from-green-100 group-hover:to-green-200 dark:group-hover:from-green-800/40 dark:group-hover:to-green-800/30"
            }`}>
              <AlertTriangle className={`size-6 sm:size-9 transition-all duration-500 ${
                isProblemIncreasing 
                  ? "text-white drop-shadow-lg" 
                  : problemReviews > 10
                  ? "text-white drop-shadow-lg"
                  : problemReviews > 0
                  ? "text-orange-700 dark:text-orange-300"
                  : "text-gray-500 dark:text-gray-400 group-hover:text-green-700 dark:group-hover:text-green-300"
              }`} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col items-end gap-1.5">
              {isProblemIncreasing && (
                <div className="flex items-center gap-1 bg-red-600/25 dark:bg-red-500/25 px-2.5 py-1 rounded-full border border-red-400/60 dark:border-red-500/50 shadow-sm animate-pulse">
                  <AlertTriangle className="size-3.5 text-red-700 dark:text-red-300" />
                  <span className="text-[10px] sm:text-xs font-bold text-red-700 dark:text-red-300 uppercase tracking-wider">
                    Alert
                  </span>
                </div>
              )}
              {!isProblemIncreasing && problemReviews > 10 && (
                <Badge color="warning">
                  <span className="text-xs sm:text-sm font-bold tracking-wide px-1">⚠ REVIEW</span>
                </Badge>
              )}
              {!isProblemIncreasing && problemReviews > 0 && problemReviews <= 10 && (
                <Badge color="warning">
                  <span className="text-xs sm:text-sm font-semibold tracking-wide px-1">Monitor</span>
                </Badge>
              )}
              {!isProblemIncreasing && problemReviews === 0 && (
                <div className="flex items-center gap-1 bg-green-600/20 dark:bg-green-500/20 px-2.5 py-1 rounded-full border border-green-400/50 dark:border-green-500/40 shadow-sm">
                  <Sparkles className="size-3.5 text-green-700 dark:text-green-300" />
                  <span className="text-[10px] sm:text-xs font-bold text-green-700 dark:text-green-300 uppercase tracking-wider">
                    Clear
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Middle Section - Label + Value */}
          <div className="flex-1 relative z-10">
            <span className={`block text-xs sm:text-sm font-bold mb-2 sm:mb-3 uppercase tracking-wider transition-colors duration-500 ${
              isProblemIncreasing 
                ? 'text-red-700 dark:text-red-300' 
                : problemReviews > 10
                ? 'text-orange-700 dark:text-orange-300'
                : problemReviews > 0
                ? 'text-gray-600 dark:text-gray-300'
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              Problem Reviews
            </span>
            <div className="flex items-baseline gap-2 mb-2">
              <h4 className={`font-black text-3xl sm:text-5xl transition-all duration-500 tabular-nums leading-none ${
                isProblemIncreasing 
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-700 to-red-600 dark:from-red-400 dark:via-red-500 dark:to-red-400 drop-shadow-sm' 
                  : problemReviews > 10
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-orange-700 to-orange-600 dark:from-orange-400 dark:via-orange-500 dark:to-orange-400 drop-shadow-sm'
                  : problemReviews > 0
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {displayedProblems}
              </h4>
              {problemChange && problemReviews > 0 && <TrendSparkline change={problemChange} />}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className={`text-xs sm:text-sm font-semibold transition-colors duration-500 ${
                isProblemIncreasing 
                  ? 'text-red-700 dark:text-red-300' 
                  : problemReviews > 10
                  ? 'text-orange-700 dark:text-orange-300'
                  : problemReviews > 0
                  ? 'text-gray-600 dark:text-gray-300'
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                1★ + 2★ ratings
              </span>
              {isProblemIncreasing && (
                <span className="text-[9px] text-red-600/80 dark:text-red-400/80 italic hidden sm:inline font-semibold">
                  Needs attention now
                </span>
              )}
              {problemReviews === 0 && (
                <span className="text-[9px] text-green-600/70 dark:text-green-400/70 italic hidden sm:inline">
                  Perfect streak!
                </span>
              )}
            </div>
          </div>

          {/* Bottom Section - Trend */}
          {problemChange && (
            <div className="flex items-center justify-between gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100/80 dark:border-gray-700/50 relative z-10">
              <div className="flex items-center gap-1.5">
                <Badge color={problemChange.isNegative ? "success" : "error"}>
                  <span className="text-[10px] sm:text-xs flex items-center gap-1 font-semibold shadow-sm">
                    {problemChange.isPositive ? <ArrowUpIcon className="size-3" /> : <ArrowDownIcon className="size-3" />}
                    {problemChange.value}%
                  </span>
                </Badge>
                <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">vs last period</span>
              </div>
              <ChevronRight className="size-4 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
          
          {/* Hover glow effect - changes color based on state */}
          <div className={`absolute inset-0 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
            isProblemIncreasing
              ? 'bg-gradient-to-br from-red-400/0 via-red-400/0 to-red-400/10'
              : problemReviews > 0
              ? 'bg-gradient-to-br from-orange-400/0 via-orange-400/0 to-orange-400/5'
              : 'bg-gradient-to-br from-green-400/0 via-green-400/0 to-green-400/5'
          }`} />
        </div>

      </div>
    </div>
  );
}




