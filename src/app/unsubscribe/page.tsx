import type { Metadata } from "next";
import Link from "next/link";
import { BellOff } from "lucide-react";

export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false, follow: false } };

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ t?: string; done?: string }> }) {
  const { t, done } = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-surface-2 text-ink ring-1 ring-inset ring-line"><BellOff size={22} strokeWidth={1.75} aria-hidden /></span>
      {done ? (
        <>
          <h1 className="mt-4 font-display text-2xl font-bold text-ink">You&apos;re unsubscribed</h1>
          <p className="mt-2 text-muted">You won&apos;t get CertiFree alert emails any more. You can switch them back on in your account.</p>
          <Link href="/" className="mt-6 inline-flex h-11 items-center rounded-full bg-brand px-5 text-sm font-semibold text-white">Back to CertiFree</Link>
        </>
      ) : t ? (
        <>
          <h1 className="mt-4 font-display text-2xl font-bold text-ink">Stop alert emails?</h1>
          <p className="mt-2 text-muted">You&apos;ll stop getting the weekly email about new free courses and deadlines.</p>
          <form action="/api/unsubscribe" method="post" className="mt-6">
            <input type="hidden" name="t" value={t} />
            <input type="hidden" name="from" value="page" />
            <button className="inline-flex h-11 items-center rounded-full bg-brand px-5 text-sm font-semibold text-white">Unsubscribe</button>
          </form>
        </>
      ) : (
        <>
          <h1 className="mt-4 font-display text-2xl font-bold text-ink">Link missing</h1>
          <p className="mt-2 text-muted">Use the unsubscribe link in the email, or switch alerts off in your account.</p>
        </>
      )}
    </div>
  );
}
