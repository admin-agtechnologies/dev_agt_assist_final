# HANDOFF — AGT Platform
**Date** : 22 avril 2026  
**Session** : Backend module Rendez-vous — modélisation + implémentation complète

---

## 1. CE QUI A ÉTÉ COMPLÉTÉ CETTE SESSION

### 1.1 Audit et validation du modèle de données

- Lecture complète de `CONTRAINTES8MODELS` et des modèles existants
- Diagramme PlantUML du module RDV produit et validé
- Décisions de conception prises et validées :

| Décision | Détail |
|---|---|
| `RendezVous ↔ Service` | Relation M2M (0 à N services par RDV) via table pivot `RendezVousService` |
| `Service` | Catalogue global Entreprise — Agence choisit un sous-ensemble |
| `Agence` pivot | L'Agence est le vrai pivot — elle possède ses Agendas, ses Horaires et ses Services |
| `Agenda` | Appartient à une Agence (plus à Entreprise directement) |
| `RendezVous.agence` | FK obligatoire — lieu du RDV |
| `Bot → Agenda` | M2M conservé, plusieurs agendas par bot autorisés (évolutivité) |
| `Notification` | Nouvelle table — rappels RDV, contenu rendu complet (email/WhatsApp) |
| `PolitiqueRappel → RDV` | Lien via `Notification` — pas de FK directe |
| `HorairesOuverture` | Lié exclusivement à `Agence` (champ `entreprise` supprimé) — 2 types : `ouverture` + `rendez_vous` — plages 30 min |

---

### 1.2 Fichiers modifiés / créés

#### `apps/services/`

| Fichier | Changements |
|---|---|
| `models.py` | `Service` remonté avant `Agence` · `Agence` + M2M services via `AgenceService` · `AgenceService` nouvelle table pivot · `HorairesOuverture` : `entreprise FK` supprimé, `agence FK` nullable, `unique_together (agence, type)` · `Agenda` : `entreprise FK` → `agence FK` nullable, `horaires FK` supprimé |
| `serializers.py` | Réécriture complète — `ServiceSerializer`, `DescriptionServiceSerializer`, `HorairesOuvertureSerializer`, `AgenceServiceSerializer`, `AgenceSerializer` (horaires nested), `AgendaSerializer` |
| `views.py` | `IsEntreprise` appliqué sur tous les ViewSets · `perform_create` injecte `entreprise` · `get_queryset` isolé par tenant · Actions `@action` sur `AgenceViewSet` : `services`, `add_service`, `remove_service` |
| `urls.py` | Imports mis à jour |
| `admin.py` | `AgendaAdmin.list_display` corrigé (`agence` au lieu de `entreprise`) · `AgenceService` enregistré |

#### `apps/appointments/`

| Fichier | Changements |
|---|---|
| `models.py` | `RendezVous` : `service FK` → M2M via `RendezVousService` + `agence FK` ajouté · `RendezVousService` nouvelle table pivot · `Notification` nouvelle table (`db_table = "agt_rdv_notifications"`) |
| `serializers.py` | `ClientSerializer` + `PolitiqueRappelSerializer` : `entreprise` read_only · `RendezVousSerializer` : enrichi (`agenda_nom`, `agence_nom`, `client_telephone`, `services_detail`) · `RendezVousServiceSerializer` nouveau · `NotificationSerializer` nouveau |
| `views.py` | Réécriture complète — isolation tenant sur tous les ViewSets · `perform_create` · Actions sur `RendezVousViewSet` : `confirmer`, `annuler`, `terminer`, `add_service`, `remove_service` · `NotificationViewSet` (read-only) |
| `urls.py` | Route `notifications/` ajoutée |
| `admin.py` | `RendezVousAdmin.list_display` corrigé · `NotificationAdmin` ajouté |

#### `apps/tenants/management/commands/seed.py`

| Changement | Détail |
|---|---|
| `_reset()` | Ajout `AgenceService`, `RendezVousService`, `Notification` dans l'ordre de suppression |
| `_seed_entreprises()` | `Agence` créée par entreprise · Horaires liés à l'agence (2 types, plages 30 min) · `Agenda` lié à l'agence · Services rattachés via `AgenceService` · `PolitiqueRappel` créée (WhatsApp 24h + Email 48h) · 5 clients + 5 RDV de démo pour `hotel@demo.cm` |
| Helpers | `_horaires_ouverture()` et `_horaires_rdv()` ajoutés |

---

### 1.3 Migrations

Les nouvelles tables sont bien présentes en base :

| Table | Statut |
|---|---|
| `agt_agence_services` | ✅ |
| `agt_rendez_vous_services` | ✅ |
| `agt_rdv_notifications` | ✅ |
| `agt_agendas` (agence FK) | ✅ |
| `agt_horaires_ouverture` (sans entreprise FK) | ✅ |

---

### 1.4 Endpoints exposés et testés

#### `apps/services/`

