/**
 * Inso Code — Server-Side Auth Middleware
 *
 * Protects authenticated routes at the edge BEFORE any page renders.
 * Uses next-auth JWT to validate session tokens.
 */

import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Routes that DO NOT require authentication
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/contact",
  "/faq",
  "/blog",
  "/news",
  "/download",
  "/marketplace",
  "/payment-success",
  "/auth/sso-iframe",
  "/success",
];

// Prefixes that are always public
const PUBLIC_PREFIXES = [
  "/api/",
  "/_next/",
  "/favicon",
  "/robots.txt",
  "/.well-known",
  "/images/",
  "/fonts/",
];

function isPublicRoute(pathname: string): boolean {
  // Exact match
  if (PUBLIC_ROUTES.includes(pathname)) return true;

  // Prefix match
  for (const prefix of PUBLIC_PREFIXES) {
    if (pathname.startsWith(prefix)) return true;
  }

  // Public sub-routes (blog posts, news articles, etc.)
  if (pathname.startsWith("/blog/")) return true;
  if (pathname.startsWith("/news/")) return true;
  if (pathname.startsWith("/faq/")) return true;

  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes through
  if (isPublicRoute(pathname)) {
    if (pathname === "/") {
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });

      if (token) {
        // All logged-in users go to the admin page as requested
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }

    return NextResponse.next();
  }

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
    const loginUrl = new URL("/login", request.url);

    loginUrl.searchParams.set("callbackUrl", pathname);

    return NextResponse.redirect(loginUrl);
  }

  // Check if MFA is required for this tenant/user
  if ((token as any).mfaRequired && pathname !== "/auth/mfa") {
    const mfaUrl = new URL("/auth/mfa", request.url);

    mfaUrl.searchParams.set("callbackUrl", pathname);

    return NextResponse.redirect(mfaUrl);
  }

  // Never allow access to the old dashboard
  if (pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/admin", request.url));
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
