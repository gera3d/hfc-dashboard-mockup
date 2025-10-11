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
    <div className="relative mb-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 rounded-2xl" />
      <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-blue-100 shadow-2xl overflow-hidden p-6">
        
        {/* Header */}
        <div className="mb-6 pb-4 border-b-2 border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Agent Performance Rankings
              </h2>
              <p className="mt-2 text-[#6B7C93]">
                Top {sortedData.length} agents by review volume • Team average: {teamAvgRating.toFixed(2)}★
              </p>
            </div>
            <div className="flex gap-3">
              <div className="rounded-xl border-2 border-green-200 bg-green-50 px-4 py-2 text-center">
                <div className="text-2xl font-bold text-green-700">
                  {sortedData.filter(a => a.avg_rating >= 4.5).length}
                </div>
                <div className="text-xs font-semibold text-green-600">Star Agents</div>
              </div>
            </div>
          </div>
        </div>

        {/* Champion - #1 Agent Large Showcase */}
        <div className="mb-6">
          <AgentCard 
            agent={topAgent}
            rank={1}
            medal="gold"
            featured={true}
            onClick={() => router.push(`/agent/${topAgent.agent_id}`)}
          />
        </div>

        {/* Runner-ups - #2 and #3 Medium Cards */}
        {runnerUps.length > 0 && (
          <div className="mb-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Runner-ups</h3>
              <p className="text-sm text-gray-500">Silver and bronze performers</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
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
          </div>
        )}

        {/* Rising Stars - #4+ Compact Grid */}
        {risingStars.length > 0 && (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Rising Stars</h3>
              <p className="text-sm text-gray-500">{risingStars.length} top performers</p>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {risingStars.map((agent, idx) => {
                const rank = idx + 4;
                return (
                  <AgentCard
                    key={agent.agent_id}
                    agent={agent}
                    rank={rank}
                    onClick={() => router.push(`/agent/${agent.agent_id}`)}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
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
  onClick: () => void;
}

function AgentCard({ agent, rank, medal, featured = false, runnerUp = false, onClick }: AgentCardProps) {
  const medals = {
    gold: { emoji: '🥇', color: 'from-yellow-400 to-amber-500', border: 'border-yellow-400', ring: 'ring-yellow-400/30', text: 'Gold' },
    silver: { emoji: '🥈', color: 'from-gray-400 to-gray-500', border: 'border-gray-400', ring: 'ring-gray-400/30', text: 'Silver' },
    bronze: { emoji: '🥉', color: 'from-orange-400 to-orange-600', border: 'border-orange-400', ring: 'ring-orange-400/30', text: 'Bronze' }
  };

  const m = medal ? medals[medal] : null;
  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.agent_name)}&background=4F46E5&color=fff&size=256`;

  // Featured Card (for #1)
  if (featured) {
    return (
      <button
        onClick={onClick}
        className={`w-full rounded-xl border-4 ${m?.border || 'border-yellow-400'} bg-gradient-to-br from-yellow-50 via-white to-amber-50 hover:shadow-2xl hover:scale-[1.02] transition-all relative overflow-visible cursor-pointer text-left`}
      >
        {/* Medal Accent Strip */}
        {m && (
          <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${m.color} z-0`} />
        )}
        
        <div className="p-8 pt-10">
          <div className="flex items-start gap-8">
            {/* Large Avatar Section */}
            <div className="relative flex-shrink-0">
              <div className={`h-40 w-40 rounded-full border-6 ${m?.border || 'border-yellow-400'} shadow-2xl bg-white overflow-hidden`}>
                <img
                  src={agent.image_url || fallbackUrl}
                  alt={agent.agent_name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = fallbackUrl;
                  }}
                />
              </div>
              {/* Medal Rank Number */}
              <div className={`absolute -bottom-2 -right-2 h-14 w-14 rounded-full bg-gradient-to-br ${m?.color || 'from-yellow-400 to-amber-500'} flex items-center justify-center text-2xl font-bold text-white shadow-xl border-4 border-white`}>
                {rank}
              </div>
              {/* Trophy Icon */}
              <div className="absolute -top-3 -left-3 text-5xl filter drop-shadow-lg">
                👑
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1 min-w-0">
              <div className="mb-4">
                <div className="text-sm font-semibold uppercase tracking-wide text-yellow-700 mb-1">
                  Top Performer
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{agent.agent_name}</h3>
                <p className="text-lg text-gray-600">{agent.department_name}</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-white rounded-lg p-4 shadow-md border-2 border-yellow-200">
                  <div className="text-sm text-gray-600 mb-1">Reviews</div>
                  <div className="text-2xl font-bold text-indigo-600">{agent.total}</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-md border-2 border-yellow-200">
                  <div className="text-sm text-gray-600 mb-1">Rating</div>
                  <div className="text-2xl font-bold text-amber-500">{agent.avg_rating.toFixed(2)}★</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-md border-2 border-yellow-200">
                  <div className="text-sm text-gray-600 mb-1">5-Star</div>
                  <div className="text-2xl font-bold text-green-600">{agent.percent_5_star.toFixed(0)}%</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-md border-2 border-yellow-200">
                  <div className="text-sm text-gray-600 mb-1">Perfect</div>
                  <div className="text-2xl font-bold text-purple-600">{Math.round((agent.total * agent.percent_5_star) / 100)}</div>
                </div>
              </div>

              {/* Rating Distribution Bar */}
              <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                <div className="text-xs text-gray-600 mb-2 font-semibold">Rating Distribution</div>
                <div className="flex h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-400 to-emerald-600" style={{ width: `${agent.percent_5_star}%` }} title="5 stars" />
                  <div className="bg-gradient-to-r from-lime-400 to-lime-500" style={{ width: `${20}%` }} title="4 stars" />
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-500" style={{ width: `${10}%` }} title="3 stars" />
                  <div className="bg-gradient-to-r from-orange-400 to-orange-600" style={{ width: `${5}%` }} title="2 stars" />
                  <div className="bg-gradient-to-r from-red-400 to-red-600" style={{ width: `${5}%` }} title="1 star" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </button>
    );
  }

  // Runner-up Card (for #2 and #3)
  if (runnerUp) {
    return (
      <button
        onClick={onClick}
        className={`w-full rounded-xl border-3 ${m?.border || 'border-gray-300'} bg-gradient-to-br from-white via-gray-50/30 to-white hover:shadow-xl hover:scale-[1.02] transition-all relative overflow-hidden cursor-pointer text-left`}
      >
        {/* Medal Accent Strip */}
        {m && (
          <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${m.color} z-0`} />
        )}
        
        <div className="p-6 pt-8 relative">
          <div className="flex items-start gap-6">
            {/* 96px avatar with rank badge */}
            <div className="relative flex-shrink-0">
              <div className={`h-24 w-24 rounded-full border-4 ${m?.border || 'border-gray-300'} shadow-xl overflow-hidden bg-white`}>
                <img
                  src={agent.image_url || fallbackUrl}
                  alt={agent.agent_name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className={`absolute -bottom-1 -right-1 h-10 w-10 rounded-full bg-gradient-to-br ${m?.color || 'from-gray-400 to-gray-500'} shadow-lg flex items-center justify-center border-2 border-white`}>
                <span className="text-sm font-bold text-white">{rank}</span>
              </div>
              {medal === 'silver' && (
                <div className="absolute -top-2 -left-2 text-3xl">🥈</div>
              )}
              {medal === 'bronze' && (
                <div className="absolute -top-2 -left-2 text-3xl">🥉</div>
              )}
            </div>

            {/* Stats */}
            <div className="flex-1 min-w-0">
              <div className="text-lg font-bold text-gray-900 truncate mb-1">
                {agent.agent_name}
              </div>
              <div className="text-sm text-gray-600 truncate mb-3">
                {agent.department_name}
              </div>

              {/* Key metrics - 2 column grid */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                  <div className="text-xs text-gray-600 mb-1">Reviews</div>
                  <div className="text-xl font-bold text-indigo-600">{agent.total}</div>
                </div>
                <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                  <div className="text-xs text-gray-600 mb-1">Rating</div>
                  <div className="text-xl font-bold text-amber-600">{agent.avg_rating.toFixed(2)}★</div>
                </div>
              </div>

              {/* Rating distribution bar */}
              <div className="flex h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                <div className="bg-gradient-to-r from-emerald-400 to-emerald-600" style={{ width: `${agent.percent_5_star}%` }} title={`5★: ${agent.percent_5_star.toFixed(0)}%`} />
                <div className="bg-gradient-to-r from-lime-400 to-lime-500" style={{ width: `${20}%` }} title="4★" />
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500" style={{ width: `${10}%` }} title="3★" />
                <div className="bg-gradient-to-r from-orange-400 to-orange-500" style={{ width: `${5}%` }} title="2★" />
                <div className="bg-gradient-to-r from-red-400 to-red-600" style={{ width: `${5}%` }} title="1★" />
              </div>

              {/* 5-star percentage highlight */}
              <div className="mt-2 text-xs text-gray-500">
                <span className="font-semibold text-emerald-600">{agent.percent_5_star.toFixed(0)}%</span> perfect ratings
              </div>
            </div>
          </div>
        </div>
      </button>
    );
  }

  // Compact Card (for rising stars #4+)
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-lg border-2 ${m?.border || 'border-gray-200'} bg-white/50 hover:shadow-lg hover:scale-[1.02] transition-all relative overflow-visible cursor-pointer text-left`}
    >
      {/* Medal Accent Strip */}
      {m && (
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${m.color} z-0`} />
      )}
      
      <div className="flex items-center p-4 pl-28 pr-4 relative min-h-[100px]">
        {/* Oversized Avatar - "bulb" at left edge */}
        <div className={`absolute -left-4 top-1/2 -translate-y-1/2 h-28 w-28 rounded-full border-4 ${m?.border || 'border-gray-300'} shadow-xl bg-white z-10`}>
          <img
            src={agent.image_url || fallbackUrl}
            alt={agent.agent_name}
            className="h-full w-full object-cover rounded-full"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = fallbackUrl;
            }}
          />
          {/* Medal Rank Number */}
          {m ? (
            <div className={`absolute bottom-0 right-0 h-8 w-8 rounded-full bg-gradient-to-br ${m.color} flex items-center justify-center text-sm font-bold text-white shadow-lg border-2 border-white z-20`}>
              {rank}
            </div>
          ) : (
            <div className={`absolute bottom-0 right-0 h-8 w-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-sm font-bold text-white shadow-lg border-2 border-white z-20`}>
              {rank}
            </div>
          )}
        </div>
        
        {/* Info - text content */}
        <div className="flex-1 min-w-0 relative z-20">
          <div className="text-sm font-semibold text-gray-800 truncate">{agent.agent_name}</div>
          <div className="text-xs text-gray-500 truncate mb-2">{agent.department_name}</div>
          
          {/* Highlighted Key Metrics */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-bold text-indigo-600">{agent.total}</span>
            <span className="text-[10px] text-gray-400">reviews</span>
            <span className="text-gray-300">•</span>
            <span className="text-lg font-bold text-amber-500">{agent.avg_rating.toFixed(2)}★</span>
          </div>

          {/* Mini Rating Distribution Bar */}
          <div className="flex h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-400 to-emerald-600" style={{ width: `${agent.percent_5_star}%` }} />
            <div className="bg-gradient-to-r from-lime-400 to-lime-500" style={{ width: `${20}%` }} />
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500" style={{ width: `${10}%` }} />
            <div className="bg-gradient-to-r from-orange-400 to-orange-600" style={{ width: `${5}%` }} />
            <div className="bg-gradient-to-r from-red-400 to-red-600" style={{ width: `${5}%` }} />
          </div>
        </div>
      </div>
    </button>
  );
}
