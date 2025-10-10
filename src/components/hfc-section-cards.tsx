import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { MetricsSummary } from "@/data/dataService"

interface SectionCardsProps {
  metrics: MetricsSummary
  previousMetrics?: MetricsSummary | null
  showComparison?: boolean
}

export function HFCSectionCards({ metrics, previousMetrics, showComparison = false }: SectionCardsProps) {
  // Calculate trends
  const calculateTrend = (current: number, previous?: number) => {
    if (!showComparison || !previous || previous === 0) return null
    const percentChange = ((current - previous) / previous) * 100
    return {
      percentChange,
      isPositive: percentChange > 0
    }
  }

  const ratingTrend = calculateTrend(metrics.avg_rating, previousMetrics?.avg_rating)
  const volumeTrend = calculateTrend(metrics.total, previousMetrics?.total)
  const excellenceTrend = calculateTrend(metrics.percent_5_star, previousMetrics?.percent_5_star)

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      
      {/* Card 1: Average Star Rating */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Average Star Rating</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {metrics.avg_rating.toFixed(2)} ⭐
          </CardTitle>
          {ratingTrend && (
            <CardAction>
              <Badge variant="outline">
                {ratingTrend.isPositive ? <IconTrendingUp /> : <IconTrendingDown />}
                {ratingTrend.isPositive ? '+' : ''}{ratingTrend.percentChange.toFixed(1)}%
              </Badge>
            </CardAction>
          )}
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {ratingTrend?.isPositive ? (
              <>Quality improving <IconTrendingUp className="size-4" /></>
            ) : ratingTrend ? (
              <>Needs attention <IconTrendingDown className="size-4" /></>
            ) : (
              <>Overall satisfaction score</>
            )}
          </div>
          <div className="text-muted-foreground">
            Based on {metrics.total.toLocaleString()} reviews
          </div>
        </CardFooter>
      </Card>

      {/* Card 2: Total Reviews */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Reviews</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {metrics.total.toLocaleString()}
          </CardTitle>
          {volumeTrend && (
            <CardAction>
              <Badge variant="outline">
                {volumeTrend.isPositive ? <IconTrendingUp /> : <IconTrendingDown />}
                {volumeTrend.isPositive ? '+' : ''}{volumeTrend.percentChange.toFixed(1)}%
              </Badge>
            </CardAction>
          )}
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {volumeTrend?.isPositive ? (
              <>Volume increasing <IconTrendingUp className="size-4" /></>
            ) : volumeTrend ? (
              <>Activity declining <IconTrendingDown className="size-4" /></>
            ) : (
              <>Customer feedback collected</>
            )}
          </div>
          <div className="text-muted-foreground">
            Total customer responses
          </div>
        </CardFooter>
      </Card>

      {/* Card 3: 5-Star Excellence Rate */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>5-Star Excellence Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {metrics.percent_5_star.toFixed(1)}%
          </CardTitle>
          {excellenceTrend && (
            <CardAction>
              <Badge variant="outline">
                {excellenceTrend.isPositive ? <IconTrendingUp /> : <IconTrendingDown />}
                {excellenceTrend.isPositive ? '+' : ''}{excellenceTrend.percentChange.toFixed(1)}%
              </Badge>
            </CardAction>
          )}
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {excellenceTrend?.isPositive ? (
              <>Excellence rising <IconTrendingUp className="size-4" /></>
            ) : excellenceTrend ? (
              <>Performance dip <IconTrendingDown className="size-4" /></>
            ) : (
              <>Top-tier performance</>
            )}
          </div>
          <div className="text-muted-foreground">
            Percentage of perfect ratings
          </div>
        </CardFooter>
      </Card>

      {/* Card 4: 4-Star + Quality Score */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>High Quality Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {(((metrics.star_5 + metrics.star_4) / metrics.total) * 100).toFixed(1)}%
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Strong satisfaction levels
          </div>
          <div className="text-muted-foreground">
            4-star and 5-star combined
          </div>
        </CardFooter>
      </Card>

    </div>
  )
}
