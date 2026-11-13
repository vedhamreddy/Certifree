import Link from "next/link";
import { companyBySlug } from "@/data/companies";
import { Course, levelLabels } from "@/data/courses";
import { CompanyAvatar } from "./CompanyAvatar";
import { CostTag, CredentialTag } from "./Tags";
import { BookmarkButton } from "./BookmarkButton";

export function formatHours(h: number) {
  return h < 1 ? `${Math.round(h * 60)} min` : `${h} h`;
}

export function CourseCard({ course }: { course: Course }) {
  const company = companyBySlug[course.company];
  return (
    <Link
      href={`/courses/${course.id}`}
      className="group relative flex flex-col rounded-2xl border border-line bg-surface p-5 shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[0_12px_30px_rgba(79,70,229,0.12)]"
    >
      <div className="mb-3 flex items-center gap-3 pr-8">
        <CompanyAvatar slug={course.company} />
        <span className="truncate text-sm font-medium text-muted">{company.portal.split(",")[0]}</span>
      </div>
      <div className="absolute right-3 top-3">
        <BookmarkButton id={course.id} />
      </div>
      <h3 className="mb-3 line-clamp-2 min-h-[2.75rem] font-semibold leading-snug group-hover:text-brand">{course.title}</h3>
      <div className="flex flex-wrap gap-1.5">
        <CostTag cost={course.cost} />
        <CredentialTag credential={course.credential} />
      </div>
      <div className="mt-auto flex justify-between pt-4 text-sm text-muted">
        <span>{levelLabels[course.level]} · {formatHours(course.hours)}</span>
        <span>{company.name}</span>
      </div>
    </Link>
  );
}
