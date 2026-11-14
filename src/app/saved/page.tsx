"use client";
import Link from "next/link";
import { courseById } from "@/data/courses";
import { useBookmarks } from "@/lib/bookmarks";
import { CourseCard } from "@/components/CourseCard";
import { Heart } from "lucide-react";

export default function SavedPage() {
  const { ids } = useBookmarks();
  const list = ids.map((id) => courseById[id]).filter(Boolean);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">Saved courses</h1>
      <p className="mt-2 text-muted">Saved on this device. Want them on your other devices too? <Link href="/sync" className="font-semibold text-accent hover:text-brand">Set up sync</Link>.</p>
      {list.length ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((c) => <CourseCard key={c.id} course={c} />)}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-line bg-surface-2 px-6 py-14 text-center">
          <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-white text-accent shadow-card ring-1 ring-inset ring-line"><Heart size={22} strokeWidth={1.75} aria-hidden /></span>
          <p className="font-semibold text-ink">Nothing saved yet.</p>
          <p className="mt-1 text-muted">Tap the heart on any course to keep it here.</p>
          <Link href="/courses" className="mt-6 inline-flex h-11 items-center rounded-xl bg-brand px-5 text-sm font-semibold text-white shadow-card transition hover:bg-brand-600 active:scale-[0.98]">Browse courses</Link>
        </div>
      )}
    </div>
  );
}
