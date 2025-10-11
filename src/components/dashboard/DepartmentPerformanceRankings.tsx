'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Review, Department, Agent } from '@/data/dataService';

interface DepartmentPerformanceRankingsProps {
  reviews: Review[];
  departments: Department[];
  agents: Agent[];
  limit?: number;
}

export default function DepartmentPerformanceRankings({ 
  reviews, 
  departments,
  agents,
  limit = 10 
}: DepartmentPerformanceRankingsProps) {
  
  // Track which agent is expanded
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  
  // Track which departments are collapsed
  const [collapsedDepartments, setCollapsedDepartments] = useState<Set<string>>(new Set());
  
  // Toggle department collapse
  const toggleDepartment = (deptId: string) => {
    setCollapsedDepartments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(deptId)) {
        newSet.delete(deptId);
      } else {
        newSet.add(deptId);
      }
      return newSet;
    });
  };
  
  // Process department metrics
  const departmentData = useMemo(() => {
    return departments
      .map((dept) => {
        const deptReviews = reviews.filter((r) => r.department_id === dept.id);
        const deptAgents = agents.filter((a) => a.department_id === dept.id);
        
        // Calculate stats for each agent
        const agentsWithStats = deptAgents.map((agent) => {
          const agentReviews = reviews.filter((r) => r.agent_id === agent.id);
          const agentTotal = agentReviews.length;
          const agentFiveStars = agentReviews.filter((r) => r.rating === 5).length;
          const agentProblems = agentReviews.filter((r) => r.rating <= 3).length;
          const agentAvgRating = agentTotal > 0
            ? agentReviews.reduce((sum, r) => sum + r.rating, 0) / agentTotal
            : 0;
          
          return {
            ...agent,
            totalReviews: agentTotal,
            fiveStarCount: agentFiveStars,
            problemCount: agentProblems,
            avgRating: agentAvgRating
          };
        })
        .filter(agent => agent.totalReviews > 0) // Only include agents with reviews
        .sort((a, b) => b.totalReviews - a.totalReviews);
        
        const totalReviews = deptReviews.length;
        const fiveStarReviews = deptReviews.filter((r) => r.rating === 5).length;
        const fourStarReviews = deptReviews.filter((r) => r.rating === 4).length;
        const problemReviews = deptReviews.filter((r) => r.rating <= 3).length;
        
        const avgRating = totalReviews > 0
          ? deptReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
          : 0;
        
        const fiveStarRate = totalReviews > 0 
          ? (fiveStarReviews / totalReviews) * 100 
          : 0;
        
        const customerSatisfaction = totalReviews > 0
          ? ((fiveStarReviews + fourStarReviews) / totalReviews) * 100
          : 0;

        return {
          name: dept.name,
          reviews: totalReviews,
          rating: avgRating,
          percent_5_star: fiveStarRate,
          customer_satisfaction: customerSatisfaction,
          problem_reviews: problemReviews,
          agents: agentsWithStats,
          agentCount: agentsWithStats.length
        };
      })
      .filter(dept => dept.reviews > 0)
      .sort((a, b) => b.reviews - a.reviews)
      .slice(0, limit);
  }, [reviews, departments, agents, limit]);

  const teamAvgRating = departmentData.length > 0 
    ? departmentData.reduce((sum, d) => sum + d.rating, 0) / departmentData.length 
    : 0;

  const getBadges = (dept: typeof departmentData[0], rank: number) => {
    const badges: Array<{ icon: string; label: string; color: string }> = [];
    
    if (rank === 0) badges.push({ icon: '👑', label: 'Top Department', color: 'bg-gradient-to-r from-yellow-400 to-yellow-600' });
    if (dept.rating >= 4.9) badges.push({ icon: '⭐', label: 'Quality Leader', color: 'bg-gradient-to-r from-green-400 to-green-600' });
    else if (dept.rating >= 4.5) badges.push({ icon: '✨', label: 'Excellent', color: 'bg-gradient-to-r from-blue-400 to-blue-600' });
    if (dept.reviews >= 100) badges.push({ icon: '🏆', label: 'Volume Leader', color: 'bg-gradient-to-r from-purple-400 to-purple-600' });
    if (dept.percent_5_star >= 90) badges.push({ icon: '💎', label: 'Customer Favorite', color: 'bg-gradient-to-r from-cyan-400 to-cyan-600' });
    
    return badges;
  };

  const getTrendIndicator = (dept: typeof departmentData[0]) => {
    const delta = dept.rating - teamAvgRating;
    if (delta > 0.2) return { icon: '📈', text: `+${delta.toFixed(1)} vs avg`, color: 'text-green-600', bg: 'bg-green-50' };
    if (delta < -0.2) return { icon: '📉', text: `${delta.toFixed(1)} vs avg`, color: 'text-red-600', bg: 'bg-red-50' };
    return { icon: '➡️', text: 'On target', color: 'text-blue-600', bg: 'bg-blue-50' };
  };

  if (departmentData.length === 0) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl border-2 border-blue-100 p-12 mb-8">
        <div className="text-center max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-[#0A2540] mb-3">No Department Data</h3>
          <p className="text-[#6B7C93]">No departments have reviews in the selected date range.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mb-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 rounded-2xl" />
      <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-blue-100 shadow-2xl overflow-hidden p-6">
        
        {/* Header */}
        <div className="mb-6 pb-4 border-b-2 border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Department Performance Rankings
              </h2>
              <p className="mt-2 text-[#6B7C93]">
                Showing top {departmentData.length} departments • Team average: {teamAvgRating.toFixed(2)}★
              </p>
            </div>
          </div>
        </div>

        {/* Department List */}
        <div className="space-y-6">
          {departmentData.map((dept, rank) => {
            const badges = getBadges(dept, rank);
            const trend = getTrendIndicator(dept);
            
            return (
              <div key={dept.name} className="bg-white rounded-xl border-2 border-gray-100 shadow-lg overflow-hidden transition-all">
                {/* Department Header */}
                <div className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg shadow-lg">
                      {rank + 1}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{dept.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>👥 {dept.agentCount} agents</span>
                        <span>📝 {dept.reviews} reviews</span>
                        <span>⭐ {dept.percent_5_star.toFixed(1)}% 5-star</span>
                        <span>😊 {dept.customer_satisfaction.toFixed(1)}% satisfied</span>
                        <span>⚠️ {dept.problem_reviews} issues</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className={`${trend.bg} ${trend.color} px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5`}>
                      <span>{trend.icon}</span>
                      <span>{trend.text}</span>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-3xl font-bold text-gray-900">
                        {dept.rating.toFixed(2)}
                        <span className="text-lg text-yellow-400">★</span>
                      </div>
                      <div className="text-xs text-gray-500">Avg Rating</div>
                    </div>
                    {/* Collapse/Expand Button */}
                    <button
                      onClick={() => toggleDepartment(dept.name)}
                      className="ml-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      aria-label={collapsedDepartments.has(dept.name) ? "Expand department" : "Collapse department"}
                    >
                      <svg 
                        className={`w-6 h-6 text-gray-600 transition-transform duration-300 ${collapsedDepartments.has(dept.name) ? '' : 'rotate-180'}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* All Agents - Horizontal Grid (Collapsible) */}
                {!collapsedDepartments.has(dept.name) && dept.agents.length > 0 && (
                  <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                    <div className="grid grid-cols-4 gap-4">
                      {dept.agents.map((agent, idx) => {
                        const medal = idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : undefined;
                        return (
                          <AgentCard 
                            key={agent.id}
                            agent={agent} 
                            deptName={dept.name} 
                            medal={medal}
                            reviews={reviews}
                            expandedAgent={expandedAgent} 
                            setExpandedAgent={setExpandedAgent} 
                            compact 
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Agent Card Component
function AgentCard({ agent, deptName, medal, compact, simple, reviews, expandedAgent, setExpandedAgent }: any) {
  const router = useRouter();
  const agentKey = `${deptName}-${agent.id}`;
  const isExpanded = expandedAgent === agentKey;

  const medals = {
    gold: { emoji: '🥇', color: 'from-yellow-400 to-amber-500', border: 'border-yellow-400', ring: 'ring-yellow-400/30', text: 'Gold' },
    silver: { emoji: '🥈', color: 'from-gray-400 to-gray-500', border: 'border-gray-400', ring: 'ring-gray-400/30', text: 'Silver' },
    bronze: { emoji: '🥉', color: 'from-orange-400 to-orange-600', border: 'border-orange-400', ring: 'ring-orange-400/30', text: 'Bronze' }
  };

  const m = medal ? medals[medal as keyof typeof medals] : null;

  if (simple) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white/50 p-2">
        <div className="flex items-center gap-2">
          <img
            src={agent.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.display_name)}&background=4F46E5&color=fff&size=128`}
            alt={agent.display_name}
            className="h-8 w-8 rounded-full border-2 border-gray-200"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.display_name)}&background=4F46E5&color=fff&size=128`;
            }}
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-gray-800 truncate">{agent.display_name}</div>
            <div className="text-[10px] text-gray-500">{agent.totalReviews} reviews • {agent.avgRating.toFixed(2)}★</div>
          </div>
        </div>
      </div>
    );
  }

  if (compact) {
    // Calculate rating distribution percentages
    const agentReviews = reviews.filter((r: Review) => r.agent_id === agent.id);
    const ratingCounts = {
      five: agentReviews.filter((r: Review) => r.rating === 5).length,
      four: agentReviews.filter((r: Review) => r.rating === 4).length,
      three: agentReviews.filter((r: Review) => r.rating === 3).length,
      two: agentReviews.filter((r: Review) => r.rating === 2).length,
      one: agentReviews.filter((r: Review) => r.rating === 1).length,
    };
    
    const total = agent.totalReviews;
    const percentages = {
      five: total > 0 ? (ratingCounts.five / total) * 100 : 0,
      four: total > 0 ? (ratingCounts.four / total) * 100 : 0,
      three: total > 0 ? (ratingCounts.three / total) * 100 : 0,
      two: total > 0 ? (ratingCounts.two / total) * 100 : 0,
      one: total > 0 ? (ratingCounts.one / total) * 100 : 0,
    };
    
    return (
      <button
        onClick={() => router.push(`/agent/${agent.id}`)}
        className={`w-full rounded-lg border-2 ${m?.border || 'border-gray-200'} bg-white/50 hover:shadow-lg hover:scale-[1.02] transition-all relative overflow-visible cursor-pointer text-left`}
      >
        {/* Medal Accent Strip */}
        {m && (
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${m.color} z-0`} />
        )}
        
        <div className="flex items-center p-4 pl-28 pr-4 relative min-h-[100px]">
          {/* Extra Large Avatar - dramatic "bulb" that overlaps borders */}
          <div className={`absolute -left-4 top-1/2 -translate-y-1/2 h-28 w-28 rounded-full border-4 ${m?.border || 'border-gray-300'} shadow-xl bg-white z-10`}>
            <img
              src={agent.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.display_name)}&background=4F46E5&color=fff&size=256`}
              alt={agent.display_name}
              className="h-full w-full object-cover rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.display_name)}&background=4F46E5&color=fff&size=256`;
              }}
            />
            {/* Medal Rank Number */}
            {m && (
              <div className={`absolute bottom-0 right-0 h-8 w-8 rounded-full bg-gradient-to-br ${m.color} flex items-center justify-center text-sm font-bold text-white shadow-lg border-2 border-white z-20`}>
                {medal === 'gold' ? '1' : medal === 'silver' ? '2' : '3'}
              </div>
            )}
          </div>
          
          {/* Info - text content with generous spacing */}
          <div className="flex-1 min-w-0 relative z-20">
            <div className="text-xs font-semibold text-gray-800 truncate">{agent.display_name}</div>
            {/* Highlighted Key Metrics */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-sm font-bold text-indigo-600">{agent.totalReviews}</span>
              <span className="text-[9px] text-gray-400">reviews</span>
              <span className="text-gray-300">•</span>
              <span className="text-sm font-bold text-amber-500">{agent.avgRating.toFixed(2)}★</span>
            </div>
            
            {/* Rating Distribution Bar */}
            {total > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden flex">
                  {/* 5 Star - Green */}
                  {percentages.five > 0 && (
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500"
                      style={{ width: `${percentages.five}%` }}
                      title={`${ratingCounts.five} five-star (${percentages.five.toFixed(0)}%)`}
                    />
                  )}
                  {/* 4 Star - Light Green */}
                  {percentages.four > 0 && (
                    <div 
                      className="h-full bg-gradient-to-r from-lime-400 to-lime-500 transition-all duration-500"
                      style={{ width: `${percentages.four}%` }}
                      title={`${ratingCounts.four} four-star (${percentages.four.toFixed(0)}%)`}
                    />
                  )}
                  {/* 3 Star - Yellow */}
                  {percentages.three > 0 && (
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-500"
                      style={{ width: `${percentages.three}%` }}
                      title={`${ratingCounts.three} three-star (${percentages.three.toFixed(0)}%)`}
                    />
                  )}
                  {/* 2 Star - Orange */}
                  {percentages.two > 0 && (
                    <div 
                      className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-500"
                      style={{ width: `${percentages.two}%` }}
                      title={`${ratingCounts.two} two-star (${percentages.two.toFixed(0)}%)`}
                    />
                  )}
                  {/* 1 Star - Red */}
                  {percentages.one > 0 && (
                    <div 
                      className="h-full bg-gradient-to-r from-red-400 to-red-600 transition-all duration-500"
                      style={{ width: `${percentages.one}%` }}
                      title={`${ratingCounts.one} one-star (${percentages.one.toFixed(0)}%)`}
                    />
                  )}
                </div>
                {/* Problem count indicator */}
                {agent.problemCount > 0 && (
                  <span className="text-[9px] font-semibold text-red-600 flex-shrink-0">
                    {agent.problemCount}⚠️
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className={`rounded-xl border-2 ${m?.border || 'border-gray-200'} bg-white/50`}>
      <button
        onClick={() => setExpandedAgent(isExpanded ? null : agentKey)}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-left"
      >
        <div className={`relative flex-shrink-0 rounded-full shadow-sm border-3 ${m?.border || 'border-gray-200'} ${m ? `ring-2 ${m.ring}` : ''} ${isExpanded ? 'h-16 w-16' : 'h-12 w-12'} transition-all duration-500`}>
          <img
            src={agent.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.display_name)}&background=4F46E5&color=fff&size=256`}
            alt={agent.display_name}
            className="h-full w-full object-cover rounded-full"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.display_name)}&background=4F46E5&color=fff&size=256`;
            }}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className={`truncate font-semibold ${isExpanded ? 'text-base text-blue-700' : 'text-sm text-gray-800'} transition-all`}>
              {agent.display_name}
            </div>
            {m && (
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full bg-gradient-to-r ${m.color} text-white shadow-md whitespace-nowrap`}>
                {m.emoji} {m.text}
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500">
            {agent.totalReviews} reviews • {agent.avgRating.toFixed(2)}★
          </div>
        </div>

        <div className={`flex items-center gap-2 ${isExpanded ? 'text-blue-600' : 'text-gray-400'}`}>
          {!isExpanded && <span className="text-xs font-semibold animate-pulse">View Details</span>}
          <svg className={`w-5 h-5 transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
    </div>
  );
}
