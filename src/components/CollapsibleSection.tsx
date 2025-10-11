'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface CollapsibleSectionProps {
  title: string
  subtitle?: string
  previewContent?: React.ReactNode
  children: React.ReactNode
  defaultExpanded?: boolean
  badge?: string
  icon?: React.ReactNode
}

export function CollapsibleSection({
  title,
  subtitle,
  previewContent,
  children,
  defaultExpanded = false,
  badge,
  icon
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md">
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
      >
        <div className="flex items-center gap-4 flex-1">
          {/* Icon */}
          {icon && (
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
              {icon}
            </div>
          )}
          
          {/* Title & Subtitle */}
          <div className="text-left flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              {badge && (
                <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
                  {badge}
                </span>
              )}
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full transition-colors duration-200 ${
                isExpanded 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {isExpanded ? 'Expanded' : 'Collapsed'}
              </span>
            </div>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          
          {/* Preview Content when collapsed */}
          {!isExpanded && previewContent && (
            <div className="flex-shrink-0 ml-4">
              {previewContent}
            </div>
          )}
        </div>
        
        {/* Toggle Icon */}
        <div className="flex-shrink-0 ml-4">
          <div className={`w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center transition-all duration-300 ${
            isExpanded ? 'bg-indigo-100 text-indigo-600 rotate-180' : 'text-gray-600'
          }`}>
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
      </button>
      
      {/* Content - Expandable */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded 
            ? 'max-h-[10000px] opacity-100' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="px-6 pb-6 border-t border-gray-100">
          <div className="pt-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
