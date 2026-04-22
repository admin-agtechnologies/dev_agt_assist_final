"use client";
import { useState, useEffect, useCallback, useTransition } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/Toast";
import { rendezVousRepository, servicesRepository, tenantKnowledgeRepository } from "@/repositories";
import { formatDateTime, cn } from "@/lib/utils";
import { Badge, SectionHeader, EmptyState, ConfirmDeleteModal, Spinner } from "@/components/ui";
import { createPortal } from "react-dom";
import {
  CalendarDays, ChevronLeft, ChevronRight, Plus,
  Pencil, Trash2, X, Clock, User, Phone,
  Wrench, Save, Settings,
  ChevronDown, ChevronUp,
} from "lucide-react";
import type {
  RendezVous, CreateRendezVousPayload, Service, TenantKnowledge,
} from "@/types/api";

// ── Types locaux ──────────────────────────────────────────────────────────────
type AppointmentStatus = "en_attente" | "confirme" | "annule" | "termine";
type AppointmentCanal  = "whatsapp" | "vocal" | "manuel";

// ── Constantes ────────────────────────────────────────────────────────────────
const SLOT_MIN        = 30;
const HOUR_START      = 7;
const HOUR_END        = 20;
const SLOT_HEIGHT_PX  = 56;

type ViewMode = "week" | "day";

type StatusColor = "green" | "amber" | "blue" | "slate";
const STATUS_COLOR: Record<AppointmentStatus, StatusColor> = {
  confirme:   "green",
  en_attente: "amber",
  termine:    "blue",
  annule:     "slate",
};
const STATUS_BG: Record<AppointmentStatus, string> = {
  confirme:   "bg-[#25D366]/20 border-[#25D366] text-[#075E54] dark:text-[#25D366]",
  en_attente: "bg-amber-100 border-amber-400 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  termine:    "bg-blue-100 border-blue-400 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  annule:     "bg-[var(--bg)] border-[var(--border)] text-[var(--text-muted)] line-through",
};

// ── Helpers date ──────────────────────────────────────────────────────────────
function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function slotTop(date: Date): number {
  const minutes = (date.getHours() - HOUR_START) * 60 + date.getMinutes();
  return (minutes / SLOT_MIN) * SLOT_HEIGHT_PX;
}

function slotHeight(durationMin: number): number {
  return (durationMin / SLOT_MIN) * SLOT_HEIGHT_PX;
}

