import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAuthed } from "@/lib/supabase/server";
import { findCourse } from "@/lib/catalog-server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Course stats", robots: { index: false, follow: false } };

type Row = { course_id: string; day: string; views: number; clicks: number };

export default async function StatsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const a = await getAuthed();
  if (!a) notFound();
  const { data: isAdmin } = await a.supabase.rpc("is_catalog_admin");
  if (isAdmin !== true) notFound();
  const days = [7, 30, 90].includes(Number((await searchParams).days)) ? Number((await searchParams).days) : 30;
  const since = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
  const { data, error } = await a.supabase.from("course_stats").select("course_id, day, views, clicks").gte("day", since).limit(20000);
  const rows = (data ?? []) as Row[];
  const byCourse = new Map<string, { views: number; clicks: number }>();
  const byDay = new Map<string, number>();
  for (const r of rows) {
    const c = byCourse.get(r.course_id) ?? { views: 0, clicks: 0 };
    c.views += r.views;
    c.clicks += r.clicks;
    byCourse.set(r.course_id, c);
    byDay.set(r.day, (byDay.get(r.day) ?? 0) + r.views);
  }
  const top = [...byCourse.entries()].sort((x, y) => y[1].views - x[1].views).slice(0, 50);
  const titles = Object.fromEntries(await Promise.all(top.map(async ([id]) => [id, (await findCourse(id))?.title ?? id])));
  const totalViews = rows.reduce((n, r) => n + r.views, 0);
  const totalClicks = rows.reduce((n, r) => n + r.clicks, 0);
  const dayList = [...byDay.entries()].sort();
  const max = Math.max(1, ...dayList.map(([, v]) => v));
  const tab = (d: number) => `rounded-full px-4 py-2 text-sm font-semibold ${d === days ? "bg-brand text-white" : "bg-white text-ink ring-1 ring-inset ring-line"}`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Course stats</h1>
          <p className="mt-1 text-sm text-muted">Daily totals only. No cookies, user IDs or IP addresses are stored. <Link href="/admin/reports" className="font-semibold text-ink underline underline-offset-4">Reports</Link></p>
        </div>
        <div className="flex gap-2">{[7, 30, 90].map((d) => <Link key={d} href={`/admin/stats?days=${d}`} className={tab(d)}>{d} days</Link>)}</div>
      </div>
      {error && <p className="mt-6 text-sm text-danger">Couldn&apos;t load stats.</p>}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[["Course page views", totalViews], ["Go to course clicks", totalClicks], ["Click rate", totalViews ? `${Math.round((totalClicks / totalViews) * 100)}%` : "–"]].map(([k, v]) => (
          <div key={k} className="rounded-3xl border border-line bg-white p-5 shadow-card">
            <div className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">{k}</div>
            <div className="mt-1 font-display text-3xl font-bold text-ink">{typeof v === "number" ? v.toLocaleString("en-IN") : v}</div>
          </div>
        ))}
      </div>
      {dayList.length > 0 && (
        <div className="mt-4 rounded-3xl border border-line bg-white p-5 shadow-card">
          <div className="text-sm font-semibold text-ink">Views per day</div>
          <div className="mt-4 flex h-32 items-end gap-1" role="img" aria-label="Views per day">
            {dayList.map(([d, v]) => <div key={d} title={`${d}: ${v}`} className="flex-1 rounded-t bg-brand" style={{ height: `${Math.max(2, (v / max) * 100)}%` }} />)}
          </div>
        </div>
      )}
      <div className="mt-4 overflow-x-auto rounded-3xl border border-line bg-white p-5 shadow-card">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead><tr className="text-xs text-muted"><th className="pb-2 font-medium">Course</th><th className="pb-2 text-right font-medium">Views</th><th className="pb-2 text-right font-medium">Clicks</th></tr></thead>
          <tbody>
            {top.map(([id, s]) => (
              <tr key={id} className="border-t border-line">
                <td className="py-2 pr-3"><Link href={`/courses/${id}`} className="text-ink hover:underline">{titles[id]}</Link></td>
                <td className="py-2 text-right tabular-nums">{s.views}</td>
                <td className="py-2 text-right tabular-nums">{s.clicks}</td>
              </tr>
            ))}
            {!top.length && <tr><td colSpan={3} className="py-6 text-center text-muted">No data yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
