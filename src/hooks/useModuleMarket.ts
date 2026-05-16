// src/hooks/useModuleMarket.ts
// S28 (donpk) :
//   - Catalogue global : charge by-sector/ (toutes features) + active/ + desired/
//   - desired/ chargé séparément pour corriger l'onglet "En attente"
//   - CartItem enrichi avec quantite (choix de quota)
//   - Suppression du pin
"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useSector } from "@/hooks/useSector";
import { api } from "@/lib/api-client";
import {
  featuresRepository,
  mergeToMarketModules,
  type MarketModule,
  type PurchasePayload,
  type PurchaseResponse,
} from "@/repositories/features.repository";
import type { Plan } from "@/types/api";

// ── Types publics ─────────────────────────────────────────────────────────────

export type FilterTab = "all" | "active" | "desired" | "available" | "upgrade";

export interface CartItem {
  slug: string;
  nom_fr: string;
  prix_unitaire: number;   // prix par unité de quota
  quota_unitaire: number;  // quota par unité achetée
  quantite: number;        // nombre d'unités choisies par l'utilisateur
}

export interface PlanRecommendation {
  plan: Plan;
  coveredSlugs: string[];
  cartTotal: number;
  saving: number;
}

const PAGE_SIZE = 9;

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useModuleMarket() {
  const { sector } = useSector();

  // ── Data ──────────────────────────────────────────────────────────────────
  const [modules, setModules] = useState<MarketModule[]>([]);
  const [plans, setPlans]     = useState<Plan[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  // ── Filtres ───────────────────────────────────────────────────────────────
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [search, setSearch]             = useState("");
  const [page, setPage]                 = useState(1);

  // ── Panier ────────────────────────────────────────────────────────────────
  const [cart, setCart]                 = useState<CartItem[]>([]);
  const [isCheckingOut, setCheckingOut] = useState(false);
  const [showRecommendation, setShowRecommendation] = useState(true);

  // ── Chargement ────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    if (!sector) return;
    setLoading(true);
    setError(null);
    try {
      // Catalogue global + état tenant (active + desired) en parallèle
      const [sectorRes, activeRes, desiredRes, plansRaw] = await Promise.all([
        featuresRepository.getSectorFeatures(sector),
        featuresRepository.getActive(),
        featuresRepository.getDesired(),
        api.get<Plan[] | { results: Plan[] }>("/api/v1/billing/plans/").catch(() => []),
      ]);

      const planList: Plan[] = Array.isArray(plansRaw)
        ? (plansRaw as Plan[])
        : ((plansRaw as { results?: Plan[] }).results ?? []);

      setModules(
        mergeToMarketModules(sectorRes, activeRes.features, desiredRes.features),
      );
      setPlans(planList.filter((p) => p.is_active));
    } catch {
      setError("Impossible de charger les modules.");
    } finally {
      setLoading(false);
    }
  }, [sector]);

  useEffect(() => { load(); }, [load]);

  // ── Filtrage + recherche ──────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let result = modules;
    switch (activeFilter) {
      case "active":
        result = result.filter((m) => m.is_active);
        break;
      case "desired":
        // "En attente" = voulu à l'inscription mais pas encore actif
        result = result.filter((m) => m.is_desired && !m.is_active);
        break;
      case "available":
        // "À activer" = inclus dans le plan mais pas encore activé
        result = result.filter((m) => m.status === "available");
        break;
      case "upgrade":
        // "Booster" = hors plan (non activé) OU actif avec quota consommable
        result = result.filter(
          (m) => m.status === "upgrade_required" ||
                 (m.is_active && !m.is_unlimited && m.quota != null),
        );
        break;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.nom_fr.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q),
      );
    }
    return result;
  }, [modules, activeFilter, search]);

  useEffect(() => { setPage(1); }, [activeFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const counts = useMemo(() => ({
    all:       modules.length,
    active:    modules.filter((m) => m.is_active).length,
    desired:   modules.filter((m) => m.is_desired && !m.is_active).length,
    available: modules.filter((m) => m.status === "available").length,
    upgrade:   modules.filter(
      (m) => m.status === "upgrade_required" ||
             (m.is_active && !m.is_unlimited && m.quota != null),
    ).length,
  }), [modules]);

  // ── Panier ────────────────────────────────────────────────────────────────

  const cartTotal = useMemo(
    () => cart.reduce((s, c) => s + c.prix_unitaire * c.quantite, 0),
    [cart],
  );

  const isInCart = useCallback(
    (slug: string) => cart.some((c) => c.slug === slug),
    [cart],
  );

  const addToCart = useCallback((m: MarketModule) => {
    setCart((prev) =>
      prev.some((c) => c.slug === m.slug)
        ? prev
        : [
            ...prev,
            {
              slug:          m.slug,
              nom_fr:        m.nom_fr,
              prix_unitaire: m.prix_unitaire,
              quota_unitaire: m.quota_unitaire,
              quantite:      1,
            },
          ],
    );
    setShowRecommendation(true);
  }, []);

  const removeFromCart = useCallback((slug: string) => {
    setCart((prev) => prev.filter((c) => c.slug !== slug));
  }, []);

  const updateQuantite = useCallback((slug: string, quantite: number) => {
    if (quantite < 1) return;
    setCart((prev) =>
      prev.map((c) => (c.slug === slug ? { ...c, quantite } : c)),
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  // ── Recommandation de plan ────────────────────────────────────────────────

  const recommendation = useMemo((): PlanRecommendation | null => {
    if (!showRecommendation || cart.length === 0 || plans.length === 0) return null;

    const interestSlugs = new Set([
      ...modules.filter((m) => m.is_desired).map((m) => m.slug),
      ...cart.map((c) => c.slug),
    ]);

    let best: PlanRecommendation | null = null;

    for (const plan of plans) {
      const coveredSlugs = [...interestSlugs].filter((slug) =>
        plan.features.some((f) =>
          f.toLowerCase().includes(slug.replace(/_/g, " ").split("_")[0].toLowerCase()),
        ),
      );
      if (coveredSlugs.length === 0) continue;
      const saving = cartTotal - plan.prix;
      if (saving <= 0) continue;
      if (!best || saving > best.saving) {
        best = { plan, coveredSlugs, cartTotal, saving };
      }
    }
    return best;
  }, [showRecommendation, cart, plans, modules, cartTotal]);

  // ── Builder payload purchase ──────────────────────────────────────────────

  const buildPurchasePayload = useCallback(
    (planSlug: string): PurchasePayload => ({
      plan_slug: planSlug,
      modules: cart.map((c) => ({ slug: c.slug, quantite: c.quantite })),
    }),
    [cart],
  );

  return {
    // Data
    modules: paginated,
    allModules: modules,
    isLoading,
    error,
    reload: load,
    // Filtres
    activeFilter, setActiveFilter,
    search, setSearch,
    page, setPage,
    totalPages,
    counts,
    // Panier
    cart,
    cartTotal,
    isInCart,
    addToCart,
    removeFromCart,
    updateQuantite,
    clearCart,
    isCheckingOut,
    setCheckingOut,
    buildPurchasePayload,
    // Recommandation
    recommendation,
    dismissRecommendation: () => setShowRecommendation(false),
    plans,
  };
}