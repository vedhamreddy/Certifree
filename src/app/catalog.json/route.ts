import { getCatalogUpdate } from "@/lib/catalog-server";

export const dynamic = "force-dynamic";

/** Public: new courses found automatically, and IDs of hidden or dead-link courses. */
export async function GET() {
  const update = await getCatalogUpdate();
  return new Response(JSON.stringify(update), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=600, stale-while-revalidate=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
