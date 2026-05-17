// src/app/(dashboard)/knowledge/_components/catalogue/ProduitFinancierTab.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import { Plus, Loader2, Landmark, ToggleLeft, ToggleRight, Pencil, Trash2, Check, X } from "lucide-react";
import { useSector } from "@/hooks/useSector";
import { useToast }  from "@/components/ui/Toast";
import { produitFinancierRepository } from "@/repositories/catalogue.repository";
import { KnowledgeCardSkeleton }      from "../KnowledgeSkeleton";
import { cn } from "@/lib/utils";
import type { ProduitFinancier, TypeProduitFinancier } from "@/types/api/catalogue.types";

const TYPE_LABELS: Record<TypeProduitFinancier, string> = {
  compte_courant: "Compte courant", compte_epargne: "Compte épargne",
  credit: "Crédit / Prêt", assurance: "Assurance", investissement: "Investissement",
};

const EMPTY = { nom_fr:"", nom_en:"", description_fr:"", type_produit:"compte_courant", taux_interet:"", montant_min:"", montant_max:"", conditions:"" };

export function ProduitFinancierTab() {
  const { theme } = useSector();
  const toast     = useToast();
  const [items,   setItems]   = useState<ProduitFinancier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editId,  setEditId]  = useState<string|null>(null);
  const [form,    setForm]    = useState(EMPTY);
  const [saving,  startSave]  = useTransition();

  useEffect(() => {
    produitFinancierRepository.getList().then(setItems).catch(()=>toast.error("Erreur chargement"))
      .finally(()=>setLoading(false));
  }, []); // eslint-disable-line

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) =>
    setForm(f=>({...f,[k]:e.target.value}));

  const toPayload = (f: typeof EMPTY) => ({
    nom_fr: f.nom_fr.trim(), nom_en: f.nom_en.trim()||undefined,
    description_fr: f.description_fr.trim()||undefined,
    type_produit: f.type_produit as TypeProduitFinancier,
    taux_interet: f.taux_interet?Number(f.taux_interet):null,
    montant_min: f.montant_min?Number(f.montant_min):null,
    montant_max: f.montant_max?Number(f.montant_max):null,
    conditions: f.conditions.trim()||undefined,
    is_available: true, ordre: items.length,
  });

  const handleCreate = () => startSave(async () => {
    if (!form.nom_fr.trim()) return;
    try { const c = await produitFinancierRepository.create(toPayload(form)); setItems(p=>[...p,c]); setShowAdd(false); setForm(EMPTY); toast.success("Produit ajouté"); }
    catch { toast.error("Erreur"); }
  });

  const handleUpdate = (id: string) => startSave(async () => {
    if (!form.nom_fr.trim()) return;
    try { const u = await produitFinancierRepository.update(id, toPayload(form)); setItems(p=>p.map(x=>x.id===id?u:x)); setEditId(null); toast.success("Produit mis à jour"); }
    catch { toast.error("Erreur"); }
  });

  const handleDelete = (id: string) => startSave(async () => {
    try { await produitFinancierRepository.delete(id); setItems(p=>p.filter(x=>x.id!==id)); toast.success("Produit supprimé"); }
    catch { toast.error("Erreur"); }
  });

  const handleToggle = (item: ProduitFinancier) => startSave(async () => {
    try { const u = await produitFinancierRepository.update(item.id, {is_available:!item.is_available}); setItems(p=>p.map(x=>x.id===item.id?u:x)); }
    catch { toast.error("Erreur"); }
  });

  const startEdit = (item: ProduitFinancier) => {
    setEditId(item.id); setShowAdd(false);
    setForm({ nom_fr:item.nom_fr, nom_en:item.nom_en??'', description_fr:item.description_fr??'', type_produit:item.type_produit, taux_interet:item.taux_interet!=null?String(item.taux_interet):"", montant_min:item.montant_min!=null?String(item.montant_min):"", montant_max:item.montant_max!=null?String(item.montant_max):"", conditions:item.conditions??'' });
  };

  if (loading) return <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">{[1,2,3].map(i=><KnowledgeCardSkeleton key={i}/>)}</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-muted)]">{items.length} produit{items.length!==1?"s":""}</p>
        {!showAdd && <button type="button" onClick={()=>{setShowAdd(true);setEditId(null);setForm(EMPTY);}} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"><Plus className="w-4 h-4"/> Ajouter un produit</button>}
      </div>

      {showAdd && <ProduitFinForm form={form} set={set} onSave={handleCreate} onCancel={()=>setShowAdd(false)} saving={saving} theme={theme} label="Nouveau produit financier"/>}

      {items.length===0&&!showAdd ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center bg-[var(--bg-card)] rounded-2xl border border-dashed border-[var(--border)]">
          <Landmark className="w-10 h-10 text-[var(--text-muted)]"/><p className="text-sm text-[var(--text-muted)]">Aucun produit financier. Commencez par en ajouter un.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((item) => editId===item.id ? (
            <div key={item.id} className="sm:col-span-2 xl:col-span-3">
              <ProduitFinForm form={form} set={set} onSave={()=>handleUpdate(item.id)} onCancel={()=>setEditId(null)} saving={saving} theme={theme} label="Modifier le produit"/>
            </div>
          ) : (
            <div key={item.id} className={cn("bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-5 flex flex-col gap-2 hover:shadow-md transition-all",!item.is_available&&"opacity-60")}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-sm text-[var(--text)]">{item.nom_fr}</p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-medium mt-0.5 inline-block" style={{backgroundColor:`${theme.primary}20`,color:theme.primary}}>
                    {TYPE_LABELS[item.type_produit]}
                  </span>
                </div>
                <button type="button" onClick={()=>handleToggle(item)} disabled={saving}
                  className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold bg-[var(--bg)] flex-shrink-0">
                  {item.is_available?<><ToggleRight className="w-3.5 h-3.5 text-green-500"/>Dispo</>:<><ToggleLeft className="w-3.5 h-3.5 text-[var(--text-muted)]"/>Indispo</>}
                </button>
              </div>
              {item.description_fr&&<p className="text-xs text-[var(--text-muted)] line-clamp-2">{item.description_fr}</p>}
              <div className="grid grid-cols-2 gap-2 text-xs text-[var(--text-muted)] mt-1">
                {item.taux_interet!=null&&<span>Taux : <strong className="text-[var(--text)]">{item.taux_interet}%</strong></span>}
                {item.montant_min!=null&&<span>Min : <strong className="text-[var(--text)]">{Number(item.montant_min).toLocaleString("fr-FR")} XAF</strong></span>}
                {item.montant_max!=null&&<span>Max : <strong className="text-[var(--text)]">{Number(item.montant_max).toLocaleString("fr-FR")} XAF</strong></span>}
              </div>
              {item.conditions&&<p className="text-xs text-[var(--text-muted)] bg-[var(--bg)] rounded-lg px-3 py-2 line-clamp-2">{item.conditions}</p>}
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

function ProduitFinForm({ form, set, onSave, onCancel, saving, theme, label }: {
  form:Record<string,string>; set:(k:string)=>(e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>)=>void;
  onSave:()=>void; onCancel:()=>void; saving:boolean; theme:{primary:string}; label:string;
}) {
  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border-2 p-5 space-y-3" style={{borderColor:theme.primary}}>
      <p className="text-sm font-semibold text-[var(--text)]">{label}</p>
      <div className="grid grid-cols-2 gap-3">
        <Row label="Nom (FR) *"><input className="input-base" value={form.nom_fr} onChange={set("nom_fr")} autoFocus/></Row>
        <Row label="Type *">
          <select className="input-base" value={form.type_produit} onChange={set("type_produit")}>
            {Object.entries(TYPE_LABELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
          </select>
        </Row>
      </div>
      <Row label="Description"><textarea className="input-base resize-none" rows={2} value={form.description_fr} onChange={set("description_fr")}/></Row>
      <div className="grid grid-cols-3 gap-3">
        <Row label="Taux (%)"><input className="input-base" type="number" step="0.01" value={form.taux_interet} onChange={set("taux_interet")}/></Row>
        <Row label="Montant min (XAF)"><input className="input-base" type="number" value={form.montant_min} onChange={set("montant_min")}/></Row>
        <Row label="Montant max (XAF)"><input className="input-base" type="number" value={form.montant_max} onChange={set("montant_max")}/></Row>
      </div>
      <Row label="Conditions d'éligibilité"><textarea className="input-base resize-none" rows={2} value={form.conditions} onChange={set("conditions")}/></Row>
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