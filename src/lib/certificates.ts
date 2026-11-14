"use client";
import { useCallback, useSyncExternalStore } from "react";
import { push } from "./sync";

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

export function readCertificates(): Certificate[] {
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

/** Save on this device only. Returns the stored certificate. */
export async function putCertificateLocal(cert: Certificate, file?: Blob | null, fileName?: string): Promise<Certificate> {
  if (file) {
    await tx("readwrite", (s) => s.put(file, cert.id));
    cert = { ...cert, fileName: fileName ?? (file as File).name ?? "certificate", fileType: file.type };
  }
  const cur = readCertificates();
  const exists = cur.some((c) => c.id === cert.id);
  write(exists ? cur.map((c) => (c.id === cert.id ? cert : c)) : [cert, ...cur]);
  return cert;
}

/** Remove a certificate and its file from this device only. */
export async function removeCertificateLocal(id: string) {
  try {
    await tx("readwrite", (s) => s.delete(id));
  } catch {}
  write(readCertificates().filter((c) => c.id !== id));
}

/** Clear everything CertiFree keeps in this browser. */
export async function clearCertificatesLocal() {
  try {
    await tx("readwrite", (s) => s.clear());
  } catch {}
  write([]);
}

export function useCertificates() {
  const list = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    readCertificates,
    () => empty,
  );

  const save = useCallback(async (cert: Certificate, file?: File | null) => {
    const saved = await putCertificateLocal(cert, file);
    push.certificate(saved, file);
  }, []);

  const remove = useCallback(async (id: string) => {
    await removeCertificateLocal(id);
    push.certificateDelete(id);
  }, []);

  return { list, save, remove, forCourse: (courseId: string) => list.find((c) => c.courseId === courseId) };
}
