import Link from "next/link";
import { companies } from "@/data/companies";
import { courses, domainLabels, sampleDeadlines, Domain } from "@/data/courses";
import { CourseCard } from "@/components/CourseCard";
import { CompanyAvatar } from "@/components/CompanyAvatar";
import { SearchBar } from "@/components/SearchBar";

const domainChips: Domain[] = ["ai", "cloud", "security", "webdev", "data", "devops", "programming", "marketing"];

export default function Home() {
  const trending = courses.filter((c) => c.trending).slice(0, 6);
  const freeCerts = courses.filter((c) => c.cost === "free-cert").length;
  return (
    <>
      <section className="hero-bg border-b border-line">
        <div className="mx-auto max-w-4xl px-4 pb-12 pt-14 text-center sm:px-6 sm:pt-20">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted sm:text-sm">
            <span className="h-2 w-2 rounded-full bg-free" /> {courses.length} courses · {companies.length} providers · {freeCerts} with free certificates
          </span>
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
            Every free certification,
            <br />
            <span className="text-free">one place.</span>
          </h1>
          <p className="mx-auto mb-8 mt-4 max-w-2xl text-lg text-muted">
            Courses from Google, Microsoft, AWS, IBM, Cisco and more, labeled by what is really free.
          </p>
          <div className="mx-auto max-w-2xl"><SearchBar big /></div>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link href="/courses?cost=free-cert" className="rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-white">✓ Free certificate</Link>
            {domainChips.map((d) => (
              <Link key={d} href={`/courses?domain=${d}`} className="rounded-full border border-line bg-surface px-4 py-1.5 text-sm font-medium transition hover:border-brand hover:text-brand">
                {domainLabels[d]}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-7xl items-center gap-3 overflow-x-auto px-4 py-5 sm:px-6 [scrollbar-width:none]">
          <span className="shrink-0 text-sm font-medium text-muted">Browse by company</span>
          {companies.slice(0, 12).map((c) => (
            <Link key={c.slug} href={`/companies/${c.slug}`} className="flex shrink-0 items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 text-sm font-semibold transition hover:ring-2 hover:ring-brand/30">
              <CompanyAvatar slug={c.slug} size="sm" /> {c.name}
            </Link>
          ))}
          <Link href="/companies" className="shrink-0 px-2 text-sm font-semibold text-brand">All →</Link>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_340px]">
        <section>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-bold">🔥 Trending this week</h2>
            <Link href="/courses" className="text-sm font-semibold text-brand">See all →</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {trending.map((c) => <CourseCard key={c.id} course={c} />)}
          </div>
        </section>
        <aside>
          <h2 className="mb-4 font-display text-2xl font-bold">⏰ Closing soon</h2>
          <div className="rounded-2xl border border-line bg-surface p-5">
            {sampleDeadlines.map((d, i) => (
              <div key={d.title} className={`flex gap-3 py-3 ${i ? "border-t border-line" : ""}`}>
                <div className="w-14 shrink-0 rounded-xl bg-rose-100 py-1.5 text-center font-bold leading-tight text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                  <div className="text-lg">{d.day}</div>
                  <div className="text-[11px]">{d.month}</div>
                </div>
                <div>
                  <div className="font-semibold">{d.title}</div>
                  <div className="text-sm text-muted">{d.note}</div>
                </div>
              </div>
            ))}
            <p className="mt-2 rounded-lg bg-surface-2 px-3 py-2 text-xs text-muted">Sample dates for the preview. Real deadlines and reminders arrive in Phase 2.</p>
          </div>
        </aside>
      </div>
    </>
  );
}
