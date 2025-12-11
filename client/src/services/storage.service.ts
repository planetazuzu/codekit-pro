/**
 * LocalStorage service with type safety and error handling
 */

import { STORAGE_KEYS } from "@/lib/constants";

class StorageService {
  /**
   * Get item from localStorage
   */
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      return JSON.parse(item) as T;
    } catch (error) {
      // Silently handle localStorage errors (may be disabled in private mode)
      return null;
    }
  }

  /**
   * Set item in localStorage
   */
  set<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      // Silently handle localStorage errors (may be disabled in private mode)
      return false;
    }
  }

  /**
   * Remove item from localStorage
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      // Silently handle localStorage errors (may be disabled in private mode)
    }
  }

  /**
   * Clear all localStorage
   */
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      // Silently handle localStorage errors (may be disabled in private mode)
    }
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }

  // Convenience methods for common keys
  getFavorites(): Array<{ type: string; id: string }> {
    return this.get<Array<{ type: string; id: string }>>(STORAGE_KEYS.FAVORITES) || [];
  }

  setFavorites(favorites: Array<{ type: string; id: string }>): boolean {
    return this.set(STORAGE_KEYS.FAVORITES, favorites);
  }

  getAdminSession(): boolean {
    return this.get<boolean>(STORAGE_KEYS.ADMIN_SESSION) || false;
  }

  setAdminSession(authenticated: boolean): boolean {
    return this.set(STORAGE_KEYS.ADMIN_SESSION, authenticated);
  }

  getTheme(): string | null {
    return this.get<string>(STORAGE_KEYS.THEME);
  }

  setTheme(theme: string): boolean {
    return this.set(STORAGE_KEYS.THEME, theme);
  }
}

export const storageService = new StorageService();

