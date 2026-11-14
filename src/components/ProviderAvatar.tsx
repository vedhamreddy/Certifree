import { providerBySlug } from "@/data/providers";

export function ProviderAvatar({ slug, size = "md" }: { slug: string; size?: "sm" | "md" | "lg" }) {
  const p = providerBySlug[slug];
  const cls = size === "lg" ? "h-12 w-12 text-lg rounded-xl" : size === "sm" ? "h-7 w-7 text-xs rounded-lg" : "h-9 w-9 text-sm rounded-xl";
  return (
    <span
      className={`grid shrink-0 place-items-center font-display font-bold ring-1 ring-inset ${cls}`}
      style={{ background: `${p.color}12`, color: p.color, ["--tw-ring-color" as string]: `${p.color}26` }}
      aria-hidden="true"
    >
      {p.name[0]}
    </span>
  );
}
