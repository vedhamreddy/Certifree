"use client";
import Link from "next/link";
import { providerBySlug } from "@/data/providers";
import type { Pick } from "@/lib/recommend";
import { useT } from "@/lib/i18n";
import { ProviderAvatar } from "./ProviderAvatar";
import { CostTag } from "./Tags";
import { CompareButton } from "./CompareButton";
import { BookmarkButton } from "./BookmarkButton";

/** One recommended course with "why this" reasons. */
export function RecommendedCourse({ pick, rank }: { pick: Pick; rank?: number }) {
  const t = useT();
  const c = pick.course;
  return (
    <li className="rounded-3xl border border-line bg-white p-4 shadow-card sm:p-5">
      <div className="flex items-start gap-3">
        {rank != null && <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand text-xs font-bold text-white">{rank}</span>}
        <ProviderAvatar slug={c.provider} />
        <div className="min-w-0 flex-1">
          <Link href={`/courses/${c.id}`} className="font-semibold leading-snug text-ink hover:underline">{c.title}</Link>
          <div className="mt-0.5 text-xs text-muted">{providerBySlug[c.provider]?.name ?? c.provider} · {t(`level.${c.level}`)}{c.hours != null ? ` · ${c.hours < 1 ? Math.round(c.hours * 60) + " min" : c.hours + " h"}` : ""}</div>
        </div>
        <BookmarkButton id={c.id} />
      </div>
      {pick.why.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={t("find.why")}>
          {pick.why.map((w) => (
            <li key={w} className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 ring-1 ring-inset ring-emerald-600/20">{t(w)}</li>
          ))}
        </ul>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <CostTag cost={c.cost} />
        <span className="flex-1" />
        <CompareButton id={c.id} compact />
      </div>
    </li>
  );
}
