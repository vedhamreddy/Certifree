import Link from "next/link";
import { companies, platforms, providers } from "@/data/providers";
import { courses, domainLabels, Domain } from "@/data/courses";
import { CourseCard } from "@/components/CourseCard";
import { ProviderAvatar } from "@/components/ProviderAvatar";
import { SearchBar } from "@/components/SearchBar";

const domainIcons: Record<Domain, string> = {
  ai: "🤖", cloud: "☁️", security: "🛡️", data: "📊", webdev: "🌐", devops: "🐧",
  programming: "💻", cs: "🧠", networking: "🔌", marketing: "📣", career: "🎯",
};

export default function Home() {
  const trending = courses.filter((c) => c.trending).slice(0, 9);
  const freeCerts = courses.filter((c) => c.cost === "free-cert");
  const domains = (Object.keys(domainLabels) as Domain[])
    .map((d) => ({ d, n: courses.filter((c) => c.domain === d).length }))
    .filter((x) => x.n > 0);

  return (
    <>
      <section className="hero-bg border-b border-line">
        <div className="mx-auto max-w-4xl px-4 pb-12 pt-12 text-center sm:px-6 sm:pt-20">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted sm:text-sm">
            <span className="h-2 w-2 rounded-full bg-free" /> {courses.length} courses · {providers.length} providers · {freeCerts.length} free certificates
          </span>
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
            Every free certification,
            <br />
            <span className="text-free">one place.</span>
          </h1>
          <p className="mx-auto mb-8 mt-4 max-w-2xl text-lg text-muted">
            Free courses from Google, Microsoft, AWS, IBM, Cisco, Coursera, edX, NPTEL and more, labeled by what is really free.
          </p>
          <div className="mx-auto max-w-2xl"><SearchBar big /></div>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link href="/courses?cost=free-cert" className="rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-white shadow-sm">✓ Free certificate only</Link>
            {(["ai", "cloud", "security", "webdev", "data"] as Domain[]).map((d) => (
              <Link key={d} href={`/courses?domain=${d}`} className="rounded-full border border-line bg-surface px-4 py-1.5 text-sm font-medium transition hover:border-brand hover:text-brand">
                {domainLabels[d]}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-7xl items-center gap-3 overflow-x-auto px-4 py-5 sm:px-6 [scrollbar-width:none]">
          <span className="shrink-0 text-sm font-medium text-muted">Top providers</span>
          {[...companies.slice(0, 6), ...platforms.slice(0, 4)].map((c) => (
            <Link key={c.slug} href={`/providers/${c.slug}`} className="flex shrink-0 items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 text-sm font-semibold transition hover:ring-2 hover:ring-brand/30">
              <ProviderAvatar slug={c.slug} size="sm" /> {c.name}
            </Link>
          ))}
          <Link href="/providers" className="shrink-0 px-2 text-sm font-semibold text-brand">All {providers.length} →</Link>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-14 px-4 py-12 sm:px-6">
        <section>
          <h2 className="mb-4 font-display text-2xl font-bold">Explore by domain</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {domains.map(({ d, n }) => (
              <Link key={d} href={`/courses?domain=${d}`} className="group rounded-2xl border border-line bg-surface p-4 transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[0_12px_30px_rgba(79,70,229,0.10)]">
                <div className="text-2xl" aria-hidden>{domainIcons[d]}</div>
                <div className="mt-2 font-semibold group-hover:text-brand">{domainLabels[d]}</div>
                <div className="text-sm text-muted">{n} course{n === 1 ? "" : "s"}</div>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-bold">🔥 Popular with students</h2>
            <Link href="/courses" className="text-sm font-semibold text-brand">See all →</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {trending.map((c) => <CourseCard key={c.id} course={c} />)}
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl bg-brand p-8 text-white sm:p-10">
          <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
            <div>
              <h2 className="font-display text-2xl font-bold sm:text-3xl">{freeCerts.length} courses with a 100% free certificate</h2>
              <p className="mt-2 max-w-xl text-white/80">No audit tricks, no paid exam. Finish the course and the certificate or badge is yours.</p>
            </div>
            <Link href="/courses?cost=free-cert" className="rounded-2xl bg-white px-6 py-3 text-center font-semibold text-brand shadow-sm transition hover:bg-white/90">
              Show free certificates
            </Link>
          </div>
        </section>

        <section>
          <h2 className="mb-1 font-display text-2xl font-bold">What the labels mean</h2>
          <p className="mb-4 text-muted">&quot;Free&quot; means different things on different sites. Every course carries one of these labels.</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["✓ Free certificate", "The course and the certificate or badge cost nothing.", "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"],
              ["Paid certificate", "Learn for free; pay only if you want the certificate.", "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"],
              ["Paid exam", "Free learning that prepares you for a paid official exam.", "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"],
              ["⏳ Limited-time free", "The exam or certificate is free during a campaign.", "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"],
            ].map(([label, text, cls]) => (
              <div key={label} className="rounded-2xl border border-line bg-surface p-4">
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>{label}</span>
                <p className="mt-2 text-sm text-muted">{text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
