import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { providers, providerBySlug } from "@/data/providers";
import { courses } from "@/data/courses";
import { ProviderAvatar } from "@/components/ProviderAvatar";
import { CourseCard } from "@/components/CourseCard";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

export function generateStaticParams() {
  return providers.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = providerBySlug[(await params).slug];
  return c ? { title: `Free ${c.name} courses`, description: c.blurb, alternates: { canonical: `/providers/${c.slug}` }, openGraph: { title: `Free ${c.name} courses`, description: c.blurb, url: `/providers/${c.slug}` }, twitter: { card: "summary_large_image", title: `Free ${c.name} courses`, description: c.blurb } } : {};
}

export default async function ProviderPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = providerBySlug[(await params).slug];
  if (!p) notFound();
  const list = courses.filter((c) => c.provider === p.slug).sort((a, b) => Number(b.cost === "free-cert") - Number(a.cost === "free-cert"));
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/providers" className="group inline-flex items-center gap-1 text-sm font-semibold text-muted transition-colors hover:text-ink"><ArrowLeft size={16} strokeWidth={1.75} className="transition-transform group-hover:-translate-x-0.5" aria-hidden /> All providers</Link>
      <header className="hero-bg mt-5 flex flex-col gap-5 rounded-3xl border border-line p-6 shadow-card sm:flex-row sm:items-center sm:p-10">
        <ProviderAvatar slug={p.slug} size="lg" />
        <div className="flex-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-accent">{p.kind === "company" ? "Company certifications" : "Learning platform"}</span>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink sm:text-4xl">Free {p.name} courses</h1>
          <p className="mt-2 max-w-2xl leading-relaxed text-muted">{p.blurb}</p>
        </div>
        <a href={p.portalUrl} target="_blank" rel="noopener noreferrer" className="group inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-full border border-line bg-white px-4 text-sm font-semibold text-ink shadow-card transition hover:border-slate-300 hover:bg-surface-2 active:scale-[0.98]">
          Visit {p.portal} <ArrowUpRight size={16} strokeWidth={2} className="text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
        </a>
      </header>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((c) => <CourseCard key={c.id} course={c} />)}
      </div>
    </div>
  );
}
