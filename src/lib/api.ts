import "server-only";
import { NextResponse } from "next/server";
import { getAuthed, isRecentSignIn, type Authed } from "./supabase/server";
import { courseById } from "@/data/courses";
import { providerBySlug } from "@/data/providers";
import { domainLabels } from "@/data/courses";
import type { Certificate } from "./certificates";
import type { LearningItem } from "./learning";

const NO_STORE = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };

export function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE });
}
export const fail = (status: number, error: string) => json({ error }, status);

/** Rejects cross-site requests that carry an Origin from somewhere else. */
function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return true; // same-origin GETs and some browsers omit it; cookies are SameSite=Lax anyway
  try {
    return new URL(origin).host === new URL(req.url).host;
  } catch {
    return false;
  }
}

/**
 * Every personal-data route goes through this: it checks the origin, then verifies the
 * session with Supabase Auth on the server. Database row-level security is the second lock.
 */
export async function withUser(req: Request, fn: (a: Authed) => Promise<Response>, opts: { recent?: boolean } = {}) {
  if (req.method !== "GET" && !sameOrigin(req)) return fail(403, "forbidden");
  const authed = await getAuthed();
  if (!authed) return fail(401, "signed_out");
  if (opts.recent && !(await isRecentSignIn(authed.supabase))) return fail(403, "reauth_required");
  try {
    return await fn(authed);
  } catch {
    // Never log request bodies, certificate details or file names.
    return fail(500, "server_error");
  }
}

// ---------- validation ----------
const ID_RE = /^[A-Za-z0-9-]{1,64}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const str = (v: unknown, max: number) => (typeof v === "string" && v.trim().length > 0 && v.trim().length <= max ? v.trim() : undefined);
const validDate = (v: unknown) => typeof v === "string" && DATE_RE.test(v) && !Number.isNaN(Date.parse(v));

export const isCertId = (id: string) => ID_RE.test(id);
export const isCourseId = (id: unknown): id is string => typeof id === "string" && !!courseById[id];

export function parseCertificate(id: string, body: unknown) {
  const b = (body ?? {}) as Record<string, unknown>;
  const title = str(b.title, 200);
  const provider = b.provider === "other" || (typeof b.provider === "string" && providerBySlug[b.provider]) ? (b.provider as string) : undefined;
  const providerName = provider === "other" ? str(b.providerName, 100) : null;
  const domain = typeof b.domain === "string" && b.domain in domainLabels ? b.domain : undefined;
  const link = b.link == null || b.link === "" ? null : str(b.link, 500);
  if (!isCertId(id) || !title || !provider || !domain || !validDate(b.issuedOn)) return null;
  if (provider === "other" && !providerName) return null;
  if (link !== null && (!link || !/^https?:\/\//i.test(link))) return null;
  if (b.courseId != null && !isCourseId(b.courseId)) return null;
  return {
    id,
    course_id: (b.courseId as string | undefined) ?? null,
    title,
    provider,
    provider_name: providerName,
    domain,
    issued_on: b.issuedOn as string,
    credential_id: b.credentialId == null || b.credentialId === "" ? null : str(b.credentialId, 200) ?? null,
    link,
    added_at: validDate(String(b.addedAt ?? "").slice(0, 10)) ? (b.addedAt as string) : new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

type CertRow = ReturnType<typeof parseCertificate> & {};
type FileRow = { certificate_id: string; file_name: string; mime_type: string; size_bytes: number };

export function toCertificate(r: CertRow, f?: FileRow): Certificate {
  return {
    id: r.id,
    courseId: r.course_id ?? undefined,
    title: r.title,
    provider: r.provider,
    providerName: r.provider_name ?? undefined,
    domain: r.domain,
    issuedOn: r.issued_on,
    credentialId: r.credential_id ?? undefined,
    link: r.link ?? undefined,
    fileName: f?.file_name,
    fileType: f?.mime_type,
    addedAt: r.added_at,
  };
}

export function parseLearning(courseId: string, body: unknown) {
  const b = (body ?? {}) as Record<string, unknown>;
  const progress = Number(b.progress);
  if (!isCourseId(courseId) || !validDate(b.startedOn) || !Number.isInteger(progress) || progress < 0 || progress > 100) return null;
  if (b.targetDate != null && b.targetDate !== "" && !validDate(b.targetDate)) return null;
  return {
    course_id: courseId,
    started_on: b.startedOn as string,
    progress,
    target_date: (b.targetDate as string) || null,
    updated_at: new Date().toISOString(),
  };
}

export function toLearning(r: { course_id: string; started_on: string; progress: number; target_date: string | null; updated_at: string }): LearningItem {
  return { courseId: r.course_id, startedOn: r.started_on, progress: r.progress, targetDate: r.target_date ?? undefined, updatedAt: r.updated_at };
}

// ---------- files ----------
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const BUCKET = "certificate-files";

/** Detects the real type from the file's first bytes; the browser-supplied type is ignored. */
export function sniffType(b: Uint8Array): string | null {
  const at = (sig: number[], off = 0) => sig.every((v, i) => b[off + i] === v);
  if (at([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (at([0xff, 0xd8, 0xff])) return "image/jpeg";
  if (at([0x47, 0x49, 0x46, 0x38])) return "image/gif";
  if (at([0x52, 0x49, 0x46, 0x46]) && at([0x57, 0x45, 0x42, 0x50], 8)) return "image/webp";
  if (at([0x25, 0x50, 0x44, 0x46, 0x2d])) return "application/pdf";
  return null;
}

export function cleanFileName(name: string) {
  const n = name.replace(/[\\/\u0000-\u001f\u007f]/g, "").trim().slice(-200);
  return n || "certificate";
}

export const storagePath = (userId: string, certId: string) => `${userId}/${certId}`;
