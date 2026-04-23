// src/app/pme/appointments/hooks/useAppointments.ts
"use client";
import { useState, useEffect, useCallback } from "react";
import {
  rendezVousRepository,
  agencesRepository,
  agendasRepository,
  horairesRepository,
} from "@/repositories";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/Toast";
import type { Agence, Agenda, RendezVous, HorairesOuverture } from "@/types/api";

// ─────────────────────────────────────────────────────────────────────────────

type ActionType = "confirmer" | "annuler" | "terminer";

export interface UseAppointmentsReturn {
  // Données
  loading: boolean;
  agences: Agence[];
  agendas: Agenda[];
  rdvs: RendezVous[];
  horOuv: HorairesOuverture | null;
  horRdv: HorairesOuverture | null;
  // Sélection
  selAgenceId: string;
  setSelAgenceId: (id: string) => void;
  selDate: Date;
  setSelDate: (d: Date) => void;
  viewDate: Date;
  setViewDate: (d: Date) => void;
  // Dérivés
  agenceAgendas: Agenda[];
  activeAgenda: Agenda | null;
  dureeMin: number;
  bufferMin: number;
  filtered: RendezVous[];
  dayRdvs: RendezVous[];
  rdvsByDay: Map<string, RendezVous[]>;
  agenceActive: Agence | undefined;
  // Actions
  fetchAll: () => Promise<void>;
  fetchHor: (id: string) => Promise<void>;
  action: (id: string, a: ActionType) => Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────

export function useAppointments(): UseAppointmentsReturn {
  const { dictionary: d } = useLanguage();
  const toast = useToast();

  const [loading, setLoading]         = useState(true);
  const [agences, setAgences]         = useState<Agence[]>([]);
  const [agendas, setAgendas]         = useState<Agenda[]>([]);
  const [rdvs, setRdvs]               = useState<RendezVous[]>([]);
  const [horOuv, setHorOuv]           = useState<HorairesOuverture | null>(null);
  const [horRdv, setHorRdv]           = useState<HorairesOuverture | null>(null);
  const [selAgenceId, setSelAgenceId] = useState("");
  const [selDate, setSelDate]         = useState(new Date());
  const [viewDate, setViewDate]       = useState(new Date());

  // ── Chargement principal ──────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    try {
      const [ag, agd, rdvRes] = await Promise.all([
        agencesRepository.getList(),
        agendasRepository.getList(),
        rendezVousRepository.getList(),
      ]);

      const agList = Array.isArray(ag)
        ? ag
        : (ag as { results?: Agence[] }).results ?? [];
      const agdList = Array.isArray(agd)
        ? agd
        : (agd as { results?: Agenda[] }).results ?? [];
      const rdvList = Array.isArray(rdvRes)
        ? rdvRes
        : (rdvRes as { results?: RendezVous[] }).results ?? [];

      setAgences(agList);
      setAgendas(agdList);
      setRdvs(rdvList);
      // Pas d'auto-sélection : "" = "toutes les agences" par défaut
    } catch {
      toast.error(d.common.error);
    } finally {
      setLoading(false);
    }
  }, [d.common.error, toast]);

  // ── Horaires agence ───────────────────────────────────────────────────────
  const fetchHor = useCallback(async (id: string) => {
    if (!id) return;
    try {
      const list = await horairesRepository.getListByAgence(id);
      setHorOuv(list.find((h) => h.type === "ouverture")    ?? null);
      setHorRdv(list.find((h) => h.type === "rendez_vous")  ?? null);
    } catch {
      setHorOuv(null);
      setHorRdv(null);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => { if (selAgenceId) fetchHor(selAgenceId); }, [selAgenceId, fetchHor]);

  // ── Action rapide statut ──────────────────────────────────────────────────
  const action = useCallback(async (id: string, a: ActionType) => {
    try {
      await rendezVousRepository[a](id);
      toast.success("Statut mis à jour ✓");
      fetchAll();
    } catch {
      toast.error(d.common.error);
    }
  }, [d.common.error, toast, fetchAll]);

  // ── Valeurs dérivées ──────────────────────────────────────────────────────
  //
  // selAgenceId = ""  → mode "tout voir" : tous les agendas, tous les RDVs
  // selAgenceId = id  → mode filtré : agendas + RDVs de cette agence seulement

  const agenceAgendas = selAgenceId
    ? agendas.filter((a) => a.agence === selAgenceId)
    : agendas;

  // activeAgenda : n'existe que si une agence précise est sélectionnée
  // (nécessaire pour configurer créneaux/horaires d'une agence spécifique)
  const activeAgenda = selAgenceId ? (agenceAgendas[0] ?? null) : null;
  const dureeMin     = activeAgenda?.duree_rdv_min ?? 30;
  const bufferMin    = activeAgenda?.buffer_min    ?? 0;

  const agAgendaIds = agenceAgendas.map((a) => a.id);
  // Quand tout voir : l'API renvoie déjà les RDVs de l'entreprise → on affiche tout
  // Quand filtre : on restreint aux agendas de l'agence sélectionnée
  const filtered = selAgenceId
    ? rdvs.filter((r) => agAgendaIds.includes(r.agenda ?? ""))
    : rdvs;

  const dayRdvs = filtered.filter((r) => {
    const d = new Date(r.scheduled_at);
    return (
      d.getFullYear() === selDate.getFullYear() &&
      d.getMonth()    === selDate.getMonth() &&
      d.getDate()     === selDate.getDate()
    );
  });

  const rdvsByDay = new Map<string, RendezVous[]>();
  filtered.forEach((r) => {
    const d = new Date(r.scheduled_at);
    const k = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    rdvsByDay.set(k, [...(rdvsByDay.get(k) ?? []), r]);
  });

  const agenceActive = agences.find((a) => a.id === selAgenceId);

  return {
    loading,
    agences, agendas, rdvs,
    horOuv, horRdv,
    selAgenceId, setSelAgenceId,
    selDate, setSelDate,
    viewDate, setViewDate,
    agenceAgendas, activeAgenda,
    dureeMin, bufferMin,
    filtered, dayRdvs, rdvsByDay,
    agenceActive,
    fetchAll, fetchHor, action,
  };
}