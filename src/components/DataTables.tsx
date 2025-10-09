'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown, ExternalLink, Download, Star, MessageCircle } from 'lucide-react'
import { AgentMetrics, Review, agents, departments } from '@/data/dataService'

interface AgentTableProps {
  data: AgentMetrics[]
  onAgentClick?: (agentId: string) => void
}

interface ReviewTableProps {
  data: Review[]
  showPagination?: boolean
  pageSize?: number
}

type SortField = 'agent_name' | 'department_name' | 'star_1' | 'star_2' | 'star_3' | 'star_4' | 'star_5' | 'total' | 'avg_rating' | 'percent_5_star' | 'last_review_date'
type SortDirection = 'asc' | 'desc'

export function AgentTable({ data, onAgentClick }: AgentTableProps) {
  const [sortField, setSortField] = useState<SortField>('total')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }
  
  const sortedData = [...data].sort((a, b) => {
    let aValue: string | number | null = a[sortField]
    let bValue: string | number | null = b[sortField]
    
    // Handle date strings
    if (sortField === 'last_review_date') {
      aValue = aValue ? new Date(aValue as string).getTime() : 0
      bValue = bValue ? new Date(bValue as string).getTime() : 0
    }
    
    // Handle string fields
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }
    
    if (sortDirection === 'asc') {
      return (aValue as number) < (bValue as number) ? -1 : (aValue as number) > (bValue as number) ? 1 : 0
    } else {
      return (aValue as number) > (bValue as number) ? -1 : (aValue as number) < (bValue as number) ? 1 : 0
    }
  })
  
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <div className="w-4 h-4" />
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4 text-blue-600" /> : 
      <ChevronDown className="w-4 h-4 text-blue-600" />
  }
  
  const formatLastReviewDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never'
    const date = new Date(dateStr)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Today'
    if (diffDays <= 7) return `${diffDays} days ago`
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return date.toLocaleDateString()
  }
  
  // Group by department
  const grouped = sortedData.reduce((acc, agent) => {
    if (!acc[agent.department_name]) acc[agent.department_name] = [];
    acc[agent.department_name].push(agent);
    return acc;
  }, {} as Record<string, AgentMetrics[]>);

  // Calculate department and grand totals/averages
  const calcSummary = (agents: AgentMetrics[]) => {
    const sum = (field: keyof AgentMetrics) => agents.reduce((a, b) => a + (Number(b[field]) || 0), 0);
    const avg = (field: keyof AgentMetrics) => agents.length ? sum(field) / agents.length : 0;
    return {
      star_1: sum('star_1'),
      star_2: sum('star_2'),
      star_3: sum('star_3'),
      star_4: sum('star_4'),
      star_5: sum('star_5'),
      total: sum('total'),
      avg_rating: avg('avg_rating'),
      percent_5_star: avg('percent_5_star'),
    };
  };
  const grandSummary = calcSummary(sortedData);

  return (
    <div className="backdrop-blur-md bg-white rounded-2xl shadow-soft border border-gray-100 mb-8 hover:shadow-elevated transition-all duration-200">
      <div className="p-8 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-display font-semibold text-gray-800 mb-1 tracking-tight">Agent Performance</h3>
            <p className="text-sm text-gray-500">Detailed metrics for all agents, grouped by department, with totals and averages.</p>
          </div>
          <button className="stripe-button-secondary">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full stripe-table">
          <thead className="bg-white sticky top-0 z-10 border-b border-gray-100">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleSort('agent_name')}
              >
                <div className="flex items-center gap-2">
                  Agent
                  <SortIcon field="agent_name" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('department_name')}
              >
                <div className="flex items-center gap-2">
                  Department
                  <SortIcon field="department_name" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('star_1')}
              >
                <div className="flex items-center justify-center gap-2">
                  1★
                  <SortIcon field="star_1" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('star_2')}
              >
                <div className="flex items-center justify-center gap-2">
                  2★
                  <SortIcon field="star_2" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('star_3')}
              >
                <div className="flex items-center justify-center gap-2">
                  3★
                  <SortIcon field="star_3" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('star_4')}
              >
                <div className="flex items-center justify-center gap-2">
                  4★
                  <SortIcon field="star_4" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('star_5')}
              >
                <div className="flex items-center justify-center gap-2">
                  5★
                  <SortIcon field="star_5" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('total')}
              >
                <div className="flex items-center justify-center gap-2">
                  Total
                  <SortIcon field="total" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('avg_rating')}
              >
                <div className="flex items-center justify-center gap-2">
                  Avg
                  <SortIcon field="avg_rating" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('percent_5_star')}
              >
                <div className="flex items-center justify-center gap-2">
                  5★ Rate
                  <SortIcon field="percent_5_star" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('last_review_date')}
              >
                <div className="flex items-center justify-center gap-2">
                  Last Review
                  <SortIcon field="last_review_date" />
                </div>
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Grand total row */}
            <tr className="bg-green-100 font-bold text-green-900 border-b-2 border-green-400">
              <td className="px-6 py-3" colSpan={2}>TOTALS</td>
              <td className="text-center">{grandSummary.star_1}</td>
              <td className="text-center">{grandSummary.star_2}</td>
              <td className="text-center">{grandSummary.star_3}</td>
              <td className="text-center">{grandSummary.star_4}</td>
              <td className="text-center">{grandSummary.star_5}</td>
              <td className="text-center font-bold">{grandSummary.total}</td>
              <td className="text-center">{grandSummary.avg_rating.toFixed(2)}</td>
              <td className="text-center">{grandSummary.percent_5_star.toFixed(2)}%</td>
              <td colSpan={2}></td>
            </tr>
            {/* Department groups */}
            {Object.entries(grouped).map(([dept, agents]) => {
              const summary = calcSummary(agents);
              return [
                <tr key={dept + '-header'} className="bg-gray-100 text-gray-700 border-t-2 border-gray-300">
                  <td className="px-6 py-2 text-lg font-bold" colSpan={12}>{dept}</td>
                </tr>,
                ...agents.map(agent => (
                  <tr
                    key={agent.agent_id}
                    className="group bg-white hover:bg-blue-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0 cursor-pointer"
                    tabIndex={0}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onAgentClick?.(agent.agent_id)}
                  >
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{agent.agent_name}</div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{agent.department_name}</div>
                    </td>
                    <td className="px-6 py-3 text-center text-red-600">{agent.star_1}</td>
                    <td className="px-6 py-3 text-center text-orange-600">{agent.star_2}</td>
                    <td className="px-6 py-3 text-center text-yellow-600">{agent.star_3}</td>
                    <td className="px-6 py-3 text-center text-lime-600">{agent.star_4}</td>
                    <td className="px-6 py-3 text-center text-green-600">{agent.star_5}</td>
                    <td className="px-6 py-3 text-center font-bold text-blue-600">{agent.total}</td>
                    <td className="px-6 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{agent.avg_rating.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-center text-green-600">{agent.percent_5_star.toFixed(1)}%</td>
                    <td className="px-6 py-3 text-center text-gray-600">{formatLastReviewDate(agent.last_review_date)}</td>
                    <td className="px-6 py-3 text-center">
                      <button
                        onClick={() => onAgentClick?.(agent.agent_id)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View agent details"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )),
                <tr key={dept + '-summary'} className="bg-blue-100 font-semibold text-blue-900 border-b-2 border-blue-300">
                  <td className="px-6 py-2" colSpan={2}>Subtotal</td>
                  <td className="text-center">{summary.star_1}</td>
                  <td className="text-center">{summary.star_2}</td>
                  <td className="text-center">{summary.star_3}</td>
                  <td className="text-center">{summary.star_4}</td>
                  <td className="text-center">{summary.star_5}</td>
                  <td className="text-center font-bold">{summary.total}</td>
                  <td className="text-center">{summary.avg_rating.toFixed(2)}</td>
                  <td className="text-center">{summary.percent_5_star.toFixed(2)}%</td>
                  <td colSpan={2}></td>
                </tr>
              ];
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function ReviewTable({ data, showPagination = true, pageSize = 10 }: ReviewTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  
  const totalPages = Math.ceil(data.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentData = showPagination ? data.slice(startIndex, endIndex) : data
  
  const getAgentName = (agentId: string) => {
    return agents.find(a => a.id === agentId)?.display_name || 'Unknown'
  }
  
  const getDepartmentName = (departmentId: string) => {
    return departments.find(d => d.id === departmentId)?.name || 'Unknown'
  }
  
  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  
  const getRatingColor = (rating: number) => {
    const colors = {
      1: 'text-red-600',
      2: 'text-orange-600',
      3: 'text-yellow-600',
      4: 'text-lime-600',
      5: 'text-green-600'
    }
    return colors[rating as keyof typeof colors] || 'text-gray-600'
  }
  
  const truncateComment = (comment: string, length = 100) => {
    if (comment.length <= length) return comment
    return comment.substring(0, length) + '...'
  }
  
  return (
    <>
      <div className="backdrop-blur-md bg-white rounded-2xl shadow-soft border border-gray-100 hover:shadow-elevated transition-all duration-200">
        <div className="p-8 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-display font-semibold text-gray-800 mb-1 tracking-tight">Individual Reviews</h3>
              <p className="text-sm text-gray-500">Complete review history with details</p>
            </div>
            <button className="stripe-button-secondary">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full stripe-table">
            <thead className="bg-white sticky top-0 z-10 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date/Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentData.map((review) => (
                <tr
                  key={review.id}
                  className="group bg-white hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0 cursor-pointer"
                  tabIndex={0}
                  onClick={() => setSelectedReview(review)}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setSelectedReview(review)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDateTime(review.review_ts)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{getAgentName(review.agent_id)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{getDepartmentName(review.department_id)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className={`w-4 h-4 ${getRatingColor(review.rating)} fill-current`} />
                      <span className={`text-sm font-medium ${getRatingColor(review.rating)}`}>
                        {review.rating}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-md">
                      {review.comment ? truncateComment(review.comment) : 'No comment'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{review.source}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {showPagination && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of {data.length} reviews
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Review Detail Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Review Details</h3>
                <button
                  onClick={() => setSelectedReview(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Agent</label>
                    <p className="text-gray-900">{getAgentName(selectedReview.agent_id)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Department</label>
                    <p className="text-gray-900">{getDepartmentName(selectedReview.department_id)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date & Time</label>
                    <p className="text-gray-900">{formatDateTime(selectedReview.review_ts)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Source</label>
                    <p className="text-gray-900">{selectedReview.source}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Rating</label>
                  <div className="flex items-center gap-2 mt-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star 
                        key={star}
                        className={`w-6 h-6 ${star <= selectedReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                    <span className={`text-lg font-medium ${getRatingColor(selectedReview.rating)}`}>
                      {selectedReview.rating} / 5
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Comment</label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <MessageCircle className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-900 leading-relaxed">
                        {selectedReview.comment || 'No comment provided'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}