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
import { AnimatedPreview } from '@/components/AnimatedPreview';

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
import RatingDistributionWidget from "@/components/RatingDistributionWidget";
import ProblemFeedback from "@/components/dashboard/ProblemFeedback";
import DepartmentPerformanceRankings from "@/components/dashboard/DepartmentPerformanceRankings";
import UnifiedAgentRankings from "@/components/dashboard/UnifiedAgentRankings";
import { 
  loadDisplayPreferences,
  type DisplayPreferences 
} from '@/lib/displayPreferences';

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

  // Load display preferences from localStorage
  const [displayPrefs, setDisplayPrefs] = useState<DisplayPreferences>({ showRatingDistribution: false });
  
  useEffect(() => {
    setDisplayPrefs(loadDisplayPreferences());
  }, []);

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
      {/* Centered Dashboard Container */}
      <div className="max-w-7xl mx-auto space-y-8 min-h-screen pb-12 px-6">
        
        {/* HFC Dashboard Title - Only shown in HFC theme */}
        {theme === 'hfc' && (
          <div className="text-center pt-1 pb-1">
            <h1 className="hfc-title-horizontal text-2xl md:text-3xl lg:text-4xl text-white tracking-tight">
              <span className="font-extrabold">HEALTH</span> <span className="hfc-for-word">for</span> <span className="font-extrabold">CALIFORNIA</span>
            </h1>
            <p className="text-sm md:text-base text-white/90 mt-0.5 font-light">
              Reviews Dashboard
            </p>
          </div>
        )}
        
        {/* Beautiful Time Period Selector - Now shown in all themes */}
        <TimePeriodSelector
          selectedRange={filters.dateRange}
          compareMode={filters.compareMode}
          onRangeChange={(range) => setFilters(prev => ({ ...prev, dateRange: range }))}
          onCompareModeChange={(enabled) => setFilters(prev => ({ ...prev, compareMode: enabled }))}
          dateRanges={dateRanges}
        />

        {/* Rating Distribution Widget - Conditionally shown based on settings */}
        {displayPrefs.showRatingDistribution && (
          <RatingDistributionWidget 
            metrics={currentMetrics} 
            reviews={filteredData}
            showDonut={true}
          />
        )}

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
            agentMetrics[0] && (
              <AnimatedPreview key={`preview-agent-${filters.dateRange.label}`} direction="left">
                {(() => {
                  const topAgent = agents.find(a => a.id === agentMetrics[0].agent_id);
                  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(agentMetrics[0].agent_name)}&background=0066cc&color=fff&size=256`;
                  
                  return (
                    <button 
                      className="w-full rounded-xl border-2 border-yellow-400 bg-white hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 relative overflow-hidden cursor-pointer text-left"
                    >
                  {/* Thin gold accent strip at top */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-amber-500 z-0" />
                  
                  <div className="flex items-center gap-3 p-3 relative">
                    {/* Avatar with rank badge */}
                    <div className="relative flex-shrink-0">
                      <div className="h-16 w-16 rounded-full border-2 border-yellow-400 shadow-md bg-white overflow-hidden">
                        <img
                          src={topAgent?.image_url || fallbackUrl}
                          alt={agentMetrics[0].agent_name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = fallbackUrl;
                          }}
                        />
                      </div>
                      {/* Rank badge - white text */}
                      <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-yellow-500 flex items-center justify-center text-sm font-black text-white border-2 border-white shadow-lg">
                        1
                      </div>
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold text-[#0066cc] uppercase tracking-wide mb-0.5">
                        👑 TOP AGENT
                      </div>
                      <div className="font-black text-gray-900 text-base truncate mb-0.5">
                        {agentMetrics[0].agent_name}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <span className="text-[#0066cc]">{agentMetrics[0].total} reviews</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-[#0066cc]">{agentMetrics[0].avg_rating.toFixed(2)}★</span>
                      </div>
                      {/* Rating bar */}
                      <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#00ca6f]" style={{ width: `${agentMetrics[0].percent_5_star}%` }} />
                      </div>
                    </div>
                  </div>
                </button>
              );
            })()}
              </AnimatedPreview>
            )
          }
        >
          <UnifiedAgentRankings 
            key={`agent-rankings-${filters.dateRange.label}`}
            data={agentMetrics} 
            limit={10} 
          />
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
            <AnimatedPreview key={`dept-preview-${filters.dateRange.label}`} direction="right">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 text-sm w-full">
                {/* Top 3 Departments with their top agent */}
                {departments.slice(0, 3).map((dept, index) => {
                const deptReviews = filteredData.filter(r => r.department_id === dept.id);
                const deptAgentMetrics = getAgentMetrics(deptReviews, agents, departments);
                const topAgent = deptAgentMetrics[0];
                const agent = topAgent ? agents.find(a => a.id === topAgent.agent_id) : null;
                const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(topAgent?.agent_name || dept.name)}&background=0066cc&color=fff&size=256`;
                
                // Determine border and accent colors based on rank
                const rankColors = [
                  { border: 'border-yellow-400', accent: 'from-yellow-400 to-amber-500', badge: 'bg-yellow-500' },
                  { border: 'border-gray-400', accent: 'from-gray-400 to-gray-500', badge: 'bg-gray-400' },
                  { border: 'border-orange-400', accent: 'from-orange-400 to-orange-600', badge: 'bg-orange-500' }
                ];
                const colors = rankColors[index] || rankColors[0];
                
                return (
                  <button 
                    key={`preview-dept-${dept.id}-${filters.dateRange.label}-${index}`}
                    className={`w-full sm:flex-1 rounded-xl border-2 ${colors.border} bg-white hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 relative overflow-hidden cursor-pointer text-left`}
                  >
                    {/* Thin accent strip at top */}
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.accent} z-0`} />
                    
                    <div className="flex items-center gap-3 p-3 relative">
                      {/* Avatar with rank badge */}
                      <div className="relative flex-shrink-0">
                        <div className={`h-16 w-16 rounded-full border-2 ${colors.border} shadow-md bg-white overflow-hidden`}>
                          <img
                            src={agent?.image_url || fallbackUrl}
                            alt={topAgent?.agent_name || dept.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = fallbackUrl;
                            }}
                          />
                        </div>
                        {/* Rank badge */}
                        <div className={`absolute -bottom-1 -right-1 h-7 w-7 rounded-full ${colors.badge} flex items-center justify-center text-sm font-black text-white border-2 border-white shadow-lg`}>
                          {index + 1}
                        </div>
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-bold text-[#0066cc] uppercase tracking-wide mb-0.5 truncate">
                          {dept.name}
                        </div>
                        <div className="font-black text-gray-900 dark:text-white text-base truncate mb-0.5">
                          {topAgent?.agent_name || 'No agents'}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold">
                          <span className="text-[#0066cc]">{topAgent?.total || 0} reviews</span>
                        </div>
                        {/* Rating bar */}
                        {topAgent && (
                          <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#00ca6f]" style={{ width: `${topAgent.percent_5_star}%` }} />
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
              </div>
            </AnimatedPreview>
          }
        >
          <DepartmentPerformanceRankings 
            key={`dept-rankings-${filters.dateRange.label}`}
            reviews={filteredData} 
            departments={departments} 
            agents={agents} 
            limit={10} 
          />
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
            (() => {
              const lowRatings = filteredData.filter(r => r.rating <= 2);
              const withComments = lowRatings.filter(r => r.comment && r.comment.trim());
              const mostRecentProblem = withComments.sort((a, b) => 
                new Date(b.review_ts).getTime() - new Date(a.review_ts).getTime()
              )[0];
              
              return (
                <div className="flex items-start gap-4">
                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm flex-shrink-0">
                    <div className="text-center px-3 py-2 bg-red-50 rounded-xl border-2 border-red-200">
                      <div className="font-black text-red-600 text-lg">
                        {lowRatings.length}
                      </div>
                      <div className="text-xs text-red-700 font-bold uppercase tracking-wide">Low Ratings</div>
                    </div>
                    <div className="text-center px-3 py-2 bg-orange-50 rounded-xl border-2 border-orange-200">
                      <div className="font-black text-orange-600 text-lg">
                        {withComments.length}
                      </div>
                      <div className="text-xs text-orange-700 font-bold uppercase tracking-wide">With Comments</div>
                    </div>
                  </div>
                  
                  {/* Most Recent Issue Snippet */}
                  {mostRecentProblem && (
                    <div className="flex-1 min-w-0 border-l-4 border-red-300 dark:border-red-700 pl-4">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2 font-bold">
                        <span className="font-black uppercase tracking-wide">Latest Issue:</span>
                        <span className="text-red-600 dark:text-red-400 font-black">
                          {mostRecentProblem.rating}★
                        </span>
                        <span>•</span>
                        <span className="font-black">
                          Agent {agents.find(a => a.id === mostRecentProblem.agent_id)?.display_name || mostRecentProblem.agent_id}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-300 italic line-clamp-2 font-medium">
                        "{mostRecentProblem.comment}"
                      </div>
                    </div>
                  )}
                </div>
              );
            })()
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
            <div className="flex items-center gap-4 w-full">
              {/* Rating Distribution */}
              <div className="flex-1 rounded-xl border-2 border-blue-300 bg-white hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                {/* Thin accent strip at top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 z-0" />
                
                <div className="p-4 relative">
                  <div className="text-[10px] font-bold text-[#0066cc] uppercase tracking-wide mb-2">
                    Rating Distribution
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = filteredData.filter(r => r.rating === star).length;
                      const total = filteredData.length;
                      const percent = total > 0 ? Math.round((count / total) * 100) : 0;
                      return (
                        <div key={star} className="text-center">
                          <div className="text-xl font-black text-gray-900">{percent}%</div>
                          <div className="text-xs text-gray-500 font-semibold">{star}★</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Top Departments */}
              <div className="flex-1 rounded-xl border-2 border-green-300 bg-white hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                {/* Thin accent strip at top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-emerald-500 z-0" />
                
                <div className="p-4 relative">
                  <div className="text-[10px] font-bold text-[#0066cc] uppercase tracking-wide mb-2">
                    Top Departments
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    {departments.slice(0, 3).map((dept) => {
                      const deptReviews = filteredData.filter(r => r.department_id === dept.id);
                      const avgRating = deptReviews.length > 0 
                        ? deptReviews.reduce((sum, r) => sum + r.rating, 0) / deptReviews.length 
                        : 0;
                      const color = avgRating >= 4.5 ? 'text-[#00ca6f]' : avgRating >= 4.0 ? 'text-[#0066cc]' : 'text-yellow-600';
                      return (
                        <div key={dept.id} className="text-center flex-1">
                          <div className="text-xs text-gray-600 font-semibold mb-1 truncate">{dept.name}</div>
                          <div className={`text-xl font-black ${color}`}>{avgRating.toFixed(1)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
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
