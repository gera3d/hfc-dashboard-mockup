'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { syncFromGoogleSheets } from '@/data/googleSheetsService';
import { 
  loadAgents, 
  loadDepartments, 
  refreshAgents, 
  refreshDepartments,
  updateAgentDepartment 
} from '@/data/dataService';
import { 
  getChangeCount, 
  clearAllOverrides, 
  saveAgentDepartment, 
  saveCustomDepartment,
  applyAgentOverrides,
  mergeDepartments
} from '@/lib/localStorage';
import { AgentDepartmentManager } from '@/components/AgentDepartmentManager';
import PerformanceTierGuide from '@/components/dashboard/PerformanceTierGuide';
import type { Agent, Department } from '@/data/dataService';
import { 
  loadDisplayPreferences, 
  saveDisplayPreferences,
  type DisplayPreferences 
} from '@/lib/displayPreferences';

export default function SettingsPage() {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showAgentManager, setShowAgentManager] = useState(false);
  const [displayPrefs, setDisplayPrefs] = useState<DisplayPreferences>({ showRatingDistribution: false });

  // Load display preferences
  useEffect(() => {
    setDisplayPrefs(loadDisplayPreferences());
  }, []);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [agentsData, departmentsData] = await Promise.all([
          loadAgents(),
          loadDepartments()
        ]);
        
        const agentsWithOverrides = applyAgentOverrides(agentsData);
        const departmentsWithCustom = mergeDepartments(departmentsData);
        
        setAgents(agentsWithOverrides);
        setDepartments(departmentsWithCustom);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, []);

  // Sync from Google Sheets
  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await syncFromGoogleSheets();
      if (result.success) {
        setLastSyncTime(new Date());
        
        // Reload data after sync
        const [agentsData, departmentsData] = await Promise.all([
          refreshAgents(),
          refreshDepartments()
        ]);
        
        const agentsWithOverrides = applyAgentOverrides(agentsData);
        const departmentsWithCustom = mergeDepartments(departmentsData);
        
        setAgents(agentsWithOverrides);
        setDepartments(departmentsWithCustom);
        
        alert(`✅ Data synced successfully!\n\nLast updated: ${result.lastUpdated}\n\nThe dashboard now shows the latest data from Google Sheets.`);
      } else {
        // Better error messaging
        const errorMsg = result.message || 'Unknown error';
        if (errorMsg.includes('timeout') || errorMsg.includes('524')) {
          alert(`⏱️ Sync Timeout\n\nGoogle Sheets is taking too long to respond.\n\nPossible solutions:\n• Try again in a few moments\n• Check your internet connection\n• The spreadsheet might be very large\n• Google Sheets might be experiencing slowness\n\nYour cached data is still available.`);
        } else {
          alert(`❌ Sync failed: ${errorMsg}\n\nYour cached data is still available. Try refreshing instead.`);
        }
      }
    } catch (error) {
      console.error('Error syncing data:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      if (errorMsg.includes('timeout') || errorMsg.includes('524') || errorMsg.includes('aborted')) {
        alert(`⏱️ Sync Timeout\n\nThe request took too long. Google Sheets might be slow right now.\n\nTry:\n• Refreshing from cache instead (faster)\n• Waiting a few minutes and trying again\n• Checking if the Google Sheet is accessible\n\nYour existing cached data is still available.`);
      } else {
        alert(`❌ Failed to sync: ${errorMsg}\n\nYour cached data is still available.`);
      }
    } finally {
      setSyncing(false);
    }
  };

  // Refresh from local cache
  const handleRefresh = async () => {
    setLoading(true);
    try {
      const [agentsData, departmentsData] = await Promise.all([
        refreshAgents(),
        refreshDepartments()
      ]);
      
      const agentsWithOverrides = applyAgentOverrides(agentsData);
      const departmentsWithCustom = mergeDepartments(departmentsData);
      
      setAgents(agentsWithOverrides);
      setDepartments(departmentsWithCustom);
      
      alert('✅ Data refreshed from local cache');
    } catch (error) {
      console.error('Error refreshing data:', error);
      alert('❌ Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  // Clear local changes
  const handleClearChanges = async () => {
    const changeCount = getChangeCount();
    const message = `This will reset ${changeCount.agentChanges} agent assignments and ${changeCount.customDepartments} custom departments back to what's in your Google Sheet.\n\nAre you sure?`;
    
    if (confirm(message)) {
      clearAllOverrides();
      await handleRefresh();
      alert('✅ Local changes cleared. Data reloaded from source.');
    }
  };

  // Agent department update handler
  const handleAgentDepartmentUpdate = async (agentId: string, departmentId: string) => {
    try {
      saveAgentDepartment(agentId, departmentId);
      
      setAgents(prevAgents => 
        prevAgents.map(agent => 
          agent.id === agentId 
            ? { ...agent, department_id: departmentId }
            : agent
        )
      );
      
      await updateAgentDepartment(agentId, departmentId);
      
      const agent = agents.find(a => a.id === agentId);
      const dept = departments.find(d => d.id === departmentId);
      
      if (agent && dept) {
        console.log(`✅ ${agent.display_name} moved to ${dept.name} (saved to localStorage)`);
      }
    } catch (error) {
      console.error('Error updating agent department:', error);
      alert('❌ Failed to update agent department');
    }
  };

  // Create department handler
  const handleCreateDepartment = async (departmentName: string): Promise<string> => {
    try {
      const newDeptId = `dept-${Date.now()}`;
      const newDepartment = {
        id: newDeptId,
        name: departmentName
      };
      
      saveCustomDepartment(newDepartment);
      setDepartments(prev => [...prev, newDepartment]);
      
      console.log(`✅ Department "${departmentName}" created and saved to localStorage`);
      return newDeptId;
    } catch (error) {
      console.error('Error creating department:', error);
      throw error;
    }
  };

  const changeCount = getChangeCount();

  return (
    <div className="min-h-screen bg-[#F6F9FC]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back to Dashboard"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-500 mt-1">Manage data synchronization and agent assignments</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Local Changes Alert */}
        {(changeCount.agentChanges > 0 || changeCount.customDepartments > 0) && (
          <div className="mb-6 bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-amber-900 mb-2">Unsaved Local Changes</h3>
                <p className="text-sm text-amber-800 mb-3">
                  You have <strong>{changeCount.agentChanges} agent assignment{changeCount.agentChanges !== 1 ? 's' : ''}</strong>
                  {changeCount.customDepartments > 0 && (
                    <> and <strong>{changeCount.customDepartments} custom department{changeCount.customDepartments !== 1 ? 's' : ''}</strong></>
                  )} saved locally. These changes only exist in your browser.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleClearChanges}
                    className="px-4 py-2 text-sm bg-white border-2 border-amber-300 text-amber-900 rounded-lg hover:bg-amber-50 transition-colors font-medium"
                  >
                    Reset to Original
                  </button>
                  <button
                    onClick={() => alert('Push to Google Sheets feature coming soon!')}
                    className="px-4 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                  >
                    Push to Google Sheets
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data Sync Section */}
        <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Data Synchronization</h2>
            <p className="text-sm text-gray-500 mt-1">Keep your dashboard up to date with the latest review data</p>
          </div>
          
          <div className="p-6 space-y-4">
            {/* Refresh Button */}
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Refresh Data</h3>
                <p className="text-sm text-gray-600">Reload from local cache (fast, ~1 second)</p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={loading || syncing}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh Now
                  </>
                )}
              </button>
            </div>

            {/* Sync Button */}
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Sync from Google Sheets</h3>
                <p className="text-sm text-gray-600">Fetch latest data from source (slower, ~10-30 seconds)</p>
                {lastSyncTime && (
                  <p className="text-xs text-gray-500 mt-1">
                    Last synced: {lastSyncTime.toLocaleString()}
                  </p>
                )}
              </div>
              <button
                onClick={handleSync}
                disabled={loading || syncing}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
              >
                {syncing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Syncing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Sync Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Display Preferences Section */}
        <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Display Preferences</h2>
            <p className="text-sm text-gray-500 mt-1">Customize how charts and widgets are displayed</p>
          </div>
          
          <div className="p-6 space-y-4">
            {/* Rating Distribution Widget Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Rating Distribution Widget</h3>
                <p className="text-sm text-gray-600">Show the entire rating distribution section (donut chart, legend, and bar) on the dashboard</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={displayPrefs.showRatingDistribution}
                  onChange={(e) => {
                    const newPrefs = { ...displayPrefs, showRatingDistribution: e.target.checked };
                    setDisplayPrefs(newPrefs);
                    saveDisplayPreferences(newPrefs);
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-900">
                  {displayPrefs.showRatingDistribution ? 'On' : 'Off'}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Performance Tier Guide Section */}
        <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Performance Tier System</h2>
            <p className="text-sm text-gray-500 mt-1">Learn how we rank and evaluate your metrics</p>
          </div>
          
          <div className="p-6">
            <PerformanceTierGuide />
          </div>
        </div>

        {/* Agent Management Section */}
        <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Agent & Department Management</h2>
                <p className="text-sm text-gray-500 mt-1">Assign agents to departments and create custom departments</p>
              </div>
              <button
                onClick={() => setShowAgentManager(!showAgentManager)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {showAgentManager ? 'Hide' : 'Show'} Manager
              </button>
            </div>
          </div>
          
          {showAgentManager && (
            <div className="p-6">
              <AgentDepartmentManager
                agents={agents}
                departments={departments}
                onUpdate={handleAgentDepartmentUpdate}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
