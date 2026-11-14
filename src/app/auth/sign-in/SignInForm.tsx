"use client";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Mail, MailCheck } from "lucide-react";
import { emailSignIn, googleSignIn, type SignInState } from "../actions";

function Submit({ children, variant }: { children: React.ReactNode; variant: "primary" | "secondary" }) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold shadow-card transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 ${
        variant === "primary" ? "bg-brand text-white hover:bg-brand-600" : "border border-line bg-white text-ink hover:border-slate-300 hover:bg-surface-2"
      }`}
    >
      {pending && <Loader2 size={16} className="animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export function SignInForm({ next }: { next: string }) {
  const [state, action] = useActionState<SignInState, FormData>(emailSignIn, { status: "idle" });
  if (state.status === "sent") {
    return (
      <div className="mt-6 flex gap-3 rounded-xl border border-emerald-600/15 bg-emerald-50/60 p-4" role="status">
        <MailCheck size={20} strokeWidth={1.75} className="mt-0.5 shrink-0 text-free" aria-hidden />
        <p className="text-sm text-ink">{state.message} Open it in this browser to finish signing in.</p>
      </div>
    );
  }
  return (
    <div className="mt-6 space-y-4">
      <form action={googleSignIn}>
        <input type="hidden" name="next" value={next} />
        <Submit variant="secondary"><GoogleMark /> Continue with Google</Submit>
      </form>
      <div className="flex items-center gap-3 text-xs text-muted"><span className="h-px flex-1 bg-line" />or<span className="h-px flex-1 bg-line" /></div>
      <form action={action} className="space-y-3">
        <input type="hidden" name="next" value={next} />
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">Email address</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-[15px] text-ink outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-accent focus:ring-4 focus:ring-accent/10"
          />
        </label>
        {state.status === "error" && <p role="alert" className="text-sm text-danger">{state.message}</p>}
        <Submit variant="primary"><Mail size={16} strokeWidth={1.75} aria-hidden /> Email me a sign-in link</Submit>
      </form>
    </div>
  );
}
