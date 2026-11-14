import Link from "next/link";
import { CloudOff } from "lucide-react";

/** Shown when the server has no Supabase settings: everything still works on this device. */
export function AccountsOff() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-surface-2 text-muted ring-1 ring-inset ring-line"><CloudOff size={22} strokeWidth={1.75} aria-hidden /></span>
      <h1 className="font-display text-2xl font-bold text-ink">Accounts aren&apos;t switched on here yet</h1>
      <p className="mt-2 text-muted">Your saved courses, courses in progress and certificates keep working on this device without an account.</p>
      <Link href="/saved" className="mt-6 inline-flex h-11 items-center rounded-xl bg-brand px-5 text-sm font-semibold text-white shadow-card transition hover:bg-brand-600">Go to saved courses</Link>
    </div>
  );
}
