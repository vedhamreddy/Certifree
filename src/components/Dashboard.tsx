"use client";
import Link from "next/link";
import { useState } from "react";
import { CalendarClock, ChevronDown, Download } from "lucide-react";
import { useCatalog } from "@/lib/useCatalog";
import { providerBySlug } from "@/data/providers";
import { useLearning, today, type LearningItem } from "@/lib/learning";
import { ProviderAvatar } from "./ProviderAvatar";
import { useDeadlines } from "@/lib/useDeadlines";
import { localToday } from "@/lib/deadlines";
import { RecommendedForYou } from "./RecommendedForYou";
import { T, useT } from "@/lib/i18n";

const statusKey: Record<string, string> = { Overdue: "status.overdue", "Due soon": "status.dueSoon", "In progress": "status.inProgress", "Not started": "status.notStarted", Ready: "status.ready" };

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
      <T k={statusKey[s]} />
    </span>
  );
}

/** Learner dashboard. Everything here comes from this device (and sync, if switched on). */
export function Dashboard() {
  const { list: learning } = useLearning();
  const { byId: courseById } = useCatalog();
  const [filter, setFilter] = useState<"all" | "active" | "due">("all");
  const t = useT();

  const inProgress = learning.filter((x) => courseById[x.courseId]);

  const deadlines = useDeadlines().all.slice(0, 5);

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
      <RecommendedForYou />
      <div className="grid grid-cols-1 gap-4">
        <section className={card} aria-labelledby="deadlines-title">
          <div className="flex items-center justify-between">
            <h2 id="deadlines-title" className="font-display text-lg font-bold text-ink">{t("dash.deadlines")}</h2>
            <Link href="/deadlines" className="text-sm font-semibold text-ink underline-offset-4 hover:underline">{t("dash.viewAll")}</Link>
          </div>
          {deadlines.length ? (
            <ul className="mt-4 space-y-2">
              {deadlines.map((x) => {
                const c = courseById[x.courseId];
                const d = daysBetween(localToday(), x.date);
                return (
                  <li key={x.key} className="flex items-center gap-3 rounded-2xl bg-surface-2 p-2.5 pr-3">
                    <ProviderAvatar slug={c.provider} />
                    <Link href={`/courses/${c.id}`} className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink">{c.title}</span>
                      <span className="block text-xs text-muted">{fmt(x.date)} · {x.kind === "offer" ? t("dash.offerCloses") : t("dash.yourDate")}</span>
                    </Link>
                    <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${d < 0 ? "bg-brand text-white" : x.kind === "offer" ? "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-600/20" : "bg-white text-ink ring-1 ring-inset ring-line"}`}>
                      {d < 0 ? t("dash.late", { n: -d }) : d === 0 ? t("dash.today") : t("dash.left", { n: d })}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-surface-2 p-4 text-sm text-muted">
              <CalendarClock size={18} strokeWidth={1.75} className="shrink-0 text-ink" aria-hidden />
              {t("dash.noDeadlines")}
            </div>
          )}
        </section>
      </div>

      <section className={card} aria-labelledby="mycourses-title">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="mycourses-title" className="font-display text-lg font-bold text-ink">{t("dash.myCourses")}</h2>
          <div className="flex items-center gap-2">
            <label className="relative">
              <span className="sr-only">{t("dash.show")}</span>
              <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="h-10 appearance-none rounded-full border border-line bg-white pl-4 pr-9 text-sm font-medium text-ink outline-none transition hover:bg-surface-2 focus:ring-1 focus:ring-brand">
                <option value="all">{t("dash.fAll")}</option>
                <option value="active">{t("status.inProgress")}</option>
                <option value="due">{t("dash.fDue")}</option>
              </select>
              <ChevronDown size={16} strokeWidth={1.75} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
            </label>
            <button type="button" onClick={exportCsv} disabled={!inProgress.length} className="inline-flex h-10 items-center gap-1.5 rounded-full bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40">
              <Download size={15} strokeWidth={1.75} aria-hidden /> {t("dash.export")}
            </button>
          </div>
        </div>
        {rows.length ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] border-separate border-spacing-y-2 text-left text-sm">
              <thead>
                <tr className="whitespace-nowrap text-xs text-muted">
                  <th className="px-3 font-medium">{t("dash.thCourse")}</th>
                  <th className="px-3 font-medium">{t("dash.thProgress")}</th>
                  <th className="px-3 font-medium">{t("dash.thFinish")}</th>
                  <th className="px-3 font-medium">{t("dash.thStatus")}</th>
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
            <p className="text-sm text-muted">{inProgress.length ? t("dash.noMatch") : t("dash.empty")}</p>
            <Link href="/courses?cost=free-cert" className="inline-flex h-10 shrink-0 items-center rounded-full bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-600">{t("dash.find")}</Link>
          </div>
        )}
      </section>
    </div>
  );
}
