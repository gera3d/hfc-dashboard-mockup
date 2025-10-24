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
    <div className={`relative rounded-md border p-1.5 ${
      isHFC
        ? 'bg-white/5 backdrop-blur-sm border-white/10'
        : 'bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-800 dark:via-gray-800/95 dark:to-gray-800 border-blue-100 dark:border-gray-700'
    }`}>
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1">
            <span className="text-xs">⏱️</span>
            <h3 className={`text-[10px] font-bold ${
              isHFC ? 'text-white' : 'text-gray-900 dark:text-white'
            }`}>
              Time Period
            </h3>
          </div>
          
          {/* Compare Toggle - Premium Design */}
          <button
            onClick={() => onCompareModeChange(!compareMode)}
            className={`relative flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold transition-all duration-300 ${
              compareMode
                ? isHFC
                  ? 'bg-[#1e5a8e] text-white'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                : isHFC
                  ? 'bg-white/10 text-white/90 border border-white/20 hover:bg-white/15'
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
            }`}
          >
            {compareMode ? (
              <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg 
                className="w-2 h-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            )}
            <span className="hidden sm:inline">Compare</span>
          </button>
        </div>

        {/* Period Selection - Card Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
          {periods.map((period) => {
            const isSelected = selectedRange.label === dateRanges[period.key].label;
            return (
              <button
                key={period.key}
                onClick={() => onRangeChange(dateRanges[period.key])}
                data-period-selector="true"
                className={`relative group flex flex-col items-center justify-center p-1.5 rounded transition-all duration-200 focus:outline-none focus:ring-2 ${
                  isSelected
                    ? isHFC
                      ? 'bg-[#1e5a8e] text-white shadow-lg shadow-[#1e5a8e]/30 focus:ring-[#f5b942]/50'
                      : 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 focus:ring-indigo-400/50'
                    : isHFC
                      ? 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white/90 focus:ring-white/20'
                      : 'bg-white/50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200 hover:shadow-md focus:ring-indigo-300 dark:focus:ring-indigo-500'
                }`}
              >
                
                <span className="text-base mb-0.5 relative z-10">
                  {period.icon}
                </span>
                <span className="text-[9px] font-semibold relative z-10">
                  {period.label}
                </span>
                
                {isSelected && (
                  <div className="absolute top-0.5 right-0.5">
                    <div className={`w-2.5 h-2.5 rounded-full flex items-center justify-center ${
                      isHFC ? 'bg-[#f5b942]' : 'bg-white/30'
                    }`}>
                      <svg 
                        className={`w-1.5 h-1.5 ${isHFC ? 'text-[#1e5a8e]' : 'text-white'}`}
                        fill="currentColor" 
                        viewBox="0 0 20 20"
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

        {/* Selected Range Display - Single Row */}
        <div className={`mt-1.5 flex items-center gap-1.5 p-1.5 backdrop-blur-sm rounded border ${
          isHFC
            ? 'bg-white/5 border-white/10'
            : 'bg-white/60 dark:bg-gray-700/30 border-gray-200 dark:border-gray-600'
        }`}>
          <div className={`flex items-center justify-center w-5 h-5 rounded ${
            isHFC
              ? 'bg-[#1e5a8e]'
              : 'bg-gradient-to-br from-indigo-500 to-purple-600'
          }`}>
            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex items-center gap-1 flex-1">
            <span className={`text-[10px] font-bold ${
              isHFC ? 'text-white' : 'text-gray-900 dark:text-white'
            }`}>
              {selectedRange.label}
            </span>
            <span className={`text-[9px] ${
              isHFC ? 'text-white/60' : 'text-gray-500 dark:text-gray-400'
            }`}>
              •
            </span>
            <span className={`text-[9px] font-medium ${
              isHFC ? 'text-white/80' : 'text-gray-700 dark:text-gray-300'
            }`}>
              {selectedRange.from.toLocaleDateString()} - {selectedRange.to.toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Comparison Info */}
        {compareMode && (
          <div className={`mt-1.5 p-1.5 rounded border ${
            isHFC
              ? 'bg-[#1e5a8e]/20 backdrop-blur-sm border-[#1e5a8e]/30'
              : 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800'
          }`}>
            <div className="flex items-center gap-1.5">
              <div className={`flex-shrink-0 w-5 h-5 rounded flex items-center justify-center ${
                isHFC
                  ? 'bg-[#1e5a8e]'
                  : 'bg-gradient-to-br from-indigo-500 to-purple-600'
              }`}>
                <svg 
                  className="w-2.5 h-2.5 text-white"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="flex-1">
                <span className={`text-[10px] font-semibold ${
                  isHFC
                    ? 'text-white'
                    : 'text-indigo-900 dark:text-indigo-300'
                }`}>
                  Comparison Mode Active
                </span>
                <span className={`text-[9px] ml-1 ${
                  isHFC
                    ? 'text-white/80'
                    : 'text-indigo-700 dark:text-indigo-400'
                }`}>
                  vs previous {selectedRange.label?.toLowerCase() || ''} period
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
