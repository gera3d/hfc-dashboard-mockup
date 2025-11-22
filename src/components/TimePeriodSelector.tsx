'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { DateRange } from '@/data/dataService';
import { useTheme } from '@/context/ThemeContext';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.css';
import monthSelectPlugin from 'flatpickr/dist/plugins/monthSelect';
import 'flatpickr/dist/plugins/monthSelect/style.css';

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
  const flatpickrRef = useRef<flatpickr.Instance | null>(null);
  const [startDateInput, setStartDateInput] = useState('');
  const [endDateInput, setEndDateInput] = useState('');
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const periods = [
    { key: 'last7Days', label: '7 Days', icon: '📅' },
    { key: 'last30Days', label: '30 Days', icon: '📆' },
    { key: 'last90Days', label: '90 Days', icon: '🗓️' },
    { key: 'thisMonth', label: 'This Month', icon: '📊' },
    { key: 'lastMonth', label: 'Last Month', icon: '📋' },
    { key: 'custom', label: 'Custom', icon: '🎯' },
  ];

  // Quick preset ranges for custom modal
  const getQuickPresets = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return {
      thisYear: {
        from: new Date(now.getFullYear(), 0, 1),
        to: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        label: 'This Year'
      },
      lastYear: {
        from: new Date(now.getFullYear() - 1, 0, 1),
        to: new Date(now.getFullYear(), 0, 1),
        label: 'Last Year'
      },
      last3Years: {
        from: new Date(now.getFullYear() - 3, 0, 1),
        to: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        label: 'Last 3 Years'
      },
      last5Years: {
        from: new Date(now.getFullYear() - 5, 0, 1),
        to: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        label: 'Last 5 Years'
      },
      allTime: {
        from: new Date(2019, 0, 1), // Start from year 2019
        to: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        label: 'All Time'
      }
    };
  };

  const handleQuickPreset = (preset: DateRange) => {
    setIsCustomRange(true);
    onRangeChange(preset);
    setShowCustomPicker(false);
  };

  useEffect(() => {
    if (showCustomPicker) {
      const picker = flatpickr('#custom-date-range', {
        mode: 'range',
        dateFormat: 'M d, Y',
        showMonths: 2,
        inline: true,
        static: true,
        enableTime: false,
        clickOpens: true,
        // Allow selecting dates back to 2019
        minDate: new Date(2019, 0, 1),
        maxDate: new Date(),
        onChange: (selectedDates) => {
          if (selectedDates.length === 2) {
            const customRange: DateRange = {
              from: selectedDates[0],
              to: selectedDates[1],
              label: 'Custom Range'
            };
            setStartDateInput(selectedDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
            setEndDateInput(selectedDates[1].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
            setIsCustomRange(true);
            onRangeChange(customRange);
            setShowCustomPicker(false);
          } else if (selectedDates.length === 1) {
            setStartDateInput(selectedDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
          }
        },
        onOpen: () => {
          // Make the year dropdown more prominent
          const yearInput = document.querySelector('.flatpickr-current-month .numInput.cur-year') as HTMLInputElement;
          if (yearInput) {
            yearInput.style.width = '80px';
          }
        }
      });

      flatpickrRef.current = Array.isArray(picker) ? picker[0] : picker;

      return () => {
        if (flatpickrRef.current) {
          flatpickrRef.current.destroy();
          flatpickrRef.current = null;
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

        {/* Period Selection - responsive grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-1">
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
                className={`relative group flex flex-col items-center justify-center p-2 sm:p-1.5 rounded transition-all duration-200 focus:outline-none focus:ring-2 ${
                  isSelected
                    ? isHFC
                      ? 'bg-[#1e5a8e] text-white shadow-lg shadow-[#1e5a8e]/30 focus:ring-[#f5b942]/50'
                      : 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 focus:ring-indigo-400/50'
                    : isHFC
                      ? 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white/90 focus:ring-white/20'
                      : 'bg-white/50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200 hover:shadow-md focus:ring-indigo-300 dark:focus:ring-indigo-500'
                }`}
              >
                
                <span className="text-lg sm:text-base mb-0.5 relative z-10">
                  {period.icon}
                </span>
                <span className="text-[10px] sm:text-[9px] font-semibold relative z-10">
                  {period.label}
                </span>
                
                {isSelected && (
                  <div className="absolute top-1 right-1 sm:top-0.5 sm:right-0.5">
                    <div className={`w-3 h-3 sm:w-2.5 sm:h-2.5 rounded-full flex items-center justify-center ${
                      isHFC ? 'bg-[#f5b942]' : 'bg-white/30'
                    }`}>
                      <svg 
                        className={`w-2 h-2 sm:w-1.5 sm:h-1.5 ${isHFC ? 'text-[#1e5a8e]' : 'text-white'}`}
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
          className="fixed inset-0 flex items-center justify-center pointer-events-none px-4"
          style={{ zIndex: 1000000 }}
        >
          <div 
            className={`relative rounded-xl shadow-2xl max-w-2xl w-full pointer-events-auto animate-in zoom-in-95 fade-in duration-200 ${
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
            
            <div className="p-4 sm:p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4 sm:mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1 sm:mb-2">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${
                      isHFC
                        ? 'bg-gradient-to-br from-[#1e5a8e] to-[#164771]'
                        : 'bg-gradient-to-br from-blue-500 to-blue-600'
                    }`}>
                      <span className="text-lg sm:text-xl">📅</span>
                    </div>
                    <h3 className={`text-lg sm:text-xl font-bold ${
                      isHFC ? 'text-white' : 'text-gray-900 dark:text-white'
                    }`}>
                      Custom Date Range
                    </h3>
                  </div>
                  <p className={`text-xs sm:text-sm ${
                    isHFC ? 'text-white/70' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    Select your start and end dates
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCustomPicker(false)}
                  className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 ${
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

              {/* Quick Presets */}
              <div className="mb-4 sm:mb-6">
                <label className={`block text-xs sm:text-sm font-semibold mb-2 sm:mb-3 ${
                  isHFC ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  Quick Presets
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {Object.entries(getQuickPresets()).map(([key, preset]) => {
                    const icons: Record<string, string> = {
                      thisYear: '📈',
                      lastYear: '📊',
                      last3Years: '📉',
                      last5Years: '📆',
                      allTime: '🌍'
                    };
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleQuickPreset(preset);
                        }}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 ${
                          isHFC
                            ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 focus:ring-[#f5b942]/50'
                            : 'bg-gradient-to-br from-gray-50 to-gray-100 hover:from-indigo-50 hover:to-purple-50 dark:from-gray-700 dark:to-gray-700 dark:hover:from-gray-600 dark:hover:to-gray-600 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 focus:ring-indigo-400 dark:focus:ring-indigo-500'
                        }`}
                      >
                        <span className="text-lg mb-1">
                          {icons[key]}
                        </span>
                        <span className={`text-xs font-semibold text-center ${
                          isHFC ? 'text-white' : 'text-gray-900 dark:text-white'
                        }`}>
                          {preset.label}
                        </span>
                        <span className={`text-[10px] mt-0.5 text-center ${
                          isHFC ? 'text-white/60' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {preset.from.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - {preset.to.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Divider */}
              <div className={`relative mb-6 ${
                isHFC ? 'opacity-30' : ''
              }`}>
                <div className={`absolute inset-0 flex items-center ${
                  isHFC ? 'opacity-20' : ''
                }`}>
                  <div className={`w-full border-t ${
                    isHFC ? 'border-white/20' : 'border-gray-300 dark:border-gray-600'
                  }`}></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className={`px-2 ${
                    isHFC 
                      ? 'bg-gradient-to-br from-[#1a4d7a] to-[#15426a] text-white/60' 
                      : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  }`}>
                    or select custom range
                  </span>
                </div>
              </div>

              {/* Date Range Calendar - Inline */}
              <div className="mb-6">
                <label className={`block text-sm font-semibold mb-3 ${
                  isHFC ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  Select Date Range
                </label>

                {/* Manual Date Inputs */}
                <div className="mb-4 grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs font-medium mb-1.5 ${
                      isHFC ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      Start Date
                    </label>
                    <input
                      type="text"
                      placeholder="Click calendar below"
                      value={startDateInput}
                      readOnly
                      className={`w-full px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 ${
                        isHFC
                          ? 'bg-white/10 border-white/20 text-white placeholder-white/40 focus:ring-[#f5b942]/50 focus:border-[#f5b942]/50'
                          : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-1.5 ${
                      isHFC ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      End Date
                    </label>
                    <input
                      type="text"
                      placeholder="Click calendar below"
                      value={endDateInput}
                      readOnly
                      className={`w-full px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 ${
                        isHFC
                          ? 'bg-white/10 border-white/20 text-white placeholder-white/40 focus:ring-[#f5b942]/50 focus:border-[#f5b942]/50'
                          : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Year Quick Jump */}
                <div className="mb-4">
                  <label className={`block text-xs font-medium mb-2 ${
                    isHFC ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    Jump to Year
                  </label>
                  <div className="grid grid-cols-6 gap-2 mb-2">
                    {[2025, 2024, 2023, 2022, 2021, 2020].map(year => (
                      <button
                        key={year}
                        type="button"
                        onClick={() => {
                          if (flatpickrRef.current) {
                            flatpickrRef.current.jumpToDate(new Date(year, 0, 1));
                          }
                        }}
                        className={`px-2 py-1.5 rounded text-xs font-semibold transition-all duration-150 ${
                          isHFC
                            ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40'
                            : 'bg-gray-100 hover:bg-indigo-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:border-indigo-300'
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {[2019].map(year => (
                      <button
                        key={year}
                        type="button"
                        onClick={() => {
                          if (flatpickrRef.current) {
                            flatpickrRef.current.jumpToDate(new Date(year, 0, 1));
                          }
                        }}
                        className={`px-2 py-1.5 rounded text-xs font-semibold transition-all duration-150 ${
                          isHFC
                            ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40'
                            : 'bg-gray-100 hover:bg-indigo-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:border-indigo-300'
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                  
                  {/* Custom Year Input */}
                  <div className="mt-3 flex gap-2">
                    <input
                      type="number"
                      min="2019"
                      max={new Date().getFullYear()}
                      placeholder="Enter year (e.g., 2019)"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const year = parseInt((e.target as HTMLInputElement).value);
                          if (year >= 2019 && year <= new Date().getFullYear()) {
                            if (flatpickrRef.current) {
                              flatpickrRef.current.jumpToDate(new Date(year, 0, 1));
                            }
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 ${
                        isHFC
                          ? 'bg-white/10 border-white/20 text-white placeholder-white/40 focus:ring-[#f5b942]/50 focus:border-[#f5b942]/50'
                          : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        const year = parseInt(input.value);
                        if (year >= 2019 && year <= new Date().getFullYear()) {
                          if (flatpickrRef.current) {
                            flatpickrRef.current.jumpToDate(new Date(year, 0, 1));
                          }
                          input.value = '';
                        }
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                        isHFC
                          ? 'bg-[#f5b942] hover:bg-[#f7c868] text-[#1a4d7a]'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      Go
                    </button>
                  </div>
                </div>
                
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
                <div className={`text-xs ${
                  isHFC ? 'text-white/80' : 'text-blue-700 dark:text-blue-300'
                }`}>
                  <p className="font-semibold mb-1">Quick Tips:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    <li>Type a year (e.g., 2001) and press Enter or click Go to jump to that year</li>
                    <li>Click quick year buttons to navigate faster</li>
                    <li>Select start date, then end date on the calendar</li>
                    <li>Use the arrow buttons in calendar header to navigate months</li>
                  </ul>
                </div>
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
