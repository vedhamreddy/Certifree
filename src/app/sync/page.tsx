"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, CloudUpload, Loader2, LockKeyhole, RefreshCw, ShieldCheck } from "lucide-react";
import { courseById } from "@/data/courses";
import { readBookmarks, setBookmarksLocal } from "@/lib/bookmarks";
import { Certificate, getCertificateFile, putCertificateLocal, readCertificates, removeCertificateLocal } from "@/lib/certificates";
import { LearningItem, readLearning, setLearningLocal } from "@/lib/learning";
import { api, Categories, clearSyncProblem, cloud, useMe, useSyncSettings, writeSettings } from "@/lib/sync";
import { countDiff, diff, Diff, State } from "@/lib/sync-diff";
import { AccountsOffInline } from "./AccountsOffInline";

const CATS: { key: keyof Categories; label: string; uploads: string }[] = [
  { key: "bookmarks", label: "Saved courses", uploads: "The catalog IDs of courses you saved." },
  { key: "learning", label: "My Courses", uploads: "Courses you're taking, with start date, progress and target date." },
  { key: "certificates", label: "Certificate details", uploads: "Name, issuer, domain, completion date, credential ID and verification link." },
  { key: "files", label: "Certificate files", uploads: "The image or PDF you attached, stored in private storage only you can open." },
];

type Choice = "upload" | "download" | "removeLocal" | "removeCloud" | "skip" | "local" | "cloud";
const NONE: Categories = { bookmarks: false, learning: false, certificates: false, files: false };
const courseName = (id: string) => courseById[id]?.title ?? id;

