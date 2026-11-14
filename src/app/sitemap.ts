import type { MetadataRoute } from "next";
import { courses } from "@/data/courses";
import { providers } from "@/data/providers";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://certifree.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${base}/` },
    { url: `${base}/courses` },
    { url: `${base}/providers` },
    ...providers.map((p) => ({ url: `${base}/providers/${p.slug}` })),
    ...courses.map((c) => ({ url: `${base}/courses/${c.id}` })),
  ];
}
