"use client";
// src/app/(dashboard)/bots/_components/tabs/stats/StatsRecentEntries.tsx
// 3 dernières entrées pour une feature donnée + bouton → /results.
// Dispatch par slug → repository correspondant (map statique).
// S62 — création. BUG-S62-01 fix : cast unknown[] pour compatibilité types stricts.
// S63 — botId optionnel (null = mode cross-bots → composant masqué).
//       fix toEntries : labels lisibles (plus d'UUIDs bruts).

import { useState, useEffect } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter }           from "next/navigation";
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

interface Props {
  slug:         string;
  botId:        string | null;  // S63 : null = mode cross-bots → masqué
  locale:       string;
  primaryColor: string;
}

interface Entry {
  id:    string;
  label: string;
  sub?:  string;
  date?: string;
}

// ── Helper : construire un label lisible depuis un résultat brut ──────────────
// Ordre de priorité : champs métier connus > fallback générique > jamais UUID brut

function toEntries(results: unknown[]): Entry[] {
  return results.slice(0, 3).map((item) => {
    const r = item as Record<string, unknown>;

    // Label : on cherche dans l'ordre les champs les plus lisibles
    const contactNom =
      (r.contact as Record<string, unknown>)?.nom ??
      (r.contact as Record<string, unknown>)?.phone ??
      null;

    const label = String(
      // Réservations
      r.nom_client ??
      // Commandes
      r.reference ?? r.numero_commande ??
      // Contacts / CRM
      r.nom ?? r.prenom ??
      // Inscriptions
      r.nom_etudiant ?? r.nom_candidat ??
      // Dossiers
      r.titre ?? r.objet ?? r.reference_dossier ??
      // FAQ
      r.question_posee ??
      // Transferts / conciergerie / emails
      r.type_demande ?? r.type ?? r.sujet ??
      // Lien contact imbriqué (souvent présent)
      contactNom ??
      // Dernier recours lisible
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

// ── Map slug → fetcher ────────────────────────────────────────────────────────

type Fetcher = (botId: string) => Promise<Entry[]>;

const FETCHERS: Record<string, Fetcher> = {
  reservation_table:           (b) => reservationsResultRepository.getList({ bot_id: b, page_size: 3 }).then((r) => toEntries(r.results as unknown[])),
  reservation_chambre:         (b) => reservationsResultRepository.getList({ bot_id: b, page_size: 3 }).then((r) => toEntries(r.results as unknown[])),
  reservation_billet:          (b) => reservationsResultRepository.getList({ bot_id: b, page_size: 3 }).then((r) => toEntries(r.results as unknown[])),
  reservation_ressource:       (b) => reservationsResultRepository.getList({ bot_id: b, page_size: 3 }).then((r) => toEntries(r.results as unknown[])),
  prise_rdv:                   (b) => reservationsResultRepository.getList({ bot_id: b, page_size: 3 }).then((r) => toEntries(r.results as unknown[])),
  menu_digital:                (b) => commandesResultRepository.getList({ bot_id: b, page_size: 3 }).then((r) => toEntries(r.results as unknown[])),
  commande_paiement:           (b) => commandesResultRepository.getList({ bot_id: b, page_size: 3 }).then((r) => toEntries(r.results as unknown[])),
  catalogue_produits:          (b) => commandesResultRepository.getList({ bot_id: b, page_size: 3 }).then((r) => toEntries(r.results as unknown[])),
  catalogue_services:          (b) => commandesResultRepository.getList({ bot_id: b, page_size: 3 }).then((r) => toEntries(r.results as unknown[])),
  catalogue_trajets:           (b) => commandesResultRepository.getList({ bot_id: b, page_size: 3 }).then((r) => toEntries(r.results as unknown[])),
  suivi_commande:              (b) => commandesResultRepository.getList({ bot_id: b, page_size: 3 }).then((r) => toEntries(r.results as unknown[])),
  inscription_admission:       (b) => inscriptionsResultRepository.getList({ bot_id: b, page_size: 3 }).then((r) => toEntries(r.results as unknown[])),
  inscription_etudiant:        (b) => inscriptionsResultRepository.getList({ bot_id: b, page_size: 3 }).then((r) => toEntries(r.results as unknown[])),
  inscription_evenement:       (b) => inscriptionsResultRepository.getList({ bot_id: b, page_size: 3 }).then((r) => toEntries(r.results as unknown[])),
  inscription_formation:       (b) => inscriptionsResultRepository.getList({ bot_id: b, page_size: 3 }).then((r) => toEntries(r.results as unknown[])),
  inscription_membre:          (b) => inscriptionsResultRepository.getList({ bot_id: b, page_size: 3 }).then((r) => toEntries(r.results as unknown[])),
  suivi_dossier:               (b) => dossiersResultRepository.getList({ bot_id: b, page_size: 3 }).then((r) => toEntries(r.results as unknown[])),
  gestion_dossiers:            (b) => dossiersResultRepository.getList({ bot_id: b, page_size: 3 }).then((r) => toEntries(r.results as unknown[])),
  orientation_citoyens:        (b) => dossiersResultRepository.getList({ bot_id: b, page_size: 3 }).then((r) => toEntries(r.results as unknown[])),
  collecte_documents:          (b) => dossiersResultRepository.getList({ bot_id: b, page_size: 3 }).then((r) => toEntries(r.results as unknown[])),
  simulation_credit:           (b) => dossiersResultRepository.getList({ bot_id: b, page_size: 3 }).then((r) => toEntries(r.results as unknown[])),
  gestion_crm:                 (b) => contactsResultRepository.getList({ bot_id: b, page_size: 3 }).then((r) => toEntries(r.results as unknown[])),
  prospection_active:          (b) => contactsResultRepository.getList({ bot_id: b, page_size: 3 }).then((r) => toEntries(r.results as unknown[])),
  capture_prospect:            (b) => contactsResultRepository.getList({ bot_id: b, page_size: 3 }).then((r) => toEntries(r.results as unknown[])),
  transfert_humain:            (b) => transfertsResultRepository.getList({ bot_id: b, page_size: 3 }).then((r) => toEntries(r.results as unknown[])),
  conciergerie:                (b) => conciergerieResultRepository.getList({ bot_id: b, page_size: 3 }).then((r) => toEntries(r.results as unknown[])),
  email_notifications:         (b) => emailLogsResultRepository.getList({ bot_id: b, page_size: 3 }).then((r) => toEntries(r.results as unknown[])),
  emails_rappel:               (b) => emailLogsResultRepository.getList({ bot_id: b, page_size: 3 }).then((r) => toEntries(r.results as unknown[])),
  communication_etablissement: (b) => emailLogsResultRepository.getList({ bot_id: b, page_size: 3 }).then((r) => toEntries(r.results as unknown[])),
  faq:                         (b) => consultationsFAQResultRepository.getList({ bot_id: b, page_size: 3 }).then((r) => toEntries(r.results as unknown[])),
};

// ── Composant ─────────────────────────────────────────────────────────────────

export function StatsRecentEntries({ slug, botId, locale, primaryColor }: Props) {
  const router                = useRouter();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);

  // S63 : si pas de botId (mode cross-bots), ne rien afficher
  // Ce guard doit être avant useEffect pour éviter l'erreur TS "EffectCallback"
  const shouldFetch = !!botId && !!FETCHERS[slug];

  useEffect(() => {
    if (!shouldFetch) return;
    setLoading(true);
    FETCHERS[slug](botId as string)
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [slug, botId, shouldFetch]);

  if (!shouldFetch) return null;

  const labelTitle  = locale === "fr" ? "Dernières entrées"    : "Recent entries";
  const labelVoir   = locale === "fr" ? "Voir les résultats"   : "View results";
  const labelAucune = locale === "fr" ? "Aucune entrée récente." : "No recent entries.";

  return (
    <div>
      {/* En-tête */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
          {labelTitle}
        </p>
        <button
          onClick={() => router.push(`/results?feature=${slug}&bot=${botId}`)}
          className="flex items-center gap-1 text-[10px] font-bold transition-colors hover:opacity-75"
          style={{ color: primaryColor }}
        >
          {labelVoir}
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="flex justify-center py-3">
          <Loader2 className="w-4 h-4 animate-spin text-[var(--text-muted)]" />
        </div>
      ) : entries.length === 0 ? (
        <p className="text-xs text-[var(--text-muted)] opacity-60 py-1">{labelAucune}</p>
      ) : (
        <div className="space-y-1.5">
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
        </div>
      )}
    </div>
  );
}