'use client'

import { useRef } from 'react'
import { ChevronDown } from 'lucide-react'

interface CollapsibleSectionProps {
  title: string
  subtitle?: string
  previewContent?: React.ReactNode
  children: React.ReactNode
  isExpanded: boolean
  onToggle: () => void
  badge?: string
  icon?: React.ReactNode
  sectionId: string
}

export function CollapsibleSection({
  title,
  subtitle,
  previewContent,
  children,
  isExpanded,
  onToggle,
  badge,
  icon,
  sectionId
}: CollapsibleSectionProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const innerContentRef = useRef<HTMLDivElement>(null)

  return (
    <div 
      className={`bg-white rounded-xl border transition-all duration-300 overflow-hidden ${
        isExpanded 
          ? 'border-indigo-200 shadow-lg' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      }`}
    >
      {/* Header - Always Visible */}
      <button
        onClick={onToggle}
        className={`w-full px-4 sm:px-6 py-3 sm:py-4 transition-all duration-200 ${
          isExpanded 
            ? 'bg-gray-50 rounded-t-xl' 
            : 'hover:bg-gray-50 rounded-xl'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 w-full">
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:flex-1 min-w-0">
            {/* Icon */}
            {icon && (
              <div 
                className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-white bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md"
              >
                {icon}
              </div>
            )}
            
            {/* Title & Subtitle */}
            <div className="text-left flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  {title}
                </h3>
                {badge && (
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700 whitespace-nowrap flex-shrink-0">
                    {badge}
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="text-xs sm:text-sm mt-0.5 text-gray-500 hidden sm:block">
                  {subtitle}
                </p>
              )}
            </div>
            
            {/* Toggle Button - show on mobile inline with title */}
            <div className="flex-shrink-0 sm:hidden">
              <div 
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  isExpanded 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                style={{
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              >
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
          
          {/* Preview Content when collapsed - full width on mobile, inline on desktop */}
          {!isExpanded && previewContent && (
            <div className="w-full sm:w-auto sm:flex-shrink-0">
              {previewContent}
            </div>
          )}
          
          {/* Toggle Button - show on desktop */}
          <div className="hidden sm:block flex-shrink-0">
            <div 
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                isExpanded 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={{
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            >
              <ChevronDown className="w-5 h-5" />
            </div>
          </div>
        </div>
      </button>
      
      {/* Content - Collapsible */}
      <div
        ref={contentRef}
        className="transition-all duration-300 overflow-hidden"
        style={{
          maxHeight: isExpanded ? `${innerContentRef.current?.scrollHeight || 2000}px` : '0px',
          opacity: isExpanded ? 1 : 0,
        }}
      >
        <div ref={innerContentRef}>
          <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-3 sm:pt-4 border-t border-gray-100">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
