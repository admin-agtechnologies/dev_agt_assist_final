// src/app/(dashboard)/bots/_components/tabs/BotSettingsPanel.tsx
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
  Zap,
  Lock,
} from "lucide-react";
import { Badge, Spinner } from "@/components/ui";
import { cn } from "@/lib/utils";
import { botsRepository } from "@/repositories";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/Toast";
import type { BotPair } from "../bots.types";

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
        icon: <Zap className="w-3.5 h-3.5 text-white/50" />,
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
        icon: <Phone className="w-3.5 h-3.5 text-white/50" />,
      },
    ],
    [pair.voiceBot],
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">

      {/* ══════════════ COLONNE GAUCHE — Formulaire (7/12) ══════════════ */}
      <div className="lg:col-span-7 space-y-5">

        {/* ── Identité des agents ── */}
        <div
          className="rounded-3xl border border-[var(--border)] overflow-hidden"
          style={{ background: "var(--bg-card)" }}
        >
          {/* Header section */}
          <div
            className="px-6 py-4 border-b border-[var(--border)] flex items-center gap-3"
            style={{ background: `${colors.primary}10` }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: `${colors.primary}20` }}
            >
              <Settings className="w-4 h-4" style={{ color: colors.primary }} />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text)]">
              Identité des agents
            </h3>
          </div>

          <div className="p-6 space-y-5">
            {/* Nom interne */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                Nom interne du projet
              </label>
              <div className="relative group">
                <input
                  className="w-full px-4 py-3 rounded-2xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm font-medium placeholder:text-[var(--text-muted)] transition-all duration-200 focus:outline-none focus:border-transparent focus:ring-2"
                  style={{
                    // @ts-ignore
                    "--tw-ring-color": `${colors.primary}60`,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.primary}40`;
                    e.currentTarget.style.borderColor = colors.primary;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = "";
                    e.currentTarget.style.borderColor = "";
                  }}
                  value={mainName}
                  onChange={(e) => setMainName(e.target.value)}
                  placeholder="Ex: Pharma Bot"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nom WhatsApp */}
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-3 h-3 text-[#25D366]" />
                  Nom WhatsApp
                </label>
                <input
                  className="w-full px-4 py-3 rounded-2xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm font-medium placeholder:text-[var(--text-muted)] transition-all duration-200 focus:outline-none"
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 0 2px #25D36640`;
                    e.currentTarget.style.borderColor = "#25D366";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = "";
                    e.currentTarget.style.borderColor = "";
                  }}
                  value={waDisplayName}
                  onChange={(e) => setWaDisplayName(e.target.value)}
                  placeholder="Ex: Sophie"
                />
              </div>

              {/* Nom Vocal */}
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-[#6C3CE1]" />
                  Nom Vocal
                </label>
                <input
                  className={cn(
                    "w-full px-4 py-3 rounded-2xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm font-medium placeholder:text-[var(--text-muted)] transition-all duration-200 focus:outline-none",
                    !pair.voiceBot && "opacity-50 cursor-not-allowed",
                  )}
                  onFocus={(e) => {
                    if (!pair.voiceBot) return;
                    e.currentTarget.style.boxShadow = `0 0 0 2px #6C3CE140`;
                    e.currentTarget.style.borderColor = "#6C3CE1";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = "";
                    e.currentTarget.style.borderColor = "";
                  }}
                  value={voiceDisplayName}
                  onChange={(e) => setVoiceDisplayName(e.target.value)}
                  placeholder="Ex: Voix Sophie"
                  disabled={!pair.voiceBot}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Numéro de téléphone ── */}
        <div
          className="rounded-3xl border border-[var(--border)] p-5"
          style={{ background: "var(--bg-card)" }}
        >
          <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-sky-500" />
            Numéro de téléphone assigné
          </label>

          <div
            className="flex items-center justify-between p-4 rounded-2xl border border-[var(--border)]"
            style={{ background: "var(--bg)" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-500 flex-shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-black text-[var(--text)] font-mono tracking-tighter">
                  {phoneDisplay}
                </p>
                <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold mt-0.5">
                  {pair.waBot.numero_value
                    ? "Ligne active • AGT Telecom"
                    : "Aucun numéro assigné"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-3 h-3 text-[var(--text-muted)]" />
              <Badge variant="slate">Lecture seule</Badge>
            </div>
          </div>
        </div>

        {/* ── Bouton Enregistrer ── */}
        <div className="flex justify-end pt-1">
          <button
            onClick={handleSave}
            disabled={saving}
            className="relative overflow-hidden flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-black text-white transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent ?? colors.primary}dd)`,
              boxShadow: `0 8px 24px ${colors.primary}40`,
            }}
          >
            {/* Shimmer effect */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700 pointer-events-none" />
            {saving ? (
              <Spinner className="border-white/30 border-t-white" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Enregistrer les modifications
          </button>
        </div>
      </div>

      {/* ══════════════ COLONNE DROITE — Statut (5/12) ══════════════ */}
      <div className="lg:col-span-5 space-y-5">

        {/* ── Bloc statut "carte premium" ── */}
        <div className="relative bg-[#075E54] text-white p-6 rounded-[2rem] overflow-hidden shadow-2xl">
          {/* Deco background glows */}
          <div className="absolute -top-8 -right-8 w-36 h-36 bg-[#25D366] rounded-full blur-[60px] opacity-25 pointer-events-none" />
          <div className="absolute -bottom-8 -left-4 w-28 h-28 bg-[#075E54] rounded-full blur-[50px] opacity-30 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em]">
                Statut en direct
              </p>
              <span
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black",
                  isActive
                    ? "bg-[#25D366]/20 text-[#25D366]"
                    : "bg-white/10 text-white/50",
                )}
              >
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    isActive ? "bg-[#25D366] animate-pulse" : "bg-white/30",
                  )}
                />
                {isActive ? "En ligne" : "Hors ligne"}
              </span>
            </div>

            {/* Header statut */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/15 flex-shrink-0">
                <Activity
                  className={cn(
                    "w-7 h-7",
                    isActive ? "text-[#25D366]" : "text-white/30",
                  )}
                />
              </div>
              <div>
                <h4 className="text-lg font-black leading-tight">
                  {isActive ? "Opérationnel" : "En pause"}
                </h4>
                <p className="text-white/50 text-xs mt-0.5 leading-snug">
                  {isActive
                    ? "Bot publié et prêt à répondre"
                    : "Bot non publié — pas de réponses automatiques"}
                </p>
              </div>
            </div>

            {/* Lignes d'info */}
            <div className="space-y-2">
              {statusRows.map((row) => (
                <div
                  key={row.key}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/8 hover:bg-white/8 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {row.icon}
                    <div className="flex flex-col">
                      <span className="text-xs text-white/70">{row.label}</span>
                      {row.sub && (
                        <span className="text-[10px] text-white/35 mt-0.5">
                          {row.sub}
                        </span>
                      )}
                    </div>
                  </div>
                  {row.value}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Aide AGT ── */}
        <div
          className="rounded-2xl border p-4 flex gap-3"
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--border)",
          }}
        >
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-[var(--text)] mb-1">
              Besoin d&apos;aide ?
            </p>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              Pour changer de numéro ou modifier les capacités profondes de
              l&apos;IA, contactez votre conseiller AGT.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}