import { Suspense } from "react";
import type { Metadata } from "next";
import { Browse } from "@/components/Browse";

export const metadata: Metadata = { title: "Browse free courses" };

function Loading() {
  return (
    <div className="mx-auto grid max-w-7xl gap-4 px-4 py-24 sm:grid-cols-2 sm:px-6 xl:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
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
