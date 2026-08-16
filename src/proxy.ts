import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Next.js 16 renamed middleware.ts -> proxy.ts (same runtime behavior, new
// file/export name). See node_modules/next/dist/docs/.../proxy.md.
//
// This only does optimistic, cookie-based checks (session present? does the
// JWT carry a panel_role claim?). Real authorization happens in Server
// Actions/Server Components via the DAL (src/lib/auth/session.ts) and in RLS
// — never trust this layer alone. See docs/module-mapping.md section 4.
const PUBLIC_ROUTES = ["/login"];

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not add logic between createServerClient and getClaims(): it refreshes
  // the session cookie as a side effect, and skipping it causes random logouts.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims as { panel_role?: string } | undefined;

  const pathname = request.nextUrl.pathname;
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  if (!claims && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Authenticated but not a panel user (e.g. a mobile app tutor account) —
  // panel_role only exists in the JWT for rows present in panel_users.
  if (claims && !claims.panel_role && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("error", "not_panel_user");
    return NextResponse.redirect(url);
  }

  if (claims?.panel_role && isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
