import type { Metadata } from "next";
import { FindCourse } from "@/components/FindCourse";
import { T } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Find my course",
  description: "Answer six quick questions and get a shortlist of free courses that fit your goal, level and time.",
  alternates: { canonical: "/find" },
};

export default function FindPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl"><T k="find.title" /></h1>
      <p className="mt-2 max-w-2xl text-muted"><T k="find.sub" /></p>
      <div className="mt-8"><FindCourse /></div>
    </div>
  );
}
