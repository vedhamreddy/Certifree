import { notFound } from "next/navigation";
import { courses, courseById, costLabels } from "@/data/courses";
import { providerBySlug } from "@/data/providers";
import { ogCard, OG_SIZE } from "@/lib/og";

export const alt = "Free course on CertiFree";
export const size = OG_SIZE;
export const contentType = "image/png";
export function generateStaticParams() {
  return courses.map((c) => ({ id: c.id }));
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const c = courseById[(await params).id];
  if (!c) notFound();
  const p = providerBySlug[c.provider];
  return ogCard({ eyebrow: p.portal, title: c.title, chip: costLabels[c.cost], footer: `by ${p.name}` });
}
