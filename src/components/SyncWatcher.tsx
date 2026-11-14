"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { readBookmarks } from "@/lib/bookmarks";
import { readCertificates } from "@/lib/certificates";
import { readLearning } from "@/lib/learning";
import { activeFor, api, fetchMe, hasSyncProblem, readSettings, useSyncSettings } from "@/lib/sync";
import { countDiff, diff, type State } from "@/lib/sync-diff";

/**
 * When sync is on, checks whether the account changed on another device. It never merges:
 * it only shows a banner that leads to the review screen.
 */
export function SyncWatcher() {
  const path = usePathname();
  const settings = useSyncSettings();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!settings) return setPending(false);
    let last = 0;
    let live = true;
    const check = async () => {
      if (Date.now() - last < 60_000 || document.visibilityState === "hidden") return;
      last = Date.now();
      const me = await fetchMe();
      const s = readSettings();
      if (!s || !activeFor(s, me, "bookmarks") && !activeFor(s, me, "learning") && !activeFor(s, me, "certificates")) return;
      try {
        const cloud: State = await (await api("/api/sync")).json();
        const local: State = { bookmarks: readBookmarks(), learning: readLearning(), certificates: readCertificates() };
        if (live) setPending(hasSyncProblem() || countDiff(diff(local, cloud, s)) > 0);
      } catch {
        /* offline or signed out: try again later */
      }
    };
    check();
    document.addEventListener("visibilitychange", check);
    return () => {
      live = false;
      document.removeEventListener("visibilitychange", check);
    };
  }, [settings, path]);

  if (!pending || path.startsWith("/sync")) return null;
  return (
    <div className="border-b border-accent/15 bg-accent/[0.05]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 text-sm sm:px-6 lg:px-8">
        <RefreshCw size={16} strokeWidth={1.75} className="text-accent" aria-hidden />
        <span className="text-ink">This device and your account have differences.</span>
        <Link href="/sync" className="font-semibold text-accent hover:text-brand">Review changes →</Link>
      </div>
    </div>
  );
}
