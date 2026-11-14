import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseEnv } from "@/lib/supabase/env";
import { clientIp, limit } from "@/lib/rate-limit";

const TOKEN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * One-click unsubscribe. Mail apps call it with POST (RFC 8058, token in the URL);
 * the /unsubscribe page posts a form with the token. A plain GET never unsubscribes,
 * so link scanners can't switch alerts off by accident.
 */
export async function POST(req: Request) {
  const url = new URL(req.url);
  const form = await req.formData().catch(() => null);
  const token = String(url.searchParams.get("t") ?? form?.get("t") ?? "");
  const fromPage = form?.get("from") === "page";
  if (!TOKEN.test(token) || !limit(`unsub:${await clientIp()}`, 30, 60 * 60_000)) return new NextResponse("Invalid link", { status: 400 });
  const env = supabaseEnv();
  if (!env) return new NextResponse("Unavailable", { status: 503 });
  const anon = createClient(env.url, env.key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await anon.rpc("unsubscribe_email_alerts", { token: token.toLowerCase() });
  if (error) return new NextResponse("Try again later", { status: 500 });
  return fromPage ? NextResponse.redirect(new URL("/unsubscribe?done=1", url.origin), 303) : new NextResponse("Unsubscribed", { status: 200 });
}
