'use client';

import React, { useEffect } from 'react';
import { useSyncProgress } from '@/context/SyncContext';
import { CheckCircle, XCircle, Loader2, Download, Database, Save } from 'lucide-react';

interface SyncProgressIndicatorProps {
  /** Show full details or compact version */
  variant?: 'full' | 'compact';
  /** Optional callback when sync completes */
  onSyncComplete?: (success: boolean) => void;
}

export function SyncProgressIndicator({ 
  variant = 'full',
  onSyncComplete 
}: SyncProgressIndicatorProps) {
  const { syncStatus, dismissComplete } = useSyncProgress();

  // Call onSyncComplete when sync finishes
  useEffect(() => {
    if (syncStatus.status === 'complete' && onSyncComplete) {
      onSyncComplete(true);
    } else if (syncStatus.status === 'error' && onSyncComplete) {
      onSyncComplete(false);
    }
  }, [syncStatus.status, onSyncComplete]);

  // Don't render anything if not syncing and not complete/error
  if (!syncStatus.isActive && syncStatus.status === 'idle') {
    return null;
  }

  const getStatusIcon = () => {
    switch (syncStatus.status) {
      case 'downloading':
        return <Download className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'processing':
        return <Database className="w-5 h-5 text-purple-500 animate-pulse" />;
      case 'saving':
        return <Save className="w-5 h-5 text-orange-500 animate-pulse" />;
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (syncStatus.status) {
      case 'downloading':
        return 'bg-blue-50 border-blue-200';
      case 'processing':
        return 'bg-purple-50 border-purple-200';
      case 'saving':
        return 'bg-orange-50 border-orange-200';
      case 'complete':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getProgressBarColor = () => {
    switch (syncStatus.status) {
      case 'downloading':
        return 'bg-blue-500';
      case 'processing':
        return 'bg-purple-500';
      case 'saving':
        return 'bg-orange-500';
      case 'complete':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getStatusColor()} transition-all`}>
        {getStatusIcon()}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {syncStatus.message}
          </p>
        </div>
        {syncStatus.isActive && (
          <div className="text-xs font-semibold text-gray-600">
            {syncStatus.progress}%
          </div>
        )}
        {syncStatus.status === 'complete' && (
          <button
            onClick={dismissComplete}
            className="text-xs text-gray-500 hover:text-gray-700 font-medium"
          >
            Dismiss
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-xl border-2 ${getStatusColor()} p-6 transition-all shadow-sm`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {getStatusIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {syncStatus.status === 'complete' ? 'Sync Complete!' :
             syncStatus.status === 'error' ? 'Sync Failed' :
             'Syncing Data...'}
          </h3>
          
          <p className="text-sm text-gray-600 mb-4">
            {syncStatus.message}
          </p>

          {syncStatus.isActive && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Progress</span>
                <span className="font-semibold">{syncStatus.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${getProgressBarColor()} transition-all duration-300 ease-out rounded-full`}
                  style={{ width: `${syncStatus.progress}%` }}
                />
              </div>
            </div>
          )}

          {syncStatus.status === 'complete' && syncStatus.stats && (
            <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Data Size:</span>
                  <span className="ml-2 font-semibold text-gray-900">
                    {(syncStatus.stats.size / 1024).toFixed(2)} KB
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Records:</span>
                  <span className="ml-2 font-semibold text-gray-900">
                    {syncStatus.stats.lines.toLocaleString()}
                  </span>
                </div>
              </div>
              {syncStatus.lastUpdated && (
                <div className="mt-2 text-xs text-gray-500">
                  Last updated: {new Date(syncStatus.lastUpdated).toLocaleString()}
                </div>
              )}
            </div>
          )}

          {syncStatus.status === 'error' && syncStatus.error && (
            <div className="mt-4 p-3 bg-white rounded-lg border border-red-200">
              <p className="text-sm text-red-600">
                {syncStatus.error}
              </p>
            </div>
          )}

          {syncStatus.status === 'complete' && (
            <button
              onClick={dismissComplete}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Done
            </button>
          )}

          {syncStatus.status === 'error' && (
            <button
              onClick={dismissComplete}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Minimal floating indicator for use in app header/navbar
 */
export function SyncProgressBadge() {
  const { syncStatus } = useSyncProgress();

  if (!syncStatus.isActive && syncStatus.status === 'idle') {
    return null;
  }

  const getBadgeColor = () => {
    switch (syncStatus.status) {
      case 'complete':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="relative">
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${getBadgeColor()} text-white text-sm shadow-lg`}>
        {syncStatus.isActive ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : syncStatus.status === 'complete' ? (
          <CheckCircle className="w-4 h-4" />
        ) : (
          <XCircle className="w-4 h-4" />
        )}
        <span className="font-medium">
          {syncStatus.isActive ? `${syncStatus.progress}%` : 
           syncStatus.status === 'complete' ? 'Synced' : 'Failed'}
        </span>
      </div>
    </div>
  );
}
