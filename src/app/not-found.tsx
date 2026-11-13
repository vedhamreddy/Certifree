import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-display text-3xl font-bold">Page not found</h1>
      <p className="mt-2 text-muted">That course or company isn&apos;t in the catalog.</p>
      <Link href="/courses" className="mt-6 inline-block rounded-2xl bg-brand px-5 py-2.5 font-semibold text-white">Browse courses</Link>
    </div>
  );
}
