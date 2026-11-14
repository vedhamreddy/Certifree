"use client";
import { useEffect, useMemo, useState } from "react";
import type { Course } from "@/data/courses";
import { applyUpdate, EMPTY_UPDATE, type CatalogUpdate } from "./catalog";

/**
 * The live catalog in the browser. It starts with the hand-picked courses (instant, works
 * offline) and then merges in /catalog.json: new courses found automatically, minus hidden
 * or dead-link ones. Fetched once per page load.
 */
let shared: Promise<CatalogUpdate> | null = null;
let latest: CatalogUpdate = EMPTY_UPDATE;

function fetchUpdate() {
  shared ??= fetch("/catalog.json")
    .then((r) => (r.ok ? r.json() : EMPTY_UPDATE))
    .then((u: CatalogUpdate) => {
      latest = Array.isArray(u?.added) && Array.isArray(u?.removed) ? u : EMPTY_UPDATE;
      return latest;
    })
    .catch(() => EMPTY_UPDATE);
  return shared;
}

export function useCatalog() {
  const [update, setUpdate] = useState<CatalogUpdate>(latest);
  useEffect(() => {
    let live = true;
    fetchUpdate().then((u) => live && setUpdate(u));
    return () => {
      live = false;
    };
  }, []);
  return useMemo(() => {
    const courses = applyUpdate(update);
    // Lookups by ID still find removed courses, so a saved course never just vanishes.
    const byId: Record<string, Course> = Object.fromEntries([...applyUpdate(EMPTY_UPDATE), ...update.added].map((c) => [c.id, c]));
    return { courses, byId, update };
  }, [update]);
}
