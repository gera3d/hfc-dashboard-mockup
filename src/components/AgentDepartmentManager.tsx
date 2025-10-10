'use client'

import { useState, useMemo } from 'react'
import { Agent, Department } from '@/data/dataService'

interface AgentDepartmentManagerProps {
  agents: Agent[]
  departments: Department[]
  onUpdate?: (agentId: string, departmentId: string) => void
}

export function AgentDepartmentManager({ agents, departments, onUpdate }: AgentDepartmentManagerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [editingAgent, setEditingAgent] = useState<string | null>(null)

  // Group agents by department
  const agentsByDepartment = useMemo(() => {
    const grouped: Record<string, Agent[]> = {}
    
    departments.forEach(dept => {
      grouped[dept.id] = agents.filter(agent => agent.department_id === dept.id)
    })
    
    // Add unassigned agents
    grouped['unassigned'] = agents.filter(agent => 
      !departments.some(dept => dept.id === agent.department_id)
    )
    
    return grouped
  }, [agents, departments])

  // Filter agents based on search and department selection
  const filteredAgents = useMemo(() => {
    let filtered = agents
    
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(agent => agent.department_id === selectedDepartment)
    }
    
    if (searchTerm) {
      filtered = filtered.filter(agent => 
        agent.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.agent_key.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    return filtered.sort((a, b) => a.display_name.localeCompare(b.display_name))
  }, [agents, searchTerm, selectedDepartment])

  const handleDepartmentChange = (agentId: string, newDepartmentId: string) => {
    if (onUpdate) {
      onUpdate(agentId, newDepartmentId)
    }
    setEditingAgent(null)
  }

  const getDepartmentName = (departmentId: string | undefined) => {
    if (!departmentId) return 'Unassigned'
    const dept = departments.find(d => d.id === departmentId)
    return dept?.name || 'Unknown'
  }

  return (
    <div className="bg-white rounded-md border border-[#E3E8EE] p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#0A2540] tracking-tight">
          Agent Department Assignment
        </h3>
        <p className="text-sm text-[#6B7C93] mt-1">
          Manage which department each agent belongs to
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-[#E3E8EE] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Department Filter */}
        <div className="sm:w-64">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full px-4 py-2 border border-[#E3E8EE] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>
                {dept.name} ({agentsByDepartment[dept.id]?.length || 0})
              </option>
            ))}
            <option value="unassigned">
              Unassigned ({agentsByDepartment['unassigned']?.length || 0})
            </option>
          </select>
        </div>
      </div>

      {/* Department Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {departments.map(dept => {
          const count = agentsByDepartment[dept.id]?.length || 0
          return (
            <div
              key={dept.id}
              className="p-4 border border-[#E3E8EE] rounded-md hover:border-blue-300 transition-colors cursor-pointer"
              onClick={() => setSelectedDepartment(dept.id)}
            >
              <div className="text-2xl font-semibold text-[#0A2540]">{count}</div>
              <div className="text-sm text-[#6B7C93] mt-1">{dept.name}</div>
            </div>
          )
        })}
      </div>

      {/* Agents Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E3E8EE]">
              <th className="text-left py-3 px-4 text-xs font-semibold text-[#6B7C93] uppercase tracking-wider">
                Agent Name
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[#6B7C93] uppercase tracking-wider">
                Agent Key
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[#6B7C93] uppercase tracking-wider">
                Current Department
              </th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-[#6B7C93] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAgents.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-[#6B7C93]">
                  No agents found
                </td>
              </tr>
            ) : (
              filteredAgents.map(agent => (
                <tr
                  key={agent.id}
                  className="border-b border-[#E3E8EE] hover:bg-[#F6F9FC] transition-colors"
                >
                  <td className="py-3 px-4 text-sm text-[#0A2540] font-medium">
                    {agent.display_name}
                  </td>
                  <td className="py-3 px-4 text-sm text-[#6B7C93] font-mono">
                    {agent.agent_key}
                  </td>
                  <td className="py-3 px-4">
                    {editingAgent === agent.id ? (
                      <select
                        value={agent.department_id || ''}
                        onChange={(e) => handleDepartmentChange(agent.id, e.target.value)}
                        onBlur={() => setEditingAgent(null)}
                        autoFocus
                        className="px-3 py-1 border border-[#E3E8EE] rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Unassigned</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${
                          agent.department_id
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {getDepartmentName(agent.department_id)}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setEditingAgent(agent.id)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Change
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Note about Google Sheets */}
      <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
        <p className="text-xs text-[#0A2540] font-medium mb-1">📝 Note</p>
        <p className="text-xs text-[#425466]">
          Changes made here will need to be synced back to your Google Sheet. 
          Currently, you can view and plan assignments here, but you'll need to update the sheet manually.
          We're working on direct Google Sheets integration for automatic updates.
        </p>
      </div>
    </div>
  )
}
