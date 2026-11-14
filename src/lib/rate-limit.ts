import "server-only";
import { createHash } from "crypto";
import { headers } from "next/headers";

/**
 * Small fixed-window limiter kept in server memory. It protects a single server well;
 * on serverless hosts each instance keeps its own count, so Supabase Auth's own email
 * and sign-in rate limits (configured in the dashboard) remain the hard backstop.
 * Keys are hashed so no email address is held in memory.
 */
const hits = new Map<string, { n: number; reset: number }>();

export function limit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const k = createHash("sha256").update(key).digest("hex");
  const cur = hits.get(k);
  if (!cur || cur.reset < now) {
    hits.set(k, { n: 1, reset: now + windowMs });
    if (hits.size > 10_000) for (const [kk, v] of hits) if (v.reset < now) hits.delete(kk);
    return true;
  }
  cur.n += 1;
  return cur.n <= max;
}

export async function clientIp() {
  const h = await headers();
  return h.get("cf-connecting-ip") || h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}
