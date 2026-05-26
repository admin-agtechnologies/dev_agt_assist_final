"use client";
// src/app/(dashboard)/bots/_components/tabs/_ui/BotConfigSections.tsx
// Orchestrateur — 5 sections de configuration bot.
// Modes : "edit" (tab Config + ModalConfigIA) | "readonly" (ConversationPanel).
// Logique d'état et d'appels API ici ; rendu délégué aux sous-composants _sections/.

import { useState, useEffect, useCallback } from "react";
import { Spinner }            from "@/components/ui";
import { useToast }           from "@/components/ui/Toast";
import { useLanguage }        from "@/contexts/LanguageContext";
import { useSector }          from "@/hooks/useSector";
import { botsRepository, agencesRepository } from "@/repositories";
import { featuresRepository } from "@/repositories/features.repository";
import type { BotPair }       from "../../bots.types";
import type { AgenceKnowledge } from "@/types/api/agence.types";
import type { ActiveFeature }   from "@/repositories/features.repository";
import type { ChatbotConfig, UpdateChatbotConfigPayload } from "@/types/api";
import { SectionBasics }   from "./_sections/SectionBasics";
import { SectionIA }       from "./_sections/SectionIA";
import { SectionKB }       from "./_sections/SectionKB";
import { SectionReadonly } from "./_sections/SectionReadonly";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BotConfigSectionsProps {
  mode:          "edit" | "readonly";
  pair:          BotPair;
  chatbotConfig: ChatbotConfig | null;
  onBasicsSaved?: () => void;
  onIASaved?:    (c: ChatbotConfig) => void;
}

// ── Composant ─────────────────────────────────────────────────────────────────

