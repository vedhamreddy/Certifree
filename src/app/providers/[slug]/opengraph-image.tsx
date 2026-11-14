import { notFound } from "next/navigation";
import { courses } from "@/data/courses";
import { providers, providerBySlug } from "@/data/providers";
import { ogCard, OG_SIZE } from "@/lib/og";

export const alt = "Free courses on CertiFree";
export const size = OG_SIZE;
export const contentType = "image/png";
export function generateStaticParams() {
  return providers.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const p = providerBySlug[(await params).slug];
  if (!p) notFound();
  const n = courses.filter((c) => c.provider === p.slug).length;
  return ogCard({ eyebrow: p.portal, title: `Free ${p.name} courses and certificates`, chip: `${n} course${n === 1 ? "" : "s"}` });
}
