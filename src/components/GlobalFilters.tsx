'use client'

import { useState } from 'react'
import { Calendar, ChevronDown, X } from 'lucide-react'
import { departments, agents, sources, getDateRanges, DateRange } from '@/data/dataService'

interface Filters {
  dateRange: DateRange
  selectedDepartments: string[]
  selectedAgents: string[]
  selectedSources: string[]
  compareMode: boolean
}

interface GlobalFiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
}

export default function GlobalFilters({ filters, onFiltersChange }: GlobalFiltersProps) {
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false)
  const [showAgentDropdown, setShowAgentDropdown] = useState(false)
  const [showSourceDropdown, setShowSourceDropdown] = useState(false)
  
  const dateRanges = getDateRanges()
  
  const getDateRangeLabel = (dateRange: DateRange) => {
    const predefinedRange = Object.values(dateRanges).find(range => 
      range.from.getTime() === dateRange.from.getTime() && 
      range.to.getTime() === dateRange.to.getTime()
    )
    
    if (predefinedRange) {
      return predefinedRange.label
    }
    
    return `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
  }
  
  const handleDateRangeSelect = (range: DateRange) => {
    onFiltersChange({ ...filters, dateRange: range })
    setShowDatePicker(false)
  }
  
  const toggleDepartment = (departmentId: string) => {
    const updated = filters.selectedDepartments.includes(departmentId)
      ? filters.selectedDepartments.filter(id => id !== departmentId)
      : [...filters.selectedDepartments, departmentId]
    onFiltersChange({ ...filters, selectedDepartments: updated })
  }
  
  const toggleAgent = (agentId: string) => {
    const updated = filters.selectedAgents.includes(agentId)
      ? filters.selectedAgents.filter(id => id !== agentId)
      : [...filters.selectedAgents, agentId]
    onFiltersChange({ ...filters, selectedAgents: updated })
  }
  
  const toggleSource = (source: string) => {
    const updated = filters.selectedSources.includes(source)
      ? filters.selectedSources.filter(s => s !== source)
      : [...filters.selectedSources, source]
    onFiltersChange({ ...filters, selectedSources: updated })
  }
  
  const clearDepartments = () => {
    onFiltersChange({ ...filters, selectedDepartments: [] })
  }
  
  const clearAgents = () => {
    onFiltersChange({ ...filters, selectedAgents: [] })
  }
  
  const clearSources = () => {
    onFiltersChange({ ...filters, selectedSources: [] })
  }
  
  const toggleCompareMode = () => {
    onFiltersChange({ ...filters, compareMode: !filters.compareMode })
  }
  
  // Filter agents by selected departments
  const availableAgents = filters.selectedDepartments.length > 0 
    ? agents.filter(agent => filters.selectedDepartments.includes(agent.department_id))
    : agents
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
      <div className="flex flex-wrap gap-4 items-center">
        {/* Date Range Picker */}
        <div className="relative">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">{getDateRangeLabel(filters.dateRange)}</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
          
          {showDatePicker && (
            <div className="absolute top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
              <div className="p-2">
                <button
                  onClick={() => handleDateRangeSelect(dateRanges.last7Days)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                >
                  Last 7 days
                </button>
                <button
                  onClick={() => handleDateRangeSelect(dateRanges.thisMonth)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                >
                  This month
                </button>
                <button
                  onClick={() => handleDateRangeSelect(dateRanges.thisYear)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                >
                  This year
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Department Filter */}
        <div className="relative">
          <button
            onClick={() => setShowDepartmentDropdown(!showDepartmentDropdown)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <span className="text-sm font-medium">
              {filters.selectedDepartments.length === 0 
                ? 'All Departments' 
                : `${filters.selectedDepartments.length} Department${filters.selectedDepartments.length > 1 ? 's' : ''}`
              }
            </span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
          
          {showDepartmentDropdown && (
            <div className="absolute top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
              <div className="p-2">
                {filters.selectedDepartments.length > 0 && (
                  <button
                    onClick={clearDepartments}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded mb-1"
                  >
                    Clear All
                  </button>
                )}
                {departments.map(dept => (
                  <label key={dept.id} className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.selectedDepartments.includes(dept.id)}
                      onChange={() => toggleDepartment(dept.id)}
                      className="mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    {dept.name}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Agent Filter */}
        <div className="relative">
          <button
            onClick={() => setShowAgentDropdown(!showAgentDropdown)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <span className="text-sm font-medium">
              {filters.selectedAgents.length === 0 
                ? 'All Agents' 
                : `${filters.selectedAgents.length} Agent${filters.selectedAgents.length > 1 ? 's' : ''}`
              }
            </span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
          
          {showAgentDropdown && (
            <div className="absolute top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48 max-h-64 overflow-y-auto">
              <div className="p-2">
                {filters.selectedAgents.length > 0 && (
                  <button
                    onClick={clearAgents}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded mb-1"
                  >
                    Clear All
                  </button>
                )}
                {availableAgents.map(agent => {
                  const dept = departments.find(d => d.id === agent.department_id)
                  return (
                    <label key={agent.id} className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.selectedAgents.includes(agent.id)}
                        onChange={() => toggleAgent(agent.id)}
                        className="mr-3 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div>{agent.display_name}</div>
                        <div className="text-xs text-gray-500">{dept?.name}</div>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
          )}
        </div>
        
        {/* Source Filter */}
        <div className="relative">
          <button
            onClick={() => setShowSourceDropdown(!showSourceDropdown)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <span className="text-sm font-medium">
              {filters.selectedSources.length === 0 
                ? 'All Sources' 
                : `${filters.selectedSources.length} Source${filters.selectedSources.length > 1 ? 's' : ''}`
              }
            </span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
          
          {showSourceDropdown && (
            <div className="absolute top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
              <div className="p-2">
                {filters.selectedSources.length > 0 && (
                  <button
                    onClick={clearSources}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded mb-1"
                  >
                    Clear All
                  </button>
                )}
                {sources.map(source => (
                  <label key={source} className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.selectedSources.includes(source)}
                      onChange={() => toggleSource(source)}
                      className="mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    {source}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Compare Mode Toggle */}
        <div className="flex items-center ml-auto">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={filters.compareMode}
              onChange={toggleCompareMode}
              className="mr-2 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Compare to previous period</span>
          </label>
        </div>
      </div>
      
      {/* Active Filters Display */}
      {(filters.selectedDepartments.length > 0 || filters.selectedAgents.length > 0 || filters.selectedSources.length > 0) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {filters.selectedDepartments.map(deptId => {
              const dept = departments.find(d => d.id === deptId)
              return (
                <span key={deptId} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {dept?.name}
                  <button
                    onClick={() => toggleDepartment(deptId)}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )
            })}
            
            {filters.selectedAgents.map(agentId => {
              const agent = agents.find(a => a.id === agentId)
              return (
                <span key={agentId} className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {agent?.display_name}
                  <button
                    onClick={() => toggleAgent(agentId)}
                    className="hover:bg-green-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )
            })}
            
            {filters.selectedSources.map(source => (
              <span key={source} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                {source}
                <button
                  onClick={() => toggleSource(source)}
                  className="hover:bg-purple-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}