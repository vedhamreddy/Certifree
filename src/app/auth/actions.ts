"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeNext, siteUrl } from "@/lib/supabase/env";
import { clientIp, limit } from "@/lib/rate-limit";

export type SignInState = { status: "idle" | "sent" | "error"; message?: string };

const NEUTRAL_SENT = "If that address can receive email, a sign-in link is on its way. It expires in one hour.";
const SLOW_DOWN = "Too many attempts. Wait a few minutes and try again.";
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;

function callbackUrl(next: string) {
  return `${siteUrl()}/auth/callback?next=${encodeURIComponent(next)}`;
}

/** Email magic link (PKCE). The reply is the same whether or not the address has an account. */
export async function emailSignIn(_: SignInState, form: FormData): Promise<SignInState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const next = safeNext(form.get("next"));
  if (!EMAIL_RE.test(email) || email.length > 254) return { status: "error", message: "Enter a valid email address." };
  const ip = await clientIp();
  if (!limit(`ip:${ip}`, 10, 15 * 60_000) || !limit(`email:${email}`, 3, 15 * 60_000)) {
    return { status: "error", message: SLOW_DOWN };
  }
  const supabase = await createClient();
  if (!supabase) return { status: "error", message: "Accounts aren't set up on this server yet." };
  // Errors (including "rate limited by Supabase") are deliberately not shown or logged with the address.
  await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: callbackUrl(next), shouldCreateUser: true } });
  return { status: "sent", message: NEUTRAL_SENT };
}

/** Google sign-in (PKCE). The code verifier is stored in an HttpOnly cookie by the server client. */
export async function googleSignIn(form: FormData) {
  const next = safeNext(form.get("next"));
  const ip = await clientIp();
  if (!limit(`ip:${ip}`, 10, 15 * 60_000)) redirect(`/auth/sign-in?next=${next}&error=slow`);
  const supabase = await createClient();
  if (!supabase) redirect("/auth/sign-in");
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callbackUrl(next), queryParams: { prompt: "select_account" } },
  });
  if (error || !data.url) redirect(`/auth/sign-in?next=${next}&error=failed`);
  redirect(data.url);
}

export async function verifyMfa(_: SignInState, form: FormData): Promise<SignInState> {
  const code = String(form.get("code") ?? "").replace(/\s/g, "");
  const next = safeNext(form.get("next"));
  if (!/^\d{6}$/.test(code)) return { status: "error", message: "Enter the 6-digit code from your authenticator app." };
  const ip = await clientIp();
  if (!limit(`mfa:${ip}`, 10, 15 * 60_000)) return { status: "error", message: SLOW_DOWN };
  const supabase = await createClient();
  if (!supabase) return { status: "error", message: "Accounts aren't set up on this server yet." };
  const { data: factors } = await supabase.auth.mfa.listFactors();
  const totp = factors?.totp?.[0];
  if (!totp) redirect(next);
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: totp.id, code });
  if (error) return { status: "error", message: "That code didn't work. Check the time on your device and try again." };
  redirect(next);
}

export async function signOut(form: FormData) {
  const scope = form.get("scope") === "global" ? "global" : "local";
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut({ scope });
  redirect("/?signed-out=1");
}
