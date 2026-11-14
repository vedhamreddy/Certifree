"use client";
import { Columns3, Check } from "lucide-react";
import { useCompare } from "@/lib/compare";
import { useT } from "@/lib/i18n";

/** Adds a course to the comparison (up to 3, kept on this device). */
export function CompareButton({ id, compact = false }: { id: string; compact?: boolean }) {
  const { has, toggle } = useCompare();
  const t = useT();
  const on = has(id);
  return (
    <button
      type="button"
      onClick={() => toggle(id)}
      aria-pressed={on}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border font-semibold transition ${compact ? "h-8 px-3 text-xs" : "h-11 px-4 text-sm"} ${on ? "border-brand bg-brand text-white" : "border-line bg-white text-ink hover:bg-surface-2"}`}
    >
      {on ? <Check size={compact ? 13 : 15} strokeWidth={2} aria-hidden /> : <Columns3 size={compact ? 13 : 15} strokeWidth={1.75} aria-hidden />}
      {on ? t("compare.added") : t("compare.add")}
    </button>
  );
}
