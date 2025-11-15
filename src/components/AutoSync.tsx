'use client';

import { useEffect, useRef } from 'react';

const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const CHECK_INTERVAL_MS = 60 * 60 * 1000; // Check every hour
const INITIAL_DELAY_MS = 10000; // Wait 10 seconds after page load

export default function AutoSync() {
  const syncInProgressRef = useRef(false);
  const hasInitializedRef = useRef(false); // Prevent multiple initializations

  useEffect(() => {
    // Prevent multiple initializations from hot reloads
    if (hasInitializedRef.current) {
      console.log('[AutoSync] Already initialized, skipping');
      return;
    }
    hasInitializedRef.current = true;

    const checkAndSync = async () => {
      // Don't start another sync if one is already in progress
      if (syncInProgressRef.current) {
        console.log('[AutoSync] Sync already in progress, skipping');
        return;
      }

      try {
        // Get last sync time from localStorage
        const lastSyncTime = localStorage.getItem('lastAutoSyncTime');
        const now = Date.now();

        // If never synced or more than 24 hours, trigger sync
        if (!lastSyncTime || now - parseInt(lastSyncTime) > ONE_DAY_MS) {
          console.log('[AutoSync] 🔄 Starting automatic daily sync...');
          syncInProgressRef.current = true;

          // Trigger background sync (fire and forget - don't block UI)
          fetch('/api/sync-sheets-bg', {
            method: 'POST',
          })
            .then(response => {
              if (!response.ok) {
                throw new Error('Sync request failed');
              }
              return response.json();
            })
            .then(({ syncId }) => {
              // Poll in background without blocking
              pollSyncStatus(syncId, now);
            })
            .catch(error => {
              console.error('[AutoSync] Failed to start sync:', error);
              syncInProgressRef.current = false;
              // Set timestamp anyway to prevent immediate retry
              localStorage.setItem('lastAutoSyncTime', now.toString());
            });
        } else {
          const timeUntilNext = ONE_DAY_MS - (now - parseInt(lastSyncTime));
          const hoursUntilNext = Math.floor(timeUntilNext / (60 * 60 * 1000));
          console.log(`[AutoSync] ⏸️ Next sync in ~${hoursUntilNext} hours`);
        }
      } catch (error) {
        console.error('[AutoSync] Error during auto-sync check:', error);
        syncInProgressRef.current = false;
      }
    };

    const pollSyncStatus = async (syncId: string, startTime: number) => {
      let complete = false;
      let attempts = 0;
      const maxAttempts = 180; // 3 minutes max

      while (!complete && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          const statusResponse = await fetch(`/api/sync-sheets-bg?syncId=${syncId}`);
          
          // Handle 404 - sync was cleaned up or completed
          if (statusResponse.status === 404) {
            console.log('[AutoSync] ✅ Sync completed (status file cleaned up)');
            localStorage.setItem('lastAutoSyncTime', startTime.toString());
            complete = true;
            syncInProgressRef.current = false;
            break;
          }
          
          if (!statusResponse.ok) {
            console.error('[AutoSync] ❌ Sync status check failed:', statusResponse.status);
            // Set timestamp to prevent immediate retry
            localStorage.setItem('lastAutoSyncTime', startTime.toString());
            complete = true;
            syncInProgressRef.current = false;
            break;
          }

          const status = await statusResponse.json();

          if (status.status === 'complete') {
            console.log('[AutoSync] ✅ Automatic sync completed successfully');
            localStorage.setItem('lastAutoSyncTime', startTime.toString());
            complete = true;
            syncInProgressRef.current = false;
          } else if (status.status === 'error') {
            console.error('[AutoSync] ❌ Automatic sync failed:', status.error);
            // Set timestamp anyway to prevent immediate retry
            localStorage.setItem('lastAutoSyncTime', startTime.toString());
            complete = true;
            syncInProgressRef.current = false;
          }
        } catch (error) {
          console.error('[AutoSync] Error polling sync status:', error);
          // Set timestamp to prevent immediate retry
          localStorage.setItem('lastAutoSyncTime', startTime.toString());
          complete = true;
          syncInProgressRef.current = false;
        }

        attempts++;
      }

      if (!complete) {
        console.error('[AutoSync] ⏰ Automatic sync timed out');
        // Set timestamp anyway to prevent immediate retry
        localStorage.setItem('lastAutoSyncTime', startTime.toString());
        syncInProgressRef.current = false;
      }
    };

    // OPTIMIZATION: Delay initial check by 10 seconds to not block page load
    const initialTimeout = setTimeout(checkAndSync, INITIAL_DELAY_MS);

    // Then check every hour
    const interval = setInterval(checkAndSync, CHECK_INTERVAL_MS);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  // This component doesn't render anything
  return null;
}
