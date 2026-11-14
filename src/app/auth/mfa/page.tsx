import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient, needsMfa } from "@/lib/supabase/server";
import { safeNext } from "@/lib/supabase/env";
import { MfaForm } from "./MfaForm";

export const metadata: Metadata = { title: "Two-step verification", robots: { index: false } };

export default async function MfaPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  const supabase = await createClient();
  if (!supabase) redirect("/");
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect(`/auth/sign-in?next=${next}`);
  if (!(await needsMfa(supabase))) redirect(next);
  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-20">
      <div className="rounded-2xl border border-line bg-white p-6 shadow-card sm:p-8">
        <h1 className="font-display text-2xl font-bold text-ink">Enter your code</h1>
        <p className="mt-2 text-sm text-muted">Open your authenticator app and enter the 6-digit code for CertiFree.</p>
        <MfaForm next={next} />
      </div>
    </div>
  );
}
