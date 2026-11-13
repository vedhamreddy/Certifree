import { companyBySlug } from "@/data/companies";
import { Course, courses, domainLabels } from "@/data/courses";

export type Filters = {
  q?: string;
  company?: string[];
  domain?: string[];
  level?: string[];
  cost?: string[];
  sort?: "relevance" | "short" | "az";
};

const norm = (s: string) => s.toLowerCase().normalize("NFKD");

function score(c: Course, terms: string[]): number {
  if (!terms.length) return 1;
  const company = companyBySlug[c.company];
  const hay = {
    title: norm(c.title),
    company: norm(`${company.name} ${company.portal}`),
    other: norm(`${c.summary} ${domainLabels[c.domain]}`),
  };
  let total = 0;
  for (const t of terms) {
    let s = 0;
    if (hay.title.includes(t)) s += 3;
    if (hay.company.includes(t)) s += 2;
    if (hay.other.includes(t)) s += 1;
    if (!s) return 0;
    total += s;
  }
  return total;
}

export function filterCourses(f: Filters, list: Course[] = courses): Course[] {
  const terms = norm(f.q ?? "").split(/\s+/).filter(Boolean);
  const inSet = (vals: string[] | undefined, v: string) => !vals?.length || vals.includes(v);
  const scored = list
    .filter((c) => inSet(f.company, c.company) && inSet(f.domain, c.domain) && inSet(f.level, c.level) && inSet(f.cost, c.cost))
    .map((c) => ({ c, s: score(c, terms) }))
    .filter((x) => x.s > 0);
  if (f.sort === "short") scored.sort((a, b) => a.c.hours - b.c.hours);
  else if (f.sort === "az") scored.sort((a, b) => a.c.title.localeCompare(b.c.title));
  else scored.sort((a, b) => b.s - a.s || Number(!!b.c.trending) - Number(!!a.c.trending) || (a.c.cost === "free-cert" ? -1 : 0) - (b.c.cost === "free-cert" ? -1 : 0));
  return scored.map((x) => x.c);
}
