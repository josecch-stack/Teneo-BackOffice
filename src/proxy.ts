import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Next.js 16 renamed middleware.ts -> proxy.ts (same runtime behavior, new
// file/export name). See node_modules/next/dist/docs/.../proxy.md.
//
// This only does optimistic, cookie-based checks (session present? does the
// JWT carry a panel_role claim?). Real authorization happens in Server
// Actions/Server Components via the DAL (src/lib/auth/session.ts) and in RLS
// — never trust this layer alone. See docs/module-mapping.md section 4.
// /reset-password IS public: it lands with `?code=...` from Supabase's
// recovery email, and the exchange that turns that into a real session
// happens inside the page component itself (see reset-password/page.tsx) —
// this check runs before that, so it can't see a session yet either way.
// See requestPasswordReset in src/lib/auth/actions.ts.
const PUBLIC_ROUTES = ["/login", "/forgot-password", "/reset-password"];

// /reset-password must render even if the browser already carries an
// unrelated valid session (e.g. an admin resetting their password from a
// second tab that's still logged in) — excluded from the "already logged
// in, bounce away from public routes" redirect below, unlike every other
// public route.
const ALWAYS_RUNS = ["/reset-password"];

const SUPABASE_ORIGIN = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
  : "";

// Nonce-based CSP (Next.js's documented pattern): a fresh nonce per request,
// threaded to Server Components via the x-nonce request header (see
// src/app/layout.tsx, which hands it to next-themes' inline theme script —
// the only inline <script> this app renders itself). 'unsafe-inline' on
// style-src stays: Tailwind/Next inject inline styles Fase 10 didn't budget
// time to nonce individually, and it's a much lower-severity gap than
// script-src would be.
function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' blob: data:${SUPABASE_ORIGIN ? ` ${SUPABASE_ORIGIN}` : ""}`,
    "font-src 'self' data:",
    `connect-src 'self'${SUPABASE_ORIGIN ? ` ${SUPABASE_ORIGIN}` : ""}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

function withSecurityHeaders(
  response: NextResponse,
  csp: string,
): NextResponse {
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains",
  );
  return response;
}

export async function proxy(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  let supabaseResponse = NextResponse.next({
    request: { headers: requestHeaders },
  });

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
          supabaseResponse = NextResponse.next({
            request: { headers: requestHeaders },
          });
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
    return withSecurityHeaders(NextResponse.redirect(url), csp);
  }

  // Authenticated but not a panel user (e.g. a mobile app tutor account) —
  // panel_role only exists in the JWT for rows present in panel_users.
  if (claims && !claims.panel_role && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("error", "not_panel_user");
    return withSecurityHeaders(NextResponse.redirect(url), csp);
  }

  const alwaysRuns = ALWAYS_RUNS.some((route) => pathname.startsWith(route));

  if (claims?.panel_role && isPublicRoute && !alwaysRuns) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return withSecurityHeaders(NextResponse.redirect(url), csp);
  }

  return withSecurityHeaders(supabaseResponse, csp);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
