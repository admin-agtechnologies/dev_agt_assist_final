"use client";
// src/app/(dashboard)/bots/_components/tabs/BotConfigTab.tsx
// S53 — i18n strict (useLanguage) + useSector (plus de prop colors).

import { useState, useEffect, useCallback } from "react";
import { Save, Building2, FileText, Zap, User } from "lucide-react";
import { Spinner }              from "@/components/ui";
import { useToast }             from "@/components/ui/Toast";
import { useLanguage }          from "@/contexts/LanguageContext";
import { useSector }            from "@/hooks/useSector";
import { botsRepository, agencesRepository } from "@/repositories";
import { featuresRepository }   from "@/repositories/features.repository";
import type { BotPair }         from "../bots.types";
import type { AgenceKnowledge } from "@/types/api/agence.types";
import type { ActiveFeature }   from "@/repositories/features.repository";
import { Accordion, CheckRow, useInputFocus } from "./_ui/BotConfigElements";
import { FEATURE_GROUPS, SECTIONS_KB, TON_OPTIONS, INPUT_CLASS } from "./bot-config.constants";

interface BotConfigTabProps {
  pair:      BotPair;
  onRefresh: () => void;
  // colors retiré — on utilise useSector().theme
}

export function BotConfigTab({ pair, onRefresh }: BotConfigTabProps) {
  const bot   = pair.waBot;
  const toast = useToast();
  const { dictionary: d } = useLanguage();
  const t     = d.bots;
  const { theme } = useSector();
  const colors = { primary: theme.primary, accent: theme.accent };

  const [saving,  setSaving]  = useState(false);
  const [loading, setLoading] = useState(true);
  const [agences,  setAgences]  = useState<AgenceKnowledge[]>([]);
  const [features, setFeatures] = useState<ActiveFeature[]>([]);

  const [nom,             setNom]             = useState(bot.nom);
  const [ton,             setTon]             = useState(bot.ton || "semi_formel");
  const [personnalite,    setPersonnalite]    = useState(bot.personnalite || "");
  const [messageAccueil,  setMessageAccueil]  = useState(bot.message_accueil || "");
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
      const activeFeatures = featuresRes.features.filter((f) => f.is_active);
      setAgences(agencesRes);
      setFeatures(activeFeatures);
      const authorizedSlugs = new Set(bot.features_autorisees_slugs ?? []);
      if (authorizedSlugs.size > 0) {
        setFeaturesSet(activeFeatures.filter((f) => authorizedSlugs.has(f.slug)).map((f) => f.id));
      }
    } catch { /* silencieux */ }
    finally { setLoading(false); }
  }, [bot.features_autorisees_slugs]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggle = <T,>(set: T[], setFn: (v: T[]) => void, val: T) =>
    setFn(set.includes(val) ? set.filter((v) => v !== val) : [...set, val]);

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
      toast.success(t.configSaved ?? "Configuration sauvegardée !");
      onRefresh();
    } catch {
      toast.error(t.configSaveError ?? "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner className="border-[var(--border)] border-t-[var(--text-muted)]" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Accordion icon={<User className="w-3.5 h-3.5" />}
        title={t.configBotName ?? "Nom du bot"} colors={colors}>
        <input value={nom} onChange={(e) => setNom(e.target.value)}
          placeholder={t.configBotName ?? "Nom du bot"}
          className={INPUT_CLASS} {...focusHandlers} />
        <div className="flex gap-2 flex-wrap mt-2">
          {TON_OPTIONS.map((opt) => (
            <button key={opt.value} type="button" onClick={() => setTon(opt.value)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200"
              style={ton === opt.value
                ? { backgroundColor: theme.primary, color: "#fff", borderColor: theme.primary }
                : { borderColor: "var(--border)", color: "var(--text-muted)" }}>
              {opt.label}
            </button>
          ))}
        </div>
        <textarea value={personnalite} onChange={(e) => setPersonnalite(e.target.value)}
          rows={3} placeholder={t.configPersonality ?? "Personnalité & instructions"}
          className={`${INPUT_CLASS} resize-none mt-2`} {...focusHandlers} />
        <textarea value={messageAccueil} onChange={(e) => setMessageAccueil(e.target.value)}
          rows={2} placeholder={t.configWelcome ?? "Message d'accueil"}
          className={`${INPUT_CLASS} resize-none mt-2`} {...focusHandlers} />
      </Accordion>

      <Accordion icon={<Building2 className="w-3.5 h-3.5" />}
        title={t.configAgences ?? "Agences accessibles dans le prompt"}
        badge={agencesSet.length ? `${agencesSet.length} sélectionnée(s)` : "toutes"}
        colors={colors}>
        <p className="text-xs text-[var(--text-muted)] -mt-1">
          {t.configAgencesHint ?? "Aucune sélectionnée = toutes les agences actives."}
        </p>
        {agences.length === 0
          ? <p className="text-sm text-[var(--text-muted)]">{t.configAgencesEmpty ?? "Aucune agence trouvée."}</p>
          : agences.map((a) => (
            <CheckRow key={a.id}
              checked={agencesSet.length === 0 || agencesSet.includes(a.id)}
              onChange={() => toggle(agencesSet, setAgencesSet, a.id)}
              label={a.nom} sub={a.est_siege ? "agence principale" : (a.ville ?? "")}
              colors={colors} />
          ))}
      </Accordion>

      <Accordion icon={<FileText className="w-3.5 h-3.5" />}
        title={t.configSections ?? "Sections actives du prompt"}
        badge={sectionsActives.length ? `${sectionsActives.length}/4` : "toutes"}
        colors={colors}>
        <p className="text-xs text-[var(--text-muted)] -mt-1">
          {t.configSectionsHint ?? "Aucune sélectionnée = toutes les sections incluses."}
        </p>
        {SECTIONS_KB.map((s) => (
          <CheckRow key={s.key} checked={isSectionActive(s.key)}
            onChange={() => toggle(sectionsActives, setSectionsActives, s.key)}
            label={s.label} sub={s.sub} colors={colors} />
        ))}
      </Accordion>

      <Accordion icon={<Zap className="w-3.5 h-3.5" />}
        title={t.configFeatures ?? "Features & actions autorisées"}
        badge={featuresSet.length ? `${featuresSet.length} feature(s)` : "toutes"}
        colors={colors}>
        <p className="text-xs text-[var(--text-muted)] -mt-1">
          {t.configFeaturesHint ?? "Aucune sélectionnée = toutes les features actives du tenant."}
        </p>
        <CheckRow checked disabled
          label={t.configSysReply ?? "Répondre aux questions"}
          sub={t.configSysLabel ?? "action système"}
          badge={t.configSysBadge ?? "système"} colors={colors} />
        <CheckRow checked disabled
          label={t.configSysHandoff ?? "Transfert humain"}
          sub={t.configSysLabel ?? "action système"}
          badge={t.configSysBadge ?? "système"} colors={colors} />
        {features.length === 0
          ? <p className="text-sm text-[var(--text-muted)]">{t.configFeaturesEmpty ?? "Aucune feature active."}</p>
          : FEATURE_GROUPS.map((group) => {
            const groupFeatures = features.filter((f) => group.slugs.includes(f.slug));
            if (groupFeatures.length === 0) return null;
            return (
              <div key={group.key} className="mt-3">
                <div className="flex items-center gap-2 mb-1.5 pb-1 border-b border-[var(--border)]">
                  <group.icon className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                    {group.label}
                  </span>
                </div>
                {groupFeatures.map((f) => (
                  <CheckRow key={f.id}
                    checked={featuresSet.includes(f.id)}
                    onChange={() => toggle(featuresSet, setFeaturesSet, f.id)}
                    label={f.nom_fr ?? f.slug}
                    colors={colors} />
                ))}
              </div>
            );
          })}
      </Accordion>

      <button type="button" onClick={handleSave} disabled={saving}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl
          text-sm font-semibold text-white transition-all duration-200
          disabled:opacity-60 hover:opacity-90 active:scale-[0.98]"
        style={{ backgroundColor: theme.primary }}>
        {saving
          ? <Spinner className="border-white/30 border-t-white w-4 h-4" />
          : <Save className="w-4 h-4" />}
        {t.configSave ?? "Enregistrer la configuration"}
      </button>
    </div>
  );
}