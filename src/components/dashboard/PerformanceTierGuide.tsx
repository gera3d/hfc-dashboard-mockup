"use client";

import { useState } from "react";
import { HelpCircle, X, Sparkles, Award, ThumbsUp, AlertTriangle, Star, MessageCircle } from "lucide-react";

export default function PerformanceTierGuide() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      {/* Help Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowHelp(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-[#0066cc] bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-lg transition-all hover:shadow-md active:scale-95"
          aria-label="View performance tier guide"
        >
          <HelpCircle className="w-5 h-5" strokeWidth={2.5} />
          <span>Performance Tiers Guide</span>
        </button>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" 
          onClick={() => setShowHelp(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-[#0066cc] to-blue-600 text-white p-6 rounded-t-2xl z-10">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-3xl font-black mb-2">Performance Tier System</h2>
                  <p className="text-blue-100 text-sm font-semibold">Understanding your metrics and rankings</p>
                </div>
                <button 
                  onClick={() => setShowHelp(false)} 
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all"
                  aria-label="Close guide"
                >
                  <X className="w-6 h-6" strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
              {/* Tier Overview */}
              <div className="space-y-4">
                <h3 className="text-xl font-black text-gray-900 dark:text-white">Performance Tiers</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-semibold">
                  All metrics use a consistent 4-tier ranking system to help you quickly understand your performance:
                </p>
                
                <div className="grid gap-4">
                  {/* Elite */}
                  <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-2 border-purple-300 dark:border-purple-700 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg flex-shrink-0">
                      <Sparkles className="w-7 h-7 text-white" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-black text-xl text-purple-700 dark:text-purple-300">🌟 Elite</span>
                        <span className="text-xs px-3 py-1 bg-purple-600 text-white rounded-lg font-bold shadow-sm">Top 10%</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">
                        World-class performance. You're in the top tier!
                      </p>
                    </div>
                  </div>

                  {/* Excellent */}
                  <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 border-2 border-green-300 dark:border-green-700 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg flex-shrink-0">
                      <Award className="w-7 h-7 text-white" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-black text-xl text-green-700 dark:text-green-300">🏆 Excellent</span>
                        <span className="text-xs px-3 py-1 bg-green-600 text-white rounded-lg font-bold shadow-sm">Strong</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">
                        Strong performance with great results. Keep it up!
                      </p>
                    </div>
                  </div>

                  {/* Good */}
                  <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-2 border-blue-300 dark:border-blue-700 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg flex-shrink-0">
                      <ThumbsUp className="w-7 h-7 text-white" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-black text-xl text-blue-700 dark:text-blue-300">👍 Good</span>
                        <span className="text-xs px-3 py-1 bg-blue-600 text-white rounded-lg font-bold shadow-sm">Solid</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">
                        Solid performance, on the right track.
                      </p>
                    </div>
                  </div>

                  {/* Needs Attention */}
                  <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-red-50 to-orange-100 dark:from-red-900/20 dark:to-orange-800/20 border-2 border-red-300 dark:border-red-700 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg flex-shrink-0">
                      <AlertTriangle className="w-7 h-7 text-white" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-black text-xl text-red-700 dark:text-red-300">⚠️ Needs Attention</span>
                        <span className="text-xs px-3 py-1 bg-red-600 text-white rounded-lg font-bold shadow-sm">Action Required</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">
                        Below target, requires immediate focus.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metric Thresholds */}
              <div className="space-y-4">
                <h3 className="text-xl font-black text-gray-900 dark:text-white">Metric Thresholds</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-semibold">
                  Here's how we determine the tier for each metric:
                </p>
                
                <div className="grid gap-4">
                  {/* Customer Satisfaction */}
                  <div className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-sm">
                    <h4 className="font-black text-gray-900 dark:text-white mb-3 flex items-center gap-2 text-lg">
                      <ThumbsUp className="w-6 h-6 text-green-600" />
                      Customer Satisfaction (5-Star Rate %)
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-purple-600 rounded-full"></span>
                        <span className="text-purple-700 dark:text-purple-400">Elite:</span> 
                        <span className="text-gray-700 dark:text-gray-300">≥ 85%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-green-600 rounded-full"></span>
                        <span className="text-green-700 dark:text-green-400">Excellent:</span> 
                        <span className="text-gray-700 dark:text-gray-300">70-84%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
                        <span className="text-blue-700 dark:text-blue-400">Good:</span> 
                        <span className="text-gray-700 dark:text-gray-300">55-69%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-red-600 rounded-full"></span>
                        <span className="text-red-700 dark:text-red-400">Needs Attention:</span> 
                        <span className="text-gray-700 dark:text-gray-300">&lt; 55%</span>
                      </div>
                    </div>
                  </div>

                  {/* Average Rating */}
                  <div className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-sm">
                    <h4 className="font-black text-gray-900 dark:text-white mb-3 flex items-center gap-2 text-lg">
                      <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                      Average Rating (out of 5.0)
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-purple-600 rounded-full"></span>
                        <span className="text-purple-700 dark:text-purple-400">Elite:</span> 
                        <span className="text-gray-700 dark:text-gray-300">≥ 4.8</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-green-600 rounded-full"></span>
                        <span className="text-green-700 dark:text-green-400">Excellent:</span> 
                        <span className="text-gray-700 dark:text-gray-300">4.5-4.79</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
                        <span className="text-blue-700 dark:text-blue-400">Good:</span> 
                        <span className="text-gray-700 dark:text-gray-300">4.0-4.49</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-red-600 rounded-full"></span>
                        <span className="text-red-700 dark:text-red-400">Needs Attention:</span> 
                        <span className="text-gray-700 dark:text-gray-300">&lt; 4.0</span>
                      </div>
                    </div>
                  </div>

                  {/* Total Reviews */}
                  <div className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-sm">
                    <h4 className="font-black text-gray-900 dark:text-white mb-3 flex items-center gap-2 text-lg">
                      <MessageCircle className="w-6 h-6 text-blue-600" />
                      Total Reviews (Growth Trend %)
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-purple-600 rounded-full"></span>
                        <span className="text-purple-700 dark:text-purple-400">Elite:</span> 
                        <span className="text-gray-700 dark:text-gray-300">+25% or more</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-green-600 rounded-full"></span>
                        <span className="text-green-700 dark:text-green-400">Excellent:</span> 
                        <span className="text-gray-700 dark:text-gray-300">+10% to +24%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
                        <span className="text-blue-700 dark:text-blue-400">Good:</span> 
                        <span className="text-gray-700 dark:text-gray-300">-10% to +9%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-red-600 rounded-full"></span>
                        <span className="text-red-700 dark:text-red-400">Needs Attention:</span> 
                        <span className="text-gray-700 dark:text-gray-300">-10% or worse</span>
                      </div>
                    </div>
                  </div>

                  {/* Problem Reviews */}
                  <div className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-sm">
                    <h4 className="font-black text-gray-900 dark:text-white mb-3 flex items-center gap-2 text-lg">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                      Problem Reviews (1-2 Star %)
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-purple-600 rounded-full"></span>
                        <span className="text-purple-700 dark:text-purple-400">Elite:</span> 
                        <span className="text-gray-700 dark:text-gray-300">&lt; 5%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-green-600 rounded-full"></span>
                        <span className="text-green-700 dark:text-green-400">Excellent:</span> 
                        <span className="text-gray-700 dark:text-gray-300">5-9.9%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
                        <span className="text-blue-700 dark:text-blue-400">Good:</span> 
                        <span className="text-gray-700 dark:text-gray-300">10-14.9%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-red-600 rounded-full"></span>
                        <span className="text-red-700 dark:text-red-400">Needs Attention:</span> 
                        <span className="text-gray-700 dark:text-gray-300">≥ 15%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-6 border-t-2 border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center font-semibold">
                  These thresholds are based on industry benchmarks and best practices for customer service excellence.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
