'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AgentMetrics } from '@/data/dataService';

interface UnifiedAgentRankingsProps {
  data: AgentMetrics[];
  limit?: number;
}

export default function UnifiedAgentRankings({ data, limit = 10 }: UnifiedAgentRankingsProps) {
  const router = useRouter();
  
  // Sort by total reviews descending and filter out agents with no reviews
  const sortedData = useMemo(() => {
    return [...data]
      .filter(agent => agent.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, limit);
  }, [data, limit]);

  if (sortedData.length === 0) {
    return (
      <div className="relative mb-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 rounded-2xl" />
        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-blue-100 shadow-2xl p-12 text-center">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-2xl font-bold text-[#0A2540] mb-3">No Agent Data</h3>
          <p className="text-[#6B7C93]">No agents have reviews in the selected date range.</p>
        </div>
      </div>
    );
  }

  const topAgent = sortedData[0];
  const runnerUps = sortedData.slice(1, 3); // #2 and #3
  const risingStars = sortedData.slice(3); // #4+
  const teamAvgRating = sortedData.reduce((sum, a) => sum + a.avg_rating, 0) / sortedData.length;

  return (
    <div className="space-y-6">
      {/* Top 3 Podium Layout - ALL HORIZONTAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {/* #1 */}
        <AgentCard 
          agent={topAgent}
          rank={1}
          medal="gold"
          featured={true}
          onClick={() => router.push(`/agent/${topAgent.agent_id}`)}
        />
        
        {/* #2 and #3 - Now horizontal alongside #1 */}
        {runnerUps.map((agent, idx) => {
          const rank = idx + 2;
          const medal = idx === 0 ? 'silver' : 'bronze';
          return (
            <AgentCard
              key={agent.agent_id}
              agent={agent}
              rank={rank}
              medal={medal}
              runnerUp={true}
              onClick={() => router.push(`/agent/${agent.agent_id}`)}
            />
          );
        })}
      </div>

      {/* Rising Stars - #4+ Compact Grid */}
      {risingStars.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Rising Stars</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{risingStars.length} more top performers</p>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Team Avg: <span className="font-semibold text-gray-700 dark:text-gray-300">{teamAvgRating.toFixed(2)}★</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {risingStars.map((agent, idx) => {
              const rank = idx + 4;
              return (
                <AgentCard
                  key={agent.agent_id}
                  agent={agent}
                  rank={rank}
                  compact={true}
                  onClick={() => router.push(`/agent/${agent.agent_id}`)}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Agent Card Component
interface AgentCardProps {
  agent: AgentMetrics;
  rank: number;
  medal?: 'gold' | 'silver' | 'bronze';
  featured?: boolean;
  runnerUp?: boolean;
  compact?: boolean;
  onClick: () => void;
}

function AgentCard({ agent, rank, medal, featured = false, runnerUp = false, compact = false, onClick }: AgentCardProps) {
  const medals = {
    gold: { emoji: '🥇', color: 'from-yellow-400 to-amber-500', border: 'border-yellow-400', ring: 'ring-yellow-400/30', text: 'Gold' },
    silver: { emoji: '🥈', color: 'from-gray-400 to-gray-500', border: 'border-gray-400', ring: 'ring-gray-400/30', text: 'Silver' },
    bronze: { emoji: '🥉', color: 'from-orange-400 to-orange-600', border: 'border-orange-400', ring: 'ring-orange-400/30', text: 'Bronze' }
  };

  const m = medal ? medals[medal] : null;
  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.agent_name)}&background=4F46E5&color=fff&size=256`;

  // Featured Card (for #1) - Clean design with popping avatar
  if (featured) {
    return (
      <div className="relative pt-20 pb-4">
        <button
          onClick={onClick}
          className="w-full rounded-2xl border-2 border-gray-200 bg-white hover:shadow-xl transition-all cursor-pointer text-left p-5 relative z-0 overflow-visible h-full"
        >
          {/* Gold top bar - positioned to show behind avatar */}
          <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-t-2xl z-0" />
          
          {/* Content with higher z-index */}
          <div className="relative z-10">
            {/* Name and Department with Crown */}
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                👑 {agent.agent_name}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">{agent.department_name}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center">
                <div className="text-[10px] text-gray-600 mb-1 font-medium">Reviews</div>
                <div className="text-lg font-bold text-indigo-600">{agent.total}</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-gray-600 mb-1 font-medium">Rating</div>
                <div className="text-lg font-bold text-indigo-600">{agent.avg_rating.toFixed(2)}★</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-gray-600 mb-1 font-medium">5-Star</div>
                <div className="text-lg font-bold text-indigo-600">{agent.percent_5_star.toFixed(0)}%</div>
              </div>
            </div>
            
            {/* Rating Distribution */}
            <div>
              <div className="text-[10px] text-gray-600 mb-1.5 font-semibold">Rating Distribution</div>
              <div className="flex h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="bg-emerald-500" style={{ width: `${agent.percent_5_star}%` }} />
                <div className="bg-lime-400" style={{ width: `${20}%` }} />
                <div className="bg-yellow-400" style={{ width: `${10}%` }} />
                <div className="bg-orange-400" style={{ width: `${5}%` }} />
                <div className="bg-red-400" style={{ width: `${5}%` }} />
              </div>
            </div>
          </div>
        </button>
        
        {/* Popping avatar at top center */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
          <div className="relative">
            <div className="h-24 w-24 rounded-full border-3 border-white shadow-xl bg-gray-100 overflow-hidden">
              <img
                src={agent.image_url || fallbackUrl}
                alt={agent.agent_name}
                className="h-full w-full object-cover"
                style={{ objectPosition: 'center 25%' }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = fallbackUrl;
                }}
              />
            </div>
            {/* Rank badge */}
            <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center text-base font-bold text-white border-3 border-white shadow-lg">
              1
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Runner-up Card (for #2 and #3) - Scaled down version
  if (runnerUp) {
    const accentColor = medal === 'silver' ? 'from-gray-400 to-gray-500' : 'from-orange-400 to-orange-500';
    const badgeBg = medal === 'silver' ? 'bg-gray-400' : 'bg-orange-500';
    const medalEmoji = medal === 'silver' ? '🥈' : '🥉';
    
    return (
      <div className="relative pt-20 pb-4">
        <button
          onClick={onClick}
          className="w-full rounded-xl border-2 border-gray-200 bg-white hover:shadow-lg transition-all cursor-pointer text-left p-5 relative z-0 overflow-visible h-full"
        >
          {/* Medal top bar - positioned behind avatar */}
          <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${accentColor} rounded-t-xl z-0`} />
          
          {/* Content with higher z-index */}
          <div className="relative z-10">
            {/* Name and Department with Medal */}
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {medalEmoji} {agent.agent_name}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">{agent.department_name}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center">
                <div className="text-[10px] text-gray-600 mb-1 font-medium">Reviews</div>
                <div className="text-lg font-bold text-indigo-600">{agent.total}</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-gray-600 mb-1 font-medium">Rating</div>
                <div className="text-lg font-bold text-indigo-600">{agent.avg_rating.toFixed(2)}★</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-gray-600 mb-1 font-medium">5-Star</div>
                <div className="text-lg font-bold text-indigo-600">{agent.percent_5_star.toFixed(0)}%</div>
              </div>
            </div>
            
            {/* Rating Distribution */}
            <div>
              <div className="text-[10px] text-gray-600 mb-1.5 font-semibold">Rating Distribution</div>
              <div className="flex h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="bg-emerald-500" style={{ width: `${agent.percent_5_star}%` }} />
                <div className="bg-lime-400" style={{ width: `${20}%` }} />
                <div className="bg-yellow-400" style={{ width: `${10}%` }} />
                <div className="bg-orange-400" style={{ width: `${5}%` }} />
                <div className="bg-red-400" style={{ width: `${5}%` }} />
              </div>
            </div>
          </div>
        </button>
        
        {/* Popping avatar at top center */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
          <div className="relative">
            <div className="h-24 w-24 rounded-full border-3 border-white shadow-xl bg-gray-100 overflow-hidden">
              <img
                src={agent.image_url || fallbackUrl}
                alt={agent.agent_name}
                className="h-full w-full object-cover"
                style={{ objectPosition: 'center 25%' }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = fallbackUrl;
                }}
              />
            </div>
            {/* Rank badge */}
            <div className={`absolute -bottom-1 -right-1 h-8 w-8 rounded-full ${badgeBg} flex items-center justify-center text-base font-bold text-white border-3 border-white shadow-lg`}>
              {rank}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Compact Card (for rising stars #4+) - Face-focused design with better alignment
  return (
    <div className="w-full">
      <button
        onClick={onClick}
        className="w-full rounded-lg border border-gray-200 bg-white hover:shadow-lg transition-all cursor-pointer text-left overflow-hidden"
      >
        {/* Colorful top bar */}
        <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        
        {/* Avatar section - larger, centered */}
        <div className="p-4 pb-3">
          <div className="flex justify-center mb-3">
            <div className="relative">
              <div className="h-20 w-20 rounded-full border-2 border-gray-200 bg-white overflow-hidden shadow-md">
                <img
                  src={agent.image_url || fallbackUrl}
                  alt={agent.agent_name}
                  className="h-full w-full object-cover object-[center_20%]"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = fallbackUrl;
                  }}
                />
              </div>
              {/* Rank badge only - removed blue dot */}
              <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-indigo-600 flex items-center justify-center border-2 border-white shadow-md">
                <span className="text-xs font-bold text-white">{rank}</span>
              </div>
            </div>
          </div>
          
          {/* Name and Department - centered */}
          <div className="text-center mb-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight mb-1">{agent.agent_name}</h4>
            <p className="text-[10px] text-gray-600 dark:text-gray-400 leading-tight">{agent.department_name}</p>
          </div>

          {/* Stats Grid - properly aligned */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center">
              <div className="text-[9px] text-gray-600 dark:text-gray-400 uppercase mb-1 font-medium">Reviews</div>
              <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{agent.total}</div>
            </div>
            <div className="text-center">
              <div className="text-[9px] text-gray-600 dark:text-gray-400 uppercase mb-1 font-medium">Rating</div>
              <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{agent.avg_rating.toFixed(2)}★</div>
            </div>
            <div className="text-center">
              <div className="text-[9px] text-gray-600 dark:text-gray-400 uppercase mb-1 font-medium">5-Star</div>
              <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{agent.percent_5_star.toFixed(0)}%</div>
            </div>
          </div>
          
          {/* Rating Distribution - aligned */}
          <div className="flex h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="bg-emerald-500" style={{ width: `${agent.percent_5_star}%` }} />
            <div className="bg-lime-400" style={{ width: `${20}%` }} />
            <div className="bg-yellow-400" style={{ width: `${10}%` }} />
            <div className="bg-orange-400" style={{ width: `${5}%` }} />
            <div className="bg-red-400" style={{ width: `${5}%` }} />
          </div>
        </div>
      </button>
    </div>
  );
}
