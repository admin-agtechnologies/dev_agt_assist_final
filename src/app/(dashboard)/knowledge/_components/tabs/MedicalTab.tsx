// src/app/(dashboard)/knowledge/_components/tabs/MedicalTab.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import { Plus, Loader2, Stethoscope, ToggleLeft, ToggleRight, Pencil, Trash2, Check, X, Users, Clock } from "lucide-react";
import { useSector }            from "@/hooks/useSector";
import { useToast }             from "@/components/ui/Toast";
import { specialiteRepository } from "@/repositories/p5.repository";
import { KnowledgeCardSkeleton } from "../KnowledgeSkeleton";
import { cn } from "@/lib/utils";
import type { SpecialiteMedicale } from "@/types/api/p5.types";

const EMPTY = { nom_fr:"", description_fr:"", medecins:"", equipements:"", tarif_consultation:"", duree_consultation_min:"" };

export function MedicalTab() {
  const { theme } = useSector();
  const toast     = useToast();
  const [items,   setItems]   = useState<SpecialiteMedicale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editId,  setEditId]  = useState<string|null>(null);
  const [form,    setForm]    = useState(EMPTY);
  const [saving,  startSave]  = useTransition();

  useEffect(() => {
    specialiteRepository.getList().then(setItems).catch(()=>toast.error("Erreur chargement")).finally(()=>setLoading(false));
  }, []); // eslint-disable-line

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) =>
    setForm(f=>({...f,[k]:e.target.value}));

  // medecins : "Dr. Mballa (Cardiologue), Dr. Ngo (Généraliste)" → [{nom, titre}]
  const parseMedecins = (s: string) =>
    s.split(",").map(m=>m.trim()).filter(Boolean).map(m=>{
      const match = m.match(/^(.+?)\s*\((.+?)\)$/);
      return match ? { nom: match[1].trim(), titre: match[2].trim() } : { nom: m, titre: "" };
    });

  const toPayload = (f: typeof EMPTY) => ({
    nom_fr: f.nom_fr.trim(), description_fr: f.description_fr.trim()||undefined,
    medecins: parseMedecins(f.medecins),
    equipements: f.equipements.split(",").map(e=>e.trim()).filter(Boolean),
    tarif_consultation: f.tarif_consultation?Number(f.tarif_consultation):null,
    duree_consultation_min: f.duree_consultation_min?Number(f.duree_consultation_min):null,
    is_available: true, ordre: items.length,
  });

  const handleCreate = () => startSave(async () => {
    if (!form.nom_fr.trim()) return;
    try { const c = await specialiteRepository.create(toPayload(form)); setItems(p=>[...p,c]); setShowAdd(false); setForm(EMPTY); toast.success("Spécialité ajoutée"); }
    catch { toast.error("Erreur"); }
  });
  const handleUpdate = (id: string) => startSave(async () => {
    if (!form.nom_fr.trim()) return;
    try { const u = await specialiteRepository.update(id, toPayload(form)); setItems(p=>p.map(x=>x.id===id?u:x)); setEditId(null); toast.success("Spécialité mise à jour"); }
    catch { toast.error("Erreur"); }
  });
  const handleDelete = (id: string) => startSave(async () => {
    try { await specialiteRepository.delete(id); setItems(p=>p.filter(x=>x.id!==id)); toast.success("Spécialité supprimée"); }
    catch { toast.error("Erreur"); }
  });
  const handleToggle = (item: SpecialiteMedicale) => startSave(async () => {
    try { const u = await specialiteRepository.update(item.id, {is_available:!item.is_available}); setItems(p=>p.map(x=>x.id===item.id?u:x)); }
    catch { toast.error("Erreur"); }
  });
  const startEdit = (item: SpecialiteMedicale) => {
    setEditId(item.id); setShowAdd(false);
    setForm({ nom_fr:item.nom_fr, description_fr:item.description_fr??'', medecins:item.medecins.map(m=>m.titre?`${m.nom} (${m.titre})`:m.nom).join(", "), equipements:item.equipements.join(", "), tarif_consultation:item.tarif_consultation!=null?String(item.tarif_consultation):'', duree_consultation_min:item.duree_consultation_min!=null?String(item.duree_consultation_min):'' });
  };

  if (loading) return <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">{[1,2,3].map(i=><KnowledgeCardSkeleton key={i}/>)}</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-muted)]">{items.length} spécialité{items.length!==1?"s":""}</p>
        {!showAdd && <button type="button" onClick={()=>{setShowAdd(true);setEditId(null);setForm(EMPTY);}} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"><Plus className="w-4 h-4"/> Ajouter une spécialité</button>}
      </div>

      {showAdd && <SpecialiteForm form={form} set={set} onSave={handleCreate} onCancel={()=>setShowAdd(false)} saving={saving} theme={theme} label="Nouvelle spécialité"/>}

      {items.length===0&&!showAdd ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center bg-[var(--bg-card)] rounded-2xl border border-dashed border-[var(--border)]">
          <Stethoscope className="w-10 h-10 text-[var(--text-muted)]"/><p className="text-sm text-[var(--text-muted)]">Aucune spécialité configurée.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((item) => editId===item.id ? (
            <div key={item.id} className="sm:col-span-2 xl:col-span-3">
              <SpecialiteForm form={form} set={set} onSave={()=>handleUpdate(item.id)} onCancel={()=>setEditId(null)} saving={saving} theme={theme} label="Modifier la spécialité"/>
            </div>
          ) : (
            <div key={item.id} className={cn("bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden flex flex-col hover:shadow-md transition-all",!item.is_available&&"opacity-60")}>
              <div className="h-16 flex items-center px-5" style={{background:`linear-gradient(135deg,${theme.primary}20,${theme.primary}40)`}}>
                <Stethoscope className="w-6 h-6 opacity-60" style={{color:theme.primary}}/>
                <span className="ml-3 font-semibold text-sm text-[var(--text)]">{item.nom_fr}</span>
              </div>
              <div className="p-4 flex flex-col gap-2 flex-1">
                {item.description_fr&&<p className="text-xs text-[var(--text-muted)] line-clamp-2">{item.description_fr}</p>}
                <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                  {item.medecins.length>0&&<span className="flex items-center gap-1"><Users className="w-3 h-3"/>{item.medecins.length} médecin{item.medecins.length>1?"s":""}</span>}
                  {item.tarif_consultation!=null&&<span className="font-bold" style={{color:theme.primary}}>{Number(item.tarif_consultation).toLocaleString("fr-FR")} XAF</span>}
                  {item.duree_consultation_min&&<span className="flex items-center gap-1"><Clock className="w-3 h-3"/>{item.duree_consultation_min} min</span>}
                </div>
                {item.equipements.length>0&&(
                  <div className="flex flex-wrap gap-1">
                    {item.equipements.slice(0,3).map(e=><span key={e} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg)] text-[var(--text-muted)]">{e}</span>)}
                    {item.equipements.length>3&&<span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg)] text-[var(--text-muted)]">+{item.equipements.length-3}</span>}
                  </div>
                )}
                <div className="flex items-center justify-between mt-auto pt-1">
                  <button type="button" onClick={()=>handleToggle(item)} disabled={saving} className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold bg-[var(--bg)]">
                    {item.is_available?<><ToggleRight className="w-3.5 h-3.5 text-green-500"/>Dispo</>:<><ToggleLeft className="w-3.5 h-3.5 text-[var(--text-muted)]"/>Indispo</>}
                  </button>
                  <div className="flex gap-1">
                    <button type="button" onClick={()=>startEdit(item)} className="p-1.5 rounded-lg hover:bg-[var(--bg)]"><Pencil className="w-3.5 h-3.5 text-[var(--text-muted)]"/></button>
                    <button type="button" onClick={()=>handleDelete(item.id)} disabled={saving} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-3.5 h-3.5 text-red-400"/></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SpecialiteForm({ form, set, onSave, onCancel, saving, theme, label }: {
  form:Record<string,string>; set:(k:string)=>(e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>void;
  onSave:()=>void; onCancel:()=>void; saving:boolean; theme:{primary:string}; label:string;
}) {
  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border-2 p-5 space-y-3" style={{borderColor:theme.primary}}>
      <p className="text-sm font-semibold text-[var(--text)]">{label}</p>
      <Row label="Nom de la spécialité *"><input className="input-base" value={form.nom_fr} onChange={set("nom_fr")} autoFocus/></Row>
      <Row label="Description"><textarea className="input-base resize-none" rows={2} value={form.description_fr} onChange={set("description_fr")}/></Row>
      <Row label='Médecins (format: "Dr. Nom (Titre), ...")'>
        <input className="input-base" placeholder='Dr. Mballa (Cardiologue), Dr. Ngo (Généraliste)' value={form.medecins} onChange={set("medecins")}/>
      </Row>
      <Row label="Équipements (séparés par virgule)"><input className="input-base" placeholder="Scanner, IRM, Échographe" value={form.equipements} onChange={set("equipements")}/></Row>
      <div className="grid grid-cols-2 gap-3">
        <Row label="Tarif consultation (XAF)"><input className="input-base" type="number" value={form.tarif_consultation} onChange={set("tarif_consultation")}/></Row>
        <Row label="Durée consultation (min)"><input className="input-base" type="number" value={form.duree_consultation_min} onChange={set("duree_consultation_min")}/></Row>
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