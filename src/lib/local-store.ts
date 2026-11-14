"use client";
import { useSyncExternalStore } from "react";

/** A tiny localStorage-backed store that stays on this device. */
export function localStore<T>(key: string, fallback: T) {
  const listeners = new Set<() => void>();
  let cache: T | undefined;
  const read = (): T => {
    if (cache !== undefined) return cache;
    try {
      const raw = localStorage.getItem(key);
      cache = raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      cache = fallback;
    }
    return cache;
  };
  const write = (v: T) => {
    cache = v;
    try {
      if (v === fallback) localStorage.removeItem(key);
      else localStorage.setItem(key, JSON.stringify(v));
    } catch {}
    listeners.forEach((l) => l());
  };
  const subscribe = (cb: () => void) => {
    listeners.add(cb);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) {
        cache = undefined;
        cb();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(cb);
      window.removeEventListener("storage", onStorage);
    };
  };
  const use = () => useSyncExternalStore(subscribe, read, () => fallback);
  return { read, write, use };
}
