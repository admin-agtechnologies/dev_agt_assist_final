// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/", "/login", "/pending", "/verify-email", "/reset-password", "/magic-link"];
const DASHBOARD = "/dashboard";
const ONBOARDING = "/onboarding";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const auth = request.cookies.get("agt_auth")?.value;

  // ── Bloquer tout accès /admin depuis cette app ───────────────────────────
  if (pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL(DASHBOARD, request.url));
  }

  // ── Route publique : landing "/" ─────────────────────────────────────────
  if (pathname === "/") {
    if (auth) return NextResponse.redirect(new URL(DASHBOARD, request.url));
    return NextResponse.next();
  }

  // ── Page login ───────────────────────────────────────────────────────────
  if (pathname.startsWith("/login")) {
    if (auth) return NextResponse.redirect(new URL(DASHBOARD, request.url));
    return NextResponse.next();
  }

  // ── Page pending ─────────────────────────────────────────────────────────
  if (pathname.startsWith("/pending")) {
    return NextResponse.next();
  }

  // ── Pages auth flow (token dans URL, pas dans cookie) ────────────────────
  if (
    pathname.startsWith("/verify-email") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/magic-link")
  ) {
    return NextResponse.next();
  }

  // ── Onboarding ───────────────────────────────────────────────────────────
  if (pathname.startsWith(ONBOARDING)) {
    return NextResponse.next();
  }

  // ── Dashboard & routes PME : protégées ───────────────────────────────────
  if (pathname.startsWith(DASHBOARD)) {
    if (!auth) {
      return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login", "/login/:path*",
    "/pending",
    "/verify-email", "/verify-email/:path*",
    "/reset-password", "/reset-password/:path*",
    "/magic-link", "/magic-link/:path*",
    "/dashboard/:path*",
    "/:path*",
    "/admin/:path*",
    "/onboarding/:path*",
  ],
};