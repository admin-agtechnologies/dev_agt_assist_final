// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";

// Routes publiques accessibles sans token
const PUBLIC_ROUTES = ["/", "/login", "/pending"];
const PME_PREFIX = "/pme";
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
    // Si connecté, rediriger vers dashboard
    if (auth) return NextResponse.redirect(new URL(DASHBOARD, request.url));
    return NextResponse.next();
  }

  // ── Page login ───────────────────────────────────────────────────────────
  if (pathname.startsWith("/login")) {
    if (auth) return NextResponse.redirect(new URL(DASHBOARD, request.url));
    return NextResponse.next();
  }

  // ── Page pending (compte inactif) ────────────────────────────────────────
  if (pathname.startsWith("/pending")) {
    return NextResponse.next();
  }

  // ── Onboarding ───────────────────────────────────────────────────────────
  if (pathname.startsWith(ONBOARDING)) {
    return NextResponse.next();
  }

  // ── Dashboard & routes PME : protégées ──────────────────────────────────
  if (pathname.startsWith(DASHBOARD) || pathname.startsWith(PME_PREFIX)) {
    if (!auth) {
      return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/login/:path*", "/pending", "/dashboard/:path*", "/pme/:path*", "/admin/:path*", "/onboarding/:path*"],
};
