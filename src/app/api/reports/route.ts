import { createClient as createPlainClient } from "@supabase/supabase-js";
import { fail, isCourseId, json, refreshCourseIds } from "@/lib/api";
import { getAuthed } from "@/lib/supabase/server";
import { supabaseEnv } from "@/lib/supabase/env";
import { clientIp, limit } from "@/lib/rate-limit";

/**
 * "Report wrong info" on a course page. Works signed in (the report is linked to the account)
 * or signed out (no reporter stored at all). Rate-limited per IP and per account.
 */
export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  try {
    if (origin && new URL(origin).host !== new URL(req.url).host) return fail(403, "forbidden");
  } catch {
    return fail(403, "forbidden");
  }
  const env = supabaseEnv();
  if (!env) return fail(503, "accounts_off");
  const body = await req.json().catch(() => null);
  if (body?.website) return json({ ok: true }); // honeypot: bots fill hidden fields
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  await refreshCourseIds();
  if (!isCourseId(body?.courseId) || message.length < 5 || message.length > 1000) return fail(400, "invalid");
  const ip = await clientIp();
  if (!limit(`report:${ip}`, 5, 60 * 60_000) || !limit(`report-day:${ip}`, 20, 24 * 60 * 60_000)) return fail(429, "slow_down");

  try {
    const authed = await getAuthed();
    if (authed) {
      if (!limit(`report-user:${authed.user.id}`, 10, 24 * 60 * 60_000)) return fail(429, "slow_down");
      const { error } = await authed.supabase.from("correction_reports").insert({ course_id: body.courseId, message });
      return error ? fail(500, "server_error") : json({ ok: true });
    }
    const anon = createPlainClient(env.url, env.key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { error } = await anon.from("correction_reports").insert({ course_id: body.courseId, message });
    return error ? fail(500, "server_error") : json({ ok: true });
  } catch {
    return fail(500, "server_error");
  }
}
