/**
 * Offline-first storage using IndexedDB via idb-keyval
 * Falls back to localStorage if IndexedDB is unavailable
 */
import { get, set, del, keys } from 'idb-keyval';

const DB_PREFIX = 'expense-tracker:';

class OfflineStorage {
  async get(key) {
    try {
      const val = await get(DB_PREFIX + key);
      return val !== undefined ? { key, value: val } : null;
    } catch (e) {
      // Fallback to localStorage
      try {
        const val = localStorage.getItem(DB_PREFIX + key);
        return val !== null ? { key, value: val } : null;
      } catch (e2) {
        return null;
      }
    }
  }

  async set(key, value) {
    try {
      await set(DB_PREFIX + key, value);
      return { key, value };
    } catch (e) {
      try {
        localStorage.setItem(DB_PREFIX + key, value);
        return { key, value };
      } catch (e2) {
        return null;
      }
    }
  }

  async delete(key) {
    try {
      await del(DB_PREFIX + key);
      return { key, deleted: true };
    } catch (e) {
      try {
        localStorage.removeItem(DB_PREFIX + key);
        return { key, deleted: true };
      } catch (e2) {
        return null;
      }
    }
  }

  async list(prefix = '') {
    try {
      const allKeys = await keys();
      const filtered = allKeys
        .filter((k) => typeof k === 'string' && k.startsWith(DB_PREFIX + prefix))
        .map((k) => k.slice(DB_PREFIX.length));
      return { keys: filtered };
    } catch (e) {
      return { keys: [] };
    }
  }
}

export const storage = new OfflineStorage();
