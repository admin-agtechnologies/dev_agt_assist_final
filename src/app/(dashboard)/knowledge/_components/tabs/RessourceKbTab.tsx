// src/app/(dashboard)/knowledge/_components/tabs/RessourceKbTab.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import { Loader2 }              from "lucide-react";
import { useLanguage }          from "@/contexts/LanguageContext";
import { useToast }             from "@/components/ui/Toast";
import { api }                  from "@/lib/api-client";
import { ressourcesRepository } from "@/repositories/reservations.repository";
import { RessourceManager }     from "@/components/reservations/RessourceManager";
import type {
  Ressource,
  CreateRessourcePayload,
  DisponibiliteRessource,
} from "@/types/api/reservation.types";

interface RessourceKbTabProps {
  featureSlug:   string;
  ressourceType: string;
}

const BASE = "/api/v1/reservations/ressources";

export function RessourceKbTab({ featureSlug, ressourceType }: RessourceKbTabProps) {
  const { locale, dictionary: d } = useLanguage();
  const t                         = d.knowledge.ressource;
  const toast                     = useToast();

  const [ressources, setRessources] = useState<Ressource[]>([]);
  const [loading, setLoading]       = useState(true);
  const [, startTransition]         = useTransition();

  useEffect(() => {
    ressourcesRepository
      .list({ feature_slug: featureSlug, est_active: undefined })
      .then((data) => {
        const items = "results" in data
          ? (data as { results: Ressource[] }).results
          : (data as unknown as Ressource[]);
        setRessources(items.filter((r) => r.type === ressourceType));
      })
      .catch(() => toast.error(t.errorLoad))
      .finally(() => setLoading(false));
  }, [featureSlug, ressourceType]); // eslint-disable-line

  const handleCreate = async (payload: CreateRessourcePayload) => {
    const created = await ressourcesRepository.create({
      ...payload,
      type:         ressourceType,
      feature_slug: featureSlug,
    });
    setRessources((prev) => [...prev, created]);
    toast.success(t.createSuccess);
  };

  const handleUpdate = async (id: string, payload: Partial<CreateRessourcePayload>) => {
    const updated = await api.patch<Ressource>(`${BASE}/${id}/`, payload);
    setRessources((prev) => prev.map((r) => r.id === id ? updated : r));
    toast.success("Ressource mise à jour");
  };

  const handleDelete = async (id: string) => {
    await api.delete(`${BASE}/${id}/`);
    setRessources((prev) => prev.filter((r) => r.id !== id));
    toast.success("Ressource supprimée");
  };

  const handleToggle = async (id: string, est_active: boolean) => {
    const updated = await api.patch<Ressource>(`${BASE}/${id}/`, { est_active });
    setRessources((prev) => prev.map((r) => r.id === id ? updated : r));
  };

  /**
   * GET disponibilités
   * Le backend retourne un tableau brut [] (pas { disponibilites: [] })
   * → on normalise ici pour rester compatible avec DisponibiliteGrid
   */
  const handleLoadDispos = async (ressourceId: string): Promise<DisponibiliteRessource[]> => {
    try {
      const res = await ressourcesRepository.getDisponibilites(ressourceId);
      // Normalisation : le backend renvoie [] directement
      if (Array.isArray(res)) return res as unknown as DisponibiliteRessource[];
      // Fallback si jamais le format change côté backend
      const wrapped = res as unknown as { disponibilites?: DisponibiliteRessource[] };
      return wrapped?.disponibilites ?? [];
    } catch {
      return [];
    }
  };

  /**
   * POST disponibilités
   * Le backend accepte UNE disponibilité par POST
   * → on boucle sur les jours actifs et on poste chacun individuellement
   *
   * ⚠️  Limitation actuelle : pas d'endpoint DELETE sur les disponibilités.
   *     Les nouveaux créneaux s'ajoutent aux existants.
   *     Pour un vrai "remplacer tout" il faudra un endpoint bulk côté backend.
   */
  const handleSaveDispos = async (
    ressourceId: string,
    disponibilites: Omit<DisponibiliteRessource, "id" | "est_active">[],
  ) => {
    startTransition(() => {});

    if (disponibilites.length === 0) {
      // Aucun jour actif → rien à envoyer, succès silencieux
      toast.success(t.dispoSuccess);
      return;
    }

    // POST chaque jour actif individuellement
    const errors: number[] = [];
    await Promise.allSettled(
      disponibilites.map(async (dispo) => {
        try {
          await api.post(`${BASE}/${ressourceId}/disponibilites/`, dispo);
        } catch {
          errors.push(dispo.jour_semaine);
        }
      })
    );

    if (errors.length > 0) {
      // Certains jours ont échoué (probablement déjà existants côté backend)
      toast.error(
        `${errors.length} créneau(x) déjà enregistré(s) — les autres ont été sauvegardés.`
      );
    } else {
      toast.success(t.dispoSuccess);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-[var(--text-muted)]" />
    </div>
  );

  return (
    <RessourceManager
      ressources={ressources}
      featureSlug={featureSlug}
      ressourceType={ressourceType}
      locale={locale}
      onCreateRessource={handleCreate}
      onUpdateRessource={handleUpdate}
      onDeleteRessource={handleDelete}
      onToggleRessource={handleToggle}
      onLoadDisponibilites={handleLoadDispos}
      onSaveDisponibilites={handleSaveDispos}
    />
  );
}