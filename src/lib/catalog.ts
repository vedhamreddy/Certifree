import { courses as bundled, courseById as bundledById, costLabels, credentialLabels, domainLabels, levelLabels, type Course } from "@/data/courses";
import { providerBySlug } from "@/data/providers";

/**
 * The live catalog = the hand-picked courses in src/data/courses.ts
 *   + new free courses the scheduled job found (catalog_courses, status "active")
 *   - courses that are hidden, or whose link has been dead (404/410) on 2+ checks in a row.
 * This file is shared by the server and the browser.
 */
export type CatalogUpdate = { added: Course[]; removed: string[] };

export const EMPTY_UPDATE: CatalogUpdate = { added: [], removed: [] };

/** Same page, ignoring tracking parameters, locale prefix and trailing slash. */
export function normalizeUrl(u: string) {
  try {
    const x = new URL(u);
    const path = x.pathname.replace(/^\/[a-z]{2}-[a-z]{2}(?=\/)/i, "").replace(/\/+$/, "").toLowerCase();
    return `${x.hostname.replace(/^www\./, "").toLowerCase()}${path}`;
  } catch {
    return u;
  }
}

const bundledUrls = new Set(bundled.map((c) => normalizeUrl(c.url)));

/** Checks a row from the database before it can appear on the site. */
export function toCourse(r: Record<string, unknown>): Course | null {
  const s = (k: string) => (typeof r[k] === "string" ? (r[k] as string) : "");
  const c: Course = {
    id: s("id"),
    title: s("title"),
    provider: s("provider"),
    domain: s("domain") as Course["domain"],
    level: s("level") as Course["level"],
    hours: typeof r.hours === "number" || typeof r.hours === "string" ? Number(r.hours) || undefined : undefined,
    cost: s("cost") as Course["cost"],
    credential: s("credential") as Course["credential"],
    summary: s("summary"),
    url: s("url"),
  };
  const ok =
    /^[a-z0-9-]{1,80}$/.test(c.id) &&
    c.title.length > 0 &&
    !!providerBySlug[c.provider] &&
    c.domain in domainLabels &&
    c.level in levelLabels &&
    c.cost in costLabels &&
    c.credential in credentialLabels &&
    /^https:\/\//.test(c.url);
  return ok ? c : null;
}

/** Builds the update from the two tables' rows. */
export function buildUpdate(rows: Record<string, unknown>[], status: Record<string, unknown>[]): CatalogUpdate {
  const removed = status
    .filter((s) => s.hidden === true || Number(s.fail_count) >= 2)
    .map((s) => String(s.course_id));
  const gone = new Set(removed);
  const seen = new Set<string>();
  const added: Course[] = [];
  for (const r of rows) {
    if (r.status !== "active") continue;
    const c = toCourse(r);
    if (!c || gone.has(c.id) || bundledById[c.id]) continue;
    const key = normalizeUrl(c.url);
    if (bundledUrls.has(key) || seen.has(key)) continue;
    seen.add(key);
    added.push(c);
  }
  added.sort((a, b) => a.title.localeCompare(b.title));
  return { added, removed };
}

export function applyUpdate(u: CatalogUpdate): Course[] {
  const gone = new Set(u.removed);
  return [...bundled.filter((c) => !gone.has(c.id)), ...u.added];
}
