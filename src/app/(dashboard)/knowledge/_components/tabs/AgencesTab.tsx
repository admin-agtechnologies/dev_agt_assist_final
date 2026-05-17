// src/app/(dashboard)/knowledge/_components/tabs/AgencesTab.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import { Plus, Loader2, Building2, MousePointerClick } from "lucide-react";
import { useLanguage }        from "@/contexts/LanguageContext";
import { useToast }           from "@/components/ui/Toast";
import { agencesRepository }  from "@/repositories/agences.repository";
import { AgenceCard }         from "../agences/AgenceCard";
import { AgenceDetailPanel }  from "../agences/AgenceDetailPanel";
import { AgenceListSkeleton } from "../KnowledgeSkeleton";
import type { AgenceKnowledge } from "@/types/api/agence.types";

const HORAIRES_DEFAUT = {
  lundi:    { ouvert: true,  debut: "08:00", fin: "18:00" },
  mardi:    { ouvert: true,  debut: "08:00", fin: "18:00" },
  mercredi: { ouvert: true,  debut: "08:00", fin: "18:00" },
  jeudi:    { ouvert: true,  debut: "08:00", fin: "18:00" },
  vendredi: { ouvert: true,  debut: "08:00", fin: "18:00" },
  samedi:   { ouvert: true,  debut: "08:00", fin: "13:00" },
  dimanche: { ouvert: false, debut: "",      fin: ""      },
} as const;

export function AgencesTab() {
  const { dictionary: d } = useLanguage();
  const t                 = d.knowledge.agences;
  const toast             = useToast();

  const [agences, setAgences]     = useState<AgenceKnowledge[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading]     = useState(true);
  const [creating, startCreate]   = useTransition();

  useEffect(() => {
    agencesRepository.getList()
      .then((list) => {
        setAgences(list);
        // Auto-sélectionner le siège s'il existe, sinon la première agence
        const siege = list.find((a) => a.est_siege) ?? list[0];
        if (siege) setSelectedId(siege.id);
      })
      .catch(() => toast.error(t.loadError))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpdated = (updated: AgenceKnowledge) =>
    setAgences((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));

  // APRÈS handleUpdated, ajoute :
  const handleDeleted = (id: string) => {
    setAgences((prev) => prev.filter((a) => a.id !== id));
    // Si l'agence supprimée était sélectionnée → sélectionner le siège
    if (selectedId === id) {
      const remaining = agences.filter((a) => a.id !== id);
      const fallback  = remaining.find((a) => a.est_siege) ?? remaining[0];
      setSelectedId(fallback?.id ?? null);
    }
    agencesRepository.delete(id).catch(() => {
      toast.error("Erreur lors de la suppression");
      // rollback : recharger la liste
      agencesRepository.getList().then(setAgences);
    });
  };

  const handleCreate = () =>
    startCreate(async () => {
      try {
        const nouvelle = await agencesRepository.create({
          nom:                t.newDefaultName,
          email:              "", phone: "", whatsapp: "",
          whatsapp_transfert: "", phone_transfert: "",
          email_transfert:    "", message_transfert: "",
          adresse: "", ville: "", pays: "Cameroun",
          horaires: { ...HORAIRES_DEFAUT },
          est_active: true,
        });
        setAgences((prev) => [...prev, nouvelle]);
        setSelectedId(nouvelle.id); // Auto-select la nouvelle
        toast.success(t.createSuccess);
      } catch {
        toast.error(t.createError);
      }
    });

  if (loading) return <AgenceListSkeleton />;

  const selectedAgence = agences.find((a) => a.id === selectedId) ?? null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 lg:gap-6">

      {/* ── Colonne liste ─────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-[var(--text-muted)]">
            {agences.length} agence{agences.length !== 1 ? "s" : ""}
          </span>
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating}
            className="btn-primary flex items-center gap-1.5 px-3 py-1.5 text-xs disabled:opacity-60"
          >
            {creating
              ? <Loader2 className="w-3 h-3 animate-spin" />
              : <Plus    className="w-3 h-3" />}
            {t.addBtn}
          </button>
        </div>

        {agences.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] border-dashed">
            <Building2 className="w-8 h-8 text-[var(--text-muted)]" />
            <p className="text-sm text-[var(--text-muted)]">{t.empty}</p>
          </div>
        ) : (
          agences.map((agence) => (
            <AgenceCard
              agence={agence}
              isSelected={selectedId === agence.id}
              onClick={() => setSelectedId(agence.id)}
              onDelete={handleDeleted}     // ++
            />
          ))
        )}
      </div>

      {/* ── Colonne détail ────────────────────────────────────── */}
      <div>
        {selectedAgence ? (
          <AgenceDetailPanel
            agence={selectedAgence}
            onUpdated={handleUpdated}
          />
        ) : (
          /* État vide — aucune agence sélectionnée */
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center
            bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] border-dashed h-full min-h-[200px]">
            <MousePointerClick className="w-8 h-8 text-[var(--text-muted)]" />
            <p className="text-sm text-[var(--text-muted)]">{t.selectPrompt}</p>
          </div>
        )}
      </div>

    </div>
  );
}