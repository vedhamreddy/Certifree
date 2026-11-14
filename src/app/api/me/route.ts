import { json } from "@/lib/api";
import { authEnabled } from "@/lib/supabase/env";
import { getAuthed } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** Tells the page whether someone is signed in. No email, no token. */
export async function GET() {
  if (!authEnabled()) return json({ enabled: false, signedIn: false });
  const a = await getAuthed();
  return json({ enabled: true, signedIn: !!a, userId: a?.user.id });
}
