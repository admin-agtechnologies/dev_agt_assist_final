"use client";
// ============================================================
// FICHIER : src/components/onboarding/FeaturePicker.tsx — v3
// S25 — 4 groupes : Obligatoires / Recommandés / Complémentaires /
//        Autres activités (accordéon)
// Custom : obligatoires pré-sélectionnés, tout le reste désélectionné
// ============================================================

import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { FeatureCard, type FeatureGroup } from "./FeatureCard";
import { LoadingSpinner } from "@/components/data/LoadingSpinner";
import type { Locale } from "@/contexts/LanguageContext";
import type { PublicFeature } from "@/repositories/public-features.repository";

// ── Labels i18n ───────────────────────────────────────────────────────────────
const LABELS = {
  fr: {
    title:        "Vos fonctionnalités",
    subtitle:     "Configurez les modules de votre assistant selon vos besoins.",
    g1:           "Inclus dans tous les plans",
    g1hint:       "Activés automatiquement — aucune action requise de votre part.",
    g2:           "Recommandés pour votre secteur",
    g2hint:       "Pré-sélectionnés selon votre activité. Décochez ce dont vous n'avez pas besoin.",
    g3:           "Modules complémentaires",
    g3hint:       "Fonctionnalités universelles disponibles quel que soit votre secteur.",
    g4:           "Autres activités",
    g4hint:       "Modules spécifiques à d'autres secteurs — utiles si vous exercez plusieurs activités.",
    g4open:       "Voir les modules d'autres secteurs",
    g4close:      "Réduire",
    g4custom:     "Choisissez vos modules",
    g4customhint: "Aucun module n'est pré-sélectionné. Choisissez librement selon vos besoins.",
    note:         "Certains modules consomment du quota selon votre plan d'abonnement.",
    confirm:      "Confirmer",
    confirming:   "Enregistrement…",
    selected:     (n: number) => `${n} module${n > 1 ? "s" : ""} sélectionné${n > 1 ? "s" : ""}`,
  },
  en: {
    title:        "Your features",
    subtitle:     "Configure your assistant's modules based on your needs.",
    g1:           "Included in all plans",
    g1hint:       "Automatically enabled — no action required on your part.",
    g2:           "Recommended for your sector",
    g2hint:       "Pre-selected based on your activity. Uncheck what you don't need.",
    g3:           "Complementary modules",
    g3hint:       "Universal features available regardless of your sector.",
    g4:           "Other activities",
    g4hint:       "Sector-specific modules — useful if you run multiple activities.",
    g4open:       "See modules from other sectors",
    g4close:      "Collapse",
    g4custom:     "Choose your modules",
    g4customhint: "No modules are pre-selected. Choose freely based on your needs.",
    note:         "Some modules consume quota depending on your subscription plan.",
    confirm:      "Confirm",
    confirming:   "Saving…",
    selected:     (n: number) => `${n} module${n > 1 ? "s" : ""} selected`,
  },
} as const;

// ── Types ─────────────────────────────────────────────────────────────────────
interface FeaturePickerProps {
  features:    PublicFeature[];   // features du secteur courant
  allFeatures: PublicFeature[];   // toutes les features (secteur "custom")
  sectorSlug:  string;            // slug du secteur choisi par l'user
  locale:      Locale;
  accentColor: string;
  onConfirm:   (slugs: string[]) => Promise<void>;
}

// ── Sous-composant section ────────────────────────────────────────────────────
interface SectionProps {
  title:       string;
  hint:        string;
  items:       PublicFeature[];
  group:       FeatureGroup;
  selected:    Set<string>;
  locale:      Locale;
  accentColor: string;
  onToggle:    (slug: string) => void;
}

function GroupSection({ title, hint, items, group, selected, locale, accentColor, onToggle }: SectionProps) {
  if (!items.length) return null;
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
          {title}
        </h3>
        <p className="text-xs text-[var(--text-muted)] mt-0.5 opacity-75">{hint}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map(f => (
          <FeatureCard
            key={f.slug}
            feature={f}
            selected={selected.has(f.slug)}
            locale={locale}
            accentColor={accentColor}
            group={group}
            onClick={() => onToggle(f.slug)}
          />
        ))}
      </div>
    </section>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────
