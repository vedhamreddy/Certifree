"use client";
import Link from "next/link";
import { BookOpenCheck, PlayCircle } from "lucide-react";
import { useLearning } from "@/lib/learning";
import { withSignInNudge } from "./SignInPrompt";

/** "Start learning" on a course page; once started it links to My Courses. */
export function LearningButton({ courseId }: { courseId: string }) {
  const { get, start } = useLearning();
  const item = get(courseId);
  if (item) {
    return (
      <Link href="/learning" className="inline-flex h-11 items-center gap-2 rounded-xl border border-accent/25 bg-accent/[0.06] px-4 text-sm font-semibold text-brand transition hover:bg-accent/10">
        <BookOpenCheck size={16} strokeWidth={1.75} className="text-accent" aria-hidden /> Learning · {item.progress}%
      </Link>
    );
  }
  return (
    <button type="button" onClick={() => withSignInNudge(() => start(courseId))} className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:border-accent/30 hover:bg-accent/[0.04] hover:text-brand active:scale-[0.98]">
      <PlayCircle size={16} strokeWidth={1.75} aria-hidden /> Start learning
    </button>
  );
}
