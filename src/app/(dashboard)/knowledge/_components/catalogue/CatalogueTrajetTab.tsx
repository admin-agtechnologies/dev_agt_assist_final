// src/app/(dashboard)/knowledge/_components/catalogue/CatalogueTrajetTab.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import { Plus, Loader2, MapPin, ArrowRight, Clock, ToggleLeft, ToggleRight, Pencil, Trash2, Check, X } from "lucide-react";
import { useSector } from "@/hooks/useSector";
import { useToast }  from "@/components/ui/Toast";
import { catalogueTrajetRepository } from "@/repositories/catalogue.repository";
import { KnowledgeCardSkeleton }     from "../KnowledgeSkeleton";
import { cn } from "@/lib/utils";
import type { CatalogueTrajet } from "@/types/api/catalogue.types";

const EMPTY = { depart_fr:"", destination_fr:"", prix:"", duree_min:"", horaires_depart:"" };

export function CatalogueTrajetTab() {
  const { theme } = useSector();
  const toast     = useToast();
  const [items,   setItems]   = useState<CatalogueTrajet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editId,  setEditId]  = useState<string|null>(null);
  const [form,    setForm]    = useState(EMPTY);
  const [saving,  startSave]  = useTransition();

  useEffect(() => {
    catalogueTrajetRepository.getList().then(setItems).catch(()=>toast.error("Erreur chargement"))
      .finally(()=>setLoading(false));
  }, []); // eslint-disable-line

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f=>({...f,[k]:e.target.value}));

  const parseHoraires = (s: string) => s.split(",").map(h=>h.trim()).filter(Boolean);

  const toPayload = (f: typeof EMPTY) => ({
    depart_fr: f.depart_fr.trim(), destination_fr: f.destination_fr.trim(),
    prix: Number(f.prix), duree_min: f.duree_min?Number(f.duree_min):null,
    horaires_depart: parseHoraires(f.horaires_depart),
    is_available: true, ordre: items.length,
  });

  const handleCreate = () => startSave(async () => {
    if (!form.depart_fr.trim()||!form.destination_fr.trim()||!form.prix) return;
    try { const c = await catalogueTrajetRepository.create(toPayload(form)); setItems(p=>[...p,c]); setShowAdd(false); setForm(EMPTY); toast.success("Trajet ajouté"); }
    catch { toast.error("Erreur"); }
  });

  const handleUpdate = (id: string) => startSave(async () => {
    if (!form.depart_fr.trim()||!form.destination_fr.trim()||!form.prix) return;
    try { const u = await catalogueTrajetRepository.update(id, toPayload(form)); setItems(p=>p.map(x=>x.id===id?u:x)); setEditId(null); toast.success("Trajet mis à jour"); }
    catch { toast.error("Erreur"); }
  });

  const handleDelete = (id: string) => startSave(async () => {
    try { await catalogueTrajetRepository.delete(id); setItems(p=>p.filter(x=>x.id!==id)); toast.success("Trajet supprimé"); }
    catch { toast.error("Erreur"); }
  });

  const handleToggle = (item: CatalogueTrajet) => startSave(async () => {
    try { const u = await catalogueTrajetRepository.update(item.id, {is_available:!item.is_available}); setItems(p=>p.map(x=>x.id===item.id?u:x)); }
    catch { toast.error("Erreur"); }
  });

  const startEdit = (item: CatalogueTrajet) => {
    setEditId(item.id); setShowAdd(false);
    setForm({ depart_fr:item.depart_fr, destination_fr:item.destination_fr, prix:String(item.prix), duree_min:item.duree_min!=null?String(item.duree_min):"", horaires_depart:item.horaires_depart.join(", ") });
  };

  if (loading) return <div className="space-y-3">{[1,2,3].map(i=><KnowledgeCardSkeleton key={i}/>)}</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-muted)]">{items.length} trajet{items.length!==1?"s":""}</p>
        {!showAdd && <button type="button" onClick={()=>{setShowAdd(true);setEditId(null);setForm(EMPTY);}} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"><Plus className="w-4 h-4"/> Ajouter un trajet</button>}
      </div>

      {showAdd && <TrajetForm form={form} set={set} onSave={handleCreate} onCancel={()=>setShowAdd(false)} saving={saving} theme={theme} label="Nouveau trajet"/>}

      {items.length===0&&!showAdd ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center bg-[var(--bg-card)] rounded-2xl border border-dashed border-[var(--border)]">
          <MapPin className="w-10 h-10 text-[var(--text-muted)]"/><p className="text-sm text-[var(--text-muted)]">Aucun trajet. Commencez par en ajouter un.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => editId===item.id ? (
            <TrajetForm key={item.id} form={form} set={set} onSave={()=>handleUpdate(item.id)} onCancel={()=>setEditId(null)} saving={saving} theme={theme} label="Modifier le trajet"/>
          ) : (
            <div key={item.id} className={cn("bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-4 flex items-center gap-4 hover:shadow-sm transition-all",!item.is_available&&"opacity-60")}>
              {/* Départ → Destination */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 font-semibold text-[var(--text)]">
                  <MapPin className="w-4 h-4 flex-shrink-0" style={{color:theme.primary}}/>
                  <span className="truncate">{item.depart_fr}</span>
                  <ArrowRight className="w-4 h-4 flex-shrink-0 text-[var(--text-muted)]"/>
                  <span className="truncate">{item.destination_fr}</span>
                </div>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-sm font-bold" style={{color:theme.primary}}>{Number(item.prix).toLocaleString("fr-FR")} XAF</span>
                  {item.duree_min&&<span className="flex items-center gap-1 text-xs text-[var(--text-muted)]"><Clock className="w-3 h-3"/>{item.duree_min} min</span>}
                </div>
                {item.horaires_depart.length>0&&(
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {item.horaires_depart.map(h=>(
                      <span key={h} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg)] text-[var(--text-muted)]">{h}</span>
                    ))}
                  </div>
                )}
              </div>
              {/* Actions */}
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <button type="button" onClick={()=>handleToggle(item)} disabled={saving}
                  className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold bg-[var(--bg)]">
                  {item.is_available?<><ToggleRight className="w-3.5 h-3.5 text-green-500"/>Dispo</>:<><ToggleLeft className="w-3.5 h-3.5 text-[var(--text-muted)]"/>Indispo</>}
                </button>
                <div className="flex gap-1">
                  <button type="button" onClick={()=>startEdit(item)} className="p-1.5 rounded-lg hover:bg-[var(--bg)]"><Pencil className="w-3.5 h-3.5 text-[var(--text-muted)]"/></button>
                  <button type="button" onClick={()=>handleDelete(item.id)} disabled={saving} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-3.5 h-3.5 text-red-400"/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TrajetForm({ form, set, onSave, onCancel, saving, theme, label }: {
  form:Record<string,string>; set:(k:string)=>(e:React.ChangeEvent<HTMLInputElement>)=>void;
  onSave:()=>void; onCancel:()=>void; saving:boolean; theme:{primary:string}; label:string;
}) {
  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border-2 p-5 space-y-3" style={{borderColor:theme.primary}}>
      <p className="text-sm font-semibold text-[var(--text)]">{label}</p>
      <div className="grid grid-cols-2 gap-3">
        <Row label="Départ *"><input className="input-base" value={form.depart_fr} onChange={set("depart_fr")} placeholder="Douala" autoFocus/></Row>
        <Row label="Destination *"><input className="input-base" value={form.destination_fr} onChange={set("destination_fr")} placeholder="Yaoundé"/></Row>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Row label="Prix (XAF) *"><input className="input-base" type="number" min="0" value={form.prix} onChange={set("prix")}/></Row>
        <Row label="Durée (minutes)"><input className="input-base" type="number" min="0" value={form.duree_min} onChange={set("duree_min")}/></Row>
      </div>
      <Row label="Horaires (séparés par virgule)"><input className="input-base" placeholder="06:00, 09:00, 14:00" value={form.horaires_depart} onChange={set("horaires_depart")}/></Row>
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl border border-[var(--border)] hover:bg-[var(--bg)] text-[var(--text-muted)]"><X className="w-4 h-4"/> Annuler</button>
        <button type="button" onClick={onSave} disabled={saving||!form.depart_fr.trim()||!form.destination_fr.trim()||!form.prix} className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm disabled:opacity-60">{saving?<Loader2 className="w-4 h-4 animate-spin"/>:<Check className="w-4 h-4"/>} Enregistrer</button>
      </div>
    </div>
  );
}

function Row({ label, children }: { label:string; children:React.ReactNode }) {
  return <div><label className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1 block">{label}</label>{children}</div>;
}