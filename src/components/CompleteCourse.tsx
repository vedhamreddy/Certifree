"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Course } from "@/data/courses";
import { useCertificates } from "@/lib/certificates";
import { CertificateForm } from "./CertificateForm";
import { CircleCheck, GraduationCap } from "lucide-react";

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
      <Link href="/certificates" className="inline-flex h-11 items-center gap-2 rounded-xl border border-emerald-600/15 bg-emerald-50 px-4 text-sm font-semibold text-[#047857] transition hover:bg-emerald-100/70">
        <CircleCheck size={16} strokeWidth={2} aria-hidden /> {justSaved ? "Added to My Certificates" : "Completed"} · View
      </Link>
    );
  }
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:border-emerald-600/30 hover:bg-emerald-50/60 hover:text-[#047857] active:scale-[0.98]">
        <GraduationCap size={16} strokeWidth={1.75} aria-hidden /> I completed this
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
