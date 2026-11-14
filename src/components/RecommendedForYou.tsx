"use client";
import Link from "next/link";
import { Wand2 } from "lucide-react";
import { useRecommendations } from "@/lib/useRecommendations";
import { useT } from "@/lib/i18n";
import { RecommendedCourse } from "./RecommendedCourse";

/** Dashboard card: top picks from the quiz, or an invitation to take it. */
export function RecommendedForYou() {
  const t = useT();
  const { profile, picks } = useRecommendations(3);
  if (!profile) {
    return (
      <section className="flex flex-col items-start gap-4 rounded-3xl border border-line bg-white p-5 sm:flex-row sm:items-center sm:p-6">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand text-white"><Wand2 size={20} strokeWidth={1.75} aria-hidden /></span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-bold text-ink">{t("rec.ctaTitle")}</h2>
          <p className="mt-0.5 text-sm text-muted">{t("rec.ctaText")}</p>
        </div>
        <Link href="/find" className="inline-flex h-10 shrink-0 items-center rounded-full bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-600">{t("rec.ctaButton")}</Link>
      </section>
    );
  }
  return (
    <section className="rounded-3xl border border-line bg-white p-5 sm:p-6" aria-labelledby="rec-title">
      <div className="flex items-center justify-between gap-3">
        <h2 id="rec-title" className="font-display text-lg font-bold text-ink">{t("rec.title")}</h2>
        <Link href="/find" className="text-sm font-semibold text-ink underline-offset-4 hover:underline">{t("dash.viewAll")}</Link>
      </div>
      {picks.length ? (
        <ol className="mt-4 grid gap-3 xl:grid-cols-3">{picks.map((p) => <RecommendedCourse key={p.course.id} pick={p} />)}</ol>
      ) : (
        <p className="mt-4 text-sm text-muted">{t("find.none")}</p>
      )}
    </section>
  );
}
