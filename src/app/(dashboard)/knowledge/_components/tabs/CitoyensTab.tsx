// src/app/(dashboard)/knowledge/_components/tabs/CitoyensTab.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Plus, Loader2, Landmark, ToggleLeft, ToggleRight,
  Pencil, Trash2, Check, X, MapPin, Clock, FileText, Banknote,
} from "lucide-react";
import { useSector }               from "@/hooks/useSector";
import { useToast }                from "@/components/ui/Toast";
import { serviceCitoyenRepository } from "@/repositories/p5.repository";
import { KnowledgeCardSkeleton }   from "../KnowledgeSkeleton";
import { cn } from "@/lib/utils";
import type {
  ServiceCitoyen,
  CategorieServiceCitoyen,
} from "@/types/api/p5.types";

// ── Catégorie config ────────────────────────────────────────────────────────
const CATEGORIES: Record<CategorieServiceCitoyen, { label: string; color: string }> = {
  etat_civil: { label: "État civil",          color: "bg-blue-100 text-blue-700 border-blue-200" },
  permis:     { label: "Permis & autorisations", color: "bg-amber-100 text-amber-700 border-amber-200" },
  fiscal:     { label: "Fiscal & taxes",      color: "bg-rose-100 text-rose-700 border-rose-200" },
  social:     { label: "Action sociale",      color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  justice:    { label: "Justice",             color: "bg-violet-100 text-violet-700 border-violet-200" },
  autre:      { label: "Autre",               color: "bg-gray-100 text-gray-600 border-gray-200" },
};

// ── Form state ───────────────────────────────────────────────────────────────
const EMPTY = {
  nom_fr:           "",
  description_fr:   "",
  categorie:        "autre" as CategorieServiceCitoyen,
  documents_requis: "",   // "CNI, Acte de naissance" → split par virgule
  duree_traitement: "",
  frais:            "",
  lieu:             "",
};

type FormState = typeof EMPTY;

// ── Helpers ──────────────────────────────────────────────────────────────────
function parseDocs(s: string): string[] {
  return s.split(",").map((d) => d.trim()).filter(Boolean);
}

function docsToString(docs: string[]): string {
  return docs.join(", ");
}

function formatXAF(n: number | null): string {
  if (n === null) return "Gratuit";
  return `${Number(n).toLocaleString("fr-FR")} XAF`;
}

// ── Sous-composant : formulaire add/edit ─────────────────────────────────────
function ServiceForm({
  form,
  onChange,
  onCancel,
  onSave,
  saving,
  theme,
  isEdit = false,
}: {
  form: FormState;
  onChange: (k: keyof FormState, v: string) => void;
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
  theme: { primary: string };
  isEdit?: boolean;
}) {
  return (
    <div className="bg-[var(--bg-subtle)] rounded-2xl border border-[var(--border)] p-5 space-y-4">
      {/* Nom + Catégorie */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
            Nom du service *
          </label>
          <input
            className="input-base"
            placeholder="Ex : Demande d'acte de naissance"
            value={form.nom_fr}
            onChange={(e) => onChange("nom_fr", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
            Catégorie
          </label>
          <select
            className="input-base"
            value={form.categorie}
            onChange={(e) => onChange("categorie", e.target.value)}
          >
            {(Object.keys(CATEGORIES) as CategorieServiceCitoyen[]).map((k) => (
              <option key={k} value={k}>{CATEGORIES[k].label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
          Description
        </label>
        <textarea
          className="input-base resize-none"
          rows={2}
          placeholder="Décrivez brièvement ce service..."
          value={form.description_fr}
          onChange={(e) => onChange("description_fr", e.target.value)}
        />
      </div>

      {/* Documents requis */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
          Documents requis
          <span className="ml-1 font-normal normal-case text-[var(--text-muted)]">
            (séparés par des virgules)
          </span>
        </label>
        <input
          className="input-base"
          placeholder="CNI, Acte de naissance, Certificat de résidence"
          value={form.documents_requis}
          onChange={(e) => onChange("documents_requis", e.target.value)}
        />
      </div>

      {/* Durée + Frais + Lieu */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
            Délai de traitement
          </label>
          <input
            className="input-base"
            placeholder="Ex: 72h, 5 jours ouvrables"
            value={form.duree_traitement}
            onChange={(e) => onChange("duree_traitement", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
            Frais (XAF)
          </label>
          <input
            type="number"
            className="input-base"
            placeholder="Laisser vide = gratuit"
            value={form.frais}
            onChange={(e) => onChange("frais", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
            Lieu
          </label>
          <input
            className="input-base"
            placeholder="Ex: Mairie, Bureau 12"
            value={form.lieu}
            onChange={(e) => onChange("lieu", e.target.value)}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm
                     bg-[var(--bg-card)] border border-[var(--border)]
                     text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
        >
          <X className="w-3.5 h-3.5" /> Annuler
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving || !form.nom_fr.trim()}
          className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm
                     disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: theme.primary }}
        >
          {saving
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <Check className="w-3.5 h-3.5" />
          }
          {isEdit ? "Enregistrer" : "Ajouter"}
        </button>
      </div>
    </div>
  );
}

// ── Sous-composant : carte service ───────────────────────────────────────────
function ServiceCard({
  item,
  onToggle,
  onEdit,
  onDelete,
  theme,
}: {
  item: ServiceCitoyen;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  theme: { primary: string };
}) {
  const cat = CATEGORIES[item.categorie] ?? CATEGORIES.autre;
  const docs = item.documents_requis ?? [];

  return (
    <div
      className={cn(
        "bg-[var(--bg-card)] rounded-2xl border transition-all duration-200",
        "hover:shadow-md hover:-translate-y-0.5",
        item.is_available
          ? "border-[var(--border)]"
          : "border-[var(--border)] opacity-60",
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${theme.primary}18` }}
          >
            <Landmark className="w-4 h-4" style={{ color: theme.primary }} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-[var(--text)] leading-tight truncate">
              {item.nom_fr}
            </p>
            <span
              className={cn(
                "inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                cat.color,
              )}
            >
              {cat.label}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
          <button
            type="button"
            onClick={onEdit}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-subtle)] text-[var(--text-muted)]
                       hover:text-[var(--text)] transition-colors"
            title="Modifier"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-subtle)] transition-colors"
            title={item.is_available ? "Désactiver" : "Activer"}
            style={{ color: item.is_available ? theme.primary : "var(--text-muted)" }}
          >
            {item.is_available
              ? <ToggleRight className="w-4 h-4" />
              : <ToggleLeft  className="w-4 h-4" />
            }
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 rounded-lg hover:bg-rose-50 text-[var(--text-muted)]
                       hover:text-rose-500 transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Description */}
      {item.description_fr && (
        <p className="px-4 pb-2 text-xs text-[var(--text-muted)] line-clamp-2">
          {item.description_fr}
        </p>
      )}

      {/* Chips info */}
      <div className="px-4 pb-3 flex flex-wrap gap-1.5">
        {item.duree_traitement && (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg
                           bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border)]">
            <Clock className="w-3 h-3" />
            {item.duree_traitement}
          </span>
        )}
        {item.frais !== null && (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg
                           bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border)]">
            <Banknote className="w-3 h-3" />
            {formatXAF(item.frais)}
          </span>
        )}
        {item.lieu && (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg
                           bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border)]">
            <MapPin className="w-3 h-3" />
            {item.lieu}
          </span>
        )}
      </div>

      {/* Documents requis */}
      {docs.length > 0 && (
        <div className="mx-4 mb-4 p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)]">
          <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2 flex items-center gap-1">
            <FileText className="w-3 h-3" />
            Documents requis
          </p>
          <div className="flex flex-wrap gap-1.5">
            {docs.map((doc, i) => (
              <span
                key={i}
                className="text-[11px] px-2 py-0.5 rounded-lg border font-medium
                           bg-white text-[var(--text)] border-[var(--border)]"
              >
                {doc}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Composant principal ──────────────────────────────────────────────────────
export function CitoyensTab() {
  const { theme }  = useSector();
  const toast      = useToast();
  const [items,   setItems]   = useState<ServiceCitoyen[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editId,  setEditId]  = useState<string | null>(null);
  const [form,    setForm]    = useState<FormState>(EMPTY);
  const [saving,  startSave]  = useTransition();

  // Chargement initial
  useEffect(() => {
    serviceCitoyenRepository
      .getList()
      .then(setItems)
      .catch(() => toast.error("Erreur lors du chargement des services"))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  // Helper: met à jour un champ du formulaire
  const setField = (k: keyof FormState, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  // Construit le payload à partir du formulaire
  const toPayload = (f: FormState) => ({
    nom_fr:           f.nom_fr.trim(),
    description_fr:   f.description_fr.trim() || undefined,
    categorie:        f.categorie,
    documents_requis: parseDocs(f.documents_requis),
    duree_traitement: f.duree_traitement.trim() || undefined,
    frais:            f.frais ? Number(f.frais) : null,
    lieu:             f.lieu.trim() || undefined,
    is_available:     true,
    ordre:            0,
  });

  // Remplit le formulaire depuis un item existant (edit)
  const fillForm = (item: ServiceCitoyen) => ({
    nom_fr:           item.nom_fr,
    description_fr:   item.description_fr ?? "",
    categorie:        item.categorie,
    documents_requis: docsToString(item.documents_requis ?? []),
    duree_traitement: item.duree_traitement ?? "",
    frais:            item.frais !== null ? String(item.frais) : "",
    lieu:             item.lieu ?? "",
  });

  // ── Ajouter ─────────────────────────────────────────────────────────────
  const handleAdd = () => {
    startSave(async () => {
      try {
        const created = await serviceCitoyenRepository.create(toPayload(form));
        setItems((prev) => [...prev, created]);
        setShowAdd(false);
        setForm(EMPTY);
        toast.success("Service ajouté !");
      } catch {
        toast.error("Erreur lors de l'ajout");
      }
    });
  };

  // ── Modifier ─────────────────────────────────────────────────────────────
  const startEdit = (item: ServiceCitoyen) => {
    setEditId(item.id);
    setForm(fillForm(item));
    setShowAdd(false);
  };

  const handleUpdate = () => {
    if (!editId) return;
    startSave(async () => {
      try {
        const updated = await serviceCitoyenRepository.update(editId, toPayload(form));
        setItems((prev) => prev.map((i) => (i.id === editId ? updated : i)));
        setEditId(null);
        setForm(EMPTY);
        toast.success("Service mis à jour !");
      } catch {
        toast.error("Erreur lors de la mise à jour");
      }
    });
  };

  // ── Toggle disponibilité ─────────────────────────────────────────────────
  const handleToggle = (item: ServiceCitoyen) => {
    startSave(async () => {
      try {
        const updated = await serviceCitoyenRepository.update(item.id, {
          is_available: !item.is_available,
        });
        setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
      } catch {
        toast.error("Erreur lors de la mise à jour");
      }
    });
  };

  // ── Supprimer ─────────────────────────────────────────────────────────────
  const handleDelete = (id: string) => {
    startSave(async () => {
      try {
        await serviceCitoyenRepository.delete(id);
        setItems((prev) => prev.filter((i) => i.id !== id));
        toast.success("Service supprimé");
      } catch {
        toast.error("Erreur lors de la suppression");
      }
    });
  };

  // ── Annuler ──────────────────────────────────────────────────────────────
  const handleCancel = () => {
    setShowAdd(false);
    setEditId(null);
    setForm(EMPTY);
  };

  // ── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: `${theme.primary}18` }}
          >
            <Landmark className="w-5 h-5" style={{ color: theme.primary }} />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--text)]">
              Services publics
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              {loading ? "Chargement…" : `${items.length} service${items.length !== 1 ? "s" : ""} configuré${items.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        {!showAdd && !editId && (
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
            style={{ backgroundColor: theme.primary }}
          >
            <Plus className="w-4 h-4" />
            Ajouter un service
          </button>
        )}
      </div>

      {/* Formulaire d'ajout */}
      {showAdd && (
        <ServiceForm
          form={form}
          onChange={setField}
          onCancel={handleCancel}
          onSave={handleAdd}
          saving={saving}
          theme={theme}
        />
      )}

      {/* Contenu */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <KnowledgeCardSkeleton key={i} />)}
        </div>
      ) : items.length === 0 && !showAdd ? (
        /* État vide */
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div
            className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4"
            style={{ backgroundColor: `${theme.primary}12` }}
          >
            <Landmark className="w-8 h-8" style={{ color: theme.primary }} />
          </div>
          <p className="text-sm font-semibold text-[var(--text)] mb-1">
            Aucun service configuré
          </p>
          <p className="text-xs text-[var(--text-muted)] max-w-xs">
            Ajoutez les services proposés aux citoyens : état civil, permis,
            démarches fiscales…
          </p>
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="mt-4 btn-primary flex items-center gap-2 px-4 py-2 text-sm"
            style={{ backgroundColor: theme.primary }}
          >
            <Plus className="w-4 h-4" />
            Ajouter mon premier service
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((item) =>
            editId === item.id ? (
              /* Formulaire d'édition inline */
              <div key={item.id} className="md:col-span-2 xl:col-span-3">
                <ServiceForm
                  form={form}
                  onChange={setField}
                  onCancel={handleCancel}
                  onSave={handleUpdate}
                  saving={saving}
                  theme={theme}
                  isEdit
                />
              </div>
            ) : (
              <ServiceCard
                key={item.id}
                item={item}
                onToggle={() => handleToggle(item)}
                onEdit={() => startEdit(item)}
                onDelete={() => handleDelete(item.id)}
                theme={theme}
              />
            ),
          )}
        </div>
      )}
    </div>
  );
}