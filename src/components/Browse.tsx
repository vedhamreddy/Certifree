"use client";
import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { companies } from "@/data/companies";
import { costLabels, domainLabels, levelLabels } from "@/data/courses";
import { filterCourses, Filters } from "@/lib/filter";
import { CourseCard } from "./CourseCard";

const groups = [
  { key: "cost", title: "What's free", options: Object.entries(costLabels) },
  { key: "domain", title: "Domain", options: Object.entries(domainLabels) },
  { key: "company", title: "Company", options: companies.map((c) => [c.slug, c.name] as [string, string]) },
  { key: "level", title: "Level", options: Object.entries(levelLabels) },
] as const;

type Key = (typeof groups)[number]["key"];

export function Browse() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [open, setOpen] = useState(false);

  const filters: Filters = {
    q,
    cost: params.getAll("cost"),
    domain: params.getAll("domain"),
    company: params.getAll("company"),
    level: params.getAll("level"),
    sort: (params.get("sort") as Filters["sort"]) ?? "relevance",
  };
  const results = useMemo(() => filterCourses(filters), [q, params]); // eslint-disable-line react-hooks/exhaustive-deps
  const activeCount = groups.reduce((n, g) => n + params.getAll(g.key).length, 0);

  function update(mut: (p: URLSearchParams) => void) {
    const p = new URLSearchParams(params.toString());
    mut(p);
    startTransition(() => router.replace(`${pathname}?${p.toString()}`, { scroll: false }));
  }
  function toggle(key: Key, value: string) {
    update((p) => {
      const cur = p.getAll(key);
      p.delete(key);
      (cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value]).forEach((v) => p.append(key, v));
    });
  }
  function onSearch(v: string) {
    setQ(v);
    update((p) => (v ? p.set("q", v) : p.delete("q")));
  }

  const panel = (
    <div className="space-y-6">
      {groups.map((g) => (
        <fieldset key={g.key}>
          <legend className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">{g.title}</legend>
          <div className="flex flex-wrap gap-2">
            {g.options.map(([value, label]) => {
              const on = params.getAll(g.key).includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(g.key, value)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${on ? "border-brand bg-brand text-white" : "border-line bg-surface hover:border-brand hover:text-brand"}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
      {activeCount > 0 && (
        <button type="button" onClick={() => update((p) => groups.forEach((g) => p.delete(g.key)))} className="text-sm font-semibold text-brand">
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-3xl font-bold">Browse free courses</h1>
      <div className="sticky top-16 z-20 -mx-4 mt-4 bg-bg/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex gap-2">
          <label className="flex flex-1 items-center gap-2 rounded-2xl border border-line bg-surface px-4 shadow-sm focus-within:border-brand">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted" aria-hidden><circle cx="11" cy="11" r="7" /><path d="M21 21l-5-5" /></svg>
            <input value={q} onChange={(e) => onSearch(e.target.value)} placeholder="Search by course, company or skill" aria-label="Search courses" className="min-w-0 flex-1 bg-transparent py-3 outline-none placeholder:text-muted" />
            {q && <button type="button" onClick={() => onSearch("")} aria-label="Clear search" className="text-muted">✕</button>}
          </label>
          <button type="button" onClick={() => setOpen(true)} className="rounded-2xl border border-line bg-surface px-4 font-semibold lg:hidden">
            Filters{activeCount ? ` (${activeCount})` : ""}
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-36 max-h-[calc(100vh-10rem)] overflow-y-auto rounded-2xl border border-line bg-surface p-5">{panel}</div>
        </aside>
        <section>
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="text-muted" aria-live="polite"><b className="text-ink">{results.length}</b> course{results.length === 1 ? "" : "s"}</p>
            <select
              value={filters.sort}
              onChange={(e) => update((p) => p.set("sort", e.target.value))}
              aria-label="Sort"
              className="rounded-xl border border-line bg-surface px-3 py-2 text-sm"
            >
              <option value="relevance">Most relevant</option>
              <option value="short">Shortest first</option>
              <option value="az">A to Z</option>
            </select>
          </div>
          {results.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((c) => <CourseCard key={c.id} course={c} />)}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-line bg-surface p-10 text-center">
              <div className="mb-2 text-4xl">🔎</div>
              <p className="font-semibold">No courses match these filters.</p>
              <p className="mt-1 text-muted">Try removing a filter or searching for something broader, like &quot;cloud&quot;.</p>
            </div>
          )}
        </section>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-3xl bg-surface p-5 pb-8 shadow-2xl">
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-line" />
            {panel}
            <button type="button" onClick={() => setOpen(false)} className="mt-6 w-full rounded-2xl bg-brand py-3 font-semibold text-white">
              Show {results.length} courses
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
