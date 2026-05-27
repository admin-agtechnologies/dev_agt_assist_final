"use client";
// src/app/(dashboard)/bots/_components/tabs/_ui/_sections/SectionIA.tsx
// Section 2 — Configuration IA : system_prompt, température, tokens max.

import { Save, Brain } from "lucide-react";
import { Spinner }     from "@/components/ui";
import { Accordion, useInputFocus } from "../BotConfigElements";
import { INPUT_CLASS } from "../../bot-config.constants";
import type { SectionColors } from "./types";

interface Props {
  prompt:     string; setPrompt: (v: string) => void;
  temp:       number; setTemp:   (v: number) => void;
  tokens:     number; setTokens: (v: number) => void;
  saving:     boolean;
  onSave:     () => void;
  t:          Record<string, string>;
  colors:     SectionColors;
}

export function SectionIA({
  prompt, setPrompt, temp, setTemp, tokens, setTokens,
  saving, onSave, t, colors,
}: Props) {
  const focusHandlers = useInputFocus(colors);

  return (
    <Accordion icon={<Brain className="w-3.5 h-3.5" />}
      title={t.configIASection} colors={colors}>

      <p className="text-[11px] text-[var(--text-muted)] -mt-1 mb-2">{t.configIAPromptHint}</p>

      <label className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1">{t.configIAPromptLabel}</label>
      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
        rows={4} placeholder={t.configIAPromptPlaceholder}
        className={`${INPUT_CLASS} resize-none`} {...focusHandlers} />

      <div className="mt-3">
        <div className="flex justify-between mb-1">
          <label className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">{t.configIATemperature}</label>
          <span className="text-[11px] font-bold" style={{ color: colors.primary }}>{temp.toFixed(1)}</span>
        </div>
        <input type="range" min={0} max={1} step={0.1} value={temp}
          onChange={(e) => setTemp(parseFloat(e.target.value))}
          className="w-full" style={{ accentColor: colors.primary }} />
        <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-0.5">
          <span>{t.configIATemperatureLow}</span>
          <span>{t.configIATemperatureHigh}</span>
        </div>
      </div>

      <div className="mt-3">
        <label className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1">{t.configIATokens}</label>
        <input type="number" min={100} max={4000} step={100} value={tokens}
          onChange={(e) => setTokens(parseInt(e.target.value, 10))}
          className={INPUT_CLASS} {...focusHandlers} />
      </div>

      <button type="button" onClick={onSave} disabled={saving}
        className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60 hover:opacity-90 active:scale-[0.98]"
        style={{ backgroundColor: colors.primary }}>
        {saving ? <Spinner className="border-white/30 border-t-white w-4 h-4" /> : <Save className="w-4 h-4" />}
        {t.configIASave}
      </button>
    </Accordion>
  );
}