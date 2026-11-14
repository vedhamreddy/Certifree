"use client";
import { useCallback, useSyncExternalStore } from "react";

/** A certificate the user earned. Metadata lives in localStorage; files live in IndexedDB. */
export type Certificate = {
  id: string;
  courseId?: string;
  title: string;
  provider: string; // provider slug from providers.ts, or "other"
  providerName?: string; // used when provider === "other"
  domain: string;
  issuedOn: string; // YYYY-MM-DD
  credentialId?: string;
  link?: string;
  fileName?: string;
  fileType?: string;
  addedAt: string;
};

const KEY = "certifree:certificates";
const listeners = new Set<() => void>();
let cache: Certificate[] | null = null;
const empty: Certificate[] = [];

function read(): Certificate[] {
  if (cache) return cache;
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    cache = Array.isArray(raw) ? raw : [];
  } catch {
    cache = [];
  }
  return cache!;
}

function write(list: Certificate[]) {
  cache = list;
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
  listeners.forEach((l) => l());
}

// ---------- files in IndexedDB ----------
const DB = "certifree";
const STORE = "files";

function db(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const d = await db();
  return new Promise((resolve, reject) => {
    const r = fn(d.transaction(STORE, mode).objectStore(STORE));
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

export const MAX_FILE_MB = 10;

export async function getCertificateFile(id: string): Promise<Blob | undefined> {
  try {
    return await tx<Blob | undefined>("readonly", (s) => s.get(id) as IDBRequest<Blob | undefined>);
  } catch {
    return undefined;
  }
}

export function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function useCertificates() {
  const list = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => empty,
  );

  const save = useCallback(async (cert: Certificate, file?: File | null) => {
    if (file) {
      await tx("readwrite", (s) => s.put(file, cert.id));
      cert = { ...cert, fileName: file.name, fileType: file.type };
    }
    const cur = read();
    const exists = cur.some((c) => c.id === cert.id);
    write(exists ? cur.map((c) => (c.id === cert.id ? cert : c)) : [cert, ...cur]);
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await tx("readwrite", (s) => s.delete(id));
    } catch {}
    write(read().filter((c) => c.id !== id));
  }, []);

  return { list, save, remove, forCourse: (courseId: string) => list.find((c) => c.courseId === courseId) };
}
