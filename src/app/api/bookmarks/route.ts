import { fail, isCourseId, json, withUser } from "@/lib/api";

/** Add or remove saved courses: { add: string[], remove: string[] } (catalog IDs only). */
export async function POST(req: Request) {
  return withUser(req, async ({ supabase, user }) => {
    const body = await req.json().catch(() => null);
    const add: unknown[] = Array.isArray(body?.add) ? body.add : [];
    const remove: unknown[] = Array.isArray(body?.remove) ? body.remove : [];
    if (add.length + remove.length > 500 || !add.every(isCourseId) || !remove.every((id) => typeof id === "string" && /^[a-z0-9-]{1,80}$/.test(id))) return fail(400, "invalid");
    if (add.length) {
      const { error } = await supabase
        .from("bookmarks")
        .upsert((add as string[]).map((course_id) => ({ user_id: user.id, course_id })), { onConflict: "user_id,course_id", ignoreDuplicates: true });
      if (error) return fail(500, "server_error");
    }
    if (remove.length) {
      const { error } = await supabase.from("bookmarks").delete().eq("user_id", user.id).in("course_id", remove as string[]);
      if (error) return fail(500, "server_error");
    }
    return json({ ok: true });
  });
}
