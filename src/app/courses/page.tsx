import { Suspense } from "react";
import type { Metadata } from "next";
import { Browse } from "@/components/Browse";

export const metadata: Metadata = { title: "Browse free courses" };

function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="skeleton h-9 w-72 rounded-lg" />
      <div className="skeleton mt-3 h-5 w-full max-w-md rounded-md" />
      <div className="skeleton mt-8 h-12 rounded-xl" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => <div key={i} className="skeleton h-52 rounded-2xl" />)}
      </div>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Browse />
    </Suspense>
  );
}
