import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BellRing, Download, KeyRound, LogOut, Mail, RefreshCw, ShieldCheck, UserRound } from "lucide-react";
import { authEnabled } from "@/lib/supabase/env";
import { createClient, getAuthed, isRecentSignIn, needsMfa } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import { AccountsOff } from "@/components/AccountsOff";
import { ChangeEmailForm, DeleteAccountForm, DisplayNameForm, EmailAlertsForm, MfaSection } from "./AccountForms";

export const metadata: Metadata = { title: "Account", robots: { index: false } };
export const dynamic = "force-dynamic";

function Card({ icon: Icon, title, children }: { icon: typeof Mail; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-line bg-white p-6 shadow-card">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
        <Icon size={18} strokeWidth={1.75} className="text-accent" aria-hidden /> {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

const btn2 = "inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink shadow-card transition hover:border-slate-300 hover:bg-surface-2 active:scale-[0.98]";

export default async function AccountPage() {
  if (!authEnabled()) return <AccountsOff />;
  const supabase = await createClient();
  if (supabase && (await supabase.auth.getUser()).data.user && (await needsMfa(supabase))) redirect("/auth/mfa?next=/account");
  const a = await getAuthed();
  if (!a) redirect("/auth/sign-in?next=/account");
  const recent = await isRecentSignIn(a.supabase);
  const [{ data: profile }, { data: factors }, { data: alerts }] = await Promise.all([
    a.supabase.from("profiles").select("display_name").eq("id", a.user.id).maybeSingle(),
    a.supabase.auth.mfa.listFactors(),
    a.supabase.from("email_alerts").select("enabled").eq("user_id", a.user.id).maybeSingle(),
  ]);
  const mfaOn = (factors?.totp ?? []).length > 0;
  const reauth = (
    <Link href="/auth/sign-in?next=/account&reauth=1" className={btn2}>
      <KeyRound size={16} strokeWidth={1.75} aria-hidden /> Confirm it&apos;s you
    </Link>
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">Account</h1>
      <p className="mt-2 text-muted">Signed in as <b className="font-semibold text-ink">{a.user.email}</b>. Your synced data is private to you.</p>
      {!recent && (
        <p className="mt-4 rounded-xl border border-line bg-surface-2 px-4 py-3 text-sm text-muted">
          Exporting data, changing your email, two-step verification and deleting your account need a sign-in from the last 10 minutes.
        </p>
      )}

      <div className="mt-8 space-y-4">
        <Card icon={RefreshCw} title="Sync">
          <p className="text-sm text-muted">Choose what this device syncs, and review differences between this device and your account.</p>
          <Link href="/sync" className={`${btn2} mt-4`}>Open sync settings</Link>
        </Card>

        <Card icon={UserRound} title="Profile">
          <DisplayNameForm initial={profile?.display_name ?? ""} />
        </Card>

        <Card icon={BellRing} title="Email alerts">
          <EmailAlertsForm initial={!!alerts?.enabled} />
        </Card>
        <Card icon={Mail} title="Email address">
          {recent ? <ChangeEmailForm current={a.user.email ?? ""} /> : reauth}
        </Card>

        <Card icon={ShieldCheck} title="Two-step verification">
          <p className="mb-4 text-sm text-muted">
            {mfaOn ? "On. You'll enter a code from your authenticator app each time you sign in." : "Add a code from an authenticator app (such as Google Authenticator, 1Password or Authy) to every sign-in."}
          </p>
          {recent ? <MfaSection enabled={mfaOn} /> : reauth}
        </Card>

        <Card icon={Download} title="Your data">
          <p className="mb-4 text-sm text-muted">Download everything stored in your account as a JSON file.</p>
          {recent ? <a href="/api/account/export" className={btn2}><Download size={16} strokeWidth={1.75} aria-hidden /> Export my data</a> : reauth}
        </Card>

        <Card icon={LogOut} title="Sign out">
          <div className="flex flex-wrap gap-2">
            <form action={signOut}><button className={btn2}>Sign out</button></form>
            <form action={signOut}><input type="hidden" name="scope" value="global" /><button className={btn2}>Sign out of all devices</button></form>
          </div>
          <p className="mt-3 text-xs text-muted">Signing out keeps your data on this device. It stops syncing until you sign in again.</p>
        </Card>

        <section className="rounded-3xl border border-red-600/20 bg-white p-6 shadow-card">
          <h2 className="font-display text-lg font-bold text-ink">Delete account</h2>
          <p className="mt-2 text-sm text-muted">Permanently deletes your account, synced saved courses, My Courses, certificate details and uploaded files. This can&apos;t be undone.</p>
          <div className="mt-4">{recent ? <DeleteAccountForm /> : reauth}</div>
        </section>
      </div>
    </div>
  );
}
