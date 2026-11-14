import type { Metadata } from "next";
import { WifiOff } from "lucide-react";

export const metadata: Metadata = { title: "You're offline", robots: { index: false } };

/** Shown by the service worker when there's no connection and the page isn't cached yet. */
export default function Offline() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-surface-2 text-muted ring-1 ring-inset ring-line"><WifiOff size={22} strokeWidth={1.75} aria-hidden /></span>
      <h1 className="font-display text-2xl font-bold text-ink">You&apos;re offline</h1>
      <p className="mt-2 text-muted">This page hasn&apos;t been saved for offline use yet. Pages you&apos;ve opened before, your saved courses, My Courses and certificates still work.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <a href="/saved" className="inline-flex h-11 items-center rounded-full bg-brand px-5 text-sm font-semibold text-white shadow-card transition hover:bg-brand-600">Saved courses</a>
        <a href="/certificates" className="inline-flex h-11 items-center rounded-full border border-line bg-white px-5 text-sm font-semibold text-ink shadow-card transition hover:bg-surface-2">My Certificates</a>
      </div>
    </div>
  );
}
