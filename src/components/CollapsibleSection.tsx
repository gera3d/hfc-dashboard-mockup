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
      className={`bg-white rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
        isExpanded 
          ? 'border-[#0066cc] shadow-2xl ring-4 ring-[#0066cc]/10' 
          : 'border-gray-300 hover:border-[#0066cc] hover:shadow-xl'
      }`}
    >
      {/* Header - Always Visible */}
      <button
        onClick={onToggle}
        className={`w-full px-4 sm:px-6 py-4 sm:py-5 transition-all duration-200 ${
          isExpanded 
            ? 'bg-gradient-to-r from-[#0066cc]/5 to-[#00ca6f]/5 rounded-t-2xl' 
            : 'hover:bg-gray-50 rounded-2xl'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 w-full">
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:flex-1 min-w-0">
            {/* Icon */}
            {icon && (
              <div 
                className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-[#0066cc] bg-[#0066cc]/10 border border-[#0066cc]/20"
              >
                {icon}
              </div>
            )}
            
            {/* Title & Subtitle */}
            <div className="text-left flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-[#0066cc]">
                  {title}
                </h3>
                {badge && (
                  <span className="px-2.5 py-0.5 text-[10px] sm:text-xs font-bold rounded-full bg-[#0066cc]/10 text-[#0066cc] border border-[#0066cc]/20 whitespace-nowrap flex-shrink-0">
                    {badge}
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="text-xs sm:text-sm mt-0.5 text-gray-600 font-normal hidden sm:block">
                  {subtitle}
                </p>
              )}
            </div>
            
            {/* Toggle Button - show on mobile inline with title */}
            <div className="flex-shrink-0 sm:hidden">
              <div 
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  isExpanded 
                    ? 'bg-[#0066cc] text-white' 
                    : 'bg-white text-[#0066cc] border-2 border-[#0066cc]/30 hover:bg-gray-50'
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
                  ? 'bg-[#0066cc] text-white' 
                  : 'bg-white text-[#0066cc] border-2 border-[#0066cc]/30 hover:bg-gray-50'
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
          <div className="px-4 sm:px-6 pb-5 sm:pb-6 pt-4 sm:pt-5 border-t-2 border-gray-200 bg-gradient-to-b from-gray-50/50 to-white">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
