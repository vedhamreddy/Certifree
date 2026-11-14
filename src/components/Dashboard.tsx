"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Award, BookOpen, CalendarClock, ChevronDown, Download, Gauge, Heart } from "lucide-react";
import { courseById } from "@/data/courses";
import { providerBySlug } from "@/data/providers";
import { useBookmarks } from "@/lib/bookmarks";
import { useCertificates } from "@/lib/certificates";
import { useLearning, today, type LearningItem } from "@/lib/learning";
import { ProviderAvatar } from "./ProviderAvatar";

const card = "min-w-0 rounded-3xl border border-line bg-white p-5 sm:p-6";
const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);

function fmt(d: string) {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, day)).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });
}

type Status = "Overdue" | "Due soon" | "In progress" | "Not started" | "Ready";
function statusOf(x: LearningItem): Status {
  if (x.progress >= 100) return "Ready";
  if (x.targetDate && x.targetDate < today()) return "Overdue";
  if (x.targetDate && daysBetween(today(), x.targetDate) <= 7) return "Due soon";
  return x.progress > 0 ? "In progress" : "Not started";
}

function Pill({ s }: { s: Status }) {
  const dark = s === "Overdue" || s === "Ready";
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${dark ? "bg-brand text-white" : "bg-surface-2 text-ink ring-1 ring-inset ring-line"}`}>
      {s === "Overdue" && <span className="h-1.5 w-1.5 rounded-full bg-red-400" aria-hidden />}
      {s === "Ready" && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />}
      {s}
    </span>
  );
}

function Stat({ icon: Icon, value, label, href, highlight }: { icon: typeof Heart; value: string | number; label: string; href: string; highlight?: boolean }) {
  return (
    <Link href={href} className="group flex min-h-40 flex-col justify-between rounded-3xl bg-surface-2 p-5 transition hover:bg-[#eeeeee]">
      <span className={`grid h-11 w-11 place-items-center rounded-full ${highlight ? "bg-brand text-white" : "bg-white text-ink ring-1 ring-inset ring-line"}`}>
        <Icon size={19} strokeWidth={1.75} aria-hidden />
      </span>
      <span>
        <span className="block font-display text-4xl font-extrabold tracking-tight text-ink">{value}</span>
        <span className="mt-1 flex items-center justify-between text-sm text-muted">
          {label}
          <ArrowUpRight size={15} strokeWidth={1.75} className="opacity-0 transition group-hover:opacity-100" aria-hidden />
        </span>
      </span>
    </Link>
  );
}

/** Learner dashboard. Everything here comes from this device (and sync, if switched on). */
export function Dashboard() {
  const { ids } = useBookmarks();
  const { list: learning } = useLearning();
  const { list: certs } = useCertificates();
  const [filter, setFilter] = useState<"all" | "active" | "due">("all");

  const inProgress = learning.filter((x) => courseById[x.courseId]);
  const avg = inProgress.length ? Math.round(inProgress.reduce((n, x) => n + x.progress, 0) / inProgress.length) : 0;

  // Last 6 months: courses started (grey) vs certificates earned (black)
  const months = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5 + i, 1));
      const key = d.toISOString().slice(0, 7);
      return {
        key,
        label: d.toLocaleDateString("en-IN", { month: "short", timeZone: "UTC" }),
        started: learning.filter((x) => x.startedOn.startsWith(key)).length + certs.filter((c) => c.courseId && c.addedAt?.startsWith(key)).length,
        earned: certs.filter((c) => c.issuedOn.startsWith(key)).length,
      };
    });
  }, [learning, certs]);
  const peak = Math.max(1, ...months.map((m) => Math.max(m.started, m.earned)));
  const anyActivity = months.some((m) => m.started || m.earned);

  const deadlines = inProgress
    .filter((x) => x.targetDate && x.progress < 100)
    .sort((a, b) => a.targetDate!.localeCompare(b.targetDate!))
    .slice(0, 5);

  const rows = inProgress.filter((x) => {
    const s = statusOf(x);
    return filter === "all" || (filter === "active" ? s === "In progress" || s === "Not started" : s === "Overdue" || s === "Due soon");
  });

  function exportCsv() {
    const esc = (v = "") => `"${String(v).replace(/"/g, '""')}"`;
    const lines = ["Course,Provider,Progress,Started,Target,Status", ...inProgress.map((x) => {
      const c = courseById[x.courseId];
      return [c.title, providerBySlug[c.provider].name, `${x.progress}%`, x.startedOn, x.targetDate ?? "", statusOf(x)].map(esc).join(",");
    })];
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
    a.download = "my-courses.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="min-w-0 space-y-4">
      <section aria-labelledby="stats-title">
        <h2 id="stats-title" className="mb-3 font-display text-lg font-bold text-ink">Quick stats</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat icon={BookOpen} value={inProgress.length} label="In progress" href="/learning" highlight />
          <Stat icon={Award} value={certs.length} label="Certificates" href="/certificates" />
          <Stat icon={Heart} value={ids.length} label="Saved courses" href="/saved" />
          <Stat icon={Gauge} value={`${avg}%`} label="Average progress" href="/learning" />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section className={card} aria-labelledby="activity-title">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="activity-title" className="font-display text-lg font-bold text-ink">Learning activity</h2>
            <div className="flex items-center gap-4 text-xs text-muted">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#d9d9d9]" />Started</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-brand" />Certificates</span>
            </div>
          </div>
          <div className="relative mt-6 flex h-48 items-end justify-between gap-2 sm:gap-4" role="img" aria-label={`Last six months: ${months.map((m) => `${m.label} ${m.started} started, ${m.earned} certificates`).join("; ")}`}>
            {months.map((m) => (
              <div key={m.key} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <div className="flex h-full w-full items-end justify-center gap-1">
                  <div className="w-full max-w-5 rounded-full bg-[#d9d9d9] transition-[height] duration-500" style={{ height: m.started ? `${(m.started / peak) * 100}%` : "4px" }} />
                  <div className="w-full max-w-5 rounded-full bg-brand transition-[height] duration-500" style={{ height: m.earned ? `${(m.earned / peak) * 100}%` : "4px" }} />
                </div>
                <span className="text-xs text-muted">{m.label}</span>
              </div>
            ))}
            {!anyActivity && (
              <div className="absolute inset-0 grid place-items-center">
                <p className="rounded-full bg-white px-4 py-2 text-sm text-muted ring-1 ring-inset ring-line">Start a course to see your activity</p>
              </div>
            )}
          </div>
        </section>

        <section className={card} aria-labelledby="deadlines-title">
          <div className="flex items-center justify-between">
            <h2 id="deadlines-title" className="font-display text-lg font-bold text-ink">Upcoming deadlines</h2>
            <Link href="/learning" className="text-sm font-semibold text-ink underline-offset-4 hover:underline">View all</Link>
          </div>
          {deadlines.length ? (
            <ul className="mt-4 space-y-2">
              {deadlines.map((x) => {
                const c = courseById[x.courseId];
                const d = daysBetween(today(), x.targetDate!);
                return (
                  <li key={x.courseId} className="flex items-center gap-3 rounded-2xl bg-surface-2 p-2.5 pr-3">
                    <ProviderAvatar slug={c.provider} />
                    <Link href={`/courses/${c.id}`} className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink">{c.title}</span>
                      <span className="block text-xs text-muted">{fmt(x.targetDate!)} · {x.progress}% done</span>
                    </Link>
                    <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${d < 0 ? "bg-brand text-white" : "bg-white text-ink ring-1 ring-inset ring-line"}`}>
                      {d < 0 ? `${-d}d late` : d === 0 ? "Today" : `${d}d left`}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-surface-2 p-4 text-sm text-muted">
              <CalendarClock size={18} strokeWidth={1.75} className="shrink-0 text-ink" aria-hidden />
              Set a &quot;Finish by&quot; date in My Courses to see it here.
            </div>
          )}
        </section>
      </div>

      <section className={card} aria-labelledby="mycourses-title">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="mycourses-title" className="font-display text-lg font-bold text-ink">My Courses</h2>
          <div className="flex items-center gap-2">
            <label className="relative">
              <span className="sr-only">Show</span>
              <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="h-10 appearance-none rounded-full border border-line bg-white pl-4 pr-9 text-sm font-medium text-ink outline-none transition hover:bg-surface-2 focus:ring-1 focus:ring-brand">
                <option value="all">All courses</option>
                <option value="active">In progress</option>
                <option value="due">Due soon or overdue</option>
              </select>
              <ChevronDown size={16} strokeWidth={1.75} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
            </label>
            <button type="button" onClick={exportCsv} disabled={!inProgress.length} className="inline-flex h-10 items-center gap-1.5 rounded-full bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40">
              <Download size={15} strokeWidth={1.75} aria-hidden /> Export
            </button>
          </div>
        </div>
        {rows.length ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] border-separate border-spacing-y-2 text-left text-sm">
              <thead>
                <tr className="whitespace-nowrap text-xs text-muted">
                  <th className="px-3 font-medium">Course</th>
                  <th className="px-3 font-medium">Progress</th>
                  <th className="px-3 font-medium">Finish by</th>
                  <th className="px-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((x) => {
                  const c = courseById[x.courseId];
                  return (
                    <tr key={x.courseId} className="bg-surface-2">
                      <td className="rounded-l-2xl px-3 py-3">
                        <Link href={`/courses/${c.id}`} className="flex items-center gap-3">
                          <ProviderAvatar slug={c.provider} size="sm" />
                          <span className="min-w-0">
                            <span className="block max-w-[260px] truncate font-semibold text-ink">{c.title}</span>
                            <span className="block text-xs text-muted">{providerBySlug[c.provider].name}</span>
                          </span>
                        </Link>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[#dddddd]"><div className="h-full rounded-full bg-brand" style={{ width: `${x.progress}%` }} /></div>
                          <span className="text-xs font-medium text-ink">{x.progress}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-muted">{x.targetDate ? fmt(x.targetDate) : "—"}</td>
                      <td className="rounded-r-2xl px-3 py-3"><Pill s={statusOf(x)} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-4 flex flex-col items-start gap-3 rounded-2xl bg-surface-2 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted">{inProgress.length ? "No courses match this filter." : "You're not taking any courses yet. Tap “Start learning” on any course page."}</p>
            <Link href="/courses?cost=free-cert" className="inline-flex h-10 shrink-0 items-center rounded-full bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-600">Find a free course</Link>
          </div>
        )}
      </section>
    </div>
  );
}
