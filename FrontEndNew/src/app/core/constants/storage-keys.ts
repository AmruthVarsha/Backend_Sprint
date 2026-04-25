/**
 * Storage Keys
 * 
 * Centralized constants for localStorage keys.
 * This prevents typos and makes it easy to change keys in one place.
 */

export const STORAGE_KEYS = {
  // Authentication
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_INFO: 'user_info',
  
  // User Preferences
  THEME: 'theme',
  LANGUAGE: 'language',
  
  // Cart
  CART_ITEMS: 'cart_items',
  
  // Other
  REMEMBER_ME: 'remember_me',
} as const;

// Type for storage keys (for type safety)
export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
