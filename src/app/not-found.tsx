import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-display text-sm font-bold uppercase tracking-[0.08em] text-accent">404</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">Page not found</h1>
      <p className="mt-2 text-muted">That course or company isn&apos;t in the catalog.</p>
      <Link href="/courses" className="mt-8 inline-flex h-11 items-center rounded-full bg-brand px-5 text-sm font-semibold text-white shadow-card transition hover:bg-brand-600 active:scale-[0.98]">Browse courses</Link>
    </div>
  );
}
