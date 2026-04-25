import { Injectable } from '@angular/core';

/**
 * Storage Service
 * 
 * A safe wrapper around browser's localStorage.
 * Handles JSON serialization/deserialization and error handling.
 * 
 * Usage:
 *   storageService.setItem('token', 'abc123');
 *   const token = storageService.getItem<string>('token');
 */
@Injectable({
  providedIn: 'root' // This makes it a singleton service available app-wide
})
export class StorageService {

  constructor() { }

  /**
   * Store an item in localStorage
   * @param key - The key to store the value under
   * @param value - The value to store (will be JSON stringified)
   */
  setItem(key: string, value: any): void {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error(`Error saving to localStorage (key: ${key}):`, error);
    }
  }

  /**
   * Retrieve an item from localStorage
   * @param key - The key to retrieve
   * @returns The parsed value or null if not found
   */
  getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return null;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error reading from localStorage (key: ${key}):`, error);
      return null;
    }
  }

  /**
   * Remove an item from localStorage
   * @param key - The key to remove
   */
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage (key: ${key}):`, error);
    }
  }

  /**
   * Clear all items from localStorage
   */
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  /**
   * Check if a key exists in localStorage
   * @param key - The key to check
   * @returns true if the key exists, false otherwise
   */
  hasItem(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }
}
