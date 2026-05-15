// ============================================================
// FILE: src/types/api/tenant.types.ts
// Types alignés avec apps/tenants/models.Entreprise + EntrepriseSerializer
// Source backend : apps/tenants/serializers.py — EntrepriseSerializer
// ============================================================
//
// IMPORTANT : "Tenant" côté frontend = "Entreprise" côté backend.
// L'API expose le modèle Entreprise sous /api/v1/tenants/ pour des
// raisons historiques (multi-tenancy SaaS) ; le frontend utilise
// le nom "Tenant" pour rester aligné avec l'URL.
// ============================================================

import type { SecteurActivite } from "./user.types";

/**
 * Représentation complète d'un Tenant (Entreprise) renvoyée par l'API.
 * Mapping direct du `EntrepriseSerializer` côté backend.
 *
 * Endpoint : GET /api/v1/tenants/{id}/
 */
export interface Tenant {
    id: string;
    name: string;
    slug: string;
    secteur: SecteurActivite | null;
    description: string;
    whatsapp_number: string;
    phone_number: string;
    email: string;
    site_web: string;
    logo: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

/**
 * Payload accepté par POST /api/v1/tenants/ et PATCH /api/v1/tenants/{id}/.
 *
 * Note : côté serializer backend (write), `secteur` est remplacé par
 * `secteur_id` (write_only PrimaryKeyRelatedField).
 *
 * Les champs `id`, `created_at`, `updated_at` sont read-only — exclus ici.
 */
export interface CreateTenantPayload {
    name: string;
    /** Optionnel — généré automatiquement côté backend si absent (slug). */
    slug?: string;
    /** UUID du secteur — write_only côté serializer. */
    secteur_id?: string | null;
    description?: string;
    whatsapp_number?: string;
    phone_number?: string;
    email?: string;
    site_web?: string;
    logo?: string | null;
    is_active?: boolean;
}

/**
 * Filtres acceptés par GET /api/v1/tenants/.
 *
 * Source backend (EntrepriseViewSet) :
 *   - `filterset_fields = ["is_active", "secteur"]`
 *   - `search_fields = ["name", "slug", "email"]`
 */
export interface TenantFilters {
    is_active?: boolean;
    /** UUID du secteur (DjangoFilterBackend). */
    secteur?: string;
    /** Recherche full-text sur name, slug, email. */
    search?: string;
}