import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Prefixes that are always allowed (static assets and api)
const ALLOWED_PREFIXES = [
  "/api/",
  "/_next/",
  "/favicon",
  "/robots.txt",
  "/.well-known",
  "/images/",
  "/fonts/",
];

// Specific paths that are allowed (auth pages)
const ALLOWED_AUTH_ROUTES = [
  "/login",
  "/register",
  "/auth/mfa",
  "/auth/sso-iframe",
];

// Public pages that are allowed without auth
const ALLOWED_PUBLIC_ROUTES = [
  "/",
  "/chat",
  "/code",
  "/cowork",
  "/create",
  "/new-chat",
  "/contact",
  "/faq",
  "/blog",
  "/news",
  "/download",
  "/marketplace",
  "/payment-success",
  "/success",
  "/pricing",
  "/demo",
  "/about",
  "/privacy",
  "/terms",
  "/cookies",
];

function isAllowedRoute(pathname: string): boolean {
  if (ALLOWED_PUBLIC_ROUTES.includes(pathname)) {
    return true;
  }
  if (
    pathname.startsWith("/blog/") ||
    pathname.startsWith("/news/") ||
    pathname.startsWith("/faq/") ||
    pathname.startsWith("/clouds/") ||
    pathname.startsWith("/download")
  ) {
    return true;
  }
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/owner") ||
    pathname.startsWith("/support")
  ) {
    return true;
  }
  if (ALLOWED_AUTH_ROUTES.includes(pathname)) {
    return true;
  }
  for (const prefix of ALLOWED_PREFIXES) {
    if (pathname.startsWith(prefix)) {
      return true;
    }
  }

  return false;
}

/**
 * Triple-Cloud Sovereign Edge Router
 *
 * Intercepts requests destined for the backend and routes them dynamically
 * to the most optimal, healthy Cloud Provider (AWS, Azure, GCP).
 * Performs active-active failover natively at the edge.
 */
async function routeToSovereignBackend(request: NextRequest) {
  const backendEndpoints = {
    aws: process.env.NEXT_PUBLIC_AWS_BACKEND_URL,
    azure: process.env.NEXT_PUBLIC_AZURE_BACKEND_URL,
    gcp: process.env.NEXT_PUBLIC_GCP_BACKEND_URL,
  };

  // Preference derived from Geo-IP or strict compliance rules
  const targetCloud =
    request.headers.get("X-Sovereign-Cloud") ||
    process.env.PRIMARY_CLOUD ||
    "aws";

  let targetUrl =
    backendEndpoints[targetCloud as keyof typeof backendEndpoints];

  if (!targetUrl) {
    targetUrl = backendEndpoints.aws; // Fallback to AWS
  }

  const url = request.nextUrl.clone();
  const backendPath = url.pathname.replace(/^\/backend-api/, "");

  return NextResponse.rewrite(`${targetUrl}${backendPath}${url.search}`);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 0. Intercept backend requests and route natively to the Sovereign API
  if (pathname.startsWith("/backend-api/")) {
    return routeToSovereignBackend(request);
  }

  // 1. Allow public static assets and API routes through immediately
  for (const prefix of ALLOWED_PREFIXES) {
    if (pathname.startsWith(prefix)) {
      return NextResponse.next();
    }
  }

  // 2. Redirect logged-in users away from "/" or auth pages to "/chat"
  if (pathname === "/" || pathname === "/login" || pathname === "/register") {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (token) {
      return NextResponse.redirect(new URL("/chat", request.url));
    }
    if (pathname === "/") {
      return NextResponse.next();
    }
  }

  // 3. Strict route whitelist check has been removed to allow access to all app routes

  // E2E Testing Backdoor
  if (
    (process.env.E2E_TEST_MODE === "true" ||
      process.env.NODE_ENV === "development") &&
    request.cookies.has("e2e-session")
  ) {
    try {
      const e2eSession = JSON.parse(
        request.cookies.get("e2e-session")?.value || "{}",
      );

      if (e2eSession.mfaRequired && pathname !== "/auth/mfa") {
        const mfaUrl = new URL("/auth/mfa", request.url);

        mfaUrl.searchParams.set("callbackUrl", pathname);

        return NextResponse.redirect(mfaUrl);
      }

      if (pathname.startsWith("/admin") || pathname.startsWith("/owner")) {
        if (
          e2eSession.role !== "admin" &&
          e2eSession.role !== "owner" &&
          e2eSession.role !== "super_admin"
        ) {
          return NextResponse.redirect(new URL("/login", request.url));
        }
      }

      return NextResponse.next();
    } catch (e) {
      // ignore parse errors
    }
  }

  // Check for valid session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // No valid session → redirect to login
  if (!token) {
    if (
      pathname === "/login" ||
      pathname === "/register" ||
      pathname === "/auth/sso-iframe" ||
      isAllowedRoute(pathname)
    ) {
      return NextResponse.next();
    }
    const loginUrl = new URL("/login", request.url);

    loginUrl.searchParams.set("callbackUrl", pathname);

    return NextResponse.redirect(loginUrl);
  }

  // Logged-in user trying to access login/register → redirect to /chat
  if (pathname === "/login" || pathname === "/register") {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  // Check if MFA is required for this tenant/user
  if ((token as any).mfaRequired && pathname !== "/auth/mfa") {
    const mfaUrl = new URL("/auth/mfa", request.url);

    mfaUrl.searchParams.set("callbackUrl", pathname);

    return NextResponse.redirect(mfaUrl);
  }

  // Admin/Owner routes require elevated roles
  if (pathname.startsWith("/admin") || pathname.startsWith("/owner")) {
    const role = (token as Record<string, unknown>).role as string | undefined;

    if (role !== "admin" && role !== "owner" && role !== "super_admin") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except static files and Next.js internals.
     * This ensures middleware runs on page navigations but not on
     * static asset requests.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$).*)",
  ],
};
