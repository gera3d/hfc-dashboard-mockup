'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
import { 
  getHiddenAgents, 
  unhideAgent,
  subscribeToHiddenAgents
} from '@/lib/supabaseService';
import { AgentDepartmentManager } from '@/components/AgentDepartmentManager';
import PerformanceTierGuide from '@/components/dashboard/PerformanceTierGuide';
import type { Agent, Department } from '@/data/dataService';
import { 
  loadDisplayPreferences, 
  saveDisplayPreferences,
  type DisplayPreferences 
} from '@/lib/displayPreferences';
import { useSyncProgress } from '@/context/SyncContext';
import { SyncProgressIndicator } from '@/components/SyncProgressIndicator';

interface DataStats {
  current: number;
  historical: number;
  historical1: number;
  historical2: number;
  total: number;
  lastUpdated: string | null;
  sources?: Array<{ name: string; count: number }>;
}

export default function SettingsPage() {
  const router = useRouter();
  const { syncStatus, startSync } = useSyncProgress();
  const [loading, setLoading] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const lastSyncAttemptRef = useRef<number>(0);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showAgentManager, setShowAgentManager] = useState(false);
  const [displayPrefs, setDisplayPrefs] = useState<DisplayPreferences>({ showRatingDistribution: false });
  const [dataStats, setDataStats] = useState<DataStats | null>(null);
  const [hiddenAgents, setHiddenAgents] = useState<string[]>([]);

  // Load data stats on mount only
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/cached-data', { 
          cache: 'default',
          headers: { 'Accept': 'application/json' }
        });
        const data = await response.json();
        if (data.stats) {
          setDataStats({
            current: data.stats.current || 0,
            historical: data.stats.historical || 0,
            historical1: data.stats.historical1 || 0,
            historical2: data.stats.historical2 || 0,
            total: data.stats.total || data.stats.lines - 1 || 0,
            lastUpdated: data.lastUpdated,
            sources: data.stats.sources || []
          });
        }
      } catch (error) {
        console.error('Failed to fetch data stats:', error);
      }
    };
    fetchStats();
  }, []); // Only on mount

  // Load display preferences
  useEffect(() => {
    setDisplayPrefs(loadDisplayPreferences());
    
    // Load hidden agents from Supabase
    const loadHidden = async () => {
      console.log('📥 Loading hidden agents from Supabase...')
      const hidden = await getHiddenAgents()
      console.log('📊 Hidden agents loaded:', hidden)
      setHiddenAgents(hidden)
    }
    loadHidden()
    
    // Subscribe to real-time changes
    console.log('🔔 Subscribing to real-time hidden agent changes...')
    const unsubscribe = subscribeToHiddenAgents((hiddenAgents) => {
      console.log('🔄 Real-time update - hidden agents changed:', hiddenAgents)
      setHiddenAgents(hiddenAgents)
    })
    
    return () => {
      console.log('🔕 Unsubscribing from hidden agents')
      unsubscribe()
    }
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

  // Sync from Google Sheets (using background sync)
  const handleSync = async () => {
    // Prevent accidental rapid clicks (3 second cooldown)
    const now = Date.now();
    const timeSinceLastAttempt = now - lastSyncAttemptRef.current;
    
    if (timeSinceLastAttempt < 3000) {
      console.log('Sync cooldown active - please wait', Math.ceil((3000 - timeSinceLastAttempt) / 1000), 'seconds');
      return;
    }
    
    lastSyncAttemptRef.current = now;
    await startSync();
  };

  // Handle sync completion - reload data
  const handleSyncComplete = useCallback(async (success: boolean) => {
    if (success) {
      setLastSyncTime(new Date());
      
      // Reload data after successful sync
      const [agentsData, departmentsData] = await Promise.all([
        refreshAgents(),
        refreshDepartments()
      ]);
      
      const agentsWithOverrides = applyAgentOverrides(agentsData);
      const departmentsWithCustom = mergeDepartments(departmentsData);
      
      setAgents(agentsWithOverrides);
      setDepartments(departmentsWithCustom);
    }
  }, []); // Empty dependencies - this function doesn't need to change

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
  
  const handleUnhideAgent = async (agentId: string) => {
    console.log('👁️ Unhiding agent:', agentId)
    const success = await unhideAgent(agentId);
    if (success) {
      const hidden = await getHiddenAgents();
      console.log('✅ Agent unhidden, new hidden list:', hidden)
      setHiddenAgents(hidden);
      alert('Agent is now visible on the dashboard')
    } else {
      alert('Failed to unhide agent. Check console for errors.')
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
            {/* Progress Indicator */}
            <SyncProgressIndicator onSyncComplete={handleSyncComplete} />
            
            {/* Refresh Button */}
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Refresh Data</h3>
                <p className="text-sm text-gray-600">Reload from local cache (fast, ~1 second)</p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={loading || syncStatus.isActive}
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
                disabled={loading || syncStatus.isActive}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
              >
                {syncStatus.isActive ? (
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

        {/* Historical Data Sources Section */}
        <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Historical Data Sources</h2>
            <p className="text-sm text-gray-500 mt-1">Add older versions of review data for multi-source syncing</p>
          </div>
          
          <div className="p-6 space-y-4">
            {/* Info Box */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Multi-Source Sync</p>
                  <p>Paste published CSV URLs from older Google Sheets below. Each source will be downloaded, parsed, and merged during sync. The parser automatically adapts to different column structures and normalizes agent names.</p>
                </div>
              </div>
            </div>

            {/* Primary Source Info */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <h3 className="font-semibold text-gray-900">Primary Source (Active)</h3>
                </div>
                {dataStats && (
                  <div className="text-xs text-gray-500">
                    {dataStats.lastUpdated && `Last synced: ${new Date(dataStats.lastUpdated).toLocaleString()}`}
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 ml-5">Current reviews via Google Sheets API</p>
              <p className="text-xs text-gray-500 ml-5 mt-1">Sheet ID: {process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID || '10ooffH9z...'}</p>
              {dataStats && dataStats.current > 0 && (
                <div className="ml-5 mt-2 flex items-center gap-4 text-xs">
                  <span className="text-blue-600 font-semibold">{dataStats.current.toLocaleString()} reviews</span>
                </div>
              )}
            </div>

            {/* Historical Source (if loaded) */}
            {dataStats && dataStats.historical1 > 0 && (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <h3 className="font-semibold text-gray-900">Historical Archive 1</h3>
                </div>
                <p className="text-sm text-gray-600 ml-5">May 2024 archive</p>
                <p className="text-xs text-gray-500 ml-5 mt-1">Sheet ID: 1HyHHtJNqlldacYkMYbBOlaKKrf29yDDD9jETLt_mJ0o</p>
                <div className="ml-5 mt-2 flex items-center gap-4 text-xs">
                  <span className="text-purple-600 font-semibold">{dataStats.historical1.toLocaleString()} reviews</span>
                </div>
              </div>
            )}

            {dataStats && dataStats.historical2 > 0 && (
              <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <h3 className="font-semibold text-gray-900">Historical Archive 2</h3>
                </div>
                <p className="text-sm text-gray-600 ml-5">Older data archive</p>
                <p className="text-xs text-gray-500 ml-5 mt-1">Sheet ID: 1jyyjA44sLgfzkwVUTF5s9a61jeboF4NXpHSC3CZZOPE</p>
                <div className="ml-5 mt-2 flex items-center gap-4 text-xs">
                  <span className="text-indigo-600 font-semibold">{dataStats.historical2.toLocaleString()} reviews</span>
                </div>
              </div>
            )}

            {/* Combined Total */}
            {dataStats && dataStats.total > 0 && (
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Combined Dataset</h3>
                    <p className="text-sm text-gray-600">All sources merged and ready for analysis</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-600">{dataStats.total.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">total reviews</div>
                  </div>
                </div>
              </div>
            )}

            {/* Historical Sources Placeholder */}
            <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg text-center">
              <svg className="w-12 h-12 text-amber-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <h4 className="font-semibold text-gray-900 mb-2">Ready to Add Historical Sources</h4>
              <p className="text-sm text-gray-600 mb-4">
                Share your historical CSV URLs to enable multi-source syncing.<br />
                Each source will be scanned and merged automatically.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-amber-300 rounded-lg text-sm text-amber-900">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Configuration will be added when URLs are provided
              </div>
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

        {/* Hidden Agents Section */}
        <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Hidden Agents</h2>
            <p className="text-sm text-gray-500 mt-1">Agents hidden from the dashboard appear here</p>
          </div>
          
          <div className="p-6">
            {hiddenAgents.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <p className="text-gray-500 font-medium">No hidden agents</p>
                <p className="text-sm text-gray-400 mt-1">You can hide agents from their profile page</p>
              </div>
            ) : (
              <div className="space-y-3">
                {hiddenAgents.map(agentId => {
                  const agent = agents.find(a => a.id === agentId);
                  const department = departments.find(d => d.id === agent?.department_id);
                  
                  if (!agent) return null;
                  
                  return (
                    <div key={agentId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                          <img
                            src={agent.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.display_name)}&background=0066cc&color=fff&size=128`}
                            alt={agent.display_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.display_name)}&background=0066cc&color=fff&size=128`;
                            }}
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{agent.display_name}</h3>
                          <p className="text-sm text-gray-500">{department?.name || 'Unknown Department'}</p>
                          <p className="text-xs text-gray-400">ID: {agent.agent_key}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => router.push(`/agent/${agentId}`)}
                          className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => handleUnhideAgent(agentId)}
                          className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Show on Dashboard
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