export function FeaturePicker({
  features, allFeatures, sectorSlug, locale, accentColor, onConfirm,
}: FeaturePickerProps) {
  const t        = LABELS[locale];
  const isCustom = sectorSlug === "custom";
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [saving,        setSaving]        = useState(false);

  // ── Groupes ────────────────────────────────────────────────────────────────
  const sectorSlugs = useMemo(() => new Set(features.map(f => f.slug)), [features]);

  const g1 = useMemo(() => features.filter(f => f.is_mandatory), [features]);
  const g2 = useMemo(() => features.filter(f => !f.is_mandatory && f.recommended), [features]);
  const g3 = useMemo(
    () => features.filter(f => !f.is_mandatory && !f.recommended && f.categorie === "base"),
    [features],
  );
  const g4Normal = useMemo(
    () => allFeatures.filter(f => !sectorSlugs.has(f.slug) && f.categorie === "sectorielle"),
    [allFeatures, sectorSlugs],
  );
  const g4CustomRec = useMemo(
   () => (isCustom ? allFeatures.filter(f => !f.is_mandatory && f.recommended) : []),
   [isCustom, allFeatures],
 );
 const g4CustomFree = useMemo(
   () => (isCustom ? allFeatures.filter(f => !f.is_mandatory && !f.recommended) : []),
   [isCustom, allFeatures],
 );
  // ── Sélection initiale ─────────────────────────────────────────────────────
  // Custom : obligatoires seulement
  // Autres : obligatoires + recommandés
  const initialSelected = useMemo(() => {
    const slugs = new Set(g1.map(f => f.slug));
    g2.forEach(f => slugs.add(f.slug));
    return slugs;
  }, [g1, g2]);

  const [selected, setSelected] = useState<Set<string>>(initialSelected);

  const mandatorySlugs = useMemo(() => new Set(g1.map(f => f.slug)), [g1]);

  const toggle = (slug: string) => {
    if (mandatorySlugs.has(slug)) return; // protection obligatoires
    setSelected(prev => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });
  };

  const handleConfirm = async () => {
    setSaving(true);
    // Les obligatoires sont TOUJOURS inclus, indépendamment de la sélection UI
    const finalSlugs = [...new Set([...mandatorySlugs, ...selected])];
    try { await onConfirm(finalSlugs); }
    finally { setSaving(false); }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-1">

      {/* En-tête */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[var(--text)]">{t.title}</h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">{t.subtitle}</p>
      </div>

      <div className="space-y-8">

        {/* Groupe 1 — Obligatoires (tous secteurs) */}
        <GroupSection
          title={t.g1} hint={t.g1hint} items={g1} group="mandatory"
          selected={selected} locale={locale} accentColor={accentColor} onToggle={toggle}
        />

        {!isCustom && (
          <>
            {/* Groupe 2 — Recommandés secteur */}
            <GroupSection
              title={t.g2} hint={t.g2hint} items={g2} group="recommended"
              selected={selected} locale={locale} accentColor={accentColor} onToggle={toggle}
            />

            {/* Groupe 3 — Complémentaires (base non-obligatoires) */}
            <GroupSection
              title={t.g3} hint={t.g3hint} items={g3} group="complementary"
              selected={selected} locale={locale} accentColor={accentColor} onToggle={toggle}
            />

            {/* Groupe 4 — Autres activités (accordéon, sectorielles cross-secteur) */}
            {g4Normal.length > 0 && (
              <section className="space-y-3">
                <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                    {t.g4}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5 opacity-75">{t.g4hint}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAccordionOpen(v => !v)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
                  style={{ color: accentColor }}
                >
                  {accordionOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  {accordionOpen ? t.g4close : t.g4open}
                </button>

                {accordionOpen && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {g4Normal.map(f => (
                      <FeatureCard
                        key={f.slug} feature={f} selected={selected.has(f.slug)}
                        locale={locale} accentColor={accentColor} group="other"
                        onClick={() => toggle(f.slug)}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        )}

        {/* Custom — tous les modules non-obligatoires, désélectionnés */}
       {isCustom && (
            <>
              <GroupSection
                title={t.g2} hint={t.g2hint} items={g4CustomRec} group="recommended"
                selected={selected} locale={locale} accentColor={accentColor} onToggle={toggle}
              />
              <GroupSection
                title={t.g4custom} hint={t.g4customhint} items={g4CustomFree} group="complementary"
                selected={selected} locale={locale} accentColor={accentColor} onToggle={toggle}
              />
            </>
              )}

      </div>

      {/* Pied — note + bouton confirmer */}
      <div className="pt-8 space-y-3">
        <p className="text-[11px] text-[var(--text-muted)] text-center">{t.note}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[var(--text-muted)]">
            {t.selected(selected.size)}
          </span>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-60"
            style={{ backgroundColor: accentColor }}
          >
            {saving && <LoadingSpinner size={13} />}
            {saving ? t.confirming : t.confirm}
          </button>
        </div>
      </div>

    </div>
  );
}