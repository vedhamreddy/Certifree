import { Cost, Credential } from "@/data/courses";
import { T } from "@/lib/i18n";

const shape = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset";
const base = `${shape} bg-surface-2 text-ink ring-line`;

/** Grey pill badges; a small coloured dot carries the meaning. */
const dot: Record<Cost, string> = {
  "free-cert": "bg-free",
  "free-learn-paid-cert": "bg-amber-500",
  "free-learn-paid-exam": "bg-amber-500",
  "limited-time": "bg-danger",
  "free-no-cert": "bg-neutral-400",
};

export function CostTag({ cost }: { cost: Cost }) {
  return (
    <span className={cost === "free-cert" ? `${shape} bg-brand text-white ring-brand` : base}>
      <span className={`h-1.5 w-1.5 rounded-full ${cost === "free-cert" ? "bg-emerald-400" : dot[cost]}`} aria-hidden />
      <T k={`cost.${cost}`} />
    </span>
  );
}

export function CredentialTag({ credential }: { credential: Credential }) {
  if (credential === "none") return null;
  return <span className={`${shape} bg-white text-muted ring-line`}><T k={`cred.${credential}`} /></span>;
}
