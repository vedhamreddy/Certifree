import type { Course } from "@/data/courses";

/** A date the learner should not miss: a provider's offer closing, or their own finish-by date. */
export type Deadline = {
  key: string;
  courseId: string;
  title: string;
  date: string; // YYYY-MM-DD
  kind: "offer" | "target";
  note: string;
  url: string; // where the calendar event should point
};

/** Today's date in the learner's own time zone, as YYYY-MM-DD. */
export function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export const daysUntil = (date: string, from = localToday()) => Math.round((Date.parse(date) - Date.parse(from)) / 86_400_000);

type Tr = (key: string, vars?: Record<string, string | number>) => string;
const enCloses: Tr = (k, v) => (k === "closes.today" ? "Closes today" : k === "closes.tomorrow" ? "Closes tomorrow" : `Closes in ${v?.n} days`);
/** Pass the page's translator (useT) to get Hindi or Telugu. */
export function closesLabel(date: string, t: Tr = enCloses) {
  const d = daysUntil(date);
  if (d < 0) return null;
  return d === 0 ? t("closes.today") : d === 1 ? t("closes.tomorrow") : t("closes.days", { n: d });
}

export function offerDeadline(c: Course, origin: string): Deadline | null {
  if (!c.closesOn || daysUntil(c.closesOn) < 0) return null;
  return {
    key: `offer:${c.id}`,
    courseId: c.id,
    title: `${c.title}: offer closes`,
    date: c.closesOn,
    kind: "offer",
    note: c.deadlineNote ?? "Last day of this free offer. Confirm on the provider's site.",
    url: `${origin}/courses/${c.id}`,
  };
}

export function targetDeadline(c: Course, targetDate: string, progress: number, origin: string): Deadline {
  return {
    key: `target:${c.id}`,
    courseId: c.id,
    title: `Finish: ${c.title}`,
    date: targetDate,
    kind: "target",
    note: `Your finish-by date in CertiFree (${progress}% done).`,
    url: `${origin}/courses/${c.id}`,
  };
}

const compact = (date: string) => date.replace(/-/g, "");
function nextDay(date: string) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** Google Calendar "add event" link for an all-day event. */
export function googleCalendarUrl(d: Deadline) {
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: d.title,
    dates: `${compact(d.date)}/${compact(nextDay(d.date))}`,
    details: `${d.note}\n${d.url}`,
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

const icsText = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/[,;]/g, (m) => `\\${m}`);

/** An .ics file (works with Apple Calendar, Outlook and Google) with a reminder the day before. */
export function icsFile(d: Deadline) {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CertiFree//Deadlines//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${d.key.replace(/[^a-z0-9:-]/gi, "")}@certifree`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${compact(d.date)}`,
    `DTEND;VALUE=DATE:${compact(nextDay(d.date))}`,
    `SUMMARY:${icsText(d.title)}`,
    `DESCRIPTION:${icsText(`${d.note}\n${d.url}`)}`,
    `URL:${d.url}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "TRIGGER:-P1D",
    `DESCRIPTION:${icsText(d.title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
