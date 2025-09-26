'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { MetricsSummary } from '@/data/dataService'

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

function KPITile({ label, value, previousValue, showComparison, format = 'number', colorClass = 'text-blue-600' }: KPITileProps) {
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
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6">
      <div className="text-sm font-medium text-gray-600 mb-1">{label}</div>
      <div className={`text-3xl font-bold ${colorClass} mb-2`}>
        {formatValue(value, format)}
      </div>
      
      {delta && (
        <div className="flex items-center text-sm">
          {delta.isPositive ? (
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
          ) : delta.isNegative ? (
            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
          ) : (
            <Minus className="w-4 h-4 text-gray-400 mr-1" />
          )}
          <span className={`font-medium ${delta.isPositive ? 'text-green-600' : delta.isNegative ? 'text-red-600' : 'text-gray-600'}`}>
            {delta.isPositive ? '+' : ''}{delta.delta.toLocaleString()} ({delta.isPositive ? '+' : ''}{delta.percentChange.toFixed(1)}%)
          </span>
          <span className="text-gray-500 ml-1">vs previous</span>
        </div>
      )}
    </div>
  )
}

export default function KPITiles({ metrics, previousMetrics, showComparison }: KPITilesProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-8">
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