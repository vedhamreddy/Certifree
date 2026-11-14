"use client";
import Link from "next/link";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { CloudUpload, LockKeyhole, Smartphone, X } from "lucide-react";
import { fetchMe } from "@/lib/sync";

/**
 * Friendly nudge shown when a signed-out learner saves something for the first time.
 * The action always happens on this device first, so "Continue without account" loses
 * nothing, and signing in never uploads anything by itself.
 */
const LOCAL_OK = "certifree:local-ok";
let open = false;
const listeners = new Set<() => void>();
const setOpen = (v: boolean) => {
  open = v;
  listeners.forEach((l) => l());
};

function localOk() {
  try {
    return localStorage.getItem(LOCAL_OK) === "1";
  } catch {
    return false;
  }
}

/** Runs the action now, then offers sign-in if accounts are on and nobody is signed in. */
export function withSignInNudge(action: () => void) {
  action();
  if (localOk()) return;
  fetchMe().then((me) => {
    if (me.enabled && !me.signedIn) setOpen(true);
  });
}

export function SignInPrompt() {
  const isOpen = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => open,
    () => false,
  );
  const first = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    first.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  if (!isOpen) return null;
  const local = () => {
    try {
      localStorage.setItem(LOCAL_OK, "1");
    } catch {}
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby="signin-prompt-title">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="sheet-in relative w-full max-w-md rounded-t-2xl border border-line bg-white p-6 shadow-pop sm:rounded-2xl sm:p-8">
        <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="absolute right-4 top-4 rounded-lg p-2 text-muted transition hover:bg-surface-2 hover:text-ink">
          <X size={18} strokeWidth={1.75} aria-hidden />
        </button>
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent/[0.08] text-accent"><CloudUpload size={22} strokeWidth={1.75} aria-hidden /></span>
        <h2 id="signin-prompt-title" className="mt-4 font-display text-xl font-bold text-ink">Sign in to save your progress</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">It&apos;s saved on this device already. Sign in to keep it safe and see it on your phone and other devices.</p>
        <ul className="mt-4 space-y-2 text-sm text-ink">
          <li className="flex gap-2"><Smartphone size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-accent" aria-hidden />Saved courses, My Courses and certificates on every device</li>
          <li className="flex gap-2"><LockKeyhole size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-accent" aria-hidden />Private to you. You choose what to sync before anything uploads</li>
        </ul>
        <div className="mt-6 grid gap-2">
          <Link ref={first} href="/auth/sign-in?next=/sync" onClick={() => setOpen(false)} className="inline-flex h-11 items-center justify-center rounded-xl bg-brand text-sm font-semibold text-white shadow-card transition hover:bg-brand-600 active:scale-[0.99]">
            Sign in
          </Link>
          <button type="button" onClick={local} className="h-11 rounded-xl border border-line bg-white text-sm font-semibold text-ink transition hover:border-slate-300 hover:bg-surface-2">
            Continue without account
          </button>
        </div>
      </div>
    </div>
  );
}
