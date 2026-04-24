// src/app/pme/appointments/page.tsx
"use client";
import { useState } from "react";
import {
  CalendarDays, ChevronLeft, ChevronRight,
  Plus, Clock, CheckCircle, XCircle, Pencil,
  Settings, Building2, MapPin,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PageLoader } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { RendezVous } from "@/types/api";

import { type AppointmentStatus, STATUS_LIST, STATUS_BLOCK, STATUS_LABELS, fmtDay } from "./types";
import { useAppointments } from "./hooks/useAppointments";
import { MiniCalendar }      from "./components/MiniCalendar";
import { DayCalendar }       from "./components/DayCalendar";
import { RdvModal }          from "./components/RdvModal";
import { HorairesEditor }    from "./components/HorairesEditor";
import { AgendaConfigPanel } from "./components/AgendaConfigPanel";

// ─────────────────────────────────────────────────────────────────────────────

type ModalState = {
  open: boolean;
  rdv?: RendezVous | null;
  date?: Date | null;
  time?: string | null;
};

// ─────────────────────────────────────────────────────────────────────────────

export default function AppointmentsPage() {
  const { dictionary: d } = useLanguage();

  const {
    loading,
    agences, agendas,
    horOuv, horRdv,
    selAgenceId, setSelAgenceId,
    selDate, setSelDate,
    viewDate, setViewDate,
    agenceAgendas, activeAgenda,
    dureeMin, bufferMin,
    filtered, dayRdvs, rdvsByDay,
    agenceActive,
    fetchAll, fetchHor, action,
  } = useAppointments();

  // UI state (pas de données → reste dans la page)
  const [showHor, setShowHor]       = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [modal, setModal]           = useState<ModalState>({ open: false });

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text)]">
            Rendez-vous
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Tous les rendez-vous pris via votre assistant.
          </p>
        </div>
       {/* <button    #Bouton pour ajouter un RDV
          onClick={() => setModal({ open: true, rdv: null, date: selDate })}
          className="btn-primary flex items-center gap-2 flex-shrink-0"
        >
          <Plus className="w-4 h-4" /> Nouveau RDV
        </button> */}
      </div>

      {/* ── Sélecteur agences ────────────────────────────────────────────────── */}
      {agences.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {agences.map((ag) => (
            <button
              key={ag.id}
              onClick={() => {
                // Toggle : cliquer sur l'agence active la désélectionne → "tout voir"
                setSelAgenceId(selAgenceId === ag.id ? "" : ag.id);
                setShowHor(false);
                setShowConfig(false);
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all",
                selAgenceId === ag.id
                  ? "border-[#075E54] bg-[#075E54]/10 text-[#075E54]"
                  : "border-[var(--border)] text-[var(--text-muted)] hover:border-[#075E54]/30",
              )}
            >
              <Building2 className="w-4 h-4" />
              {ag.nom}
              {ag.is_siege && (
                <span className="text-[9px] font-black bg-[#075E54]/15 text-[#075E54] px-1.5 py-0.5 rounded-full">
                  SIÈGE
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Barre outils agence — visible seulement si une agence est sélectionnée ── */}
      {agenceActive && selAgenceId && (
        <div className="card px-4 py-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-[#075E54] flex-shrink-0" />
            <span className="text-xs font-bold text-[var(--text)] truncate">
              {agenceActive.nom}
            </span>
            {activeAgenda && (
              <span className="text-[10px] text-[var(--text-muted)] hidden sm:block">
                · Créneaux {dureeMin}min{" "}
                {bufferMin > 0 ? `+ ${bufferMin}min tampon` : ""} · Agenda :{" "}
                {activeAgenda.nom}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Créneaux : toujours visible si agence sélectionnée
                (crée l'agenda si absent, le modifie sinon) */}
            <button
              onClick={() => {
                setShowConfig(!showConfig);
                setShowHor(false);
              }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all",
                showConfig
                  ? "border-[#075E54] bg-[#075E54]/10 text-[#075E54]"
                  : "border-[var(--border)] text-[var(--text-muted)] hover:border-[#075E54]/30",
              )}
            >
              <Settings className="w-3.5 h-3.5" /> Créneaux
            </button>
            <button
              onClick={() => {
                setShowHor(!showHor);
                setShowConfig(false);
              }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all",
                showHor
                  ? "border-[#075E54] bg-[#075E54]/10 text-[#075E54]"
                  : "border-[var(--border)] text-[var(--text-muted)] hover:border-[#075E54]/30",
              )}
            >
              <Clock className="w-3.5 h-3.5" /> Horaires
            </button>
          </div>
        </div>
      )}

      {/* ── Panneau config créneaux ── visible seulement si agence sélectionnée ── */}
      {showConfig && selAgenceId && (
        <AgendaConfigPanel
          agenda={activeAgenda}
          agenceId={selAgenceId}
          onSaved={fetchAll}
          onClose={() => setShowConfig(false)}
        />
      )}

      {/* ── Éditeur horaires ── visible seulement si agence sélectionnée ────────── */}
      {showHor && selAgenceId && (
        <div className="card p-5 space-y-6">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">
              Heures d&apos;ouverture
            </p>
            <HorairesEditor
              horaires={horOuv}
              type="ouverture"
              agenceId={selAgenceId}
              onSaved={() => fetchHor(selAgenceId)}
            />
          </div>
          <div className="border-t border-[var(--border)] pt-5">
            <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">
              Réception des rendez-vous
            </p>
            <HorairesEditor
              horaires={horRdv}
              type="rendez_vous"
              agenceId={selAgenceId}
              onSaved={() => fetchHor(selAgenceId)}
            />
          </div>
        </div>
      )}

      {/* ── Corps 3 colonnes ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-5">

        {/* Colonne gauche */}
        <div className="lg:col-span-1 space-y-4">

          {/* Mini-calendrier */}
          <MiniCalendar
            viewDate={viewDate}
            selDate={selDate}
            rdvsByDay={rdvsByDay}
            onPrev={() =>
              setViewDate(
                new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1),
              )
            }
            onNext={() =>
              setViewDate(
                new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1),
              )
            }
            onToday={() => {
              const t = new Date();
              setSelDate(t);
              setViewDate(t);
            }}
            onSelectDay={(d) => {
              setSelDate(d);
              setViewDate(d);
            }}
          />

          {/* Liste RDV du jour */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" />
                {fmtDay(selDate)}
              </h4>
              <span className="text-xs font-bold text-[var(--text-muted)] bg-[var(--border)] px-2 py-0.5 rounded-full">
                {dayRdvs.length} RDV
              </span>
            </div>

            {dayRdvs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-[var(--text-muted)]">
                <CalendarDays className="w-7 h-7 mb-2 opacity-20" />
                <p className="text-xs">Aucun rendez-vous</p>
              </div>
            ) : (
              <div className="space-y-2">
                {dayRdvs
                  .sort(
                    (a, b) =>
                      new Date(a.scheduled_at).getTime() -
                      new Date(b.scheduled_at).getTime(),
                  )
                  .map((rdv) => (
                    <div
                      key={rdv.id}
                      onClick={() => setModal({ open: true, rdv })}
                      className={cn(
                        "flex items-center gap-2 p-2.5 rounded-xl cursor-pointer",
                        "hover:shadow-sm transition-all",
                        STATUS_LIST[rdv.statut as AppointmentStatus],
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(rdv.scheduled_at).toLocaleTimeString(
                            "fr-FR",
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </p>
                        <p className="text-[11px] font-semibold truncate">
                          {rdv.client_nom}
                        </p>
                      </div>

                      <div className="flex gap-1">
                        {rdv.statut === "en_attente" && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                action(rdv.id, "confirmer");
                              }}
                              className="p-1 rounded bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                action(rdv.id, "annuler");
                              }}
                              className="p-1 rounded bg-red-50 text-red-500 hover:bg-red-100"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setModal({ open: true, rdv });
                          }}
                          className="p-1 rounded hover:bg-[var(--border)] text-[var(--text-muted)]"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Colonne droite — agenda visuel */}
        <div className="lg:col-span-2 xl:col-span-3">
          <div className="card">
            {/* Header agenda */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const d = new Date(selDate);
                    d.setDate(d.getDate() - 1);
                    setSelDate(d);
                    setViewDate(d);
                  }}
                  className="p-1.5 rounded-lg hover:bg-[var(--border)] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-bold text-[var(--text)] capitalize">
                  {fmtDay(selDate)}
                </span>
                <button
                  onClick={() => {
                    const d = new Date(selDate);
                    d.setDate(d.getDate() + 1);
                    setSelDate(d);
                    setViewDate(d);
                  }}
                  className="p-1.5 rounded-lg hover:bg-[var(--border)] transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Légende statuts */}
              <div className="hidden sm:flex items-center gap-3">
                {(
                  Object.entries(STATUS_LABELS) as [AppointmentStatus, string][]
                ).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-1">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        STATUS_BLOCK[k].dot,
                      )}
                    />
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Calendrier visuel */}
            <div className="p-4">
              <DayCalendar
                date={selDate}
                rdvs={filtered}
                horairesRdv={horRdv}
                dureeMin={dureeMin}
                bufferMin={bufferMin}
                onSlotClick={(time) =>
                  setModal({ open: true, rdv: null, date: selDate, time })
                }
                onRdvClick={(rdv) => setModal({ open: true, rdv })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal RDV ─────────────────────────────────────────────────────────── */}
      {modal.open && (
        <RdvModal
          agences={agences}
          agendas={agendas}
          defaultAgenceId={selAgenceId}
          rdv={modal.rdv}
          prefillDate={modal.date}
          prefillTime={modal.time}
          onClose={() => setModal({ open: false })}
          onSaved={fetchAll}
        />
      )}
    </div>
  );
}