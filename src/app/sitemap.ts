import type { MetadataRoute } from "next";
import { courses } from "@/data/courses";
import { providers } from "@/data/providers";
import { careerPaths } from "@/data/paths";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://certifree.vedhamreddym.workers.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${base}/` },
    { url: `${base}/courses` },
    { url: `${base}/providers` },
    { url: `${base}/paths` },
    { url: `${base}/find` },
    { url: `${base}/privacy` },
    { url: `${base}/terms` },
    { url: `${base}/deadlines` },
    ...careerPaths.map((p) => ({ url: `${base}/paths/${p.slug}` })),
    ...providers.map((p) => ({ url: `${base}/providers/${p.slug}` })),
    ...courses.map((c) => ({ url: `${base}/courses/${c.id}` })),
  ];
}
