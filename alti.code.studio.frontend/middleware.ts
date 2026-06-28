/**
 * Alti Code Studio — Server-Side Auth Middleware
 * 
 * Protects authenticated routes at the edge BEFORE any page renders.
 * Uses next-auth JWT to validate session tokens.
 */

import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

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
    return NextResponse.next();
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

  // Admin/Owner routes require elevated roles
  if (pathname.startsWith("/admin") || pathname.startsWith("/owner")) {
    const role = (token as Record<string, unknown>).role as string | undefined;
    if (role !== "admin" && role !== "owner" && role !== "super_admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
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
