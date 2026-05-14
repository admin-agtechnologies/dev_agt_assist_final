// ============================================================
// FICHIER : src/lib/sector-redirect.ts
// Helper : redirige vers le bon frontend sectoriel après auth
//
// Règle : si on est sur le HUB (NEXT_PUBLIC_SECTOR=central ou vide)
//         et que le user a un secteur → redirect cross-domain
//         Sinon → false (le composant gère le router.push local)
//
// Session 8 — paramètre tokens optionnel :
//   si fourni ET cross-origin → URL cible = /auth-handoff?access=...&refresh=...
//   sinon → /dashboard (comportement S5).
//   La page /auth-handoff écrit le token dans le localStorage de la NOUVELLE
//   origine puis route vers le dashboard. Filet de sécurité B06 résiduel.
//
// Session déploiement Vercel — refactor :
//   La logique dev/prod est maintenant centralisée dans `getSectorUrl()`
//   (`@/lib/sector-urls`). Ce fichier ne lit plus `SECTOR_URLS` ni
//   `NEXT_PUBLIC_FRONTEND_BASE` directement.
// ============================================================

import { isValidSector } from "@/lib/sector-config";
import { getSectorUrl } from "@/lib/sector-urls";

export interface AuthTokens {
  access: string;
  refresh: string;
}

/**
 * Tente une redirection cross-domain vers le dashboard sectoriel.
 * Retourne true si la redirection a été déclenchée, false sinon.
 *
 * @param sectorSlug  slug du secteur de l'entreprise (ex: "restaurant")
 * @param tokens      tokens à propager via /auth-handoff (cross-origin only).
 *                    Si non fourni, redirige vers /dashboard direct
 *                    (utile si on est déjà sur la bonne origine).
 */
export function redirectAfterAuth(
  sectorSlug?: string | null,
  tokens?: AuthTokens,
): boolean {
  if (!sectorSlug || !isValidSector(sectorSlug)) return false;

  // 'central' = pas de redirect cross-domain (c'est le hub lui-même)
  if (sectorSlug === "central") return false;

  // Secteur du build courant — vide en dev (pas de NEXT_PUBLIC_SECTOR)
  const currentSector = process.env.NEXT_PUBLIC_SECTOR ?? "";

  // Déjà sur le bon secteur → pas de redirect cross-domain
  if (currentSector === sectorSlug) return false;

  // Construire l'URL cible via la source de vérité unique
  const sectorBaseUrl = getSectorUrl(sectorSlug);

  // Si getSectorUrl retourne un chemin relatif (slug inconnu, custom),
  // ce n'est pas une URL cross-domain → on n'effectue pas de redirect
  if (!sectorBaseUrl.startsWith("http")) return false;

  // Éviter redirect infinie (déjà sur la cible)
  if (typeof window !== "undefined" && window.location.origin === sectorBaseUrl) {
    return false;
  }

  // Cible : /auth-handoff avec tokens si fournis, sinon /dashboard direct
  let target: string;
  if (tokens && tokens.access) {
    const params = new URLSearchParams({
      access: tokens.access,
      refresh: tokens.refresh || "",
      next: "/dashboard",
    });
    target = `${sectorBaseUrl}/auth-handoff?${params.toString()}`;
  } else {
    target = `${sectorBaseUrl}/dashboard`;
  }

  // Redirect cross-domain (hard navigation)
  if (typeof window !== "undefined") {
    window.location.href = target;
    return true;
  }

  return false;
}