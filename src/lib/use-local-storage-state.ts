"use client";

import { useCallback, useSyncExternalStore } from "react";

type Listener = () => void;
const listeners = new Map<string, Set<Listener>>();

function emit(key: string) {
  listeners.get(key)?.forEach((listener) => listener());
}

function readLocalStorage(key: string, defaultValue: boolean): boolean {
  try {
    const stored = window.localStorage.getItem(key);
    return stored === null ? defaultValue : stored === "true";
  } catch {
    return defaultValue;
  }
}

/**
 * Persists a per-viewer UI convenience (e.g. sidebar collapsed state) across
 * reloads. Storage can be empty or throw (private browsing, blocked site
 * data), so every access is wrapped and the app renders correctly without
 * it. Built on useSyncExternalStore, not an effect + setState: the server
 * and first client render both use `defaultValue` (no hydration mismatch),
 * then React reconciles against the real stored value as soon as the
 * client snapshot is read.
 */
export function useLocalStorageState(key: string, defaultValue: boolean) {
  const subscribe = useCallback(
    (onStoreChange: Listener) => {
      const set = listeners.get(key) ?? new Set();
      set.add(onStoreChange);
      listeners.set(key, set);
      return () => set.delete(onStoreChange);
    },
    [key]
  );
  const getSnapshot = useCallback(
    () => readLocalStorage(key, defaultValue),
    [key, defaultValue]
  );
  const getServerSnapshot = useCallback(() => defaultValue, [defaultValue]);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback(
    (next: boolean) => {
      try {
        window.localStorage.setItem(key, String(next));
      } catch {
        // ignore - per-viewer convenience only
      }
      emit(key);
    },
    [key]
  );

  return [value, setValue] as const;
}
