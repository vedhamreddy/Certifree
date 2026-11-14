"use client";
import Link from "next/link";
import { CalendarClock, Hourglass } from "lucide-react";
import { useCatalog } from "@/lib/useCatalog";
import { useDeadlines } from "@/lib/useDeadlines";
import { daysUntil, type Deadline } from "@/lib/deadlines";
import { ProviderAvatar } from "@/components/ProviderAvatar";
import { CalendarButtons } from "@/components/CalendarButtons";
import { useT } from "@/lib/i18n";

function fmt(d: string) {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, day)).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

function Row({ d }: { d: Deadline }) {
  const { byId } = useCatalog();
  const c = byId[d.courseId];
  const n = daysUntil(d.date);
  const t = useT();
  return (
    <li className="rounded-3xl border border-line bg-white p-5 shadow-card">
      <div className="flex items-start gap-3">
        <ProviderAvatar slug={c.provider} />
        <div className="min-w-0 flex-1">
          <Link href={`/courses/${c.id}`} className="font-semibold leading-snug text-ink hover:underline">{c.title}</Link>
          <div className="mt-0.5 text-sm text-muted">{fmt(d.date)}</div>
        </div>
        <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${n < 0 ? "bg-brand text-white" : d.kind === "offer" ? "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-600/20" : "bg-surface-2 text-ink ring-1 ring-inset ring-line"}`}>
          {n < 0 ? t("dash.late", { n: -n }) : n === 0 ? t("dash.today") : t("dash.left", { n })}
        </span>
      </div>
      <p className="mt-3 text-sm text-muted">{d.note}</p>
      <div className="mt-3"><CalendarButtons deadline={d} compact /></div>
    </li>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-3 rounded-3xl border border-dashed border-line bg-surface-2 p-5 text-sm text-muted">{children}</div>;
}

export default function DeadlinesPage() {
  const { offers, targets } = useDeadlines();
  const t = useT();
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">{t("deadlines.title")}</h1>
      <p className="mt-2 text-muted">{t("deadlines.sub")}</p>

      <section className="mt-8" aria-labelledby="offers">
        <h2 id="offers" className="mb-3 flex items-center gap-2 font-display text-xl font-bold text-ink"><Hourglass size={18} strokeWidth={1.75} aria-hidden /> {t("deadlines.offers")}</h2>
        {offers.length ? <ul className="space-y-3">{offers.map((d) => <Row key={d.key} d={d} />)}</ul> : <Empty>{t("deadlines.noOffers")}</Empty>}
      </section>

      <section className="mt-10" aria-labelledby="mine">
        <h2 id="mine" className="mb-3 flex items-center gap-2 font-display text-xl font-bold text-ink"><CalendarClock size={18} strokeWidth={1.75} aria-hidden /> {t("deadlines.mine")}</h2>
        {targets.length ? (
          <ul className="space-y-3">{targets.map((d) => <Row key={d.key} d={d} />)}</ul>
        ) : (
          <Empty>
            <span>{t("dash.noDeadlines")} <Link href="/learning" className="font-semibold text-ink underline underline-offset-4">{t("nav.myCourses")}</Link></span>
          </Empty>
        )}
      </section>
    </div>
  );
}
