"use client";
import { useState, useEffect, useCallback } from "react";
import { Save, Building2, FileText, Zap, ChevronDown, User } from "lucide-react";
import { Spinner } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { botsRepository } from "@/repositories";
import { agencesRepository } from "@/repositories";
import { featuresRepository } from "@/repositories/features.repository";
import type { BotPair } from "../bots.types";
import type { AgenceKnowledge } from "@/types/api/agence.types";
import type { ActiveFeature } from "@/repositories/features.repository";

// ── Constantes ────────────────────────────────────────────────────────────────

const SECTIONS_KB = [
  { key: "profil",   label: "Profil entreprise",  sub: "identité, description, slogan" },
  { key: "services", label: "Services proposés",  sub: "catalogue actif" },
  { key: "faq",      label: "FAQ",                sub: "questions fréquentes" },
  { key: "agences",  label: "Infos agences",       sub: "adresses, contacts, horaires" },
];

const TON_OPTIONS = [
  { value: "formel",      label: "Formel" },
  { value: "semi_formel", label: "Semi-formel" },
  { value: "decontracte", label: "Décontracté" },
];

// ── Accordéon ─────────────────────────────────────────────────────────────────

function Accordion({
  icon, title, badge, defaultOpen = false, children,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-[var(--bg)] rounded-2xl border border-[var(--border)] overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[var(--bg-card)] transition-colors"
      >
        <span className="text-[var(--text-muted)]">{icon}</span>
        <span className="flex-1 text-sm font-black uppercase tracking-widest text-[var(--text)]">{title}</span>
        {badge && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border)]">
            {badge}
          </span>
        )}
        <ChevronDown
          className={cn("w-4 h-4 text-[var(--text-muted)] transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1 border-t border-[var(--border)] space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}

// ── CheckRow ──────────────────────────────────────────────────────────────────

interface CheckRowProps {
  checked: boolean;
  onChange?: () => void;
  disabled?: boolean;
  label: string;
  sub?: string;
  badge?: string;
  colors: { primary: string; accent: string };
}

function CheckRow({ checked, onChange, disabled, label, sub, badge, colors }: CheckRowProps) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-[var(--border)] last:border-0">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="w-4 h-4 rounded cursor-pointer"
        style={checked && !disabled ? { accentColor: colors.primary } : {}}
      />
      <div className="flex-1 min-w-0">
        <span className="text-sm text-[var(--text)]">{label}</span>
        {sub && <span className="text-xs text-[var(--text-muted)] ml-2">{sub}</span>}
      </div>
      {badge && (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border)]">
          {badge}
        </span>
      )}
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────

interface BotConfigTabProps {
  pair: BotPair;
  colors: { primary: string; accent: string };
  onRefresh: () => void;
}

