// src/app/(dashboard)/knowledge/_components/catalogue/CatalogueProduitTab.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import { Plus, Loader2, Package, ToggleLeft, ToggleRight, Pencil, Trash2, Check, X } from "lucide-react";
import { useSector } from "@/hooks/useSector";
import { useToast }  from "@/components/ui/Toast";
import { catalogueProduitRepository } from "@/repositories/catalogue.repository";
import { KnowledgeCardSkeleton }      from "../KnowledgeSkeleton";
import { cn } from "@/lib/utils";
import type { CatalogueProduit } from "@/types/api/catalogue.types";

const EMPTY = { nom_fr:"", nom_en:"", description_fr:"", prix:"", reference:"", stock:"-1", image_url:"" };

export function CatalogueProduitTab() {
  const { theme } = useSector();
  const toast     = useToast();
  const [items, setItems]   = useState<CatalogueProduit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editId,  setEditId]  = useState<string|null>(null);
  const [form,    setForm]    = useState(EMPTY);
  const [saving,  startSave]  = useTransition();

  useEffect(() => {
    catalogueProduitRepository.getList().then(setItems).catch(() => toast.error("Erreur chargement"))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const toPayload = (f: typeof EMPTY) => ({
    nom_fr: f.nom_fr.trim(), nom_en: f.nom_en.trim()||undefined,
    description_fr: f.description_fr.trim()||undefined,
    prix: Number(f.prix), reference: f.reference.trim()||undefined,
    stock: Number(f.stock)||0, image_url: f.image_url.trim()||undefined,
    is_available: true, ordre: items.length,
  });

  const handleCreate = () => startSave(async () => {
    if (!form.nom_fr.trim()||!form.prix) return;
    try { const c = await catalogueProduitRepository.create(toPayload(form)); setItems(p=>[...p,c]); setShowAdd(false); setForm(EMPTY); toast.success("Produit ajouté"); }
    catch { toast.error("Erreur"); }
  });

  const handleUpdate = (id: string) => startSave(async () => {
    if (!form.nom_fr.trim()||!form.prix) return;
    try { const u = await catalogueProduitRepository.update(id, toPayload(form)); setItems(p=>p.map(x=>x.id===id?u:x)); setEditId(null); toast.success("Produit mis à jour"); }
    catch { toast.error("Erreur"); }
  });

  const handleDelete = (id: string) => startSave(async () => {
    try { await catalogueProduitRepository.delete(id); setItems(p=>p.filter(x=>x.id!==id)); toast.success("Produit supprimé"); }
    catch { toast.error("Erreur"); }
  });

  const handleToggle = (item: CatalogueProduit) => startSave(async () => {
    try { const u = await catalogueProduitRepository.update(item.id, {is_available:!item.is_available}); setItems(p=>p.map(x=>x.id===item.id?u:x)); }
    catch { toast.error("Erreur"); }
  });

  const startEdit = (item: CatalogueProduit) => {
    setEditId(item.id); setShowAdd(false);
    setForm({ nom_fr:item.nom_fr, nom_en:item.nom_en??'', description_fr:item.description_fr??'', prix:String(item.prix), reference:item.reference??'', stock:String(item.stock), image_url:item.image_url??'' });
  };

  if (loading) return <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">{[1,2,3].map(i=><KnowledgeCardSkeleton key={i}/>)}</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-muted)]">{items.length} produit{items.length!==1?"s":""}</p>
        {!showAdd && <button type="button" onClick={()=>{setShowAdd(true);setEditId(null);setForm(EMPTY);}} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"><Plus className="w-4 h-4"/> Ajouter un produit</button>}
      </div>

      {showAdd && <ProduitForm form={form} set={set} onSave={handleCreate} onCancel={()=>setShowAdd(false)} saving={saving} theme={theme} label="Nouveau produit" />}

      {items.length===0&&!showAdd ? (
        <EmptyState icon={<Package className="w-10 h-10 text-[var(--text-muted)]"/>} msg="Aucun produit. Commencez par en ajouter un." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((item) => editId===item.id ? (
            <div key={item.id} className="sm:col-span-2 xl:col-span-3">
              <ProduitForm form={form} set={set} onSave={()=>handleUpdate(item.id)} onCancel={()=>setEditId(null)} saving={saving} theme={theme} label="Modifier le produit" />
            </div>
          ) : (
            <div key={item.id} className={cn("bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden flex flex-col hover:shadow-md transition-all", !item.is_available&&"opacity-60")}>
              <div className="h-28 flex items-center justify-center relative" style={{background:`linear-gradient(135deg,${theme.primary}20,${theme.primary}40)`}}>
                {item.image_url?<img src={item.image_url} alt={item.nom_fr} className="w-full h-full object-cover"/>:<Package className="w-8 h-8 opacity-40" style={{color:theme.primary}}/>}
                <button type="button" onClick={()=>handleToggle(item)} disabled={saving}
                  className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold backdrop-blur-sm bg-white/80 dark:bg-black/40">
                  {item.is_available?<><ToggleRight className="w-3.5 h-3.5 text-green-500"/>Dispo</>:<><ToggleLeft className="w-3.5 h-3.5 text-[var(--text-muted)]"/>Indispo</>}
                </button>
              </div>
              <div className="p-4 flex flex-col gap-1.5 flex-1">
                <p className="font-semibold text-sm text-[var(--text)]">{item.nom_fr}</p>
                {item.reference&&<p className="text-[10px] text-[var(--text-muted)] font-mono">#{item.reference}</p>}
                {item.description_fr&&<p className="text-xs text-[var(--text-muted)] line-clamp-2">{item.description_fr}</p>}
                <div className="flex items-center gap-2 mt-auto pt-1">
                  <span className="text-sm font-bold" style={{color:theme.primary}}>{Number(item.prix).toLocaleString("fr-FR")} XAF</span>
                  {item.stock===-1?<span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Illimité</span>:item.stock===0?<span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Rupture</span>:<span className="text-[10px] bg-[var(--bg)] text-[var(--text-muted)] px-1.5 py-0.5 rounded">{item.stock} en stock</span>}
                </div>
                <div className="flex justify-end gap-1">
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

function ProduitForm({ form, set, onSave, onCancel, saving, theme, label }: {
  form: Record<string,string>; set: (k:string)=>(e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>void;
  onSave:()=>void; onCancel:()=>void; saving:boolean; theme:{primary:string}; label:string;
}) {
  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border-2 p-5 space-y-3" style={{borderColor:theme.primary}}>
      <p className="text-sm font-semibold text-[var(--text)]">{label}</p>
      <div className="grid grid-cols-2 gap-3">
        <Row label="Nom (FR) *"><input className="input-base" value={form.nom_fr} onChange={set("nom_fr")} autoFocus/></Row>
        <Row label="Nom (EN)"><input className="input-base" value={form.nom_en} onChange={set("nom_en")}/></Row>
      </div>
      <Row label="Description (FR)"><textarea className="input-base resize-none" rows={2} value={form.description_fr} onChange={set("description_fr")}/></Row>
      <div className="grid grid-cols-3 gap-3">
        <Row label="Prix (XAF) *"><input className="input-base" type="number" min="0" value={form.prix} onChange={set("prix")}/></Row>
        <Row label="Référence"><input className="input-base" value={form.reference} onChange={set("reference")}/></Row>
        <Row label="Stock (-1=illimité)"><input className="input-base" type="number" value={form.stock} onChange={set("stock")}/></Row>
      </div>
      <Row label="URL image"><input className="input-base" type="url" placeholder="https://..." value={form.image_url} onChange={set("image_url")}/></Row>
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl border border-[var(--border)] hover:bg-[var(--bg)] text-[var(--text-muted)]"><X className="w-4 h-4"/> Annuler</button>
        <button type="button" onClick={onSave} disabled={saving||!form.nom_fr.trim()||!form.prix} className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm disabled:opacity-60">{saving?<Loader2 className="w-4 h-4 animate-spin"/>:<Check className="w-4 h-4"/>} Enregistrer</button>
      </div>
    </div>
  );
}

function Row({ label, children }: { label:string; children:React.ReactNode }) {
  return <div><label className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1 block">{label}</label>{children}</div>;
}

function EmptyState({ icon, msg }: { icon:React.ReactNode; msg:string }) {
  return <div className="flex flex-col items-center justify-center py-20 gap-3 text-center bg-[var(--bg-card)] rounded-2xl border border-dashed border-[var(--border)]">{icon}<p className="text-sm text-[var(--text-muted)]">{msg}</p></div>;
}