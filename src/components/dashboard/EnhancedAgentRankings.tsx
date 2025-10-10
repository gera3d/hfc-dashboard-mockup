"use client";
import Image from "next/image";
import { AgentMetrics } from "@/data/dataService";

interface EnhancedAgentRankingsProps {
  data: AgentMetrics[];
  limit?: number;
}

export default function EnhancedAgentRankings({ data, limit = 10 }: EnhancedAgentRankingsProps) {
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
        badge: "bg-yellow-500 text-white",
        icon: "👑",
        label: "Top Performer"
      },
      { 
        bg: "bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20",
        border: "border-gray-400 dark:border-gray-600",
        badge: "bg-gray-500 text-white",
        icon: "🥈",
        label: "Excellent"
      },
      { 
        bg: "bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20",
        border: "border-orange-400 dark:border-orange-600",
        badge: "bg-orange-500 text-white",
        icon: "🥉",
        label: "Great"
      }
    ];
    return configs[index] || configs[2];
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

      {/* Top 3 Podium */}
      <div className="grid gap-4 md:grid-cols-3">
        {top3.map((agent, index) => {
          const config = getRankConfig(index);
          return (
            <div
              key={agent.agent_id}
              className={`group relative overflow-hidden rounded-2xl border-2 p-6 transition-all hover:scale-[1.02] hover:shadow-xl ${config.border} ${config.bg}`}
            >
              {/* Rank Badge */}
              <div className="absolute -right-2 -top-2 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg dark:bg-gray-800">
                <span className="text-2xl font-bold text-gray-700 dark:text-gray-300">{index + 1}</span>
              </div>

              {/* Icon */}
              <div className="mb-3 text-center text-4xl">{config.icon}</div>

              {/* Avatar */}
              <div className="mb-4 flex justify-center">
                <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-white shadow-lg dark:border-gray-700">
                  <Image
                    src={agent.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.agent_name)}&background=4F46E5&color=fff&size=256`}
                    alt={agent.agent_name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.agent_name)}&background=4F46E5&color=fff&size=256`;
                    }}
                  />
                </div>
              </div>

              {/* Agent Info */}
              <div className="text-center">
                <h3 className="mb-1 text-xl font-bold text-gray-800 dark:text-white/90">
                  {agent.agent_name}
                </h3>
                <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                  {agent.department_name}
                </p>

                {/* Badge */}
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${config.badge}`}>
                  {config.label}
                </span>
              </div>

              {/* Stats */}
              <div className="mt-4 space-y-2 border-t border-gray-200 pt-4 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Rating</span>
                  <span className="text-lg font-bold text-gray-800 dark:text-white/90">
                    {agent.avg_rating.toFixed(2)} ⭐
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Reviews</span>
                  <span className="text-lg font-bold text-gray-800 dark:text-white/90">
                    {agent.total.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">5-Star Rate</span>
                  <div className="flex items-center gap-2">
                    <div className="relative h-2 w-16 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="absolute left-0 top-0 h-full bg-green-500 transition-all"
                        style={{ width: `${agent.percent_5_star}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {agent.percent_5_star.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Remaining Rankings */}
      {remaining.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="border-b border-gray-200 p-5 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Rising Stars
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {remaining.map((agent, index) => {
              const rank = index + 4;
              return (
                <div
                  key={agent.agent_id}
                  className="flex items-center justify-between p-5 transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                >
                  {/* Left: Rank + Agent Info */}
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      {rank}
                    </div>
                    
                    <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-gray-200 dark:border-gray-700">
                      <Image
                        src={agent.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.agent_name)}&background=4F46E5&color=fff&size=256`}
                        alt={agent.agent_name}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.agent_name)}&background=4F46E5&color=fff&size=256`;
                        }}
                      />
                    </div>

                    <div>
                      <p className="font-semibold text-gray-800 dark:text-white/90">
                        {agent.agent_name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {agent.department_name}
                      </p>
                    </div>
                  </div>

                  {/* Right: Stats */}
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Rating</p>
                      <p className="font-semibold text-gray-800 dark:text-white/90">
                        {agent.avg_rating.toFixed(2)} ⭐
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Reviews</p>
                      <p className="font-semibold text-gray-800 dark:text-white/90">
                        {agent.total.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">5-Star</p>
                      <div className="flex items-center justify-end gap-2">
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          agent.percent_5_star >= 95 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          agent.percent_5_star >= 90 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {agent.percent_5_star.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
