"use client";
import { useCallback, useSyncExternalStore } from "react";
import { push } from "./sync";

/** A course the learner is taking now ("My Courses"). Stored on this device like bookmarks. */
export type LearningItem = {
  courseId: string;
  startedOn: string; // YYYY-MM-DD
  progress: number; // 0-100
  targetDate?: string; // YYYY-MM-DD
  updatedAt: string;
};

const KEY = "certifree:learning";
const listeners = new Set<() => void>();
let cache: LearningItem[] | null = null;
const empty: LearningItem[] = [];

export function readLearning(): LearningItem[] {
  if (cache) return cache;
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    cache = Array.isArray(raw) ? raw : [];
  } catch {
    cache = [];
  }
  return cache!;
}

/** Replace the list on this device only (used when applying a reviewed sync). */
export function setLearningLocal(list: LearningItem[]) {
  cache = list;
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
  listeners.forEach((l) => l());
}

export const today = () => new Date().toISOString().slice(0, 10);

export function useLearning() {
  const list = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    readLearning,
    () => empty,
  );

  const start = useCallback((courseId: string) => {
    if (readLearning().some((x) => x.courseId === courseId)) return;
    const item: LearningItem = { courseId, startedOn: today(), progress: 0, updatedAt: new Date().toISOString() };
    setLearningLocal([item, ...readLearning()]);
    push.learning(item);
  }, []);

  const update = useCallback((courseId: string, patch: Partial<Pick<LearningItem, "progress" | "targetDate">>) => {
    let next: LearningItem | undefined;
    setLearningLocal(
      readLearning().map((x) => (x.courseId === courseId ? (next = { ...x, ...patch, updatedAt: new Date().toISOString() }) : x)),
    );
    if (next) push.learning(next);
  }, []);

  const stop = useCallback((courseId: string) => {
    if (!readLearning().some((x) => x.courseId === courseId)) return;
    setLearningLocal(readLearning().filter((x) => x.courseId !== courseId));
    push.learningDelete(courseId);
  }, []);

  return { list, start, update, stop, get: (courseId: string) => list.find((x) => x.courseId === courseId) };
}
