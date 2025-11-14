'use client'

import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, ExternalLink, Download, Star, MessageCircle, Plus, EyeOff } from 'lucide-react'
import { AgentMetrics, Review, Agent, Department, agents as defaultAgents, departments as defaultDepartments } from '@/data/dataService'
import { TableContainer } from './TableContainer'

interface AgentTableProps {
  data: AgentMetrics[]
  onAgentClick?: (agentId: string) => void
  departments?: Department[]
  onDepartmentChange?: (agentId: string, departmentId: string) => void
  onCreateDepartment?: (departmentName: string) => Promise<string> // Returns new department ID
  onHideAgent?: (agentId: string) => void // New prop for hiding agents
}

interface ReviewTableProps {
  data: Review[]
  agents?: Agent[]
  departments?: Department[]
  showPagination?: boolean
  pageSize?: number
}

type SortField = 'agent_name' | 'department_name' | 'star_1' | 'star_2' | 'star_3' | 'star_4' | 'star_5' | 'total' | 'avg_rating' | 'percent_5_star' | 'last_review_date'
type SortDirection = 'asc' | 'desc'

export function AgentTable({ data, onAgentClick, departments = defaultDepartments, onDepartmentChange, onCreateDepartment, onHideAgent }: AgentTableProps) {
  const [sortField, setSortField] = useState<SortField>('total')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null)
  const [showNewDeptModal, setShowNewDeptModal] = useState<string | null>(null) // agentId
  const [newDeptName, setNewDeptName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  
  const handleDepartmentChange = async (agentId: string, departmentId: string) => {
    if (departmentId === 'CREATE_NEW') {
      setShowNewDeptModal(agentId)
      return
    }
    
    if (onDepartmentChange) {
      onDepartmentChange(agentId, departmentId)
    }
    setEditingAgentId(null)
  }
  
  const handleCreateDepartment = async (agentId: string) => {
    if (!newDeptName.trim() || !onCreateDepartment) return
    
    setIsCreating(true)
    try {
      const newDeptId = await onCreateDepartment(newDeptName.trim())
      if (onDepartmentChange) {
        onDepartmentChange(agentId, newDeptId)
      }
      setShowNewDeptModal(null)
      setNewDeptName('')
    } catch (error) {
      console.error('Error creating department:', error)
      alert('Failed to create department')
    } finally {
      setIsCreating(false)
    }
  }
  
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
    <TableContainer 
      title="Agent Performance" 
      subtitle="Detailed metrics for all agents, grouped by department, with totals and averages"
    >
      <div className="overflow-x-auto">
        <table className="min-w-full table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors w-36"
                onClick={() => handleSort('agent_name')}
              >
                <div className="flex items-center gap-1">
                  Agent
                  <SortIcon field="agent_name" />
                </div>
              </th>
              <th 
                className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-32"
                onClick={() => handleSort('department_name')}
              >
                <div className="flex items-center gap-1">
                  Dept
                  <SortIcon field="department_name" />
                </div>
              </th>
              <th 
                className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-12"
                onClick={() => handleSort('star_1')}
              >
                <div className="flex items-center justify-center gap-1">
                  1★
                  <SortIcon field="star_1" />
                </div>
              </th>
              <th 
                className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-12"
                onClick={() => handleSort('star_2')}
              >
                <div className="flex items-center justify-center gap-1">
                  2★
                  <SortIcon field="star_2" />
                </div>
              </th>
              <th 
                className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-12"
                onClick={() => handleSort('star_3')}
              >
                <div className="flex items-center justify-center gap-1">
                  3★
                  <SortIcon field="star_3" />
                </div>
              </th>
              <th 
                className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-12"
                onClick={() => handleSort('star_4')}
              >
                <div className="flex items-center justify-center gap-1">
                  4★
                  <SortIcon field="star_4" />
                </div>
              </th>
              <th 
                className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-12"
                onClick={() => handleSort('star_5')}
              >
                <div className="flex items-center justify-center gap-1">
                  5★
                  <SortIcon field="star_5" />
                </div>
              </th>
              <th 
                className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-16"
                onClick={() => handleSort('total')}
              >
                <div className="flex items-center justify-center gap-1">
                  Total
                  <SortIcon field="total" />
                </div>
              </th>
              <th 
                className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-16"
                onClick={() => handleSort('avg_rating')}
              >
                <div className="flex items-center justify-center gap-1">
                  Avg
                  <SortIcon field="avg_rating" />
                </div>
              </th>
              <th 
                className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-14"
                onClick={() => handleSort('percent_5_star')}
              >
                <div className="flex items-center justify-center gap-1">
                  5★%
                  <SortIcon field="percent_5_star" />
                </div>
              </th>
              <th 
                className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-20"
                onClick={() => handleSort('last_review_date')}
              >
                <div className="flex items-center justify-center gap-1">
                  Last
                  <SortIcon field="last_review_date" />
                </div>
              </th>
              <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
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
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 truncate">{agent.agent_name}</div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="relative">
                        <select
                          value={departments.find(d => d.name === agent.department_name)?.id || ''}
                          onChange={(e) => handleDepartmentChange(agent.agent_id, e.target.value)}
                          className="text-xs text-gray-900 border border-gray-300 rounded px-1.5 py-1 pr-6 w-full hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer bg-white transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {departments.map(dept => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name}
                            </option>
                          ))}
                          <option value="CREATE_NEW" className="text-blue-600 font-semibold">
                            + New
                          </option>
                        </select>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-center text-sm text-red-600">{agent.star_1}</td>
                    <td className="px-2 py-2 text-center text-sm text-orange-600">{agent.star_2}</td>
                    <td className="px-2 py-2 text-center text-sm text-yellow-600">{agent.star_3}</td>
                    <td className="px-2 py-2 text-center text-sm text-lime-600">{agent.star_4}</td>
                    <td className="px-2 py-2 text-center text-sm text-green-600">{agent.star_5}</td>
                    <td className="px-2 py-2 text-center text-sm font-bold text-blue-600">{agent.total}</td>
                    <td className="px-2 py-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{agent.avg_rating.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-center text-sm text-green-600">{agent.percent_5_star.toFixed(1)}%</td>
                    <td className="px-2 py-2 text-center text-xs text-gray-600">{formatLastReviewDate(agent.last_review_date)}</td>
                    <td className="px-2 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onAgentClick?.(agent.agent_id)}
                          className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded hover:bg-blue-50"
                          title="View agent details"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        {onHideAgent && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (window.confirm(`Hide ${agent.agent_name}? This agent will be removed from all dashboards and rankings.`)) {
                                onHideAgent(agent.agent_id)
                              }
                            }}
                            className="text-gray-500 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50"
                            title="Hide agent from dashboard"
                          >
                            <EyeOff className="w-4 h-4" />
                          </button>
                        )}
                      </div>
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
      
      {/* New Department Modal */}
      {showNewDeptModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowNewDeptModal(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-lg w-full shadow-2xl border border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-[#0066cc] dark:text-blue-400 mb-3">Create New Department</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Enter the name for the new department. The agent will be assigned to it automatically.
            </p>
            <input
              type="text"
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              placeholder="Department name (e.g., Life Insurance, Claims)"
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-[#0066cc] dark:bg-gray-700 dark:text-white outline-none mb-6 text-base transition-all"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newDeptName.trim()) {
                  handleCreateDepartment(showNewDeptModal)
                } else if (e.key === 'Escape') {
                  setShowNewDeptModal(null)
                  setNewDeptName('')
                }
              }}
            />
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setShowNewDeptModal(null)
                  setNewDeptName('')
                }}
                className="w-full px-5 py-3 text-base font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                disabled={isCreating}
              >
                Cancel
              </button>
              <button
                onClick={() => handleCreateDepartment(showNewDeptModal)}
                disabled={!newDeptName.trim() || isCreating}
                className="w-full px-5 py-3 text-base font-semibold text-white bg-[#0066cc] rounded-lg hover:bg-[#0052a3] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                {isCreating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Create
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </TableContainer>
  )
}

