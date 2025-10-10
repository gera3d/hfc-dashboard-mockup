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
import { Review, Agent, Department } from "@/data/dataService";
import { Star } from "lucide-react";

interface ReviewsTableProps {
  reviews: Review[];
  agents: Agent[];
  departments: Department[];
  maxRows?: number;
}

export const ReviewsTable: React.FC<ReviewsTableProps> = ({ 
  reviews, 
  agents, 
  departments,
  maxRows = 10 
}) => {
  const getAgentName = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    return agent?.display_name || "Unknown Agent";
  };

  const getDepartmentName = (deptId: string) => {
    const dept = departments.find(d => d.id === deptId);
    return dept?.name || "Unknown Dept";
  };

  const getRatingColor = (rating: number): "success" | "warning" | "error" => {
    if (rating >= 4) return "success";
    if (rating >= 3) return "warning";
    return "error";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const displayReviews = reviews.slice(0, maxRows);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Recent Customer Reviews
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Latest {displayReviews.length} of {reviews.length} total reviews
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell className="min-w-[200px]">Agent</TableCell>
              <TableCell className="min-w-[150px]">Department</TableCell>
              <TableCell className="min-w-[100px]">Rating</TableCell>
              <TableCell className="min-w-[300px]">Comment</TableCell>
              <TableCell className="min-w-[120px]">Source</TableCell>
              <TableCell className="min-w-[150px]">Date</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayReviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {getAgentName(review.agent_id)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-gray-600 dark:text-gray-400">
                    {getDepartmentName(review.department_id)}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge color={getRatingColor(review.rating)}>
                    <Star className="w-3 h-3 fill-current" />
                    {review.rating}
                  </Badge>
                </TableCell>
                <TableCell>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {review.comment}
                  </p>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {review.source}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(review.review_ts)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {reviews.length > maxRows && (
        <div className="flex justify-center pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            View All {reviews.length} Reviews
          </button>
        </div>
      )}
    </div>
  );
};