const DAYS_FR   = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const DAYS_EN   = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS_FR = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];
const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ══════════════════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ══════════════════════════════════════════════════════════════════════════════
export default function PmeAppointmentsPage() {
  const { user } = useAuth();
  const { dictionary: d, locale } = useLanguage();
  const t = d.appointments;
  const toast = useToast();

  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [items, setItems] = useState<RendezVous[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [knowledge, setKnowledge] = useState<TenantKnowledge | null>(null);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  const [configOpen, setConfigOpen] = useState(false);
  const [durationMin, setDurationMin] = useState(30);
  const [bufferMin, setBufferMin] = useState(10);
  const [isSavingConfig, startSaveConfig] = useTransition();

  const [mounted, setMounted] = useState(false);
  const [formModal, setFormModal] = useState<{ open: boolean; editId: string | null; prefillDate?: string }>
    ({ open: false, editId: null });
  const [detailId, setDetailId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!user?.entreprise?.id) return;
    startTransition(async () => {
      try {
        const [aptsRes, svcsRes, kRes] = await Promise.all([
          rendezVousRepository.getList(),
          servicesRepository.getList(),
          tenantKnowledgeRepository.getMine(),
        ]);
        setItems(aptsRes.results);
        setServices(svcsRes.results);
        if (kRes) {
          setKnowledge(kRes);
          setDurationMin(kRes.duree_rdv_min ?? 30);
          setBufferMin(kRes.buffer_slot_min ?? 10);
        }
      } catch {
        toast.error(t.errorLoad);
      } finally {
        setLoading(false);
      }
    });
  }, [user?.entreprise?.id, t.errorLoad, toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Map serviceId → nom ───────────────────────────────────────────────────
  const serviceMap = Object.fromEntries(services.map(s => [s.id, s.nom]));

  // ── Navigation ────────────────────────────────────────────────────────────
  const goToday = () => setCurrentDate(new Date());
  const goPrev  = () => setCurrentDate(prev => addDays(prev, viewMode === "week" ? -7 : -1));
  const goNext  = () => setCurrentDate(prev => addDays(prev, viewMode === "week" ? 7 : 1));

  const weekStart   = startOfWeek(currentDate);
  const displayDays = viewMode === "week"
    ? Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
    : [new Date(currentDate)];

  const aptsByDay = (day: Date) =>
    items.filter(a => isSameDay(new Date(a.scheduled_at), day));

  // ── Save config ───────────────────────────────────────────────────────────
  const handleSaveConfig = () => {
    if (!knowledge) return;
    startSaveConfig(async () => {
      try {
        await tenantKnowledgeRepository.patch(knowledge.id, {
          duree_rdv_min:   durationMin,
          buffer_slot_min: bufferMin,
        });
        toast.success(t.configSaved);
        setConfigOpen(false);
        fetchData();
      } catch { toast.error(d.common.error); }
    });
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await rendezVousRepository.delete(deleteId);
      toast.success(t.deleteSuccess);
      setDeleteId(null);
      setDetailId(null);
      fetchData();
    } catch { toast.error(t.deleteError); }
    finally { setIsDeleting(false); }
  };

  // ── Labels période ────────────────────────────────────────────────────────
  const DAYS_LABELS = locale === "fr" ? DAYS_FR : DAYS_EN;
  const MONTHS      = locale === "fr" ? MONTHS_FR : MONTHS_EN;

  const periodLabel = viewMode === "week"
    ? `${weekStart.getDate()} ${MONTHS[weekStart.getMonth()]} – ${addDays(weekStart, 6).getDate()} ${MONTHS[addDays(weekStart, 6).getMonth()]} ${weekStart.getFullYear()}`
    : `${DAYS_LABELS[currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1]} ${currentDate.getDate()} ${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  const timeSlots = Array.from(
    { length: ((HOUR_END - HOUR_START) * 60) / SLOT_MIN },
    (_, i) => {
      const totalMin = HOUR_START * 60 + i * SLOT_MIN;
      const h = Math.floor(totalMin / 60);
      const m = totalMin % 60;
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }
  );

  // ── Helpers statut / canal avec cast sûr ─────────────────────────────────
  const statusLabel = (statut: string): string => {
    const map: Record<AppointmentStatus, string> = {
      en_attente: t.statuses.pending,
      confirme:   t.statuses.confirmed,
      termine:    t.statuses.done,
      annule:     t.statuses.cancelled,
    };
    return map[statut as AppointmentStatus] ?? statut;
  };

  const canalLabel = (canal: string): string => {
    const map: Record<AppointmentCanal, string> = {
      whatsapp: t.channels.whatsapp,
      vocal:    t.channels.voice,
      manuel:   t.channels.manual,
    };
    return map[canal as AppointmentCanal] ?? canal;
  };

  const statusColor = (statut: string): StatusColor =>
    STATUS_COLOR[statut as AppointmentStatus] ?? "slate";

  const statusBg = (statut: string): string =>
    STATUS_BG[statut as AppointmentStatus] ?? STATUS_BG.annule;

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      {[...Array(4)].map((_, i) => <div key={i} className="h-20 card bg-[var(--bg)]" />)}
    </div>
  );

  const detailItem = items.find(a => a.id === detailId) ?? null;

  // ── Résolution du nom de service pour un RDV ──────────────────────────────
  const rdvServiceLabel = (rdv: RendezVous): string => {
    if (rdv.services_detail && rdv.services_detail.length > 0) {
      return rdv.services_detail[0].service_nom;
    }
    return serviceMap[rdv.agenda] ?? "—";
  };

  return (
    <>
      <div className="space-y-4 animate-fade-in">
        <SectionHeader title={t.title} subtitle={t.subtitle} action={
          <button onClick={() => setFormModal({ open: true, editId: null })} className="btn-primary">
            <Plus className="w-4 h-4" /> {t.newBtn}
          </button>
        } />

        {/* ── Config créneaux ──────────────────────────────────────────────── */}
        <div className="card overflow-hidden">
          <button
            onClick={() => setConfigOpen(o => !o)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-[var(--bg)] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#6C3CE1]/10 flex items-center justify-center">
                <Settings className="w-4 h-4 text-[#6C3CE1]" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-[var(--text)]">{t.configTitle}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {durationMin} min · +{bufferMin} min tampon
                </p>
              </div>
            </div>
            {configOpen
              ? <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" />
              : <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />}
          </button>

          {configOpen && (
            <div className="px-5 pb-5 border-t border-[var(--border)] pt-4 animate-fade-in">
              <p className="text-xs text-[var(--text-muted)] mb-4">{t.configSubtitle}</p>
              <div className="flex flex-wrap gap-6 items-end">
                <div>
                  <label className="label-base">{t.durationLabel}</label>
                  <div className="flex items-center gap-2">
                    <input type="number" min={10} max={240} step={5}
                      className="input-base w-24 text-center"
                      value={durationMin}
                      onChange={e => setDurationMin(Number(e.target.value))} />
                    <span className="text-sm text-[var(--text-muted)]">{t.durationUnit}</span>
                  </div>
                </div>
                <div>
                  <label className="label-base">{t.bufferLabel}</label>
                  <div className="flex items-center gap-2">
                    <input type="number" min={0} max={60} step={5}
                      className="input-base w-24 text-center"
                      value={bufferMin}
                      onChange={e => setBufferMin(Number(e.target.value))} />
                    <span className="text-sm text-[var(--text-muted)]">{t.bufferUnit}</span>
                  </div>
                </div>
                <button onClick={handleSaveConfig} disabled={isSavingConfig} className="btn-primary">
                  {isSavingConfig
                    ? <Spinner className="border-white/30 border-t-white" />
                    : <Save className="w-4 h-4" />}
                  {d.common.save}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Contrôles agenda ─────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1 p-1 bg-[var(--bg)] rounded-xl border border-[var(--border)]">
            {(["week", "day"] as ViewMode[]).map(v => (
              <button key={v} onClick={() => setViewMode(v)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                  viewMode === v
                    ? "bg-[var(--bg-card)] text-[var(--text)] shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                )}>
                {v === "week" ? t.viewWeek : t.viewDay}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={goPrev}
              className="w-8 h-8 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center hover:border-[#25D366] transition-colors">
              <ChevronLeft className="w-4 h-4 text-[var(--text-muted)]" />
            </button>
            <button onClick={goToday}
              className="px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-xs font-bold text-[var(--text)] hover:border-[#25D366] transition-colors">
              {t.today}
            </button>
            <button onClick={goNext}
              className="w-8 h-8 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center hover:border-[#25D366] transition-colors">
              <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
            </button>
            <span className="text-sm font-semibold text-[var(--text)] ml-2">{periodLabel}</span>
          </div>
        </div>

        {/* ── Grille agenda ─────────────────────────────────────────────────── */}
        <div className="card overflow-hidden">
          {/* En-têtes colonnes */}
          <div className={cn(
            "grid border-b border-[var(--border)] bg-[var(--bg)]",
            viewMode === "week" ? "grid-cols-[56px_repeat(7,1fr)]" : "grid-cols-[56px_1fr]"
          )}>
            <div className="border-r border-[var(--border)]" />
            {displayDays.map((day, i) => {
              const isToday = isSameDay(day, new Date());
              const dayLabel = DAYS_LABELS[day.getDay() === 0 ? 6 : day.getDay() - 1];
              return (
                <div key={i} className={cn(
                  "py-3 text-center border-r border-[var(--border)] last:border-r-0",
                  isToday && "bg-[#25D366]/5"
                )}>
                  <p className={cn("text-[10px] font-black uppercase tracking-widest",
                    isToday ? "text-[#25D366]" : "text-[var(--text-muted)]")}>
                    {dayLabel}
                  </p>
                  <p className={cn(
                    "text-lg font-bold mt-0.5",
                    isToday
                      ? "w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center mx-auto text-sm"
                      : "text-[var(--text)]"
                  )}>
                    {day.getDate()}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Corps grille */}
          <div className="overflow-y-auto max-h-[600px]">
            <div className={cn(
              "grid",
              viewMode === "week" ? "grid-cols-[56px_repeat(7,1fr)]" : "grid-cols-[56px_1fr]"
            )}>
              {/* Colonne heures */}
              <div className="border-r border-[var(--border)]">
                {timeSlots.map(slot => (
                  <div key={slot}
                    style={{ height: SLOT_HEIGHT_PX }}
                    className="border-b border-[var(--border)] flex items-start justify-end pr-2 pt-1">
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">{slot}</span>
                  </div>
                ))}
              </div>

              {/* Colonnes jours */}
              {displayDays.map((day, di) => {
                const dayApts = aptsByDay(day);
                const isToday = isSameDay(day, new Date());
                const totalHeight = timeSlots.length * SLOT_HEIGHT_PX;

                return (
                  <div key={di}
                    className={cn(
                      "relative border-r border-[var(--border)] last:border-r-0",
                      isToday && "bg-[#25D366]/[0.02]"
                    )}
                    style={{ height: totalHeight }}>

                    {/* Lignes horaires cliquables */}
                    {timeSlots.map((_, si) => (
                      <div key={si}
                        style={{ top: si * SLOT_HEIGHT_PX, height: SLOT_HEIGHT_PX }}
                        className="absolute inset-x-0 border-b border-[var(--border)] cursor-pointer hover:bg-[#25D366]/5 transition-colors"
                        onClick={() => {
                          const totalMin = HOUR_START * 60 + si * SLOT_MIN;
                          const h = Math.floor(totalMin / 60);
                          const m = totalMin % 60;
                          const d2 = new Date(day);
                          d2.setHours(h, m, 0, 0);
                          const iso = `${d2.getFullYear()}-${String(d2.getMonth() + 1).padStart(2, "0")}-${String(d2.getDate()).padStart(2, "0")}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
                          setFormModal({ open: true, editId: null, prefillDate: iso });
                        }}
                      />
                    ))}

                    {/* Blocs RDV */}
                    {dayApts.map(apt => {
                      const top    = slotTop(new Date(apt.scheduled_at));
                      const height = Math.max(slotHeight(durationMin), SLOT_HEIGHT_PX * 0.8);
                      return (
                        <div key={apt.id}
                          style={{ top, height, left: 2, right: 2 }}
                          className={cn(
                            "absolute rounded-lg border-l-4 px-2 py-1 cursor-pointer overflow-hidden",
                            "shadow-sm hover:shadow-md transition-shadow z-10",
                            statusBg(apt.statut)
                          )}
                          onClick={() => setDetailId(apt.id)}>
                          <p className="text-[10px] font-black truncate leading-tight">
                            {apt.client_nom}
                          </p>
                          <p className="text-[9px] truncate opacity-80 flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5 inline" />
                            {new Date(apt.scheduled_at).toLocaleTimeString(
                              locale === "fr" ? "fr-FR" : "en-US",
                              { hour: "2-digit", minute: "2-digit" }
                            )}
                          </p>
                          {height >= SLOT_HEIGHT_PX * 1.5 && (
                            <p className="text-[9px] truncate opacity-70">
                              {rdvServiceLabel(apt)}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Empty state si aucun RDV sur la semaine */}
        {items.length === 0 && (
          <div className="card">
            <EmptyState message={t.noData} icon={CalendarDays} />
          </div>
        )}
      </div>

      {/* ── Modale détail RDV ─────────────────────────────────────────────── */}
      {mounted && detailId && detailItem && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="absolute inset-0" onClick={() => setDetailId(null)} />
          <div className="relative bg-[var(--bg-card)] rounded-3xl w-full max-w-md shadow-2xl border border-[var(--border)] animate-zoom-in">
            <div className="p-5 border-b border-[var(--border)] flex justify-between items-center">
              <h2 className="text-lg font-bold text-[var(--text)]">{t.detailTitle}</h2>
              <button onClick={() => setDetailId(null)}
                className="w-8 h-8 rounded-full bg-[var(--bg)] flex items-center justify-center text-[var(--text-muted)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded-xl">
                <div className="w-9 h-9 rounded-xl bg-[#25D366]/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-[#25D366]" />
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">{t.detailClient}</p>
                  <p className="text-sm font-bold text-[var(--text)]">{detailItem.client_nom}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[var(--bg)] rounded-xl">
                  <p className="text-xs text-[var(--text-muted)] mb-1">{t.detailPhone}</p>
                  <p className="text-sm font-semibold text-[var(--text)] flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    {detailItem.client_telephone}
                  </p>
                </div>
                <div className="p-3 bg-[var(--bg)] rounded-xl">
                  <p className="text-xs text-[var(--text-muted)] mb-1">{t.detailChannel}</p>
                  <Badge variant={detailItem.canal === "whatsapp" ? "green" : "violet"}>
                    {canalLabel(detailItem.canal)}
                  </Badge>
                </div>
              </div>

              <div className="p-3 bg-[var(--bg)] rounded-xl">
                <p className="text-xs text-[var(--text-muted)] mb-1">{t.detailService}</p>
                <p className="text-sm font-semibold text-[var(--text)] flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  {rdvServiceLabel(detailItem)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[var(--bg)] rounded-xl">
                  <p className="text-xs text-[var(--text-muted)] mb-1">{t.detailDate}</p>
                  <p className="text-sm font-semibold text-[var(--text)] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    {formatDateTime(detailItem.scheduled_at)}
                  </p>
                </div>
                <div className="p-3 bg-[var(--bg)] rounded-xl">
                  <p className="text-xs text-[var(--text-muted)] mb-1">{t.detailStatus}</p>
                  <Badge variant={statusColor(detailItem.statut)}>
                    {statusLabel(detailItem.statut)}
                  </Badge>
                </div>
              </div>

              {detailItem.notes && (
                <div className="p-3 bg-[var(--bg)] rounded-xl">
                  <p className="text-xs text-[var(--text-muted)] mb-1">{t.detailNotes}</p>
                  <p className="text-sm text-[var(--text)]">{detailItem.notes}</p>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-[var(--border)] flex justify-between items-center">
              <button onClick={() => setDeleteId(detailItem.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-semibold transition-colors">
                <Trash2 className="w-4 h-4" /> {d.common.delete}
              </button>
              <button onClick={() => { setDetailId(null); setFormModal({ open: true, editId: detailItem.id }); }}
                className="btn-primary">
                <Pencil className="w-4 h-4" /> {d.common.edit}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Modale formulaire ─────────────────────────────────────────────── */}
      {mounted && formModal.open && createPortal(
        <AppointmentFormModal
          itemId={formModal.editId}
          prefillDate={formModal.prefillDate}
          services={services}
          onClose={() => setFormModal({ open: false, editId: null })}
          onSave={fetchData}
        />,
        document.body
      )}

      {/* ── Modale suppression ────────────────────────────────────────────── */}
      <ConfirmDeleteModal
        isOpen={!!deleteId} isLoading={isDeleting}
        onClose={() => !isDeleting && setDeleteId(null)}
        onConfirm={handleDelete} message={t.confirmDelete}
      />
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MODALE FORMULAIRE
// ══════════════════════════════════════════════════════════════════════════════
interface AppointmentFormModalProps {
  itemId: string | null;
  prefillDate?: string;
  services: Service[];
  onClose: () => void;
  onSave: () => void;
}

function AppointmentFormModal({ itemId, prefillDate, services, onClose, onSave }: AppointmentFormModalProps) {
  const { dictionary: d } = useLanguage();
  const t  = d.appointments;
  const tf = t.modal.fields;
  const toast = useToast();
  const isEdit = !!itemId;

  // Formulaire aligné sur CreateRendezVousPayload
  const DEF: CreateRendezVousPayload = {
    agenda:       "",
    client:       "",
    scheduled_at: prefillDate ?? "",
    statut:       "en_attente",
    canal:        "manuel",
    notes:        "",
  };
  const [form, setForm] = useState<CreateRendezVousPayload>(DEF);
  const [loadingItem, setLoadingItem] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (itemId) {
      setLoadingItem(true);
      rendezVousRepository.getById(itemId)
        .then((rdv: RendezVous) => setForm({
          agenda:       rdv.agenda,
          client:       rdv.client,
          scheduled_at: rdv.scheduled_at.slice(0, 16),
          statut:       rdv.statut as AppointmentStatus,
          canal:        rdv.canal as AppointmentCanal,
          notes:        rdv.notes,
        }))
        .finally(() => setLoadingItem(false));
    }
  }, [itemId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: CreateRendezVousPayload = {
        ...form,
        scheduled_at: new Date(form.scheduled_at).toISOString(),
      };
      if (isEdit) {
        await rendezVousRepository.patch(itemId!, payload);
      } else {
        await rendezVousRepository.create(payload);
      }
      toast.success(t.createSuccess);
      onSave();
      onClose();
    } catch { toast.error(d.common.error); }
    finally { setSaving(false); }
  };

  const statuts: AppointmentStatus[] = ["en_attente", "confirme", "termine", "annule"];
  const canaux: AppointmentCanal[]   = ["whatsapp", "vocal", "manuel"];

  const statutLabels: Record<AppointmentStatus, string> = {
    en_attente: t.statuses.pending,
    confirme:   t.statuses.confirmed,
    termine:    t.statuses.done,
    annule:     t.statuses.cancelled,
  };
  const canalLabels: Record<AppointmentCanal, string> = {
    whatsapp: t.channels.whatsapp,
    vocal:    t.channels.voice,
    manuel:   t.channels.manual,
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="absolute inset-0" onClick={!saving ? onClose : undefined} />
      <form onSubmit={handleSubmit}
        className="relative bg-[var(--bg-card)] rounded-3xl w-full max-w-lg shadow-2xl border border-[var(--border)] flex flex-col max-h-[90vh] animate-zoom-in">

        <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
          <h2 className="text-lg font-bold text-[var(--text)]">
            {isEdit ? t.modal.editTitle : t.modal.createTitle}
          </h2>
          <button type="button" onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--bg)] flex items-center justify-center text-[var(--text-muted)]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {loadingItem
            ? <div className="flex justify-center py-8"><Spinner className="w-6 h-6 border-[#25D366] border-t-transparent" /></div>
            : (
              <>
                {/* Sélection service via services_detail — en V1 on choisit le service dans la liste */}
                <div>
                  <label className="label-base">{tf.service}</label>
                  <select required className="input-base" value={form.agenda}
                    onChange={e => setForm({ ...form, agenda: e.target.value })}>
                    <option value="">—</option>
                    {services.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
                  </select>
                </div>

                <div>
                  <label className="label-base">{tf.scheduledAt}</label>
                  <input required type="datetime-local" className="input-base"
                    value={form.scheduled_at}
                    onChange={e => setForm({ ...form, scheduled_at: e.target.value })} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label-base">{tf.status}</label>
                    <select className="input-base" value={form.statut}
                      onChange={e => setForm({ ...form, statut: e.target.value as AppointmentStatus })}>
                      {statuts.map(s => (
                        <option key={s} value={s}>{statutLabels[s]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label-base">{t.detailChannel}</label>
                    <select className="input-base" value={form.canal}
                      onChange={e => setForm({ ...form, canal: e.target.value as AppointmentCanal })}>
                      {canaux.map(c => (
                        <option key={c} value={c}>{canalLabels[c]}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label-base">{tf.notes}</label>
                  <textarea rows={2} className="input-base resize-none"
                    value={form.notes ?? ""}
                    onChange={e => setForm({ ...form, notes: e.target.value })} />
                </div>
              </>
            )
          }
        </div>

        <div className="p-5 border-t border-[var(--border)] flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-ghost">{d.common.cancel}</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving && <Spinner className="border-white/30 border-t-white" />}
            {isEdit ? t.modal.btnUpdate : t.modal.btnCreate}
          </button>
        </div>
      </form>
    </div>
  );
}