"use client";
import { useState } from "react";
import { Heart } from "lucide-react";
import { useBookmarks } from "@/lib/bookmarks";

export function BookmarkButton({ id, withLabel = false }: { id: string; withLabel?: boolean }) {
  const { has, toggle } = useBookmarks();
  const [anim, setAnim] = useState(0);
  const on = has(id);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
        setAnim((n) => n + 1);
      }}
      aria-pressed={on}
      aria-label={on ? "Remove bookmark" : "Bookmark this course"}
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
      {withLabel && (on ? "Saved" : "Save")}
    </button>
  );
}
