'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { ThemeToggleButton } from '@/components/tailadmin/common/ThemeToggleButton';
import { DateRange } from '@/data/dataService';
import { useState } from 'react';

interface TopNavProps {
  // Optional time period props - only shown in HFC theme
  selectedRange?: DateRange;
  compareMode?: boolean;
  onRangeChange?: (range: DateRange) => void;
  onCompareModeChange?: (enabled: boolean) => void;
  dateRanges?: Record<string, DateRange>;
}

export default function TopNav({
  selectedRange,
  compareMode,
  onRangeChange,
  onCompareModeChange,
  dateRanges
}: TopNavProps = {}) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const [showTimePeriod, setShowTimePeriod] = useState(false);
  
  const periods = dateRanges ? [
    { key: 'last7Days', label: '7 Days', icon: '📅' },
    { key: 'last30Days', label: '30 Days', icon: '📆' },
    { key: 'last90Days', label: '90 Days', icon: '🗓️' },
    { key: 'thisMonth', label: 'This Month', icon: '📊' },
    { key: 'lastMonth', label: 'Last Month', icon: '📋' },
    { key: 'thisYear', label: 'This Year', icon: '📈' },
  ] : [];
  
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 ${
      theme === 'hfc' 
        ? 'bg-gradient-to-r from-[#1e5a8e] via-[#2673b0] to-[#1e5a8e] shadow-lg' 
        : 'bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800'
    }`}>
      {/* Main Navigation Bar */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            {theme === 'hfc' ? (
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white tracking-tight">
                      Health Insurance
                    </span>
                    <span className="text-lg font-semibold text-[#f5b942]">
                      for California
                    </span>
                  </div>
                  <span className="text-xs text-white/80 tracking-wide">Reviews Dashboard</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            )}
          </Link>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Time Period Toggle Button (HFC Theme Only) */}
            {theme === 'hfc' && selectedRange && (
              <button
                onClick={() => setShowTimePeriod(!showTimePeriod)}
                className="flex items-center gap-3 px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/30 transition-all duration-200 backdrop-blur-sm"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div className="text-left">
                  <div className="text-xs text-white/70 font-medium">Time Period</div>
                  <div className="text-sm text-white font-semibold">{selectedRange.label}</div>
                </div>
                <svg 
                  className={`w-4 h-4 text-white transition-transform duration-200 ${showTimePeriod ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
            
            <ThemeToggleButton />
            
            <Link
              href="/settings"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                theme === 'hfc'
                  ? pathname === '/settings'
                    ? 'bg-white/20 text-white'
                    : 'text-white/90 hover:bg-white/10'
                  : pathname === '/settings'
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium">Settings</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Expandable Time Period Selector (HFC Theme Only) */}
      {theme === 'hfc' && showTimePeriod && selectedRange && dateRanges && onRangeChange && (
        <div className="border-t border-white/20 bg-white/5 backdrop-blur-md">
          <div className="px-6 py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="text-xl">⏱️</span>
                  Select Date Range
                </h3>
                <p className="text-sm text-white/70 mt-1">
                  Choose a time period to analyze performance data
                </p>
              </div>
              
              {/* Compare Toggle */}
              {onCompareModeChange && (
                <button
                  onClick={() => onCompareModeChange(!compareMode)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
                    compareMode
                      ? 'bg-white text-[#1e5a8e] shadow-lg'
                      : 'bg-white/10 text-white border border-white/30 hover:bg-white/20'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="text-sm">Compare Periods</span>
                  {compareMode && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              )}
            </div>

            {/* Period Buttons Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {periods.map((period) => {
                const isSelected = selectedRange.label === dateRanges[period.key].label;
                return (
                  <button
                    key={period.key}
                    onClick={() => {
                      onRangeChange(dateRanges[period.key]);
                      setShowTimePeriod(false);
                    }}
                    className={`relative group flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200 ${
                      isSelected
                        ? 'bg-white text-[#1e5a8e] shadow-lg scale-105'
                        : 'bg-white/10 text-white border border-white/30 hover:bg-white/20 hover:scale-105'
                    }`}
                  >
                    <span className="text-3xl mb-2">{period.icon}</span>
                    <span className="text-sm font-semibold">{period.label}</span>
                    
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <div className="w-5 h-5 bg-[#f5b942] rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Period Info */}
            <div className="mt-4 flex items-center justify-between p-4 bg-white/10 rounded-lg border border-white/20 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-white/70 font-medium">Selected Period</div>
                  <div className="text-sm text-white font-bold">{selectedRange.label}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-white/70 font-medium">Date Range</div>
                <div className="text-sm text-white font-bold">
                  {new Date(selectedRange.start).toLocaleDateString()} - {new Date(selectedRange.end).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
