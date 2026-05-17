// src/components/billing/QuotaProgressSection.tsx
// C4 — S31 (stephane)
// Affiche la progression de consommation de tous les modules actifs du tenant.
// Deux sections séparées :
//   - Inclus dans le plan (quota_est_mensuel=True, quota_total > 0)
//   - Modules additionnels (quota_est_mensuel=False, quota_total > 0)
//   - Modules illimités (quota_total=0) → label "Illimité"
// Réutilise UsageBar pour la cohérence visuelle avec BillingHeader.
"use client";
import { UsageBar } from "@/components/ui";
import { Infinity, Package, LayoutGrid } from "lucide-react";
import { useSector } from "@/hooks/useSector";
import type { ActiveFeature } from "@/repositories/features.repository";

interface Props {
  features: ActiveFeature[];
}

// Couleur de la barre selon le niveau de consommation
function barColor(pct: number): string {
  if (pct >= 90) return "#EF4444"; // rouge
  if (pct >= 70) return "#F59E0B"; // orange
  return "#25D366";                // vert
}

function calcPct(consomme: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(Math.round((consomme / total) * 100), 100);
}

// Détermine si un module est illimité
function isUnlimited(f: ActiveFeature): boolean {
  return (f.quota_total === 0 || f.quota_total == null) && !f.quota_est_mensuel;
}

export function QuotaProgressSection({ features }: Props) {
  const { theme } = useSector();

  if (!features || features.length === 0) return null;

  // Modules illimités — affichés dans les deux sections si pertinent
  const unlimited = features.filter(isUnlimited);

  // Famille A — inclus dans le plan, quota mensuel
  const planModules = features.filter(
    (f) => f.quota_est_mensuel === true && (f.quota_total ?? 0) > 0,
  );

  // Famille B — achetés ponctuellement, pas de reset mensuel
  const addonModules = features.filter(
    (f) => f.quota_est_mensuel === false && (f.quota_total ?? 0) > 0,
  );

  // Rien à afficher
  if (planModules.length === 0 && addonModules.length === 0 && unlimited.length === 0) {
    return null;
  }

  return (
    <div className="card p-6 space-y-6">

      {/* ── En-tête ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${theme.primary}18` }}
        >
          <LayoutGrid className="w-4 h-4" style={{ color: theme.primary }} />
        </div>
        <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">
          Consommation des modules
        </p>
      </div>

      {/* ── Section 1 — Inclus dans le plan ──────────────────────────────── */}
      {(planModules.length > 0 || unlimited.filter(f => f.quota_est_mensuel).length > 0) && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Package className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
              Inclus dans votre plan
            </p>
          </div>

          {planModules.map((f) => {
            const consomme = f.quota_consomme ?? 0;
            const total    = f.quota_total    ?? 0;
            const pct      = calcPct(consomme, total);
            return (
              <UsageBar
                key={f.slug}
                label={f.nom_fr ?? f.slug}
                used={consomme}
                total={total}
                pct={pct}
                color={barColor(pct)}
                unlimited={false}
              />
            );
          })}

          {/* Modules illimités du plan */}
          {features
            .filter((f) => f.quota_est_mensuel === true && (f.quota_total === 0 || f.quota_total == null))
            .map((f) => (
              <div
                key={f.slug}
                className="flex items-center justify-between py-1"
              >
                <p className="text-xs font-medium text-[var(--text-muted)]">
                  {f.nom_fr ?? f.slug}
                </p>
                <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                  <Infinity className="w-3.5 h-3.5" />
                  <span>Illimité</span>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Séparateur si les deux sections sont présentes */}
      {planModules.length > 0 && addonModules.length > 0 && (
        <div className="border-t border-[var(--border)]" />
      )}

      {/* ── Section 2 — Modules additionnels ─────────────────────────────── */}
      {addonModules.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Package className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
              Modules additionnels
            </p>
            <span className="text-[10px] text-[var(--text-muted)] font-normal">
              — quota acheté, rechargeable à tout moment
            </span>
          </div>

          {addonModules.map((f) => {
            const consomme = f.quota_consomme ?? 0;
            const total    = f.quota_total    ?? 0;
            const pct      = calcPct(consomme, total);
            return (
              <UsageBar
                key={f.slug}
                label={f.nom_fr ?? f.slug}
                used={consomme}
                total={total}
                pct={pct}
                color={barColor(pct)}
                unlimited={false}
              />
            );
          })}
        </div>
      )}

      {/* ── Modules illimités hors plan (Famille B illimitée) ────────────── */}
      {unlimited.filter(f => !f.quota_est_mensuel).length > 0 && (
        <div className="space-y-2 pt-1 border-t border-[var(--border)]">
          {unlimited
            .filter(f => !f.quota_est_mensuel)
            .map((f) => (
              <div
                key={f.slug}
                className="flex items-center justify-between py-1"
              >
                <p className="text-xs font-medium text-[var(--text-muted)]">
                  {f.nom_fr ?? f.slug}
                </p>
                <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                  <Infinity className="w-3.5 h-3.5" />
                  <span>Illimité</span>
                </div>
              </div>
            ))}
        </div>
      )}

    </div>
  );
}