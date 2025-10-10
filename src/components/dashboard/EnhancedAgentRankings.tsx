"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AgentMetrics } from "@/data/dataService";

interface EnhancedAgentRankingsProps {
  data: AgentMetrics[];
  limit?: number;
}

export default function EnhancedAgentRankings({ data, limit = 10 }: EnhancedAgentRankingsProps) {
  const router = useRouter();
  
  // Sort by total reviews descending
  const sortedData = [...data]
    .filter(agent => agent.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);

  if (sortedData.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-gray-500 dark:text-gray-400">No agent data available</p>
      </div>
    );
  }

  const top3 = sortedData.slice(0, 3);
  const remaining = sortedData.slice(3);

  // Rank styling configs
  const getRankConfig = (index: number) => {
    const configs = [
      { 
        bg: "bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20",
        border: "border-yellow-400 dark:border-yellow-600",
        hoverBorder: "hover:border-yellow-500 dark:hover:border-yellow-500",
        badge: "bg-yellow-500 text-white",
        icon: "👑",
        label: "Top Performer",
        glow: "group-hover:shadow-[0_0_40px_rgba(234,179,8,0.3)]"
      },
      { 
        bg: "bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20",
        border: "border-gray-400 dark:border-gray-600",
        hoverBorder: "hover:border-gray-500 dark:hover:border-gray-500",
        badge: "bg-gray-500 text-white",
        icon: "🥈",
        label: "Excellent",
        glow: "group-hover:shadow-[0_0_40px_rgba(156,163,175,0.3)]"
      },
      { 
        bg: "bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20",
        border: "border-orange-400 dark:border-orange-600",
        hoverBorder: "hover:border-orange-500 dark:hover:border-orange-500",
        badge: "bg-orange-500 text-white",
        icon: "🥉",
        label: "Great",
        glow: "group-hover:shadow-[0_0_40px_rgba(249,115,22,0.3)]"
      }
    ];
    return configs[index] || configs[2];
  };

  const handleAgentClick = (agentId: string) => {
    router.push(`/agent/${agentId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Agent Performance Rankings
          </h2>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Top {sortedData.length} agents by review volume and quality
          </p>
        </div>
        
        {/* Quick Stats */}
        <div className="flex gap-3">
          <div className="rounded-xl border-2 border-green-200 bg-green-50 px-4 py-2 text-center dark:border-green-900 dark:bg-green-900/20">
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">
              {sortedData.filter(a => a.avg_rating >= 4.5).length}
            </div>
            <div className="text-xs font-semibold text-green-600 dark:text-green-500">Star Agents</div>
          </div>
          <div className="rounded-xl border-2 border-blue-200 bg-blue-50 px-4 py-2 text-center dark:border-blue-900 dark:bg-blue-900/20">
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
              {(sortedData.reduce((sum, a) => sum + a.avg_rating, 0) / sortedData.length).toFixed(2)}
            </div>
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-500">Team Average</div>
          </div>
        </div>
      </div>

      {/* Top 3 Podium - Horizontal Layout with Rising Stars sidebar */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* #1 Agent - Takes full left column (50%) */}
        {top3[0] && (() => {
          const agent = top3[0];
          const config = getRankConfig(0);
          const fiveStarCount = Math.round((agent.total * agent.percent_5_star) / 100);
          
          return (
            <div
              key={agent.agent_id}
              onClick={() => handleAgentClick(agent.agent_id)}
              className={`group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border-2 bg-gradient-to-br from-yellow-50 via-white to-orange-50 p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:from-yellow-900/10 dark:via-gray-800 dark:to-orange-900/10 ${config.border} ${config.hoverBorder} ${config.glow}`}
            >
              {/* Background decoration */}
              <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-yellow-400/10 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-orange-400/10 blur-3xl" />

              {/* Header with Rank */}
              <div className="relative z-10 mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-5xl">{config.icon}</div>
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-wide text-yellow-700 dark:text-yellow-400">
                      Top Performer
                    </div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      #1 Champion
                    </div>
                  </div>
                </div>
              </div>

              {/* Avatar and Name Section */}
              <div className="relative z-10 mb-8 text-center">
                <div className="relative mb-5 inline-block">
                  <div className="group/avatar relative h-36 w-36 overflow-visible rounded-full transition-all duration-300 group-hover:scale-[1.6]">
                    <div className="relative h-full w-full overflow-hidden rounded-full border-4 border-yellow-400 shadow-xl transition-all duration-300 group-hover:border-8 group-hover:shadow-[0_0_60px_rgba(234,179,8,0.6)] dark:border-yellow-500">
                      <Image
                        src={agent.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.agent_name)}&background=F59E0B&color=fff&size=512`}
                        alt={agent.agent_name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.agent_name)}&background=F59E0B&color=fff&size=512`;
                        }}
                      />
                    </div>
                  </div>
                  {/* Rank badge */}
                  <div className="absolute -right-2 -top-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg ring-4 ring-white dark:ring-gray-800">
                    <span className="text-xl font-bold text-white">1</span>
                  </div>
                </div>

                <h2 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {agent.agent_name}
                </h2>
                <p className="mb-4 text-base text-gray-600 dark:text-gray-400">
                  {agent.department_name}
                </p>
                
                {/* Gold Champion Badge */}
                <span className={`inline-block rounded-full px-6 py-2.5 text-base font-semibold shadow-md transition-all duration-300 group-hover:scale-105 ${config.badge}`}>
                  {config.label}
                </span>
              </div>

              {/* Stats Grid */}
              <div className="relative z-10 grid flex-1 grid-cols-2 gap-5">
                {/* Rating */}
                <div className="flex flex-col justify-center rounded-xl bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-gray-800">
                  <div className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Rating
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">
                      {agent.avg_rating.toFixed(2)}
                    </span>
                    <span className="text-2xl">⭐</span>
                  </div>
                </div>

                {/* Reviews */}
                <div className="flex flex-col justify-center rounded-xl bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-gray-800">
                  <div className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Reviews
                  </div>
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                    {agent.total.toLocaleString()}
                  </div>
                </div>

                {/* 5-Star Rate */}
                <div className="flex flex-col justify-center rounded-xl bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-gray-800">
                  <div className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    5-Star Rate
                  </div>
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                    {agent.percent_5_star.toFixed(1)}%
                  </div>
                </div>

                {/* Perfect Scores */}
                <div className="flex flex-col justify-center rounded-xl bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-gray-800">
                  <div className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Perfect Scores
                  </div>
                  <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                    {fiveStarCount.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Right Column: #2, #3, and Rising Stars */}
        <div className="flex flex-col gap-4">
          {/* #2 and #3 - Top part of right column */}
          {top3.slice(1, 3).map((agent, index) => {
            const config = getRankConfig(index + 1);
            const rank = index + 2;
            
            return (
              <div
                key={agent.agent_id}
                onClick={() => handleAgentClick(agent.agent_id)}
                className={`group relative flex cursor-pointer items-center gap-6 overflow-hidden rounded-2xl border-2 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${config.border} ${config.hoverBorder} ${config.bg} ${config.glow}`}
              >
                {/* Animated Background Gradient on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-white/0 dark:via-white/0 dark:to-white/10" />
                
                {/* Rank Badge */}
                <div className="absolute -right-2 -top-2 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg transition-all duration-300 group-hover:scale-110 dark:bg-gray-800">
                  <span className="text-2xl font-bold text-gray-700 dark:text-gray-300">{rank}</span>
                </div>

                {/* Icon */}
                <div className="text-4xl transition-all duration-300 group-hover:scale-110">
                  {config.icon}
                </div>

                {/* Avatar - OVERSIZED on hover */}
                <div className="relative z-20 flex-shrink-0">
                  <div className="group/avatar relative h-20 w-20 overflow-visible rounded-full transition-all duration-300 group-hover:scale-[2.5] group-hover:z-50">
                    <div className="relative h-full w-full overflow-hidden rounded-full border-4 border-white shadow-xl transition-all duration-300 group-hover:border-8 group-hover:shadow-[0_0_60px_rgba(156,163,175,0.8)] dark:border-gray-700 dark:group-hover:border-blue-400">
                      <Image
                        src={agent.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.agent_name)}&background=4F46E5&color=fff&size=512`}
                        alt={agent.agent_name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.agent_name)}&background=4F46E5&color=fff&size=512`;
                        }}
                      />
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity duration-200 group-hover/avatar:opacity-100">
                        <span className="text-xs font-bold text-white">View</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Agent Info */}
                <div className="relative z-10 flex-1 min-w-0">
                  <h3 className="mb-1 text-xl font-bold text-gray-800 truncate dark:text-white/90">
                    {agent.agent_name}
                  </h3>
                  <p className="mb-2 text-sm text-gray-600 truncate dark:text-gray-400">
                    {agent.department_name}
                  </p>
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold transition-all duration-300 group-hover:scale-105 ${config.badge}`}>
                    {config.label}
                  </span>
                </div>

                {/* Stats */}
                <div className="relative z-10 flex flex-col gap-2 text-right">
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-bold text-gray-800 dark:text-white/90">
                      {agent.avg_rating.toFixed(2)}
                    </span>
                    <span className="text-lg">⭐</span>
                  </div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {agent.total.toLocaleString()} reviews
                  </div>
                  <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                    {agent.percent_5_star.toFixed(0)}% 5★
                  </div>
                </div>
              </div>
            );
          })}

          {/* Rising Stars - Compact sidebar below #2 and #3 */}
          {remaining.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white/50 p-4 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
              <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-gray-800 dark:text-white/90">
                <span className="text-lg">⭐</span>
                Rising Stars
              </h3>
              <div className="space-y-2">
                {remaining.map((agent, index) => {
                  const rank = index + 4;
                  return (
                    <div
                      key={agent.agent_id}
                      onClick={() => handleAgentClick(agent.agent_id)}
                      className="group/compact relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-lg border border-gray-200 bg-white p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-lg dark:border-white/10 dark:bg-white/5 dark:hover:border-blue-500"
                    >
                      {/* Rank */}
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-bold text-white shadow transition-all duration-300 group-hover/compact:scale-110">
                        {rank}
                      </div>

                      {/* Avatar - Compact but grows HUGE on hover */}
                      <div className="relative z-20 h-10 w-10 flex-shrink-0 overflow-visible rounded-full transition-all duration-300 group-hover/compact:scale-[3.5]">
                        <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-gray-200 shadow-md transition-all duration-300 group-hover/compact:border-4 group-hover/compact:border-blue-400 group-hover/compact:shadow-[0_0_40px_rgba(59,130,246,0.6)] dark:border-gray-700 dark:group-hover/compact:border-blue-500">
                          <Image
                            src={agent.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.agent_name)}&background=4F46E5&color=fff&size=512`}
                            alt={agent.agent_name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover/compact:scale-110"
                            onError={(e) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.agent_name)}&background=4F46E5&color=fff&size=512`;
                            }}
                          />
                        </div>
                      </div>

                      {/* Compact Info */}
                      <div className="relative z-10 min-w-0 flex-1">
                        <h4 className="truncate text-sm font-semibold text-gray-800 transition-colors duration-300 group-hover/compact:text-blue-700 dark:text-white/90 dark:group-hover/compact:text-blue-400">
                          {agent.agent_name}
                        </h4>
                        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                          {agent.department_name}
                        </p>
                      </div>

                      {/* Critical Stats Only */}
                      <div className="relative z-10 flex items-center gap-2 text-right">
                        <div className="flex items-center gap-0.5">
                          <span className="text-sm font-bold text-gray-800 dark:text-white/90">
                            {agent.avg_rating.toFixed(2)}
                          </span>
                          <span className="text-sm">⭐</span>
                        </div>
                        <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                          {agent.total.toLocaleString()}
                        </span>
                      </div>

                      {/* Hidden expanded details on hover */}
                      <div className="absolute inset-x-0 bottom-0 max-h-0 overflow-hidden bg-gradient-to-t from-blue-50 to-transparent opacity-0 transition-all duration-300 group-hover/compact:max-h-10 group-hover/compact:opacity-100 dark:from-blue-900/20">
                        <div className="p-2 text-center">
                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                            {agent.percent_5_star.toFixed(0)}% 5-Star Rate
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
