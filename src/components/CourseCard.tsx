import Link from "next/link";
import { CircleCheck, Clock3, SignalMedium } from "lucide-react";
import { providerBySlug } from "@/data/providers";
import { Course } from "@/data/courses";
import { T } from "@/lib/i18n";
import { ProviderAvatar } from "./ProviderAvatar";
import { CostTag, CredentialTag } from "./Tags";
import { BookmarkButton } from "./BookmarkButton";
import { PriorityBadge } from "./PriorityBadge";
import { ClosesBadge } from "./ClosesBadge";

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
      className="group relative flex flex-col rounded-3xl border border-line bg-white p-5 shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lift"
    >
      <div className="mb-4 flex items-center gap-3 pr-8">
        <ProviderAvatar slug={course.provider} />
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-ink">{p.name}</span>
          {p.portal !== p.name && <span className="block truncate text-xs text-muted">{p.portal}</span>}
        </span>
      </div>
      <div className="absolute right-3 top-3">
        <BookmarkButton id={course.id} />
      </div>
      <h3 className="mb-4 line-clamp-2 min-h-[2.75rem] text-[15px] font-semibold leading-snug text-ink transition-colors group-hover:text-accent">{course.title}</h3>
      <div className="flex flex-wrap gap-1.5">
        <CostTag cost={course.cost} />
        <CredentialTag credential={course.credential} />
        <ClosesBadge date={course.closesOn} />
      </div>
      {course.priority && <div className="mt-3"><PriorityBadge priority={course.priority} reason={course.priorityReason} /></div>}
      <div className="min-h-4 flex-1" />
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-line pt-3.5 text-[13px] text-muted">
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1 whitespace-nowrap">
          <span className="inline-flex items-center gap-1"><SignalMedium size={14} strokeWidth={1.75} aria-hidden /><T k={`level.${course.level}`} /></span>
          {time && <span className="inline-flex items-center gap-1"><Clock3 size={14} strokeWidth={1.75} aria-hidden />{time}</span>}
        </span>
        {course.verified && (
          <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-free" title={`Checked ${course.verified}`}>
            <CircleCheck size={13} strokeWidth={2} aria-hidden /> <T k="card.checked" />
          </span>
        )}
      </div>
    </Link>
  );
}
