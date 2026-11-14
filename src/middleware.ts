import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { secureCookie, supabaseEnv } from "@/lib/supabase/env";

/**
 * Keeps the session cookie fresh on account-related routes only. Public catalog pages
 * are not matched, so they stay static and never touch auth.
 */
export async function middleware(request: NextRequest) {
  const env = supabaseEnv();
  if (!env) return NextResponse.next();
  let response = NextResponse.next({ request });
  const supabase = createServerClient(env.url, env.key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, secureCookie(options)));
      },
    },
  });
  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*", "/sync/:path*", "/api/:path*", "/auth/:path*"],
};