| Endpoint | Statut |
|---|---|
| `GET /api/v1/services/` | ✅ |
| `POST /api/v1/services/` | ✅ |
| `PATCH /api/v1/services/{id}/` | ✅ |
| `GET /api/v1/services/agences/` | ✅ |
| `GET /api/v1/services/agences/{id}/services/` | ✅ |
| `POST /api/v1/services/agences/{id}/services/add/` | ✅ |
| `POST /api/v1/services/agences/{id}/services/remove/` | ✅ |
| `GET /api/v1/services/horaires/` | ✅ |
| `PATCH /api/v1/services/horaires/{id}/` | ✅ |
| `GET /api/v1/services/agendas/` | ✅ |
| `GET /api/v1/services/descriptions/` | ✅ |

#### `apps/appointments/`

| Endpoint | Statut |
|---|---|
| `GET /api/v1/appointments/` | ✅ (5 RDV hotel avec services_detail) |
| `POST /api/v1/appointments/` | ✅ |
| `POST /api/v1/appointments/{id}/confirmer/` | ✅ |
| `POST /api/v1/appointments/{id}/annuler/` | ✅ |
| `POST /api/v1/appointments/{id}/terminer/` | ✅ |
| `POST /api/v1/appointments/{id}/services/add/` | ✅ |
| `POST /api/v1/appointments/{id}/services/remove/` | ✅ |
| `GET /api/v1/appointments/clients/` | ✅ |
| `GET /api/v1/appointments/politiques-rappel/` | ✅ (2 politiques hotel) |
| `GET /api/v1/appointments/notifications/` | ✅ |

---

## 2. IMPACT SUR LA MODÉLISATION

### Changements par rapport au modèle initial

```
AVANT                              APRÈS
──────────────────────────────     ──────────────────────────────
Agenda.entreprise (FK)         →   Agenda.agence (FK nullable)
Agenda.horaires (FK)           →   supprimé
HorairesOuverture.entreprise   →   supprimé
HorairesOuverture.agence       →   obligatoire (nullable en BD)
RendezVous.service (FK)        →   RendezVous.services (M2M)
RendezVous.horaires (FK)       →   supprimé
─ nouvelle table ─                 AgenceService (agence ↔ service)
─ nouvelle table ─                 RendezVousService (rdv ↔ service)
─ nouvelle table ─                 Notification (liée à RendezVous)
```

### Contraintes applicatives V1

- `HorairesOuverture` : 1 seul enregistrement par `(agence, type)` — `unique_together`
- `AgenceService` : 1 seul rattachement par `(agence, service)` — `unique_together`
- `RendezVousService` : 1 seul rattachement par `(rendez_vous, service)` — `unique_together`
- Isolation tenant : tous les querysets filtrent via `agence__entreprise__user_entreprises__user`

---

## 3. CE QUI RESTE À FAIRE

### 3.1 Modules backend non encore traités

| Module | App | Priorité |
|---|---|---|
| Bots | `apps/bots/` | Haute — cockpit test bot |
| Dashboard | `apps/dashboard/` | Haute |
| Conversations | `apps/conversations/` | Moyenne |
| Témoignages | `apps/feedback/` | Basse |
| Signalement | `apps/feedback/` | Basse |
| Demande d'aide | à définir | Basse |

### 3.2 Intégration frontend — module RDV (prochaine étape immédiate)

**Fichiers à modifier dans `agt-assist-client` :**

#### `src/types/api/index.ts`
Ajouter / aligner les types :

```typescript
// Nouveaux types à créer
export interface Agence {
  id: string
  entreprise: string
  nom: string
  adresse: string
  ville: string
  whatsapp: string
  telephone: string
  is_active: boolean
  horaires: HorairesOuverture[]
  services_count: number
  created_at: string
}

export interface HorairesOuverture {
  id: string
  agence: string
  type: "ouverture" | "rendez_vous"
  lundi: { open: boolean; start: string; end: string; slot_min: number }
  mardi: { open: boolean; start: string; end: string; slot_min: number }
  mercredi: { open: boolean; start: string; end: string; slot_min: number }
  jeudi: { open: boolean; start: string; end: string; slot_min: number }
  vendredi: { open: boolean; start: string; end: string; slot_min: number }
  samedi: { open: boolean; start: string; end: string; slot_min: number }
  dimanche: { open: boolean; start: string; end: string; slot_min: number }
}

export interface Agenda {
  id: string
  agence: string
  agence_nom: string
  nom: string
  bots_ids: string[]
  is_active: boolean
  created_at: string
}

export interface ServiceRDV {
  id: number
  service: string
  service_nom: string
  service_prix: string
}

export interface RendezVous {
  id: string
  agenda: string
  agenda_nom: string
  agence: string | null
  agence_nom: string | null
  client: string
  client_nom: string
  client_telephone: string
  bot: string | null
  statut: "en_attente" | "confirme" | "annule" | "termine"
  canal: "whatsapp" | "vocal" | "manuel"
  scheduled_at: string
  reminder_sent: boolean
  notes: string
  services_detail: ServiceRDV[]
  created_at: string
}

export interface Client {
  id: string
  entreprise: string
  nom: string
  telephone: string
  email: string
  created_at: string
}

export interface PolitiqueRappel {
  id: string
  entreprise: string
  nom: string
  canal: "whatsapp" | "email" | "sms" | "appel"
  delai_heures: number
  message_template: string
  is_active: boolean
  created_at: string
}
```

