// src/app/pme/appointments/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/Toast";
import { createPortal } from "react-dom";
import {
  rendezVousRepository, agencesRepository,
  agendasRepository, horairesRepository,
} from "@/repositories";
import { Spinner, PageLoader } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  CalendarDays, ChevronLeft, ChevronRight, Plus, X,
  Clock, User, Save, CheckCircle, XCircle,
  Settings, Pencil, Building2, ToggleLeft, ToggleRight, MapPin,
} from "lucide-react";
import type {
  RendezVous, CreateRendezVousPayload,
  Agence, Agenda, HorairesOuverture,
} from "@/types/api";

// ── Constantes ────────────────────────────────────────────────────────────────
type AppointmentStatus = "en_attente" | "confirme" | "annule" | "termine";
type JourKey = "lundi"|"mardi"|"mercredi"|"jeudi"|"vendredi"|"samedi"|"dimanche";

const JOURS_FR   = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];
const JOURS_LONG = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];
const JOURS_KEYS: JourKey[] = ["lundi","mardi","mercredi","jeudi","vendredi","samedi","dimanche"];

// Couleurs statut — liste à gauche
const STATUS_LIST: Record<AppointmentStatus,string> = {
  confirme:   "bg-emerald-50  border-l-[3px] border-emerald-500 text-emerald-800",
  en_attente: "bg-amber-50    border-l-[3px] border-amber-400   text-amber-800",
  termine:    "bg-blue-50     border-l-[3px] border-blue-400    text-blue-800",
  annule:     "bg-gray-50     border-l-[3px] border-gray-300    text-gray-400 line-through opacity-60",
};
// Couleurs statut — blocs agenda
const STATUS_BLOCK: Record<AppointmentStatus,{bg:string;border:string;text:string;dot:string}> = {
  confirme:   {bg:"bg-emerald-500/15", border:"border-l-[3px] border-emerald-500", text:"text-emerald-800", dot:"bg-emerald-500"},
  en_attente: {bg:"bg-amber-400/15",   border:"border-l-[3px] border-amber-400",   text:"text-amber-800",  dot:"bg-amber-400"},
  termine:    {bg:"bg-blue-400/15",    border:"border-l-[3px] border-blue-400",    text:"text-blue-800",   dot:"bg-blue-400"},
  annule:     {bg:"bg-gray-200/60",    border:"border-l-[3px] border-gray-300",    text:"text-gray-400",   dot:"bg-gray-300"},
};
const STATUS_LABELS: Record<AppointmentStatus,string> = {
  confirme:"Confirmé", en_attente:"En attente", termine:"Terminé", annule:"Annulé",
};

// px par minute dans le calendrier visuel
const PX_PER_MIN = 1.4;

function toMin(t: string): number {
  const [h,m] = t.split(":").map(Number);
  return h*60+(m||0);
}
function toTime(min: number): string {
  return `${String(Math.floor(min/60)).padStart(2,"0")}:${String(min%60).padStart(2,"0")}`;
}
function dateToJourKey(d: Date): JourKey {
  return JOURS_KEYS[d.getDay()===0?6:d.getDay()-1];
}

// ── HorairesEditor ────────────────────────────────────────────────────────────
type DayVal = {open:boolean;start:string;end:string};
const DEF: DayVal = {open:true,start:"08:00",end:"18:00"};

