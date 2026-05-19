// src/components/reservations/RessourceManager/RessourceForm.tsx
"use client";

import { useState } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { useSector } from "@/hooks/useSector";
import type { CreateRessourcePayload, Ressource } from "@/types/api/reservation.types";
import type { Locale } from "@/contexts/LanguageContext";

// ── Helpers metadata ──────────────────────────────────────────────────────────

const ZONES_TABLE = [
  { value: "interieur",  label: "Intérieur" },
  { value: "terrasse",   label: "Terrasse" },
  { value: "salon_vip",  label: "Salon VIP" },
  { value: "autre",      label: "Autre" },
];

function parseInitialMeta(r: Ressource | undefined, type: string): Record<string, string> {
  const m = (r?.metadata ?? {}) as Record<string, unknown>;
  if (type === "table")     return {
    zone:   String(m.zone   ?? "interieur"),
    numero: String(m.numero ?? ""),
  };
  if (type === "trajet")    return {
    depart:          String(m.depart          ?? ""),
    destination:     String(m.destination     ?? ""),
    duree_estimee:   String(m.duree_estimee   ?? ""),
    horaires_depart: String(m.horaires_depart ?? ""),
  };
  if (type === "praticien") return {
    specialite: String(m.specialite ?? ""),
    duree_rdv:  String(m.duree_rdv  ?? ""),
  };
  return {};
}

function buildMetadata(type: string, meta: Record<string, string>): Record<string, unknown> {
  if (type === "table")     return {
    zone: meta.zone,
    ...(meta.numero ? { numero: meta.numero } : {}),
  };
  if (type === "trajet")    return {
    depart:      meta.depart,
    destination: meta.destination,
    ...(meta.duree_estimee   ? { duree_estimee:   meta.duree_estimee   } : {}),
    ...(meta.horaires_depart ? { horaires_depart: meta.horaires_depart } : {}),
  };
  if (type === "praticien") return {
    specialite: meta.specialite,
    ...(meta.duree_rdv ? { duree_rdv: Number(meta.duree_rdv) } : {}),
  };
  return {};
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface RessourceFormProps {
  mode:          "create" | "edit";
  featureSlug:   string;
  ressourceType: string;
  locale:        Locale;
  initialData?:  Ressource;
  onSave:        (payload: CreateRessourcePayload) => Promise<void>;
  onCancel:      () => void;
}

// ── Composant ─────────────────────────────────────────────────────────────────

export function RessourceForm({
  mode, featureSlug, ressourceType, locale, initialData, onSave, onCancel,
}: RessourceFormProps) {
  const { theme } = useSector();

  const [nom,      setNom]      = useState(initialData?.nom ?? "");
  const [capacite, setCapacite] = useState(
    String(initialData?.capacite ?? (ressourceType === "praticien" ? "1" : "2"))
  );
  const [meta, setMeta] = useState<Record<string, string>>(
    parseInitialMeta(initialData, ressourceType)
  );
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  const setM = (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setMeta((m) => ({ ...m, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!nom.trim()) {
      setError(locale === "fr" ? "Le nom est requis." : "Name is required."); return;
    }
    if (ressourceType === "trajet" && (!meta.depart?.trim() || !meta.destination?.trim())) {
      setError(locale === "fr" ? "Départ et destination sont requis." : "Departure and destination are required."); return;
    }
    setSaving(true); setError(null);
    try {
      await onSave({
        nom:          nom.trim(),
        type:         ressourceType,
        capacite:     Number(capacite) || 1,
        metadata:     buildMetadata(ressourceType, meta),
        feature_slug: featureSlug,
      } as CreateRessourcePayload);
    } catch {
      setError(locale === "fr" ? "Erreur lors de l'enregistrement." : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const nomLabel = ({
    table:     locale === "fr" ? "Nom de la table (ex: Table 5)"           : "Table name",
    trajet:    locale === "fr" ? "Nom du trajet (ex: Yaoundé → Douala 6h)" : "Route name",
    praticien: locale === "fr" ? "Nom du médecin (ex: Dr. Mbarga)"         : "Doctor name",
  } as Record<string, string>)[ressourceType] ?? (locale === "fr" ? "Nom" : "Name");

  const capaciteLabel = ({
    table:     locale === "fr" ? "Capacité (personnes)"        : "Capacity (persons)",
    trajet:    locale === "fr" ? "Places disponibles"          : "Available seats",
    praticien: locale === "fr" ? "Consultations simultanées"   : "Simultaneous consults",
  } as Record<string, string>)[ressourceType] ?? (locale === "fr" ? "Capacité" : "Capacity");

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border-2 p-5 space-y-3"
      style={{ borderColor: theme.primary }}>
      <p className="text-sm font-semibold text-[var(--text)]">
        {mode === "create"
          ? (locale === "fr" ? "Nouvelle ressource" : "New resource")
          : (locale === "fr" ? "Modifier la ressource" : "Edit resource")}
      </p>

      {/* Nom */}
      <Row label={nomLabel}>
        <input className="input-base" value={nom}
          onChange={(e) => setNom(e.target.value)} autoFocus />
      </Row>

      {/* Champs metadata par type */}
      {ressourceType === "table" && (
        <div className="grid grid-cols-2 gap-3">
          <Row label="Zone">
            <select className="input-base" value={meta.zone ?? "interieur"} onChange={setM("zone")}>
              {ZONES_TABLE.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </Row>
          <Row label="Numéro (optionnel)">
            <input className="input-base" placeholder="T5"
              value={meta.numero ?? ""} onChange={setM("numero")} />
          </Row>
        </div>
      )}

      {ressourceType === "trajet" && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Row label="Ville de départ *">
              <input className="input-base" placeholder="Yaoundé"
                value={meta.depart ?? ""} onChange={setM("depart")} />
            </Row>
            <Row label="Destination *">
              <input className="input-base" placeholder="Douala"
                value={meta.destination ?? ""} onChange={setM("destination")} />
            </Row>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Row label="Durée estimée">
              <input className="input-base" placeholder="4h"
                value={meta.duree_estimee ?? ""} onChange={setM("duree_estimee")} />
            </Row>
            <Row label="Horaires (séparés par virgule)">
              <input className="input-base" placeholder="06:00, 10:00, 14:00"
                value={meta.horaires_depart ?? ""} onChange={setM("horaires_depart")} />
            </Row>
          </div>
        </>
      )}

      {ressourceType === "praticien" && (
        <div className="grid grid-cols-2 gap-3">
          <Row label="Spécialité">
            <input className="input-base" placeholder="Cardiologue"
              value={meta.specialite ?? ""} onChange={setM("specialite")} />
          </Row>
          <Row label="Durée RDV (minutes)">
            <input className="input-base" type="number" min="5" placeholder="30"
              value={meta.duree_rdv ?? ""} onChange={setM("duree_rdv")} />
          </Row>
        </div>
      )}

      {/* Capacité */}
      <Row label={capaciteLabel}>
        <input className="input-base w-28" type="number" min="1"
          value={capacite} onChange={(e) => setCapacite(e.target.value)} />
      </Row>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel}
          className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl border border-[var(--border)] hover:bg-[var(--bg)] text-[var(--text-muted)]">
          <X className="w-4 h-4" />
          {locale === "fr" ? "Annuler" : "Cancel"}
        </button>
        <button type="button" onClick={handleSubmit} disabled={saving || !nom.trim()}
          className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm disabled:opacity-60">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {locale === "fr" ? (saving ? "Enregistrement…" : "Enregistrer") : (saving ? "Saving…" : "Save")}
        </button>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1 block">
        {label}
      </label>
      {children}
    </div>
  );
}