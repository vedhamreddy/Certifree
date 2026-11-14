"use client";
import { Languages } from "lucide-react";
import { LANGS, setLang, useLang, useT, type Lang } from "@/lib/i18n";

/** Small language picker. The choice is saved on this device. */
export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const lang = useLang();
  const t = useT();
  return (
    <label className={`relative inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-white text-sm font-semibold text-ink transition focus-within:ring-1 focus-within:ring-brand hover:bg-surface-2 ${compact ? "h-10 px-3" : "h-10 w-full px-4"}`} title={t("lang.note")}>
      <Languages size={16} strokeWidth={1.75} className="shrink-0 text-muted" aria-hidden />
      <span className="sr-only">{t("nav.language")}</span>
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as Lang)}
        aria-label={t("nav.language")}
        className={`cursor-pointer appearance-none bg-transparent outline-none ${compact ? "w-[4.5rem] text-xs" : "flex-1"}`}
      >
        {LANGS.map((l) => <option key={l.code} value={l.code} lang={l.code}>{l.label}</option>)}
      </select>
    </label>
  );
}
