// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";

const DASHBOARD  = "/dashboard";
const ONBOARDING = "/onboarding";

// Lit le cookie sectoriel : agt_auth_hub, agt_auth_restaurant, etc.
// Le secteur est injecté via NEXT_PUBLIC_SECTOR au build.
const SECTOR      = process.env.NEXT_PUBLIC_SECTOR ?? "hub";
const COOKIE_NAME = `agt_auth_${SECTOR}`;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const auth = request.cookies.get(COOKIE_NAME)?.value;

  // ── Bloquer tout accès /admin ─────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL(DASHBOARD, request.url));
  }

  // ── Landing "/" ───────────────────────────────────────────────────────────
  if (pathname === "/") {
    if (auth) return NextResponse.redirect(new URL(DASHBOARD, request.url));
    return NextResponse.next();
  }

  // ── Login ─────────────────────────────────────────────────────────────────
  if (pathname.startsWith("/login")) {
    if (auth) return NextResponse.redirect(new URL(DASHBOARD, request.url));
    return NextResponse.next();
  }

  // ── Pages publiques auth flow ─────────────────────────────────────────────
  if (
    pathname.startsWith("/pending") ||
    pathname.startsWith("/verify-email") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/magic-link") ||
    pathname.startsWith("/auth-handoff")
  ) {
    return NextResponse.next();
  }

  // ── Onboarding ────────────────────────────────────────────────────────────
  if (pathname.startsWith(ONBOARDING)) {
    return NextResponse.next();
  }

  // ── Dashboard & routes protégées ──────────────────────────────────────────
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
    "/auth-handoff", "/auth-handoff/:path*",
    "/dashboard/:path*",
    "/:path*",
    "/admin/:path*",
    "/onboarding/:path*",
  ],
};