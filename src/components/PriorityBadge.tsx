import { Award, Star } from "lucide-react";
import { T } from "@/lib/i18n";

const labels: Record<1 | 2 | 3, React.ReactNode> = {
  1: <T k="prioShort.1" />,
  2: <T k="prioShort.2" />,
  3: <T k="prioShort.3" />,
};

export function PriorityBadge({ priority, reason, compact = false }: {
  priority: 1 | 2 | 3;
  reason?: string;
  compact?: boolean;
}) {
  const topPriority = priority === 3;

  return (
    <div className={`min-w-0 ${compact ? "flex items-center gap-2" : topPriority
      ? "rounded-2xl border border-neutral-700 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800 p-3.5 text-white shadow-sm"
      : "rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-amber-50/70 p-3.5 text-ink shadow-sm"}`}>
      {topPriority && !compact ? (
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-400 text-neutral-950 shadow-sm">
            <Award size={19} strokeWidth={2} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/70">{labels[3]}</span>
              <span className="inline-flex items-center gap-0.5" aria-label="3 out of 3 stars">
                {[1, 2, 3].map((star) => <Star key={star} size={13} strokeWidth={1.8} className="fill-amber-400 text-amber-400" aria-hidden />)}
              </span>
            </div>
            {reason && <p className="mt-1.5 text-xs leading-relaxed text-white/75">{reason}</p>}
          </div>
        </div>
      ) : (
        <div className="flex min-w-0 items-start gap-2.5">
          <span className="inline-flex shrink-0 items-center gap-0.5 pt-0.5" aria-label={`Curated learning priority: ${priority} out of 3 stars`}>
            {[1, 2, 3].map((star) => (
              <Star
                key={star}
                size={compact ? 13 : 15}
                strokeWidth={1.8}
                className={star <= priority ? "fill-amber-400 text-amber-500" : "text-slate-300"}
                aria-hidden
              />
            ))}
          </span>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-amber-800">{labels[priority]}</span>
            {!compact && reason && <p className="mt-0.5 text-xs leading-relaxed text-muted">{reason}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
