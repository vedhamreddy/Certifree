import { BUCKET, fail, isCertId, json, parseCertificate, storagePath, withUser } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  const { id } = await params;
  return withUser(req, async ({ supabase, user }) => {
    const row = parseCertificate(id, await req.json().catch(() => null));
    if (!row) return fail(400, "invalid");
    const { error } = await supabase.from("certificates").upsert({ ...row, user_id: user.id }, { onConflict: "user_id,id" });
    return error ? fail(500, "server_error") : json({ ok: true });
  });
}

/** Deletes the certificate, its file metadata (cascade) and the stored file. */
export async function DELETE(req: Request, { params }: Ctx) {
  const { id } = await params;
  if (!isCertId(id)) return fail(400, "invalid");
  return withUser(req, async ({ supabase, user }) => {
    const { error: sErr } = await supabase.storage.from(BUCKET).remove([storagePath(user.id, id)]);
    if (sErr) return fail(500, "server_error");
    const { error } = await supabase.from("certificates").delete().eq("user_id", user.id).eq("id", id);
    return error ? fail(500, "server_error") : json({ ok: true });
  });
}
