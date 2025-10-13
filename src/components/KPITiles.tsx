'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { MetricsSummary } from '@/data/dataService'
import AnimatedNumber from './AnimatedNumber'

interface KPITilesProps {
  metrics: MetricsSummary
  previousMetrics?: MetricsSummary | null
  showComparison?: boolean
}

interface KPITileProps {
  label: string
  value: number | string
  previousValue?: number | string
  showComparison?: boolean
  format?: 'number' | 'decimal' | 'percentage'
  colorClass?: string
}

function KPITile({ label, value, previousValue, showComparison, format = 'number', colorClass = 'text-[#635BFF]' }: KPITileProps) {
  const formatValue = (val: number | string, formatType: string) => {
    if (typeof val === 'string') return val
    
    switch (formatType) {
      case 'decimal':
        return val.toFixed(2)
      case 'percentage':
        return `${val.toFixed(1)}%`
      default:
        return val.toLocaleString()
    }
  }
  
  const getDelta = () => {
    if (!showComparison || previousValue === undefined || typeof value === 'string' || typeof previousValue === 'string') {
      return null
    }
    
    const numValue = Number(value)
    const numPrevious = Number(previousValue)
    
    if (numPrevious === 0) return null
    
    const delta = numValue - numPrevious
    const percentChange = ((delta / numPrevious) * 100)
    
    return {
      delta,
      percentChange,
      isPositive: delta > 0,
      isNegative: delta < 0
    }
  }
  
  const delta = getDelta()
  const getColor = () => {
    // Stripe-style color codes
    if (colorClass.includes('blue')) return '#635BFF' // Primary purple
    if (colorClass.includes('green')) return '#00CA6F' // Green
    if (colorClass.includes('red')) return '#FF4A4C' // Red
    if (colorClass.includes('orange')) return '#FFAE33' // Orange
    if (colorClass.includes('yellow')) return '#FFBF00' // Yellow
    if (colorClass.includes('lime')) return '#00CA6F' // Green (same as green for consistency)
    if (colorClass.includes('purple')) return '#635BFF' // Purple (primary)
    return '#635BFF' // Default to primary
  }
  
  const color = getColor()
  
  // Determine if value is numeric and get proper decimals
  const numericValue = typeof value === 'number' ? value : 0;
  const decimals = format === 'decimal' ? 2 : format === 'percentage' ? 1 : 0;
  
  return (
    <div className="bg-white rounded-md border border-[#E3E8EE] p-5 transition-all duration-150 hover:shadow-soft">
      <div className="text-xs font-medium text-[#8898AA] mb-1 tracking-wide">{label}</div>
      <div className="text-3xl font-semibold tracking-tight text-[#0A2540] leading-tight">
        {typeof value === 'number' ? (
          <AnimatedNumber 
            value={numericValue} 
            decimals={decimals}
            suffix={format === 'percentage' ? '%' : ''}
            duration={600}
          />
        ) : (
          formatValue(value, format)
        )}
      </div>
      
      {delta && (
        <div className="flex items-center text-xs mt-2">
          <div className="flex-shrink-0 mr-1.5">
            {delta.isPositive ? (
              <TrendingUp className="w-3 h-3 text-[#00CA6F]" />
            ) : delta.isNegative ? (
              <TrendingDown className="w-3 h-3 text-[#FF4A4C]" />
            ) : (
              <Minus className="w-3 h-3 text-[#8898AA]" />
            )}
          </div>
          <span className={`font-medium ${delta.isPositive ? 'text-[#00CA6F]' : delta.isNegative ? 'text-[#FF4A4C]' : 'text-[#8898AA]'}`}>
            {delta.isPositive ? '+' : ''}{delta.percentChange.toFixed(1)}%
          </span>
          <span className="text-[#8898AA] ml-1">vs. previous</span>
        </div>
      )}
      
      {/* Minimalist stripe-style indicator - colored bar at bottom */}
      <div className="h-1 w-16 mt-4" style={{ backgroundColor: color, opacity: 0.2 }}></div>
    </div>
  )
}

export default function KPITiles({ metrics, previousMetrics, showComparison }: KPITilesProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <KPITile
        label="1★ Reviews"
        value={metrics.star_1}
        previousValue={previousMetrics?.star_1}
        showComparison={showComparison}
        colorClass="text-red-600"
      />
      <KPITile
        label="2★ Reviews"
        value={metrics.star_2}
        previousValue={previousMetrics?.star_2}
        showComparison={showComparison}
        colorClass="text-orange-600"
      />
      <KPITile
        label="3★ Reviews"
        value={metrics.star_3}
        previousValue={previousMetrics?.star_3}
        showComparison={showComparison}
        colorClass="text-yellow-600"
      />
      <KPITile
        label="4★ Reviews"
        value={metrics.star_4}
        previousValue={previousMetrics?.star_4}
        showComparison={showComparison}
        colorClass="text-lime-600"
      />
      <KPITile
        label="5★ Reviews"
        value={metrics.star_5}
        previousValue={previousMetrics?.star_5}
        showComparison={showComparison}
        colorClass="text-green-600"
      />
      <KPITile
        label="Total Reviews"
        value={metrics.total}
        previousValue={previousMetrics?.total}
        showComparison={showComparison}
        colorClass="text-blue-600"
      />
      <KPITile
        label="Average Rating"
        value={metrics.avg_rating}
        previousValue={previousMetrics?.avg_rating}
        showComparison={showComparison}
        format="decimal"
        colorClass="text-purple-600"
      />
    </div>
  )
}