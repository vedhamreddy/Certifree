import Link from "next/link";
import {
  ArrowRight, BadgeCheck, BarChart3, BrainCircuit, Briefcase, Clock, Cloud, Code2, Globe, Megaphone,
  Network, ShieldCheck, Sparkles, Terminal, TrendingUp, Wallet, FileBadge, Wand2, type LucideIcon,
} from "lucide-react";
import { companies, platforms, providers } from "@/data/providers";
import { courses, domainLabels, Domain } from "@/data/courses";
import { CourseCard } from "@/components/CourseCard";
import { ProviderAvatar } from "@/components/ProviderAvatar";
import { SearchBar } from "@/components/SearchBar";
import { Dashboard } from "@/components/Dashboard";
import { careerPaths } from "@/data/paths";
import { T } from "@/lib/i18n";

const domainIcons: Record<Domain, LucideIcon> = {
  ai: Sparkles, cloud: Cloud, security: ShieldCheck, data: BarChart3, webdev: Globe, devops: Terminal,
  programming: Code2, cs: BrainCircuit, networking: Network, marketing: Megaphone, career: Briefcase,
};

// Translation keys: cost.<x> for the label, home.label.<x> for the text.
const labels: { cost: string; icon: LucideIcon; tone: string }[] = [
  { cost: "free-cert", icon: BadgeCheck, tone: "bg-brand text-white" },
  { cost: "free-learn-paid-cert", icon: FileBadge, tone: "bg-surface-2 text-ink ring-1 ring-inset ring-line" },
  { cost: "free-learn-paid-exam", icon: Wallet, tone: "bg-surface-2 text-ink ring-1 ring-inset ring-line" },
  { cost: "limited-time", icon: Clock, tone: "bg-surface-2 text-ink ring-1 ring-inset ring-line" },
];

