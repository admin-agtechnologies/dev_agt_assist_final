// src/repositories/features.repository.ts
// S27 : ajout MarketModule + mergeToMarketModules pour la marketplace modules.
import { api } from "@/lib/api-client";
import type { PaginatedResponse } from "@/types/api";

// ── Types de base ─────────────────────────────────────────────────────────────

export interface ActiveFeature {
  id: string;
  slug: string;
  nom_fr: string;
  nom_en?: string;
  description?: string;
  categorie?: string;
  icone?: string;
  is_active: boolean;
  is_desired: boolean;
  is_mandatory?: boolean;
  is_pinned?: boolean;
  used?: number | null;
  prix_unitaire?: number | null;
  quota?: number | null;
  is_unlimited?: boolean;
  included_in_plan?: boolean;
  config?: Record<string, unknown>;
}

export interface SectorFeature {
  id: string;
  slug: string;
  nom_fr: string;
  nom_en: string;
  icone: string;
  categorie: string;
  is_default: boolean;
  is_mandatory: boolean;
  quota_unitaire?: number;
  prix_unitaire?: number;
  description?: string;
}

// ── MarketModule — type enrichi pour la marketplace ───────────────────────────

export type ModuleStatus = "active" | "available" | "upgrade_required";

export interface MarketModule {
  slug: string;
  nom_fr: string;
  nom_en: string;
  description: string;
  icone: string;
  categorie: string;
  prix_unitaire: number;
  quota_unitaire: number;
  is_mandatory: boolean;
  // État tenant
  is_active: boolean;
  is_desired: boolean;
  is_pinned: boolean;
  is_unlimited: boolean;
  included_in_plan: boolean;
  used: number;
  quota: number | null;
  // Computed
  status: ModuleStatus;
  /** false si mandatory OU quota actif consommé (protection métier) */
  can_deactivate: boolean;
}

// ── Merge helper (sector catalog + tenant state) ───────────────────────────────

export function mergeToMarketModules(
  sectorFeatures: SectorFeature[],
  activeFeatures: ActiveFeature[],
): MarketModule[] {
  const activeMap = new Map(activeFeatures.map((f) => [f.slug, f]));

  return sectorFeatures.map((sf): MarketModule => {
    const af = activeMap.get(sf.slug);
    const is_active       = af?.is_active ?? false;
    const included_in_plan = af?.included_in_plan ?? (sf.prix_unitaire === 0);
    const used            = af?.used ?? 0;
    const quota           = af?.quota ?? null;
    const is_unlimited    = af?.is_unlimited ?? false;
    const is_mandatory    = sf.is_mandatory || (af?.is_mandatory ?? false);
    // Quota actif = utilisateur a consommé au moins 1 unité → désactivation bloquée
    const hasActiveUsage  = !is_unlimited && quota != null && quota > 0 && used > 0;

    let status: ModuleStatus;
    if (is_active) status = "active";
    else if (included_in_plan) status = "available";
    else status = "upgrade_required";

    return {
      slug:             sf.slug,
      nom_fr:           sf.nom_fr,
      nom_en:           sf.nom_en ?? sf.nom_fr,
      description:      af?.description ?? sf.description ?? "",
      icone:            af?.icone ?? sf.icone ?? "Zap",
      categorie:        sf.categorie,
      prix_unitaire:    sf.prix_unitaire ?? 0,
      quota_unitaire:   sf.quota_unitaire ?? 0,
      is_mandatory,
      is_active,
      is_desired:       af?.is_desired ?? false,
      is_pinned:        af?.is_pinned ?? false,
      is_unlimited,
      included_in_plan,
      used,
      quota,
      status,
      can_deactivate:   !is_mandatory && !hasActiveUsage,
    };
  });
}

// ── Réponses API ──────────────────────────────────────────────────────────────

export interface ActiveFeaturesResponse { features: ActiveFeature[]; count?: number; }
export interface ToggleFeatureResponse  { slug: string; is_active: boolean; updated_at: string; }
export interface PinFeatureResponse     { slug: string; is_pinned: boolean; updated_at: string; }

const normalize = (data: unknown): ActiveFeaturesResponse => {
  if (Array.isArray(data)) return { features: data as ActiveFeature[] };
  const d = data as PaginatedResponse<ActiveFeature> | ActiveFeaturesResponse;
  if ("features" in d) return d as ActiveFeaturesResponse;
  return { features: (d as PaginatedResponse<ActiveFeature>).results ?? [] };
};

// ── Repository ────────────────────────────────────────────────────────────────

export const featuresRepository = {
  getActive: (): Promise<ActiveFeaturesResponse> =>
    api.get("/api/v1/features/active/").then(normalize).catch(() => ({ features: [] })),

  getDesired: (): Promise<ActiveFeaturesResponse> =>
    api.get("/api/v1/features/desired/").then(normalize).catch(() => ({ features: [] })),

  getSectorFeatures: (sectorSlug: string): Promise<SectorFeature[]> =>
    api
      .get(`/api/v1/features/by-sector/?sector=${sectorSlug}`)
      .then((d: unknown) => (d as { features?: SectorFeature[] }).features ?? [])
      .catch(() => []),

  toggle: (slug: string, is_active: boolean): Promise<ToggleFeatureResponse> =>
    api.post(`/api/v1/features/${slug}/toggle/`, { is_active }),

  pin: (slug: string): Promise<PinFeatureResponse> =>
    api.post(`/api/v1/features/${slug}/pin/`, {}),

  /** Marque une liste de slugs comme "désirés" (sans les activer). */
  markDesired: (slugs: string[]): Promise<unknown> =>
    api.post("/api/v1/features/mark-desired/", { feature_slugs: slugs }),
};