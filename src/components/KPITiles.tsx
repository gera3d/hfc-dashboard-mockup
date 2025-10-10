'use client'

import { TrendingUp, TrendingDown, Star } from 'lucide-react'
import { MetricsSummary } from '@/data/dataService'
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface KPITilesProps {
  metrics: MetricsSummary
  previousMetrics?: MetricsSummary | null
  showComparison?: boolean
}

export default function KPITiles({ metrics, previousMetrics, showComparison = false }: KPITilesProps) {
  // Calculate trends
  const calculateTrend = (current: number, previous?: number) => {
    if (!showComparison || !previous || previous === 0) return null
    const percentChange = ((current - previous) / previous) * 100
    return {
      percentChange,
      isPositive: percentChange > 0
    }
  }

  const totalReviews = metrics.total
  const previousTotal = previousMetrics?.total
  const satisfactionRate = metrics.percent_5_star

  const reviewsTrend = calculateTrend(totalReviews, previousTotal)
  const ratingTrend = calculateTrend(metrics.avg_rating, previousMetrics?.avg_rating)
  const satisfactionTrend = calculateTrend(satisfactionRate, previousMetrics?.percent_5_star)

  return (
    <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-3 grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card" data-slot="card">
        <CardHeader className="relative">
          <CardDescription>Average Star Rating</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums flex items-baseline gap-2">
            {metrics.avg_rating.toFixed(2)}
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          </CardTitle>
          {ratingTrend && Math.abs(ratingTrend.percentChange) >= 0.01 && (
            <div className="absolute right-4 top-4">
              <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                {ratingTrend.isPositive ? (
                  <TrendingUp className="size-3" />
                ) : (
                  <TrendingDown className="size-3" />
                )}
                {ratingTrend.isPositive ? '+' : ''}{ratingTrend.percentChange.toFixed(1)}%
              </Badge>
            </div>
          )}
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {ratingTrend?.isPositive ? (
              <>Quality improving <TrendingUp className="size-4" /></>
            ) : ratingTrend ? (
              <>Needs attention <TrendingDown className="size-4" /></>
            ) : (
              <>Customer satisfaction</>
            )}
          </div>
          <div className="text-muted-foreground">
            Overall service quality score
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card" data-slot="card">
        <CardHeader className="relative">
          <CardDescription>Total Reviews</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {totalReviews.toLocaleString()}
          </CardTitle>
          {reviewsTrend && Math.abs(reviewsTrend.percentChange) >= 0.01 && (
            <div className="absolute right-4 top-4">
              <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                {reviewsTrend.isPositive ? (
                  <TrendingUp className="size-3" />
                ) : (
                  <TrendingDown className="size-3" />
                )}
                {reviewsTrend.isPositive ? '+' : ''}{reviewsTrend.percentChange.toFixed(1)}%
              </Badge>
            </div>
          )}
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {reviewsTrend?.isPositive ? (
              <>Volume increasing <TrendingUp className="size-4" /></>
            ) : reviewsTrend ? (
              <>Activity declining <TrendingDown className="size-4" /></>
            ) : (
              <>Feedback volume</>
            )}
          </div>
          <div className="text-muted-foreground">
            Total customer responses collected
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card" data-slot="card">
        <CardHeader className="relative">
          <CardDescription>5-Star Excellence Rate</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {satisfactionRate.toFixed(1)}%
          </CardTitle>
          {satisfactionTrend && Math.abs(satisfactionTrend.percentChange) >= 0.01 && (
            <div className="absolute right-4 top-4">
              <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                {satisfactionTrend.isPositive ? (
                  <TrendingUp className="size-3" />
                ) : (
                  <TrendingDown className="size-3" />
                )}
                {satisfactionTrend.isPositive ? '+' : ''}{satisfactionTrend.percentChange.toFixed(1)}%
              </Badge>
            </div>
          )}
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {satisfactionTrend?.isPositive ? (
              <>Excellence rising <TrendingUp className="size-4" /></>
            ) : satisfactionTrend ? (
              <>Performance dip <TrendingDown className="size-4" /></>
            ) : (
              <>Top-tier performance</>
            )}
          </div>
          <div className="text-muted-foreground">
            Percentage of perfect ratings
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}