function HorairesEditor({
  horaires, type, agenceId, onSaved,
}: {horaires:HorairesOuverture|null; type:"ouverture"|"rendez_vous"; agenceId:string; onSaved:()=>void}) {
  const {dictionary:d} = useLanguage();
  const toast = useToast();
  const [vals, setVals] = useState<Record<JourKey,DayVal>>(() => ({
    lundi:    {...((horaires?.lundi    as DayVal|undefined) ?? DEF)},
    mardi:    {...((horaires?.mardi    as DayVal|undefined) ?? DEF)},
    mercredi: {...((horaires?.mercredi as DayVal|undefined) ?? DEF)},
    jeudi:    {...((horaires?.jeudi    as DayVal|undefined) ?? DEF)},
    vendredi: {...((horaires?.vendredi as DayVal|undefined) ?? DEF)},
    samedi:   {...((horaires?.samedi   as DayVal|undefined) ?? DEF)},
    dimanche: {...((horaires?.dimanche as DayVal|undefined) ?? DEF)},
  }));
  const [saving,setSaving] = useState(false);

  useEffect(() => {
    if (!horaires) return;
    setVals({
      lundi:    {...((horaires.lundi    as DayVal|undefined) ?? DEF)},
      mardi:    {...((horaires.mardi    as DayVal|undefined) ?? DEF)},
      mercredi: {...((horaires.mercredi as DayVal|undefined) ?? DEF)},
      jeudi:    {...((horaires.jeudi    as DayVal|undefined) ?? DEF)},
      vendredi: {...((horaires.vendredi as DayVal|undefined) ?? DEF)},
      samedi:   {...((horaires.samedi   as DayVal|undefined) ?? DEF)},
      dimanche: {...((horaires.dimanche as DayVal|undefined) ?? DEF)},
    });
  }, [horaires]);

  const save = async () => {
    setSaving(true);
    try {
      if (horaires?.id) await horairesRepository.patch(horaires.id, vals);
      else await horairesRepository.create({agence_id:agenceId, type, ...vals});
      toast.success("Horaires enregistrés ✓");
      onSaved();
    } catch { toast.error(d.common.error); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-1.5">
      {JOURS_KEYS.map((k,i) => {
        const v = vals[k];
        return (
          <div key={k} className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-xl transition-colors",
            v.open ? "bg-[var(--bg)]" : "bg-[var(--bg)]/40 opacity-60"
          )}>
            <span className="text-xs font-bold w-10 text-[var(--text-muted)]">{JOURS_LONG[i].slice(0,3)}</span>
            <button
              type="button"
              onClick={() => setVals(p=>({...p,[k]:{...v,open:!v.open}}))}
              className="flex-shrink-0"
            >
              {v.open
                ? <ToggleRight className="w-5 h-5 text-[#25D366]"/>
                : <ToggleLeft  className="w-5 h-5 text-[var(--text-muted)]"/>}
            </button>
            {v.open ? (
              <>
                <input type="time" value={v.start} onChange={e=>setVals(p=>({...p,[k]:{...v,start:e.target.value}}))}
                  className="input-base py-1 text-xs w-24 flex-shrink-0"/>
                <span className="text-xs text-[var(--text-muted)]">→</span>
                <input type="time" value={v.end} onChange={e=>setVals(p=>({...p,[k]:{...v,end:e.target.value}}))}
                  className="input-base py-1 text-xs w-24 flex-shrink-0"/>
              </>
            ) : (
              <span className="text-xs text-[var(--text-muted)] italic">Fermé</span>
            )}
          </div>
        );
      })}
      <div className="pt-2 flex justify-end">
        <button onClick={save} disabled={saving}
          className="btn-primary flex items-center gap-2 text-sm py-1.5 px-4">
          {saving ? <Spinner className="border-white/30 border-t-white w-3 h-3"/> : <Save className="w-3.5 h-3.5"/>}
          {d.common.save}
        </button>
      </div>
    </div>
  );
}

// ── AgendaConfigPanel ─────────────────────────────────────────────────────────
function AgendaConfigPanel({agenda,onSaved,onClose}:{agenda:Agenda;onSaved:()=>void;onClose:()=>void}) {
  const toast = useToast();
  const {dictionary:d} = useLanguage();
  const [duree,setDuree] = useState(agenda.duree_rdv_min ?? 30);
  const [buf,setBuf]     = useState(agenda.buffer_min ?? 0);
  const [saving,setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await agendasRepository.patch(agenda.id, {duree_rdv_min:duree, buffer_min:buf});
      toast.success("Configuration enregistrée ✓");
      onSaved();
      onClose();
    } catch { toast.error(d.common.error); }
    finally { setSaving(false); }
  };

  const total = duree + buf;

  return (
    <div className="card p-5 border-2 border-[#075E54]/20 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-[var(--text)] flex items-center gap-2">
          <Settings className="w-4 h-4 text-[#075E54]"/>
          Configuration des créneaux
        </h3>
        <button onClick={onClose} className="p-1 rounded hover:bg-[var(--border)]">
          <X className="w-4 h-4 text-[var(--text-muted)]"/>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-[var(--text)]">Durée RDV</label>
          <div className="flex items-center gap-2">
            <input type="number" min={5} max={480} step={5} value={duree}
              onChange={e=>setDuree(Number(e.target.value))}
              className="input-base w-full text-sm"/>
            <span className="text-xs text-[var(--text-muted)] flex-shrink-0">min</span>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-[var(--text)]">Tampon</label>
          <div className="flex items-center gap-2">
            <input type="number" min={0} max={120} step={5} value={buf}
              onChange={e=>setBuf(Number(e.target.value))}
              className="input-base w-full text-sm"/>
            <span className="text-xs text-[var(--text-muted)] flex-shrink-0">min</span>
          </div>
        </div>
      </div>

      {/* Aperçu visuel du créneau */}
      <div className="rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="px-3 py-1.5 bg-[var(--border)]/30 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
          Aperçu d&apos;un créneau ({total} min total)
        </div>
        <div className="flex h-8">
          <div className="bg-emerald-500/20 border-r-2 border-emerald-500 flex items-center justify-center text-[10px] font-bold text-emerald-700"
            style={{width:`${(duree/total)*100}%`}}>
            {duree}min RDV
          </div>
          {buf > 0 && (
            <div className="bg-gray-200/80 flex items-center justify-center text-[10px] font-bold text-gray-500"
              style={{width:`${(buf/total)*100}%`}}>
              {buf}min tampon
            </div>
          )}
        </div>
      </div>

      <button onClick={save} disabled={saving}
        className="btn-primary w-full flex items-center justify-center gap-2 text-sm">
        {saving ? <Spinner className="border-white/30 border-t-white w-3 h-3"/> : <Save className="w-3.5 h-3.5"/>}
        Enregistrer
      </button>
    </div>
  );
}

