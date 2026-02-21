import { useState, useCallback } from 'react';

const noop = () => {};

/**
 * @param {string} key - localStorage key
 * @param {any} initialValue - value if key is missing
 * @returns {[any, (value: any) => void]}
 */
export function useLocalStorage(key, initialValue) {
  const [stored, setStored] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item != null ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        const toStore = value instanceof Function ? value(stored) : value;
        setStored(toStore);
        window.localStorage.setItem(key, JSON.stringify(toStore));
      } catch (e) {
        if (typeof console !== 'undefined' && console.error) console.error(e);
      }
    },
    [key, stored]
  );

  return [stored, setValue];
}
