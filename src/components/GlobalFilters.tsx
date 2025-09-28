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
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-elevated border border-white/50 p-6 md:p-8 mb-10 hover:shadow-elevatedStrong transition-all duration-300 relative overflow-visible group">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-indigo-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10 flex flex-wrap gap-4 sm:gap-6 items-center">
        {/* Date Range Picker */}
        <div className="relative dropdown-container">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:bg-gray-50 font-medium text-gray-900"
          >
            <Calendar className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-semibold">{getDateRangeLabel(filters.dateRange)}</span>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showDatePicker ? 'rotate-180' : ''}`} />
          </button>
          
          {showDatePicker && (
            <div className="absolute top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] min-w-48 overflow-hidden dropdown-content">
              <div className="p-2">
                <button
                  onClick={() => handleDateRangeSelect(dateRanges.last7Days)}
                  className="w-full text-left px-3 py-3 text-sm hover:bg-blue-50 rounded font-medium text-gray-900 hover:text-blue-700 transition-colors duration-150"
                >
                  Last 7 days
                </button>
                <button
                  onClick={() => handleDateRangeSelect(dateRanges.thisMonth)}
                  className="w-full text-left px-3 py-3 text-sm hover:bg-blue-50 rounded font-medium text-gray-900 hover:text-blue-700 transition-colors duration-150"
                >
                  This month
                </button>
                <button
                  onClick={() => handleDateRangeSelect(dateRanges.thisYear)}
                  className="w-full text-left px-3 py-3 text-sm hover:bg-blue-50 rounded font-medium text-gray-900 hover:text-blue-700 transition-colors duration-150"
                >
                  This year
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Department Filter */}
        <div className="relative dropdown-container">
          <button
            onClick={() => setShowDepartmentDropdown(!showDepartmentDropdown)}
            className={`flex items-center gap-2 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 font-medium ${
              filters.selectedDepartments.length > 0
                ? 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100'
                : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <span className="text-sm font-semibold">
              {filters.selectedDepartments.length === 0 
                ? 'All Departments' 
                : `${filters.selectedDepartments.length} Department${filters.selectedDepartments.length > 1 ? 's' : ''}`
              }
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showDepartmentDropdown ? 'rotate-180' : ''} ${filters.selectedDepartments.length > 0 ? 'text-blue-600' : 'text-gray-500'}`} />
          </button>
          
          {showDepartmentDropdown && (
            <div className="absolute top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] min-w-48 dropdown-content">
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
        <div className="relative dropdown-container">
          <button
            onClick={() => setShowAgentDropdown(!showAgentDropdown)}
            className={`flex items-center gap-2 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 font-medium ${
              filters.selectedAgents.length > 0
                ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100'
                : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <span className="text-sm font-semibold">
              {filters.selectedAgents.length === 0 
                ? 'All Agents' 
                : `${filters.selectedAgents.length} Agent${filters.selectedAgents.length > 1 ? 's' : ''}`
              }
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showAgentDropdown ? 'rotate-180' : ''} ${filters.selectedAgents.length > 0 ? 'text-green-600' : 'text-gray-500'}`} />
          </button>
          
          {showAgentDropdown && (
            <div className="absolute top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] min-w-48 max-h-64 overflow-y-auto dropdown-content">
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
        <div className="relative dropdown-container">
          <button
            onClick={() => setShowSourceDropdown(!showSourceDropdown)}
            className={`flex items-center gap-2 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 font-medium ${
              filters.selectedSources.length > 0
                ? 'border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100'
                : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <span className="text-sm font-semibold">
              {filters.selectedSources.length === 0 
                ? 'All Sources' 
                : `${filters.selectedSources.length} Source${filters.selectedSources.length > 1 ? 's' : ''}`
              }
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showSourceDropdown ? 'rotate-180' : ''} ${filters.selectedSources.length > 0 ? 'text-purple-600' : 'text-gray-500'}`} />
          </button>
          
          {showSourceDropdown && (
            <div className="absolute top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] min-w-48 dropdown-content">
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
          <label className="flex items-center cursor-pointer group">
            <input
              type="checkbox"
              checked={filters.compareMode}
              onChange={toggleCompareMode}
              className="mr-3 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-all duration-200"
            />
            <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
              Compare to previous period
            </span>
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