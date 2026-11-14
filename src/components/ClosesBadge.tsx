"use client";
import { useEffect, useState } from "react";
import { Hourglass } from "lucide-react";
import { closesLabel } from "@/lib/deadlines";
import { useT } from "@/lib/i18n";

/** "Closes in N days", worked out in the learner's own time zone. Hidden once the date passes. */
export function ClosesBadge({ date }: { date?: string }) {
  const t = useT();
  const [label, setLabel] = useState<string | null>(null);
  useEffect(() => setLabel(date ? closesLabel(date, t) : null), [date, t]);
  if (!label) return null;
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-600/20">
      <Hourglass size={12} strokeWidth={2} aria-hidden /> {label}
    </span>
  );
}
