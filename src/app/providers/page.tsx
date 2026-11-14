import Link from "next/link";
import type { Metadata } from "next";
import { companies, platforms, Provider } from "@/data/providers";
import { courses } from "@/data/courses";
import { ProviderAvatar } from "@/components/ProviderAvatar";
import { BadgeCheck, BookOpen } from "lucide-react";

export const metadata: Metadata = { title: "Companies and platforms" };

function Grid({ list }: { list: Provider[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((c) => {
        const mine = courses.filter((x) => x.provider === c.slug);
        const free = mine.filter((x) => x.cost === "free-cert").length;
        return (
          <Link key={c.slug} href={`/providers/${c.slug}`} className="group flex flex-col rounded-3xl border border-line bg-white p-6 shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lift">
            <div className="flex items-center gap-3">
              <ProviderAvatar slug={c.slug} size="lg" />
              <div className="min-w-0">
                <div className="font-display text-lg font-bold text-ink transition-colors group-hover:text-accent">{c.name}</div>
                <div className="truncate text-sm text-muted">{c.kind === "company" ? c.portal : "Learning platform"}</div>
              </div>
            </div>
            <p className="mb-5 mt-4 line-clamp-2 text-sm leading-relaxed text-muted">{c.blurb}</p>
            <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-4 text-sm">
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-muted"><BookOpen size={15} strokeWidth={1.75} aria-hidden /><b className="font-semibold text-ink">{mine.length}</b> courses</span>
              {free > 0 && <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-ink"><BadgeCheck size={15} strokeWidth={1.75} aria-hidden /><b className="font-semibold">{free}</b> free certificates</span>}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default function ProvidersPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">Companies and platforms</h1>
      <p className="mt-2 text-muted">Pick a provider to see every free course and credential it offers.</p>
      <h2 className="mb-5 mt-10 font-display text-xl font-bold text-ink">Company certifications</h2>
      <Grid list={companies} />
      <h2 className="mb-5 mt-14 font-display text-xl font-bold text-ink">Learning platforms</h2>
      <Grid list={platforms} />
    </div>
  );
}
