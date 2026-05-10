// ============================================================
// FICHIER : src/lib/sector-redirect.ts
// Helper : redirige vers le bon frontend sectoriel après auth
//
// Règle : si on est sur le HUB (NEXT_PUBLIC_SECTOR=central ou vide)
//         et que le user a un secteur → redirect cross-domain
//         Sinon → false (le composant gère le router.push local)
// ============================================================

import { SECTOR_URLS } from "@/lib/constants";
import { isValidSector } from "@/lib/sector-config";

/**
 * Tente une redirection cross-domain vers le dashboard sectoriel.
 * Retourne true si la redirection a été déclenchée, false sinon.
 *
 * @param sectorSlug  slug du secteur de l'entreprise (ex: "restaurant")
 */
export function redirectAfterAuth(sectorSlug?: string | null): boolean {
  if (!sectorSlug || !isValidSector(sectorSlug)) return false;

  // 'central' = pas de redirect cross-domain (c'est le hub lui-même)
  if (sectorSlug === "central") return false;

  // Secteur du build courant — vide en dev (pas de NEXT_PUBLIC_SECTOR)
  const currentSector = process.env.NEXT_PUBLIC_SECTOR ?? "";

  // Déjà sur le bon secteur → pas de redirect cross-domain
  if (currentSector === sectorSlug) return false;

  // Construire l'URL cible
  const sectorBaseUrl = getSectorBaseUrl(sectorSlug);
  if (!sectorBaseUrl) return false;

  const target = `${sectorBaseUrl}/dashboard`;

  // Éviter redirect infinie (déjà sur la cible)
  if (typeof window !== "undefined" && window.location.origin === sectorBaseUrl) return false;

  // Redirect cross-domain (hard navigation)
  if (typeof window !== "undefined") {
    window.location.href = target;
    return true;
  }

  return false;
}

/**
 * Retourne l'URL de base du frontend pour un secteur donné.
 * Prod  : https://restaurant.agt-bot.com (depuis NEXT_PUBLIC_FRONTEND_BASE)
 * Dev   : http://localhost:3001 (depuis SECTOR_URLS dans constants.ts)
 */
function getSectorBaseUrl(sectorSlug: string): string | null {
  // Prod : variable d'env baked par déploiement
  const prodBase = process.env.NEXT_PUBLIC_FRONTEND_BASE;
  if (prodBase) {
    try {
      const url = new URL(prodBase);
      return `${url.protocol}//${sectorSlug}.${url.host}`;
    } catch { /* ignore */ }
  }

  // Dev : SECTOR_URLS depuis constants.ts
  const devUrl = (SECTOR_URLS as Record<string, string>)[sectorSlug];
  if (devUrl) return devUrl;

  return null;
}

// END OF FILE: src/lib/sector-redirect.ts