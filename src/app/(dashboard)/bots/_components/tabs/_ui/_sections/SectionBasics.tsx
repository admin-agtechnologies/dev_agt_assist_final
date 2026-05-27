"use client";
// src/app/(dashboard)/bots/_components/tabs/_ui/_sections/SectionBasics.tsx
// Section 1 — Configs de base : nom, ton, signature, langues, personnalité, message d'accueil.

import { Save, User }  from "lucide-react";
import { Spinner }     from "@/components/ui";
import { Accordion, useInputFocus } from "../BotConfigElements";
import { TON_OPTIONS, LANGUES_OPTIONS, INPUT_CLASS } from "../../bot-config.constants";
import type { SectionColors } from "./types";

interface Props {
  nom:            string; setNom:            (v: string) => void;
  ton:            string; setTon:            (v: string) => void;
  signature:      string; setSignature:      (v: string) => void;
  langues:        string[]; toggleLangue:    (v: string) => void;
  personnalite:   string; setPersonnalite:   (v: string) => void;
  messageAccueil: string; setMessageAccueil: (v: string) => void;
  saving:  boolean;
  onSave:  () => void;
  t:       Record<string, string>;
  colors:  SectionColors;
}

export function SectionBasics({
  nom, setNom, ton, setTon, signature, setSignature,
  langues, toggleLangue, personnalite, setPersonnalite,
  messageAccueil, setMessageAccueil, saving, onSave, t, colors,
}: Props) {
  const focusHandlers = useInputFocus(colors);

  return (
    <Accordion icon={<User className="w-3.5 h-3.5" />}
      title={t.configBasicsTitle} colors={colors} defaultOpen>

      <label className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1">{t.configBotName}</label>
      <input value={nom} onChange={(e) => setNom(e.target.value)}
        placeholder={t.configBotName} className={INPUT_CLASS} {...focusHandlers} />

      <label className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block mt-3 mb-1">{t.configTone}</label>
      <div className="flex gap-2 flex-wrap">
        {TON_OPTIONS.map((opt) => (
          <button key={opt.value} type="button" onClick={() => setTon(opt.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200"
            style={ton === opt.value
              ? { backgroundColor: colors.primary, color: "#fff", borderColor: colors.primary }
              : { borderColor: "var(--border)", color: "var(--text-muted)" }}>
            {opt.label}
          </button>
        ))}
      </div>

      <label className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block mt-3 mb-1">{t.configSignature}</label>
      <input value={signature} onChange={(e) => setSignature(e.target.value)}
        placeholder={t.configSignaturePlaceholder} className={INPUT_CLASS} {...focusHandlers} />

      <label className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block mt-3 mb-1">{t.configLangues}</label>
      <div className="flex gap-2 flex-wrap">
        {LANGUES_OPTIONS.map((opt) => (
          <button key={opt.value} type="button" onClick={() => toggleLangue(opt.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200"
            style={langues.includes(opt.value)
              ? { backgroundColor: colors.accent, color: "#fff", borderColor: colors.accent }
              : { borderColor: "var(--border)", color: "var(--text-muted)" }}>
            {opt.label}
          </button>
        ))}
      </div>

      <label className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block mt-3 mb-1">{t.configPersonality}</label>
      <textarea value={personnalite} onChange={(e) => setPersonnalite(e.target.value)}
        rows={3} placeholder={t.configPersonality}
        className={`${INPUT_CLASS} resize-none`} {...focusHandlers} />

      <label className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block mt-3 mb-1">{t.configWelcome}</label>
      <textarea value={messageAccueil} onChange={(e) => setMessageAccueil(e.target.value)}
        rows={2} placeholder={t.configWelcome}
        className={`${INPUT_CLASS} resize-none`} {...focusHandlers} />

      <button type="button" onClick={onSave} disabled={saving}
        className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60 hover:opacity-90 active:scale-[0.98]"
        style={{ backgroundColor: colors.primary }}>
        {saving ? <Spinner className="border-white/30 border-t-white w-4 h-4" /> : <Save className="w-4 h-4" />}
        {t.configBasicsSave}
      </button>
    </Accordion>
  );
}