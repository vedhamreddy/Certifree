import { companyBySlug } from "@/data/companies";

export function CompanyAvatar({ slug, size = "md" }: { slug: string; size?: "sm" | "md" | "lg" }) {
  const c = companyBySlug[slug];
  const cls = size === "lg" ? "h-14 w-14 text-2xl rounded-2xl" : size === "sm" ? "h-7 w-7 text-xs rounded-lg" : "h-9 w-9 text-sm rounded-xl";
  return (
    <span className={`grid shrink-0 place-items-center font-bold text-white ${cls}`} style={{ background: c.color }} aria-hidden="true">
      {c.name[0]}
    </span>
  );
}