#### `src/repositories/index.ts`
Ajouter les appels :

```typescript
// Services
getAgences: () => api.get("/api/v1/services/agences/")
getAgendas: () => api.get("/api/v1/services/agendas/")
getHoraires: () => api.get("/api/v1/services/horaires/")
updateHoraires: (id, data) => api.patch(`/api/v1/services/horaires/${id}/`, data)
getServices: () => api.get("/api/v1/services/")
getAgenceServices: (agenceId) => api.get(`/api/v1/services/agences/${agenceId}/services/`)

// Appointments
getRendezVous: (params?) => api.get("/api/v1/appointments/", { params })
createRendezVous: (data) => api.post("/api/v1/appointments/", data)
confirmerRDV: (id) => api.post(`/api/v1/appointments/${id}/confirmer/`)
annulerRDV: (id) => api.post(`/api/v1/appointments/${id}/annuler/`)
terminerRDV: (id) => api.post(`/api/v1/appointments/${id}/terminer/`)
getClients: () => api.get("/api/v1/appointments/clients/")
getPolitiquesRappel: () => api.get("/api/v1/appointments/politiques-rappel/")
```

#### Pages frontend à brancher

| Page | Route | Source mock → Vraie source |
|---|---|---|
| Agenda RDV | `/pme/appointments` | mock JSON → `GET /api/v1/appointments/` |
| Liste clients | `/pme/appointments/clients` | mock → `GET /api/v1/appointments/clients/` |
| Politiques rappel | `/pme/appointments/politiques` | mock → `GET /api/v1/appointments/politiques-rappel/` |
| Gestion services | `/pme/services` | mock → `GET /api/v1/services/` |
| Agences | `/pme/services/agences` | mock → `GET /api/v1/services/agences/` |
| Horaires | `/pme/services/agences/{id}` | mock → `GET /api/v1/services/horaires/` |

---

## 4. BUGS CONNUS / POINTS D'ATTENTION

| Sujet | Détail |
|---|---|
| `Agenda.agence` nullable | En BD : nullable pour migration propre. En pratique : tout agenda créé via le seeder ou le frontend doit avoir une agence. À valider applicativement dans le serializer (required=True côté frontend) |
| `HorairesOuverture.agence` nullable | Même raison. Les données seedées ont bien une agence. |
| `RendezVous.agence` nullable | Idem — les RDV demo ont bien une agence. À rendre obligatoire côté frontend |
| Isolation tenant RDV | Filtre via `agenda__agence__entreprise__` — fonctionne uniquement si l'agenda a une agence. Les RDV sans agenda NULL sont invisibles (comportement voulu) |
| `TenantIsolationMiddleware` | Présent dans le middleware stack — vérifier qu'il ne bloque pas les nouveaux endpoints |

---

## 5. COMMANDES UTILES

```powershell
# Reset complet + reseed
docker-compose down
docker-compose up -d --build
docker-compose exec api python manage.py migrate
docker-compose exec api python manage.py seed --reset

# Logs
docker-compose logs api --tail=50

# Vérifier les tables en base
docker-compose exec api python manage.py shell -c "from django.db import connection; tables = connection.introspection.table_names(); [print(t) for t in tables if t.startswith('agt_')]"

# Frontend
cd agt-assist-client
npm run dev
npx tsc --noEmit
```

---

## 6. COMPTES DE TEST

| Email | Password | Type |
|---|---|---|
| `superadmin@agt.cm` | `Admin@2024!` | superadmin |
| `gabriel@agt.cm` | `Admin@2024!` | admin AGT |
| `hotel@demo.cm` | `Pme@2024!` | PME référence (5 clients + 5 RDV seedés) |
| `pharma@demo.cm` | `Pme@2024!` | PME pharmacie |
| `resto@demo.cm` | `Pme@2024!` | PME restaurant |
| `clinique@demo.cm` | `Pme@2024!` | PME clinique |
| `salon@demo.cm` | `Pme@2024!` | PME salon |
| `immo@demo.cm` | `Pme@2024!` | PME immobilier |

---

## 7. PROCHAINE ÉTAPE IMMÉDIATE

**Option A — Intégration frontend module RDV**
1. Aligner `src/types/api/index.ts` (types ci-dessus)
2. Mettre à jour `src/repositories/index.ts`
3. Brancher `/pme/appointments` sur vrais endpoints
4. `npx tsc --noEmit` → 0 erreur

**Option B — Continuer backend (module Bots)**
1. Audit `apps/bots/` — serializers, views, permissions PME
2. Exposer endpoints bot pour le cockpit test
3. Préparer l'intégration chatbot (Ollama + system prompt)

**Recommandation** : Option A d'abord pour valider le module RDV end-to-end, puis Option B pour le cockpit bot.