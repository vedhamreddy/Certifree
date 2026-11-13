"use client";
import { useState } from "react";
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
      className={`inline-flex items-center gap-2 rounded-full transition ${withLabel ? "border border-line bg-surface px-4 py-2.5 font-semibold hover:border-brand" : "p-1.5 hover:bg-surface-2"}`}
    >
      <svg key={anim} className={anim ? "pop" : ""} width="20" height="20" viewBox="0 0 24 24" fill={on ? "#4F46E5" : "none"} stroke="#4F46E5" strokeWidth="2" strokeLinejoin="round">
        <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.8 4.5c2.1 0 3.6 1.1 5.2 3 1.6-1.9 3.1-3 5.2-3 3.8 0 5.9 3.9 4.4 7.3C19.5 16.4 12 21 12 21z" />
      </svg>
      {withLabel && (on ? "Saved" : "Save")}
    </button>
  );
}