function Toggle({ on, onChange, disabled, label }: { on: boolean; onChange: (v: boolean) => void; disabled?: boolean; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!on)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-40 ${on ? "bg-brand" : "bg-slate-200"}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-card transition-transform ${on ? "translate-x-[22px]" : "translate-x-0.5"}`} />
    </button>
  );
}

function Pick({ value, onChange, options, label }: { value?: Choice; onChange: (c: Choice) => void; options: [Choice, string][]; label: string }) {
  return (
    <select
      aria-label={label}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value as Choice)}
      className={`w-full rounded-lg border bg-white px-2 py-1.5 text-sm text-ink outline-none focus:border-accent sm:w-56 ${value ? "border-line" : "border-amber-500/60"}`}
    >
      {!value && <option value="">Choose…</option>}
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}

function Group({ title, items }: { title: string; items: React.ReactNode[] }) {
  if (!items.length) return null;
  return (
    <div>
      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">{title} ({items.length})</h3>
      <ul className="divide-y divide-line rounded-xl border border-line bg-white">{items}</ul>
    </div>
  );
}

function Item({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <li className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-ink">{label}</div>
        {sub && <div className="truncate text-xs text-muted">{sub}</div>}
      </div>
      {children}
    </li>
  );
}

const learnSub = (x: LearningItem) => `${x.progress}%${x.targetDate ? ` · finish by ${x.targetDate}` : ""} · started ${x.startedOn}`;
const certSub = (c: Certificate) => [c.issuedOn, c.credentialId && `ID ${c.credentialId}`, c.link && "has link"].filter(Boolean).join(" · ");

export default function SyncPage() {
  const me = useMe();
  const settings = useSyncSettings();
  const mine = settings && me?.userId === settings.userId;
  const [cats, setCats] = useState<Categories>(NONE);
  const [d, setD] = useState<Diff | null>(null);
  const [cloudState, setCloudState] = useState<State | null>(null);
  const [choices, setChoices] = useState<Record<string, Choice>>({});
  const [phase, setPhase] = useState<"idle" | "loading" | "applying" | "done" | "error">("idle");
  const [progress, setProgress] = useState("");

  useEffect(() => {
    if (me?.signedIn) setCats(mine ? { bookmarks: settings!.bookmarks, learning: settings!.learning, certificates: settings!.certificates, files: settings!.files } : NONE);
  }, [me?.signedIn, mine]); // eslint-disable-line react-hooks/exhaustive-deps

  const anyCat = Object.values(cats).some(Boolean);
  const set = (k: string, c: Choice) => setChoices((p) => ({ ...p, [k]: c }));

  async function preview() {
    setPhase("loading");
    try {
      const cs: State = await (await api("/api/sync")).json();
      const local: State = { bookmarks: readBookmarks(), learning: readLearning(), certificates: readCertificates() };
      const dd = diff(local, cs, cats);
      // Defaults keep data where it is and copy what's missing; conflicts have no default.
      const ch: Record<string, Choice> = {};
      dd.bookmarks.localOnly.forEach((x) => (ch[`b:${x}`] = "upload"));
      dd.bookmarks.cloudOnly.forEach((x) => (ch[`b:${x}`] = "download"));
      dd.learning.localOnly.forEach((x) => (ch[`l:${x.courseId}`] = "upload"));
      dd.learning.cloudOnly.forEach((x) => (ch[`l:${x.courseId}`] = "download"));
      dd.certificates.localOnly.forEach((x) => (ch[`c:${x.id}`] = "upload"));
      dd.certificates.cloudOnly.forEach((x) => (ch[`c:${x.id}`] = "download"));
      dd.files.localOnly.forEach((x) => (ch[`f:${x.id}`] = "upload"));
      dd.files.cloudOnly.forEach((x) => (ch[`f:${x.id}`] = "download"));
      setChoices(ch);
      setCloudState(cs);
      setD(dd);
      setPhase("idle");
    } catch {
      setPhase("error");
    }
  }

  const unresolved = useMemo(() => {
    if (!d) return 0;
    const keys = [
      ...d.learning.conflicts.map((x) => `l:${x.local.courseId}`),
      ...d.certificates.conflicts.map((x) => `c:${x.local.id}`),
      ...d.files.conflicts.map((x) => `f:${x.local.id}`),
    ];
    return keys.filter((k) => !choices[k]).length;
  }, [d, choices]);

  async function apply() {
    if (!d || !me?.userId || !cloudState) return;
    setPhase("applying");
    try {
      // Saved courses
      const bAdd: string[] = [], bRemove: string[] = [];
      let bookmarks = readBookmarks();
      for (const id of d.bookmarks.localOnly) {
        const c = choices[`b:${id}`];
        if (c === "upload") bAdd.push(id);
        if (c === "removeLocal") bookmarks = bookmarks.filter((x) => x !== id);
      }
      for (const id of d.bookmarks.cloudOnly) {
        const c = choices[`b:${id}`];
        if (c === "download") bookmarks = [...bookmarks, id];
        if (c === "removeCloud") bRemove.push(id);
      }
      if (bAdd.length || bRemove.length) {
        setProgress("Saved courses");
        await cloud.bookmarks(bAdd, bRemove);
      }
      if (cats.bookmarks) setBookmarksLocal(bookmarks);

      // My Courses
      setProgress("My Courses");
      let learning = readLearning();
      for (const x of d.learning.localOnly) {
        const c = choices[`l:${x.courseId}`];
        if (c === "upload") await cloud.learning(x);
        if (c === "removeLocal") learning = learning.filter((y) => y.courseId !== x.courseId);
      }
      for (const x of d.learning.cloudOnly) {
        const c = choices[`l:${x.courseId}`];
        if (c === "download") learning = [...learning, x];
        if (c === "removeCloud") await cloud.learningDelete(x.courseId);
      }
      for (const { local, cloud: cl } of d.learning.conflicts) {
        const c = choices[`l:${local.courseId}`];
        if (c === "local") await cloud.learning(local);
        if (c === "cloud") learning = learning.map((y) => (y.courseId === cl.courseId ? cl : y));
      }
      if (cats.learning) setLearningLocal(learning);

      // Certificates and files
      const uploadFile = async (c: Certificate) => {
        const blob = await getCertificateFile(c.id);
        if (blob) await cloud.file(c.id, blob, c.fileName ?? "certificate");
      };
      const downloadFile = async (c: Certificate, base: Certificate) => {
        const blob = await cloud.fileGet(c.id);
        await putCertificateLocal(base, blob, c.fileName);
      };
      let i = 0;
      const total = d.certificates.localOnly.length + d.certificates.cloudOnly.length + d.certificates.conflicts.length + d.files.localOnly.length + d.files.cloudOnly.length + d.files.conflicts.length;
      const step = () => setProgress(`Certificates ${++i} of ${total}`);
      for (const x of d.certificates.localOnly) {
        step();
        const c = choices[`c:${x.id}`];
        if (c === "upload") {
          await cloud.certificate(x);
          if (cats.files && x.fileName) await uploadFile(x);
        }
        if (c === "removeLocal") await removeCertificateLocal(x.id);
      }
      for (const x of d.certificates.cloudOnly) {
        step();
        const c = choices[`c:${x.id}`];
        const base = { ...x, fileName: undefined, fileType: undefined };
        if (c === "download") {
          if (cats.files && x.fileName) await downloadFile(x, base);
          else await putCertificateLocal(base);
        }
        if (c === "removeCloud") await cloud.certificateDelete(x.id);
      }
      for (const { local, cloud: cl } of d.certificates.conflicts) {
        step();
        const c = choices[`c:${local.id}`];
        if (c === "local") await cloud.certificate(local);
        if (c === "cloud") await putCertificateLocal({ ...cl, fileName: local.fileName, fileType: local.fileType });
      }
      for (const x of d.files.localOnly) {
        step();
        if (choices[`f:${x.id}`] === "upload") await uploadFile(x);
      }
      for (const x of d.files.cloudOnly) {
        step();
        const local = readCertificates().find((y) => y.id === x.id);
        if (choices[`f:${x.id}`] === "download" && local) await downloadFile(x, local);
      }
      for (const { local, cloud: cl } of d.files.conflicts) {
        step();
        const c = choices[`f:${local.id}`];
        const cur = readCertificates().find((y) => y.id === local.id) ?? local;
        if (c === "local") await uploadFile(cur);
        if (c === "cloud") await downloadFile(cl, cur);
      }

      writeSettings({ userId: me.userId, ...cats, files: cats.files && cats.certificates });
      clearSyncProblem();
      setPhase("done");
      setD(null);
    } catch {
      setPhase("error");
    } finally {
      setProgress("");
    }
  }

  // ---------- states ----------
  if (!me) return <div className="mx-auto max-w-3xl px-4 py-10"><div className="skeleton h-9 w-72 rounded-lg" /><div className="skeleton mt-6 h-64 rounded-2xl" /></div>;
  if (!me.enabled) return <AccountsOffInline />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">Sync across devices</h1>
      <p className="mt-2 text-muted">Optional. CertiFree works fully on this device without an account. Turn sync on only for what you want on your other devices.</p>

      {!me.signedIn ? (
        <div className="mt-8 rounded-3xl border border-line bg-white p-6 shadow-card sm:p-8">
          <ul className="space-y-3 text-sm text-ink">
            <li className="flex gap-3"><LockKeyhole size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-accent" aria-hidden />Your synced data is private to you. Certificates are never shown publicly, and CertiFree doesn&apos;t verify or vouch for them.</li>
            <li className="flex gap-3"><CloudUpload size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-accent" aria-hidden />Nothing on this device is uploaded when you sign in. You&apos;ll choose what to sync and preview every change first.</li>
            <li className="flex gap-3"><ShieldCheck size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-accent" aria-hidden />You can export or delete everything from your account page at any time.</li>
          </ul>
          <Link href="/auth/sign-in?next=/sync" className="mt-6 inline-flex h-11 items-center rounded-full bg-brand px-5 text-sm font-semibold text-white shadow-card transition hover:bg-brand-600">Sign in to sync</Link>
        </div>
      ) : (
        <>
          {settings && !mine && (
            <p className="mt-6 flex gap-2 rounded-xl border border-amber-500/30 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden /> Sync on this device was set up for a different account, so it&apos;s paused. Choose below to set it up for this account.
            </p>
          )}
          <section className="mt-8 rounded-3xl border border-line bg-white p-6 shadow-card">
            <h2 className="font-display text-lg font-bold text-ink">What to sync from this device</h2>
            <p className="mt-1 text-sm text-muted">Nothing is uploaded until you review the changes and press Apply.</p>
            <ul className="mt-5 divide-y divide-line">
              {CATS.map(({ key, label, uploads }) => {
                const disabled = key === "files" && !cats.certificates;
                return (
                  <li key={key} className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
                    <div>
                      <div className="font-medium text-ink">{label}</div>
                      <div className="mt-0.5 text-sm text-muted">Uploads: {uploads}{key === "files" && " Needs certificate details."}</div>
                    </div>
                    <Toggle
                      label={`Sync ${label}`}
                      on={cats[key] && !disabled}
                      disabled={disabled}
                      onChange={(v) => {
                        setD(null);
                        setPhase("idle");
                        setCats((c) => ({ ...c, [key]: v, ...(key === "certificates" && !v ? { files: false } : {}) }));
                      }}
                    />
                  </li>
                );
              })}
            </ul>
            <div className="mt-6 flex flex-wrap gap-2">
              <button type="button" disabled={!anyCat || phase === "loading" || phase === "applying"} onClick={preview} className="inline-flex h-11 items-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-white shadow-card transition hover:bg-brand-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50">
                {phase === "loading" ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <RefreshCw size={16} strokeWidth={1.75} aria-hidden />} Preview changes
              </button>
              {mine && (
                <button type="button" onClick={() => { writeSettings(null); setCats(NONE); setD(null); }} className="inline-flex h-11 items-center rounded-full border border-line bg-white px-4 text-sm font-semibold text-ink shadow-card transition hover:bg-surface-2">
                  Turn off sync on this device
                </button>
              )}
            </div>
            {mine && <p className="mt-3 text-xs text-muted">Turning sync off keeps everything on this device and in your account. To delete account data, use your <Link href="/account" className="font-semibold text-accent">account page</Link>.</p>}
          </section>

          {phase === "error" && <p role="alert" className="mt-4 rounded-xl border border-red-600/15 bg-red-50 px-4 py-3 text-sm text-[#B91C1C]">Something went wrong and the sync stopped. Nothing was deleted. Preview again to see what&apos;s left.</p>}
          {phase === "done" && (
            <p role="status" className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-600/15 bg-emerald-50/60 px-4 py-3 text-sm text-ink">
              <CheckCircle2 size={16} className="text-free" aria-hidden /> Done. New changes on this device now sync automatically. If your account changes elsewhere, you&apos;ll be asked to review.
            </p>
          )}

          {d && (
            <section className="mt-6 rounded-3xl border border-line bg-white p-6 shadow-card">
              <h2 className="font-display text-lg font-bold text-ink">Review changes</h2>
              {countDiff(d) === 0 ? (
                <p className="mt-2 text-sm text-muted">This device and your account already match for what you selected. Press Apply to turn on sync.</p>
              ) : (
                <p className="mt-1 text-sm text-muted">Choose what happens to each item. Items that differ need a choice before you can apply.</p>
              )}
              <div className="mt-5 space-y-6">
                <Group title="Saved courses only on this device" items={d.bookmarks.localOnly.map((id) => (
                  <Item key={id} label={courseName(id)}><Pick label="Action" value={choices[`b:${id}`]} onChange={(c) => set(`b:${id}`, c)} options={[["upload", "Upload to account"], ["removeLocal", "Remove from this device"], ["skip", "Leave for now"]]} /></Item>
                ))} />
                <Group title="Saved courses only in your account" items={d.bookmarks.cloudOnly.map((id) => (
                  <Item key={id} label={courseName(id)}><Pick label="Action" value={choices[`b:${id}`]} onChange={(c) => set(`b:${id}`, c)} options={[["download", "Add to this device"], ["removeCloud", "Remove from account"], ["skip", "Leave for now"]]} /></Item>
                ))} />
                <Group title="My Courses only on this device" items={d.learning.localOnly.map((x) => (
                  <Item key={x.courseId} label={courseName(x.courseId)} sub={learnSub(x)}><Pick label="Action" value={choices[`l:${x.courseId}`]} onChange={(c) => set(`l:${x.courseId}`, c)} options={[["upload", "Upload to account"], ["removeLocal", "Remove from this device"], ["skip", "Leave for now"]]} /></Item>
                ))} />
                <Group title="My Courses only in your account" items={d.learning.cloudOnly.map((x) => (
                  <Item key={x.courseId} label={courseName(x.courseId)} sub={learnSub(x)}><Pick label="Action" value={choices[`l:${x.courseId}`]} onChange={(c) => set(`l:${x.courseId}`, c)} options={[["download", "Add to this device"], ["removeCloud", "Remove from account"], ["skip", "Leave for now"]]} /></Item>
                ))} />
                <Group title="My Courses that differ" items={d.learning.conflicts.map(({ local, cloud: cl }) => (
                  <Item key={local.courseId} label={courseName(local.courseId)} sub={`This device: ${learnSub(local)} · Account: ${learnSub(cl)}`}><Pick label="Keep which version" value={choices[`l:${local.courseId}`]} onChange={(c) => set(`l:${local.courseId}`, c)} options={[["local", "Keep this device's"], ["cloud", "Keep account's"]]} /></Item>
                ))} />
                <Group title="Certificates only on this device" items={d.certificates.localOnly.map((x) => (
                  <Item key={x.id} label={x.title} sub={`${certSub(x)}${x.fileName && cats.files ? " · file will upload too" : ""}`}><Pick label="Action" value={choices[`c:${x.id}`]} onChange={(c) => set(`c:${x.id}`, c)} options={[["upload", "Upload to account"], ["removeLocal", "Remove from this device"], ["skip", "Leave for now"]]} /></Item>
                ))} />
                <Group title="Certificates only in your account" items={d.certificates.cloudOnly.map((x) => (
                  <Item key={x.id} label={x.title} sub={certSub(x)}><Pick label="Action" value={choices[`c:${x.id}`]} onChange={(c) => set(`c:${x.id}`, c)} options={[["download", "Add to this device"], ["removeCloud", "Delete from account (and its file)"], ["skip", "Leave for now"]]} /></Item>
                ))} />
                <Group title="Certificates that differ" items={d.certificates.conflicts.map(({ local, cloud: cl }) => (
                  <Item key={local.id} label={local.title === cl.title ? local.title : `${local.title} / ${cl.title}`} sub={`This device: ${certSub(local)} · Account: ${certSub(cl)}`}><Pick label="Keep which version" value={choices[`c:${local.id}`]} onChange={(c) => set(`c:${local.id}`, c)} options={[["local", "Keep this device's"], ["cloud", "Keep account's"]]} /></Item>
                ))} />
                <Group title="Certificate files only on this device" items={d.files.localOnly.map((x) => (
                  <Item key={x.id} label={x.title} sub={x.fileName}><Pick label="Action" value={choices[`f:${x.id}`]} onChange={(c) => set(`f:${x.id}`, c)} options={[["upload", "Upload file"], ["skip", "Keep on this device only"]]} /></Item>
                ))} />
                <Group title="Certificate files only in your account" items={d.files.cloudOnly.map((x) => (
                  <Item key={x.id} label={x.title} sub={x.fileName}><Pick label="Action" value={choices[`f:${x.id}`]} onChange={(c) => set(`f:${x.id}`, c)} options={[["download", "Download to this device"], ["skip", "Leave in account"]]} /></Item>
                ))} />
                <Group title="Certificate files that differ" items={d.files.conflicts.map(({ local, cloud: cl }) => (
                  <Item key={local.id} label={local.title} sub={`This device: ${local.fileName} · Account: ${cl.fileName}`}><Pick label="Keep which file" value={choices[`f:${local.id}`]} onChange={(c) => set(`f:${local.id}`, c)} options={[["local", "Keep this device's"], ["cloud", "Keep account's"]]} /></Item>
                ))} />
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-5">
                <button type="button" onClick={apply} disabled={unresolved > 0 || phase === "applying"} className="inline-flex h-11 items-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-white shadow-card transition hover:bg-brand-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50">
                  {phase === "applying" && <Loader2 size={16} className="animate-spin" aria-hidden />} Apply and turn on sync
                </button>
                <span className="text-sm text-muted">{phase === "applying" ? progress : unresolved > 0 ? `${unresolved} item${unresolved === 1 ? "" : "s"} still need a choice` : ""}</span>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
