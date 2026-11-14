"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, BookOpen, CalendarClock, GraduationCap, X } from "lucide-react";
import { useCatalog } from "@/lib/useCatalog";
import { providerBySlug } from "@/data/providers";
import { LearningItem, today, useLearning } from "@/lib/learning";
import { ProviderAvatar } from "@/components/ProviderAvatar";
import { CertificateForm } from "@/components/CertificateForm";
import type { Certificate } from "@/lib/certificates";
import { withSignInNudge } from "@/components/SignInPrompt";

const steps = [0, 25, 50, 75, 100];

function fmt(d: string) {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, day)).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

function Row({ item, onDone }: { item: LearningItem; onDone: (i: LearningItem) => void }) {
  const { update, stop } = useLearning();
  const { byId: courseById } = useCatalog();
  const c = courseById[item.courseId];
  if (!c) return null;
  const p = providerBySlug[c.provider];
  const overdue = item.targetDate && item.targetDate < today() && item.progress < 100;
  return (
    <article className="flex flex-col rounded-3xl border border-line bg-white p-5 shadow-card">
      <div className="flex items-start gap-3">
        <ProviderAvatar slug={c.provider} />
        <div className="min-w-0 flex-1">
          <Link href={`/courses/${c.id}`} className="line-clamp-2 font-semibold leading-snug text-ink transition-colors hover:text-accent">{c.title}</Link>
          <p className="mt-0.5 text-sm text-muted">{p.name} · started {fmt(item.startedOn)}</p>
        </div>
        <button type="button" onClick={() => stop(item.courseId)} aria-label={`Stop tracking ${c.title}`} className="rounded-lg p-1.5 text-muted transition hover:bg-surface-2 hover:text-ink">
          <X size={16} strokeWidth={1.75} aria-hidden />
        </button>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-ink">Progress</span>
          <span className="font-semibold text-brand">{item.progress}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2 ring-1 ring-inset ring-line">
          <div className="h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${item.progress}%` }} />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Set progress">
          {steps.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={item.progress === s}
              onClick={() => update(item.courseId, { progress: s })}
              className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition ${item.progress === s ? "border-brand bg-brand text-white" : "border-line bg-white text-muted hover:border-accent/40 hover:text-accent"}`}
            >
              {s}%
            </button>
          ))}
        </div>
      </div>

      <label className="mt-4 flex items-center gap-2 text-sm">
        <CalendarClock size={16} strokeWidth={1.75} className={overdue ? "text-danger" : "text-muted"} aria-hidden />
        <span className={overdue ? "text-danger" : "text-muted"}>{overdue ? "Target passed" : "Finish by"}</span>
        <input
          type="date"
          value={item.targetDate ?? ""}
          min={item.startedOn}
          onChange={(e) => update(item.courseId, { targetDate: e.target.value || undefined })}
          className="ml-auto rounded-lg border border-line bg-white px-2 py-1 text-sm text-ink outline-none focus:border-accent"
        />
      </label>

      <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
        <a href={c.url} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-3 text-sm font-semibold text-ink transition hover:border-slate-300 hover:bg-surface-2">
          Continue <ArrowUpRight size={14} strokeWidth={2} aria-hidden />
        </a>
        <button type="button" onClick={() => onDone(item)} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-brand px-3 text-sm font-semibold text-white transition hover:bg-brand-600">
          <GraduationCap size={15} strokeWidth={1.75} aria-hidden /> I completed this
        </button>
      </div>
    </article>
  );
}

export default function LearningPage() {
  const { list, stop } = useLearning();
  const { byId: courseById } = useCatalog();
  const [done, setDone] = useState<LearningItem | null>(null);
  const shown = useMemo(() => list.filter((x) => courseById[x.courseId]), [list, courseById]);
  const initial = useMemo<Partial<Certificate> | undefined>(() => {
    const c = done && courseById[done.courseId];
    return c ? { courseId: c.id, title: c.title, provider: c.provider, domain: c.domain } : undefined;
  }, [done, courseById]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">My Courses</h1>
      <p className="mt-2 text-muted">Courses you&apos;re taking now. When you finish one, add the certificate and it moves to My Certificates.</p>
      {shown.length ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((i) => <Row key={i.courseId} item={i} onDone={setDone} />)}
        </div>
      ) : (
        <div className="mt-8 rounded-3xl border border-dashed border-line bg-surface-2 px-6 py-14 text-center">
          <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-white text-accent shadow-card ring-1 ring-inset ring-line"><BookOpen size={22} strokeWidth={1.75} aria-hidden /></span>
          <p className="font-semibold text-ink">You&apos;re not taking any courses yet.</p>
          <p className="mt-1 text-muted">Tap &quot;Start learning&quot; on a course page to track it here.</p>
          <Link href="/courses" className="mt-6 inline-flex h-11 items-center rounded-full bg-brand px-5 text-sm font-semibold text-white shadow-card transition hover:bg-brand-600">Browse courses</Link>
        </div>
      )}
      <CertificateForm
        open={!!done}
        onClose={() => setDone(null)}
        initial={initial}
        onSaved={() => withSignInNudge(() => done && stop(done.courseId))}
      />
    </div>
  );
}
