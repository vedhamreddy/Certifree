"use client";
import { useEffect, useRef, useState } from "react";
import { providers } from "@/data/providers";
import { domainLabels } from "@/data/courses";
import { Certificate, MAX_FILE_MB, newId, useCertificates } from "@/lib/certificates";

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: Partial<Certificate>;
  onSaved?: (c: Certificate) => void;
};

const today = () => new Date().toISOString().slice(0, 10);
const field = "w-full rounded-xl border border-line bg-surface px-3 py-2.5 outline-none focus:border-brand";

export function CertificateForm({ open, onClose, initial, onSaved }: Props) {
  const { save } = useCertificates();
  const [title, setTitle] = useState("");
  const [provider, setProvider] = useState("other");
  const [providerName, setProviderName] = useState("");
  const [domain, setDomain] = useState("programming");
  const [issuedOn, setIssuedOn] = useState(today());
  const [credentialId, setCredentialId] = useState("");
  const [link, setLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setTitle(initial?.title ?? "");
    setProvider(initial?.provider ?? "other");
    setProviderName(initial?.providerName ?? "");
    setDomain(initial?.domain ?? "programming");
    setIssuedOn(initial?.issuedOn ?? today());
    setCredentialId(initial?.credentialId ?? "");
    setLink(initial?.link ?? "");
    setFile(null);
    setError("");
    setTimeout(() => titleRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, initial, onClose]);

  if (!open) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return setError("Add the certificate or course name.");
    if (provider === "other" && !providerName.trim()) return setError("Add who issued the certificate.");
    if (link && !/^https?:\/\//i.test(link)) return setError("The credential link should start with https://");
    if (file && file.size > MAX_FILE_MB * 1024 * 1024) return setError(`The file is larger than ${MAX_FILE_MB} MB.`);
    setBusy(true);
    try {
      const cert: Certificate = {
        id: initial?.id ?? newId(),
        courseId: initial?.courseId,
        title: title.trim(),
        provider,
        providerName: provider === "other" ? providerName.trim() : undefined,
        domain,
        issuedOn,
        credentialId: credentialId.trim() || undefined,
        link: link.trim() || undefined,
        fileName: initial?.fileName,
        fileType: initial?.fileType,
        addedAt: initial?.addedAt ?? new Date().toISOString(),
      };
      await save(cert, file);
      onSaved?.(cert);
      onClose();
    } catch {
      setError("Couldn't save the file on this device. Try a smaller file, or add a link instead.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby="cert-form-title">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <form onSubmit={submit} className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-surface p-6 shadow-2xl sm:rounded-3xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="cert-form-title" className="font-display text-xl font-bold">🎓 {initial?.id ? "Edit certificate" : "Add your certificate"}</h2>
            <p className="mt-1 text-sm text-muted">Saved privately on this device.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 text-muted hover:bg-surface-2">✕</button>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Certificate or course name</span>
            <input ref={titleRef} value={title} onChange={(e) => setTitle(e.target.value)} className={field} placeholder="e.g. Introduction to Generative AI" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Issued by</span>
              <select value={provider} onChange={(e) => setProvider(e.target.value)} className={field}>
                {providers.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
                <option value="other">Other</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Domain</span>
              <select value={domain} onChange={(e) => setDomain(e.target.value)} className={field}>
                {Object.entries(domainLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
          </div>
          {provider === "other" && (
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Issuer name</span>
              <input value={providerName} onChange={(e) => setProviderName(e.target.value)} className={field} placeholder="e.g. Hugging Face" />
            </label>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Completed on</span>
              <input type="date" value={issuedOn} max={today()} onChange={(e) => setIssuedOn(e.target.value)} className={field} required />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Credential ID <span className="font-normal text-muted">(optional)</span></span>
              <input value={credentialId} onChange={(e) => setCredentialId(e.target.value)} className={field} placeholder="e.g. ABC-123" />
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Verification link <span className="font-normal text-muted">(optional)</span></span>
            <input type="url" inputMode="url" value={link} onChange={(e) => setLink(e.target.value)} className={field} placeholder="https://www.credly.com/badges/..." />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Certificate file <span className="font-normal text-muted">(image or PDF, up to {MAX_FILE_MB} MB)</span></span>
            <span className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-line px-4 py-4 transition hover:border-brand">
              <span className="text-2xl" aria-hidden>📎</span>
              <span className="min-w-0 flex-1 truncate text-sm">
                {file ? file.name : initial?.fileName ? `Current: ${initial.fileName} (choose to replace)` : "Choose a file"}
              </span>
              <input type="file" accept="image/*,application/pdf" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </span>
          </label>
        </div>

        {error && <p role="alert" className="mt-4 rounded-xl bg-rose-100 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">{error}</p>}

        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-2xl border border-line py-3 font-semibold">Cancel</button>
          <button disabled={busy} className="flex-1 rounded-2xl bg-brand py-3 font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60">
            {busy ? "Saving..." : "Save certificate"}
          </button>
        </div>
      </form>
    </div>
  );
}
