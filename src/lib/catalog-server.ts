import "server-only";
import { courseById as bundledById, type Course } from "@/data/courses";
import { buildUpdate, EMPTY_UPDATE, type CatalogUpdate } from "./catalog";

/**
 * Reads the automatic catalog updates from Supabase (public, read-only rows) with the
 * anon key, on the server. Cached in memory for 10 minutes. If Supabase is slow, down or
 * not configured, the site simply shows the hand-picked catalog.
 */
const TTL = 10 * 60_000;
let cache: { at: number; value: CatalogUpdate } | null = null;
let inflight: Promise<CatalogUpdate> | null = null;

function headers(key: string): Record<string, string> {
  // New "sb_publishable_" keys go only in apikey; legacy JWT keys also need Authorization.
  return key.startsWith("eyJ") ? { apikey: key, Authorization: `Bearer ${key}` } : { apikey: key };
}

async function load(): Promise<CatalogUpdate> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return EMPTY_UPDATE;
  const get = async (q: string) => {
    const res = await fetch(`${url}/rest/v1/${q}`, { headers: headers(key), signal: AbortSignal.timeout(4000), cache: "no-store" });
    if (!res.ok) throw new Error(String(res.status));
    return (await res.json()) as Record<string, unknown>[];
  };
  const [rows, status] = await Promise.all([
    get("catalog_courses?select=id,title,provider,domain,level,hours,cost,credential,summary,url,status&status=eq.active&limit=2000"),
    get("course_status?select=course_id,hidden,fail_count&or=(hidden.eq.true,fail_count.gte.2)&limit=2000"),
  ]);
  return buildUpdate(rows, status);
}

export async function getCatalogUpdate(): Promise<CatalogUpdate> {
  if (cache && Date.now() - cache.at < TTL) return cache.value;
  inflight ??= load()
    .then((value) => {
      cache = { at: Date.now(), value };
      return value;
    })
    .catch(() => cache?.value ?? EMPTY_UPDATE)
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/** A course by ID: hand-picked first, then automatically added ones. */
export async function findCourse(id: string): Promise<Course | undefined> {
  if (bundledById[id]) return bundledById[id];
  if (!/^[a-z0-9-]{1,80}$/.test(id)) return undefined;
  return (await getCatalogUpdate()).added.find((c) => c.id === id);
}

/** IDs of automatically added courses, for validating saved courses and My Courses. */
export async function addedCourseIds(): Promise<Set<string>> {
  return new Set((await getCatalogUpdate()).added.map((c) => c.id));
}
