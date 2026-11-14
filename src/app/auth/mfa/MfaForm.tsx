"use client";
import { useActionState } from "react";
import { verifyMfa, type SignInState } from "../actions";

export function MfaForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<SignInState, FormData>(verifyMfa, { status: "idle" });
  return (
    <form action={action} className="mt-6 space-y-3">
      <input type="hidden" name="next" value={next} />
      <input
        name="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9 ]{6,7}"
        maxLength={7}
        required
        aria-label="6-digit code"
        className="w-full rounded-xl border border-line px-3 py-3 text-center font-mono text-2xl tracking-[0.4em] text-ink outline-none focus:border-accent focus:ring-4 focus:ring-accent/10"
      />
      {state.status === "error" && <p role="alert" className="text-sm text-danger">{state.message}</p>}
      <button disabled={pending} className="h-11 w-full rounded-xl bg-brand text-sm font-semibold text-white shadow-card transition hover:bg-brand-600 disabled:opacity-60">
        {pending ? "Checking..." : "Verify"}
      </button>
    </form>
  );
}
