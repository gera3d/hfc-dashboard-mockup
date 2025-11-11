'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DateRange } from '@/data/dataService';
import { useTheme } from '@/context/ThemeContext';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.css';

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
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const periods = [
    { key: 'last7Days', label: '7 Days', icon: '📅' },
    { key: 'last30Days', label: '30 Days', icon: '📆' },
    { key: 'last90Days', label: '90 Days', icon: '🗓️' },
    { key: 'thisMonth', label: 'This Month', icon: '📊' },
    { key: 'lastMonth', label: 'Last Month', icon: '📋' },
    { key: 'thisYear', label: 'This Year', icon: '📈' },
    { key: 'custom', label: 'Custom', icon: '🎯' },
  ];

  useEffect(() => {
    if (showCustomPicker) {
      const picker = flatpickr('#custom-date-range', {
        mode: 'range',
        dateFormat: 'M d, Y',
        showMonths: 2,
        inline: true,
        static: true,
        onChange: (selectedDates) => {
          if (selectedDates.length === 2) {
            const customRange: DateRange = {
              from: selectedDates[0],
              to: selectedDates[1],
              label: 'Custom Range'
            };
            setIsCustomRange(true);
            onRangeChange(customRange);
            setShowCustomPicker(false);
          }
        }
      });

      return () => {
        if (!Array.isArray(picker)) {
          picker.destroy();
        }
      };
    }
  }, [showCustomPicker, onRangeChange]);

  const handlePeriodClick = (period: typeof periods[0]) => {
    if (period.key === 'custom') {
      setShowCustomPicker(true);
    } else {
      setIsCustomRange(false);
      onRangeChange(dateRanges[period.key]);
    }
  };

  return (
    <>
    <div className={`relative rounded-md border p-1.5 ${
      isHFC
        ? 'bg-white/5 backdrop-blur-sm border-white/10'
        : 'bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-800 dark:via-gray-800/95 dark:to-gray-800 border-blue-100 dark:border-gray-700'
    }`}>
      
      <div className="relative">
        {/* Header with Time Period title and Compare toggle */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs">⏱️</span>
            <h3 className={`text-[10px] font-bold ${
              isHFC ? 'text-white' : 'text-gray-900 dark:text-white'
            }`}>
              Time Period
            </h3>
            {/* Selected Range Display - inline with title */}
            <span className={`text-[9px] font-medium ${
              isHFC ? 'text-white/80' : 'text-gray-700 dark:text-gray-300'
            }`}>
              • {selectedRange.label}
            </span>
            <span className={`text-[9px] ${
              isHFC ? 'text-white/60' : 'text-gray-500 dark:text-gray-400'
            }`}>
              ({selectedRange.from.toLocaleDateString()} - {selectedRange.to.toLocaleDateString()})
            </span>
          </div>
          
          {/* Compare Toggle with better contrast */}
          <button
            onClick={() => onCompareModeChange(!compareMode)}
            className={`relative flex items-center gap-1 px-2 py-1 rounded text-[9px] font-semibold transition-all duration-300 ${
              compareMode
                ? isHFC
                  ? 'bg-[#f5b942] text-[#1a4d7a] shadow-md'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                : isHFC
                  ? 'bg-white/90 text-[#1a4d7a] hover:bg-white border border-white/30'
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
            }`}
          >
            {compareMode ? (
              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg 
                className="w-2.5 h-2.5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            )}
            <span>Compare</span>
          </button>
        </div>

        {/* Period Selection - All 7 options in one row */}
        <div className="grid grid-cols-7 gap-1">
          {periods.map((period) => {
            const isSelected = period.key === 'custom' 
              ? isCustomRange 
              : selectedRange.label === dateRanges[period.key]?.label;
            return (
              <button
                key={period.key}
                onClick={() => {
                  if (period.key === 'custom') {
                    setShowCustomPicker(true);
                  } else {
                    setIsCustomRange(false);
                    onRangeChange(dateRanges[period.key]);
                  }
                }}
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

        {/* Comparison Info */}
        {compareMode && (
          <div className={`mt-1.5 p-1.5 rounded border ${
            isHFC
              ? 'bg-[#f5b942] backdrop-blur-sm border-[#f5b942]'
              : 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800'
          }`}>
            <div className="flex items-center gap-1.5">
              <div className={`flex-shrink-0 w-5 h-5 rounded flex items-center justify-center ${
                isHFC
                  ? 'bg-[#1a4d7a]'
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
                    ? 'text-[#1a4d7a]'
                    : 'text-indigo-900 dark:text-indigo-300'
                }`}>
                  Comparison Mode Active
                </span>
                <span className={`text-[9px] ml-1 ${
                  isHFC
                    ? 'text-[#1a4d7a]/90'
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

    {/* Render modal in a portal to avoid nesting issues */}
    {mounted && showCustomPicker && createPortal(
      <>
        {/* Backdrop with heavy blur */}
        <div 
          className="fixed inset-0 backdrop-blur-xl animate-in fade-in duration-200"
          style={{ zIndex: 999999 }}
          onClick={() => setShowCustomPicker(false)}
        />
        
        {/* Modal with scale and fade animation */}
        <div 
          className="fixed inset-0 flex items-center justify-center pointer-events-none"
          style={{ zIndex: 1000000 }}
        >
          <div 
            className={`relative rounded-xl shadow-2xl max-w-md w-full mx-4 pointer-events-auto animate-in zoom-in-95 fade-in duration-200 ${
              isHFC
                ? 'bg-gradient-to-br from-[#1a4d7a] to-[#15426a] border-2 border-white/10'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
            }`}
          >
            {/* Decorative top border */}
            <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl ${
              isHFC
                ? 'bg-gradient-to-r from-[#1e5a8e] via-[#f5b942] to-[#1e5a8e]'
                : 'bg-gradient-to-r from-blue-500 to-purple-500'
            }`} />
            
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isHFC
                        ? 'bg-gradient-to-br from-[#1e5a8e] to-[#164771]'
                        : 'bg-gradient-to-br from-blue-500 to-blue-600'
                    }`}>
                      <span className="text-xl">📅</span>
                    </div>
                    <h3 className={`text-xl font-bold ${
                      isHFC ? 'text-white' : 'text-gray-900 dark:text-white'
                    }`}>
                      Custom Date Range
                    </h3>
                  </div>
                  <p className={`text-sm ${
                    isHFC ? 'text-white/70' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    Select your start and end dates
                  </p>
                </div>
                <button
                  onClick={() => setShowCustomPicker(false)}
                  className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 ${
                    isHFC
                      ? 'hover:bg-white/10 text-white/70 hover:text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Date Range Calendar - Inline */}
              <div className="mb-6">
                <label className={`block text-sm font-semibold mb-3 ${
                  isHFC ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  Select Date Range
                </label>
                <div className="flex justify-center">
                  <input
                    id="custom-date-range"
                    type="text"
                    className="hidden"
                  />
                </div>
              </div>

              {/* Footer Info */}
              <div className={`flex items-start gap-2 p-3 rounded-lg ${
                isHFC
                  ? 'bg-white/5 border border-white/10'
                  : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
              }`}>
                <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  isHFC ? 'text-[#f5b942]' : 'text-blue-500'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className={`text-xs ${
                  isHFC ? 'text-white/80' : 'text-blue-700 dark:text-blue-300'
                }`}>
                  <span className="font-semibold">Tip:</span> Click the input to open the calendar. Select your start date, then your end date.
                </p>
              </div>
            </div>
          </div>
        </div>
      </>,
      document.body
    )}
    </>
  );
}
