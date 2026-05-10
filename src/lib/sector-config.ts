// src/lib/sector-config.ts
// SOURCE DE VÉRITÉ — Détection et persistance du secteur courant
// Ordre de résolution : env (build) > localStorage > sous-domaine > 'central'

// ── Type & liste exhaustive ──────────────────────────────────────────────────
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

export const SECTORS: readonly SectorSlug[] = [
  'pme', 'banking', 'clinical', 'school', 'ecommerce',
  'hotel', 'public', 'restaurant', 'transport', 'custom', 'central',
] as const;

// ── Validation ───────────────────────────────────────────────────────────────
export function isValidSector(value: unknown): value is SectorSlug {
  return typeof value === 'string' && (SECTORS as readonly string[]).includes(value);
}

// ── Mapping sous-domaine → secteur (fallback dev local) ──────────────────────
const SUBDOMAIN_MAP: Record<string, SectorSlug> = {
  pme:          'pme',
  banking:      'banking',
  clinical:     'clinical',
  school:       'school',
  'e-commerce': 'ecommerce',
  hotel:        'hotel',
  public:       'public',
  restaurant:   'restaurant',
  travell:      'transport',
  www:          'central',
};

// ── Persistance localStorage (BUG-020) ───────────────────────────────────────
export const SECTOR_STORAGE_KEY = 'agt_sector';

/**
 * Persiste le secteur choisi dans localStorage.
 * Appelé depuis le SectorPicker (avant auth) pour garantir
 * la cohérence visuelle des écrans non-authentifiés
 * (verify-email, pending, 404) sur le hub en dev.
 */
export function setStoredSector(slug: SectorSlug): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SECTOR_STORAGE_KEY, slug);
  } catch {
    /* localStorage indisponible (mode privé Safari, quota) — silencieux */
  }
}

/** Efface le secteur persisté. À appeler au logout si on quitte un secteur. */
export function clearStoredSector(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SECTOR_STORAGE_KEY);
  } catch {
    /* idem */
  }
}

/** Lit le secteur persisté en localStorage (validé). Null si absent ou invalide. */
function getStoredSector(): SectorSlug | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SECTOR_STORAGE_KEY);
    return isValidSector(raw) ? raw : null;
  } catch {
    return null;
  }
}

// ── Résolution du secteur courant ────────────────────────────────────────────
/**
 * Retourne le secteur courant.
 * Ordre de priorité :
 *   1. NEXT_PUBLIC_SECTOR (build prod — source absolue par sous-domaine)
 *   2. localStorage agt_sector (persistance dev / hub avant auth)
 *   3. Sous-domaine (fallback)
 *   4. 'central' (défaut absolu)
 */
export function getCurrentSector(): SectorSlug {
  // 1. Variable env baked au build
  const envSector = process.env.NEXT_PUBLIC_SECTOR;
  if (isValidSector(envSector)) return envSector;

  // 2. localStorage (BUG-020 — persistance avant auth)
  const stored = getStoredSector();
  if (stored) return stored;

  // 3. Sous-domaine
  if (typeof window !== 'undefined') {
    const subdomain = window.location.hostname.split('.')[0];
    const mapped = SUBDOMAIN_MAP[subdomain];
    if (mapped) return mapped;
  }

  // 4. Fallback absolu
  return 'central';
}

export { SUBDOMAIN_MAP };

// END OF FILE: src/lib/sector-config.ts