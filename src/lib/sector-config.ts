// src/lib/sector-config.ts
// Détection du secteur courant — priorité env var, fallback sous-domaine

export type SectorSlug =
  | 'pme'
  | 'banking'
  | 'clinical'
  | 'school'
  | 'ecommerce'
  | 'hotel'
  | 'public'
  | 'restaurant'
  | 'transport'
  | 'custom'
  | 'central';

const SUBDOMAIN_MAP: Record<string, SectorSlug> = {
  pme: 'pme',
  banking: 'banking',
  clinical: 'clinical',
  school: 'school',
  'e-commerce': 'ecommerce',
  hotel: 'hotel',
  public: 'public',
  restaurant: 'restaurant',
  travell: 'transport',
  www: 'central',
};

export function getCurrentSector(): SectorSlug {
  const envSector = process.env.NEXT_PUBLIC_SECTOR as SectorSlug | undefined;
  if (envSector && envSector.length > 0) return envSector;

  if (typeof window !== 'undefined') {
    const subdomain = window.location.hostname.split('.')[0];
    return SUBDOMAIN_MAP[subdomain] ?? 'custom';
  }

  return 'central';
}

export { SUBDOMAIN_MAP };