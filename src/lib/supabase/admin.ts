import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client. It bypasses row-level security, so it is used for exactly two
 * things: deleting an account (and its stored files), and nothing reachable from the
 * browser without a verified, recently signed-in user. The key must never be NEXT_PUBLIC_.
 */
export function createAdminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
