import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { providers, providerBySlug } from "@/data/providers";
import { courses } from "@/data/courses";
import { ProviderAvatar } from "@/components/ProviderAvatar";
import { CourseCard } from "@/components/CourseCard";

export function generateStaticParams() {
  return providers.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = providerBySlug[(await params).slug];
  return c ? { title: `Free ${c.name} courses`, description: c.blurb } : {};
}

export default async function ProviderPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = providerBySlug[(await params).slug];
  if (!p) notFound();
  const list = courses.filter((c) => c.provider === p.slug).sort((a, b) => Number(b.cost === "free-cert") - Number(a.cost === "free-cert"));
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link href="/providers" className="text-sm font-semibold text-brand">← All providers</Link>
      <header className="hero-bg mt-4 flex flex-col gap-4 rounded-3xl border border-line bg-surface p-6 sm:flex-row sm:items-center sm:p-8">
        <ProviderAvatar slug={p.slug} size="lg" />
        <div className="flex-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">{p.kind === "company" ? "Company certifications" : "Learning platform"}</span>
          <h1 className="font-display text-3xl font-bold">Free {p.name} courses</h1>
          <p className="mt-1 max-w-2xl text-muted">{p.blurb}</p>
        </div>
        <a href={p.portalUrl} target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-line bg-surface px-4 py-2.5 text-center font-semibold hover:border-brand">
          Visit {p.portal} ↗
        </a>
      </header>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((c) => <CourseCard key={c.id} course={c} />)}
      </div>
    </div>
  );
}
