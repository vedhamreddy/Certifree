import { BUCKET, MAX_FILE_BYTES, cleanFileName, fail, isCertId, json, sniffType, storagePath, withUser } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };
const EXT: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/gif": "gif", "image/webp": "webp", "application/pdf": "pdf" };

/** Upload or replace the file for one of the learner's own certificates. */
export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  if (!isCertId(id)) return fail(400, "invalid");
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > MAX_FILE_BYTES + 64 * 1024) return fail(413, "too_large");
  return withUser(req, async ({ supabase, user }) => {
    // Ownership: the certificate must exist and belong to this user (RLS enforces it too).
    const { data: cert } = await supabase.from("certificates").select("id").eq("user_id", user.id).eq("id", id).maybeSingle();
    if (!cert) return fail(404, "not_found");
    const form = await req.formData().catch(() => null);
    const file = form?.get("file");
    if (!(file instanceof Blob) || file.size === 0) return fail(400, "invalid");
    if (file.size > MAX_FILE_BYTES) return fail(413, "too_large");
    const bytes = new Uint8Array(await file.arrayBuffer());
    const type = sniffType(bytes);
    if (!type) return fail(415, "unsupported_type");
    const path = storagePath(user.id, id);
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, bytes, { contentType: type, upsert: true });
    if (upErr) return fail(500, "server_error");
    const name = cleanFileName(file instanceof File ? file.name : "certificate");
    const { error } = await supabase
      .from("certificate_files")
      .upsert({ user_id: user.id, certificate_id: id, storage_path: path, file_name: name, mime_type: type, size_bytes: bytes.length }, { onConflict: "user_id,certificate_id" });
    return error ? fail(500, "server_error") : json({ ok: true, fileType: type });
  });
}

/** Streams the file to its owner only. No public or long-lived URL is ever created. */
export async function GET(req: Request, { params }: Ctx) {
  const { id } = await params;
  if (!isCertId(id)) return fail(400, "invalid");
  return withUser(req, async ({ supabase, user }) => {
    const { data: meta } = await supabase.from("certificate_files").select("storage_path, mime_type").eq("user_id", user.id).eq("certificate_id", id).maybeSingle();
    if (!meta) return fail(404, "not_found");
    const { data, error } = await supabase.storage.from(BUCKET).download(meta.storage_path);
    if (error || !data) return fail(404, "not_found");
    return new Response(data, {
      headers: {
        "Content-Type": meta.mime_type,
        "Content-Disposition": `inline; filename="certificate.${EXT[meta.mime_type] ?? "bin"}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; object-src 'self'",
      },
    });
  });
}

/** Removes the stored file and its metadata, keeping the certificate details. */
export async function DELETE(req: Request, { params }: Ctx) {
  const { id } = await params;
  if (!isCertId(id)) return fail(400, "invalid");
  return withUser(req, async ({ supabase, user }) => {
    const { error: sErr } = await supabase.storage.from(BUCKET).remove([storagePath(user.id, id)]);
    if (sErr) return fail(500, "server_error");
    const { error } = await supabase.from("certificate_files").delete().eq("user_id", user.id).eq("certificate_id", id);
    return error ? fail(500, "server_error") : json({ ok: true });
  });
}
