// src/components/modules/ModuleMarketplace.tsx
// Orchestrateur de la marketplace modules (S27).
// Assemble : filtres, grille de cartes, panier flottant, checkout, recommandation plan.
"use client";
import { useState } from "react";
import { ShoppingCart, RefreshCw, AlertTriangle, Package } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSector } from "@/hooks/useSector";
import { useModuleMarket } from "@/hooks/useModuleMarket";
import { PageHeader, Spinner } from "@/components/ui";
import { ModuleFilters } from "./ModuleFilters";
import { ModuleCard } from "./ModuleCard";
import { ModuleCartPanel } from "./ModuleCartPanel";
import { ModuleCartCheckout } from "./ModuleCartCheckout";
import { PlanRecommendationBanner } from "./PlanRecommendationBanner";
import { cn } from "@/lib/utils";

// ── Composant pagination ──────────────────────────────────────────────────────

function Pagination({
  page, total, onChange, primaryColor,
}: { page: number; total: number; onChange: (p: number) => void; primaryColor: string }) {
  if (total <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--border)] text-[var(--text-muted)] disabled:opacity-40 hover:bg-[var(--border)] transition-colors"
      >
        ←
      </button>
      {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={cn(
            "w-8 h-8 rounded-lg text-xs font-bold transition-colors",
            p === page ? "text-white" : "text-[var(--text-muted)] hover:bg-[var(--border)]",
          )}
          style={p === page ? { backgroundColor: primaryColor } : {}}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === total}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--border)] text-[var(--text-muted)] disabled:opacity-40 hover:bg-[var(--border)] transition-colors"
      >
        →
      </button>
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────

export function ModuleMarketplace() {
  const { locale } = useLanguage();
  const { theme }  = useSector();
  const primary    = theme.primary;

  const {
    modules, allModules, isLoading, error, reload,
    activeFilter, setActiveFilter,
    search, setSearch,
    page, setPage, totalPages,
    counts,
    cart, cartTotal, isInCart, addToCart, removeFromCart, clearCart,
    isCheckingOut, setCheckingOut,
    recommendation, dismissRecommendation,
  } = useModuleMarket();

  const [cartOpen, setCartOpen] = useState(false);

  // ── Rendu states ──────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 min-h-[40vh] text-center">
        <AlertTriangle className="w-8 h-8 text-[var(--text-muted)]" />
        <p className="text-sm text-[var(--text-muted)]">{error}</p>
        <button onClick={reload} className="btn-primary flex items-center gap-1.5 text-xs">
          <RefreshCw className="w-3.5 h-3.5" />
          {locale === "fr" ? "Réessayer" : "Retry"}
        </button>
      </div>
    );
  }

  // ── Rendu principal ───────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-fade-in pb-20">

      {/* ── En-tête ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <PageHeader
          title={locale === "fr" ? "Mes modules" : "My modules"}
          subtitle={
            locale === "fr"
              ? "Découvrez, activez et gérez les modules de votre assistant."
              : "Discover, activate and manage your assistant modules."
          }
        />

        {/* Bouton panier flottant (si items) */}
        {cart.length > 0 && (
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-100"
            style={{ backgroundColor: primary }}
          >
            <ShoppingCart className="w-4 h-4" />
            {locale === "fr" ? "Ma sélection" : "My selection"}
            <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white text-[10px] font-black flex items-center justify-center shadow" style={{ color: primary }}>
              {cart.length}
            </span>
          </button>
        )}
      </div>

      {/* ── Recommandation plan (si panier + économie réelle) ── */}
      {recommendation && (
        <PlanRecommendationBanner
          recommendation={recommendation}
          onDismiss={dismissRecommendation}
          locale={locale}
          primaryColor={primary}
        />
      )}

      {/* ── Filtres + recherche ── */}
      <ModuleFilters
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        search={search}
        onSearchChange={setSearch}
        counts={counts}
        locale={locale}
        primaryColor={primary}
        total={modules.length}
      />

      {/* ── Grille de cartes ── */}
      {modules.length === 0 ? (
        <div className="card flex flex-col items-center justify-center gap-3 py-16 text-center">
          <Package className="w-10 h-10 text-[var(--text-muted)]" />
          <p className="text-sm text-[var(--text-muted)]">
            {search
              ? (locale === "fr" ? `Aucun résultat pour « ${search} »` : `No results for "${search}"`)
              : (locale === "fr" ? "Aucun module dans cette catégorie." : "No modules in this category.")}
          </p>
          {search && (
            <button onClick={() => setSearch("")} className="text-xs font-semibold" style={{ color: primary }}>
              {locale === "fr" ? "Effacer la recherche" : "Clear search"}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((m) => (
            <ModuleCard
              key={m.slug}
              module={m}
              locale={locale}
              primaryColor={primary}
              isInCart={isInCart(m.slug)}
              onAddToCart={addToCart}
              onRemoveFromCart={removeFromCart}
              onChanged={reload}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      <Pagination page={page} total={totalPages} onChange={setPage} primaryColor={primary} />

      {/* ── Panier (drawer) ── */}
      <ModuleCartPanel
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        cartTotal={cartTotal}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
        onCheckout={() => setCheckingOut(true)}
        locale={locale}
        primaryColor={primary}
      />

      {/* ── Checkout (modal) ── */}
      <ModuleCartCheckout
        open={isCheckingOut}
        onClose={() => setCheckingOut(false)}
        cart={cart}
        allModules={allModules}
        cartTotal={cartTotal}
        onSuccess={() => { clearCart(); reload(); }}
        locale={locale}
        primaryColor={primary}
      />
    </div>
  );
}