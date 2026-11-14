"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Course } from "@/data/courses";
import { useCertificates } from "@/lib/certificates";
import { useLearning } from "@/lib/learning";
import { CertificateForm } from "./CertificateForm";
import { withSignInNudge } from "./SignInPrompt";
import { CircleCheck, GraduationCap } from "lucide-react";

export function CompleteCourse({ course }: { course: Course }) {
  const { forCourse } = useCertificates();
  const { stop } = useLearning();
  const [open, setOpen] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const existing = forCourse(course.id);
  const initial = useMemo(
    () => ({ courseId: course.id, title: course.title, provider: course.provider, domain: course.domain }),
    [course],
  );

  if (existing) {
    return (
      <Link href="/certificates" className="inline-flex h-11 items-center gap-2 rounded-full bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-600">
        <CircleCheck size={16} strokeWidth={2} aria-hidden /> {justSaved ? "Added to My Certificates" : "Completed"} · View
      </Link>
    );
  }
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:bg-surface-2 active:scale-[0.98]">
        <GraduationCap size={16} strokeWidth={1.75} aria-hidden /> I completed this
      </button>
      <CertificateForm
        open={open}
        onClose={() => setOpen(false)}
        initial={initial}
        onSaved={() => {
          withSignInNudge(() => setJustSaved(true));
          stop(course.id);
        }}
      />
    </>
  );
}
