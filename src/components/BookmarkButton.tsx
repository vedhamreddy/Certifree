"use client";
import { useState } from "react";
import { Heart } from "lucide-react";
import { useBookmarks } from "@/lib/bookmarks";
import { withSignInNudge } from "./SignInPrompt";
import { useT } from "@/lib/i18n";

export function BookmarkButton({ id, withLabel = false }: { id: string; withLabel?: boolean }) {
  const { has, toggle } = useBookmarks();
  const [anim, setAnim] = useState(0);
  const on = has(id);
  const t = useT();
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const run = () => {
          toggle(id);
          setAnim((n) => n + 1);
        };
        if (on) run();
        else withSignInNudge(run);
      }}
      aria-pressed={on}
      aria-label={t(on ? "course.unsave" : "course.bookmark")}
      className={`inline-flex items-center gap-2 transition ${
        withLabel
          ? `h-11 rounded-xl border px-4 text-sm font-semibold active:scale-[0.98] ${on ? "border-accent/30 bg-accent/[0.06] text-brand" : "border-line bg-white text-ink hover:border-slate-300 hover:bg-surface-2"}`
          : "rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-accent"
      }`}
    >
      <Heart
        key={anim}
        size={18}
        strokeWidth={1.75}
        className={`${anim ? "pop" : ""} ${on ? "fill-accent text-accent" : ""}`}
        aria-hidden
      />
      {withLabel && t(on ? "course.saved" : "course.save")}
    </button>
  );
}
