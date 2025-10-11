"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from 'next/navigation';
import { Trophy, Building2, AlertTriangle, BarChart3 } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { 
  loadReviews, 
  loadAgents, 
  loadDepartments,
  getDateRanges,
  filterReviewsByDate,
  filterReviewsByDepartments,
  filterReviewsByAgents,
  calculateMetrics,
  getAgentMetrics,
  getDailyMetrics,
  updateAgentDepartment,
  Review,
  Agent,
  Department,
  DateRange
} from "@/data/dataService";
import {
  applyAgentOverrides,
  mergeDepartments,
  saveAgentDepartment,
  saveCustomDepartment,
  getChangeCount
} from '@/lib/localStorage';

// Your existing chart components
import { 
  SatisfactionTrend,
  AgentLeaderboard,
  DepartmentComparison,
  ProblemSpotlight
} from '@/components/Charts';
import { AgentTable, ReviewTable, CustomerFeedbackTable } from '@/components/DataTables';
import TimePeriodSelector from '@/components/TimePeriodSelector';
import { CollapsibleSection } from '@/components/CollapsibleSection';
import DashboardLayout from '@/components/DashboardLayout';

// TailAdmin dashboard components
import { ReviewMetrics } from "@/components/dashboard/ReviewMetrics";
import { ReviewsTable } from "@/components/dashboard/ReviewsTable";
import { AgentPerformanceTable } from "@/components/dashboard/AgentPerformanceTable";
import { RatingTrendChart } from "@/components/dashboard/RatingTrendChart";
import { DepartmentComparisonChart } from "@/components/dashboard/DepartmentComparisonChart";
import { SourceDistributionChart } from "@/components/dashboard/SourceDistributionChart";
import { StarDistributionChart } from "@/components/dashboard/StarDistributionChart";
import EnhancedAgentRankings from "@/components/dashboard/EnhancedAgentRankings";
import EnhancedMetricsGrid from "@/components/dashboard/EnhancedMetricsGrid";
import ProblemFeedback from "@/components/dashboard/ProblemFeedback";
import DepartmentPerformanceRankings from "@/components/dashboard/DepartmentPerformanceRankings";
import UnifiedAgentRankings from "@/components/dashboard/UnifiedAgentRankings";

interface Filters {
  dateRange: DateRange
  selectedDepartments: string[]
  selectedAgents: string[]
  selectedSources: string[]
  compareMode: boolean
}

type SectionId = 'agent-rankings' | 'department-rankings' | 'problem-feedback' | 'detailed-analytics';