export function ReviewTable({ data, agents = defaultAgents, departments = defaultDepartments, showPagination = true, pageSize = 10 }: ReviewTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  
  // Sort reviews by date (most recent first)
  const sortedData = [...data].sort((a, b) => {
    return new Date(b.review_ts).getTime() - new Date(a.review_ts).getTime()
  })
  
  const totalPages = Math.ceil(sortedData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentData = showPagination ? sortedData.slice(startIndex, endIndex) : sortedData
  
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
      <TableContainer 
        title="Individual Reviews" 
        subtitle="Complete review history with details"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
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
      </TableContainer>
      
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

// Customer Feedback Table - Only shows reviews with comments
export function CustomerFeedbackTable({ data, agents = defaultAgents, departments = defaultDepartments, showPagination = true, pageSize = 10 }: ReviewTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  
  // Filter to only reviews with comments, then sort by date (most recent first)
  const feedbackData = useMemo(() => {
    return [...data]
      .filter(review => review.comment && review.comment.trim().length > 0)
      .sort((a, b) => new Date(b.review_ts).getTime() - new Date(a.review_ts).getTime())
  }, [data])
  
  const totalPages = Math.ceil(feedbackData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentData = showPagination ? feedbackData.slice(startIndex, endIndex) : feedbackData
  
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
  
  return (
    <>
      <TableContainer 
        title="Customer Feedback" 
        subtitle={`Reviews with written comments • ${feedbackData.length} total`}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
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
                  Customer Feedback
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No customer feedback available for this period</p>
                  </td>
                </tr>
              ) : (
                currentData.map((review) => (
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
                      <div className="flex items-center justify-center">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 fill-current ${getRatingColor(review.rating)}`} />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-md">
                      <div className="text-sm text-gray-900 line-clamp-2">
                        {review.comment}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                        {review.source}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {showPagination && feedbackData.length > pageSize && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {startIndex + 1} to {Math.min(endIndex, feedbackData.length)} of {feedbackData.length} feedback entries
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 text-sm rounded-md ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </TableContainer>

      {/* Modal for full feedback view */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Customer Feedback Details</h3>
              <button
                onClick={() => setSelectedReview(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Date & Time</label>
                  <div className="mt-1 text-gray-900">{formatDateTime(selectedReview.review_ts)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Source</label>
                  <div className="mt-1">
                    <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                      {selectedReview.source}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Agent</label>
                  <div className="mt-1 text-gray-900 font-medium">{getAgentName(selectedReview.agent_id)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Department</label>
                  <div className="mt-1 text-gray-900">{getDepartmentName(selectedReview.department_id)}</div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Rating</label>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-6 h-6 ${
                          i < selectedReview.rating
                            ? `fill-current ${getRatingColor(selectedReview.rating)}`
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-lg font-medium ${getRatingColor(selectedReview.rating)}`}>
                    {selectedReview.rating} / 5
                  </span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Customer Feedback</label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <MessageCircle className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-900 leading-relaxed">
                      {selectedReview.comment}
                    </p>
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
