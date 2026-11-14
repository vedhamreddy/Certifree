"use client";
import { useState } from "react";
import { Flag } from "lucide-react";
import { useT } from "@/lib/i18n";

/** "Report wrong info": a short note to the CertiFree team. No email or name is collected. */
export function ReportProblem({ courseId }: { courseId: string }) {
  const [open, setOpen] = useState(false);
  const t = useT();
  const [msg, setMsg] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error" | "slow">("idle");

  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const website = String(new FormData(e.currentTarget).get("website") ?? "");
    setState("sending");
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, message: msg, website }),
    }).catch(() => null);
    setState(res?.ok ? "sent" : res?.status === 429 ? "slow" : "error");
  }

  if (state === "sent") return <p className="mt-3 text-sm font-medium text-ink">{t("report.thanks")}</p>;
  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-muted underline-offset-4 hover:text-ink hover:underline">
        <Flag size={13} strokeWidth={1.75} aria-hidden /> {t("course.report")}
      </button>
    );
  return (
    <form onSubmit={send} className="mt-4 rounded-2xl bg-surface-2 p-4">
      <label htmlFor="report-msg" className="text-sm font-semibold text-ink">{t("report.q")}</label>
      <p className="mt-0.5 text-xs text-muted">{t("report.hint")}</p>
      <textarea id="report-msg" value={msg} onChange={(e) => setMsg(e.target.value)} required minLength={5} maxLength={1000} rows={3} className="mt-2 w-full rounded-xl border border-line bg-white p-3 text-sm text-ink outline-none focus:ring-1 focus:ring-brand" />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <div className="mt-2 flex items-center gap-2">
        <button type="submit" disabled={state === "sending" || msg.trim().length < 5} className="inline-flex h-9 items-center rounded-full bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-40">{state === "sending" ? t("report.sending") : t("report.send")}</button>
        <button type="button" onClick={() => setOpen(false)} className="h-9 rounded-full px-3 text-sm font-semibold text-muted hover:text-ink">{t("report.cancel")}</button>
        {state === "error" && <span className="text-xs text-danger">{t("report.error")}</span>}
        {state === "slow" && <span className="text-xs text-danger">{t("report.slow")}</span>}
      </div>
    </form>
  );
}
