import type { Metadata } from "next";
import { CompareView } from "@/components/CompareView";
import { T } from "@/lib/i18n";

export const metadata: Metadata = { title: "Compare courses", robots: { index: false, follow: true } };

export default function ComparePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl"><T k="compare.title" /></h1>
      <p className="mt-2 max-w-2xl text-muted"><T k="compare.sub" /></p>
      <div className="mt-8"><CompareView /></div>
    </div>
  );
}
