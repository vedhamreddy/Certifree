import { NextResponse, type NextRequest } from "next/server";
import { createClient, needsMfa } from "@/lib/supabase/server";
import { safeNext } from "@/lib/supabase/env";

/**
 * PKCE callback for magic links and Google. The one-time code is exchanged using the
 * verifier cookie set when sign-in started, then the user is sent on without the code
 * in the address bar. Nothing here is logged.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next"));
  const fail = NextResponse.redirect(new URL(`/auth/sign-in?next=${next}&error=link`, url.origin));
  if (!code) return fail;
  const supabase = await createClient();
  if (!supabase) return fail;
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return fail;
  const dest = (await needsMfa(supabase)) ? `/auth/mfa?next=${next}` : next;
  const res = NextResponse.redirect(new URL(dest, url.origin));
  res.headers.set("Referrer-Policy", "no-referrer");
  res.headers.set("Cache-Control", "no-store");
  return res;
}
