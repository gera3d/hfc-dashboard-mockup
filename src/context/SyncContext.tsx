'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

export interface SyncStatus {
  isActive: boolean;
  status: 'idle' | 'downloading' | 'processing' | 'saving' | 'complete' | 'error';
  progress: number;
  message: string;
  error?: string;
  lastUpdated?: string;
  stats?: {
    size: number;
    lines: number;
  };
}

interface SyncContextType {
  syncStatus: SyncStatus;
  startSync: () => Promise<void>;
  dismissComplete: () => void;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

const INITIAL_STATUS: SyncStatus = {
  isActive: false,
  status: 'idle',
  progress: 0,
  message: '',
};

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(INITIAL_STATUS);
  const [syncId, setSyncId] = useState<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const syncStatusRef = useRef<SyncStatus>(INITIAL_STATUS);
  const syncLockRef = useRef<boolean>(false); // Prevent concurrent syncs
  
  // Keep ref in sync with state
  React.useEffect(() => {
    syncStatusRef.current = syncStatus;
  }, [syncStatus]);

  // Poll for sync status
  const pollStatus = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/sync-sheets-bg?syncId=${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to get sync status');
      }

      const status = await response.json();
      
      setSyncStatus({
        isActive: status.status !== 'complete' && status.status !== 'error',
        status: status.status,
        progress: status.progress,
        message: status.message,
        error: status.error,
        lastUpdated: status.lastUpdated,
        stats: status.stats,
      });

      // Stop polling if complete or error
      if (status.status === 'complete' || status.status === 'error') {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        setSyncId(null);
        // Release lock when sync completes or errors
        syncLockRef.current = false;
      }
    } catch (error) {
      console.error('Error polling sync status:', error);
      setSyncStatus({
        isActive: false,
        status: 'error',
        progress: 0,
        message: 'Failed to check sync status',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      setSyncId(null);
      // Release lock on polling error
      syncLockRef.current = false;
    }
  }, []);

  // Start sync
  const startSync = useCallback(async () => {
    try {
      // Prevent concurrent syncs with a lock
      if (syncLockRef.current || syncStatusRef.current.isActive) {
        console.log('Sync already in progress - ignoring duplicate request');
        return;
      }

      // Acquire lock immediately
      syncLockRef.current = true;

      setSyncStatus({
        isActive: true,
        status: 'idle',
        progress: 0,
        message: 'Starting sync...',
      });

      const response = await fetch('/api/sync-sheets-bg', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to start sync');
      }

      const result = await response.json();
      const newSyncId = result.syncId;
      setSyncId(newSyncId);

      // Start polling for status
      pollIntervalRef.current = setInterval(() => {
        pollStatus(newSyncId);
      }, 1000); // Poll every second

      // Initial poll
      pollStatus(newSyncId);
    } catch (error) {
      console.error('Error starting sync:', error);
      setSyncStatus({
        isActive: false,
        status: 'error',
        progress: 0,
        message: 'Failed to start sync',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      // Release lock on error
      syncLockRef.current = false;
    }
  }, [pollStatus]);

  // Dismiss completion message
  const dismissComplete = useCallback(() => {
    setSyncStatus(INITIAL_STATUS);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  return (
    <SyncContext.Provider value={{ syncStatus, startSync, dismissComplete }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSyncProgress() {
  const context = useContext(SyncContext);
  if (context === undefined) {
    throw new Error('useSyncProgress must be used within a SyncProvider');
  }
  return context;
}
