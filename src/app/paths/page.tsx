import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { careerPaths } from "@/data/paths";
import { T } from "@/lib/i18n";
import { PathBar } from "@/components/PathProgress";

export const metadata: Metadata = {
  title: "Career paths",
  description: "Pick a goal and follow free courses in order: cloud engineer, data analyst, web developer, cybersecurity and AI/ML.",
};

export default function PathsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl"><T k="paths.title" /></h1>
      <p className="mt-2 max-w-2xl text-muted"><T k="paths.sub" /></p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {careerPaths.map((p) => (
          <Link key={p.slug} href={`/paths/${p.slug}`} className="group flex flex-col rounded-3xl border border-line bg-white p-6 shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lift">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted"><T k={`domain.${p.domain}`} /> · <T k="paths.courses" vars={{ n: p.steps.length }} /></span>
            <h2 className="mt-2 font-display text-xl font-bold text-ink">{p.title}</h2>
            <p className="mt-1 flex-1 text-sm text-muted">{p.blurb}</p>
            <div className="mt-5"><PathBar path={p} /></div>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ink"><T k="paths.open" /> <ArrowRight size={15} strokeWidth={2} className="transition-transform group-hover:translate-x-0.5" aria-hidden /></span>
          </Link>
        ))}
      </div>
    </div>
  );
}
