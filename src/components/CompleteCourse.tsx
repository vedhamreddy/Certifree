"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Course } from "@/data/courses";
import { useCertificates } from "@/lib/certificates";
import { CertificateForm } from "./CertificateForm";

export function CompleteCourse({ course }: { course: Course }) {
  const { forCourse } = useCertificates();
  const [open, setOpen] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const existing = forCourse(course.id);
  const initial = useMemo(
    () => ({ courseId: course.id, title: course.title, provider: course.provider, domain: course.domain }),
    [course],
  );

  if (existing) {
    return (
      <Link href="/certificates" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-100 px-4 py-2.5 font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
        🎓 {justSaved ? "Added to My Certificates" : "Completed"} · View
      </Link>
    );
  }
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-2xl border border-line bg-surface px-4 py-2.5 font-semibold transition hover:border-free hover:text-emerald-600">
        🎓 I completed this
      </button>
      <CertificateForm
        open={open}
        onClose={() => setOpen(false)}
        initial={initial}
        onSaved={() => setJustSaved(true)}
      />
    </>
  );
}
