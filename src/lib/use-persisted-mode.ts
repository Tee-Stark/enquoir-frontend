"use client";

import { useCallback, useSyncExternalStore } from "react";

type Listener = () => void;
const listeners = new Map<string, Set<Listener>>();

function emit(key: string) {
  listeners.get(key)?.forEach((listener) => listener());
}

function readLocalStorage<T extends string>(key: string, valid: readonly T[], defaultValue: T): T {
  try {
    const stored = window.localStorage.getItem(key);
    return stored !== null && (valid as readonly string[]).includes(stored) ? (stored as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Persists a per-viewer UI mode (e.g. the Payments/Activity pages'
 * Treasury/Merchant toggle) across reloads. Same useSyncExternalStore
 * shape as useLocalStorageState, generalised to a string enum instead
 * of a boolean - kept as a separate hook rather than widening that one
 * so its one existing consumer (the sidebar's collapsed state) is
 * untouched.
 */
export function usePersistedMode<T extends string>(key: string, valid: readonly T[], defaultValue: T) {
  const subscribe = useCallback(
    (onStoreChange: Listener) => {
      const set = listeners.get(key) ?? new Set();
      set.add(onStoreChange);
      listeners.set(key, set);
      return () => set.delete(onStoreChange);
    },
    [key]
  );
  const getSnapshot = useCallback(() => readLocalStorage(key, valid, defaultValue), [key, valid, defaultValue]);
  const getServerSnapshot = useCallback(() => defaultValue, [defaultValue]);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback(
    (next: T) => {
      try {
        window.localStorage.setItem(key, next);
      } catch {
        // ignore - per-viewer convenience only
      }
      emit(key);
    },
    [key]
  );

  return [value, setValue] as const;
}
