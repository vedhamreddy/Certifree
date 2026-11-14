import Link from "next/link";
import { ArrowRight, Footprints, Route, Target } from "lucide-react";
import { courses, type Course } from "@/data/courses";
import { bestFor, neighbours, pathOf } from "@/lib/recommend";
import { T } from "@/lib/i18n";

/** "Is this the right course for me?": who it suits, what to take first, and what to take next. */
export function CourseGuide({ course }: { course: Course }) {
  const tags = bestFor(course);
  const { before, next } = neighbours(course, courses);
  const pos = pathOf(course.id);
  if (!tags.length && !before && !next) return null;
  const step = (icon: React.ReactNode, label: string, c: Course) => (
    <Link href={`/courses/${c.id}`} className="group flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-inset ring-line transition hover:shadow-card">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-2 text-ink">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-muted"><T k={label} /></span>
        <span className="block truncate text-sm font-semibold text-ink group-hover:underline">{c.title}</span>
      </span>
      <ArrowRight size={16} strokeWidth={1.75} className="shrink-0 text-muted" aria-hidden />
    </Link>
  );
  return (
    <section className="mt-4 rounded-2xl bg-surface-2 p-4" aria-labelledby="guide-title">
      <h2 id="guide-title" className="flex items-center gap-2 font-semibold text-ink"><Target size={18} strokeWidth={1.75} aria-hidden /> <T k="guide.title" /></h2>
      {tags.length > 0 && (
        <div className="mt-3">
          <span className="text-xs text-muted"><T k="best.title" />:</span>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {tags.map((k) => <li key={k} className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-ink ring-1 ring-inset ring-line"><T k={k} /></li>)}
          </ul>
        </div>
      )}
      {(before || next) && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {before && step(<Footprints size={16} strokeWidth={1.75} aria-hidden />, "guide.before", before)}
          {next && step(<ArrowRight size={16} strokeWidth={1.75} aria-hidden />, "guide.next", next)}
        </div>
      )}
      {pos && (
        <Link href={`/paths/${pos.path.slug}`} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ink underline-offset-4 hover:underline">
          <Route size={15} strokeWidth={1.75} aria-hidden /> <T k="guide.inPath" vars={{ p: pos.path.title, i: pos.i + 1, n: pos.path.steps.length }} />
        </Link>
      )}
      <p className="mt-3 text-sm">
        <Link href="/find" className="font-semibold text-accent hover:text-brand"><T k="guide.notSure" /> →</Link>
      </p>
    </section>
  );
}
