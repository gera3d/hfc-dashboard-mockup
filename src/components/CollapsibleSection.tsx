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
      className={`bg-white rounded-xl border transition-all duration-300 ${
        isExpanded 
          ? 'border-indigo-200 shadow-lg' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      }`}
    >
      {/* Header - Always Visible */}
      <button
        onClick={onToggle}
        className={`w-full px-6 py-4 flex items-center justify-between transition-all duration-200 ${
          isExpanded 
            ? 'bg-gray-50' 
            : 'hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center gap-4 flex-1">
          {/* Icon */}
          {icon && (
            <div 
              className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-white bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md"
            >
              {icon}
            </div>
          )}
          
          {/* Title & Subtitle */}
          <div className="text-left flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {title}
              </h3>
              {badge && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-sm mt-0.5 text-gray-500">
                {subtitle}
              </p>
            )}
          </div>
          
          {/* Preview Content when collapsed */}
          {!isExpanded && previewContent && (
            <div className="flex-shrink-0 ml-4">
              {previewContent}
            </div>
          )}
        </div>
        
        {/* Toggle Button */}
        <div className="flex-shrink-0 ml-4">
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
          <div className="px-6 pb-6 pt-4 border-t border-gray-100">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
