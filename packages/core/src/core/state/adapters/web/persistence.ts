/**
 * Web LocalStorage Persistence Adapter
 *
 * Implements PersistenceAdapter interface for web browsers using localStorage.
 *
 * @module core/state/adapters/web/persistence
 */

import type { PersistenceAdapter, SaveData } from '../../types';

export class WebPersistenceAdapter implements PersistenceAdapter {
  async save<T>(key: string, data: SaveData<T>): Promise<boolean> {
    try {
      if (typeof localStorage === 'undefined') {
        console.warn('localStorage is not available');
        return false;
      }

      const jsonString = JSON.stringify(data);
      localStorage.setItem(key, jsonString);
      return true;
    } catch (error) {
      console.error('Failed to save state:', error);
      return false;
    }
  }

  async load<T>(key: string): Promise<SaveData<T> | null> {
    try {
      if (typeof localStorage === 'undefined') {
        return null;
      }

      const jsonString = localStorage.getItem(key);
      if (!jsonString) return null;

      return JSON.parse(jsonString) as SaveData<T>;
    } catch (error) {
      console.error('Failed to load state:', error);
      return null;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      if (typeof localStorage === 'undefined') {
        return false;
      }

      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Failed to delete save:', error);
      return false;
    }
  }

  async listSaves(prefix: string): Promise<string[]> {
    const saves: string[] = [];

    if (typeof localStorage === 'undefined') {
      return saves;
    }

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        // Check for prefix with underscore to avoid matching unrelated keys
        const prefixWithSeparator = `${prefix}_`;
        if (key?.startsWith(prefixWithSeparator)) {
          saves.push(key.slice(prefixWithSeparator.length));
        }
      }
    } catch (error) {
      console.error('Failed to list saves:', error);
    }

    return saves;
  }

  async getSaveInfo(key: string): Promise<{ timestamp: number; version: number } | null> {
    try {
      const saveData = await this.load<unknown>(key);
      if (!saveData) return null;

      return {
        timestamp: saveData.timestamp,
        version: saveData.version,
      };
    } catch (error) {
      console.error('Failed to get save info:', error);
      return null;
    }
  }
}

export const webPersistenceAdapter = new WebPersistenceAdapter();

export function createWebPersistenceAdapter(): PersistenceAdapter {
  return new WebPersistenceAdapter();
}
