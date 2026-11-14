"use client";
import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { companies, platforms } from "@/data/providers";
import { costLabels, domainLabels, levelLabels } from "@/data/courses";
import { filterCourses, Filters } from "@/lib/filter";
import { useCatalog } from "@/lib/useCatalog";
import { useT } from "@/lib/i18n";
import { CourseCard } from "./CourseCard";
import { Search, SlidersHorizontal, X, SearchX } from "lucide-react";

const groups = [
  // Option labels starting with "@" are translation keys; provider names stay as they are.
  { key: "priority", title: "filter.priority", options: [["3", "@prio.3"], ["2", "@prio.2"], ["1", "@prio.1"]] },
  { key: "cost", title: "filter.cost", options: Object.keys(costLabels).map((k) => [k, `@cost.${k}`] as [string, string]) },
  { key: "credit", title: "filter.credit", options: [["yes", "@filter.creditYes"]] },
  { key: "domain", title: "filter.domain", options: Object.keys(domainLabels).map((k) => [k, `@domain.${k}`] as [string, string]) },
  { key: "provider", title: "filter.companies", options: companies.map((c) => [c.slug, c.name] as [string, string]) },
  { key: "provider", title: "filter.platforms", options: platforms.map((c) => [c.slug, c.name] as [string, string]) },
  { key: "level", title: "filter.level", options: Object.keys(levelLabels).map((k) => [k, `@level.${k}`] as [string, string]) },
] as const;

type Key = (typeof groups)[number]["key"];

export function Browse() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [open, setOpen] = useState(false);
  const { courses: catalog } = useCatalog();
  const t = useT();

  const filters: Filters = {
    q,
    cost: params.getAll("cost"),
    domain: params.getAll("domain"),
    provider: params.getAll("provider"),
    level: params.getAll("level"),
    priority: params.getAll("priority"),
    credit: params.getAll("credit"),
    sort: (params.get("sort") as Filters["sort"]) ?? "relevance",
  };
  const results = useMemo(() => filterCourses(filters, catalog), [q, params, catalog]); // eslint-disable-line react-hooks/exhaustive-deps
  const activeCount = ["priority", "cost", "credit", "domain", "provider", "level"].reduce((n, k) => n + params.getAll(k).length, 0);

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
        <fieldset key={g.title}>
          <legend className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">{t(g.title)}</legend>
          <div className="flex flex-wrap gap-2">
            {g.options.map(([value, label]) => {
              const on = params.getAll(g.key).includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(g.key, value)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition duration-150 ${on ? "border-brand bg-brand text-white shadow-card" : "border-line bg-white text-ink hover:border-accent/40 hover:bg-accent/[0.04] hover:text-accent"}`}
                >
                  {label.startsWith("@") ? t(label.slice(1)) : label}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
      {activeCount > 0 && (
        <button type="button" onClick={() => update((p) => groups.forEach((g) => p.delete(g.key)))} className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:text-brand">
          <X size={14} strokeWidth={2} aria-hidden /> {t("browse.clear")}
        </button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">{t("browse.title")}</h1>
      <p className="mt-2 text-muted">{t("browse.sub")}</p>
      <div className="sticky top-16 z-20 -mx-4 mt-6 bg-white/85 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex gap-2">
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-line bg-white px-4 shadow-card transition-colors focus-within:border-accent/60">
            <Search size={18} strokeWidth={1.75} className="shrink-0 text-muted" aria-hidden />
            <input value={q} onChange={(e) => onSearch(e.target.value)} placeholder={t("browse.searchPh")} aria-label={t("nav.search")} className="min-w-0 flex-1 bg-transparent py-3 text-[15px] outline-none placeholder:text-muted" />
            {q && <button type="button" onClick={() => onSearch("")} aria-label={t("browse.clearSearch")} className="rounded-md p-1 text-muted transition hover:bg-surface-2 hover:text-ink"><X size={16} strokeWidth={2} aria-hidden /></button>}
          </label>
          <button type="button" onClick={() => setOpen(true)} className="inline-flex shrink-0 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-semibold text-ink shadow-card transition hover:bg-surface-2 lg:hidden">
            <SlidersHorizontal size={16} strokeWidth={1.75} aria-hidden /> {t("browse.filters")}{activeCount ? ` (${activeCount})` : ""}
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-36 max-h-[calc(100vh-10rem)] overflow-y-auto rounded-3xl border border-line bg-white p-5 shadow-card">{panel}</div>
        </aside>
        <section>
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="text-sm text-muted" aria-live="polite">{t(results.length === 1 ? "browse.count1" : "browse.count", { n: results.length })}</p>
            <select
              value={filters.sort}
              onChange={(e) => update((p) => p.set("sort", e.target.value))}
              aria-label={t("browse.sort")}
              className="rounded-full border border-line bg-white px-3 py-2 text-sm font-medium text-ink shadow-card outline-none transition hover:border-slate-300 focus:border-accent/60"
            >
              <option value="relevance">{t("sort.relevance")}</option>
              <option value="priority">{t("sort.priority")}</option>
              <option value="short">{t("sort.short")}</option>
              <option value="az">{t("sort.az")}</option>
            </select>
          </div>
          {results.length ? (
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {results.map((c) => <CourseCard key={c.id} course={c} />)}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-line bg-surface-2 px-6 py-14 text-center">
              <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-white text-muted shadow-card ring-1 ring-inset ring-line"><SearchX size={22} strokeWidth={1.75} aria-hidden /></span>
              <p className="font-semibold text-ink">{t("browse.none")}</p>
              <p className="mt-1 text-muted">{t("browse.noneHint")}</p>
            </div>
          )}
        </section>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label={t("browse.filters")}>
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="sheet-in absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-white p-5 pb-8 shadow-pop">
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-slate-300" />
            {panel}
            <button type="button" onClick={() => setOpen(false)} className="mt-6 w-full rounded-full bg-brand py-3.5 font-semibold text-white transition hover:bg-brand-600 active:scale-[0.99]">
              {t("browse.show", { n: results.length })}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
