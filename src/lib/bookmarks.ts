"use client";
import { useCallback, useSyncExternalStore } from "react";
import { push } from "./sync";

const KEY = "certifree:bookmarks";
const listeners = new Set<() => void>();
let cache: string[] | null = null;

export function readBookmarks(): string[] {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    cache = [];
  }
  return cache!;
}

/** Replace saved courses on this device only (used when applying a reviewed sync). */
export function setBookmarksLocal(ids: string[]) {
  cache = ids;
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {}
  listeners.forEach((l) => l());
}

const empty: string[] = [];

export function useBookmarks() {
  const ids = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    readBookmarks,
    () => empty,
  );
  const toggle = useCallback((id: string) => {
    const cur = readBookmarks();
    const saved = !cur.includes(id);
    setBookmarksLocal(saved ? [id, ...cur] : cur.filter((x) => x !== id));
    push.bookmark(id, saved);
  }, []);
  return { ids, toggle, has: (id: string) => ids.includes(id) };
}
