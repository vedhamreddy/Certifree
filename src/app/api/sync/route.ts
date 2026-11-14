import { json, toCertificate, toLearning, withUser } from "@/lib/api";

export const dynamic = "force-dynamic";

/** Everything synced to the signed-in learner's account, for the review screen. */
export async function GET(req: Request) {
  return withUser(req, async ({ supabase }) => {
    const [b, l, c, f] = await Promise.all([
      supabase.from("bookmarks").select("course_id"),
      supabase.from("learning").select("course_id, started_on, progress, target_date, updated_at"),
      supabase.from("certificates").select("*"),
      supabase.from("certificate_files").select("certificate_id, file_name, mime_type, size_bytes"),
    ]);
    if (b.error || l.error || c.error || f.error) return json({ error: "server_error" }, 500);
    const files = new Map(f.data.map((x) => [x.certificate_id, x]));
    return json({
      bookmarks: b.data.map((x) => x.course_id),
      learning: l.data.map(toLearning),
      certificates: c.data.map((r) => toCertificate(r, files.get(r.id))),
    });
  });
}
