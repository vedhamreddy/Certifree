"use client";
import Link from "next/link";
import { courseById } from "@/data/courses";
import { useBookmarks } from "@/lib/bookmarks";
import { CourseCard } from "@/components/CourseCard";

export default function SavedPage() {
  const { ids } = useBookmarks();
  const list = ids.map((id) => courseById[id]).filter(Boolean);
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-3xl font-bold">Saved courses</h1>
      <p className="mt-2 text-muted">Saved on this device. Sign-in to sync across devices comes next.</p>
      {list.length ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((c) => <CourseCard key={c.id} course={c} />)}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-line bg-surface p-10 text-center">
          <div className="mb-2 text-4xl">♡</div>
          <p className="font-semibold">Nothing saved yet.</p>
          <p className="mt-1 text-muted">Tap the heart on any course to keep it here.</p>
          <Link href="/courses" className="mt-4 inline-block rounded-2xl bg-brand px-5 py-2.5 font-semibold text-white">Browse courses</Link>
        </div>
      )}
    </div>
  );
}
