"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { Certificate } from "./certificates";
import type { LearningItem } from "./learning";

/**
 * Opt-in sync. Nothing here runs until the learner picks categories on /sync and presses
 * Apply. The browser talks only to CertiFree's own /api routes using the HttpOnly session
 * cookie; it never sees a Supabase key or token.
 */
export type Categories = { bookmarks: boolean; learning: boolean; certificates: boolean; files: boolean };
export type SyncSettings = Categories & { userId: string };
export type Me = { enabled: boolean; signedIn: boolean; userId?: string };

const KEY = "certifree:sync";
const PROBLEM = "certifree:sync-problem";
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());
let cache: string | null | undefined;

function raw() {
  if (cache === undefined) {
    try {
      cache = localStorage.getItem(KEY);
    } catch {
      cache = null;
    }
  }
  return cache;
}

export function readSettings(): SyncSettings | null {
  try {
    const r = raw();
    return r ? (JSON.parse(r) as SyncSettings) : null;
  } catch {
    return null;
  }
}

export function writeSettings(s: SyncSettings | null) {
  cache = s ? JSON.stringify(s) : null;
  try {
    if (s) localStorage.setItem(KEY, cache!);
    else localStorage.removeItem(KEY);
  } catch {}
  notify();
}

export function useSyncSettings() {
  const r = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    raw,
    () => null,
  );
  return r ? (JSON.parse(r) as SyncSettings) : null;
}

// ---------- who is signed in (from our own server, no tokens) ----------
let mePromise: Promise<Me> | null = null;
export function fetchMe(force = false): Promise<Me> {
  if (!mePromise || force) {
    mePromise = fetch("/api/me", { cache: "no-store", credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : { enabled: false, signedIn: false }))
      .catch(() => ({ enabled: false, signedIn: false }));
  }
  return mePromise;
}

export function useMe(): Me | null {
  const [me, setMe] = useState<Me | null>(null);
  useEffect(() => {
    let live = true;
    fetchMe().then((m) => live && setMe(m));
    return () => {
      live = false;
    };
  }, []);
  return me;
}

/** Sync is active for a category only for the same account that turned it on. */
export function activeFor(s: SyncSettings | null, me: Me | null, cat: keyof Categories) {
  return !!s && !!me?.signedIn && me.userId === s.userId && s[cat];
}

async function isActive(cat: keyof Categories) {
  return activeFor(readSettings(), await fetchMe(), cat);
}

// ---------- problems: never resolved silently, the learner reviews them on /sync ----------
export function markSyncProblem() {
  try {
    localStorage.setItem(PROBLEM, "1");
  } catch {}
  notify();
}
export function clearSyncProblem() {
  try {
    localStorage.removeItem(PROBLEM);
  } catch {}
  notify();
}
export function hasSyncProblem() {
  try {
    return localStorage.getItem(PROBLEM) === "1";
  } catch {
    return false;
  }
}

// ---------- API calls ----------
export async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
    headers: init?.body && !(init.body instanceof FormData) ? { "content-type": "application/json" } : undefined,
  });
  if (!res.ok) throw new Error(`sync ${res.status}`);
  return res;
}

export const cloud = {
  bookmarks: (add: string[], remove: string[]) => api("/api/bookmarks", { method: "POST", body: JSON.stringify({ add, remove }) }),
  learning: (item: LearningItem) => api(`/api/learning/${encodeURIComponent(item.courseId)}`, { method: "PUT", body: JSON.stringify(item) }),
  learningDelete: (courseId: string) => api(`/api/learning/${encodeURIComponent(courseId)}`, { method: "DELETE" }),
  certificate: (c: Certificate) => api(`/api/certificates/${encodeURIComponent(c.id)}`, { method: "PUT", body: JSON.stringify(c) }),
  certificateDelete: (id: string) => api(`/api/certificates/${encodeURIComponent(id)}`, { method: "DELETE" }),
  file: (id: string, blob: Blob, name: string) => {
    const fd = new FormData();
    fd.append("file", blob, name);
    return api(`/api/certificates/${encodeURIComponent(id)}/file`, { method: "POST", body: fd });
  },
  fileDelete: (id: string) => api(`/api/certificates/${encodeURIComponent(id)}/file`, { method: "DELETE" }),
  fileGet: (id: string) => api(`/api/certificates/${encodeURIComponent(id)}/file`).then((r) => r.blob()),
};

async function safely(cat: keyof Categories, fn: () => Promise<unknown>) {
  try {
    if (await isActive(cat)) await fn();
  } catch {
    markSyncProblem();
  }
}

// Called by the local stores after a change the learner made on this device.
export const push = {
  bookmark: (id: string, saved: boolean) => safely("bookmarks", () => cloud.bookmarks(saved ? [id] : [], saved ? [] : [id])),
  learning: (item: LearningItem) => safely("learning", () => cloud.learning(item)),
  learningDelete: (courseId: string) => safely("learning", () => cloud.learningDelete(courseId)),
  certificate: (c: Certificate, file?: Blob | null) =>
    safely("certificates", async () => {
      await cloud.certificate(c);
      if (file && (await isActive("files"))) await cloud.file(c.id, file, c.fileName ?? "certificate");
    }),
  certificateDelete: (id: string) => safely("certificates", () => cloud.certificateDelete(id)),
};
