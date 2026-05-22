"use client";
// src/app/(dashboard)/bots/_components/tabs/BotConfigTab.tsx
// Orchestration : state formulaire, fetch agences/features, save.
// UI → _ui/BotConfigElements.tsx · Constantes → bot-config.constants.ts

import { useState, useEffect, useCallback } from "react";
import { Save, Building2, FileText, Zap, User } from "lucide-react";
import { Spinner } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { botsRepository, agencesRepository } from "@/repositories";
import { featuresRepository } from "@/repositories/features.repository";
import type { BotPair } from "../bots.types";
import type { AgenceKnowledge } from "@/types/api/agence.types";
import type { ActiveFeature } from "@/repositories/features.repository";
import { Accordion, CheckRow, useInputFocus } from "./_ui/BotConfigElements";
import { FEATURE_GROUPS, SECTIONS_KB, TON_OPTIONS, INPUT_CLASS } from "./bot-config.constants";

interface BotConfigTabProps {
  pair: BotPair;
  colors: { primary: string; accent: string };
  onRefresh: () => void;
}

export function BotConfigTab({ pair, colors, onRefresh }: BotConfigTabProps) {
  const bot   = pair.waBot;
  const toast = useToast();
  const [saving,  setSaving]  = useState(false);
  const [loading, setLoading] = useState(true);
  const [agences,  setAgences]  = useState<AgenceKnowledge[]>([]);
  const [features, setFeatures] = useState<ActiveFeature[]>([]);

  const [nom,            setNom]            = useState(bot.nom);
  const [ton,            setTon]            = useState(bot.ton || "semi_formel");
  const [personnalite,   setPersonnalite]   = useState(bot.personnalite || "");
  const [messageAccueil, setMessageAccueil] = useState(bot.message_accueil || "");
  const [sectionsActives, setSectionsActives] = useState<string[]>(bot.sections_actives ?? []);
  const [agencesSet,      setAgencesSet]      = useState<string[]>(bot.agences_ids ?? []);
  const [featuresSet,     setFeaturesSet]     = useState<string[]>([]);

  const focusHandlers = useInputFocus(colors);

  const fetchData = useCallback(async () => {
    try {
      const [agencesRes, featuresRes] = await Promise.all([
        agencesRepository.getList(),
        featuresRepository.getActive(),
      ]);
      const activeFeatures = featuresRes.features.filter(f => f.is_active);
      setAgences(agencesRes);
      setFeatures(activeFeatures);
      const authorizedSlugs = new Set(bot.features_autorisees_slugs ?? []);
      if (authorizedSlugs.size > 0) {
        setFeaturesSet(activeFeatures.filter(f => authorizedSlugs.has(f.slug)).map(f => f.id));
      }
    } catch { /* silencieux */ }
    finally { setLoading(false); }
  }, [bot.features_autorisees_slugs]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggle = <T,>(set: T[], setFn: (v: T[]) => void, val: T) =>
    setFn(set.includes(val) ? set.filter(v => v !== val) : [...set, val]);

  const isSectionActive = (key: string) =>
    sectionsActives.length === 0 || sectionsActives.includes(key);

  const handleSave = async () => {
    setSaving(true);
    try {
      await botsRepository.updateConfig(bot.id, {
        nom, ton, personnalite,
        message_accueil:  messageAccueil,
        sections_actives: sectionsActives,
        agences_set:      agencesSet,
        features_set:     featuresSet,
      });
      toast.success("Configuration sauvegardée !");
      onRefresh();
    } catch {
      toast.error("Erreur lors de la sauvegarde.");
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex justify-center py-12">
      <Spinner className="border-[var(--border)] border-t-[var(--text-muted)]" />
    </div>
  );

  const featureBySlug    = Object.fromEntries(features.map(f => [f.slug, f]));
  const allGroupedSlugs  = new Set(FEATURE_GROUPS.flatMap(g => g.slugs));

  return (
    <div className="space-y-3">

      {/* ── Identité & personnalité ── */}
      <Accordion icon={<User className="w-3.5 h-3.5" />} title="Identité & personnalité" defaultOpen colors={colors}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Nom du bot</label>
            <input className={INPUT_CLASS} value={nom} onChange={e => setNom(e.target.value)}
              placeholder="Ex: Sophie" {...focusHandlers} />
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Ton de communication</label>
            <select className={cn(INPUT_CLASS, "cursor-pointer")} value={ton}
              onChange={e => setTon(e.target.value)} {...focusHandlers}>
              {TON_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">
            Personnalité & instructions comportement
          </label>
          <textarea className={cn(INPUT_CLASS, "resize-y leading-relaxed")} rows={3} value={personnalite}
            onChange={e => setPersonnalite(e.target.value)}
            placeholder="Ex : Tu es chaleureux, tu vouvoies le client..." {...focusHandlers} />
        </div>
        <div>
          <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">
            Message d&apos;accueil
          </label>
          <input className={INPUT_CLASS} value={messageAccueil}
            onChange={e => setMessageAccueil(e.target.value)}
            placeholder="Bonjour ! Comment puis-je vous aider ?" {...focusHandlers} />
        </div>
      </Accordion>

      {/* ── Agences accessibles ── */}
      <Accordion
        icon={<Building2 className="w-3.5 h-3.5" />}
        title="Agences accessibles dans le prompt"
        badge={agencesSet.length ? `${agencesSet.length} sélectionnée(s)` : "toutes"}
        colors={colors}
      >
        <p className="text-xs text-[var(--text-muted)] -mt-1">Aucune sélectionnée = toutes les agences actives.</p>
        {agences.length === 0
          ? <p className="text-sm text-[var(--text-muted)]">Aucune agence trouvée.</p>
          : agences.map(a => (
            <CheckRow key={a.id}
              checked={agencesSet.length === 0 || agencesSet.includes(a.id)}
              onChange={() => toggle(agencesSet, setAgencesSet, a.id)}
              label={a.nom} sub={a.est_siege ? "agence principale" : (a.ville ?? "")}
              colors={colors} />
          ))}
      </Accordion>

      {/* ── Sections du prompt ── */}
      <Accordion
        icon={<FileText className="w-3.5 h-3.5" />}
        title="Sections actives du prompt"
        badge={sectionsActives.length ? `${sectionsActives.length}/4` : "toutes"}
        colors={colors}
      >
        <p className="text-xs text-[var(--text-muted)] -mt-1">Aucune sélectionnée = toutes les sections incluses.</p>
        {SECTIONS_KB.map(s => (
          <CheckRow key={s.key} checked={isSectionActive(s.key)}
            onChange={() => toggle(sectionsActives, setSectionsActives, s.key)}
            label={s.label} sub={s.sub} colors={colors} />
        ))}
      </Accordion>

      {/* ── Features & actions ── */}
      <Accordion
        icon={<Zap className="w-3.5 h-3.5" />}
        title="Features & actions autorisées"
        badge={featuresSet.length ? `${featuresSet.length} feature(s)` : "toutes"}
        colors={colors}
      >
        <p className="text-xs text-[var(--text-muted)] -mt-1">Aucune sélectionnée = toutes les features actives du tenant.</p>
        <CheckRow checked disabled label="Répondre aux questions" sub="action système" badge="système" colors={colors} />
        <CheckRow checked disabled label="Transfert humain"       sub="action système" badge="système" colors={colors} />
        {features.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">Aucune feature active.</p>
        ) : (
          <>
            {FEATURE_GROUPS.map(group => {
              const groupFeatures = group.slugs.map(slug => featureBySlug[slug]).filter(Boolean) as ActiveFeature[];
              if (groupFeatures.length === 0) return null;
              const GroupIcon = group.icon;
              return (
                <div key={group.key} className="mt-2">
                  <div className="flex items-center gap-2 py-1.5 mb-0.5 border-b border-[var(--border)]">
                    <GroupIcon className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      {group.label}
                    </span>
                  </div>
                  {groupFeatures.map(f => {
                    const hasKb = (f as ActiveFeature & { entreprise_configure_kb?: boolean }).entreprise_configure_kb;
                    return (
                      <CheckRow key={f.id}
                        checked={featuresSet.length === 0 || featuresSet.includes(f.id)}
                        onChange={() => toggle(featuresSet, setFeaturesSet, f.id)}
                        label={f.nom_fr ?? f.slug} sub={f.slug}
                        badge={hasKb ? "KB requise" : undefined}
                        badgeVariant={hasKb ? "kb" : "default"}
                        colors={colors} />
                    );
                  })}
                </div>
              );
            })}
            {(() => {
              const ungrouped = features.filter(f => !allGroupedSlugs.has(f.slug));
              if (ungrouped.length === 0) return null;
              return (
                <div className="mt-2">
                  <div className="flex items-center gap-2 py-1.5 mb-0.5 border-b border-[var(--border)]">
                    <Zap className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Autres</span>
                  </div>
                  {ungrouped.map(f => (
                    <CheckRow key={f.id}
                      checked={featuresSet.length === 0 || featuresSet.includes(f.id)}
                      onChange={() => toggle(featuresSet, setFeaturesSet, f.id)}
                      label={f.nom_fr ?? f.slug} sub={f.slug} colors={colors} />
                  ))}
                </div>
              );
            })()}
          </>
        )}
      </Accordion>

      {/* ── Save sticky ── */}
      <div className="sticky bottom-0 -mx-5 px-5 py-4 mt-2 border-t border-[var(--border)]"
        style={{ background: "var(--bg-card)" }}>
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="relative overflow-hidden flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-black text-white transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              background:  `linear-gradient(135deg, ${colors.primary}, ${colors.accent ?? colors.primary}dd)`,
              boxShadow:   `0 8px 24px ${colors.primary}40`,
            }}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700 pointer-events-none" />
            {saving ? <Spinner className="border-white/30 border-t-white" /> : <Save className="w-4 h-4" />}
            Enregistrer la configuration
          </button>
        </div>
      </div>
    </div>
  );
}