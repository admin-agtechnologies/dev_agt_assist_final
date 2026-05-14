// src/lib/sector-urls.ts
// ============================================================
// Source de vérité unique pour les URLs sectorielles.
//
// Remplace l'ancien `SECTOR_URLS` hard-codé de `constants.ts`.
// Fonctionne dev (localhost) ET prod (sous-domaines agt-bot.com)
// en lisant `NEXT_PUBLIC_FRONTEND_BASE` (pattern S5).
//
// Pour ajouter un secteur :
//   1. Ajouter une entrée dans SECTOR_LOCAL_PORTS
//   2. Si le sous-domaine prod diffère du slug, ajouter dans
//      SECTOR_SUBDOMAIN_OVERRIDES
// ============================================================

import { ENV } from './env';

/**
 * Mapping slug → port localhost (utilisé uniquement en dev).
 * Aligné avec `package.json` scripts `dev:{secteur}`.
 */
const SECTOR_LOCAL_PORTS: Record<string, number> = {
    central: 3000, // hub
    hub: 3000, // alias
    restaurant: 3001,
    banking: 3002,
    clinical: 3003,
    school: 3004,
    ecommerce: 3005,
    hotel: 3006,
    public: 3007,
    pme: 3008,
    transport: 3009,
};

/**
 * Cas spéciaux où le sous-domaine prod diffère du slug.
 * Exemples :
 *   - `ecommerce` → `e-commerce.agt-bot.com` (tiret)
 *   - `transport` → ? (à décider — voir TODO_DEPLOYMENT_VERCEL_v2.md)
 *
 * Par défaut : slug = sous-domaine.
 */
const SECTOR_SUBDOMAIN_OVERRIDES: Record<string, string> = {
    ecommerce: 'e-commerce',
    // transport: 'travel',  // ⚠️ décommenter UNIQUEMENT après alignement backend
    central: '',  // hub = apex (agt-bot.com), pas de sous-domaine
    hub: '',
};

/**
 * Slugs spéciaux qui n'ont pas de sous-domaine dédié.
 * Pour ces slugs, on redirige vers /onboarding sur le hub.
 */
const SECTORS_WITHOUT_SUBDOMAIN = new Set(['custom', 'personnalise']);

/**
 * Retourne l'URL de base pour un secteur donné.
 *
 * Dev (NEXT_PUBLIC_FRONTEND_BASE vide) :
 *   → `http://localhost:{port}`
 *
 * Prod (NEXT_PUBLIC_FRONTEND_BASE défini, ex: `https://agt-bot.com`) :
 *   → `https://{subdomain}.{host}` ou `https://{host}` pour le hub
 *
 * @param slug Slug du secteur (ex: "restaurant", "ecommerce", "hub")
 * @returns URL absolue (https://... ou http://localhost:...) ou chemin relatif
 *          pour les secteurs spéciaux (`/onboarding`)
 */
export function getSectorUrl(slug: string): string {
    // Cas spéciaux : pas de sous-domaine
    if (SECTORS_WITHOUT_SUBDOMAIN.has(slug)) {
        return '/onboarding';
    }

    const frontendBase = ENV.FRONTEND_BASE;

    // ── Mode PROD ────────────────────────────────────────────────────
    if (frontendBase) {
        try {
            const url = new URL(frontendBase);
            const subdomain = SECTOR_SUBDOMAIN_OVERRIDES[slug] ?? slug;

            // Hub / central → apex (pas de sous-domaine)
            if (subdomain === '') {
                return `${url.protocol}//${url.host}`;
            }

            return `${url.protocol}//${subdomain}.${url.host}`;
        } catch {
            // FRONTEND_BASE malformé → fallback dev
        }
    }

    // ── Mode DEV (fallback) ──────────────────────────────────────────
    const port = SECTOR_LOCAL_PORTS[slug];
    if (port === undefined) {
        return '/onboarding'; // slug inconnu → onboarding sur l'origine courante
    }
    return `http://localhost:${port}`;
}

/**
 * Type des slugs gérés (pour l'autocomplétion).
 * Note : on n'exporte plus `SectorKey` depuis constants.ts —
 * la source de vérité des slugs est `sector-config.ts → SECTOR_SLUGS`.
 */
export type SectorUrlSlug = keyof typeof SECTOR_LOCAL_PORTS;