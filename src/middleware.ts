// src/middleware.ts
// Session 8 — ajout de /auth-handoff aux routes publiques.
// La page /auth-handoff arrive avec les tokens dans l'URL mais sans cookie
// agt_auth encore posé (puisque le cookie sera posé par tokenStorage.set()
// EN page React). Si le middleware bloque, on n'atteint jamais le code qui
// pose le cookie → deadlock. Donc /auth-handoff doit être public.
import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/pending",
  "/verify-email",
  "/reset-password",
  "/magic-link",
  "/auth-handoff",
];
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
    pathname.startsWith("/magic-link") ||
    pathname.startsWith("/auth-handoff")
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
    "/auth-handoff", "/auth-handoff/:path*",
    "/dashboard/:path*",
    "/:path*",
    "/admin/:path*",
    "/onboarding/:path*",
  ],
};