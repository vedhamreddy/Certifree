import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { providerBySlug } from "@/data/providers";
import { courses } from "@/data/courses";
import { T } from "@/lib/i18n";
import { ProviderAvatar } from "@/components/ProviderAvatar";
import { CostTag, CredentialTag } from "@/components/Tags";
import { BookmarkButton } from "@/components/BookmarkButton";
import { CompleteCourse } from "@/components/CompleteCourse";
import { LearningButton } from "@/components/LearningButton";
import { CourseCard, formatHours } from "@/components/CourseCard";
import { PriorityBadge } from "@/components/PriorityBadge";
import { CourseDeadline } from "@/components/CourseDeadline";
import { AcademicFacts } from "@/components/AcademicFacts";
import { ReportProblem } from "@/components/ReportProblem";
import { TrackCourse } from "@/components/TrackCourse";
import { CourseGuide } from "@/components/CourseGuide";
import { CompareButton } from "@/components/CompareButton";
import { findCourse } from "@/lib/catalog-server";
import { ArrowLeft, ArrowUpRight, Gift } from "lucide-react";

export function generateStaticParams() {
  return courses.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const c = await findCourse((await params).id);
  return c ? { title: c.title, description: c.summary, alternates: { canonical: `/courses/${c.id}` }, openGraph: { title: c.title, description: c.summary, type: "article", url: `/courses/${c.id}` }, twitter: { card: "summary_large_image", title: c.title, description: c.summary } } : {};
}

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const course = await findCourse((await params).id);
  if (!course) notFound();
  const company = providerBySlug[course.provider];
  const related = courses.filter((c) => c.id !== course.id && (c.domain === course.domain || c.provider === course.provider)).slice(0, 3);
  const facts: [string, React.ReactNode][] = [
    ["course.level", <T key="l" k={`level.${course.level}`} />],
    ["course.time", formatHours(course.hours) ?? <T key="t" k="course.selfPaced" />],
    ["course.domain", <T key="d" k={`domain.${course.domain}`} />],
    ["course.credential", <T key="c" k={`cred.${course.credential}`} />],
  ];
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/courses" className="group inline-flex items-center gap-1 text-sm font-semibold text-muted transition-colors hover:text-ink"><ArrowLeft size={16} strokeWidth={1.75} className="transition-transform group-hover:-translate-x-0.5" aria-hidden /> <T k="course.all" /></Link>
      <div className="mt-5 rounded-3xl border border-line bg-white p-6 shadow-card sm:p-10">
        <Link href={`/providers/${company.slug}`} className="group inline-flex items-center gap-3">
          <ProviderAvatar slug={company.slug} size="lg" />
          <span>
            <span className="block font-semibold text-ink transition-colors group-hover:text-accent">{company.name}</span>
            {company.portal !== company.name && <span className="text-sm text-muted">{company.portal}</span>}
          </span>
        </Link>
        <h1 className="mt-6 font-display text-3xl font-bold leading-tight text-ink sm:text-[40px]">{course.title}</h1>
        <p className="mt-3 max-w-3xl text-lg leading-relaxed text-muted">{course.summary}</p>
        {course.priority && <div className="mt-4 max-w-xl"><PriorityBadge priority={course.priority} reason={course.priorityReason} /></div>}
        <div className="mt-5 flex flex-wrap gap-2">
          <CostTag cost={course.cost} />
          <CredentialTag credential={course.credential} />
        </div>
        <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {facts.map(([k, v]) => (
            <div key={k} className="rounded-xl border border-line bg-surface-2 p-4">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted"><T k={k} /></dt>
              <dd className="mt-1 font-semibold text-ink">{v}</dd>
            </div>
          ))}
        </dl>
        <CourseDeadline course={course} />
        <AcademicFacts course={course} />
        <CourseGuide course={course} />
        <div className="mt-4 flex gap-3 rounded-2xl bg-surface-2 p-4">
          <Gift size={20} strokeWidth={1.75} className="mt-0.5 shrink-0 text-ink" aria-hidden />
          <div>
            <div className="font-semibold text-ink"><T k="course.whatFree" /></div>
            <p className="mt-0.5 text-sm text-muted"><T k={`explain.${course.cost}`} /></p>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a href={course.url} data-track-click target="_blank" rel="noopener noreferrer" className="group inline-flex h-11 items-center gap-1.5 rounded-full bg-brand px-5 text-sm font-semibold text-white shadow-card transition hover:bg-brand-600 active:scale-[0.98]">
            <T k="course.go" vars={{ p: company.name }} /> <ArrowUpRight size={16} strokeWidth={2} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
          </a>
          <LearningButton courseId={course.id} />
          <BookmarkButton id={course.id} withLabel />
          <CompareButton id={course.id} />
          <CompleteCourse course={course} />
        </div>
        <p className="mt-6 border-t border-line pt-4 text-xs leading-relaxed text-muted">
          {course.verified ? <T k="course.checkedOn" vars={{ d: course.verified }} /> : <T k="course.linkChecked" />} <T k="course.confirm" />
        </p>
        <ReportProblem courseId={course.id} />
        <TrackCourse courseId={course.id} />
      </div>
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 font-display text-2xl font-bold text-ink"><T k="course.related" /></h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((c) => <CourseCard key={c.id} course={c} />)}
          </div>
        </section>
      )}
    </div>
  );
}
