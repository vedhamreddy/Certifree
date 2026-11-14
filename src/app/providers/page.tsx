import Link from "next/link";
import type { Metadata } from "next";
import { companies, platforms, Provider } from "@/data/providers";
import { courses } from "@/data/courses";
import { ProviderAvatar } from "@/components/ProviderAvatar";

export const metadata: Metadata = { title: "Companies and platforms" };

function Grid({ list }: { list: Provider[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((c) => {
        const mine = courses.filter((x) => x.provider === c.slug);
        const free = mine.filter((x) => x.cost === "free-cert").length;
        return (
          <Link key={c.slug} href={`/providers/${c.slug}`} className="group rounded-2xl border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[0_12px_30px_rgba(79,70,229,0.12)]">
            <div className="flex items-center gap-3">
              <ProviderAvatar slug={c.slug} size="lg" />
              <div className="min-w-0">
                <div className="font-display text-lg font-bold group-hover:text-brand">{c.name}</div>
                <div className="truncate text-sm text-muted">{c.kind === "company" ? c.portal : "Learning platform"}</div>
              </div>
            </div>
            <p className="mt-3 line-clamp-2 text-sm text-muted">{c.blurb}</p>
            <div className="mt-4 flex gap-4 text-sm">
              <span><b>{mine.length}</b> <span className="text-muted">courses</span></span>
              {free > 0 && <span className="text-emerald-600 dark:text-emerald-400"><b>{free}</b> free certificates</span>}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default function ProvidersPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-3xl font-bold">Companies and platforms</h1>
      <p className="mt-2 text-muted">Pick a provider to see every free course and credential it offers.</p>
      <h2 className="mb-4 mt-8 font-display text-xl font-bold">Company certifications</h2>
      <Grid list={companies} />
      <h2 className="mb-4 mt-10 font-display text-xl font-bold">Learning platforms</h2>
      <Grid list={platforms} />
    </div>
  );
}
