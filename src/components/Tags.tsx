import { BadgeCheck, Clock, Award, Medal, FileCheck2 } from "lucide-react";
import { Cost, Credential, costLabels, credentialLabels } from "@/data/courses";

const base = "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold ring-1 ring-inset";

const costStyle: Record<Cost, string> = {
  "free-cert": "bg-emerald-50 text-[#047857] ring-emerald-600/15",
  "free-learn-paid-cert": "bg-amber-50 text-amber-800 ring-amber-600/15",
  "free-learn-paid-exam": "bg-amber-50 text-amber-800 ring-amber-600/15",
  "limited-time": "bg-red-50 text-[#B91C1C] ring-red-600/15",
  "free-no-cert": "bg-slate-50 text-slate-600 ring-slate-500/15",
};

export function CostTag({ cost }: { cost: Cost }) {
  return (
    <span className={`${base} ${costStyle[cost]}`}>
      {cost === "free-cert" && <BadgeCheck size={13} strokeWidth={2} aria-hidden />}
      {cost === "limited-time" && <Clock size={13} strokeWidth={2} aria-hidden />}
      {costLabels[cost]}
    </span>
  );
}

const credIcon = { certificate: FileCheck2, badge: Medal, exam: Award } as const;

export function CredentialTag({ credential }: { credential: Credential }) {
  if (credential === "none") return null;
  const Icon = credIcon[credential];
  return (
    <span className={`${base} bg-blue-50 text-[#1D4ED8] ring-blue-600/15`}>
      <Icon size={13} strokeWidth={2} aria-hidden />
      {credentialLabels[credential]}
    </span>
  );
}
