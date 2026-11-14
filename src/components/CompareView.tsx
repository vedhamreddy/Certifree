"use client";
import Link from "next/link";
import { ArrowUpRight, Columns3, X } from "lucide-react";
import { providerBySlug } from "@/data/providers";
import type { Course } from "@/data/courses";
import { useCatalog } from "@/lib/useCatalog";
import { useCompare, MAX_COMPARE } from "@/lib/compare";
import { bestFor } from "@/lib/recommend";
import { useT } from "@/lib/i18n";
import { ProviderAvatar } from "./ProviderAvatar";
import { CostTag } from "./Tags";
import { formatHours } from "./CourseCard";

/** Up to three courses side by side. The list is kept on this device. */
export function CompareView() {
  const t = useT();
  const { ids, remove, clear } = useCompare();
  const { byId } = useCatalog();
  const list = ids.map((id) => byId[id]).filter(Boolean) as Course[];

  if (!list.length) {
    return (
      <div className="rounded-3xl border border-dashed border-line bg-surface-2 p-6 text-sm text-muted">
        <Columns3 size={20} strokeWidth={1.75} className="mb-3 text-ink" aria-hidden />
        <p>{t("compare.empty", { n: MAX_COMPARE })}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/find" className="inline-flex h-10 items-center rounded-full bg-brand px-4 font-semibold text-white hover:bg-brand-600">{t("nav.find")}</Link>
          <Link href="/courses" className="inline-flex h-10 items-center rounded-full border border-line bg-white px-4 font-semibold text-ink hover:bg-surface-2">{t("nav.browse")}</Link>
        </div>
      </div>
    );
  }

  const rows: [string, (c: Course) => React.ReactNode][] = [
    ["compare.provider", (c) => providerBySlug[c.provider]?.name ?? c.provider],
    ["course.level", (c) => t(`level.${c.level}`)],
    ["course.time", (c) => formatHours(c.hours) ?? t("course.selfPaced")],
    ["filter.cost", (c) => <CostTag cost={c.cost} />],
    ["course.credential", (c) => t(`cred.${c.credential}`)],
    ["filter.credit", (c) => (c.academic?.credit ? t("compare.yes") : "—")],
    ["filter.priority", (c) => (c.priority ? "★".repeat(c.priority) + "☆".repeat(3 - c.priority) : "—")],
    ["best.title", (c) => bestFor(c).map((k) => t(k)).join(", ") || "—"],
    ["compare.closes", (c) => c.closesOn ?? "—"],
  ];

  return (
    <div>
      <div className="overflow-x-auto rounded-3xl border border-line bg-white shadow-card">
        <table className="w-full min-w-[640px] table-fixed border-collapse text-left text-sm">
          <colgroup><col className="w-36" />{list.map((c) => <col key={c.id} />)}</colgroup>
          <thead>
            <tr className="align-top">
              <th className="sticky left-0 bg-white p-4" />
              {list.map((c) => (
                <th key={c.id} className="border-l border-line p-4 font-normal">
                  <div className="flex items-start justify-between gap-2">
                    <ProviderAvatar slug={c.provider} size="sm" />
                    <button type="button" onClick={() => remove(c.id)} aria-label={t("compare.remove")} className="rounded-lg p-1 text-muted hover:bg-surface-2 hover:text-ink"><X size={16} strokeWidth={1.75} aria-hidden /></button>
                  </div>
                  <Link href={`/courses/${c.id}`} className="mt-2 block font-semibold leading-snug text-ink hover:underline">{c.title}</Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([k, f]) => (
              <tr key={k} className="border-t border-line align-top">
                <th scope="row" className="sticky left-0 bg-white p-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">{t(k)}</th>
                {list.map((c) => <td key={c.id} className="border-l border-line p-4 text-ink">{f(c)}</td>)}
              </tr>
            ))}
            <tr className="border-t border-line">
              <th className="sticky left-0 bg-white p-4" />
              {list.map((c) => (
                <td key={c.id} className="border-l border-line p-4">
                  <a href={c.url} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1 rounded-full bg-brand px-3 text-xs font-semibold text-white hover:bg-brand-600">
                    {t("compare.go")} <ArrowUpRight size={14} strokeWidth={2} aria-hidden />
                  </a>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        {list.length < MAX_COMPARE && <span className="text-muted">{t("compare.more", { n: MAX_COMPARE - list.length })}</span>}
        <button type="button" onClick={clear} className="font-semibold text-ink underline underline-offset-4">{t("compare.clear")}</button>
      </div>
    </div>
  );
}
