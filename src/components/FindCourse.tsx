"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, RotateCcw, Route, Sparkles } from "lucide-react";
import type { Domain, Level } from "@/data/courses";
import { pathsFor, type Goal, type Pace, type Profile, type Stage, type Want } from "@/lib/recommend";
import { profileStore } from "@/lib/profile";
import { useRecommendations } from "@/lib/useRecommendations";
import { useT } from "@/lib/i18n";
import { RecommendedCourse } from "./RecommendedCourse";

const DOMAINS: Domain[] = ["ai", "cloud", "security", "data", "webdev", "devops", "programming", "cs", "networking", "marketing", "career"];
type Q =
  | { key: "stage"; options: Stage[] }
  | { key: "interests"; options: Domain[]; multi: true }
  | { key: "level"; options: Level[] }
  | { key: "goal"; options: Goal[] }
  | { key: "pace"; options: Pace[] }
  | { key: "want"; options: Want[] };
const QUESTIONS: Q[] = [
  { key: "stage", options: ["school", "ug", "pg", "working"] },
  { key: "interests", options: DOMAINS, multi: true },
  { key: "level", options: ["beginner", "intermediate", "advanced"] },
  { key: "goal", options: ["job", "internship", "credit", "skill"] },
  { key: "pace", options: ["low", "mid", "high"] },
  { key: "want", options: ["free-cert", "any"] },
];
const MAX_INTERESTS = 3;
const optionKey = (q: Q["key"], v: string) => (q === "interests" ? `domain.${v}` : q === "level" ? `level.${v}` : `quiz.${q}.${v}`);

const chip = (on: boolean) =>
  `rounded-2xl border px-4 py-3 text-left text-[15px] font-medium transition ${on ? "border-brand bg-brand text-white shadow-card" : "border-line bg-white text-ink hover:border-slate-300 hover:bg-surface-2"}`;

function Quiz({ start, onDone }: { start: Partial<Profile>; onDone: (p: Profile) => void }) {
  const t = useT();
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Partial<Profile>>({ interests: [], ...start });
  const q = QUESTIONS[step];
  const value = a[q.key];
  const answered = q.key === "interests" ? (a.interests?.length ?? 0) > 0 : value != null;

  function pick(v: string) {
    if (q.key === "interests") {
      const cur = a.interests ?? [];
      const next = cur.includes(v as Domain) ? cur.filter((x) => x !== v) : cur.length < MAX_INTERESTS ? [...cur, v as Domain] : cur;
      setA({ ...a, interests: next });
      return;
    }
    const next = { ...a, [q.key]: v };
    setA(next);
    if (step < QUESTIONS.length - 1) setStep(step + 1);
    else onDone(next as Profile);
  }

  return (
    <div className="rounded-3xl border border-line bg-white p-5 shadow-card sm:p-8">
      <div className="flex items-center justify-between gap-3 text-xs font-semibold text-muted">
        <span>{t("quiz.step", { i: step + 1, n: QUESTIONS.length })}</span>
        {step > 0 && (
          <button type="button" onClick={() => setStep(step - 1)} className="inline-flex items-center gap-1 hover:text-ink">
            <ArrowLeft size={14} strokeWidth={2} aria-hidden /> {t("quiz.back")}
          </button>
        )}
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2" aria-hidden>
        <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${((step + (answered ? 1 : 0)) / QUESTIONS.length) * 100}%` }} />
      </div>
      <fieldset className="mt-6">
        <legend className="font-display text-xl font-bold text-ink sm:text-2xl">{t(`quiz.${q.key}.q`)}</legend>
        {q.key === "interests" && <p className="mt-1 text-sm text-muted">{t("quiz.interests.hint", { n: MAX_INTERESTS })}</p>}
        <div className={`mt-5 grid gap-2 ${q.key === "interests" ? "grid-cols-2 sm:grid-cols-3" : "sm:grid-cols-2"}`}>
          {q.options.map((v) => {
            const on = q.key === "interests" ? !!a.interests?.includes(v as Domain) : value === v;
            return (
              <button key={v} type="button" aria-pressed={on} onClick={() => pick(v)} className={chip(on)}>
                {t(optionKey(q.key, v))}
                {q.key !== "interests" && q.key !== "level" && <span className={`mt-0.5 block text-xs font-normal ${on ? "text-white/70" : "text-muted"}`}>{t(`quiz.${q.key}.${v}.sub`)}</span>}
              </button>
            );
          })}
        </div>
      </fieldset>
      {q.key === "interests" && (
        <button type="button" disabled={!answered} onClick={() => setStep(step + 1)} className="mt-6 inline-flex h-11 items-center gap-1.5 rounded-full bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-40">
          {t("quiz.next")} <ArrowRight size={16} strokeWidth={2} aria-hidden />
        </button>
      )}
    </div>
  );
}

/** "Find my course": six quick questions, then a ranked shortlist with reasons. Answers stay on this device. */
export function FindCourse() {
  const t = useT();
  const { profile, picks } = useRecommendations(8);
  const [editing, setEditing] = useState(false);

  if (!profile || editing) {
    return (
      <Quiz
        start={profile ?? {}}
        onDone={(p) => {
          profileStore.write(p);
          setEditing(false);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    );
  }

  const paths = pathsFor(profile).slice(0, 2);
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-2 rounded-3xl bg-surface-2 p-4 text-sm text-muted">
        <Sparkles size={16} strokeWidth={1.75} className="shrink-0 text-ink" aria-hidden />
        <span className="min-w-0 flex-1">
          {t("find.basedOn", {
            level: t(`level.${profile.level}`),
            goal: t(`quiz.goal.${profile.goal}`),
            topics: profile.interests.map((d) => t(`domain.${d}`)).join(", "),
          })}
        </span>
        <button type="button" onClick={() => setEditing(true)} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-white px-3 font-semibold text-ink hover:bg-surface-2">
          <RotateCcw size={14} strokeWidth={1.75} aria-hidden /> {t("find.change")}
        </button>
      </div>

      {paths.length > 0 && (
        <section>
          <h2 className="font-display text-xl font-bold text-ink">{t("find.paths")}</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {paths.map((p) => (
              <Link key={p.slug} href={`/paths/${p.slug}`} className="group flex items-start gap-3 rounded-3xl border border-line bg-white p-4 shadow-card transition hover:shadow-lift">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-white"><Route size={18} strokeWidth={1.75} aria-hidden /></span>
                <span className="min-w-0">
                  <span className="block font-semibold text-ink group-hover:underline">{p.title}</span>
                  <span className="mt-0.5 block text-sm text-muted">{p.blurb}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-display text-xl font-bold text-ink">{t("find.shortlist")}</h2>
        <p className="mt-1 text-sm text-muted">{t("find.shortlistSub")}</p>
        {picks.length ? (
          <ol className="mt-4 grid gap-3 lg:grid-cols-2">
            {picks.map((p, i) => <RecommendedCourse key={p.course.id} pick={p} rank={i + 1} />)}
          </ol>
        ) : (
          <p className="mt-4 rounded-3xl border border-dashed border-line bg-surface-2 p-5 text-sm text-muted">{t("find.none")}</p>
        )}
      </section>
      <p className="text-xs text-muted">{t("find.privacy")}</p>
    </div>
  );
}
