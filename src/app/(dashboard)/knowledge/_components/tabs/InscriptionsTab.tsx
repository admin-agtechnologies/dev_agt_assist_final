// src/app/(dashboard)/knowledge/_components/tabs/InscriptionsTab.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import { Plus, Loader2, GraduationCap, ToggleLeft, ToggleRight, Pencil, Trash2, Check, X, Calendar } from "lucide-react";
import { useSector }           from "@/hooks/useSector";
import { useToast }            from "@/components/ui/Toast";
import { programmeRepository } from "@/repositories/p5.repository";
import { KnowledgeCardSkeleton } from "../KnowledgeSkeleton";
import { cn } from "@/lib/utils";
import type { ProgrammeAdmission, NiveauAdmission } from "@/types/api/p5.types";

const NIVEAUX: Record<NiveauAdmission, string> = {
  primaire: "Primaire", secondaire: "Secondaire",
  superieur: "Supérieur", formation_pro: "Formation pro",
};

const EMPTY = { nom_fr:"", description_fr:"", niveau:"superieur", duree:"", frais_inscription:"", conditions_admission:"", date_ouverture:"", date_fermeture:"" };

export function InscriptionsTab() {
  const { theme } = useSector();
  const toast     = useToast();
  const [items,   setItems]   = useState<ProgrammeAdmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editId,  setEditId]  = useState<string|null>(null);
  const [form,    setForm]    = useState(EMPTY);
  const [saving,  startSave]  = useTransition();

  useEffect(() => {
    programmeRepository.getList().then(setItems).catch(()=>toast.error("Erreur chargement")).finally(()=>setLoading(false));
  }, []); // eslint-disable-line

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) =>
    setForm(f=>({...f,[k]:e.target.value}));

  const toPayload = (f: typeof EMPTY) => ({
    nom_fr: f.nom_fr.trim(), description_fr: f.description_fr.trim()||undefined,
    niveau: f.niveau as NiveauAdmission, duree: f.duree.trim()||undefined,
    frais_inscription: f.frais_inscription ? Number(f.frais_inscription) : null,
    conditions_admission: f.conditions_admission.trim()||undefined,
    date_ouverture: f.date_ouverture||null, date_fermeture: f.date_fermeture||null,
    is_available: true, ordre: items.length,
  });

  const handleCreate = () => startSave(async () => {
    if (!form.nom_fr.trim()) return;
    try { const c = await programmeRepository.create(toPayload(form)); setItems(p=>[...p,c]); setShowAdd(false); setForm(EMPTY); toast.success("Programme ajouté"); }
    catch { toast.error("Erreur"); }
  });
  const handleUpdate = (id: string) => startSave(async () => {
    if (!form.nom_fr.trim()) return;
    try { const u = await programmeRepository.update(id, toPayload(form)); setItems(p=>p.map(x=>x.id===id?u:x)); setEditId(null); toast.success("Programme mis à jour"); }
    catch { toast.error("Erreur"); }
  });
  const handleDelete = (id: string) => startSave(async () => {
    try { await programmeRepository.delete(id); setItems(p=>p.filter(x=>x.id!==id)); toast.success("Programme supprimé"); }
    catch { toast.error("Erreur"); }
  });
  const handleToggle = (item: ProgrammeAdmission) => startSave(async () => {
    try { const u = await programmeRepository.update(item.id, {is_available:!item.is_available}); setItems(p=>p.map(x=>x.id===item.id?u:x)); }
    catch { toast.error("Erreur"); }
  });
  const startEdit = (item: ProgrammeAdmission) => {
    setEditId(item.id); setShowAdd(false);
    setForm({ nom_fr:item.nom_fr, description_fr:item.description_fr??'', niveau:item.niveau, duree:item.duree??'', frais_inscription:item.frais_inscription!=null?String(item.frais_inscription):'', conditions_admission:item.conditions_admission??'', date_ouverture:item.date_ouverture??'', date_fermeture:item.date_fermeture??'' });
  };

  if (loading) return <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">{[1,2,3].map(i=><KnowledgeCardSkeleton key={i}/>)}</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-muted)]">{items.length} programme{items.length!==1?"s":""}</p>
        {!showAdd && <button type="button" onClick={()=>{setShowAdd(true);setEditId(null);setForm(EMPTY);}} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"><Plus className="w-4 h-4"/> Ajouter un programme</button>}
      </div>

      {showAdd && <ProgrammeForm form={form} set={set} onSave={handleCreate} onCancel={()=>setShowAdd(false)} saving={saving} theme={theme} label="Nouveau programme"/>}

      {items.length===0&&!showAdd ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center bg-[var(--bg-card)] rounded-2xl border border-dashed border-[var(--border)]">
          <GraduationCap className="w-10 h-10 text-[var(--text-muted)]"/><p className="text-sm text-[var(--text-muted)]">Aucun programme configuré.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((item) => editId===item.id ? (
            <div key={item.id} className="sm:col-span-2 xl:col-span-3">
              <ProgrammeForm form={form} set={set} onSave={()=>handleUpdate(item.id)} onCancel={()=>setEditId(null)} saving={saving} theme={theme} label="Modifier le programme"/>
            </div>
          ) : (
            <div key={item.id} className={cn("bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-5 flex flex-col gap-2 hover:shadow-md transition-all",!item.is_available&&"opacity-60")}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-sm text-[var(--text)]">{item.nom_fr}</p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-medium mt-0.5 inline-block" style={{backgroundColor:`${theme.primary}20`,color:theme.primary}}>
                    {NIVEAUX[item.niveau]}
                  </span>
                </div>
                <button type="button" onClick={()=>handleToggle(item)} disabled={saving} className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold bg-[var(--bg)] flex-shrink-0">
                  {item.is_available?<><ToggleRight className="w-3.5 h-3.5 text-green-500"/>Ouvert</>:<><ToggleLeft className="w-3.5 h-3.5 text-[var(--text-muted)]"/>Fermé</>}
                </button>
              </div>
              {item.description_fr&&<p className="text-xs text-[var(--text-muted)] line-clamp-2">{item.description_fr}</p>}
              <div className="grid grid-cols-2 gap-1 text-xs text-[var(--text-muted)]">
                {item.duree&&<span>Durée : <strong className="text-[var(--text)]">{item.duree}</strong></span>}
                <span>{item.frais_inscription!=null?<><strong className="text-[var(--text)]">{Number(item.frais_inscription).toLocaleString("fr-FR")} XAF</strong></>:<span className="text-green-600 font-medium">Gratuit</span>}</span>
              </div>
              {(item.date_ouverture||item.date_fermeture)&&(
                <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                  <Calendar className="w-3 h-3"/>
                  {item.date_ouverture&&<span>Du {item.date_ouverture}</span>}
                  {item.date_fermeture&&<span>au {item.date_fermeture}</span>}
                </div>
              )}
              <div className="flex justify-end gap-1 mt-auto pt-1">
                <button type="button" onClick={()=>startEdit(item)} className="p-1.5 rounded-lg hover:bg-[var(--bg)]"><Pencil className="w-3.5 h-3.5 text-[var(--text-muted)]"/></button>
                <button type="button" onClick={()=>handleDelete(item.id)} disabled={saving} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-3.5 h-3.5 text-red-400"/></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProgrammeForm({ form, set, onSave, onCancel, saving, theme, label }: {
  form:Record<string,string>; set:(k:string)=>(e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>)=>void;
  onSave:()=>void; onCancel:()=>void; saving:boolean; theme:{primary:string}; label:string;
}) {
  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border-2 p-5 space-y-3" style={{borderColor:theme.primary}}>
      <p className="text-sm font-semibold text-[var(--text)]">{label}</p>
      <div className="grid grid-cols-2 gap-3">
        <Row label="Nom du programme *"><input className="input-base" value={form.nom_fr} onChange={set("nom_fr")} autoFocus/></Row>
        <Row label="Niveau *">
          <select className="input-base" value={form.niveau} onChange={set("niveau")}>
            {Object.entries(NIVEAUX).map(([k,v])=><option key={k} value={k}>{v}</option>)}
          </select>
        </Row>
      </div>
      <Row label="Description"><textarea className="input-base resize-none" rows={2} value={form.description_fr} onChange={set("description_fr")}/></Row>
      <div className="grid grid-cols-2 gap-3">
        <Row label="Durée"><input className="input-base" placeholder='Ex: "2 ans"' value={form.duree} onChange={set("duree")}/></Row>
        <Row label="Frais inscription (XAF, vide=gratuit)"><input className="input-base" type="number" value={form.frais_inscription} onChange={set("frais_inscription")}/></Row>
      </div>
      <Row label="Conditions d'admission"><textarea className="input-base resize-none" rows={2} value={form.conditions_admission} onChange={set("conditions_admission")}/></Row>
      <div className="grid grid-cols-2 gap-3">
        <Row label="Ouverture candidatures"><input className="input-base" type="date" value={form.date_ouverture} onChange={set("date_ouverture")}/></Row>
        <Row label="Clôture candidatures"><input className="input-base" type="date" value={form.date_fermeture} onChange={set("date_fermeture")}/></Row>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl border border-[var(--border)] hover:bg-[var(--bg)] text-[var(--text-muted)]"><X className="w-4 h-4"/> Annuler</button>
        <button type="button" onClick={onSave} disabled={saving||!form.nom_fr.trim()} className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm disabled:opacity-60">{saving?<Loader2 className="w-4 h-4 animate-spin"/>:<Check className="w-4 h-4"/>} Enregistrer</button>
      </div>
    </div>
  );
}

function Row({ label, children }: { label:string; children:React.ReactNode }) {
  return <div><label className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1 block">{label}</label>{children}</div>;
}