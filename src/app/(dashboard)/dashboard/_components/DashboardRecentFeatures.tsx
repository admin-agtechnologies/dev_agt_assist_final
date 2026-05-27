"use client";
// src/app/(dashboard)/dashboard/_components/DashboardRecentFeatures.tsx
// Accordion 4 features actives — 3 dernières entrées par feature.
// Sélection : 4 premières de features_actives (ordre backend).
// Réutilise le même pattern de fetch que StatsRecentEntries.
// S63 — création.

import { useState, useEffect } from "react";
import { useRouter }  from "next/navigation";
import { ChevronDown, Loader2, ArrowRight } from "lucide-react";
import { useSector }   from "@/hooks/useSector";
import { useLanguage } from "@/contexts/LanguageContext";
import { FEATURES_MASTER_MAP } from "@/config/features-master-config";
import { cn } from "@/lib/utils";
import {
  reservationsResultRepository,
  commandesResultRepository,
  inscriptionsResultRepository,
  dossiersResultRepository,
  contactsResultRepository,
  transfertsResultRepository,
  conciergerieResultRepository,
  emailLogsResultRepository,
  consultationsFAQResultRepository,
} from "@/repositories/results.repository";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Entry {
  id:    string;
  label: string;
  sub?:  string;
  date?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function toEntries(results: unknown[]): Entry[] {
  return results.slice(0, 3).map((item) => {
    const r = item as Record<string, unknown>;
    const contactNom =
      (r.contact as Record<string, unknown>)?.nom ??
      (r.contact as Record<string, unknown>)?.phone ?? null;
    const label = String(
      r.nom_client ?? r.reference ?? r.numero_commande ??
      r.nom ?? r.prenom ?? r.nom_etudiant ?? r.titre ??
      r.objet ?? r.question_posee ?? r.type_demande ?? r.type ??
      r.sujet ?? contactNom ??
      (r.statut ? `Entrée — ${r.statut}` : "—")
    );
    return {
      id:    String(r.id ?? Math.random()),
      label,
      sub:   r.statut     ? String(r.statut)                   : undefined,
      date:  r.created_at ? String(r.created_at).split("T")[0] : undefined,
    };
  });
}

type Fetcher = () => Promise<Entry[]>;

function makeFetcher(slug: string): Fetcher | null {
  const opts = { page_size: 3 };
  const e = (r: { results: unknown[] }) => toEntries(r.results as unknown[]);
  const map: Record<string, Fetcher> = {
    reservation_table:    () => reservationsResultRepository.getList(opts).then(e),
    reservation_chambre:  () => reservationsResultRepository.getList(opts).then(e),
    reservation_billet:   () => reservationsResultRepository.getList(opts).then(e),
    prise_rdv:            () => reservationsResultRepository.getList(opts).then(e),
    commande_paiement:    () => commandesResultRepository.getList(opts).then(e),
    menu_digital:         () => commandesResultRepository.getList(opts).then(e),
    catalogue_produits:   () => commandesResultRepository.getList(opts).then(e),
    catalogue_services:   () => commandesResultRepository.getList(opts).then(e),
    catalogue_trajets:    () => commandesResultRepository.getList(opts).then(e),
    suivi_commande:       () => commandesResultRepository.getList(opts).then(e),
    inscription_admission:() => inscriptionsResultRepository.getList(opts).then(e),
    suivi_dossier:        () => dossiersResultRepository.getList(opts).then(e),
    collecte_documents:   () => dossiersResultRepository.getList(opts).then(e),
    orientation_citoyens: () => dossiersResultRepository.getList(opts).then(e),
    gestion_crm:          () => contactsResultRepository.getList(opts).then(e),
    capture_prospect:     () => contactsResultRepository.getList(opts).then(e),
    transfert_humain:     () => transfertsResultRepository.getList(opts).then(e),
    conciergerie:         () => conciergerieResultRepository.getList(opts).then(e),
    emails_rappel:        () => emailLogsResultRepository.getList(opts).then(e),
    faq:                  () => consultationsFAQResultRepository.getList(opts).then(e),
  };
  return map[slug] ?? null;
}

// ── Sous-composant : une section accordion ────────────────────────────────────

interface SectionProps {
  slug:    string;
  locale:  string;
  primary: string;
  index:   number;
}

function FeatureSection({ slug, locale, primary, index }: SectionProps) {
  const router = useRouter();
  const [open,    setOpen]    = useState(index === 0); // premier ouvert par défaut
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const meta  = FEATURES_MASTER_MAP.get(slug);
  const label = meta ? (locale === "fr" ? meta.label.fr : meta.label.en) : slug;

  useEffect(() => {
    if (!open || fetched) return;
    const fetcher = makeFetcher(slug);
    if (!fetcher) { setFetched(true); return; }
    setLoading(true);
    fetcher()
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => { setLoading(false); setFetched(true); });
  }, [open, slug, fetched]);

  const labelVoir   = locale === "fr" ? "Voir tout" : "See all";
  const labelAucune = locale === "fr" ? "Aucune entrée récente." : "No recent entries.";

  return (
    <div className="border-b border-[var(--border)] last:border-0">
      {/* Header accordion */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[var(--bg)] transition-colors"
      >
        <span className="text-[11px] font-bold text-[var(--text)]">{label}</span>
        <ChevronDown
          className={cn("w-3.5 h-3.5 text-[var(--text-muted)] transition-transform", open && "rotate-180")}
        />
      </button>

      {/* Contenu */}
      {open && (
        <div className="px-4 pb-3 space-y-1.5">
          {loading ? (
            <div className="flex justify-center py-3">
              <Loader2 className="w-4 h-4 animate-spin text-[var(--text-muted)]" />
            </div>
          ) : entries.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] opacity-60">{labelAucune}</p>
          ) : (
            <>
              {entries.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--bg)] border border-[var(--border)]"
                >
                  <span className="text-xs font-semibold text-[var(--text)] truncate max-w-[55%]">
                    {e.label}
                  </span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {e.sub && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] capitalize">
                        {e.sub}
                      </span>
                    )}
                    {e.date && (
                      <span className="text-[10px] text-[var(--text-muted)]">{e.date}</span>
                    )}
                  </div>
                </div>
              ))}
              <button
                onClick={() => router.push(`/results?feature=${slug}`)}
                className="flex items-center gap-1 text-[10px] font-bold mt-1 hover:opacity-75 transition-opacity"
                style={{ color: primary }}
              >
                {labelVoir}
                <ArrowRight className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────

interface Props {
  featuresActives: string[];
}

export function DashboardRecentFeatures({ featuresActives }: Props) {
  const { theme }   = useSector();
  const { locale }  = useLanguage();
  const primary     = theme?.primary ?? "var(--color-primary)";

  // 4 premières features qui ont un fetcher
  const features = featuresActives
    .filter((slug) => makeFetcher(slug) !== null)
    .slice(0, 4);

  if (features.length === 0) return null;

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
          {locale === "fr" ? "Dernières activités" : "Recent activity"}
        </p>
      </div>
      {features.map((slug, i) => (
        <FeatureSection
          key={slug}
          slug={slug}
          locale={locale}
          primary={primary}
          index={i}
        />
      ))}
    </div>
  );
}