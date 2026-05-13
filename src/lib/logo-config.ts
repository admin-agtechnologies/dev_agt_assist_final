// ============================================================
// FICHIER : src/lib/logo-config.ts
// Mapping centralisé secteur → chemins logo
// Convention : fond-blanc = light (suffix _b), fond-pale = dark (sans suffix)
// ⚠️  Les dossiers avec accents (logo_santé, logo_personnalisé) doivent
//     être renommés sans accent avant déploiement.
// ============================================================

export interface LogoAssets {
  /** Logo sur fond clair (navbar, cards claires) */
  light: string;
  /** Logo sur fond sombre (footer, hero sombre) */
  dark: string;
  /** SVG light */
  lightSvg: string;
  /** SVG dark */
  darkSvg: string;
  /** Favicon (fond-blanc) */
  favicon: string;
}

const BASE = "/AGT-BOT-logo";

const LOGO_MAP: Record<string, LogoAssets> = {
  central: {
    light:    `${BASE}/logo_central/fond-blanc/png/centrale_b.png`,
    dark:     `${BASE}/logo_central/fond-pale/png/central.png`,
    lightSvg: `${BASE}/logo_central/fond-blanc/svg/centrale_b.svg`,
    darkSvg:  `${BASE}/logo_central/fond-pale/svg/centrale.svg`,
    favicon:  `${BASE}/logo_central/fond-blanc/favicon/favicon.ico`,
  },
  // "hub" = alias de central (landing page www.agt-bot.com)
  hub: {
    light:    `${BASE}/logo_central/fond-blanc/png/centrale_b.png`,
    dark:     `${BASE}/logo_central/fond-pale/png/central.png`,
    lightSvg: `${BASE}/logo_central/fond-blanc/svg/centrale_b.svg`,
    darkSvg:  `${BASE}/logo_central/fond-pale/svg/centrale.svg`,
    favicon:  `${BASE}/logo_central/fond-blanc/favicon/favicon.ico`,
  },
  restaurant: {
    light:    `${BASE}/logo_restaurant/fond-blanc/png/restaurant_b.png`,
    dark:     `${BASE}/logo_restaurant/fond-pale/png/restaurant.png`,
    lightSvg: `${BASE}/logo_restaurant/fond-blanc/svg/restaurant_b.svg`,
    darkSvg:  `${BASE}/logo_restaurant/fond-pale/svg/restaurant.svg`,
    favicon:  `${BASE}/logo_restaurant/fond-blanc/favicon/favicon.ico`,
  },
  pme: {
    light:    `${BASE}/logo_pme_et_entreprises/fond-blanc/png/pme_entreprises_b.png`,
    dark:     `${BASE}/logo_pme_et_entreprises/fond-pale/png/pme_entreprises.png`,
    lightSvg: `${BASE}/logo_pme_et_entreprises/fond-blanc/svg/pme_entreprises_b.svg`,
    darkSvg:  `${BASE}/logo_pme_et_entreprises/fond-pale/svg/pme_entreprises.svg`,
    favicon:  `${BASE}/logo_pme_et_entreprises/fond-blanc/favicon/favicon.ico`,
  },
  banking: {
    light:    `${BASE}/logo_banque/fond-blanc/png/banque_b.png`,
    dark:     `${BASE}/logo_banque/fond-pale/png/banque.png`,
    lightSvg: `${BASE}/logo_banque/fond-blanc/svg/banque_b.svg`,
    darkSvg:  `${BASE}/logo_banque/fond-pale/svg/banque.svg`,
    favicon:  `${BASE}/logo_banque/fond-blanc/favicon/favicon.ico`,
  },
  clinique: {
    light:    `${BASE}/logo_sante/fond-blanc/png/sante_b.png`,
    dark:     `${BASE}/logo_sante/fond-pale/png/sante.png`,
    lightSvg: `${BASE}/logo_sante/fond-blanc/svg/sante_b.svg`,
    darkSvg:  `${BASE}/logo_sante/fond-pale/svg/sante.svg`,
    favicon:  `${BASE}/logo_sante/fond-blanc/favicon/favicon.ico`,
  },
  ecole: {
    light:    `${BASE}/logo_education/fond-blanc/png/education_b.png`,
    dark:     `${BASE}/logo_education/fond-pale/png/education.png`,
    lightSvg: `${BASE}/logo_education/fond-blanc/svg/education_b.svg`,
    darkSvg:  `${BASE}/logo_education/fond-pale/svg/education.svg`,
    favicon:  `${BASE}/logo_education/fond-blanc/favicon/favicon.ico`,
  },
  ecommerce: {
    light:    `${BASE}/logo_e-commerce/fond-blanc/png/e-commerce_b.png`,
    dark:     `${BASE}/logo_e-commerce/fond-pale/png/e-commerce.png`,
    lightSvg: `${BASE}/logo_e-commerce/fond-blanc/svg/e-commerce_b.svg`,
    darkSvg:  `${BASE}/logo_e-commerce/fond-pale/svg/e-commerce.svg`,
    favicon:  `${BASE}/logo_e-commerce/fond-blanc/favicon/favicon.ico`,
  },
  hotel: {
    light:    `${BASE}/logo_hotel/fond-blanc/png/hotel_b.png`,
    dark:     `${BASE}/logo_hotel/fond-pale/png/hotel.png`,
    lightSvg: `${BASE}/logo_hotel/fond-blanc/svg/hotel_b.svg`,
    darkSvg:  `${BASE}/logo_hotel/fond-pale/svg/hotel.svg`,
    favicon:  `${BASE}/logo_hotel/fond-blanc/favicon/favicon.ico`,
  },
  public: {
    light:    `${BASE}/logo_secteur_public/fond-blanc/png/secteur_public_b.png`,
    dark:     `${BASE}/logo_secteur_public/fond-pale/png/secteur_public.png`,
    lightSvg: `${BASE}/logo_secteur_public/fond-blanc/svg/secteur_public_b.svg`,
    darkSvg:  `${BASE}/logo_secteur_public/fond-pale/svg/secteur_public.svg`,
    favicon:  `${BASE}/logo_secteur_public/fond-blanc/favicon/favicon.ico`,
  },
  voyage: {
    light:    `${BASE}/logo_transport/fond-blanc/png/transport_b.png`,
    dark:     `${BASE}/logo_transport/fond-pale/png/transport.png`,
    lightSvg: `${BASE}/logo_transport/fond-blanc/svg/transport_b.svg`,
    darkSvg:  `${BASE}/logo_transport/fond-pale/svg/transport.svg`,
    favicon:  `${BASE}/logo_transport/fond-blanc/favicon/favicon.ico`,
  },
  personnalise: {
    light:    `${BASE}/logo_personnalise/fond-blanc/png/personnalise_b.png`,
    dark:     `${BASE}/logo_personnalise/fond-pale/png/personnalise.png`,
    lightSvg: `${BASE}/logo_personnalise/fond-blanc/svg/personnalise_b.svg`,
    darkSvg:  `${BASE}/logo_personnalise/fond-pale/svg/personnalise.svg`,
    favicon:  `${BASE}/logo_personnalise/fond-blanc/favicon/favicon.ico`,
  },
};

/**
 * Retourne les assets logo pour un secteur donné.
 * Fallback sur "central" si le secteur est inconnu.
 */
export function getLogoAssets(sector: string): LogoAssets {
  return LOGO_MAP[sector] ?? LOGO_MAP.central;
}

export { LOGO_MAP };