/** title, sub and cta are translation keys. */
function SectionHead({ title, sub, href, cta, vars }: { title: string; sub?: string; href?: string; cta?: string; vars?: Record<string, number> }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink sm:text-[28px]"><T k={title} /></h2>
        {sub && <p className="mt-1 text-muted"><T k={sub} vars={vars} /></p>}
      </div>
      {href && (
        <Link href={href} className="group inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-accent transition-colors hover:text-brand">
          {cta && <T k={cta} />} <ArrowRight size={16} strokeWidth={1.75} className="transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      )}
    </div>
  );
}

export default function Home() {
  const trending = courses.filter((c) => c.trending).slice(0, 9);
  const freeCerts = courses.filter((c) => c.cost === "free-cert");
  const domains = (Object.keys(domainLabels) as Domain[])
    .map((d) => ({ d, n: courses.filter((c) => c.domain === d).length }))
    .filter((x) => x.n > 0);

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pt-2 sm:px-6 lg:px-8">
        <section className="hero-dark rounded-3xl p-6 text-white sm:p-8">
          <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 ring-1 ring-inset ring-white/15">
                <span className="h-1.5 w-1.5 rounded-full bg-free" />
                <T k="home.stats" vars={{ c: courses.length, p: providers.length, f: freeCerts.length }} />
              </span>
              <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl"><T k="home.h1" /></h1>
              <p className="mt-2 text-white/70"><T k="home.lead" /></p>
            </div>
            <div className="min-w-0">
              <SearchBar big />
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/courses?cost=free-cert" className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-neutral-200">
                  <BadgeCheck size={15} strokeWidth={2} aria-hidden /> <T k="home.freeOnly" />
                </Link>
                <Link href="/find" className="inline-flex items-center gap-1.5 rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-amber-200">
                  <Wand2 size={15} strokeWidth={2} aria-hidden /> <T k="nav.find" />
                </Link>
                {(["ai", "cloud", "security", "webdev", "data"] as Domain[]).map((d) => (
                  <Link key={d} href={`/courses?domain=${d}`} className="rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15">
                    <T k={`domain.${d}`} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6"><Dashboard /></div>

        <div className="mt-6 flex items-center gap-2.5 overflow-x-auto [scrollbar-width:none]">
          <span className="mr-1 shrink-0 text-xs font-semibold uppercase tracking-[0.08em] text-muted"><T k="home.topProviders" /></span>
          {[...companies.slice(0, 6), ...platforms.slice(0, 4)].map((c) => (
            <Link key={c.slug} href={`/providers/${c.slug}`} className="flex shrink-0 items-center gap-2 rounded-full border border-line bg-white py-1 pl-1 pr-3.5 text-sm font-semibold text-ink transition hover:bg-surface-2">
              <ProviderAvatar slug={c.slug} size="sm" /> {c.name}
            </Link>
          ))}
          <Link href="/providers" className="shrink-0 px-2 text-sm font-semibold text-ink underline-offset-4 hover:underline"><T k="home.allProviders" vars={{ n: providers.length }} /> →</Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-14 px-4 py-12 sm:px-6 lg:px-8">
        <section>
          <SectionHead title="home.paths" sub="home.pathsSub" href="/paths" cta="home.allPaths" />
          <div className="flex flex-wrap gap-2">
            {careerPaths.map((p) => (
              <Link key={p.slug} href={`/paths/${p.slug}`} className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink shadow-card transition hover:border-slate-300 hover:shadow-lift">
                {p.title} <span className="text-xs font-medium text-muted"><T k="paths.courses" vars={{ n: p.steps.length }} /></span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <SectionHead title="home.domains" sub="home.domainsSub" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {domains.map(({ d, n }) => {
              const Icon = domainIcons[d];
              return (
                <Link key={d} href={`/courses?domain=${d}`} className="group rounded-3xl border border-line bg-white p-5 shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lift">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-surface-2 text-ink ring-1 ring-inset ring-line transition-colors group-hover:bg-brand group-hover:text-white group-hover:ring-brand">
                    <Icon size={20} strokeWidth={1.75} aria-hidden />
                  </span>
                  <div className="mt-4 font-semibold text-ink"><T k={`domain.${d}`} /></div>
                  <div className="mt-0.5 text-sm text-muted"><T k={n === 1 ? "browse.count1" : "browse.count"} vars={{ n }} /></div>
                </Link>
              );
            })}
          </div>
        </section>

        <section>
          <SectionHead title="home.popular" sub="home.popularSub" href="/courses" cta="home.seeAll" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {trending.map((c) => <CourseCard key={c.id} course={c} />)}
          </div>
        </section>

        <section className="relative overflow-hidden rounded-3xl bg-brand px-6 py-10 text-white shadow-lift sm:px-12 sm:py-14">
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:22px_22px]" />
          <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80 ring-1 ring-inset ring-white/15">
                <TrendingUp size={14} strokeWidth={2} aria-hidden /> <T k="home.noTricks" />
              </span>
              <h2 className="mt-4 font-display text-2xl font-bold sm:text-4xl"><T k="home.ctaTitle" vars={{ n: freeCerts.length }} /></h2>
              <p className="mt-3 max-w-xl text-white/70"><T k="home.ctaText" /></p>
            </div>
            <Link href="/courses?cost=free-cert" className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-brand shadow-card transition hover:bg-neutral-100 active:scale-[0.98]">
              <T k="home.ctaButton" /> <ArrowRight size={18} strokeWidth={1.75} className="transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>
        </section>

        <section>
          <SectionHead title="home.labels" sub="home.labelsSub" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {labels.map(({ cost, icon: Icon, tone }) => (
              <div key={cost} className="rounded-3xl border border-line bg-white p-5 shadow-card">
                <span className={`grid h-11 w-11 place-items-center rounded-full ${tone}`}><Icon size={20} strokeWidth={1.75} aria-hidden /></span>
                <div className="mt-4 font-semibold text-ink"><T k={`cost.${cost}`} /></div>
                <p className="mt-1 text-sm leading-relaxed text-muted"><T k={`home.label.${cost}`} /></p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
