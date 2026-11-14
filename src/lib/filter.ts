import { providerBySlug } from "@/data/providers";
import { Course, courses, domainLabels } from "@/data/courses";

export type Filters = {
  q?: string;
  provider?: string[];
  domain?: string[];
  level?: string[];
  cost?: string[];
  sort?: "relevance" | "short" | "az";
};

const norm = (s: string) => s.toLowerCase().normalize("NFKD");

function score(c: Course, terms: string[]): number {
  if (!terms.length) return 1;
  const p = providerBySlug[c.provider];
  const title = norm(c.title);
  const prov = norm(`${p.name} ${p.portal}`);
  const other = norm(`${c.summary} ${domainLabels[c.domain]}`);
  let total = 0;
  for (const t of terms) {
    let s = 0;
    if (title.includes(t)) s += 3;
    if (prov.includes(t)) s += 2;
    if (other.includes(t)) s += 1;
    if (!s) return 0;
    total += s;
  }
  return total;
}

const freeRank = (c: Course) => (c.cost === "free-cert" ? 0 : c.cost === "limited-time" ? 1 : 2);

export function filterCourses(f: Filters, list: Course[] = courses): Course[] {
  const terms = norm(f.q ?? "").split(/\s+/).filter(Boolean);
  const inSet = (vals: string[] | undefined, v: string) => !vals?.length || vals.includes(v);
  const scored = list
    .filter((c) => inSet(f.provider, c.provider) && inSet(f.domain, c.domain) && inSet(f.level, c.level) && inSet(f.cost, c.cost))
    .map((c) => ({ c, s: score(c, terms) }))
    .filter((x) => x.s > 0);
  if (f.sort === "short") scored.sort((a, b) => (a.c.hours ?? 1e9) - (b.c.hours ?? 1e9));
  else if (f.sort === "az") scored.sort((a, b) => a.c.title.localeCompare(b.c.title));
  else scored.sort((a, b) => b.s - a.s || Number(!!b.c.trending) - Number(!!a.c.trending) || freeRank(a.c) - freeRank(b.c));
  return scored.map((x) => x.c);
}
