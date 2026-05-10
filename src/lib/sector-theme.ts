// src/lib/sector-theme.ts
// SOURCE DE VÉRITÉ — Thèmes visuels et features par défaut, par secteur.
//
// Convention :
//   - primary  : couleur sobre/foncée (fonds, headers, dashboards)
//   - accent   : couleur vive alignée sur le logo sectoriel (CTA, boutons, badges)
//   - bg       : fond clair sectoriel
//   - label    : libellé FR (rétrocompat avec SectorBadge / dashboard)
//   - labelFr  : libellé FR (explicite, nouveau)
//   - labelEn  : libellé EN (nouveau)
//   - defaultFeatures : features pré-cochées à l'onboarding
//
// Le hook useSector() canonique est dans src/hooks/useSector.ts.

import type { SectorSlug } from './sector-config';

export interface SectorTheme {
  primary: string;
  accent: string;
  bg: string;
  /** @deprecated utiliser labelFr / labelEn — gardé pour rétrocompat */
  label: string;
  labelFr: string;
  labelEn: string;
  defaultFeatures: string[];
}

export const SECTOR_THEMES: Record<SectorSlug, SectorTheme> = {
  hotel: {
    primary: '#1A3C5E', accent: '#C9A84C', bg: '#F8F6F0',
    label: 'Hôtel', labelFr: 'Hôtel', labelEn: 'Hotel',
    defaultFeatures: ['reservation_chambre', 'conciergerie', 'catalogue_services', 'multi_agences'],
  },
  restaurant: {
    primary: '#8B1A1A', accent: '#E8A020', bg: '#FDF8F4',
    label: 'Restaurant', labelFr: 'Restaurant', labelEn: 'Restaurant',
    defaultFeatures: ['reservation_table', 'menu_digital', 'commande_paiement'],
  },
  clinical: {
    primary: '#0077B6', accent: '#00B4D8', bg: '#F0F8FF',
    label: 'Santé & Hôpitaux', labelFr: 'Santé & Hôpitaux', labelEn: 'Health & Hospitals',
    defaultFeatures: ['prise_rdv', 'orientation_patient', 'catalogue_services', 'multi_agences'],
  },
  banking: {
    primary: '#1B4332', accent: '#1B7B47', bg: '#F0FAF4',
    label: 'Banque & Microfinance', labelFr: 'Banque & Microfinance', labelEn: 'Banking & Microfinance',
    defaultFeatures: ['prise_rdv', 'catalogue_produits_financiers', 'multi_agences', 'conversion_prospects'],
  },
  school: {
    primary: '#3A0CA3', accent: '#6D28D9', bg: '#F8F0FF',
    label: 'Éducation', labelFr: 'Éducation', labelEn: 'Education',
    defaultFeatures: ['inscription_admission', 'prise_rdv', 'communication_etablissement', 'catalogue_services'],
  },
  ecommerce: {
    primary: '#E63946', accent: '#E63946', bg: '#FFF5F5',
    label: 'E-commerce', labelFr: 'E-commerce', labelEn: 'E-commerce',
    defaultFeatures: ['catalogue_produits', 'commande_paiement', 'suivi_commande', 'conversion_prospects'],
  },
  transport: {
    primary: '#023E8A', accent: '#0EA5E9', bg: '#F0F8FF',
    label: 'Transport', labelFr: 'Transport', labelEn: 'Transport',
    defaultFeatures: ['reservation_billet', 'catalogue_trajets', 'suivi_commande'],
  },
  pme: {
    primary: '#075E54', accent: '#10B981', bg: '#F0FAF5',
    label: 'PME & Entreprises', labelFr: 'PME & Entreprises', labelEn: 'SMEs & Businesses',
    defaultFeatures: ['prise_rdv', 'catalogue_services', 'multi_agences', 'conversion_prospects'],
  },
  public: {
    primary: '#2D3561', accent: '#DC2626', bg: '#F5F7FF',
    label: 'Secteur Public', labelFr: 'Secteur Public', labelEn: 'Public Sector',
    defaultFeatures: ['orientation_citoyens', 'prise_rdv', 'multi_agences'],
  },
  custom: {
    primary: '#374151', accent: '#64748B', bg: '#F9FAFB',
    label: 'Personnalisé', labelFr: 'Personnalisé', labelEn: 'Custom',
    defaultFeatures: [],
  },
  // Hub central — partage le thème vert AGT/PME (décision Gabriel session 5).
  // Note dette : logo central actuel est bleu/cyan, à refaire en vert pour cohérence.
  central: {
    primary: '#075E54', accent: '#25D366', bg: '#F0FAF5',
    label: 'AGT Platform', labelFr: 'AGT Platform', labelEn: 'AGT Platform',
    defaultFeatures: [],
  },
};

/** Helper de lecture — fallback central si slug inconnu. */
export function getSectorTheme(sector: SectorSlug): SectorTheme {
  return SECTOR_THEMES[sector] ?? SECTOR_THEMES.central;
}

// END OF FILE: src/lib/sector-theme.ts