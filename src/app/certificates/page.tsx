"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { domainLabels, Domain } from "@/data/courses";
import { Certificate, useCertificates } from "@/lib/certificates";
import { CertificateCard, issuerName } from "@/components/CertificateCard";
import { CertificateForm } from "@/components/CertificateForm";
import { withSignInNudge } from "@/components/SignInPrompt";
import { Download, GraduationCap, Plus, Trophy } from "lucide-react";

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

  const chip = (on: boolean) => `rounded-lg border px-3 py-1.5 text-sm font-medium transition duration-150 ${on ? "border-brand bg-brand text-white shadow-card" : "border-line bg-white text-ink hover:border-accent/40 hover:bg-accent/[0.04] hover:text-accent"}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="hero-bg flex flex-col gap-6 rounded-3xl border border-line p-6 shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-10">
        <div>
          <span className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-brand text-white shadow-card"><GraduationCap size={22} strokeWidth={1.75} aria-hidden /></span>
          <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">My Certificates</h1>
          <p className="mt-2 text-muted">Every certificate and badge you&apos;ve earned, in one place. Saved privately on this device.</p>
          {list.length > 0 && (
            <div className="mt-6 flex divide-x divide-line">
              <div className="pr-6"><div className="font-display text-2xl font-bold text-ink">{list.length}</div><div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Certificates</div></div>
              <div className="px-6"><div className="font-display text-2xl font-bold text-ink">{issuers.length}</div><div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Issuers</div></div>
              <div className="pl-6"><div className="font-display text-2xl font-bold text-ink">{domains.length}</div><div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Domains</div></div>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {list.length > 0 && <button type="button" onClick={download} className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-semibold text-ink shadow-card transition hover:border-slate-300 hover:bg-surface-2 active:scale-[0.98]"><Download size={16} strokeWidth={1.75} aria-hidden /> Download list</button>}
          <button type="button" onClick={() => setEditing({})} className="inline-flex h-11 items-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-white shadow-card transition hover:bg-brand-600 active:scale-[0.98]"><Plus size={16} strokeWidth={2} aria-hidden /> Add certificate</button>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-line bg-surface-2 px-6 py-16 text-center">
          <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-white text-accent shadow-card ring-1 ring-inset ring-line"><Trophy size={26} strokeWidth={1.75} aria-hidden /></span>
          <p className="text-lg font-semibold text-ink">No certificates yet</p>
          <p className="mx-auto mt-1 max-w-md text-muted">Finish a course, then tap &quot;I completed this&quot; on its page to add your certificate. You can also add certificates from anywhere else.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/courses?cost=free-cert" className="inline-flex h-11 items-center rounded-full bg-brand px-5 text-sm font-semibold text-white shadow-card transition hover:bg-brand-600 active:scale-[0.98]">Find a free certificate</Link>
            <button type="button" onClick={() => setEditing({})} className="inline-flex h-11 items-center rounded-full border border-line bg-white px-5 text-sm font-semibold text-ink shadow-card transition hover:border-slate-300 hover:bg-surface-2 active:scale-[0.98]">Add one now</button>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-8 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 w-20 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Domain</span>
              <button type="button" className={chip(!domain)} onClick={() => setDomain(null)}>All</button>
              {domains.map((d) => <button type="button" key={d} className={chip(domain === d)} onClick={() => setDomain(domain === d ? null : d)}>{domainLabels[d as Domain] ?? d}</button>)}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 w-20 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Issued by</span>
              <button type="button" className={chip(!issuer)} onClick={() => setIssuer(null)}>All</button>
              {issuers.map((i) => <button type="button" key={i} className={chip(issuer === i)} onClick={() => setIssuer(issuer === i ? null : i)}>{i}</button>)}
            </div>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {shown.map((c) => <CertificateCard key={c.id} cert={c} onEdit={setEditing} />)}
          </div>
          <p className="mt-8 text-sm text-muted">Tip: certificates are stored in this browser. Use &quot;Download list&quot; to keep a copy for your resume or LinkedIn, or <Link href="/sync" className="font-semibold text-accent hover:text-brand">sync them privately</Link> to your other devices.</p>
        </>
      )}

      <CertificateForm open={editing !== null} onClose={() => setEditing(null)} initial={editing ?? undefined} onSaved={() => withSignInNudge(() => {})} />
    </div>
  );
}
