/**
 * Supabase settings. These are read on the server only: the browser never talks to
 * Supabase directly and never receives a key or token. When the variables are missing,
 * accounts are switched off and CertiFree works exactly as before, local-only.
 */
export function supabaseEnv(): { url: string; key: string } | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  return url && key ? { url, key } : null;
}

export function authEnabled() {
  return supabaseEnv() !== null;
}

/** Public address of the site, used for sign-in redirect links. */
export function siteUrl() {
  return (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

type CookieOpts = { [k: string]: unknown };

/**
 * Session cookies are always HttpOnly and SameSite=Lax, and Secure in production.
 * (Safari refuses Secure cookies on http://localhost, so development drops that flag.)
 */
export function secureCookie<T extends CookieOpts | undefined>(options: T) {
  return {
    ...(options ?? {}),
    path: "/",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

/** Only allow redirects back to known pages on this site. */
const NEXT_ALLOWED = ["/account", "/sync", "/certificates", "/saved"];
export function safeNext(next: unknown): string {
  if (typeof next !== "string") return "/account";
  return NEXT_ALLOWED.find((p) => next === p) ?? "/account";
}
