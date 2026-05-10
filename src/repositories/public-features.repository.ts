// ============================================================
// FICHIER : src/repositories/public-features.repository.ts
// Endpoint public — pas de token JWT requis
// ============================================================

export interface PublicFeature {
  slug:         string;
  nom_fr:       string;
  nom_en:       string;
  icone:        string;
  categorie:    string;
  is_mandatory: boolean;
  recommended:  boolean;  // is_default côté backend
}

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function getBySector(sectorSlug: string): Promise<PublicFeature[]> {
  if (!sectorSlug) return [];

  const res = await fetch(
    `${BASE}/api/v1/features/by-sector/?sector=${encodeURIComponent(sectorSlug)}`,
    { cache: "no-store" },
  );

  if (!res.ok) {
    throw new Error(`[publicFeatures] ${res.status} pour secteur "${sectorSlug}"`);
  }

  const data: { features: PublicFeature[]; count: number } = await res.json();
  return data.features ?? [];
}

export const publicFeaturesRepository = { getBySector };