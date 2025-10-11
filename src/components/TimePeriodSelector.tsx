'use client';

import { useState } from 'react';
import { DateRange } from '@/data/dataService';
import { useTheme } from '@/context/ThemeContext';

interface TimePeriodSelectorProps {
  selectedRange: DateRange;
  compareMode: boolean;
  onRangeChange: (range: DateRange) => void;
  onCompareModeChange: (enabled: boolean) => void;
  dateRanges: Record<string, DateRange>;
}

export default function TimePeriodSelector({
  selectedRange,
  compareMode,
  onRangeChange,
  onCompareModeChange,
  dateRanges
}: TimePeriodSelectorProps) {
  
  const { theme } = useTheme();
  const isHFC = theme === 'hfc';
  
  const periods = [
    { key: 'last7Days', label: '7 Days', icon: '📅' },
    { key: 'last30Days', label: '30 Days', icon: '📆' },
    { key: 'last90Days', label: '90 Days', icon: '🗓️' },
    { key: 'thisMonth', label: 'This Month', icon: '📊' },
    { key: 'lastMonth', label: 'Last Month', icon: '📋' },
    { key: 'thisYear', label: 'This Year', icon: '📈' },
  ];

  return (
    <div className={`relative rounded-2xl border-2 shadow-xl p-6 ${
      isHFC
        ? 'bg-white border-[#1e5a8e]/20'
        : 'bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-800 dark:via-gray-800/95 dark:to-gray-800 border-blue-100 dark:border-gray-700'
    }`}>
      {/* Decorative gradient blob */}
      <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl pointer-events-none ${
        isHFC
          ? 'bg-gradient-to-br from-[#1e5a8e]/10 to-[#f5b942]/10'
          : 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20'
      }`} />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-2xl">⏱️</span>
              Time Period
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Select a date range to analyze
            </p>
          </div>
          
          {/* Compare Toggle - Premium Design */}
          <button
            onClick={() => onCompareModeChange(!compareMode)}
            className={`relative flex items-center gap-3 px-5 py-3 rounded-xl font-semibold transition-all duration-300 ${
              compareMode
                ? isHFC
                  ? 'bg-[#1e5a8e] text-white shadow-lg shadow-[#1e5a8e]/50 scale-105'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50 scale-105'
                : isHFC
                  ? 'bg-white text-[#1e5a8e] border-2 border-[#1e5a8e]/30 hover:border-[#1e5a8e]'
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500'
            }`}
          >
            <div className={`flex items-center justify-center w-6 h-6 rounded-lg ${
              compareMode 
                ? 'bg-white/20' 
                : isHFC
                  ? 'bg-[#1e5a8e]/10'
                  : 'bg-indigo-100 dark:bg-indigo-900/50'
            }`}>
              {compareMode ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg 
                  className={isHFC ? 'w-4 h-4 text-[#1e5a8e]' : 'w-4 h-4 text-indigo-600 dark:text-indigo-400'} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              )}
            </div>
            <span className="text-sm">Compare Periods</span>
          </button>
        </div>

        {/* Period Selection - Card Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {periods.map((period) => {
            const isSelected = selectedRange.label === dateRanges[period.key].label;
            return (
              <button
                key={period.key}
                onClick={() => onRangeChange(dateRanges[period.key])}
                data-period-selector="true"
                className={`relative group flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 ${
                  isSelected
                    ? isHFC
                      ? 'bg-gradient-to-br from-[#1e5a8e] to-[#2673b0] shadow-lg scale-105'
                      : 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50 scale-105'
                    : isHFC
                      ? 'bg-white border-2 border-[#1e5a8e]/30 hover:border-[#1e5a8e] hover:scale-105 hover:shadow-md'
                      : 'bg-white dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 hover:scale-105'
                }`}
                style={isHFC ? (isSelected 
                  ? { backgroundColor: '#1e5a8e', color: 'white' } 
                  : { backgroundColor: 'white', color: '#1e5a8e' }
                ) : undefined}
              >
                {/* Hover effect */}
                {!isSelected && (
                  <div className={`absolute inset-0 bg-gradient-to-br rounded-xl transition-all duration-300 ${
                    isHFC
                      ? 'from-[#1e5a8e]/0 to-[#f5b942]/0 group-hover:from-[#1e5a8e]/5 group-hover:to-[#f5b942]/5'
                      : 'from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/10 group-hover:to-purple-500/10'
                  }`} />
                )}
                
                <span 
                  className="text-4xl mb-2 relative z-10"
                  style={isHFC ? { color: isSelected ? 'white' : '#1e5a8e' } : undefined}
                >
                  {period.icon}
                </span>
                <span 
                  className="text-sm font-semibold relative z-10"
                  style={isHFC ? { color: isSelected ? 'white' : '#1e5a8e' } : undefined}
                >
                  {period.label}
                </span>
                
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isHFC ? 'bg-[#f5b942]' : 'bg-white/30'
                    }`}>
                      <svg 
                        className="w-4 h-4 text-white" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                        style={{ color: 'white' }}
                      >
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Range Display */}
        <div className={`mt-6 flex items-center justify-between p-4 backdrop-blur-sm rounded-xl border ${
          isHFC
            ? 'bg-[#1e5a8e]/5 border-[#1e5a8e]/20'
            : 'bg-white/60 dark:bg-gray-700/30 border-gray-200 dark:border-gray-600'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-10 h-10 rounded-lg shadow-lg ${
              isHFC
                ? 'bg-gradient-to-br from-[#1e5a8e] to-[#2673b0]'
                : 'bg-gradient-to-br from-indigo-500 to-purple-600'
            }`}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <div className={`text-xs font-medium ${
                isHFC
                  ? 'text-[#1e5a8e]/70'
                  : 'text-gray-500 dark:text-gray-400'
              }`}>Selected Period</div>
              <div className={`text-sm font-bold ${
                isHFC
                  ? 'text-[#1e5a8e]'
                  : 'text-gray-900 dark:text-white'
              }`}>
                {selectedRange.label}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-xs font-medium ${
              isHFC
                ? 'text-[#1e5a8e]/70'
                : 'text-gray-500 dark:text-gray-400'
            }`}>Date Range</div>
            <div className={`text-sm font-semibold ${
              isHFC
                ? 'text-[#1e5a8e]'
                : 'text-gray-700 dark:text-gray-300'
            }`}>
              {selectedRange.from.toLocaleDateString()} - {selectedRange.to.toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Comparison Info */}
        {compareMode && (
          <div className={`mt-4 p-4 rounded-xl border ${
            isHFC
              ? 'bg-gradient-to-r from-[#1e5a8e] to-[#2673b0] border-[#1e5a8e]'
              : 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                isHFC
                  ? 'bg-[#f5b942]'
                  : 'bg-gradient-to-br from-indigo-500 to-purple-600'
              }`}>
                <svg 
                  className={`w-4 h-4 ${isHFC ? 'text-[#1e5a8e]' : 'text-white'}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <div className={`text-sm font-semibold ${
                  isHFC
                    ? 'text-white'
                    : 'text-indigo-900 dark:text-indigo-300'
                }`}>
                  Comparison Mode Active
                </div>
                <div className={`text-xs mt-1 ${
                  isHFC
                    ? 'text-white/80'
                    : 'text-indigo-700 dark:text-indigo-400'
                }`}>
                  Metrics will show trends compared to the previous {selectedRange.label?.toLowerCase() || ''} period
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
