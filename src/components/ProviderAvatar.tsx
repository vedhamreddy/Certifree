import { providerBySlug } from "@/data/providers";

/** Small round monogram, monochrome to match the dashboard style. */
export function ProviderAvatar({ slug, size = "md" }: { slug: string; size?: "sm" | "md" | "lg" }) {
  const p = providerBySlug[slug];
  const cls = size === "lg" ? "h-12 w-12 text-lg" : size === "sm" ? "h-7 w-7 text-xs" : "h-9 w-9 text-sm";
  return (
    <span className={`grid shrink-0 place-items-center rounded-full bg-surface-2 font-display font-bold text-ink ring-1 ring-inset ring-line ${cls}`} aria-hidden="true">
      {p.name[0]}
    </span>
  );
}
