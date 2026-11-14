import { GraduationCap } from "lucide-react";
import type { Course } from "@/data/courses";

const CHECK = "Check on the provider's site";

/** NPTEL / SWAYAM facts. Only confirmed values are shown; anything else says to check the provider. */
export function AcademicFacts({ course }: { course: Course }) {
  const a = course.academic;
  if (!a) return null;
  const rows: [string, string][] = [
    ["Exam fee", a.examFee ?? CHECK],
    ["Duration", a.weeks ? `${a.weeks} weeks` : CHECK],
    ["Semester", a.semester ?? CHECK],
    ["College credit", a.credit ? "Yes, under UGC/AICTE credit transfer (up to 40% of credits). Your college decides." : CHECK],
  ];
  return (
    <div className="mt-4 rounded-2xl bg-surface-2 p-4">
      <div className="flex items-center gap-2 font-semibold text-ink"><GraduationCap size={18} strokeWidth={1.75} aria-hidden /> NPTEL / SWAYAM details</div>
      <dl className="mt-3 grid gap-2 sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div key={k} className="rounded-xl bg-white p-3 ring-1 ring-inset ring-line">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">{k}</dt>
            <dd className={`mt-0.5 text-sm ${v === CHECK ? "text-muted" : "font-semibold text-ink"}`}>{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-xs text-muted">Confirmed on <a href={a.source} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{new URL(a.source).hostname}</a> on {a.checked}.</p>
    </div>
  );
}
