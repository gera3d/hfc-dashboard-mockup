"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from 'next/navigation';
import { Trophy, Building2, AlertTriangle, BarChart3 } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import HFCBrandTitle from '@/components/HFCBrandTitle';
import AnimatedNumber from '@/components/AnimatedNumber';
import FadeInSection from '@/components/FadeInSection';
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
  getChangeCount
} from '@/lib/localStorage';
import { 
  subscribeToHiddenAgents, 
  getHiddenAgents, 
  hideAgent,
  subscribeToDepartmentChanges,
  applyAgentDepartmentAssignments,
  mergeCustomDepartments,
  assignAgentToDepartment,
  createCustomDepartment
} from '@/lib/supabaseService';
import { migrateDepartmentDataToSupabase, checkMigrationNeeded } from '@/lib/departmentMigration';

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
import PerformanceTierGuide from "@/components/dashboard/PerformanceTierGuide";
import { 
  loadDisplayPreferences,
  type DisplayPreferences 
} from '@/lib/displayPreferences';
import EnhancedLoader from '@/components/EnhancedLoader';
import AgentDetailsModal from '@/components/AgentDetailsModal';

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
  const [isReady, setIsReady] = useState(false);
  const [expandedSection, setExpandedSection] = useState<SectionId | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [currentStep, setCurrentStep] = useState<string>('reviews');
  
  // Agent detail slide state
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [isSliding, setIsSliding] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'in' | 'out'>('in');
  
  // Hidden agents state
  const [hiddenAgentIds, setHiddenAgentIds] = useState<Set<string>>(new Set());
  const [hiddenAgentsLoaded, setHiddenAgentsLoaded] = useState(false);
  
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

  // Load hidden agents on mount
  useEffect(() => {
    const loadHiddenAgents = async () => {
      try {
        console.log('🔒 Loading hidden agents from Supabase...');
        const hiddenIds = await getHiddenAgents();
        console.log('🔒 Received hidden agent IDs:', hiddenIds);
        const hiddenSet = new Set(hiddenIds);
        setHiddenAgentIds(hiddenSet);
        setHiddenAgentsLoaded(true);
        console.log('🔒 Loaded hidden agents on mount:', Array.from(hiddenSet));
      } catch (error) {
        console.error('❌ Error loading hidden agents:', error);
        setHiddenAgentsLoaded(true); // Set to true anyway so app doesn't hang
      }
    };
    loadHiddenAgents();
  }, []);

  // Subscribe to real-time hidden agents updates
  useEffect(() => {
    console.log('📡 Setting up real-time subscription for hidden agents...');
    const unsubscribe = subscribeToHiddenAgents(async () => {
      console.log('🔄 Hidden agents changed, reloading...');
      const hiddenIds = await getHiddenAgents();
      setHiddenAgentIds(new Set(hiddenIds));
      console.log('🔒 Updated hidden agents:', hiddenIds);
    });
    
    return unsubscribe;
  }, []);

  // Subscribe to real-time department changes
  useEffect(() => {
    console.log('📡 Setting up real-time subscription for departments...');
    const unsubscribe = subscribeToDepartmentChanges(async () => {
      console.log('🔄 Departments changed, reloading...');
      // Reload departments and agents when changes occur
      const [agentsData, departmentsData] = await Promise.all([
        loadAgents(),
        loadDepartments()
      ]);
      const agentsWithOverrides = await applyAgentDepartmentAssignments(agentsData);
      const departmentsWithCustom = await mergeCustomDepartments(departmentsData);
      setAgents(agentsWithOverrides);
      setDepartments(departmentsWithCustom);
    });
    
    return unsubscribe;
  }, []);

  // Check for migration on mount
  useEffect(() => {
    const checkAndPromptMigration = async () => {
      try {
        const migrationStatus = await checkMigrationNeeded();
        if (migrationStatus.needed) {
          const message = `📦 Migration Available: You have department data saved locally.\n\n` +
            `• ${migrationStatus.localCustomDepts} custom department${migrationStatus.localCustomDepts !== 1 ? 's' : ''}\n` +
            `• ${migrationStatus.localAssignments} agent assignment${migrationStatus.localAssignments !== 1 ? 's' : ''}\n\n` +
            `Would you like to migrate this data to Supabase for permanent storage and cross-device sync?`;
          
          if (window.confirm(message)) {
            console.log('🔄 Starting migration...');
            const result = await migrateDepartmentDataToSupabase();
            if (result.success) {
              alert(`✅ Migration successful!\n\n` +
                `• ${result.customDepartmentsMigrated} custom departments migrated\n` +
                `• ${result.agentAssignmentsMigrated} agent assignments migrated`);
              // Reload data to show migrated data
              window.location.reload();
            } else {
              alert(`⚠️ Migration completed with errors:\n\n${result.errors.join('\n')}`);
            }
          }
        }
      } catch (error) {
        console.error('Error checking migration:', error);
      }
    };
    
    checkAndPromptMigration();
  }, []);

  // Handle section toggle with accordion behavior
  const handleSectionToggle = (sectionId: SectionId) => {
    setExpandedSection(prev => prev === sectionId ? null : sectionId);
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setCurrentStep('reviews');
        const reviewsData = await loadReviews();
        setCompletedSteps(prev => new Set([...prev, 'reviews']));
        
        setCurrentStep('agents');
        const agentsData = await loadAgents();
        setCompletedSteps(prev => new Set([...prev, 'agents']));
        
        setCurrentStep('departments');
        const departmentsData = await loadDepartments();
        setCompletedSteps(prev => new Set([...prev, 'departments']));
        
        setCurrentStep('metrics');
        // Apply Supabase overrides to preserve user changes
        const agentsWithOverrides = await applyAgentDepartmentAssignments(agentsData);
        const departmentsWithCustom = await mergeCustomDepartments(departmentsData);
        
        // Update reviews to match agent department changes
        const updatedReviews = reviewsData.map(review => {
          const agent = agentsWithOverrides.find((a: Agent) => a.id === review.agent_id);
          if (agent && agent.department_id !== review.department_id) {
            return { ...review, department_id: agent.department_id };
          }
          return review;
        });
        
        setReviews(updatedReviews);
        setAgents(agentsWithOverrides);
        setDepartments(departmentsWithCustom);
        setCompletedSteps(prev => new Set([...prev, 'metrics']));
        
        const changeCount = getChangeCount();
        if (changeCount.agentChanges > 0 || changeCount.customDepartments > 0) {
          console.log(`✅ Restored ${changeCount.agentChanges} agent assignments and ${changeCount.customDepartments} custom departments from localStorage`);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
        // Small delay to ensure theme is applied before showing content
        setTimeout(() => setIsReady(true), 100);
      }
    };
    
    loadData();
  }, []);

  // Handle agent department updates (now saved to Supabase)
  const handleAgentDepartmentUpdate = async (agentId: string, departmentId: string) => {
    try {
      // Save to Supabase instead of localStorage
      const success = await assignAgentToDepartment(agentId, departmentId);
      
      if (!success) {
        throw new Error('Failed to save to Supabase');
      }
      
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
        console.log(`✅ ${agent.display_name} moved to ${dept.name} (saved to Supabase)`);
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
      
      console.log(`📝 Creating department "${departmentName}" with ID: ${newDeptId}`);
      
      // Save to Supabase instead of localStorage
      const success = await createCustomDepartment(newDeptId, departmentName);
      
      if (!success) {
        console.error('❌ Supabase returned false when creating department');
        throw new Error('Failed to save department to Supabase. Please check the browser console for details and verify that the Supabase tables exist.');
      }
      
      setDepartments(prev => [...prev, newDepartment]);
      
      console.log(`✅ Department "${departmentName}" created and saved to Supabase`);
      return newDeptId;
    } catch (error) {
      console.error('❌ Error creating department:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to create department: ${errorMessage}\n\nPlease check:\n1. Supabase tables exist (run supabase-departments-setup.sql)\n2. Browser console for detailed error`);
      throw error;
    }
  };

  const handleHideAgent = async (agentId: string) => {
    try {
      console.log(`🔒 Hiding agent: ${agentId}`);
      const success = await hideAgent(agentId);
      
      if (!success) {
        throw new Error('Failed to hide agent');
      }
      
      // Reload hidden agents to trigger re-render
      const hiddenIds = await getHiddenAgents();
      setHiddenAgentIds(new Set(hiddenIds));
      
      console.log(`✅ Agent ${agentId} hidden successfully`);
    } catch (error) {
      console.error('❌ Error hiding agent:', error);
      alert('Failed to hide agent. Please try again.');
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

  // Filter out hidden agents from reviews
  const visibleReviews = useMemo(() => {
    if (!hiddenAgentsLoaded) {
      console.log('⏳ Hidden agents not loaded yet, returning all filtered data');
      return filteredData;
    }
    
    console.log('🔍 visibleReviews useMemo - hiddenAgentIds:', Array.from(hiddenAgentIds));
    console.log('📊 filteredData length:', filteredData.length);
    
    const visible = filteredData.filter(review => {
      const isHidden = hiddenAgentIds.has(review.agent_id);
      if (isHidden) {
        console.log(`🚫 Filtering out review from hidden agent: ${review.agent_id}`);
      }
      return !isHidden;
    });
    
    console.log(`👁️ Filtered reviews: ${filteredData.length} -> ${visible.length} (removed ${filteredData.length - visible.length})`);
    return visible;
  }, [filteredData, hiddenAgentIds, hiddenAgentsLoaded]);

  // Filter out hidden agents from agents list
  const visibleAgents = useMemo(() => {
    if (!hiddenAgentsLoaded) {
      console.log('⏳ Agents: Hidden agents not loaded yet');
      return agents;
    }
    
    console.log('🔍 visibleAgents useMemo - hiddenAgentIds:', Array.from(hiddenAgentIds));
    console.log('👥 Total agents:', agents.length);
    
    const visible = agents.filter(agent => {
      const isHidden = hiddenAgentIds.has(agent.id);
      if (isHidden) {
        console.log(`🚫 Filtering out hidden agent: ${agent.id} (${agent.display_name})`);
      }
      return !isHidden;
    });
    
    console.log(`👁️ Filtered agents: ${agents.length} -> ${visible.length}`);
    return visible;
  }, [agents, hiddenAgentIds, hiddenAgentsLoaded]);

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
  const currentMetrics = calculateMetrics(visibleReviews);
  const agentMetrics = getAgentMetrics(visibleReviews, visibleAgents, departments);
  const dailyMetrics = getDailyMetrics(visibleReviews, filters.dateRange);
  
  // Debug logging - DETAILED
  console.log('📊 DASHBOARD DEBUG - FULL DETAILS:', {
    totalReviews: reviews.length,
    filteredReviews: visibleReviews.length,
    dateRangeLabel: filters.dateRange.label,
    dateFrom: filters.dateRange.from.toISOString(),
    dateTo: filters.dateRange.to.toISOString(),
    sampleReviewDates: reviews.slice(0, 10).map(r => new Date(r.review_ts).toISOString()),
    filteredSample: visibleReviews.slice(0, 10).map(r => new Date(r.review_ts).toISOString())
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
    return [...visibleReviews].sort((a, b) => 
      new Date(b.review_ts).getTime() - new Date(a.review_ts).getTime()
    );
  }, [visibleReviews]);

  const handleAgentClick = (agentId: string) => {
    setSlideDirection('in');
    setSelectedAgentId(agentId);
    // Prevent body scroll when agent detail is open
    document.body.style.overflow = 'hidden';
  };
  
  const handleBackToDashboard = () => {
    setSlideDirection('out');
    setSelectedAgentId(null);
    // Re-enable body scroll
    document.body.style.overflow = '';
  };

  if (loading) {
    return (
      <EnhancedLoader 
        theme={theme === 'hfc' ? 'hfc' : 'default'}
        completedSteps={completedSteps}
        currentStep={currentStep}
      />
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
      <div className={`relative w-full min-h-screen transition-opacity duration-500 ${isReady ? 'opacity-100' : 'opacity-0'}`}>
        {/* Dashboard Container - slides left when agent selected */}
        <div 
          className={`w-full transition-transform duration-500 ease-in-out ${
            selectedAgentId ? '-translate-x-full' : 'translate-x-0'
          }`}
        >
          <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 min-h-screen pb-12 px-4 sm:px-6">
        
        {/* HFC Dashboard Title - Only shown in HFC theme */}
        {theme === 'hfc' && (
          <div className="text-center pt-1 pb-1">
            <h1 className="hfc-title-horizontal text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white tracking-tight">
              <span className="font-extrabold">HEALTH</span> <span className="hfc-for-word">for</span> <span className="font-extrabold">CALIFORNIA</span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-white/90 mt-0.5 font-light">
              Reviews Dashboard
            </p>
          </div>
        )}
        
        {/* Beautiful Time Period Selector - Now shown in all themes */}
        <FadeInSection delay={50} direction="down" duration={500}>
          <TimePeriodSelector
            selectedRange={filters.dateRange}
            compareMode={filters.compareMode}
            onRangeChange={(range) => setFilters(prev => ({ ...prev, dateRange: range }))}
            onCompareModeChange={(enabled) => setFilters(prev => ({ ...prev, compareMode: enabled }))}
            dateRanges={dateRanges}
          />
        </FadeInSection>

        {/* Rating Distribution Widget - Conditionally shown based on settings */}
        {displayPrefs.showRatingDistribution && (
          <FadeInSection delay={250} direction="up" duration={500}>
            <RatingDistributionWidget 
              metrics={currentMetrics} 
              reviews={filteredData}
              showDonut={true}
            />
          </FadeInSection>
        )}

      {/* KPI Metrics - Enhanced TailAdmin Style */}
      <FadeInSection delay={400} direction="up" duration={500}>
        <EnhancedMetricsGrid 
          metrics={currentMetrics} 
          previousMetrics={comparisonData}
          showComparison={filters.compareMode}
        />
      </FadeInSection>

      {/* Unified Agent Rankings */}
      <FadeInSection delay={800} direction="up" duration={500}>
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
                    <div 
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
                </div>
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
            onAgentClick={handleAgentClick}
          />
        </CollapsibleSection>
        </div>
      </FadeInSection>

      {/* Department Performance Rankings */}
      <FadeInSection delay={1100} direction="up" duration={500}>
        <div className="mt-8">
          <CollapsibleSection
            sectionId="department-rankings"
          isExpanded={expandedSection === 'department-rankings'}
          onToggle={() => handleSectionToggle('department-rankings')}
          title="Department Performance Rankings"
          subtitle="Compare performance metrics across all departments"
          badge={`${departments.length} dept${departments.length !== 1 ? 's' : ''}`}
          icon={<Building2 className="w-5 h-5" />}
          previewContent={
            <AnimatedPreview key={`dept-preview-${filters.dateRange.label}`} direction="right">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 text-sm w-full">
                {/* Top 3 Departments with their top agent */}
                {departments.slice(0, 3).map((dept, index) => {
                const deptReviews = visibleReviews.filter(r => r.department_id === dept.id);
                const deptAgentMetrics = getAgentMetrics(deptReviews, visibleAgents, departments);
                const topAgent = deptAgentMetrics[0];
                const agent = topAgent ? visibleAgents.find(a => a.id === topAgent.agent_id) : null;
                const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(topAgent?.agent_name || dept.name)}&background=0066cc&color=fff&size=256`;
                
                // Determine border and accent colors based on rank
                const rankColors = [
                  { border: 'border-yellow-400', accent: 'from-yellow-400 to-amber-500', badge: 'bg-yellow-500' },
                  { border: 'border-gray-400', accent: 'from-gray-400 to-gray-500', badge: 'bg-gray-400' },
                  { border: 'border-orange-400', accent: 'from-orange-400 to-orange-600', badge: 'bg-orange-500' }
                ];
                const colors = rankColors[index] || rankColors[0];
                
                return (
                  <div 
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
                  </div>
                );
              })}
              </div>
            </AnimatedPreview>
          }
        >
          <DepartmentPerformanceRankings 
            key={`dept-rankings-${filters.dateRange.label}`}
            reviews={visibleReviews} 
            departments={departments} 
            agents={visibleAgents} 
            limit={10} 
          />
        </CollapsibleSection>
        </div>
      </FadeInSection>

      {/* Problem Feedback Section - Low-rated reviews with comments */}
      <FadeInSection delay={1400} direction="up" duration={500}>
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
              const lowRatings = visibleReviews.filter(r => r.rating <= 2);
              const withComments = lowRatings.filter(r => r.comment && r.comment.trim());
              const mostRecentProblem = withComments.sort((a, b) => 
                new Date(b.review_ts).getTime() - new Date(a.review_ts).getTime()
              )[0];
              
              return (
                <div className="flex flex-col sm:flex-row items-start gap-3 w-full">
                  {/* Stats - Compact version */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-center px-2 py-1.5 bg-red-50 rounded-lg border border-red-200">
                      <div className="font-black text-red-600 text-base leading-none">
                        {lowRatings.length}
                      </div>
                      <div className="text-[10px] text-red-700 font-semibold mt-0.5 whitespace-nowrap">Low Ratings</div>
                    </div>
                    <div className="text-center px-2 py-1.5 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="font-black text-orange-600 text-base leading-none">
                        {withComments.length}
                      </div>
                      <div className="text-[10px] text-orange-700 font-semibold mt-0.5 whitespace-nowrap">w/ Comments</div>
                    </div>
                  </div>
                  
                  {/* Most Recent Issue Snippet */}
                  {mostRecentProblem && (
                    <div className="flex-1 min-w-0 border-l-2 border-red-300 pl-3">
                      <div className="text-[10px] text-gray-500 mb-0.5 flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold uppercase tracking-wide">Latest:</span>
                        <span className="text-red-600 font-bold">
                          {mostRecentProblem.rating}★
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="font-semibold truncate">
                          {agents.find(a => a.id === mostRecentProblem.agent_id)?.display_name || mostRecentProblem.agent_id}
                        </span>
                      </div>
                      <div className="text-xs text-gray-700 italic line-clamp-1 font-medium">
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
      </FadeInSection>

      {/* Detailed Analytics Collapsible Section */}
      <FadeInSection delay={1700} direction="up" duration={500}>
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
                      const count = visibleReviews.filter(r => r.rating === star).length;
                      const total = visibleReviews.length;
                      const percent = total > 0 ? Math.round((count / total) * 100) : 0;
                      return (
                        <div key={star} className="text-center">
                          <div className="text-xl font-black text-gray-900">
                            <AnimatedNumber value={percent} decimals={0} duration={600} suffix="%" />
                          </div>
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
                      const deptReviews = visibleReviews.filter(r => r.department_id === dept.id);
                      const avgRating = deptReviews.length > 0 
                        ? deptReviews.reduce((sum, r) => sum + r.rating, 0) / deptReviews.length 
                        : 0;
                      const color = avgRating >= 4.5 ? 'text-[#00ca6f]' : avgRating >= 4.0 ? 'text-[#0066cc]' : 'text-yellow-600';
                      return (
                        <div key={dept.id} className="text-center flex-1">
                          <div className="text-xs text-gray-600 font-semibold mb-1 truncate">{dept.name}</div>
                          <div className={`text-xl font-black ${color}`}>
                            <AnimatedNumber value={avgRating} decimals={1} duration={600} />
                          </div>
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
                onHideAgent={handleHideAgent}
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
      </FadeInSection>
          </div>
        </div>
      
        {/* Agent Detail - slides in from right */}
        <div 
          className={`fixed inset-0 overflow-hidden transition-transform duration-500 ease-in-out z-50 ${
            selectedAgentId ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {selectedAgentId && (
            <AgentDetailsModal 
              agentId={selectedAgentId}
              onClose={handleBackToDashboard}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
