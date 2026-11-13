import { Cost, Credential, costLabels, credentialLabels } from "@/data/courses";

const costStyle: Record<Cost, string> = {
  "free-cert": "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  "free-learn-paid-cert": "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  "free-learn-paid-exam": "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  "limited-time": "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  "free-no-cert": "bg-slate-200 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300",
};

export function CostTag({ cost }: { cost: Cost }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${costStyle[cost]}`}>
      {cost === "free-cert" && <span aria-hidden>✓</span>}
      {cost === "limited-time" && <span aria-hidden>⏳</span>}
      {costLabels[cost]}
    </span>
  );
}

export function CredentialTag({ credential }: { credential: Credential }) {
  if (credential === "none") return null;
  return (
    <span className="inline-flex rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
      {credentialLabels[credential]}
    </span>
  );
}
