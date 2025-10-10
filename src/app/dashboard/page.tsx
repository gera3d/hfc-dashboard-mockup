'use client'

import { useState, useEffect, useMemo } from 'react'
import { AppSidebar } from "@/components/app-sidebar"
import { HFCChartAreaInteractive } from "@/components/hfc-chart-area-interactive"
import { HFCAgentPerformanceTable } from "@/components/hfc-agent-performance-table"
import { HFCSectionCards } from "@/components/hfc-section-cards"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { 
  loadReviews,
  loadAgents,
  loadDepartments,
  calculateMetrics,
  getDateRanges,
  filterReviewsByDate,
  getAgentMetrics,
  Review,
  Agent,
  Department
} from '@/data/dataService'

export default function Page() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  
  const dateRanges = getDateRanges()
  
  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [reviewsData, agentsData, departmentsData] = await Promise.all([
          loadReviews(),
          loadAgents(),
          loadDepartments()
        ])
        
        setReviews(reviewsData)
        setAgents(agentsData)
        setDepartments(departmentsData)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])
  
  // Calculate metrics for this year
  const currentMetrics = useMemo(() => {
    const filtered = filterReviewsByDate(reviews, dateRanges.thisYear)
    return calculateMetrics(filtered)
  }, [reviews, dateRanges])

  // Generate satisfaction trend data for the last 90 days
  const satisfactionTrendData = useMemo(() => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - 90)
    
    // Get reviews from the last 90 days
    const recentReviews = reviews.filter(review => {
      const reviewDate = new Date(review.review_ts)
      return reviewDate >= startDate && reviewDate <= endDate
    })
    
    // Group reviews by date
    const dailyData = new Map<string, Review[]>()
    recentReviews.forEach(review => {
      const dateStr = review.review_ts.split('T')[0]
      if (!dailyData.has(dateStr)) {
        dailyData.set(dateStr, [])
      }
      dailyData.get(dateStr)!.push(review)
    })
    
    // Calculate daily metrics
    const trendData = Array.from(dailyData.entries()).map(([date, dayReviews]) => {
      const metrics = calculateMetrics(dayReviews)
      const satisfaction_score = ((metrics.star_5 + metrics.star_4) / metrics.total) * 100
      
      return {
        date,
        satisfaction_score: isNaN(satisfaction_score) ? 0 : satisfaction_score,
        avg_rating: metrics.avg_rating,
        total: metrics.total
      }
    })
    
    // Sort by date
    return trendData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [reviews])

  // Calculate agent performance metrics
  const agentMetrics = useMemo(() => {
    const filtered = filterReviewsByDate(reviews, dateRanges.thisYear)
    return getAgentMetrics(filtered, agents, departments)
  }, [reviews, agents, departments, dateRanges])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* STEP 1: ✅ Replace SectionCards with HFC data */}
              <HFCSectionCards metrics={currentMetrics} />
              
              {/* STEP 2: ✅ Replace ChartAreaInteractive with HFC satisfaction trend */}
              <div className="px-4 lg:px-6">
                <HFCChartAreaInteractive data={satisfactionTrendData} />
              </div>
              
              {/* STEP 3: ✅ Replace DataTable with agent performance */}
              <div className="px-4 lg:px-6">
                <HFCAgentPerformanceTable data={agentMetrics} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
