import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { secureCookie, supabaseEnv } from "./env";

/** A Supabase client bound to the signed-in user's HttpOnly session cookies. Null when accounts are off. */
export async function createClient(): Promise<SupabaseClient | null> {
  const env = supabaseEnv();
  if (!env) return null;
  const store = await cookies();
  return createServerClient(env.url, env.key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, secureCookie(options)));
        } catch {
          // Server Components can't set cookies; middleware refreshes the session instead.
        }
      },
    },
  });
}

export type Authed = { supabase: SupabaseClient; user: User };

/**
 * Verifies the session with Supabase Auth (not just by reading the cookie).
 * Returns null when signed out, or when the account uses an authenticator app
 * and this session hasn't completed that second step yet.
 */
export async function getAuthed(): Promise<Authed | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal && aal.nextLevel === "aal2" && aal.currentLevel !== "aal2") return null;
  return { supabase, user: data.user };
}

/** True when this session was signed in within the last `minutes` minutes. */
export async function isRecentSignIn(supabase: SupabaseClient, minutes = 10): Promise<boolean> {
  const { data } = await supabase.auth.getClaims();
  const amr = (data?.claims?.amr ?? []) as Array<{ method: string; timestamp: number } | string>;
  const latest = Math.max(0, ...amr.map((a) => (typeof a === "string" ? 0 : a.timestamp)));
  return latest > 0 && Date.now() / 1000 - latest < minutes * 60;
}

/** Whether the user still has to pass the authenticator-app step for this session. */
export async function needsMfa(supabase: SupabaseClient) {
  const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  return !!data && data.nextLevel === "aal2" && data.currentLevel !== "aal2";
}
