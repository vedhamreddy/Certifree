"use server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getAuthed, isRecentSignIn } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { siteUrl } from "@/lib/supabase/env";
import { clientIp, limit } from "@/lib/rate-limit";
import { BUCKET } from "@/lib/api";

export type Result = { ok?: boolean; error?: string; reauth?: boolean; data?: Record<string, string> };

async function authed(recent = false) {
  const a = await getAuthed();
  if (!a) return { error: "You're signed out. Sign in again." } as const;
  if (recent && !(await isRecentSignIn(a.supabase))) return { reauth: true, error: "Confirm it's you first." } as const;
  return a;
}

export async function updateDisplayName(_: Result, form: FormData): Promise<Result> {
  const a = await authed();
  if ("error" in a) return a;
  const name = String(form.get("displayName") ?? "").trim();
  if (name.length > 60) return { error: "Use 60 characters or fewer." };
  const { error } = await a.supabase.from("profiles").update({ display_name: name || null }).eq("id", a.user.id);
  if (error) return { error: "Couldn't save. Try again." };
  revalidatePath("/account");
  return { ok: true };
}

export async function changeEmail(_: Result, form: FormData): Promise<Result> {
  const a = await authed(true);
  if ("error" in a) return a;
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/.test(email)) return { error: "Enter a valid email address." };
  if (!limit(`email-change:${a.user.id}`, 3, 60 * 60_000) || !limit(`ip:${await clientIp()}`, 10, 15 * 60_000)) {
    return { error: "Too many attempts. Try again later." };
  }
  await a.supabase.auth.updateUser({ email }, { emailRedirectTo: `${siteUrl()}/auth/callback?next=/account` });
  // Neutral reply: never reveal whether the new address already belongs to an account.
  return { ok: true };
}

export async function startMfaEnroll(): Promise<Result> {
  const a = await authed(true);
  if ("error" in a) return a;
  const { data: existing } = await a.supabase.auth.mfa.listFactors();
  for (const f of existing?.all ?? []) if (f.status === "unverified") await a.supabase.auth.mfa.unenroll({ factorId: f.id });
  const { data, error } = await a.supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "Authenticator app" });
  if (error || !data) return { error: "Two-step verification isn't available right now." };
  return { ok: true, data: { factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret } };
}

export async function confirmMfaEnroll(_: Result, form: FormData): Promise<Result> {
  const a = await authed(true);
  if ("error" in a) return a;
  const factorId = String(form.get("factorId") ?? "");
  const code = String(form.get("code") ?? "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) return { error: "Enter the 6-digit code." };
  if (!limit(`mfa-enroll:${a.user.id}`, 10, 15 * 60_000)) return { error: "Too many attempts. Try again later." };
  const { error } = await a.supabase.auth.mfa.challengeAndVerify({ factorId, code });
  if (error) return { error: "That code didn't work. Try the newest code." };
  revalidatePath("/account");
  return { ok: true };
}

export async function removeMfa(): Promise<Result> {
  const a = await authed(true);
  if ("error" in a) return a;
  const { data } = await a.supabase.auth.mfa.listFactors();
  for (const f of data?.all ?? []) await a.supabase.auth.mfa.unenroll({ factorId: f.id });
  revalidatePath("/account");
  return { ok: true };
}

/**
 * Deletes every stored file, then the auth user. Database rows (profile, saved courses,
 * My Courses, certificates, file metadata) are removed by ON DELETE CASCADE.
 */
export async function deleteAccount(_: Result, form: FormData): Promise<Result> {
  const a = await authed(true);
  if ("error" in a) return a;
  if (String(form.get("confirm") ?? "") !== "DELETE") return { error: 'Type DELETE to confirm.' };
  const admin = createAdminClient();
  if (!admin) return { error: "Account deletion isn't configured on this server yet." };
  const folder = a.user.id;
  for (;;) {
    const { data: objs, error } = await admin.storage.from(BUCKET).list(folder, { limit: 100 });
    if (error) return { error: "Couldn't delete your files. Nothing was removed; try again." };
    if (!objs?.length) break;
    const { error: rmErr } = await admin.storage.from(BUCKET).remove(objs.map((o) => `${folder}/${o.name}`));
    if (rmErr) return { error: "Couldn't delete your files. Try again." };
  }
  const { error } = await admin.auth.admin.deleteUser(a.user.id);
  if (error) return { error: "Couldn't delete the account. Try again." };
  const store = await cookies();
  for (const c of store.getAll()) if (c.name.startsWith("sb-")) store.delete(c.name);
  return { ok: true };
}

/** Weekly email alerts on or off. Only the on/off switch is stored; no email address is copied. */
export async function setEmailAlerts(_: Result, form: FormData): Promise<Result> {
  const a = await authed();
  if ("error" in a) return a;
  const enabled = form.get("enabled") === "on";
  if (!limit(`alerts:${a.user.id}`, 20, 60 * 60_000)) return { error: "Too many changes. Try again later." };
  const { data, error } = await a.supabase.from("email_alerts").update({ enabled }).eq("user_id", a.user.id).select("user_id");
  if (error) return { error: "Couldn't save. Try again." };
  if (!data?.length) {
    const { error: insErr } = await a.supabase.from("email_alerts").insert({ enabled });
    if (insErr) return { error: "Couldn't save. Try again." };
  }
  revalidatePath("/account");
  return { ok: true, data: { enabled: String(enabled) } };
}
