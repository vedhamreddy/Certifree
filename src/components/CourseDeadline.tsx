"use client";
import { useEffect, useState } from "react";
import { Hourglass } from "lucide-react";
import type { Course } from "@/data/courses";
import { closesLabel, offerDeadline, type Deadline } from "@/lib/deadlines";
import { CalendarButtons } from "./CalendarButtons";
import { useT } from "@/lib/i18n";

function fmt(d: string) {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, day)).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

/** Offer deadline box on a course page, with Add to calendar. Shown only while the offer is open. */
export function CourseDeadline({ course }: { course: Course }) {
  const t = useT();
  const [d, setD] = useState<Deadline | null>(null);
  useEffect(() => setD(offerDeadline(course, window.location.origin)), [course]);
  if (!d) return null;
  return (
    <div className="mt-4 rounded-2xl bg-amber-50 p-4 ring-1 ring-inset ring-amber-600/20">
      <div className="flex gap-3">
        <Hourglass size={20} strokeWidth={1.75} className="mt-0.5 shrink-0 text-amber-800" aria-hidden />
        <div className="min-w-0">
          <div className="font-semibold text-ink">{closesLabel(d.date, t)} · {fmt(d.date)}</div>
          <p className="mt-0.5 text-sm text-muted">{d.note}</p>
          <div className="mt-3"><CalendarButtons deadline={d} compact /></div>
        </div>
      </div>
    </div>
  );
}
