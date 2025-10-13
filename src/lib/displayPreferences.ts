/**
 * Display Preferences Management
 * 
 * Centralized storage for UI display preferences like chart visibility,
 * widget configurations, etc. Stored in localStorage.
 */

export interface DisplayPreferences {
  showRatingDistribution: boolean;
}

const DISPLAY_PREFS_KEY = 'hfc-display-preferences';

const DEFAULT_PREFERENCES: DisplayPreferences = {
  showRatingDistribution: false, // Off by default
};

/**
 * Load display preferences from localStorage
 */
export const loadDisplayPreferences = (): DisplayPreferences => {
  if (typeof window === 'undefined') {
    return DEFAULT_PREFERENCES;
  }
  
  try {
    const stored = localStorage.getItem(DISPLAY_PREFS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to handle any new preferences added
      return { ...DEFAULT_PREFERENCES, ...parsed };
    }
  } catch (error) {
    console.error('Error loading display preferences:', error);
  }
  
  return DEFAULT_PREFERENCES;
};

/**
 * Save display preferences to localStorage
 */
export const saveDisplayPreferences = (prefs: DisplayPreferences): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(DISPLAY_PREFS_KEY, JSON.stringify(prefs));
    console.log('✅ Display preferences saved:', prefs);
  } catch (error) {
    console.error('Error saving display preferences:', error);
  }
};

/**
 * Reset display preferences to defaults
 */
export const resetDisplayPreferences = (): DisplayPreferences => {
  saveDisplayPreferences(DEFAULT_PREFERENCES);
  return DEFAULT_PREFERENCES;
};
