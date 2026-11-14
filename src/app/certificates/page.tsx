"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { domainLabels, Domain } from "@/data/courses";
import { Certificate, useCertificates } from "@/lib/certificates";
import { CertificateCard, issuerName } from "@/components/CertificateCard";
import { CertificateForm } from "@/components/CertificateForm";

function toCsv(list: Certificate[]) {
  const esc = (v = "") => `"${v.replace(/"/g, '""')}"`;
  const rows = list.map((c) => [c.title, issuerName(c), domainLabels[c.domain as Domain] ?? c.domain, c.issuedOn, c.credentialId, c.link].map(esc).join(","));
  return ["Certificate,Issued by,Domain,Completed on,Credential ID,Verification link", ...rows].join("\n");
}

export default function CertificatesPage() {
  const { list } = useCertificates();
  const [domain, setDomain] = useState<string | null>(null);
  const [issuer, setIssuer] = useState<string | null>(null);
  const [editing, setEditing] = useState<Partial<Certificate> | null>(null);

  const issuers = useMemo(() => [...new Set(list.map(issuerName))].sort(), [list]);
  const domains = useMemo(() => [...new Set(list.map((c) => c.domain))], [list]);
  const shown = list
    .filter((c) => (!domain || c.domain === domain) && (!issuer || issuerName(c) === issuer))
    .sort((a, b) => b.issuedOn.localeCompare(a.issuedOn));

  function download() {
    const blob = new Blob([toCsv(shown)], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "my-certificates.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const chip = (on: boolean) => `rounded-full border px-3 py-1.5 text-sm font-medium transition ${on ? "border-brand bg-brand text-white" : "border-line bg-surface hover:border-brand hover:text-brand"}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="hero-bg flex flex-col gap-5 rounded-3xl border border-line bg-surface p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <h1 className="font-display text-3xl font-bold">🎓 My Certificates</h1>
          <p className="mt-1 text-muted">Every certificate and badge you&apos;ve earned, in one place. Saved privately on this device.</p>
          {list.length > 0 && (
            <div className="mt-4 flex gap-6">
              <div><div className="font-display text-2xl font-bold">{list.length}</div><div className="text-xs font-semibold uppercase tracking-wide text-muted">Certificates</div></div>
              <div><div className="font-display text-2xl font-bold">{issuers.length}</div><div className="text-xs font-semibold uppercase tracking-wide text-muted">Issuers</div></div>
              <div><div className="font-display text-2xl font-bold">{domains.length}</div><div className="text-xs font-semibold uppercase tracking-wide text-muted">Domains</div></div>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {list.length > 0 && <button type="button" onClick={download} className="rounded-2xl border border-line bg-surface px-4 py-3 font-semibold hover:border-brand">Download list</button>}
          <button type="button" onClick={() => setEditing({})} className="rounded-2xl bg-brand px-5 py-3 font-semibold text-white shadow-sm hover:bg-brand-600">+ Add certificate</button>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-line bg-surface p-10 text-center">
          <div className="mb-2 text-5xl">🏆</div>
          <p className="text-lg font-semibold">No certificates yet</p>
          <p className="mx-auto mt-1 max-w-md text-muted">Finish a course, then tap &quot;I completed this&quot; on its page to add your certificate. You can also add certificates from anywhere else.</p>
          <div className="mt-5 flex justify-center gap-3">
            <Link href="/courses?cost=free-cert" className="rounded-2xl bg-brand px-5 py-2.5 font-semibold text-white">Find a free certificate</Link>
            <button type="button" onClick={() => setEditing({})} className="rounded-2xl border border-line px-5 py-2.5 font-semibold">Add one now</button>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-6 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-sm font-semibold text-muted">Domain</span>
              <button type="button" className={chip(!domain)} onClick={() => setDomain(null)}>All</button>
              {domains.map((d) => <button type="button" key={d} className={chip(domain === d)} onClick={() => setDomain(domain === d ? null : d)}>{domainLabels[d as Domain] ?? d}</button>)}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-sm font-semibold text-muted">Issued by</span>
              <button type="button" className={chip(!issuer)} onClick={() => setIssuer(null)}>All</button>
              {issuers.map((i) => <button type="button" key={i} className={chip(issuer === i)} onClick={() => setIssuer(issuer === i ? null : i)}>{i}</button>)}
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {shown.map((c) => <CertificateCard key={c.id} cert={c} onEdit={setEditing} />)}
          </div>
          <p className="mt-6 text-sm text-muted">Tip: certificates are stored in this browser. Use &quot;Download list&quot; to keep a copy for your resume or LinkedIn.</p>
        </>
      )}

      <CertificateForm open={editing !== null} onClose={() => setEditing(null)} initial={editing ?? undefined} />
    </div>
  );
}