export default function DashboardPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const dateRanges = getDateRanges();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<SectionId | null>(null);
  
  const [filters, setFilters] = useState<Filters>({
    dateRange: dateRanges.thisYear,
    selectedDepartments: [],
    selectedAgents: [],
    selectedSources: [],
    compareMode: false
  });

  // Handle section toggle with accordion behavior
  const handleSectionToggle = (sectionId: SectionId) => {
    setExpandedSection(prev => prev === sectionId ? null : sectionId);
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [reviewsData, agentsData, departmentsData] = await Promise.all([
          loadReviews(),
          loadAgents(),
          loadDepartments()
        ]);
        
        // Apply localStorage overrides to preserve user changes
        const agentsWithOverrides = applyAgentOverrides(agentsData);
        const departmentsWithCustom = mergeDepartments(departmentsData);
        
        // Update reviews to match agent department changes
        const updatedReviews = reviewsData.map(review => {
          const agent = agentsWithOverrides.find(a => a.id === review.agent_id);
          if (agent && agent.department_id !== review.department_id) {
            return { ...review, department_id: agent.department_id };
          }
          return review;
        });
        
        setReviews(updatedReviews);
        setAgents(agentsWithOverrides);
        setDepartments(departmentsWithCustom);
        
        const changeCount = getChangeCount();
        if (changeCount.agentChanges > 0 || changeCount.customDepartments > 0) {
          console.log(`✅ Restored ${changeCount.agentChanges} agent assignments and ${changeCount.customDepartments} custom departments from localStorage`);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Handle agent department updates (kept for table interactions)
  const handleAgentDepartmentUpdate = async (agentId: string, departmentId: string) => {
    try {
      saveAgentDepartment(agentId, departmentId);
      
      setAgents(prevAgents => 
        prevAgents.map(agent => 
          agent.id === agentId 
            ? { ...agent, department_id: departmentId }
            : agent
        )
      );
      
      setReviews(prevReviews =>
        prevReviews.map(review =>
          review.agent_id === agentId
            ? { ...review, department_id: departmentId }
            : review
        )
      );
      
      await updateAgentDepartment(agentId, departmentId);
      
      const agent = agents.find(a => a.id === agentId);
      const dept = departments.find(d => d.id === departmentId);
      
      if (agent && dept) {
        console.log(`✅ ${agent.display_name} moved to ${dept.name} (saved to localStorage)`);
      }
    } catch (error) {
      console.error('Error updating agent department:', error);
      alert('❌ Failed to update agent department');
    }
  };

  const handleCreateDepartment = async (departmentName: string): Promise<string> => {
    try {
      const newDeptId = `dept-${Date.now()}`;
      const newDepartment = {
        id: newDeptId,
        name: departmentName
      };
      
      saveCustomDepartment(newDepartment);
      setDepartments(prev => [...prev, newDepartment]);
      
      console.log(`✅ Department "${departmentName}" created and saved to localStorage`);
      return newDeptId;
    } catch (error) {
      console.error('Error creating department:', error);
      throw error;
    }
  };

  // Filter reviews based on current filters
  const filteredData = useMemo(() => {
    let filtered = reviews;
    filtered = filterReviewsByDate(filtered, filters.dateRange);
    filtered = filterReviewsByDepartments(filtered, filters.selectedDepartments);
    filtered = filterReviewsByAgents(filtered, filters.selectedAgents);
    
    if (filters.selectedSources.length > 0) {
      filtered = filtered.filter(review => filters.selectedSources.includes(review.source));
    }
    
    return filtered;
  }, [filters, reviews]);

  // Calculate comparison data (previous period)
  const comparisonData = useMemo(() => {
    if (!filters.compareMode) return null;
    
    const periodLength = filters.dateRange.to.getTime() - filters.dateRange.from.getTime();
    const previousDateRange: DateRange = {
      from: new Date(filters.dateRange.from.getTime() - periodLength),
      to: filters.dateRange.from
    };
    
    let previousFiltered = reviews;
    previousFiltered = filterReviewsByDate(previousFiltered, previousDateRange);
    previousFiltered = filterReviewsByDepartments(previousFiltered, filters.selectedDepartments);
    previousFiltered = filterReviewsByAgents(previousFiltered, filters.selectedAgents);
    
    if (filters.selectedSources.length > 0) {
      previousFiltered = previousFiltered.filter(review => filters.selectedSources.includes(review.source));
    }
    
    return calculateMetrics(previousFiltered);
  }, [filters, reviews]);

  // Calculate metrics
  const currentMetrics = calculateMetrics(filteredData);
  const agentMetrics = getAgentMetrics(filteredData, agents, departments);
  const dailyMetrics = getDailyMetrics(filteredData, filters.dateRange);
  
  // Debug logging - DETAILED
  console.log('📊 DASHBOARD DEBUG - FULL DETAILS:', {
    totalReviews: reviews.length,
    filteredReviews: filteredData.length,
    dateRangeLabel: filters.dateRange.label,
    dateFrom: filters.dateRange.from.toISOString(),
    dateTo: filters.dateRange.to.toISOString(),
    sampleReviewDates: reviews.slice(0, 10).map(r => new Date(r.review_ts).toISOString()),
    filteredSample: filteredData.slice(0, 10).map(r => new Date(r.review_ts).toISOString())
  });
  
  console.log('👥 TOP 5 AGENTS WITH TOTALS:');
  agentMetrics.slice(0, 5).forEach((agent, i) => {
    console.log(`  ${i + 1}. ${agent.agent_name}: ${agent.total} reviews (${agent.avg_rating.toFixed(2)}★)`);
  });
  
  // Calculate satisfaction trend data
  const satisfactionTrendData = useMemo(() => {
    return dailyMetrics
      .filter(day => day.total > 0)
      .map(day => {
        const satisfactionScore = ((day.star_5 + day.star_4) / day.total) * 100;
        const avgRating = (day.star_5 * 5 + day.star_4 * 4 + day.star_3 * 3 + day.star_2 * 2 + day.star_1 * 1) / day.total;
        return {
          date: day.date,
          satisfaction_score: satisfactionScore,
          avg_rating: avgRating,
          total: day.total
        };
      });
  }, [dailyMetrics]);

  // Sort reviews by date (most recent first)
  const sortedReviews = useMemo(() => {
    return [...filteredData].sort((a, b) => 
      new Date(b.review_ts).getTime() - new Date(a.review_ts).getTime()
    );
  }, [filteredData]);

  const handleAgentClick = (agentId: string) => {
    router.push(`/agent/${agentId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F6F9FC]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const getFilterSummary = () => {
    const parts = [];
    if (filters.selectedDepartments.length > 0) {
      parts.push(`${filters.selectedDepartments.length} department${filters.selectedDepartments.length > 1 ? 's' : ''}`);
    }
    if (filters.selectedAgents.length > 0) {
      parts.push(`${filters.selectedAgents.length} agent${filters.selectedAgents.length > 1 ? 's' : ''}`);
    }
    if (filters.selectedSources.length > 0) {
      parts.push(`${filters.selectedSources.length} source${filters.selectedSources.length > 1 ? 's' : ''}`);
    }
    return parts.length > 0 ? ` (${parts.join(', ')})` : '';
  };

  return (
    <DashboardLayout
      selectedRange={filters.dateRange}
      compareMode={filters.compareMode}
      onRangeChange={(range) => setFilters(prev => ({ ...prev, dateRange: range }))}
      onCompareModeChange={(enabled) => setFilters(prev => ({ ...prev, compareMode: enabled }))}
      dateRanges={dateRanges}
    >
      <div className="space-y-8 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 hfc:from-gray-50 hfc:via-gray-50 hfc:to-gray-50 min-h-screen pb-12 px-6">
        
        {/* Beautiful Time Period Selector - Now shown in all themes */}
        <TimePeriodSelector
          selectedRange={filters.dateRange}
          compareMode={filters.compareMode}
          onRangeChange={(range) => setFilters(prev => ({ ...prev, dateRange: range }))}
          onCompareModeChange={(enabled) => setFilters(prev => ({ ...prev, compareMode: enabled }))}
          dateRanges={dateRanges}
        />

      {/* KPI Metrics - Enhanced TailAdmin Style */}
      <EnhancedMetricsGrid 
        metrics={currentMetrics} 
        previousMetrics={comparisonData}
        showComparison={filters.compareMode}
      />

      {/* Unified Agent Rankings */}
      <div className="mt-8">
        <CollapsibleSection
          sectionId="agent-rankings"
          isExpanded={expandedSection === 'agent-rankings'}
          onToggle={() => handleSectionToggle('agent-rankings')}
          title="Agent Performance Rankings"
          subtitle="Top performing agents by review volume and ratings"
          badge="Top 10"
          icon={<Trophy className="w-5 h-5" />}
          previewContent={
            <div className="flex items-center gap-3 text-sm">
              {/* Top Agent Image */}
              {agentMetrics[0] && (() => {
                const topAgent = agents.find(a => a.id === agentMetrics[0].agent_id);
                return topAgent?.image_url ? (
                  <img 
                    src={topAgent.image_url} 
                    alt={agentMetrics[0].agent_name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                    {agentMetrics[0].agent_name.charAt(0)}
                  </div>
                );
              })()}
              <div className="text-right">
                <div className="font-semibold text-gray-900 dark:text-white">
                  {agentMetrics[0]?.agent_name || 'N/A'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Top Agent</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-green-600">
                  {agentMetrics[0]?.total || 0} reviews
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{agentMetrics[0]?.avg_rating?.toFixed(2) || '0.00'}★</div>
              </div>
            </div>
          }
        >
          <UnifiedAgentRankings data={agentMetrics} limit={10} />
        </CollapsibleSection>
      </div>

      {/* Department Performance Rankings */}
      <div className="mt-8">
        <CollapsibleSection
          sectionId="department-rankings"
          isExpanded={expandedSection === 'department-rankings'}
          onToggle={() => handleSectionToggle('department-rankings')}
          title="Department Performance Rankings"
          subtitle="Compare performance metrics across all departments"
          badge={`${departments.length} depts`}
          icon={<Building2 className="w-5 h-5" />}
          previewContent={
            <div className="flex items-center gap-4 text-sm">
              {/* Top 3 Departments with their top agent */}
              {departments.slice(0, 3).map((dept) => {
                const deptReviews = filteredData.filter(r => r.department_id === dept.id);
                const deptAgentMetrics = getAgentMetrics(deptReviews, agents, departments);
                const topAgent = deptAgentMetrics[0];
                const agent = topAgent ? agents.find(a => a.id === topAgent.agent_id) : null;
                
                return (
                  <div key={dept.id} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                    {agent?.image_url ? (
                      <img 
                        src={agent.image_url} 
                        alt={topAgent?.agent_name || ''}
                        className="w-9 h-9 rounded-full object-cover border-2 border-indigo-300"
                        onError={(e) => {
                          // Fallback if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs"
                      style={{ display: agent?.image_url ? 'none' : 'flex' }}
                    >
                      {topAgent?.agent_name?.charAt(0) || dept.name.charAt(0)}
                    </div>
                    <div className="text-left">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {dept.name}
                      </div>
                      <div className="font-semibold text-gray-900 dark:text-white text-xs">
                        👑 {topAgent?.agent_name || 'No agents'}
                      </div>
                      <div className="text-xs text-indigo-600 font-medium">
                        {topAgent?.total || 0} reviews
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          }
        >
          <DepartmentPerformanceRankings reviews={filteredData} departments={departments} agents={agents} limit={10} />
        </CollapsibleSection>
      </div>

      {/* Problem Feedback Section - Low-rated reviews with comments */}
      <div className="mt-8">
        <CollapsibleSection
          sectionId="problem-feedback"
          isExpanded={expandedSection === 'problem-feedback'}
          onToggle={() => handleSectionToggle('problem-feedback')}
          title="Problem Feedback"
          subtitle="Low-rated reviews requiring attention"
          badge="Critical"
          icon={<AlertTriangle className="w-5 h-5" />}
          previewContent={
            <div className="flex items-center gap-4 text-sm">
              <div className="text-right">
                <div className="font-semibold text-red-600">
                  {filteredData.filter(r => r.rating <= 2).length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Low Ratings</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-orange-600">
                  {filteredData.filter(r => r.rating <= 2 && r.comment && r.comment.trim()).length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">With Comments</div>
              </div>
            </div>
          }
        >
          <ProblemFeedback reviews={filteredData} />
        </CollapsibleSection>
      </div>

      {/* Detailed Analytics Collapsible Section */}
      <div className="mt-8">
        <CollapsibleSection
          sectionId="detailed-analytics"
          isExpanded={expandedSection === 'detailed-analytics'}
          onToggle={() => handleSectionToggle('detailed-analytics')}
          title="Detailed Analytics & Reports"
          subtitle="Comprehensive trends, charts, and data tables"
          badge="Advanced"
          icon={<BarChart3 className="w-5 h-5" />}
          previewContent={
            <div className="flex items-center gap-4 text-sm">
              <div className="text-right">
                <div className="font-semibold text-gray-900 dark:text-white">
                  {satisfactionTrendData.length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Days Tracked</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-purple-600">
                  6 Charts
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">4 Tables</div>
              </div>
            </div>
          }
        >
          <div className="space-y-6">
            {/* Satisfaction Trend - Your existing chart */}
            <div>
              <SatisfactionTrend data={satisfactionTrendData} />
            </div>

            {/* Charts Row - Department Comparison & Problem Spotlight */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <DepartmentComparison reviews={filteredData} departments={departments} />
              <ProblemSpotlight reviews={filteredData} departments={departments} />
            </div>

            {/* TailAdmin Charts Row 1 */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <RatingTrendChart reviews={filteredData} />
              <StarDistributionChart metrics={currentMetrics} />
            </div>

            {/* TailAdmin Charts Row 2 */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <SourceDistributionChart reviews={filteredData} />
              <DepartmentComparisonChart reviews={filteredData} departments={departments} />
            </div>

            {/* Agent Performance Table - TailAdmin Style */}
            <AgentPerformanceTable 
              agentMetrics={agentMetrics.sort((a, b) => b.total - a.total)} 
              maxRows={10} 
            />

            {/* Data Tables - Your existing tables */}
            <div className="space-y-6">
              <AgentTable 
                data={agentMetrics} 
                onAgentClick={handleAgentClick}
                departments={departments}
                onDepartmentChange={handleAgentDepartmentUpdate}
                onCreateDepartment={handleCreateDepartment}
              />
              
              <ReviewTable data={filteredData} agents={agents} departments={departments} />
              
              <CustomerFeedbackTable data={filteredData} agents={agents} departments={departments} />
              
              {/* TailAdmin Reviews Table */}
              <ReviewsTable 
                reviews={sortedReviews} 
                agents={agents} 
                departments={departments}
                maxRows={15}
              />
            </div>
          </div>
        </CollapsibleSection>
      </div>
      </div>
    </DashboardLayout>
  );
}
