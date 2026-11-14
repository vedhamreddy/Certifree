"use client";
import { useEffect, useState } from "react";
import { providerBySlug } from "@/data/providers";
import { domainLabels, Domain } from "@/data/courses";
import { Certificate, getCertificateFile, useCertificates } from "@/lib/certificates";
import { ProviderAvatar } from "./ProviderAvatar";

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
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition hover:shadow-[0_12px_30px_rgba(79,70,229,0.12)]">
      <div className="relative grid h-40 place-items-center overflow-hidden bg-gradient-to-br from-indigo-50 to-emerald-50 dark:from-indigo-500/10 dark:to-emerald-500/10">
        {isImage && url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={`Certificate: ${cert.title}`} className="h-full w-full bg-white object-contain p-2" />
        ) : (
          <div className="text-center">
            <div className="text-5xl" aria-hidden>{cert.fileType === "application/pdf" ? "📄" : "🎓"}</div>
            <div className="mt-1 text-xs font-medium text-muted">{cert.fileType === "application/pdf" ? "PDF certificate" : cert.link ? "Online credential" : "Certificate"}</div>
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-surface/90 px-2.5 py-1 text-xs font-semibold shadow-sm">
          {domainLabels[cert.domain as Domain] ?? cert.domain}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center gap-2">
          {known ? <ProviderAvatar slug={cert.provider} size="sm" /> : <span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-500 text-xs font-bold text-white">{issuerName(cert)[0]}</span>}
          <span className="text-sm font-semibold">{issuerName(cert)}</span>
        </div>
        <h3 className="line-clamp-2 font-semibold leading-snug">{cert.title}</h3>
        <dl className="mt-2 space-y-0.5 text-sm text-muted">
          <div>Completed {formatDate(cert.issuedOn)}</div>
          {cert.credentialId && <div className="truncate">ID: <span className="font-mono text-ink">{cert.credentialId}</span></div>}
        </dl>
        <div className="mt-auto flex flex-wrap gap-2 pt-4 text-sm font-semibold">
          {url && <a href={url} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-brand px-3 py-1.5 text-white hover:bg-brand-600">View</a>}
          {cert.link && <a href={cert.link} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-line px-3 py-1.5 hover:border-brand">Verify ↗</a>}
          <button type="button" onClick={() => onEdit(cert)} className="rounded-xl border border-line px-3 py-1.5 hover:border-brand">Edit</button>
          {confirming ? (
            <span className="flex gap-1">
              <button type="button" onClick={() => remove(cert.id)} className="rounded-xl bg-rose-600 px-3 py-1.5 text-white">Delete</button>
              <button type="button" onClick={() => setConfirming(false)} className="rounded-xl px-2 py-1.5 text-muted">Keep</button>
            </span>
          ) : (
            <button type="button" onClick={() => setConfirming(true)} className="rounded-xl px-3 py-1.5 text-muted hover:text-rose-600" aria-label={`Delete ${cert.title}`}>Delete</button>
          )}
        </div>
      </div>
    </article>
  );
}
