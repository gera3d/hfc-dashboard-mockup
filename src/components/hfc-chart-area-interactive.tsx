"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

interface ChartDataPoint {
  date: string
  satisfaction_score: number
  avg_rating: number
  total: number
}

interface HFCChartProps {
  data: ChartDataPoint[]
}

const chartConfig = {
  satisfaction: {
    label: "Satisfaction Score",
  },
  satisfaction_score: {
    label: "Satisfaction",
    color: "var(--primary)",
  },
  avg_rating: {
    label: "Average Rating",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function HFCChartAreaInteractive({ data }: HFCChartProps) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")
  const [metric, setMetric] = React.useState<"satisfaction_score" | "avg_rating">("satisfaction_score")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("30d")
    }
  }, [isMobile])

  const filteredData = React.useMemo(() => {
    if (!data || data.length === 0) return []
    
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const lastDate = new Date(sortedData[sortedData.length - 1].date)
    
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    
    const startDate = new Date(lastDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    
    return sortedData.filter((item) => new Date(item.date) >= startDate)
  }, [data, timeRange])

  const total = React.useMemo(
    () => ({
      satisfaction: filteredData.reduce((acc, curr) => acc + curr.satisfaction_score, 0) / filteredData.length || 0,
      rating: filteredData.reduce((acc, curr) => acc + curr.avg_rating, 0) / filteredData.length || 0,
    }),
    [filteredData]
  )

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Customer Satisfaction Trend</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            {metric === "satisfaction_score" 
              ? `Average satisfaction: ${total.satisfaction.toFixed(1)}%`
              : `Average rating: ${total.rating.toFixed(2)} stars`
            }
          </span>
          <span className="@[540px]/card:hidden">
            {timeRange === "7d" ? "Last 7 days" : timeRange === "30d" ? "Last 30 days" : "Last 90 days"}
          </span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 90 days</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 90 days" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 90 days
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-72 w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillSatisfaction" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-satisfaction_score)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-satisfaction_score)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillRating" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-avg_rating)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-avg_rating)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="satisfaction_score"
              type="natural"
              fill="url(#fillSatisfaction)"
              stroke="var(--color-satisfaction_score)"
              stackId="a"
            />
            {metric === "avg_rating" && (
              <Area
                dataKey="avg_rating"
                type="natural"
                fill="url(#fillRating)"
                stroke="var(--color-avg_rating)"
                stackId="b"
              />
            )}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
