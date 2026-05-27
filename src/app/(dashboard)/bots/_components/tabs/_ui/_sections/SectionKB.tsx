"use client";
// src/app/(dashboard)/bots/_components/tabs/_ui/_sections/SectionKB.tsx
// Sections 3/4/5 — Sections du prompt, Agences, Features. Patch auto au clic.

import { FileText, Building2, Zap } from "lucide-react";
import { useLanguage }  from "@/contexts/LanguageContext";
import { Accordion, CheckRow } from "../BotConfigElements";
import { SECTIONS_KB, FEATURE_GROUPS } from "../../bot-config.constants";
import type { AgenceKnowledge } from "@/types/api/agence.types";
import type { ActiveFeature }   from "@/repositories/features.repository";
import type { SectionColors }   from "./types";

interface Props {
  sectionsActives: string[];
  agencesSet:      string[];
  featuresSet:     string[];
  agences:         AgenceKnowledge[];
  features:        ActiveFeature[];
  colors:          SectionColors;
  onToggleSection: (key: string) => void;
  onToggleAgence:  (id: string)  => void;
  onToggleFeature: (id: string)  => void;
}

export function SectionKB({
  sectionsActives, agencesSet, featuresSet,
  agences, features, colors,
  onToggleSection, onToggleAgence, onToggleFeature,
}: Props) {
  const { dictionary: d } = useLanguage();
  const t = d.bots;

  return (
    <>
      <Accordion icon={<FileText className="w-3.5 h-3.5" />}
        title={t.configSections}
        badge={sectionsActives.length ? `${sectionsActives.length}` : undefined}
        colors={colors}>
        <p className="text-[11px] text-[var(--text-muted)] -mt-1 mb-2">{t.configSectionsHint}</p>
        {SECTIONS_KB.map((s) => (
          <CheckRow key={s.key}
            checked={sectionsActives.length === 0 || sectionsActives.includes(s.key)}
            onChange={() => onToggleSection(s.key)}
            label={s.label} sub={s.sub} colors={colors} />
        ))}
      </Accordion>

      <Accordion icon={<Building2 className="w-3.5 h-3.5" />}
        title={t.configAgences}
        badge={agencesSet.length ? `${agencesSet.length}` : undefined}
        colors={colors}>
        <p className="text-[11px] text-[var(--text-muted)] -mt-1 mb-2">{t.configAgencesHint}</p>
        {agences.length === 0
          ? <p className="text-sm text-[var(--text-muted)]">{t.configAgencesEmpty}</p>
          : agences.map((a) => (
            <CheckRow key={a.id}
              checked={agencesSet.includes(a.id)}
              onChange={() => onToggleAgence(a.id)}
              label={a.nom ?? a.id} colors={colors} />
          ))}
      </Accordion>

      <Accordion icon={<Zap className="w-3.5 h-3.5" />}
        title={t.configFeatures}
        badge={featuresSet.length ? `${featuresSet.length}` : undefined}
        colors={colors}>
        <p className="text-[11px] text-[var(--text-muted)] -mt-1 mb-2">{t.configFeaturesHint}</p>
        <CheckRow checked disabled label={t.configSysReply}   sub={t.configSysLabel} badge={t.configSysBadge} colors={colors} />
        <CheckRow checked disabled label={t.configSysHandoff} sub={t.configSysLabel} badge={t.configSysBadge} colors={colors} />
        {features.length === 0
          ? <p className="text-sm text-[var(--text-muted)]">{t.configFeaturesEmpty}</p>
          : FEATURE_GROUPS.map((group) => {
            const gf = features.filter((f) => group.slugs.includes(f.slug));
            if (gf.length === 0) return null;
            return (
              <div key={group.key} className="mt-3">
                <div className="flex items-center gap-2 mb-1.5 pb-1 border-b border-[var(--border)]">
                  <group.icon className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                    {group.label}
                  </span>
                </div>
                {gf.map((f) => (
                  <CheckRow key={f.id}
                    checked={featuresSet.includes(f.id)}
                    onChange={() => onToggleFeature(f.id)}
                    label={f.nom_fr ?? f.slug} colors={colors} />
                ))}
              </div>
            );
          })}
      </Accordion>
    </>
  );
}