export function BotConfigTab({ pair, colors, onRefresh }: BotConfigTabProps) {
  const bot = pair.waBot;
  const toast = useToast();
  const [saving, setSaving]   = useState(false);
  const [loading, setLoading] = useState(true);
  const [agences, setAgences]   = useState<AgenceKnowledge[]>([]);
  const [features, setFeatures] = useState<ActiveFeature[]>([]);

  // État formulaire
  const [nom, setNom]                         = useState(bot.nom);
  const [ton, setTon]                         = useState(bot.ton || "semi_formel");
  const [personnalite, setPersonnalite]       = useState(bot.personnalite || "");
  const [messageAccueil, setMessageAccueil]   = useState(bot.message_accueil || "");
  const [sectionsActives, setSectionsActives] = useState<string[]>(bot.sections_actives ?? []);
  const [agencesSet, setAgencesSet]           = useState<string[]>(bot.agences_ids ?? []);
  const [featuresSet, setFeaturesSet]         = useState<string[]>([]);

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
    } catch {
      // silencieux
    } finally {
      setLoading(false);
    }
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
        message_accueil: messageAccueil,
        sections_actives: sectionsActives,
        agences_set: agencesSet,
        features_set: featuresSet,
      });
      toast.success("Configuration sauvegardée !");
      onRefresh();
    } catch {
      toast.error("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-12">
      <Spinner className="border-[var(--border)] border-t-[var(--text-muted)]" />
    </div>
  );

  return (
    <div className="space-y-3">

      {/* ── Identité & personnalité ──────────────────────────────────────── */}
      <Accordion icon={<User className="w-4 h-4" />} title="Identité & personnalité" defaultOpen>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label-base font-bold mb-1.5 block">Nom du bot</label>
            <input className="input-base bg-white" value={nom} onChange={e => setNom(e.target.value)} />
          </div>
          <div>
            <label className="label-base font-bold mb-1.5 block">Ton de communication</label>
            <select className="input-base bg-white" value={ton} onChange={e => setTon(e.target.value)}>
              {TON_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="label-base font-bold mb-1.5 block">Personnalité & instructions comportement</label>
          <textarea
            className="input-base bg-white resize-y text-sm"
            rows={3}
            value={personnalite}
            onChange={e => setPersonnalite(e.target.value)}
            placeholder="Ex : Tu es chaleureux, tu vouvoies le client, tu proposes des alternatives..."
          />
        </div>
        <div>
          <label className="label-base font-bold mb-1.5 block">Message d&apos;accueil</label>
          <input
            className="input-base bg-white"
            value={messageAccueil}
            onChange={e => setMessageAccueil(e.target.value)}
            placeholder="Bonjour ! Comment puis-je vous aider ?"
          />
        </div>
      </Accordion>

      {/* ── Agences accessibles ──────────────────────────────────────────── */}
      <Accordion icon={<Building2 className="w-4 h-4" />} title="Agences accessibles dans le prompt" badge={agencesSet.length ? `${agencesSet.length} sélectionnée(s)` : "toutes"}>
        <p className="text-xs text-[var(--text-muted)] -mt-1">
          Aucune sélectionnée = toutes les agences actives.
        </p>
        {agences.length === 0
          ? <p className="text-sm text-[var(--text-muted)]">Aucune agence trouvée.</p>
          : agences.map(a => (
            <CheckRow
              key={a.id}
              checked={agencesSet.length === 0 || agencesSet.includes(a.id)}
              onChange={() => toggle(agencesSet, setAgencesSet, a.id)}
              label={a.nom}
              sub={a.est_siege ? "agence principale" : (a.ville ?? "")}
              colors={colors}
            />
          ))
        }
      </Accordion>

      {/* ── Sections du prompt ───────────────────────────────────────────── */}
      <Accordion icon={<FileText className="w-4 h-4" />} title="Sections actives du prompt" badge={sectionsActives.length ? `${sectionsActives.length}/4` : "toutes"}>
        <p className="text-xs text-[var(--text-muted)] -mt-1">
          Aucune sélectionnée = toutes les sections incluses.
        </p>
        {SECTIONS_KB.map(s => (
          <CheckRow
            key={s.key}
            checked={isSectionActive(s.key)}
            onChange={() => toggle(sectionsActives, setSectionsActives, s.key)}
            label={s.label}
            sub={s.sub}
            colors={colors}
          />
        ))}
      </Accordion>

      {/* ── Features & actions ───────────────────────────────────────────── */}
      <Accordion icon={<Zap className="w-4 h-4" />} title="Features & actions autorisées" badge={featuresSet.length ? `${featuresSet.length} feature(s)` : "toutes"}>
        <p className="text-xs text-[var(--text-muted)] -mt-1">
          Aucune sélectionnée = toutes les features actives du tenant.
        </p>
        <CheckRow checked disabled label="Répondre aux questions" sub="action système" badge="système" colors={colors} />
        <CheckRow checked disabled label="Transfert humain" sub="action système" badge="système" colors={colors} />
        {features.length === 0
          ? <p className="text-sm text-[var(--text-muted)]">Aucune feature active.</p>
          : features.map(f => (
            <CheckRow
              key={f.id}
              checked={featuresSet.length === 0 || featuresSet.includes(f.id)}
              onChange={() => toggle(featuresSet, setFeaturesSet, f.id)}
              label={f.nom_fr}
              sub={f.slug}
              colors={colors}
            />
          ))
        }
      </Accordion>

      {/* ── Bouton save ──────────────────────────────────────────────────── */}
      <div className="sticky bottom-0 bg-[var(--bg)] border-t border-[var(--border)] -mx-5 px-5 py-4 mt-4">
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary px-8 py-3 flex items-center gap-2"
          >
            {saving ? <Spinner className="border-white/30 border-t-white" /> : <Save className="w-4 h-4" />}
            Enregistrer la configuration
          </button>
        </div>
      </div>
    </div>
  );
}