"use client";
import { useMemo } from "react";
import { useCatalog } from "./useCatalog";
import { useLearning } from "./learning";
import { useCertificates } from "./certificates";
import { useProfile } from "./profile";
import { recommend } from "./recommend";

/** Shortlist for this learner, from their quiz answers. Skips courses they already started or finished. */
export function useRecommendations(n = 8) {
  const profile = useProfile();
  const { courses } = useCatalog();
  const { list } = useLearning();
  const { list: certs } = useCertificates();
  const picks = useMemo(() => {
    if (!profile) return [];
    const skip = new Set([...list.map((x) => x.courseId), ...certs.map((c) => c.courseId ?? "")]);
    return recommend(courses, profile, skip, n);
  }, [profile, courses, list, certs, n]);
  return { profile, picks };
}
