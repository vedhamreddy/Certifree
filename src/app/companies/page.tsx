import Link from "next/link";
import type { Metadata } from "next";
import { companies } from "@/data/companies";
import { courses } from "@/data/courses";
import { CompanyAvatar } from "@/components/CompanyAvatar";

export const metadata: Metadata = { title: "Companies" };

export default function CompaniesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-3xl font-bold">Free certifications by company</h1>
      <p className="mt-2 text-muted">Pick a company to see every free course and credential it offers.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {companies.map((c) => {
          const list = courses.filter((x) => x.company === c.slug);
          const free = list.filter((x) => x.cost === "free-cert").length;
          return (
            <Link key={c.slug} href={`/companies/${c.slug}`} className="group rounded-2xl border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[0_12px_30px_rgba(79,70,229,0.12)]">
              <div className="flex items-center gap-3">
                <CompanyAvatar slug={c.slug} size="lg" />
                <div>
                  <div className="font-display text-lg font-bold group-hover:text-brand">{c.name}</div>
                  <div className="text-sm text-muted">{c.portal}</div>
                </div>
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-muted">{c.blurb}</p>
              <div className="mt-4 flex gap-4 text-sm">
                <span><b>{list.length}</b> <span className="text-muted">courses</span></span>
                <span className="text-emerald-600 dark:text-emerald-400"><b>{free}</b> free certificates</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
