import { createClient } from "@supabase/supabase-js";
import { isCourseId, refreshCourseIds } from "@/lib/api";
import { supabaseEnv } from "@/lib/supabase/env";
import { clientIp, limit } from "@/lib/rate-limit";

/**
 * Counts a course page view or a "Go to course" click. Stores only a daily total per course:
 * no cookies, no user ID, no IP address. The IP is used in memory for rate limiting only.
 */
export async function POST(req: Request) {
  const done = new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  const env = supabaseEnv();
  if (!env) return done;
  const body = await req.json().catch(() => null);
  const kind = body?.kind === "click" ? "click" : body?.kind === "view" ? "view" : null;
  await refreshCourseIds();
  if (!kind || !isCourseId(body?.courseId)) return done;
  if (!limit(`track:${await clientIp()}`, 120, 60 * 60_000)) return done;
  const anon = createClient(env.url, env.key, { auth: { persistSession: false, autoRefreshToken: false } });
  await anon.rpc("track_course_event", { cid: body.courseId, kind }).then(() => null, () => null);
  return done;
}
