// src/hooks/useModuleMarket.ts
// Hook d'état central pour la marketplace modules (S27).
// Gère : chargement, filtres, recherche, pagination, panier, recommandation plan.
"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useSector } from "@/hooks/useSector";
import { api } from "@/lib/api-client";
import {
  featuresRepository,
  mergeToMarketModules,
  type MarketModule,
} from "@/repositories/features.repository";
import type { Plan } from "@/types/api";

// ── Types publics ─────────────────────────────────────────────────────────────

export type FilterTab = "all" | "active" | "desired" | "available" | "upgrade";

export interface CartItem {
  slug: string;
  nom_fr: string;
  prix_unitaire: number;
}

export interface PlanRecommendation {
  plan: Plan;
  /** Slugs du panier couverts par ce plan */
  coveredSlugs: string[];
  /** Coût total si achat à la pièce */
  cartTotal: number;
  /** Économie mensuelle estimée */
  saving: number;
}

const PAGE_SIZE = 9;

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useModuleMarket() {
  const { sector } = useSector();

  // ── Data ──────────────────────────────────────────────────────────────────
  const [modules, setModules]   = useState<MarketModule[]>([]);
  const [plans, setPlans]       = useState<Plan[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError]       = useState<string | null>(null);

  // ── Filtres ───────────────────────────────────────────────────────────────
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [search, setSearch]             = useState("");
  const [page, setPage]                 = useState(1);

  // ── Panier ────────────────────────────────────────────────────────────────
  const [cart, setCart]               = useState<CartItem[]>([]);
  const [isCheckingOut, setCheckingOut] = useState(false);
  const [showRecommendation, setShowRecommendation] = useState(true);

  // ── Chargement ────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    if (!sector) return;
    setLoading(true);
    setError(null);
    try {
      const [sectorRes, activeRes, plansRaw] = await Promise.all([
        featuresRepository.getSectorFeatures(sector),
        featuresRepository.getActive(),
        api.get<Plan[] | { results: Plan[] }>("/api/v1/billing/plans/").catch(() => []),
      ]);

      const planList: Plan[] = Array.isArray(plansRaw)
        ? (plansRaw as Plan[])
        : ((plansRaw as { results?: Plan[] }).results ?? []);

      setModules(mergeToMarketModules(sectorRes, activeRes.features));
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
      case "active":    result = result.filter((m) => m.is_active);                       break;
      case "desired": result = result.filter((m) => m.is_desired && !m.is_active); break;
      case "available": result = result.filter((m) => m.status === "available");           break;
      case "upgrade":   result = result.filter((m) => m.status === "upgrade_required");   break;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) => m.nom_fr.toLowerCase().includes(q) || m.description.toLowerCase().includes(q),
      );
    }
    return result;
  }, [modules, activeFilter, search]);

  // Reset page dès que filtre ou recherche change
  useEffect(() => { setPage(1); }, [activeFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const counts = useMemo(() => ({
    all:       modules.length,
    active:    modules.filter((m) => m.is_active).length,
    desired:   modules.filter((m) => m.is_desired).length,
    available: modules.filter((m) => m.status === "available").length,
    upgrade:   modules.filter((m) => m.status === "upgrade_required").length,
  }), [modules]);

  // ── Panier ────────────────────────────────────────────────────────────────

  const cartTotal = useMemo(() => cart.reduce((s, c) => s + c.prix_unitaire, 0), [cart]);
  const isInCart  = useCallback((slug: string) => cart.some((c) => c.slug === slug), [cart]);

  const addToCart = useCallback((m: MarketModule) => {
    setCart((prev) => prev.some((c) => c.slug === m.slug)
      ? prev
      : [...prev, { slug: m.slug, nom_fr: m.nom_fr, prix_unitaire: m.prix_unitaire }],
    );
    setShowRecommendation(true);
  }, []);

  const removeFromCart = useCallback((slug: string) => {
    setCart((prev) => prev.filter((c) => c.slug !== slug));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  // ── Recommandation de plan enrichie ───────────────────────────────────────
  // Tient compte : modules actifs + désirés + panier.
  // Trouve le plan qui couvre le maximum de modules "d'intérêt" pour un coût
  // inférieur au total panier (économie réelle).

  const recommendation = useMemo((): PlanRecommendation | null => {
    if (!showRecommendation || cart.length === 0 || plans.length === 0) return null;

    // Union des slugs "d'intérêt" : désirés + panier
    const interestSlugs = new Set([
      ...modules.filter((m) => m.is_desired).map((m) => m.slug),
      ...cart.map((c) => c.slug),
    ]);

    let best: PlanRecommendation | null = null;

    for (const plan of plans) {
      // Couverture approximative : plan.features contient des textes descriptifs.
      // On fait un match partiel slug → label (premier mot, insensible à la casse).
      const coveredSlugs = [...interestSlugs].filter((slug) =>
        plan.features.some((f) =>
          f.toLowerCase().includes(slug.replace(/_/g, " ").split("_")[0].toLowerCase()),
        ),
      );

      if (coveredSlugs.length === 0) continue;

      // L'économie est réelle seulement si le plan coûte moins que les achats à la pièce
      const saving = cartTotal - plan.prix;
      if (saving <= 0) continue;

      if (!best || saving > best.saving) {
        best = { plan, coveredSlugs, cartTotal, saving };
      }
    }
    return best;
  }, [showRecommendation, cart, plans, modules, cartTotal]);

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
    clearCart,
    isCheckingOut,
    setCheckingOut,
    // Recommandation
    recommendation,
    dismissRecommendation: () => setShowRecommendation(false),
    plans,
  };
}