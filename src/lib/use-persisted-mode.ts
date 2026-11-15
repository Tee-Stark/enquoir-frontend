"use client";

import { useCallback, useSyncExternalStore } from "react";

type Listener = () => void;
const listeners = new Map<string, Set<Listener>>();

// When localStorage throws (blocked site data, private-mode quota, etc.)
// setValue can't persist a change, but the toggle still needs to reflect
// it for the rest of this page's life - otherwise a viewer with storage
// blocked could never leave defaultValue no matter what they click.
const memoryFallback = new Map<string, string>();

function emit(key: string) {
  listeners.get(key)?.forEach((listener) => listener());
}

function readValue<T extends string>(key: string, valid: readonly T[], defaultValue: T): T {
  try {
    const stored = window.localStorage.getItem(key);
    if (stored !== null && (valid as readonly string[]).includes(stored)) {
      return stored as T;
    }
  } catch {
    // fall through to the in-memory fallback below
  }
  const fallback = memoryFallback.get(key);
  if (fallback !== undefined && (valid as readonly string[]).includes(fallback)) {
    return fallback as T;
  }
  return defaultValue;
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
  const getSnapshot = useCallback(() => readValue(key, valid, defaultValue), [key, valid, defaultValue]);
  const getServerSnapshot = useCallback(() => defaultValue, [defaultValue]);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback(
    (next: T) => {
      memoryFallback.set(key, next);
      try {
        window.localStorage.setItem(key, next);
      } catch {
        // ignore - memoryFallback above still makes this reload work
      }
      emit(key);
    },
    [key]
  );

  return [value, setValue] as const;
}
