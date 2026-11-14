import { fail, withUser } from "@/lib/api";

export const dynamic = "force-dynamic";

/** Download of everything stored for this account. Needs a recent sign-in. */
export async function GET(req: Request) {
  return withUser(
    req,
    async ({ supabase, user }) => {
      const [p, b, l, c, f, e] = await Promise.all([
        supabase.from("profiles").select("display_name, created_at").eq("id", user.id).maybeSingle(),
        supabase.from("bookmarks").select("course_id, created_at"),
        supabase.from("learning").select("course_id, started_on, progress, target_date, updated_at"),
        supabase.from("certificates").select("id, course_id, title, provider, provider_name, domain, issued_on, credential_id, link, added_at, updated_at"),
        supabase.from("certificate_files").select("certificate_id, file_name, mime_type, size_bytes, created_at"),
        supabase.from("email_alerts").select("enabled").eq("user_id", user.id).maybeSingle(),
      ]);
      if (p.error || b.error || l.error || c.error || f.error) return fail(500, "server_error");
      const body = JSON.stringify(
        {
          exportedAt: new Date().toISOString(),
          account: { email: user.email, createdAt: user.created_at, signInMethods: user.app_metadata?.providers ?? [] },
          profile: p.data,
          savedCourses: b.data,
          myCourses: l.data,
          certificates: c.data,
          certificateFiles: f.data,
          emailAlerts: e.error ? null : { enabled: !!e.data?.enabled },
          note: "Certificate files themselves can be opened from My Certificates while signed in.",
        },
        null,
        2,
      );
      return new Response(body, {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": 'attachment; filename="certifree-my-data.json"',
          "Cache-Control": "private, no-store",
        },
      });
    },
    { recent: true },
  );
}