export function BotConfigSections({ mode, pair, chatbotConfig, onBasicsSaved, onIASaved }: BotConfigSectionsProps) {
  const bot   = pair.waBot;
  const toast = useToast();
  const { dictionary: d } = useLanguage();
  const t = d.bots as unknown as Record<string, string>;
  const { theme } = useSector();
  const colors = { primary: theme.primary, accent: theme.accent };

  // ── État section 1 ────────────────────────────────────────────────────────
  const [nom,            setNom]            = useState(bot.nom ?? "");
  const [ton,            setTon]            = useState(bot.ton ?? "semi_formel");
  const [signature,      setSignature]      = useState(bot.signature ?? "");
  const [langues,        setLangues]        = useState<string[]>((bot.langues as string[]) ?? []);
  const [personnalite,   setPersonnalite]   = useState(bot.personnalite ?? "");
  const [messageAccueil, setMessageAccueil] = useState(bot.message_accueil ?? "");
  const [savingBasics,   setSavingBasics]   = useState(false);

  // ── État section 2 ────────────────────────────────────────────────────────
  const [prompt,   setPrompt]   = useState(chatbotConfig?.system_prompt ?? "");
  const [temp,     setTemp]     = useState(chatbotConfig?.temperature   ?? 0.7);
  const [tokens,   setTokens]   = useState(chatbotConfig?.max_tokens    ?? 1000);
  const [savingIA, setSavingIA] = useState(false);

  // ── État sections 3/4/5 ───────────────────────────────────────────────────
  const [sectionsActives, setSectionsActives] = useState<string[]>((bot.sections_actives as string[]) ?? []);
  const [agencesSet,      setAgencesSet]      = useState<string[]>(bot.agences_ids ?? []);
  const [featuresSet,     setFeaturesSet]     = useState<string[]>([]);
  const [agences,         setAgences]         = useState<AgenceKnowledge[]>([]);
  const [features,        setFeatures]        = useState<ActiveFeature[]>([]);
  const [loading,         setLoading]         = useState(mode === "edit");

  useEffect(() => {
    if (chatbotConfig) {
      setPrompt(chatbotConfig.system_prompt ?? "");
      setTemp(chatbotConfig.temperature ?? 0.7);
      setTokens(chatbotConfig.max_tokens ?? 1000);
    }
  }, [chatbotConfig?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = useCallback(async () => {
    if (mode !== "edit") return;
    try {
      const [agencesRes, featuresRes] = await Promise.all([
        agencesRepository.getList(),
        featuresRepository.getActive(),
      ]);
      const active = featuresRes.features.filter((f) => f.is_active);
      setAgences(agencesRes);
      setFeatures(active);
      const slugs = new Set(bot.features_autorisees_slugs ?? []);
      if (slugs.size > 0) setFeaturesSet(active.filter((f) => slugs.has(f.slug)).map((f) => f.id));
    } catch { /* silencieux */ }
    finally { setLoading(false); }
  }, [bot.features_autorisees_slugs, mode]);

  useEffect(() => { void fetchData(); }, [fetchData]);

  // ── Helpers patch auto ────────────────────────────────────────────────────
  const patchAuto = useCallback(async (field: string, value: unknown) => {
    try { await botsRepository.updateConfig(bot.id, { [field]: value } as never); }
    catch { toast.error(t.configSaveError); }
  }, [bot.id, t.configSaveError, toast]);

  const toggleLangue  = (v: string) => setLangues((p) => p.includes(v) ? p.filter((x) => x !== v) : [...p, v]);

  const toggleSection = (k: string) => {
    const next = sectionsActives.includes(k) ? sectionsActives.filter((s) => s !== k) : [...sectionsActives, k];
    setSectionsActives(next); void patchAuto("sections_actives", next);
  };
  const toggleAgence = (id: string) => {
    const next = agencesSet.includes(id) ? agencesSet.filter((a) => a !== id) : [...agencesSet, id];
    setAgencesSet(next); void patchAuto("agences_set", next);
  };
  const toggleFeature = (id: string) => {
    const next = featuresSet.includes(id) ? featuresSet.filter((f) => f !== id) : [...featuresSet, id];
    setFeaturesSet(next); void patchAuto("features_set", next);
  };

  // ── Save basics ───────────────────────────────────────────────────────────
  const handleSaveBasics = async () => {
    setSavingBasics(true);
    try {
      await botsRepository.updateConfig(bot.id, { nom, ton, signature, langues, personnalite, message_accueil: messageAccueil } as never);
      toast.success(t.configBasicsSaved);
      onBasicsSaved?.();
    } catch { toast.error(t.configBasicsSaveError); }
    finally { setSavingBasics(false); }
  };

  // ── Save IA ───────────────────────────────────────────────────────────────
  const handleSaveIA = async () => {
    setSavingIA(true);
    try {
      const payload: UpdateChatbotConfigPayload = { system_prompt: prompt, temperature: temp, max_tokens: tokens };
      const updated = await botsRepository.updateChatbot(bot.id, payload);
      toast.success(t.configIASaved);
      onIASaved?.(updated);
    } catch { toast.error(t.configIASaveError); }
    finally { setSavingIA(false); }
  };

  // ── Readonly ──────────────────────────────────────────────────────────────
  if (mode === "readonly") return <SectionReadonly bot={bot} chatbotConfig={chatbotConfig} />;

  if (loading) return (
    <div className="flex justify-center py-8">
      <Spinner className="border-[var(--border)] border-t-[var(--text-muted)]" />
    </div>
  );

  // ── Edit ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      <SectionBasics
        nom={nom} setNom={setNom} ton={ton} setTon={setTon}
        signature={signature} setSignature={setSignature}
        langues={langues} toggleLangue={toggleLangue}
        personnalite={personnalite} setPersonnalite={setPersonnalite}
        messageAccueil={messageAccueil} setMessageAccueil={setMessageAccueil}
        saving={savingBasics} onSave={() => void handleSaveBasics()}
        t={t} colors={colors}
      />
      <SectionIA
        prompt={prompt} setPrompt={setPrompt}
        temp={temp} setTemp={setTemp}
        tokens={tokens} setTokens={setTokens}
        saving={savingIA} onSave={() => void handleSaveIA()}
        t={t} colors={colors}
      />
      <SectionKB
        sectionsActives={sectionsActives} onToggleSection={toggleSection}
        agencesSet={agencesSet}           onToggleAgence={toggleAgence}
        featuresSet={featuresSet}         onToggleFeature={toggleFeature}
        agences={agences} features={features}
        colors={colors}
      />
    </div>
  );
}