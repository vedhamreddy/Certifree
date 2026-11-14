"use client";
import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { changeEmail, confirmMfaEnroll, deleteAccount, removeMfa, startMfaEnroll, updateDisplayName, type Result } from "./actions";
import { writeSettings, clearSyncProblem } from "@/lib/sync";
import { setBookmarksLocal } from "@/lib/bookmarks";
import { setLearningLocal } from "@/lib/learning";
import { clearCertificatesLocal } from "@/lib/certificates";

const field = "w-full rounded-xl border border-line bg-white px-3 py-2.5 text-[15px] text-ink outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-accent focus:ring-4 focus:ring-accent/10";
const btn = "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white shadow-card transition hover:bg-brand-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60";
const btn2 = "inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink shadow-card transition hover:border-slate-300 hover:bg-surface-2 active:scale-[0.98] disabled:opacity-60";

function Msg({ r, ok }: { r: Result; ok: string }) {
  if (r.error) return <p role="alert" className="mt-2 text-sm text-danger">{r.error}{r.reauth && <> <a className="font-semibold underline" href="/auth/sign-in?next=/account&reauth=1">Confirm it&apos;s you</a></>}</p>;
  if (r.ok) return <p role="status" className="mt-2 text-sm text-free">{ok}</p>;
  return null;
}

export function DisplayNameForm({ initial }: { initial: string }) {
  const [r, act, pending] = useActionState(updateDisplayName, {});
  return (
    <form action={act}>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Display name <span className="font-normal text-muted">(optional, only you see it)</span></span>
        <div className="flex gap-2">
          <input name="displayName" defaultValue={initial} maxLength={60} className={field} />
          <button disabled={pending} className={btn}>Save</button>
        </div>
      </label>
      <Msg r={r} ok="Saved." />
    </form>
  );
}

export function ChangeEmailForm({ current }: { current: string }) {
  const [r, act, pending] = useActionState(changeEmail, {});
  return (
    <form action={act}>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">New email address</span>
        <div className="flex gap-2">
          <input name="email" type="email" required placeholder={current} className={field} />
          <button disabled={pending} className={btn}>Change</button>
        </div>
      </label>
      <Msg r={r} ok="Check both inboxes: the change finishes once you confirm the links we sent." />
    </form>
  );
}

export function MfaSection({ enabled }: { enabled: boolean }) {
  const [enroll, setEnroll] = useState<Record<string, string> | null>(null);
  const [err, setErr] = useState<Result>({});
  const [busy, setBusy] = useState(false);
  const [r, act, pending] = useActionState(confirmMfaEnroll, {});
  if (enabled) {
    return (
      <>
        <button disabled={busy} className={btn2} onClick={async () => { setBusy(true); setErr(await removeMfa()); setBusy(false); }}>Turn off two-step verification</button>
        <Msg r={err} ok="Turned off." />
      </>
    );
  }
  if (r.ok) return <p className="text-sm text-free">Two-step verification is on.</p>;
  if (!enroll) {
    return (
      <>
        <button disabled={busy} className={btn2} onClick={async () => { setBusy(true); const res = await startMfaEnroll(); setBusy(false); if (res.data) setEnroll(res.data); else setErr(res); }}>
          {busy && <Loader2 size={16} className="animate-spin" aria-hidden />} Set up authenticator app
        </button>
        <Msg r={err} ok="" />
      </>
    );
  }
  return (
    <form action={act} className="grid gap-4 sm:grid-cols-[160px_1fr] sm:items-start">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={enroll.qr} alt="QR code to scan with your authenticator app" width={160} height={160} className="rounded-xl border border-line bg-white p-2" />
      <div>
        <p className="text-sm text-muted">Scan the code, or enter this key: <code className="break-all font-mono text-xs text-ink">{enroll.secret}</code></p>
        <input type="hidden" name="factorId" value={enroll.factorId} />
        <div className="mt-3 flex gap-2">
          <input name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={7} placeholder="123456" aria-label="6-digit code" className={field} />
          <button disabled={pending} className={btn}>Verify</button>
        </div>
        <Msg r={r} ok="" />
      </div>
    </form>
  );
}

export function DeleteAccountForm() {
  const router = useRouter();
  const [wipeLocal, setWipeLocal] = useState(false);
  const [r, act, pending] = useActionState(async (prev: Result, form: FormData) => {
    const res = await deleteAccount(prev, form);
    if (res.ok) {
      writeSettings(null);
      clearSyncProblem();
      if (wipeLocal) {
        setBookmarksLocal([]);
        setLearningLocal([]);
        await clearCertificatesLocal();
      }
      router.replace("/?account-deleted=1");
    }
    return res;
  }, {});
  return (
    <form action={act} className="space-y-3">
      <label className="flex items-start gap-2 text-sm text-ink">
        <input type="checkbox" checked={wipeLocal} onChange={(e) => setWipeLocal(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#0a0a0a]" />
        Also remove saved courses, My Courses and certificates from this browser
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Type DELETE to confirm</span>
        <div className="flex gap-2">
          <input name="confirm" autoComplete="off" className={field} />
          <button disabled={pending} className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-danger px-4 text-sm font-semibold text-white shadow-card transition hover:bg-red-700 disabled:opacity-60">
            {pending && <Loader2 size={16} className="animate-spin" aria-hidden />} Delete account
          </button>
        </div>
      </label>
      <Msg r={r} ok="Account deleted." />
    </form>
  );
}
