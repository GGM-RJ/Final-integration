import { TransferLog } from '../types';

/**
 * A generic function to get an item from localStorage.
 * It handles parsing and initial data seeding if the item doesn't exist.
 * @param key The key in localStorage.
 * @param initialData The initial data to seed if the key is not found.
 */
function getItem<T>(key: string, initialData: T): T {
  try {
    const item = window.localStorage.getItem(key);
    if (item) {
      // Important: Re-hydrate dates which are stored as strings in JSON
      if (key === 'transferHistory') {
          const parsed = JSON.parse(item) as TransferLog[];
          return parsed.map(log => ({...log, date: new Date(log.date)})) as T;
      }
      return JSON.parse(item);
    } else {
      window.localStorage.setItem(key, JSON.stringify(initialData));
      return initialData;
    }
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
    return initialData;
  }
}

/**
 * A generic function to set an item in localStorage.
 * It handles stringifying the data.
 * @param key The key in localStorage.
 * @param value The value to store.
 */
function setItem<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key “${key}”:`, error);
  }
}

export const storageService = {
  getItem,
  setItem,
};