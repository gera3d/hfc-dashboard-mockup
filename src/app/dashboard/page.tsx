"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from 'next/navigation';
import { 
  loadReviews, 
  loadAgents, 
  loadDepartments,
  refreshReviews,
  refreshAgents,
  refreshDepartments,
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
import { syncFromGoogleSheets } from '@/data/googleSheetsService';
import {
  applyAgentOverrides,
  mergeDepartments,
  saveAgentDepartment,
  saveCustomDepartment,
  clearAllOverrides,
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
import GlobalFilters from '@/components/GlobalFilters';
import { AgentDepartmentManager } from '@/components/AgentDepartmentManager';
import KPITiles from '@/components/KPITiles';

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

interface Filters {
  dateRange: DateRange
  selectedDepartments: string[]
  selectedAgents: string[]
  selectedSources: string[]
  compareMode: boolean
}

export default function DashboardPage() {
  const router = useRouter();
  const dateRanges = getDateRanges();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [showAgentManager, setShowAgentManager] = useState(false);
  
  const [filters, setFilters] = useState<Filters>({
    dateRange: dateRanges.thisYear,
    selectedDepartments: [],
    selectedAgents: [],
    selectedSources: [],
    compareMode: false
  });

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

  // Refresh data from local cache (fast)
  const refreshData = async () => {
    setLoading(true);
    try {
      const [reviewsData, agentsData, departmentsData] = await Promise.all([
        refreshReviews(),
        refreshAgents(),
        refreshDepartments()
      ]);
      
      const agentsWithOverrides = applyAgentOverrides(agentsData);
      const departmentsWithCustom = mergeDepartments(departmentsData);
      
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
      setLastRefresh(new Date());
      console.log('Data refreshed from local cache (with localStorage overrides)');
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sync from Google Sheets (slow, updates local cache)
  const syncData = async () => {
    setSyncing(true);
    try {
      const result = await syncFromGoogleSheets();
      if (result.success) {
        await refreshData();
        alert(`✅ Data synced successfully!\n\nLast updated: ${result.lastUpdated}\n\nThe dashboard now shows the latest data from Google Sheets.`);
      } else {
        alert(`❌ Sync failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Error syncing data:', error);
      alert('❌ Failed to sync data from Google Sheets');
    } finally {
      setSyncing(false);
    }
  };

  // Handle agent department updates
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

  const handleClearLocalChanges = async () => {
    const changeCount = getChangeCount();
    const message = `This will reset ${changeCount.agentChanges} agent assignments and ${changeCount.customDepartments} custom departments back to what's in your Google Sheet.\n\nAre you sure?`;
    
    if (confirm(message)) {
      clearAllOverrides();
      await refreshData();
      alert('✅ Local changes cleared. Data reloaded from Google Sheets.');
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
    <div className="space-y-6 bg-[#F6F9FC] min-h-screen pb-12">
      {/* TailAdmin-style Header */}
      <div className="bg-white border-b border-gray-200 dark:bg-gray-dark dark:border-gray-800 -mx-6 -mt-6 px-6 py-6 mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Analytics Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Comprehensive review insights • {filteredData.length} reviews{getFilterSummary()}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={refreshData}
              disabled={loading || syncing}
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
              title="Reload from local cache (fast)"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Loading...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </>
              )}
            </button>
            <button
              onClick={syncData}
              disabled={loading || syncing}
              className="px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
              title="Sync from Google Sheets (slow)"
            >
              {syncing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Syncing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Sync
                </>
              )}
            </button>
            <button
              onClick={() => setShowAgentManager(!showAgentManager)}
              className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {showAgentManager ? 'Hide' : 'Manage'} Agents
            </button>
          </div>
        </div>
      </div>

      {/* Global Filters */}
      <div className="-mx-6 px-6 bg-[#F6F9FC]">
        <GlobalFilters filters={filters} onFiltersChange={setFilters} />
      </div>

      {/* Local Changes Indicator */}
      {(() => {
        const changeCount = getChangeCount();
        const totalChanges = changeCount.agentChanges + changeCount.customDepartments;
        if (totalChanges > 0) {
          return (
            <div className="p-3 bg-amber-50 border-l-4 border-amber-400 rounded flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-amber-900">
                    💾 {totalChanges} Local Change{totalChanges > 1 ? 's' : ''} Saved
                  </p>
                  <p className="text-xs text-amber-700">
                    {changeCount.agentChanges} agent assignment{changeCount.agentChanges !== 1 ? 's' : ''}, 
                    {' '}{changeCount.customDepartments} custom department{changeCount.customDepartments !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClearLocalChanges}
                className="px-3 py-1 text-xs font-medium text-amber-700 bg-amber-100 rounded hover:bg-amber-200 transition-colors"
              >
                Reset to Sheets
              </button>
            </div>
          );
        }
        return null;
      })()}

      {/* Agent Department Manager - Collapsible */}
      {showAgentManager && (
        <div className="mb-6">
          <AgentDepartmentManager
            agents={agents}
            departments={departments}
            onUpdate={handleAgentDepartmentUpdate}
          />
        </div>
      )}

      {/* KPI Metrics - Enhanced TailAdmin Style */}
      <EnhancedMetricsGrid 
        metrics={currentMetrics} 
        previousMetrics={comparisonData}
        showComparison={filters.compareMode}
      />

      {/* Hero Chart - Enhanced Agent Rankings */}
      <div className="mt-8">
        <EnhancedAgentRankings data={agentMetrics} limit={10} />
      </div>

      {/* Department Performance Rankings */}
      <div className="mt-8">
        <DepartmentPerformanceRankings reviews={filteredData} departments={departments} agents={agents} limit={10} />
      </div>

      {/* Problem Feedback Section - Low-rated reviews with comments */}
      <div className="mt-8">
        <ProblemFeedback reviews={filteredData} />
      </div>

      {/* Satisfaction Trend - Your existing chart */}
      <div className="mt-6">
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
  );
}
