/**
 * The scheduled catalog job (runs inside the Cloudflare Worker, see custom-worker.ts).
 * No Next.js imports here, so it runs in a plain Worker.
 *
 * 1. Microsoft Learn: reads the official, public Catalog API and adds every Applied Skills
 *    credential (free assessment, free verifiable credential). Ones that disappear from the
 *    feed for 3 days are retired.
 * 2. Link check: every run checks the 20 least recently checked course links. A link that
 *    answers 404/410 on two checks in a row hides that course until it works again.
 *    Other errors (403, 429, timeouts) are ignored, because many sites block bots.
 *
 * It writes only with the service role key, which never leaves the server.
 */
import { courses as bundled } from "../data/courses";

export type SyncEnv = { SUPABASE_URL?: string; SUPABASE_SERVICE_ROLE_KEY?: string; SITE_URL?: string };
type Fetch = typeof fetch;
type Row = Record<string, unknown>;

const MS_FEED = "https://learn.microsoft.com/api/catalog/?type=appliedSkills&locale=en-us";
const CHECKS_PER_RUN = 20; // keeps each run well under the Workers free plan's 50 outgoing requests
const RETIRE_AFTER_DAYS = 3;

// ---------- Microsoft Learn ----------
const strip = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#39;|&rsquo;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();

function shortSummary(html: string) {
  const text = strip(html).replace(/^To earn this Microsoft Applied Skills credential, learners demonstrate (the ability to )?/i, "");
  const first = (text.match(/^.*?[.!?](\s|$)/)?.[0] ?? text).trim();
  const s = first.charAt(0).toUpperCase() + first.slice(1);
  const body = s.length > 170 ? `${s.slice(0, 167).trimEnd()}...` : s;
  return `${body} Earn a free Microsoft Applied Skills credential.`.slice(0, 400);
}

function msDomain(subjects: string[], products: string[], title: string): string {
  const all = [...subjects, ...products, title.toLowerCase()].join(" ");
  if (/\b(ai|artificial-intelligence|machine-learning|copilot|openai|cognitive|agent)/.test(all)) return "ai";
  if (/secur|sentinel|defender|identity|entra|purview|compliance/.test(all)) return "security";
  if (/data|database|sql|fabric|power-bi|analytics|cosmos|postgres/.test(all)) return "data";
  if (/devops|github|automation/.test(all)) return "devops";
  if (/power-automate|power-apps|dynamics|business/.test(all)) return "career";
  if (/network/.test(all)) return "networking";
  if (/app-development|c-sharp|dotnet|java|python|developer|programming/.test(all)) return "programming";
  return "cloud";
}

export function fromMicrosoft(item: Row, now: string): Row | null {
  const uid = typeof item.uid === "string" ? item.uid : "";
  const title = typeof item.title === "string" ? item.title.trim() : "";
  const rawUrl = typeof item.url === "string" ? item.url : "";
  if (!uid || !title || !rawUrl.startsWith("https://learn.microsoft.com/")) return null;
  const slug = uid.replace(/^applied-skill\./, "").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
  const id = `ms-as-${slug}`.slice(0, 80).replace(/-+$/, "");
  const url = new URL(rawUrl);
  url.search = "";
  const levels = Array.isArray(item.levels) ? (item.levels as string[]) : [];
  const level = ["beginner", "intermediate", "advanced"].find((l) => levels.includes(l)) ?? "intermediate";
  const arr = (k: string) => (Array.isArray(item[k]) ? (item[k] as unknown[]).map(String) : []);
  return {
    id,
    source: "microsoft-learn",
    external_id: uid,
    title: `Applied Skills: ${title.replace(/^Microsoft Applied Skills:\s*/i, "")}`.slice(0, 200),
    provider: "microsoft",
    domain: msDomain(arr("subjects"), arr("products"), title),
    level,
    hours: null,
    cost: "free-cert",
    credential: "badge",
    summary: shortSummary(typeof item.summary === "string" ? item.summary : ""),
    url: url.toString(),
    status: "active",
    last_seen: now,
  };
}

