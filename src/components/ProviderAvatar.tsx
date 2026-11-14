import { providerBySlug } from "@/data/providers";
import { providerLogos } from "@/data/logos";

const H = { sm: 28, md: 36, lg: 48 } as const;

/**
 * The provider's real logo on a white chip (round for square marks, a pill for wide
 * wordmarks). Falls back to a letter monogram if a logo is missing.
 */
export function ProviderAvatar({ slug, size = "md" }: { slug: string; size?: "sm" | "md" | "lg" }) {
  const p = providerBySlug[slug];
  const logo = providerLogos[slug];
  const h = H[size];
  if (!logo) {
    const cls = size === "lg" ? "text-lg" : size === "sm" ? "text-xs" : "text-sm";
    return (
      <span className={`grid shrink-0 place-items-center rounded-full bg-surface-2 font-display font-bold text-ink ring-1 ring-inset ring-line ${cls}`} style={{ width: h, height: h }} aria-hidden="true">
        {p.name[0]}
      </span>
    );
  }
  const wide = logo.aspect > 1.2;
  const w = wide ? Math.round(h * Math.min(2.6, 0.9 + logo.aspect * 0.45)) : h;
  const pad = wide ? Math.round(h * 0.18) : Math.round(h * 0.2);
  return (
    <span className="grid shrink-0 place-items-center rounded-full bg-white ring-1 ring-inset ring-line" style={{ width: w, height: h, padding: `${pad}px ${wide ? pad + 2 : pad}px` }} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logo.src} alt="" className="h-full w-full object-contain" loading="lazy" decoding="async" draggable={false} />
    </span>
  );
}
