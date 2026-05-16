// src/repositories/features.repository.ts
// S28 (donpk) :
//   - Catalogue global : getSectorFeatures retourne toutes les features avec is_native_sector
//   - Ajout purchase() → POST /features/purchase/
//   - Suppression pin() → fonctionnalité retirée
//   - MarketModule enrichi : is_native_sector, suppression is_pinned
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
  used?: number | null;
  prix_unitaire?: number | null;
  quota?: number | null;
  is_unlimited?: boolean;
  included_in_plan?: boolean;
  config?: Record<string, unknown>;
}

// SectorFeature = ce que retourne by-sector/ (catalogue global enrichi)
export interface SectorFeature {
  id: string;
  slug: string;
  nom_fr: string;
  nom_en: string;
  icone: string;
  categorie: string;
  description: string;
  is_native_sector: boolean;  // true = natif au secteur du tenant
  is_default: boolean;
  is_mandatory: boolean;
  quota_unitaire: number;
  prix_unitaire: number;
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
  is_native_sector: boolean;  // badge "Recommandé pour votre secteur"
  // État tenant
  is_active: boolean;
  is_desired: boolean;
  is_unlimited: boolean;
  included_in_plan: boolean;
  used: number;
  quota: number | null;
  // Computed
  status: ModuleStatus;
  can_deactivate: boolean;
}

// ── Payload purchase ──────────────────────────────────────────────────────────

export interface PurchaseModuleItem {
  slug: string;
  quantite: number;
}

export interface PurchasePayload {
  plan_slug: string;        // obligatoire
  modules: PurchaseModuleItem[];
}

export interface PurchaseLineResult {
  slug: string;
  nom_fr: string;
  quantite: number;
  quota_total: number;
  prix_ligne: string;
  included_in_plan: boolean;
  is_unlimited: boolean;
}

export interface PurchaseResponse {
  success: boolean;
  plan: string;
  plan_prix: string;
  modules_total: string;
  grand_total: string;
  solde_apres: string;
  activated: PurchaseLineResult[];
  included: PurchaseLineResult[];
}

// ── Merge helper (catalogue global + état tenant) ─────────────────────────────

export function mergeToMarketModules(
  sectorFeatures: SectorFeature[],
  activeFeatures: ActiveFeature[],
  desiredFeatures: ActiveFeature[],
): MarketModule[] {
  const activeMap  = new Map(activeFeatures.map((f) => [f.slug, f]));
  const desiredMap = new Map(desiredFeatures.map((f) => [f.slug, f]));

  return sectorFeatures.map((sf): MarketModule => {
    const af = activeMap.get(sf.slug);
    const df = desiredMap.get(sf.slug);

    const is_active        = af?.is_active ?? false;
    const included_in_plan = af?.included_in_plan ?? (sf.prix_unitaire === 0);
    const used             = af?.used ?? 0;
    const quota            = af?.quota ?? null;
    const is_unlimited     = af?.is_unlimited ?? false;
    const is_mandatory     = sf.is_mandatory || (af?.is_mandatory ?? false);
    // is_desired : priorité à active/, sinon desired/
    const is_desired       = af?.is_desired ?? df?.is_desired ?? false;
    const hasActiveUsage   = !is_unlimited && quota != null && quota > 0 && used > 0;

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
      is_native_sector: sf.is_native_sector,
      is_active,
      is_desired,
      is_unlimited,
      included_in_plan,
      used,
      quota,
      status,
      can_deactivate: !is_mandatory && !hasActiveUsage,
    };
  });
}

// ── Réponses API ──────────────────────────────────────────────────────────────

export interface ActiveFeaturesResponse { features: ActiveFeature[]; count?: number; }
export interface ToggleFeatureResponse  { slug: string; is_active: boolean; updated_at: string; }

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

  // Catalogue global enrichi — retourne TOUTES les features actives
  getSectorFeatures: (sectorSlug: string): Promise<SectorFeature[]> =>
    api
      .get(`/api/v1/features/by-sector/?sector=${sectorSlug}`)
      .then((d: unknown) => (d as { features?: SectorFeature[] }).features ?? [])
      .catch(() => []),

  toggle: (slug: string, is_active: boolean): Promise<ToggleFeatureResponse> =>
    api.post(`/api/v1/features/${slug}/toggle/`, { is_active }),

  // Achat sécurisé — plan obligatoire + modules optionnels avec quantités
  purchase: (payload: PurchasePayload): Promise<PurchaseResponse> =>
    api.post("/api/v1/features/purchase/", payload),

  markDesired: (slugs: string[]): Promise<{ marked: number }> =>
    api.post("/api/v1/features/mark-desired/", { feature_slugs: slugs }),

  // pin() supprimé — S28
};