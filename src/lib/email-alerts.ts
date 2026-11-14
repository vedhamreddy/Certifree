/**
 * Weekly email alerts (runs daily from the Cloudflare cron, see custom-worker.ts).
 * Each opted-in learner gets at most one email every 6 days, and only when there is
 * something to say: new free courses added in the last 7 days, or free offers closing
 * in the next 21 days. Sent through Resend (https://resend.com) in batches.
 *
 * Privacy: email addresses are read from Supabase Auth at send time and never stored by
 * CertiFree. Each email has a one-click unsubscribe link (RFC 8058).
 */
import { courses as bundled } from "../data/courses";
import { providerBySlug } from "../data/providers";

export type EmailEnv = {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  SITE_URL?: string;
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string; // e.g. "CertiFree <alerts@yourdomain.com>"
};
type Fetch = typeof fetch;
type Row = Record<string, unknown>;
type Item = { title: string; provider: string; href: string; when?: string };

const BATCH = 100; // Resend batch limit
const MAX_BATCHES = 3; // up to 300 emails per run; anyone left gets theirs the next day

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const day = (d: Date) => d.toISOString().slice(0, 10);
const nice = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });

export function renderEmail(site: string, fresh: Item[], closing: Item[], unsubscribeUrl: string) {
  const list = (items: Item[]) =>
    items
      .map((i) => `<li style="margin:0 0 10px"><a href="${esc(i.href)}" style="color:#0a0a0a;font-weight:600">${esc(i.title)}</a><br><span style="color:#6b6b6b;font-size:13px">${esc(i.provider)}${i.when ? ` · closes ${esc(i.when)}` : ""}</span></li>`)
      .join("");
  const section = (title: string, items: Item[]) => (items.length ? `<h2 style="font-size:16px;margin:24px 0 10px">${title}</h2><ul style="padding-left:18px;margin:0">${list(items)}</ul>` : "");
  const html = `<!doctype html><html><body style="margin:0;background:#f2f2f2;font-family:Inter,Arial,sans-serif;color:#0a0a0a">
<div style="max-width:560px;margin:0 auto;padding:24px"><div style="background:#fff;border-radius:20px;padding:28px">
<div style="font-weight:700;font-size:18px">CertiFree</div>
<p style="color:#6b6b6b;margin:6px 0 0">Your weekly roundup of free courses and deadlines.</p>
${section("New free courses", fresh)}${section("Free offers closing soon", closing)}
<p style="margin:28px 0 0"><a href="${esc(site)}/courses" style="display:inline-block;background:#0a0a0a;color:#fff;text-decoration:none;border-radius:999px;padding:10px 18px;font-weight:600">Browse all courses</a></p>
</div><p style="color:#6b6b6b;font-size:12px;text-align:center;margin:16px 0 0">You get this because you switched on email alerts in your CertiFree account.<br><a href="${esc(unsubscribeUrl)}" style="color:#6b6b6b">Unsubscribe</a></p></div></body></html>`;
  const textList = (items: Item[]) => items.map((i) => `- ${i.title} (${i.provider}${i.when ? `, closes ${i.when}` : ""})\n  ${i.href}`).join("\n");
  const text = [
    "CertiFree: your weekly roundup",
    fresh.length ? `\nNew free courses\n${textList(fresh)}` : "",
    closing.length ? `\nFree offers closing soon\n${textList(closing)}` : "",
    `\nBrowse all courses: ${site}/courses`,
    `\nUnsubscribe: ${unsubscribeUrl}`,
  ].join("\n");
  return { html, text };
}

