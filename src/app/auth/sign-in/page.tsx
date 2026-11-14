import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { authEnabled, safeNext } from "@/lib/supabase/env";
import { getAuthed } from "@/lib/supabase/server";
import { SignInForm } from "./SignInForm";
import { AccountsOff } from "@/components/AccountsOff";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

const errors: Record<string, string> = {
  link: "That sign-in link has expired or was already used. Request a new one below. Open it in the same browser you requested it from.",
  failed: "Sign-in didn't start. Please try again.",
  slow: "Too many attempts. Wait a few minutes and try again.",
};

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string; reauth?: string }> }) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  if (!authEnabled()) return <AccountsOff />;
  const reauth = sp.reauth === "1";
  if (!reauth && (await getAuthed())) redirect(next);
  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-20">
      <div className="rounded-3xl border border-line bg-white p-6 shadow-card sm:p-8">
        <h1 className="font-display text-2xl font-bold text-ink">{reauth ? "Confirm it's you" : "Sign in to sync"}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {reauth
            ? "For your security, sign in again before exporting data, changing your email or deleting your account."
            : "An account is optional. Browsing, saving and tracking certificates all work without one. Sign in only if you want your data on more than one device."}
        </p>
        {sp.error && errors[sp.error] && (
          <p role="alert" className="mt-4 rounded-xl border border-red-600/15 bg-red-50 px-3 py-2.5 text-sm text-[#B91C1C]">{errors[sp.error]}</p>
        )}
        <SignInForm next={next} />
        <div className="mt-6 rounded-xl bg-surface-2 p-4 text-xs leading-relaxed text-muted">
          <b className="font-semibold text-ink">What signing in shares:</b> only your email address (and your name from Google, if you use Google).
          Nothing on this device is uploaded until you choose what to sync on the next screen.
        </div>
      </div>
    </div>
  );
}
