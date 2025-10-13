'use client';

import { useState } from 'react';
import { MetricsSummary, Review } from '@/data/dataService';

interface RatingDistributionWidgetProps {
  metrics: MetricsSummary;
  reviews?: Review[]; // Optional filtered reviews for tooltip details
  showDonut?: boolean; // Toggle to show/hide donut chart
}

export default function RatingDistributionWidget({ metrics, reviews = [], showDonut = false }: RatingDistributionWidgetProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  
  // Calculate distribution
  const total = metrics.star_1 + metrics.star_2 + metrics.star_3 + metrics.star_4 + metrics.star_5;
  
  const distribution = [
    { rating: 5, count: metrics.star_5, color: 'bg-green-500', solidColor: '#22c55e', label: '5★' },
    { rating: 4, count: metrics.star_4, color: 'bg-blue-500', solidColor: '#3b82f6', label: '4★' },
    { rating: 3, count: metrics.star_3, color: 'bg-yellow-500', solidColor: '#eab308', label: '3★' },
    { rating: 2, count: metrics.star_2, color: 'bg-orange-500', solidColor: '#f97316', label: '2★' },
    { rating: 1, count: metrics.star_1, color: 'bg-red-500', solidColor: '#ef4444', label: '1★' },
  ];

  const getPercentage = (count: number) => {
    return total > 0 ? (count / total) * 100 : 0;
  };

  const positivePercentage = total > 0 
    ? (((metrics.star_4 + metrics.star_5) / total) * 100).toFixed(1)
    : '0.0';

  // Get problem reviews for specific rating
  const getProblemReviews = (rating: number) => {
    if (!reviews || reviews.length === 0) {
      console.log('No reviews available');
      return [];
    }
    const filtered = reviews.filter(r => r.rating === rating && rating <= 3);
    console.log(`Rating ${rating}: Found ${filtered.length} reviews`, filtered.slice(0, 3));
    return filtered.slice(0, 3); // Show max 3 reviews
  };

  // Check if there are any problem ratings
  const hasProblems = metrics.star_1 > 0 || metrics.star_2 > 0 || metrics.star_3 > 0;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-xl border border-white/20 overflow-visible">
      {/* Everything on ONE horizontal line */}
      <div className="flex items-center gap-6 overflow-visible">
        
        {/* Left: LARGER Donut Chart - Conditionally rendered */}
        {showDonut && (
          <div className="flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-32 h-32 drop-shadow-lg">
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
                const percentage = item.count / total;
                if (percentage === 0) return null;
                
                const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
                cumulativePercent += percentage;
                const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
                
                const largeArcFlag = percentage > 0.5 ? 1 : 0;
                
                const pathData = [
                  `M 50 50`,
                  `L ${50 + startX * 42} ${50 + startY * 42}`,
                  `A 42 42 0 ${largeArcFlag} 1 ${50 + endX * 42} ${50 + endY * 42}`,
                  `Z`,
                ].join(' ');

                return (
                  <path
                    key={index}
                    d={pathData}
                    fill={item.color}
                    className="transition-opacity duration-200 hover:opacity-80"
                  />
                );
              });
            })()}
            
            {/* Center circle for donut effect */}
            <circle cx="50" cy="50" r="28" fill="white" />
            
            {/* Center text - Total */}
            <text x="50" y="48" textAnchor="middle" className="text-base font-bold fill-gray-800">
              {total}
            </text>
            <text x="50" y="58" textAnchor="middle" className="text-[7px] fill-gray-500 font-medium">
              reviews
            </text>
          </svg>
        </div>
        )}

        {/* Middle: Compact Info */}
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-bold text-white">Rating Distribution</h3>
          <p className="text-[10px] text-white/70">{positivePercentage}% positive</p>
        </div>

        {/* Right: Stacked Bar with inline legend - Takes remaining space */}
        <div className="flex-1 flex flex-col gap-2">
          {/* Horizontal subtle legend */}
          <div className="flex items-center gap-3 text-[9px] text-white/60">
            {distribution.filter(item => item.count > 0).map((item) => (
              <div key={item.rating} className="flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                <span className="font-medium opacity-70">{item.label}</span>
                <span className="font-semibold opacity-80">{item.count}</span>
              </div>
            ))}
          </div>

          {/* Stacked Bar */}
          <div className="flex-1 relative">
            <div 
              className="relative h-7 rounded-full overflow-hidden shadow-inner"
              style={{ 
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
                WebkitFontSmoothing: 'antialiased'
              }}
            >
              <div className="absolute inset-0 flex" style={{ isolation: 'isolate' }}>
                {distribution.map((item) => {
                  const percentage = getPercentage(item.count);
                  if (percentage === 0) return null;
                  
                  const problemReviews = getProblemReviews(item.rating);
                  const showValue = percentage > 15;
                  const isProblemRating = item.rating <= 3 && item.count > 0;
                  
                  return (
                    <div
                      key={item.rating}
                      className="relative transition-all duration-300 cursor-pointer flex items-center justify-center group"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: item.solidColor,
                        WebkitFontSmoothing: 'antialiased',
                        transform: 'translateZ(0)',
                      }}
                      onMouseEnter={() => setHoveredRating(item.rating)}
                      onMouseLeave={() => setHoveredRating(null)}
                    >
                      {/* Small warning for problem ratings */}
                      {isProblemRating && percentage < 15 && (
                        <span className="text-white text-xs drop-shadow-lg animate-pulse">⚠</span>
                      )}

                      {/* Larger warning with count */}
                      {isProblemRating && percentage >= 15 && (
                        <div className="flex items-center gap-1">
                          <span className="text-white text-sm drop-shadow-lg animate-pulse">⚠️</span>
                          <span className="text-white font-bold text-[10px] drop-shadow-md">{item.count}</span>
                        </div>
                      )}

                      {/* Value for positive ratings */}
                      {!isProblemRating && showValue && (
                        <span className="text-white font-bold text-[10px] drop-shadow-md">{item.count}</span>
                      )}

                  {/* Enhanced Tooltip - Shows on hover */}
                  {hoveredRating === item.rating && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-[9999] pointer-events-none">
                      <div className="bg-gray-900 text-white rounded-lg shadow-2xl border border-white/20 overflow-hidden animate-in fade-in duration-200"
                           style={{ minWidth: isProblemRating ? '320px' : '200px', maxWidth: '400px' }}>
                        {/* Tooltip Header */}
                        <div className="px-3 py-2 border-b border-white/10" style={{ backgroundColor: item.solidColor }}>
                          <div className="font-bold text-sm">{item.label} Reviews</div>
                          <div className="text-xs opacity-90">{item.count} review{item.count !== 1 ? 's' : ''} • {percentage.toFixed(1)}%</div>
                        </div>
                        
                        {/* Problem Reviews for 1-3 stars - ACTUAL FEEDBACK */}
                        {isProblemRating && problemReviews.length > 0 && (
                          <div className="px-3 py-3 max-h-64 overflow-y-auto">
                            <div className="text-[11px] font-semibold text-yellow-300 mb-2.5 flex items-center gap-1.5">
                              <span>⚠️</span>
                              <span>CUSTOMER FEEDBACK:</span>
                            </div>
                            <div className="space-y-2.5">
                              {problemReviews.map((review, idx) => (
                                <div key={review.id || idx} className="text-[11px] bg-white/5 rounded-md p-2.5 border-l-2"
                                     style={{ borderColor: item.solidColor }}>
                                  {/* The actual review comment */}
                                  <div className="text-white/95 mb-1.5 leading-relaxed font-normal">
                                    "{review.comment || 'No comment provided'}"
                                  </div>
                                  {/* Review metadata */}
                                  <div className="flex items-center gap-2 text-white/50 text-[9px]">
                                    <span>📅 {new Date(review.review_ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    <span>•</span>
                                    <span>📍 {review.source}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            {item.count > problemReviews.length && (
                              <div className="text-[10px] text-white/50 mt-2.5 text-center font-medium">
                                +{item.count - problemReviews.length} more {item.label} review{item.count - problemReviews.length !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* No issues found for problem ratings without reviews */}
                        {isProblemRating && problemReviews.length === 0 && (
                          <div className="px-3 py-2 text-[10px] text-white/70">
                            <div className="flex items-center gap-1">
                              <span>⚠️</span>
                              <span>{item.count} {item.label} review{item.count !== 1 ? 's' : ''} - No comments available</span>
                            </div>
                          </div>
                        )}
                        
                        {/* Positive feedback note for 4-5 stars */}
                        {!isProblemRating && (
                          <div className="px-3 py-2 text-[10px] text-white/70">
                            <div className="flex items-center gap-1">
                              <span>✓</span>
                              <span>Positive feedback - Great work!</span>
                            </div>
                          </div>
                        )}
                      </div>
                      {/* Tooltip arrow */}
                      <div className="w-2 h-2 bg-gray-900 transform rotate-45 mx-auto -mt-1 border-r border-b border-white/20"></div>
                    </div>
                  )}
                  
                  {/* Hover highlight effect */}
                  <div className={`absolute inset-0 bg-white/0 transition-all duration-300 ${
                    hoveredRating === item.rating ? 'bg-white/20' : ''
                  }`}></div>
                </div>
              );
            })}
          </div>
        </div>
        </div>
        </div>
      </div>
    </div>
  );
}
