"use client";
import { useEffect, useState } from "react";
import { providerBySlug } from "@/data/providers";
import { domainLabels, Domain } from "@/data/courses";
import { Certificate, getCertificateFile, useCertificates } from "@/lib/certificates";
import { ProviderAvatar } from "./ProviderAvatar";
import { ArrowUpRight, CalendarCheck, Eye, FileText, GraduationCap, Pencil, Trash2 } from "lucide-react";

export function issuerName(c: Certificate) {
  return c.provider === "other" ? c.providerName ?? "Other" : providerBySlug[c.provider]?.name ?? c.provider;
}

function formatDate(d: string) {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, day)).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export function CertificateCard({ cert, onEdit }: { cert: Certificate; onEdit: (c: Certificate) => void }) {
  const { remove } = useCertificates();
  const [url, setUrl] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const isImage = cert.fileType?.startsWith("image/");

  useEffect(() => {
    let u: string | null = null;
    if (cert.fileName) {
      getCertificateFile(cert.id).then((blob) => {
        if (blob) {
          u = URL.createObjectURL(blob);
          setUrl(u);
        }
      });
    }
    return () => {
      if (u) URL.revokeObjectURL(u);
    };
  }, [cert.id, cert.fileName]);

  const known = cert.provider !== "other" && providerBySlug[cert.provider];

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-card transition duration-200 hover:border-slate-300 hover:shadow-lift">
      <div className="hero-bg relative grid h-40 place-items-center overflow-hidden border-b border-line">
        {isImage && url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={`Certificate: ${cert.title}`} className="h-full w-full bg-white object-contain p-2" />
        ) : (
          <div className="text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-white text-brand shadow-card ring-1 ring-inset ring-line">{cert.fileType === "application/pdf" ? <FileText size={22} strokeWidth={1.75} aria-hidden /> : <GraduationCap size={22} strokeWidth={1.75} aria-hidden />}</span>
            <div className="mt-2 text-xs font-medium text-muted">{cert.fileType === "application/pdf" ? "PDF certificate" : cert.link ? "Online credential" : "Certificate"}</div>
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-lg bg-white/95 px-2 py-1 text-xs font-semibold text-ink shadow-card ring-1 ring-inset ring-line">
          {domainLabels[cert.domain as Domain] ?? cert.domain}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center gap-2">
          {known ? <ProviderAvatar slug={cert.provider} size="sm" /> : <span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600 ring-1 ring-inset ring-slate-500/15">{issuerName(cert)[0]}</span>}
          <span className="text-sm font-semibold text-ink">{issuerName(cert)}</span>
        </div>
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-ink">{cert.title}</h3>
        <dl className="mt-2 space-y-0.5 text-sm text-muted">
          <div className="flex items-center gap-1.5"><CalendarCheck size={14} strokeWidth={1.75} aria-hidden />Completed {formatDate(cert.issuedOn)}</div>
          {cert.credentialId && <div className="truncate">ID: <span className="font-mono text-ink">{cert.credentialId}</span></div>}
        </dl>
        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-4 text-sm font-semibold">
          {url && <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg bg-brand px-3 py-1.5 text-white transition hover:bg-brand-600"><Eye size={14} strokeWidth={2} aria-hidden />View</a>}
          {cert.link && <a href={cert.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-ink transition hover:border-slate-300 hover:bg-surface-2">Verify <ArrowUpRight size={14} strokeWidth={2} aria-hidden /></a>}
          <button type="button" onClick={() => onEdit(cert)} className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-ink transition hover:border-slate-300 hover:bg-surface-2"><Pencil size={13} strokeWidth={2} aria-hidden />Edit</button>
          {confirming ? (
            <span className="flex gap-1">
              <button type="button" onClick={() => remove(cert.id)} className="rounded-lg bg-danger px-3 py-1.5 text-white transition hover:bg-red-700">Delete</button>
              <button type="button" onClick={() => setConfirming(false)} className="rounded-lg px-2 py-1.5 text-muted transition hover:text-ink">Keep</button>
            </span>
          ) : (
            <button type="button" onClick={() => setConfirming(true)} className="ml-auto rounded-lg p-1.5 text-muted transition hover:bg-red-50 hover:text-danger" aria-label={`Delete ${cert.title}`}><Trash2 size={16} strokeWidth={1.75} aria-hidden /></button>
          )}
        </div>
      </div>
    </article>
  );
}
