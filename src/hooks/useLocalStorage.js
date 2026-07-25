import { useState, useEffect, useCallback } from "react";

/**
 * useState-like hook that persists state to localStorage.
 * Handles SSR, corrupt data, and quota errors gracefully.
 *
 * Uses a useEffect to sync changes to localStorage so the setter
 * can use React's functional updates without closure staleness.
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // Sync to localStorage whenever the value changes
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (err) {
      console.warn(`Failed to save "${key}" to localStorage:`, err);
    }
  }, [key, storedValue]);

  // Return a stable setter that delegates to React's setState
  const setValue = useCallback((value) => {
    setStoredValue((prev) =>
      typeof value === "function" ? value(prev) : value,
    );
  }, []);

  return [storedValue, setValue];
}
