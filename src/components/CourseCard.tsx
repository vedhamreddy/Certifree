import Link from "next/link";
import { providerBySlug } from "@/data/providers";
import { Course, levelLabels } from "@/data/courses";
import { ProviderAvatar } from "./ProviderAvatar";
import { CostTag, CredentialTag } from "./Tags";
import { BookmarkButton } from "./BookmarkButton";

export function formatHours(h?: number) {
  if (h == null) return null;
  return h < 1 ? `${Math.round(h * 60)} min` : `${Number.isInteger(h) ? h : h.toFixed(1)} h`;
}

export function CourseCard({ course }: { course: Course }) {
  const p = providerBySlug[course.provider];
  const time = formatHours(course.hours);
  return (
    <Link
      href={`/courses/${course.id}`}
      className="group relative flex flex-col rounded-2xl border border-line bg-surface p-5 shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[0_12px_30px_rgba(79,70,229,0.12)] focus-visible:outline-2 focus-visible:outline-brand"
    >
      <div className="mb-3 flex items-center gap-3 pr-8">
        <ProviderAvatar slug={course.provider} />
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold">{p.name}</span>
          {p.portal !== p.name && <span className="block truncate text-xs text-muted">{p.portal}</span>}
        </span>
      </div>
      <div className="absolute right-3 top-3">
        <BookmarkButton id={course.id} />
      </div>
      <h3 className="mb-3 line-clamp-2 min-h-[2.75rem] font-semibold leading-snug group-hover:text-brand">{course.title}</h3>
      <div className="flex flex-wrap gap-1.5">
        <CostTag cost={course.cost} />
        <CredentialTag credential={course.credential} />
      </div>
      <div className="mt-auto flex items-center justify-between pt-4 text-sm text-muted">
        <span>{levelLabels[course.level]}{time ? ` · ${time}` : ""}</span>
        {course.verified && <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400" title={`Checked ${course.verified}`}>✓ Checked</span>}
      </div>
    </Link>
  );
}
