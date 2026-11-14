"use client";
import { Search } from "lucide-react";
import { useT } from "@/lib/i18n";

export function SearchBar({ defaultValue = "", big = false }: { defaultValue?: string; big?: boolean }) {
  const t = useT();
  return (
    <form
      action="/courses"
      role="search"
      className={`flex min-w-0 w-full items-center rounded-full border border-line bg-white shadow-card transition-colors focus-within:border-accent/60 ${big ? "p-2 pl-4 sm:pl-5" : "p-1.5 pl-4"}`}
    >
      <Search size={20} strokeWidth={1.75} className="shrink-0 text-muted" aria-hidden />
      <input
        name="q"
        defaultValue={defaultValue}
        placeholder={t("search.ph")}
        aria-label={t("nav.search")}
        className={`min-w-0 flex-1 bg-transparent px-3 outline-none placeholder:text-muted ${big ? "py-2.5 text-base sm:text-lg" : "py-2"}`}
      />
      <button className={`shrink-0 whitespace-nowrap rounded-xl bg-brand font-semibold text-white transition hover:bg-brand-600 active:scale-[0.98] ${big ? "px-4 py-3 sm:px-6" : "px-4 py-2"}`}>{t("home.search")}</button>
    </form>
  );
}
