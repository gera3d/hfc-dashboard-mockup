"use client"

import * as React from "react"
import { Star, TrendingUp, Award } from "lucide-react"
import { AgentMetrics } from "@/data/dataService"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface AgentPerformanceTableProps {
  data: AgentMetrics[]
  limit?: number
}

export function AgentPerformanceTable({ data, limit }: AgentPerformanceTableProps) {
  // Sort by average rating descending, then by total reviews
  const sortedData = React.useMemo(() => {
    const sorted = [...data].sort((a, b) => {
      if (b.avg_rating !== a.avg_rating) {
        return b.avg_rating - a.avg_rating
      }
      return b.total - a.total
    })
    
    return limit ? sorted.slice(0, limit) : sorted
  }, [data, limit])

  if (sortedData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Agent Performance Rankings</CardTitle>
          <CardDescription>Top performing agents by customer ratings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Star className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-1">No agent data available</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Agent performance data will appear here once reviews are collected.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Performance Rankings</CardTitle>
        <CardDescription>
          Top {limit || "all"} agents ranked by average rating and review volume
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Rank</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Reviews</TableHead>
                <TableHead>5-Star Rate</TableHead>
                <TableHead>Distribution</TableHead>
                <TableHead>Last Review</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((agent, index) => {
                const rank = index + 1
                const initials = agent.agent_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                
                const isExcellent = agent.avg_rating >= 4.8
                const isGood = agent.avg_rating >= 4.5
                const isHighFiveStar = agent.percent_5_star >= 90
                const isMediumFiveStar = agent.percent_5_star >= 75
                
                const lastReviewDate = agent.last_review_date ? new Date(agent.last_review_date) : null
                let timeAgo = "Never"
                if (lastReviewDate) {
                  const now = new Date()
                  const diffTime = Math.abs(now.getTime() - lastReviewDate.getTime())
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                  
                  if (diffDays === 0) timeAgo = "Today"
                  else if (diffDays === 1) timeAgo = "Yesterday"
                  else if (diffDays < 7) timeAgo = `${diffDays}d ago`
                  else if (diffDays < 30) timeAgo = `${Math.floor(diffDays / 7)}w ago`
                  else if (diffDays < 365) timeAgo = `${Math.floor(diffDays / 30)}mo ago`
                  else timeAgo = `${Math.floor(diffDays / 365)}y ago`
                }
                
                return (
                  <TableRow key={agent.agent_id}>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        {rank <= 3 ? (
                          <Badge 
                            variant="default" 
                            className={
                              rank === 1 
                                ? "bg-yellow-500 hover:bg-yellow-600 text-white" 
                                : rank === 2 
                                ? "bg-gray-400 hover:bg-gray-500 text-white" 
                                : "bg-amber-600 hover:bg-amber-700 text-white"
                            }
                          >
                            {rank}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground font-medium">{rank}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage 
                            src={agent.image_url} 
                            alt={agent.agent_name} 
                            className="object-cover" 
                          />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{agent.agent_name}</span>
                          <span className="text-xs text-muted-foreground">{agent.department_name}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold tabular-nums">{agent.avg_rating.toFixed(2)}</span>
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        </div>
                        {isExcellent && (
                          <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-xs">
                            <Award className="w-3 h-3 mr-1" />
                            Top
                          </Badge>
                        )}
                        {isGood && !isExcellent && (
                          <Badge variant="secondary" className="text-xs">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            High
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold tabular-nums text-sm">{agent.total.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground">reviews</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold tabular-nums text-sm">{agent.percent_5_star.toFixed(1)}%</span>
                        {isHighFiveStar && <TrendingUp className="w-4 h-4 text-green-500" />}
                        {isMediumFiveStar && !isHighFiveStar && <TrendingUp className="w-4 h-4 text-blue-500" />}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 items-center">
                        {[5, 4, 3, 2, 1].map((starLevel) => {
                          const count = agent[`star_${starLevel}` as keyof AgentMetrics] as number
                          const percent = agent.total > 0 ? (count / agent.total) * 100 : 0
                          
                          if (percent === 0) return null
                          
                          return (
                            <div key={starLevel} className="group relative">
                              <div
                                className={`h-8 rounded-sm transition-opacity hover:opacity-80 ${
                                  starLevel === 5 ? "bg-green-500" :
                                  starLevel === 4 ? "bg-lime-500" :
                                  starLevel === 3 ? "bg-yellow-500" :
                                  starLevel === 2 ? "bg-orange-500" :
                                  "bg-red-500"
                                }`}
                                style={{ width: `${Math.max(percent * 0.6, 4)}px` }}
                              />
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                {starLevel}★: {count} ({percent.toFixed(1)}%)
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium">{timeAgo}</span>
                        {lastReviewDate && (
                          <span className="text-xs text-muted-foreground">
                            {lastReviewDate.toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
