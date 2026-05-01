// src/app/pme/bots/_components/tabs/BotSettingsPanel.tsx
"use client";
import { useState, useMemo } from "react";
import {
  Settings,
  MessageSquare,
  Phone,
  Globe,
  Activity,
  AlertCircle,
  Save,
  ShieldCheck,
} from "lucide-react";
import { Badge, Spinner } from "@/components/ui";
import { cn } from "@/lib/utils";
import { botsRepository } from "@/repositories";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/Toast";
import type { BotPair } from "../bots.types";
import { WhatsAppPanel } from "../whatsapp/WhatsAppPanel";

interface BotSettingsPanelProps {
  pair: BotPair;
  d: ReturnType<typeof useLanguage>["dictionary"];
  colors: { primary: string; accent: string };
  onRefresh: () => void;
}

export function BotSettingsPanel({
  pair,
  d,
  onRefresh,
}: BotSettingsPanelProps) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [mainName, setMainName] = useState(pair.waBot.nom);
  const [waDisplayName, setWaDisplayName] = useState(pair.waBot.nom);
  const [voiceDisplayName, setVoiceDisplayName] = useState(
    pair.voiceBot?.nom ?? "",
  );

  // ── État de connexion WhatsApp synchronisé via le callback du panneau ──
  const [isWaConnected, setIsWaConnected] = useState(false);

  const isActive = pair.waBot.statut === "actif";
  const phoneDisplay = pair.waBot.numero_value ?? "Non configuré";

  const handleSave = async () => {
    setSaving(true);
    try {
      await botsRepository.patch(pair.waBot.id, {
        nom: waDisplayName || mainName,
      });
      if (pair.voiceBot && voiceDisplayName) {
        await botsRepository.patch(pair.voiceBot.id, { nom: voiceDisplayName });
      }
      toast.success("Paramètres sauvegardés !");
      onRefresh();
    } catch {
      toast.error(d.common.error);
    } finally {
      setSaving(false);
    }
  };

  // ── Lignes du bloc statut (mémorisées pour éviter re-renders inutiles) ──
  const statusRows = useMemo(
    () => [
      {
        key: "llm",
        label: "Moteur IA",
        value: (
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#25D366]" />
            <span className="text-xs font-bold text-[#25D366]">IA locale</span>
          </div>
        ),
        sub: "Ollama · serveur AGT",
      },
      {
        key: "wa",
        label: "Canal WhatsApp",
        value: (
          <span
            className={cn(
              "text-xs font-bold",
              isWaConnected ? "text-[#25D366]" : "text-white/40",
            )}
          >
            {isWaConnected ? "Connecté" : "Non connecté"}
          </span>
        ),
      },
      {
        key: "voice",
        label: "Canal Vocal",
        value: (
          <span
            className={cn(
              "text-xs font-bold",
              pair.voiceBot ? "text-sky-300" : "text-white/40",
            )}
          >
            {pair.voiceBot ? "Configuré" : "Non configuré"}
          </span>
        ),
      },
    ],
    [isWaConnected, pair.voiceBot],
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
      {/* ═══════════════ COLONNE GAUCHE — Formulaire (7/12) ═══════════════ */}
      <div className="lg:col-span-7 space-y-6">
        {/* Identité des agents */}
        <div className="bg-[var(--bg)] p-6 rounded-3xl border border-[var(--border)] space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--border)]">
            <Settings className="w-4 h-4 text-[var(--text-muted)]" />
            <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text)]">
              Identité des agents
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label-base font-bold mb-1.5 block">
                Nom interne du projet
              </label>
              <input
                className="input-base bg-white"
                value={mainName}
                onChange={(e) => setMainName(e.target.value)}
                placeholder="Ex: Pharma Bot"
              />
            </div>
            <div>
              <label className="label-base font-bold mb-1.5 flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" /> Nom
                WhatsApp
              </label>
              <input
                className="input-base bg-white"
                value={waDisplayName}
                onChange={(e) => setWaDisplayName(e.target.value)}
                placeholder="Ex: Sophie"
              />
            </div>
            <div>
              <label className="label-base font-bold mb-1.5 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#6C3CE1]" /> Nom Vocal
              </label>
              <input
                className="input-base bg-white"
                value={voiceDisplayName}
                onChange={(e) => setVoiceDisplayName(e.target.value)}
                placeholder="Ex: Voix Sophie"
                disabled={!pair.voiceBot}
              />
            </div>
          </div>
        </div>

        {/* Numéro de téléphone */}
        <div className="bg-[var(--bg)] p-6 rounded-3xl border border-[var(--border)]">
          <label className="label-base font-bold mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-sky-500" /> Numéro de téléphone
            assigné
          </label>
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[var(--border)] shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-600">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-black text-[var(--text)] font-mono tracking-tighter">
                  {phoneDisplay}
                </p>
                <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold">
                  {pair.waBot.numero_value
                    ? "Ligne active • AGT Telecom"
                    : "Aucun numéro assigné"}
                </p>
              </div>
            </div>
            <Badge variant="slate">Lecture seule</Badge>
          </div>
        </div>

        {/* Bouton Enregistrer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary px-8 py-3 shadow-lg shadow-[#075E54]/20 flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            {saving ? (
              <Spinner className="border-white/30 border-t-white" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Enregistrer les modifications
          </button>
        </div>
      </div>

      {/* ═══════════════ COLONNE DROITE — Statut + WhatsApp (5/12) ═══════════════ */}
      <div className="lg:col-span-5 space-y-6">
        {/* ── Statut en direct (épuré, sans données simulées) ── */}
        <div className="bg-[#075E54] text-white p-6 rounded-[2rem] relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              Statut
            </p>

            {/* Header statut */}
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Activity
                  className={cn(
                    "w-7 h-7",
                    isActive ? "text-[#25D366]" : "text-white/40",
                  )}
                />
              </div>
              <div>
                <h4 className="text-lg font-black">
                  {isActive ? "Opérationnel" : "En pause"}
                </h4>
                <p className="text-white/60 text-xs">
                  {isActive
                    ? "Bot publié et prêt à répondre"
                    : "Bot non publié — pas de réponses automatiques"}
                </p>
              </div>
            </div>

            {/* Lignes d'info */}
            <div className="space-y-2.5">
              {statusRows.map((row) => (
                <div
                  key={row.key}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex flex-col">
                    <span className="text-xs">{row.label}</span>
                    {row.sub && (
                      <span className="text-[10px] text-white/40 mt-0.5">
                        {row.sub}
                      </span>
                    )}
                  </div>
                  {row.value}
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#25D366] rounded-full blur-[80px] opacity-20" />
        </div>

        {/* ── Connexion WhatsApp (le panneau livré précédemment) ── */}
        <WhatsAppPanel
          botId={pair.waBot.id}
          isBotPublished={isActive}
          onConnectionChange={setIsWaConnected}
        />

        {/* ── Aide AGT (compact) ── */}
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 p-4 rounded-2xl">
          <div className="flex gap-3">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-900 dark:text-amber-100 mb-0.5">
                Besoin d&apos;aide ?
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed">
                Pour changer de numéro ou modifier les capacités profondes de
                l&apos;IA, contactez votre conseiller AGT.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// END OF FILE: src/app/pme/bots/_components/tabs/BotSettingsPanel.tsx