// ── DayCalendar ───────────────────────────────────────────────────────────────
function DayCalendar({
  date, rdvs, horairesRdv, dureeMin, bufferMin, onSlotClick, onRdvClick,
}: {
  date: Date;
  rdvs: RendezVous[];
  horairesRdv: HorairesOuverture | null;
  dureeMin: number;
  bufferMin: number;
  onSlotClick: (time: string) => void;
  onRdvClick: (rdv: RendezVous) => void;
}) {
  const jourKey  = dateToJourKey(date);
  const h        = horairesRdv?.[jourKey] as DayVal|undefined;
  const isOpen   = h?.open ?? true;
  const startMin = toMin(h?.start ?? "08:00");
  const endMin   = toMin(h?.end   ?? "18:00");

  // Filtre RDV du jour
  const dayRdvs = rdvs.filter(r => {
  const d = new Date(r.scheduled_at);
  return (
    d.getFullYear() === date.getFullYear() &&
    d.getMonth()    === date.getMonth() &&
    d.getDate()     === date.getDate()
  );
  });;

  const totalMin = endMin - startMin;
  const totalPx  = Math.max(totalMin * PX_PER_MIN, 200);
  const slotPx   = dureeMin * PX_PER_MIN;
  const bufferPx = bufferMin * PX_PER_MIN;

  // Génère les lignes d'heure (toutes les 60 min)
  const hourLines: number[] = [];
  for (let m = startMin; m <= endMin; m += 60) hourLines.push(m);

  if (!isOpen) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-[var(--text-muted)]">
        <Clock className="w-8 h-8 mb-2 opacity-30"/>
        <p className="text-sm font-medium">Fermé ce jour</p>
        <p className="text-xs opacity-60">Aucun créneau disponible</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-y-auto" style={{height: Math.min(totalPx + 32, 600)}}>
      {/* Colonne heures + créneaux */}
      <div className="relative" style={{height: totalPx, minHeight: 200}}>
        {/* Lignes d'heure */}
        {hourLines.map(min => {
          const top = (min - startMin) * PX_PER_MIN;
          return (
            <div key={min} className="absolute left-0 right-0 flex items-center gap-2 pointer-events-none"
              style={{top}}>
              <span className="text-[10px] font-mono text-[var(--text-muted)] w-10 text-right flex-shrink-0 select-none">
                {toTime(min)}
              </span>
              <div className="flex-1 border-t border-[var(--border)]"/>
            </div>
          );
        })}

        {/* Zone cliquable par créneau (duree+buffer) */}
        {(() => {
          const slots = [];
          const step = dureeMin + bufferMin;
          for (let m = startMin; m + dureeMin <= endMin; m += step) {
            const top = (m - startMin) * PX_PER_MIN;
            const heure = toTime(m);
            // Vérifier si un RDV existe déjà sur ce créneau
            const occupied = dayRdvs.some(r => {
              const rm = new Date(r.scheduled_at).getHours()*60 + new Date(r.scheduled_at).getMinutes();
              return Math.abs(rm - m) < dureeMin;
            });
            slots.push(
              <div key={m}
                onClick={() => !occupied && onSlotClick(heure)}
                className={cn(
                  "absolute left-12 right-0 rounded-lg transition-all group",
                  occupied ? "cursor-default" : "cursor-pointer hover:bg-[#075E54]/5"
                )}
                style={{top, height: slotPx - 2}}>
                {!occupied && (
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] text-[#075E54] opacity-0 group-hover:opacity-50 font-semibold select-none">
                    + RDV à {heure}
                  </span>
                )}
              </div>
            );
            // Zone tampon (grisée, non cliquable)
            if (bufferMin > 0 && m + dureeMin < endMin) {
              slots.push(
                <div key={`buf-${m}`}
                  className="absolute left-12 right-0 bg-gray-100/60 rounded-sm border-y border-dashed border-gray-200"
                  style={{top: top + slotPx, height: bufferPx - 1, pointerEvents:"none"}}>
                  {bufferPx > 12 && (
                    <span className="absolute inset-0 flex items-center px-2 text-[9px] text-gray-400 select-none">
                      tampon {bufferMin}min
                    </span>
                  )}
                </div>
              );
            }
          }
          return slots;
        })()}

        {/* Blocs RDV positionnés */}
        {dayRdvs.map(rdv => {
          const s   = new Date(rdv.scheduled_at);
          const min = s.getHours()*60 + s.getMinutes();
          if (min < startMin || min >= endMin) return null;
          const top    = (min - startMin) * PX_PER_MIN;
          const height = Math.max(slotPx - 2, 28);
          const st     = STATUS_BLOCK[rdv.statut as AppointmentStatus] ?? STATUS_BLOCK.en_attente;
          return (
            <div key={rdv.id}
              onClick={e => { e.stopPropagation(); onRdvClick(rdv); }}
              className={cn(
                "absolute rounded-lg px-3 py-1.5 cursor-pointer z-10 overflow-hidden",
                "transition-all hover:shadow-md hover:brightness-95 active:scale-[0.99]",
                st.bg, st.border
              )}
              style={{top, height, left:"3rem", right:"0.5rem"}}>
              <div className="flex items-start gap-2 h-full">
                <div className={cn("w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0", st.dot)}/>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-[11px] font-bold truncate flex items-center gap-1", st.text)}>
                    {s.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}
                    <span className="font-normal opacity-70">—</span>
                    {rdv.client_nom}
                  </p>
                  {height > 36 && (
                    <p className={cn("text-[10px] opacity-60 truncate", st.text)}>
                      {rdv.client_telephone && <span>{rdv.client_telephone} · </span>}
                      {STATUS_LABELS[rdv.statut as AppointmentStatus]}
                    </p>
                  )}
                </div>
                <Pencil className={cn("w-3 h-3 flex-shrink-0 opacity-40 mt-0.5", st.text)}/>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── MiniCalendar ──────────────────────────────────────────────────────────────
function MiniCalendar({
  viewDate, selDate, rdvsByDay, onPrev, onNext, onToday, onSelectDay,
}: {
  viewDate: Date;
  selDate: Date;
  rdvsByDay: Map<string,RendezVous[]>;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onSelectDay: (d: Date) => void;
}) {
  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const today  = new Date();

  const MOIS = ["Janvier","Février","Mars","Avril","Mai","Juin",
                "Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

  return (
    <div className="card p-4">
      {/* En-tête mois */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={onPrev} className="p-1.5 rounded-lg hover:bg-[var(--border)] transition-colors">
          <ChevronLeft className="w-4 h-4 text-[var(--text-muted)]"/>
        </button>
        <div className="text-center">
          <p className="text-sm font-black text-[var(--text)]">{MOIS[month]} {year}</p>
        </div>
        <button onClick={onNext} className="p-1.5 rounded-lg hover:bg-[var(--border)] transition-colors">
          <ChevronRight className="w-4 h-4 text-[var(--text-muted)]"/>
        </button>
      </div>

      {/* Jours de la semaine */}
      <div className="grid grid-cols-7 mb-1">
        {JOURS_FR.map(j => (
          <div key={j} className="text-center text-[10px] font-black text-[var(--text-muted)] py-1">{j}</div>
        ))}
      </div>

      {/* Grille jours */}
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({length: offset}).map((_,i) => <div key={`e-${i}`}/>)}
        {Array.from({length: daysInMonth}).map((_,i) => {
          const day  = i + 1;
          const date = new Date(year, month, day);
          const key  = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
          const rdvs = rdvsByDay.get(key) ?? [];
          const isT  = date.toDateString() === today.toDateString();
          const isS  = date.toDateString() === selDate.toDateString();
          return (
            <button key={day} onClick={() => onSelectDay(date)}
              className={cn(
                "flex flex-col items-center py-1 rounded-lg transition-all",
                isS  ? "bg-[#075E54] text-white" :
                isT  ? "bg-[#25D366]/20 text-[#075E54]" :
                       "hover:bg-[var(--border)]/50 text-[var(--text)]"
              )}>
              <span className="text-[11px] font-bold">{day}</span>
              {rdvs.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {rdvs.slice(0,3).map((r,idx) => (
                    <div key={idx} className={cn("w-1 h-1 rounded-full",
                      r.statut==="confirme" ? (isS?"bg-white":"bg-emerald-500")
                      : isS ? "bg-white/70" : "bg-amber-400")}/>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Bouton aujourd'hui */}
      <button onClick={onToday}
        className="w-full mt-3 text-xs font-bold text-[#075E54] hover:bg-[#075E54]/5 py-1.5 rounded-lg transition-colors">
        Aujourd&apos;hui
      </button>
    </div>
  );
}

// ── RdvModal ──────────────────────────────────────────────────────────────────
function RdvModal({
  agendas, rdv, prefillDate, prefillTime, onClose, onSaved,
}: {
  agendas: Agenda[];
  rdv?: RendezVous|null;
  prefillDate?: Date|null;
  prefillTime?: string|null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const {dictionary:d} = useLanguage();
  const toast = useToast();
  const isEdit = !!rdv;

  const pad  = (n: number) => String(n).padStart(2,"0");
  const def  = prefillDate ?? new Date();
  const defStr = `${def.getFullYear()}-${pad(def.getMonth()+1)}-${pad(def.getDate())}T${prefillTime ?? "09:00"}`;

  const [form,setForm] = useState({
    agenda:           rdv?.agenda           ?? agendas[0]?.id ?? "",
    client_nom:       rdv?.client_nom       ?? "",
    client_telephone: rdv?.client_telephone ?? "",
    client_email:     "",
    scheduled_at:     rdv ? rdv.scheduled_at.slice(0,16) : defStr,
    notes:            rdv?.notes            ?? "",
    canal:            (rdv?.canal  ?? "manuel") as "whatsapp"|"vocal"|"manuel",
    statut:           (rdv?.statut ?? "en_attente") as AppointmentStatus,
  });
  const [saving,setSaving] = useState(false);
  const ok = form.agenda && form.client_nom.trim().length >= 2 && form.scheduled_at;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ok) return;
    setSaving(true);
    try {
      const payload: CreateRendezVousPayload & {statut?:string} = {
        agenda:           form.agenda,
        client_nom:       form.client_nom.trim(),
        client_telephone: form.client_telephone.trim(),
        client_email:     form.client_email.trim() || undefined,
        scheduled_at:     new Date(form.scheduled_at).toISOString(),
        notes:            form.notes.trim(),
        canal:            form.canal,
      };
      if (isEdit && rdv) {
        await rendezVousRepository.patch(rdv.id, {...payload, statut: form.statut});
      } else {
        await rendezVousRepository.create(payload);
      }
      toast.success(isEdit ? "RDV mis à jour ✓" : "RDV créé ✓");
      onSaved();
      onClose();
    } catch (err: unknown) {
      const msg = (err as {body?: {scheduled_at?: string[]}})?.body?.scheduled_at?.[0];
      toast.error(msg ?? d.common.error);
    } finally { setSaving(false); }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{background:"rgba(0,0,0,0.5)"}}>
      <div className="card w-full max-w-md max-h-[90vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
          <h2 className="text-base font-black text-[var(--text)]">
            {isEdit ? "Modifier le rendez-vous" : "Nouveau rendez-vous"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--border)] transition-colors">
            <X className="w-4 h-4 text-[var(--text-muted)]"/>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Agenda */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text)]">Agenda</label>
            <select className="input-base w-full" value={form.agenda}
              onChange={e=>setForm({...form,agenda:e.target.value})}>
              {agendas.map(a=>(
                <option key={a.id} value={a.id}>{a.nom}</option>
              ))}
            </select>
          </div>

          {/* Client */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text)]">
              Nom du client <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]"/>
              <input className="input-base w-full pl-9" placeholder="Jean Dupont"
                value={form.client_nom} onChange={e=>setForm({...form,client_nom:e.target.value})}/>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text)]">Téléphone</label>
              <input className="input-base w-full" placeholder="+237 6XX XXX XXX"
                value={form.client_telephone} onChange={e=>setForm({...form,client_telephone:e.target.value})}/>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text)]">Email</label>
              <input className="input-base w-full" placeholder="optionnel"
                value={form.client_email} onChange={e=>setForm({...form,client_email:e.target.value})}/>
            </div>
          </div>

          {/* Date/heure */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text)]">
              Date & heure <span className="text-red-500">*</span>
            </label>
            <input type="datetime-local" className="input-base w-full"
              value={form.scheduled_at} onChange={e=>setForm({...form,scheduled_at:e.target.value})}/>
          </div>

          {/* Canal */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text)]">Canal</label>
            <div className="flex gap-2">
              {(["whatsapp","vocal","manuel"] as const).map(c=>(
                <button key={c} type="button" onClick={()=>setForm({...form,canal:c})}
                  className={cn("flex-1 py-1.5 rounded-lg border text-xs font-semibold transition-all capitalize",
                    form.canal===c
                      ? "border-[#075E54] bg-[#075E54]/5 text-[#075E54]"
                      : "border-[var(--border)] text-[var(--text-muted)] hover:border-[#075E54]/30")}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Statut (edit seulement) */}
          {isEdit && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text)]">Statut</label>
              <select className="input-base w-full" value={form.statut}
                onChange={e=>setForm({...form,statut:e.target.value as AppointmentStatus})}>
                <option value="en_attente">En attente</option>
                <option value="confirme">Confirmé</option>
                <option value="termine">Terminé</option>
                <option value="annule">Annulé</option>
              </select>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text)]">Notes</label>
            <textarea className="input-base w-full resize-none text-sm" rows={2}
              placeholder="Informations complémentaires…"
              value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 text-sm">
              Annuler
            </button>
            <button type="submit" disabled={saving || !ok}
              className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm disabled:opacity-50">
              {saving
                ? <Spinner className="border-white/30 border-t-white w-3 h-3"/>
                : isEdit ? <Save className="w-3.5 h-3.5"/> : <Plus className="w-3.5 h-3.5"/>}
              {isEdit ? "Enregistrer" : "Créer le RDV"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function AppointmentsPage() {
  const {dictionary:d} = useLanguage();
  const toast = useToast();

  const [loading,setLoading]         = useState(true);
  const [agences,setAgences]         = useState<Agence[]>([]);
  const [agendas,setAgendas]         = useState<Agenda[]>([]);
  const [rdvs,setRdvs]               = useState<RendezVous[]>([]);
  const [horOuv,setHorOuv]           = useState<HorairesOuverture|null>(null);
  const [horRdv,setHorRdv]           = useState<HorairesOuverture|null>(null);
  const [selAgenceId,setSelAgenceId] = useState("");
  const [selDate,setSelDate]         = useState(new Date());
  const [viewDate,setViewDate]       = useState(new Date());
  const [showHor,setShowHor]         = useState(false);
  const [showConfig,setShowConfig]   = useState(false);
  const [modal,setModal]             = useState<{
    open:boolean; rdv?:RendezVous|null; date?:Date|null; time?:string|null;
  }>({open:false});

  // Agendas + agenda actif de l'agence sélectionnée
  const agenceAgendas = agendas.filter(a => a.agence === selAgenceId);
  const activeAgenda  = agenceAgendas[0] ?? null;
  const dureeMin      = activeAgenda?.duree_rdv_min ?? 30;
  const bufferMin     = activeAgenda?.buffer_min    ?? 0;

  // ── Chargement principal ────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    try {
      const [ag,agd,rdvRes] = await Promise.all([
        agencesRepository.getList(),
        agendasRepository.getList(),
        rendezVousRepository.getList(),
      ]);
      const agList = Array.isArray(ag) ? ag : (ag as {results?:Agence[]}).results ?? [];
      const agdList = Array.isArray(agd) ? agd : (agd as {results?:Agenda[]}).results ?? [];
      const rdvList = Array.isArray(rdvRes)
        ? rdvRes
        : (rdvRes as {results?:RendezVous[]}).results ?? [];

      setAgences(agList);
      setAgendas(agdList);
      setRdvs(rdvList);

      // Sélectionner le siège par défaut
      setSelAgenceId(prev => {
        if (prev) return prev;
        const siege = agList.find(a => a.is_siege) ?? agList[0];
        return siege?.id ?? "";
      });
    } catch { toast.error(d.common.error); }
    finally { setLoading(false); }
  }, [d.common.error, toast]);

  // ── Chargement horaires agence ──────────────────────────────────────────────
  const fetchHor = useCallback(async (id: string) => {
    if (!id) return;
    try {
      const list = await horairesRepository.getListByAgence(id);
      setHorOuv(list.find(h => h.type === "ouverture")   ?? null);
      setHorRdv(list.find(h => h.type === "rendez_vous") ?? null);
    } catch { setHorOuv(null); setHorRdv(null); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => { if (selAgenceId) fetchHor(selAgenceId); }, [selAgenceId, fetchHor]);

  // ── Action rapide statut ────────────────────────────────────────────────────
  const action = async (id: string, a: "confirmer"|"annuler"|"terminer") => {
    try {
      await rendezVousRepository[a](id);
      toast.success("Statut mis à jour ✓");
      fetchAll();
    } catch { toast.error(d.common.error); }
  };

  if (loading) return <PageLoader/>;

  // ── Filtres ─────────────────────────────────────────────────────────────────
  const agAgendaIds = agenceAgendas.map(a => a.id);
  const filtered    = rdvs.filter(r => agAgendaIds.includes(r.agenda ?? ""));
  const dayRdvs = filtered.filter(r => {
  const d = new Date(r.scheduled_at);
  return (
    d.getFullYear() === selDate.getFullYear() &&
    d.getMonth()    === selDate.getMonth() &&
    d.getDate()     === selDate.getDate()
  );
  });

  // Map jour → RDVs (pour le mini-calendrier)
  const rdvsByDay = new Map<string,RendezVous[]>();
  filtered.forEach(r => {
    const d = new Date(r.scheduled_at);
    const k = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    rdvsByDay.set(k, [...(rdvsByDay.get(k) ?? []), r]);
  });
  const agenceActive = agences.find(a => a.id === selAgenceId);

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text)]">Rendez-vous</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Tous les rendez-vous pris via votre assistant.
          </p>
        </div>
        <button onClick={() => setModal({open:true, rdv:null, date:selDate})}
          className="btn-primary flex items-center gap-2 flex-shrink-0">
          <Plus className="w-4 h-4"/> Nouveau RDV
        </button>
      </div>

      {/* ── Sélecteur agences ──────────────────────────────────────────────── */}
      {agences.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {agences.map(ag => (
            <button key={ag.id} onClick={() => {
              setSelAgenceId(ag.id);
              setShowHor(false);
              setShowConfig(false);
            }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all",
                selAgenceId === ag.id
                  ? "border-[#075E54] bg-[#075E54]/10 text-[#075E54]"
                  : "border-[var(--border)] text-[var(--text-muted)] hover:border-[#075E54]/30"
              )}>
              <Building2 className="w-4 h-4"/>
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

      {/* ── Barre outils agence ────────────────────────────────────────────── */}
      {agenceActive && (
        <div className="card px-4 py-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-[#075E54] flex-shrink-0"/>
            <span className="text-xs font-bold text-[var(--text)] truncate">{agenceActive.nom}</span>
            {activeAgenda && (
              <span className="text-[10px] text-[var(--text-muted)] hidden sm:block">
                · Créneaux {dureeMin}min {bufferMin>0 ? `+ ${bufferMin}min tampon`:""} · Agenda : {activeAgenda.nom}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeAgenda && (
              <button onClick={() => { setShowConfig(!showConfig); setShowHor(false); }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all",
                  showConfig
                    ? "border-[#075E54] bg-[#075E54]/10 text-[#075E54]"
                    : "border-[var(--border)] text-[var(--text-muted)] hover:border-[#075E54]/30"
                )}>
                <Settings className="w-3.5 h-3.5"/> Créneaux
              </button>
            )}
            <button onClick={() => { setShowHor(!showHor); setShowConfig(false); }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all",
                showHor
                  ? "border-[#075E54] bg-[#075E54]/10 text-[#075E54]"
                  : "border-[var(--border)] text-[var(--text-muted)] hover:border-[#075E54]/30"
              )}>
              <Clock className="w-3.5 h-3.5"/> Horaires
            </button>
          </div>
        </div>
      )}

      {/* ── Config créneaux ────────────────────────────────────────────────── */}
      {showConfig && activeAgenda && (
        <AgendaConfigPanel agenda={activeAgenda} onSaved={fetchAll} onClose={() => setShowConfig(false)}/>
      )}

      {/* ── Éditeur horaires ───────────────────────────────────────────────── */}
      {showHor && (
        <div className="card p-5 space-y-6">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">
              Heures d&apos;ouverture
            </p>
            <HorairesEditor horaires={horOuv} type="ouverture"
              agenceId={selAgenceId} onSaved={() => fetchHor(selAgenceId)}/>
          </div>
          <div className="border-t border-[var(--border)] pt-5">
            <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">
              Réception des rendez-vous
            </p>
            <HorairesEditor horaires={horRdv} type="rendez_vous"
              agenceId={selAgenceId} onSaved={() => fetchHor(selAgenceId)}/>
          </div>
        </div>
      )}

      {/* ── Corps principal : 3 colonnes ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-5">

        {/* Colonne gauche — calendrier + liste */}
        <div className="lg:col-span-1 space-y-4">

          {/* Mini-calendrier */}
          <MiniCalendar
            viewDate={viewDate}
            selDate={selDate}
            rdvsByDay={rdvsByDay}
            onPrev={() => setViewDate(d => new Date(d.getFullYear(), d.getMonth()-1, 1))}
            onNext={() => setViewDate(d => new Date(d.getFullYear(), d.getMonth()+1, 1))}
            onToday={() => { const t=new Date(); setSelDate(t); setViewDate(t); }}
            onSelectDay={d => { setSelDate(d); setViewDate(d); }}
          />

          {/* Liste RDV du jour */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5"/>
                {selDate.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}
              </h4>
              <span className="text-xs font-bold text-[var(--text-muted)] bg-[var(--border)] px-2 py-0.5 rounded-full">
                {dayRdvs.length} RDV
              </span>
            </div>

            {dayRdvs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-[var(--text-muted)]">
                <CalendarDays className="w-7 h-7 mb-2 opacity-20"/>
                <p className="text-xs">Aucun rendez-vous</p>
              </div>
            ) : (
              <div className="space-y-2">
                {dayRdvs
                  .sort((a,b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
                  .map(rdv => (
                    <div key={rdv.id}
                      onClick={() => setModal({open:true, rdv})}
                      className={cn(
                        "flex items-center gap-2 p-2.5 rounded-xl cursor-pointer",
                        "hover:shadow-sm transition-all",
                        STATUS_LIST[rdv.statut as AppointmentStatus]
                      )}>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3"/>
                          {new Date(rdv.scheduled_at).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}
                        </p>
                        <p className="text-[11px] font-semibold truncate">
                          {rdv.client_nom}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {rdv.statut === "en_attente" && (
                          <>
                            <button onClick={e=>{e.stopPropagation();action(rdv.id,"confirmer");}}
                              className="p-1 rounded bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">
                              <CheckCircle className="w-3.5 h-3.5"/>
                            </button>
                            <button onClick={e=>{e.stopPropagation();action(rdv.id,"annuler");}}
                              className="p-1 rounded bg-red-50 text-red-500 hover:bg-red-100">
                              <XCircle className="w-3.5 h-3.5"/>
                            </button>
                          </>
                        )}
                        <button onClick={e=>{e.stopPropagation();setModal({open:true,rdv});}}
                          className="p-1 rounded hover:bg-[var(--border)] text-[var(--text-muted)]">
                          <Pencil className="w-3.5 h-3.5"/>
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
            {/* Header agenda visuel */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-3">
                <button onClick={() => {
                  const d = new Date(selDate); d.setDate(d.getDate()-1);
                  setSelDate(d); setViewDate(d);
                }} className="p-1.5 rounded-lg hover:bg-[var(--border)] transition-colors">
                  <ChevronLeft className="w-4 h-4"/>
                </button>
                <span className="text-sm font-bold text-[var(--text)] capitalize">
                  {selDate.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}
                </span>
                <button onClick={() => {
                  const d = new Date(selDate); d.setDate(d.getDate()+1);
                  setSelDate(d); setViewDate(d);
                }} className="p-1.5 rounded-lg hover:bg-[var(--border)] transition-colors">
                  <ChevronRight className="w-4 h-4"/>
                </button>
              </div>
              {/* Légende statuts */}
              <div className="hidden sm:flex items-center gap-3">
                {(Object.entries(STATUS_LABELS) as [AppointmentStatus,string][]).map(([k,v]) => (
                  <div key={k} className="flex items-center gap-1">
                    <div className={cn("w-2 h-2 rounded-full", STATUS_BLOCK[k].dot)}/>
                    <span className="text-[10px] text-[var(--text-muted)]">{v}</span>
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
                onSlotClick={time => setModal({open:true, rdv:null, date:selDate, time})}
                onRdvClick={rdv => setModal({open:true, rdv})}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal ──────────────────────────────────────────────────────────── */}
      {modal.open && (
        <RdvModal
          agendas={agenceAgendas.length > 0 ? agenceAgendas : agendas}
          rdv={modal.rdv}
          prefillDate={modal.date}
          prefillTime={modal.time}
          onClose={() => setModal({open:false})}
          onSaved={fetchAll}
        />
      )}
    </div>
  );
}