// src/app/pme/bots/_components/tabs/BotSettingsPanel.tsx
"use client";
import { useState } from "react";
import {
  Settings,
  MessageSquare,
  Phone,
  Globe,
  Activity,
  AlertCircle,
  Save,
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
  colors,
  onRefresh,
}: BotSettingsPanelProps) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [mainName, setMainName] = useState(pair.waBot.nom);
  const [waDisplayName, setWaDisplayName] = useState(pair.waBot.nom);
  const [voiceDisplayName, setVoiceDisplayName] = useState(
    pair.voiceBot?.nom ?? "",
  );

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

  const isActive = pair.waBot.statut === "actif";
  const phoneDisplay = pair.waBot.numero_value ?? "Non configuré";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
      {/* ── Colonne gauche : formulaire (7/12) ── */}
      <div className="lg:col-span-7 space-y-6">
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

        <div className="flex justify-end pt-4">
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

      {/* ── Colonne droite : résumé & statut (5/12) ── */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-[#075E54] text-white p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              Statut en direct
            </p>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Activity className="w-8 h-8 text-[#25D366]" />
              </div>
              <div>
                <h4 className="text-xl font-black">
                  {isActive ? "Opérationnel" : "En pause"}
                </h4>
                <p className="text-white/60 text-xs">
                  Dernière activité il y a 2 min
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-xs">Intelligence (LLM)</span>
                <Badge className="bg-[#25D366] text-[#075E54] border-none">
                  Gemini Pro
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-xs">Canal WhatsApp</span>
                <span className="text-xs font-bold text-[#25D366]">
                  Connecté
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-xs">Canal Vocal</span>
                <span
                  className={cn(
                    "text-xs font-bold",
                    pair.voiceBot ? "text-sky-300" : "text-white/40",
                  )}
                >
                  {pair.voiceBot ? "Prêt" : "Non configuré"}
                </span>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#25D366] rounded-full blur-[80px] opacity-20" />
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 p-6 rounded-3xl">
          <div className="flex gap-4">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-900 dark:text-amber-100 mb-1">
                Besoin d&apos;aide ?
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                Si vous souhaitez changer de numéro ou modifier les capacités
                profondes de l&apos;IA, veuillez contacter votre conseiller AGT.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-12">
        <WhatsAppPanel
          botId={pair.waBot.id}
          isBotPublished={pair.waBot.statut === "actif"}
          onConnectionChange={(connected) => {
            // Optionnel : refresh des données parent
            if (connected) onRefresh();
          }}
        />
      </div>
    </div>
  );
}
