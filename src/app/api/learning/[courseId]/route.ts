import { fail, json, parseLearning, withUser } from "@/lib/api";

type Ctx = { params: Promise<{ courseId: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  const { courseId } = await params;
  return withUser(req, async ({ supabase, user }) => {
    const row = parseLearning(courseId, await req.json().catch(() => null));
    if (!row) return fail(400, "invalid");
    const { error } = await supabase.from("learning").upsert({ ...row, user_id: user.id }, { onConflict: "user_id,course_id" });
    return error ? fail(500, "server_error") : json({ ok: true });
  });
}

export async function DELETE(req: Request, { params }: Ctx) {
  const { courseId } = await params;
  return withUser(req, async ({ supabase, user }) => {
    const { error } = await supabase.from("learning").delete().eq("user_id", user.id).eq("course_id", courseId);
    return error ? fail(500, "server_error") : json({ ok: true });
  });
}
