"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Columns3, X } from "lucide-react";
import { useCompare } from "@/lib/compare";
import { useT } from "@/lib/i18n";

/** Small floating bar once a course is picked for comparison. */
export function CompareTray() {
  const { ids, clear } = useCompare();
  const t = useT();
  const path = usePathname();
  if (!ids.length || path.startsWith("/compare")) return null;
  return (
    <div className="fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-30 mx-auto flex max-w-sm items-center gap-2 rounded-full border border-line bg-white p-1.5 pl-4 shadow-pop lg:bottom-6 lg:left-auto lg:right-6 lg:mx-0">
      <Columns3 size={16} strokeWidth={1.75} className="shrink-0 text-muted" aria-hidden />
      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{t("compare.tray", { n: ids.length })}</span>
      <button type="button" onClick={clear} aria-label={t("compare.clear")} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-ink">
        <X size={16} strokeWidth={1.75} aria-hidden />
      </button>
      <Link href="/compare" className="inline-flex h-9 shrink-0 items-center rounded-full bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-600">{t("compare.open")}</Link>
    </div>
  );
}
