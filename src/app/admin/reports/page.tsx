import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { Metadata } from "next";
import { getAuthed, type Authed } from "@/lib/supabase/server";
import { findCourse } from "@/lib/catalog-server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Course reports", robots: { index: false, follow: false } };

type Report = { id: string; course_id: string; message: string; status: "open" | "resolved" | "dismissed"; created_at: string; reviewed_at: string | null };

/** Signed in, past two-step verification if set up, and holds the catalog_admin role. */
async function admin(): Promise<Authed | null> {
  const a = await getAuthed();
  if (!a) return null;
  const { data } = await a.supabase.rpc("is_catalog_admin");
  return data === true ? a : null;
}

async function setStatus(form: FormData) {
  "use server";
  const a = await admin();
  if (!a) return;
  const id = String(form.get("id") ?? "");
  const status = String(form.get("status") ?? "");
  if (!/^[0-9a-f-]{36}$/.test(id) || !["open", "resolved", "dismissed"].includes(status)) return;
  await a.supabase
    .from("correction_reports")
    .update({ status, reviewed_at: status === "open" ? null : new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/admin/reports");
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });
}

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  const a = await admin();
  if (!a) notFound(); // non-admins don't learn this page exists
  const show = (await searchParams).show === "all" ? "all" : "open";
  let q = a.supabase.from("correction_reports").select("id, course_id, message, status, created_at, reviewed_at").order("created_at", { ascending: false }).limit(200);
  if (show === "open") q = q.eq("status", "open");
  const { data, error } = await q;
  const reports = (data ?? []) as Report[];
  const titles = Object.fromEntries(await Promise.all([...new Set(reports.map((r) => r.course_id))].map(async (id) => [id, (await findCourse(id))?.title ?? id])));
  const btn = "h-8 rounded-full border border-line bg-white px-3 text-xs font-semibold text-ink transition hover:bg-surface-2";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-ink">Course reports</h1>
      <p className="mt-2 text-muted">What learners say is wrong with a course. Fix it in <code className="text-ink">src/data/courses.ts</code> (or hide it in Supabase), then mark it resolved. <Link href="/admin/stats" className="font-semibold text-ink underline underline-offset-4">Stats</Link></p>
      <div className="mt-6 flex gap-2 text-sm font-semibold">
        <Link href="/admin/reports" className={`rounded-full px-4 py-2 ${show === "open" ? "bg-brand text-white" : "bg-white text-ink ring-1 ring-inset ring-line"}`}>Open</Link>
        <Link href="/admin/reports?show=all" className={`rounded-full px-4 py-2 ${show === "all" ? "bg-brand text-white" : "bg-white text-ink ring-1 ring-inset ring-line"}`}>All</Link>
      </div>
      {error && <p className="mt-6 text-sm text-danger">Couldn&apos;t load reports. Try again.</p>}
      {!error && !reports.length && <p className="mt-6 rounded-3xl border border-dashed border-line bg-surface-2 p-6 text-sm text-muted">Nothing to review.</p>}
      <ul className="mt-6 space-y-3">
        {reports.map((r) => (
          <li key={r.id} className="rounded-3xl border border-line bg-white p-5 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <Link href={`/courses/${r.course_id}`} className="font-semibold text-ink hover:underline">{titles[r.course_id]}</Link>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${r.status === "open" ? "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-600/20" : "bg-surface-2 text-muted ring-1 ring-inset ring-line"}`}>{r.status}</span>
            </div>
            <p className="mt-2 whitespace-pre-wrap break-words text-sm text-ink">{r.message}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="mr-auto text-xs text-muted">{fmt(r.created_at)}</span>
              {(["resolved", "dismissed", "open"] as const).filter((s) => s !== r.status).map((s) => (
                <form key={s} action={setStatus}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="status" value={s} />
                  <button type="submit" className={btn}>{s === "open" ? "Reopen" : s === "resolved" ? "Mark resolved" : "Dismiss"}</button>
                </form>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
