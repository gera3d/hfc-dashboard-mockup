'use client';

import { useEffect, useRef } from 'react';

const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const CHECK_INTERVAL_MS = 60 * 60 * 1000; // Check every hour

export default function AutoSync() {
  const syncInProgressRef = useRef(false);

  useEffect(() => {
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

          // Trigger background sync
          const response = await fetch('/api/sync-sheets-bg', {
            method: 'POST',
          });

          if (!response.ok) {
            throw new Error('Sync request failed');
          }

          const { syncId } = await response.json();

          // Poll for completion
          let complete = false;
          let attempts = 0;
          const maxAttempts = 180; // 3 minutes max (180 * 1 second)

          while (!complete && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const statusResponse = await fetch(`/api/sync-sheets-bg?syncId=${syncId}`);
            const status = await statusResponse.json();

            if (status.status === 'complete') {
              console.log('[AutoSync] ✅ Automatic sync completed successfully');
              localStorage.setItem('lastAutoSyncTime', now.toString());
              complete = true;
            } else if (status.status === 'error') {
              console.error('[AutoSync] ❌ Automatic sync failed:', status.error);
              complete = true;
            }

            attempts++;
          }

          if (!complete) {
            console.error('[AutoSync] ⏰ Automatic sync timed out');
          }

          syncInProgressRef.current = false;
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

    // Check immediately on mount
    checkAndSync();

    // Then check every hour
    const interval = setInterval(checkAndSync, CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  // This component doesn't render anything
  return null;
}