// ---------- Supabase REST (service role) ----------
function db(env: SyncEnv, f: Fetch) {
  const base = `${env.SUPABASE_URL}/rest/v1`;
  const key = env.SUPABASE_SERVICE_ROLE_KEY!;
  const auth: Record<string, string> = key.startsWith("eyJ") ? { apikey: key, Authorization: `Bearer ${key}` } : { apikey: key };
  const call = async (path: string, init: RequestInit = {}) => {
    const res = await f(`${base}/${path}`, { ...init, headers: { ...auth, "Content-Type": "application/json", ...(init.headers as Record<string, string>) } });
    if (!res.ok) throw new Error(`supabase ${init.method ?? "GET"} ${path.split("?")[0]}: ${res.status} ${(await res.text()).slice(0, 200)}`);
    return res.status === 204 ? null : res.json().catch(() => null);
  };
  return {
    select: (path: string) => call(path) as Promise<Row[]>,
    upsert: (table: string, rows: Row[], onConflict: string) =>
      rows.length
        ? call(`${table}?on_conflict=${onConflict}`, { method: "POST", body: JSON.stringify(rows), headers: { Prefer: "resolution=merge-duplicates,return=minimal" } })
        : Promise.resolve(null),
    patch: (path: string, body: Row) => call(path, { method: "PATCH", body: JSON.stringify(body), headers: { Prefer: "return=minimal" } }),
  };
}

// ---------- Link check ----------
async function checkLink(url: string, env: SyncEnv, f: Fetch): Promise<number | null> {
  try {
    const res = await f(url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": `CertiFreeLinkCheck/1.0 (+${env.SITE_URL ?? "https://certifree"})`, Accept: "text/html,*/*" },
    });
    res.body?.cancel().catch(() => {});
    return res.status;
  } catch {
    return null; // network error or timeout: inconclusive
  }
}

export type SyncReport = { microsoft: number | string; retired: string; checked: number; dead: string[] };

export async function runCatalogSync(env: SyncEnv, f: Fetch = fetch, nowDate = new Date()): Promise<SyncReport> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are needed for the catalog job");
  const d = db(env, f);
  const now = nowDate.toISOString();
  const report: SyncReport = { microsoft: 0, retired: "skipped", checked: 0, dead: [] };

  // 1. Microsoft Learn Applied Skills
  try {
    const res = await f(MS_FEED, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const feed = (await res.json()) as { appliedSkills?: Row[] };
    const rows = (feed.appliedSkills ?? []).map((x) => fromMicrosoft(x, now)).filter((x): x is Row => !!x);
    const unique = [...new Map(rows.map((r) => [r.id as string, r])).values()];
    await d.upsert("catalog_courses", unique, "id");
    report.microsoft = unique.length;
    // Only retire when the feed looked healthy, so one bad response can't empty the list.
    if (unique.length >= 5) {
      const cutoff = new Date(nowDate.getTime() - RETIRE_AFTER_DAYS * 86_400_000).toISOString();
      await d.patch(`catalog_courses?source=eq.microsoft-learn&status=eq.active&last_seen=lt.${encodeURIComponent(cutoff)}`, { status: "retired" });
      report.retired = "done";
    }
  } catch (e) {
    report.microsoft = `failed: ${(e as Error).message}`;
  }

  // 2. Link check, oldest first
  const auto = await d.select("catalog_courses?select=id,url&status=eq.active&limit=2000");
  const all = new Map<string, string>(bundled.map((c) => [c.id, c.url]));
  for (const r of auto) if (!all.has(String(r.id))) all.set(String(r.id), String(r.url));
  const status = await d.select("course_status?select=course_id,fail_count,checked_at&limit=5000");
  const byId = new Map(status.map((s) => [String(s.course_id), s]));
  const due = [...all.keys()]
    .sort((a, b) => String(byId.get(a)?.checked_at ?? "").localeCompare(String(byId.get(b)?.checked_at ?? "")))
    .slice(0, CHECKS_PER_RUN);
  const results = await Promise.all(
    due.map(async (id) => {
      const code = await checkLink(all.get(id)!, env, f);
      const prev = Number(byId.get(id)?.fail_count ?? 0);
      const fail_count = code === 404 || code === 410 ? Math.min(prev + 1, 99) : code !== null && code < 400 ? 0 : prev;
      if (fail_count >= 2) report.dead.push(id);
      return { course_id: id, fail_count, last_http: code, checked_at: now };
    }),
  );
  await d.upsert("course_status", results, "course_id");
  report.checked = results.length;
  return report;
}
