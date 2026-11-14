"use client";
import Link from "next/link";
import { CircleCheck, PlayCircle } from "lucide-react";
import { courseById } from "@/data/courses";
import { providerBySlug } from "@/data/providers";
import type { CareerPath } from "@/data/paths";
import { useLearning } from "@/lib/learning";
import { useCertificates } from "@/lib/certificates";
import { ProviderAvatar } from "./ProviderAvatar";
import { CostTag } from "./Tags";
import { T, useT } from "@/lib/i18n";

type StepState = "done" | "doing" | "todo";

/** Progress through a path, from My Courses and My Certificates on this device (and sync, if on). */
export function usePathProgress(path: CareerPath) {
  const { list } = useLearning();
  const { forCourse } = useCertificates();
  const states: StepState[] = path.steps.map((s) => {
    const l = list.find((x) => x.courseId === s.courseId);
    if (forCourse(s.courseId) || (l && l.progress >= 100)) return "done";
    return l ? "doing" : "todo";
  });
  const done = states.filter((s) => s === "done").length;
  return { states, done, pct: Math.round((done / path.steps.length) * 100) };
}

export function PathBar({ path }: { path: CareerPath }) {
  const { done, pct } = usePathProgress(path);
  const t = useT();
  return (
    <div>
      <div className="flex justify-between text-xs font-medium text-muted"><span>{t("paths.done", { d: done, n: path.steps.length })}</span><span>{pct}%</span></div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2 ring-1 ring-inset ring-line"><div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

export function PathSteps({ path }: { path: CareerPath }) {
  const t = useT();
  const { states } = usePathProgress(path);
  const { start } = useLearning();
  const next = states.findIndex((s) => s !== "done");
  return (
    <ol className="relative mt-6 space-y-3">
      {path.steps.map((s, i) => {
        const c = courseById[s.courseId];
        const st = states[i];
        return (
          <li key={s.courseId} className={`rounded-3xl border bg-white p-5 shadow-card ${i === next ? "border-ink" : "border-line"}`}>
            <div className="flex items-start gap-4">
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold ${st === "done" ? "bg-brand text-white" : "bg-surface-2 text-ink ring-1 ring-inset ring-line"}`}>
                {st === "done" ? <CircleCheck size={18} strokeWidth={2} aria-label={t("paths.completed")} /> : i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-xs text-muted"><ProviderAvatar slug={c.provider} size="sm" />{providerBySlug[c.provider].name}</div>
                <Link href={`/courses/${c.id}`} className="mt-1 block font-semibold leading-snug text-ink hover:underline">{c.title}</Link>
                <p className="mt-1 text-sm text-muted">{s.why}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <CostTag cost={c.cost} />
                  {st === "todo" && (
                    <button type="button" onClick={() => start(c.id)} className="inline-flex h-8 items-center gap-1.5 rounded-full bg-brand px-3 text-xs font-semibold text-white transition hover:bg-brand-600">
                      <PlayCircle size={14} strokeWidth={2} aria-hidden /> Start learning
                    </button>
                  )}
                  {st === "doing" && <Link href="/learning" className="inline-flex h-8 items-center rounded-full border border-line px-3 text-xs font-semibold text-ink hover:bg-surface-2"><T k="paths.update" /></Link>}
                  {st === "done" && <span className="text-xs font-semibold text-emerald-700"><T k="paths.completed" /></span>}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
