// Local storage keys
export const INITIATIVES_STORAGE_KEY = "virgin_initiatives";
export const DASHBOARD_LAYOUT_KEY = "dashboard_layout";
export const USER_PREFERENCES_KEY = "user_preferences";
export const USER_NOTIFICATIONS_KEY = "user_notifications";
export const COLLABORATION_DATA_KEY = "collaboration_data";
export const METRICS_HISTORY_KEY = "metrics_history";

/**
 * Safely get data from localStorage with error handling
 */
export function getFromLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") {
    return defaultValue;
  }
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error getting item ${key} from localStorage:`, error);
    return defaultValue;
  }
}

/**
 * Safely set data to localStorage with error handling
 */
export function setToLocalStorage<T>(key: string, value: T): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error setting item ${key} to localStorage:`, error);
    return false;
  }
}

/**
 * Remove item from localStorage
 */
export function removeFromLocalStorage(key: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing item ${key} from localStorage:`, error);
    return false;
  }
}

/**
 * Clear all data from localStorage
 */
export function clearLocalStorage(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error("Error clearing localStorage:", error);
    return false;
  }
}