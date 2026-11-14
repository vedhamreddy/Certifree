"use client";
import { CalendarPlus } from "lucide-react";
import { googleCalendarUrl, icsFile, type Deadline } from "@/lib/deadlines";
import { useT } from "@/lib/i18n";

/** "Add to calendar": Google Calendar link, or an .ics file for Apple Calendar and Outlook. */
export function CalendarButtons({ deadline, compact = false }: { deadline: Deadline; compact?: boolean }) {
  const t = useT();
  function downloadIcs() {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([icsFile(deadline)], { type: "text/calendar;charset=utf-8" }));
    a.download = `certifree-${deadline.courseId}.ics`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  const btn = `inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-white font-semibold text-ink transition hover:bg-surface-2 ${compact ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm"}`;
  return (
    <span className="inline-flex flex-wrap gap-2">
      <a href={googleCalendarUrl(deadline)} target="_blank" rel="noopener noreferrer" className={btn}>
        <CalendarPlus size={compact ? 13 : 15} strokeWidth={1.75} aria-hidden /> {t("cal.google")}
      </a>
      <button type="button" onClick={downloadIcs} className={btn}>
        <CalendarPlus size={compact ? 13 : 15} strokeWidth={1.75} aria-hidden /> {t("cal.ics")}
      </button>
    </span>
  );
}