export async function runEmailAlerts(env: EmailEnv, f: Fetch = fetch, now = new Date()) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase settings missing");
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) return { sent: 0, note: "RESEND_API_KEY or EMAIL_FROM not set; skipped" };
  const site = (env.SITE_URL ?? "").replace(/\/$/, "");
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  const auth: Record<string, string> = key.startsWith("eyJ") ? { apikey: key, Authorization: `Bearer ${key}` } : { apikey: key };
  const rest = async (path: string, init: RequestInit = {}) => {
    const res = await f(`${env.SUPABASE_URL}/rest/v1/${path}`, { ...init, headers: { ...auth, "Content-Type": "application/json", ...(init.headers as Record<string, string>) } });
    if (!res.ok) throw new Error(`supabase ${path.split("?")[0]}: ${res.status}`);
    return res.status === 204 ? null : res.json().catch(() => null);
  };

  // 1. Who is due?
  const sixDaysAgo = new Date(now.getTime() - 6 * 86_400_000).toISOString();
  const due = ((await rest(`email_alerts?select=user_id,unsubscribe_token&enabled=eq.true&or=(last_sent_at.is.null,last_sent_at.lt.${encodeURIComponent(sixDaysAgo)})&limit=${BATCH * MAX_BATCHES}`)) ?? []) as Row[];
  if (!due.length) return { sent: 0, note: "nobody due" };

  // 2. Anything to say?
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000).toISOString();
  const freshRows = ((await rest(`catalog_courses?select=id,title,provider&status=eq.active&first_seen=gte.${encodeURIComponent(weekAgo)}&order=first_seen.desc&limit=12`)) ?? []) as Row[];
  const fresh: Item[] = freshRows.map((r) => ({ title: String(r.title), provider: providerBySlug[String(r.provider)]?.name ?? String(r.provider), href: `${site}/courses/${r.id}` }));
  const today = day(now);
  const horizon = day(new Date(now.getTime() + 21 * 86_400_000));
  const closing: Item[] = bundled
    .filter((c) => c.closesOn && c.closesOn >= today && c.closesOn <= horizon)
    .sort((a, b) => a.closesOn!.localeCompare(b.closesOn!))
    .map((c) => ({ title: c.title, provider: providerBySlug[c.provider].name, href: `${site}/courses/${c.id}`, when: nice(c.closesOn!) }));
  if (!fresh.length && !closing.length) return { sent: 0, note: "nothing new this week" };

  // 3. Email addresses, read from Supabase Auth now and not stored.
  const users = await f(`${env.SUPABASE_URL}/auth/v1/admin/users?per_page=1000&page=1`, { headers: auth });
  if (!users.ok) throw new Error(`auth users: ${users.status}`);
  const emailById = new Map<string, string>();
  for (const u of ((await users.json()) as { users?: Row[] }).users ?? []) {
    if (typeof u.email === "string" && u.email && (u.email_confirmed_at || u.confirmed_at)) emailById.set(String(u.id), u.email);
  }

  // 4. Send in batches.
  const subject = fresh.length ? `${fresh.length} new free course${fresh.length === 1 ? "" : "s"} on CertiFree` : "Free offers closing soon on CertiFree";
  const messages = due
    .filter((d) => emailById.has(String(d.user_id)))
    .map((d) => {
      const unsub = `${site}/api/unsubscribe?t=${d.unsubscribe_token}`;
      const { html, text } = renderEmail(site, fresh, closing, `${site}/unsubscribe?t=${d.unsubscribe_token}`);
      return {
        userId: String(d.user_id),
        body: { from: env.EMAIL_FROM, to: [emailById.get(String(d.user_id))], subject, html, text, headers: { "List-Unsubscribe": `<${unsub}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } },
      };
    });
  const sentIds: string[] = [];
  for (let i = 0; i < messages.length && i < BATCH * MAX_BATCHES; i += BATCH) {
    const chunk = messages.slice(i, i + BATCH);
    const res = await f("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(chunk.map((m) => m.body)),
    });
    if (!res.ok) throw new Error(`resend: ${res.status} ${(await res.text()).slice(0, 200)}`);
    sentIds.push(...chunk.map((m) => m.userId));
  }

  // 5. Remember when we sent, so nobody gets more than one a week.
  if (sentIds.length) {
    await rest(`email_alerts?user_id=in.(${sentIds.join(",")})`, { method: "PATCH", body: JSON.stringify({ last_sent_at: now.toISOString() }), headers: { Prefer: "return=minimal" } });
  }
  return { sent: sentIds.length, note: `${fresh.length} new, ${closing.length} closing` };
}
