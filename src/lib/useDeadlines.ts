"use client";
import { useEffect, useMemo, useState } from "react";
import { useCatalog } from "./useCatalog";
import { useLearning } from "./learning";
import { offerDeadline, targetDeadline, type Deadline } from "./deadlines";

/** Open provider offers plus the learner's own finish-by dates, soonest first. */
export function useDeadlines() {
  const { courses, byId } = useCatalog();
  const { list } = useLearning();
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  return useMemo(() => {
    if (!origin) return { offers: [] as Deadline[], targets: [] as Deadline[], all: [] as Deadline[] };
    const offers = courses.map((c) => offerDeadline(c, origin)).filter((d): d is Deadline => !!d);
    const targets = list
      .filter((x) => x.targetDate && x.progress < 100 && byId[x.courseId])
      .map((x) => targetDeadline(byId[x.courseId], x.targetDate!, x.progress, origin));
    const byDate = (a: Deadline, b: Deadline) => a.date.localeCompare(b.date);
    offers.sort(byDate);
    targets.sort(byDate);
    return { offers, targets, all: [...offers, ...targets].sort(byDate) };
  }, [courses, byId, list, origin]);
}
