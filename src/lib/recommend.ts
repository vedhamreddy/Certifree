/**
 * Rule-based course advice. Runs in the browser; nothing is sent anywhere.
 * Every reason returned is a translation key (see i18n.tsx, keys "why.*").
 */
import type { Course, Domain, Level } from "@/data/courses";
import { careerPaths, type CareerPath } from "@/data/paths";

export type Stage = "school" | "ug" | "pg" | "working";
export type Goal = "job" | "internship" | "credit" | "skill";
export type Pace = "low" | "mid" | "high"; // under 2 h, 2-5 h, 5+ h a week
export type Want = "free-cert" | "any";

export type Profile = { stage: Stage; interests: Domain[]; level: Level; goal: Goal; pace: Pace; want: Want };
export type Pick = { course: Course; score: number; why: string[] };

const paceHours: Record<Pace, number> = { low: 1.5, mid: 3.5, high: 7 };

/** Where each course sits in a career path (first one wins). */
const pathPos = new Map<string, { path: CareerPath; i: number }>();
for (const p of careerPaths) p.steps.forEach((s, i) => !pathPos.has(s.courseId) && pathPos.set(s.courseId, { path: p, i }));

export function pathOf(courseId: string) {
  return pathPos.get(courseId);
}

const levelFit: Record<Level, Record<Level, number>> = {
  beginner: { beginner: 20, intermediate: 2, advanced: -40 },
  intermediate: { beginner: 6, intermediate: 20, advanced: 4 },
  advanced: { beginner: -6, intermediate: 12, advanced: 20 },
};

export function scoreCourse(c: Course, p: Profile): Pick | null {
  const why: string[] = [];
  let s = 0;
  if (p.interests.length) {
    if (!p.interests.includes(c.domain)) return null;
    s += 30;
  }
  const lf = levelFit[p.level][c.level];
  s += lf;
  if (lf >= 20) why.push(`why.level.${c.level}`);

  if (p.goal === "credit") {
    if (c.academic?.credit) { s += 45; why.push("why.credit"); }
  } else if (p.goal === "job") {
    if (c.credential === "exam") { s += 10; why.push("why.exam"); }
    if (pathPos.has(c.id)) { s += 10; why.push("why.path"); }
  } else if (p.goal === "internship") {
    if (c.cost === "free-cert") s += 8;
    if (c.hours != null && c.hours <= 10) { s += 6; why.push("why.quick"); }
  } else if (p.goal === "skill") {
    if (c.cost !== "free-no-cert") s += 2;
  }

  if (c.cost === "free-cert") { s += p.want === "free-cert" ? 25 : 10; why.push("why.freeCert"); }
  else if (c.cost === "limited-time") { s += p.want === "free-cert" ? 12 : 6; why.push("why.limited"); }
  else if (p.want === "free-cert") s -= 15;

  if (c.hours != null) {
    const weeks = c.hours / paceHours[p.pace];
    if (weeks <= 4) { s += 8; if (!why.includes("why.quick")) why.push("why.fits"); }
    else if (weeks > 12) s -= 8;
  }
  if (c.priority) { s += c.priority * 6; if (c.priority === 3) why.push("why.priority"); }
  const pos = pathPos.get(c.id);
  if (pos && p.level === "beginner" && pos.i <= 1) { s += 8; if (!why.includes("why.path")) why.push("why.firstStep"); }
  if (p.stage === "school" && c.level !== "beginner") s -= 10;
  if (p.interests.length) why.push("why.domain"); // least specific reason goes last
  return { course: c, score: s, why: why.slice(0, 3) };
}

/** Ranked shortlist. Courses already started, finished or with a certificate are left out. */
export function recommend(all: Course[], p: Profile, skip: Set<string> = new Set(), n = 8): Pick[] {
  const picks = all.map((c) => (skip.has(c.id) ? null : scoreCourse(c, p))).filter((x): x is Pick => !!x && x.score > 0);
  picks.sort((a, b) => b.score - a.score || a.course.title.localeCompare(b.course.title));
  // Keep some variety: at most 3 from one provider, and a fair share for each chosen topic.
  const per: Record<string, number> = {};
  const perTopic: Record<string, number> = {};
  const topicCap = p.interests.length > 1 ? Math.ceil(n / p.interests.length) : n;
  const out: Pick[] = [];
  for (const x of picks) {
    if ((per[x.course.provider] ?? 0) >= 3 || (perTopic[x.course.domain] ?? 0) >= topicCap) continue;
    per[x.course.provider] = (per[x.course.provider] ?? 0) + 1;
    perTopic[x.course.domain] = (perTopic[x.course.domain] ?? 0) + 1;
    out.push(x);
    if (out.length >= n) break;
  }
  return out;
}

/** Career paths that match the learner's interests. */
export function pathsFor(p: Profile) {
  return p.interests.length ? careerPaths.filter((x) => p.interests.includes(x.domain)) : careerPaths;
}

/** "Best for" tags on a course page (translation keys). */
export function bestFor(c: Course): string[] {
  const t: string[] = [];
  if (c.level === "beginner") t.push("best.beginners");
  if (c.level === "advanced") t.push("best.experienced");
  if (c.cost === "free-cert" && c.credential !== "none") t.push("best.cv");
  if (c.academic?.credit) t.push("best.credit");
  if (c.credential === "exam") t.push("best.exam");
  if (c.hours != null && c.hours <= 5) t.push("best.quick");
  if (pathOf(c.id)) t.push("best.path");
  return t;
}

const order: Level[] = ["beginner", "intermediate", "advanced"];

/** The step before and after this course in its career path, or a same-domain step up. */
export function neighbours(c: Course, all: Course[]): { before?: Course; next?: Course; path?: CareerPath } {
  const byId = Object.fromEntries(all.map((x) => [x.id, x]));
  const pos = pathPos.get(c.id);
  if (pos) {
    const before = pos.i > 0 ? byId[pos.path.steps[pos.i - 1].courseId] : undefined;
    const next = byId[pos.path.steps[pos.i + 1]?.courseId ?? ""];
    if (before || next) return { before, next, path: pos.path };
  }
  const li = order.indexOf(c.level);
  const same = all.filter((x) => x.id !== c.id && x.domain === c.domain);
  const rank = (x: Course) => (x.priority ?? 0) * 10 + (x.cost === "free-cert" ? 5 : 0);
  const next = same.filter((x) => order.indexOf(x.level) === li + 1).sort((a, b) => rank(b) - rank(a))[0];
  const before = li > 0 ? same.filter((x) => order.indexOf(x.level) === li - 1).sort((a, b) => rank(b) - rank(a))[0] : undefined;
  return { before, next };
}
