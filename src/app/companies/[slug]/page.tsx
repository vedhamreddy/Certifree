import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { companies, companyBySlug } from "@/data/companies";
import { courses } from "@/data/courses";
import { CompanyAvatar } from "@/components/CompanyAvatar";
import { CourseCard } from "@/components/CourseCard";

export function generateStaticParams() {
  return companies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = companyBySlug[(await params).slug];
  return c ? { title: `Free ${c.name} courses`, description: c.blurb } : {};
}

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const company = companyBySlug[(await params).slug];
  if (!company) notFound();
  const list = courses.filter((c) => c.company === company.slug).sort((a, b) => Number(b.cost === "free-cert") - Number(a.cost === "free-cert"));
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link href="/companies" className="text-sm font-semibold text-brand">← All companies</Link>
      <header className="hero-bg mt-4 flex flex-col gap-4 rounded-3xl border border-line bg-surface p-6 sm:flex-row sm:items-center sm:p-8">
        <CompanyAvatar slug={company.slug} size="lg" />
        <div className="flex-1">
          <h1 className="font-display text-3xl font-bold">All free {company.name} courses</h1>
          <p className="mt-1 max-w-2xl text-muted">{company.blurb}</p>
        </div>
        <a href={company.portalUrl} target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-line bg-surface px-4 py-2.5 font-semibold hover:border-brand">
          Visit {company.portal.split(",")[0]} ↗
        </a>
      </header>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((c) => <CourseCard key={c.id} course={c} />)}
      </div>
    </div>
  );
}
