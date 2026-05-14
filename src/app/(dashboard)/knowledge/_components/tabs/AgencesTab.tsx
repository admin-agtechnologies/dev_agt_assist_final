// src/app/(dashboard)/knowledge/_components/tabs/AgencesTab.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import { Plus, Loader2, Building2 } from "lucide-react";
import { useLanguage }       from "@/contexts/LanguageContext";
import { useToast }          from "@/components/ui/Toast";
import { agencesRepository } from "@/repositories/agences.repository";
import { AgenceCard }        from "../agences/AgenceCard";
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

  const [agences, setAgences]   = useState<AgenceKnowledge[]>([]);
  const [loading, setLoading]   = useState(true);
  const [creating, startCreate] = useTransition();

  useEffect(() => {
    agencesRepository.getList()
      .then(setAgences)
      .catch(() => toast.error(t.loadError))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdated = (updated: AgenceKnowledge) =>
    setAgences((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));

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
        toast.success(t.createSuccess);
      } catch {
        toast.error(t.createError);
      }
    });

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-[var(--text-muted)]" />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-muted)]">
          {agences.length} agence{agences.length > 1 ? "s" : ""}
        </p>
        <button type="button" onClick={handleCreate} disabled={creating}
          className="btn-primary flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-60">
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {t.addBtn}
        </button>
      </div>

      {agences.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <Building2 className="w-10 h-10 text-[var(--text-muted)]" />
          <p className="text-sm text-[var(--text-muted)]">{t.empty}</p>
        </div>
      ) : (
        agences.map((agence) => (
          <AgenceCard key={agence.id} agence={agence} onUpdated={handleUpdated} />
        ))
      )}
    </div>
  );
}