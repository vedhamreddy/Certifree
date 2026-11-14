import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { careerPaths, pathBySlug } from "@/data/paths";
import { PathBar, PathSteps } from "@/components/PathProgress";
import { T } from "@/lib/i18n";

// Unknown slugs hit notFound() below. Do not set dynamicParams = false: on Cloudflare
// (OpenNext) that makes every path page 404, because prebuilt pages are not cached there.
export function generateStaticParams() {
  return careerPaths.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = pathBySlug[(await params).slug];
  return p ? { title: `${p.title} path`, description: `${p.blurb} ${p.steps.length} free courses in order.` } : {};
}

export default async function PathPage({ params }: { params: Promise<{ slug: string }> }) {
  const path = pathBySlug[(await params).slug];
  if (!path) notFound();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/paths" className="group inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-ink"><ArrowLeft size={16} strokeWidth={1.75} aria-hidden /> <T k="home.allPaths" /></Link>
      <h1 className="mt-4 font-display text-3xl font-bold text-ink sm:text-4xl">{path.title}</h1>
      <p className="mt-2 text-muted">{path.blurb}</p>
      <div className="mt-6 rounded-3xl border border-line bg-white p-5 shadow-card"><PathBar path={path} /></div>
      <PathSteps path={path} />
      <p className="mt-6 text-xs text-muted"><T k="paths.howDone" /></p>
    </div>
  );
}
