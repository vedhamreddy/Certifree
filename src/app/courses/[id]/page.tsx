import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { companyBySlug } from "@/data/companies";
import { courseById, courses, costExplain, credentialLabels, domainLabels, levelLabels } from "@/data/courses";
import { CompanyAvatar } from "@/components/CompanyAvatar";
import { CostTag, CredentialTag } from "@/components/Tags";
import { BookmarkButton } from "@/components/BookmarkButton";
import { CourseCard, formatHours } from "@/components/CourseCard";

export function generateStaticParams() {
  return courses.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const c = courseById[(await params).id];
  return c ? { title: c.title, description: c.summary } : {};
}

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const course = courseById[(await params).id];
  if (!course) notFound();
  const company = companyBySlug[course.company];
  const related = courses.filter((c) => c.id !== course.id && (c.domain === course.domain || c.company === course.company)).slice(0, 3);
  const facts = [
    ["Level", levelLabels[course.level]],
    ["Time", formatHours(course.hours)],
    ["Domain", domainLabels[course.domain]],
    ["Credential", credentialLabels[course.credential]],
  ];
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link href="/courses" className="text-sm font-semibold text-brand">← All courses</Link>
      <div className="mt-4 rounded-3xl border border-line bg-surface p-6 sm:p-8">
        <Link href={`/companies/${company.slug}`} className="inline-flex items-center gap-3">
          <CompanyAvatar slug={company.slug} size="lg" />
          <span>
            <span className="block font-semibold">{company.name}</span>
            <span className="text-sm text-muted">{company.portal}</span>
          </span>
        </Link>
        <h1 className="mt-5 font-display text-3xl font-bold leading-tight sm:text-4xl">{course.title}</h1>
        <p className="mt-3 text-lg text-muted">{course.summary}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <CostTag cost={course.cost} />
          <CredentialTag credential={course.credential} />
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {facts.map(([k, v]) => (
            <div key={k} className="rounded-2xl bg-surface-2 p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{k}</dt>
              <dd className="mt-1 font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <div className="font-semibold">What you get for free</div>
          <p className="mt-1 text-sm text-muted">{costExplain[course.cost]}</p>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a href={course.url} target="_blank" rel="noopener noreferrer" className="rounded-2xl bg-brand px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-brand-600">
            Start on {company.portal.split(",")[0]} ↗
          </a>
          <BookmarkButton id={course.id} withLabel />
        </div>
        <p className="mt-4 text-xs text-muted">
          {course.lastVerified ? `Last verified ${course.lastVerified}.` : "Not verified yet."} Free status can change; confirm on the provider&apos;s site.
        </p>
      </div>
      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 font-display text-2xl font-bold">You might also like</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((c) => <CourseCard key={c.id} course={c} />)}
          </div>
        </section>
      )}
    </div>
  );
}
