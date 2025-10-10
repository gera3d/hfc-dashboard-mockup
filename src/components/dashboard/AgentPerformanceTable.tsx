"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/tailadmin/ui/table";
import Badge from "@/components/tailadmin/ui/badge/Badge";
import Image from "next/image";
import { AgentMetrics } from "@/data/dataService";
import { Star, TrendingUp } from "lucide-react";

interface AgentPerformanceTableProps {
  agentMetrics: AgentMetrics[];
  maxRows?: number;
}

export const AgentPerformanceTable: React.FC<AgentPerformanceTableProps> = ({ 
  agentMetrics,
  maxRows = 10 
}) => {
  const getRatingColor = (rating: number): "success" | "warning" | "error" => {
    if (rating >= 4.5) return "success";
    if (rating >= 3.5) return "warning";
    return "error";
  };

  const displayAgents = agentMetrics.slice(0, maxRows);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Agent Performance
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Top performing agents by average rating
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell className="min-w-[200px]">Agent</TableCell>
              <TableCell className="min-w-[150px]">Department</TableCell>
              <TableCell className="min-w-[120px]">Avg Rating</TableCell>
              <TableCell className="min-w-[100px]">Total</TableCell>
              <TableCell className="min-w-[100px]">5-Star %</TableCell>
              <TableCell className="min-w-[150px]">Last Review</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayAgents.map((agent, index) => (
              <TableRow key={agent.agent_id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {agent.image_url ? (
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                        <Image
                          src={agent.image_url}
                          alt={agent.agent_name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                        {agent.agent_name.charAt(0)}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {agent.agent_name}
                      </span>
                      {index < 3 && (
                        <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Top Performer
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-gray-600 dark:text-gray-400">
                    {agent.department_name}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge color={getRatingColor(agent.avg_rating)}>
                    <Star className="w-3 h-3 fill-current" />
                    {agent.avg_rating.toFixed(2)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {agent.total}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden max-w-[60px]">
                      <div 
                        className="h-full bg-green-500" 
                        style={{ width: `${agent.percent_5_star}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {agent.percent_5_star.toFixed(0)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {agent.last_review_date 
                      ? new Date(agent.last_review_date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })
                      : 'N/A'}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
