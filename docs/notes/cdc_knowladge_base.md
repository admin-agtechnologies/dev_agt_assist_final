# CDC — Knowledge Base V2
**Statut :** Prêt pour implémentation  
**Priorité :** Haute  
**Sessions estimées :** 2–3  
**Dépendances :** Aucune (socle existant suffisant)

---

## Contexte & Objectif

La page actuelle `/faq` est une version simplifiée issue de l'ancienne architecture non-sectorielle. Elle ne reflète pas la richesse du système de features et ne permet pas à l'entreprise de centraliser toutes ses connaissances métier en un seul endroit.

**Objectif :** Créer une **base de connaissance unifiée et sectorielle** que le bot utilise comme source de vérité, et que chaque bot pourra ensuite sélectionner partiellement.

**Route :** `/faq` (conservée pour compatibilité) → renommer label sidebar en "Base de connaissance"

---

## Architecture des tabs

### Tabs permanents (toujours présents)

#### Tab 1 — Entreprise
Profil que le bot connaît de l'entreprise (≠ profil user).

**Sections :**
- **Identité** : nom complet, description, secteur (readonly), site web, email contact, réseaux sociaux (Facebook, Instagram, LinkedIn, TikTok)
- **Branding bot** : message d'accueil, ton de communication (Formel/Semi-formel/Décontracté), langues du bot (fr/en/autres), signature automatique
- **Infos supplémentaires** : champ libre (parking, accès PMR, langues parlées, certifications, etc.)

**Backend :** `GET/PATCH /api/v1/knowledge/profils/` ✅ (modèle `TenantKnowledge`)  
**Champs manquants à ajouter au modèle :**
- `reseaux_sociaux` : JSONB `{facebook, instagram, linkedin, tiktok}`
- `infos_supplementaires` : TextField
- `ton_communication` : CharField choices `[formel, semi_formel, decontracte]`
- `langues_bot` : ArrayField ou JSONB `["fr", "en"]`

#### Tab 2 — Agences & Horaires
Chaque agence contient ses propres horaires et contacts de transfert.

**Structure par agence :**
- Infos : nom, adresse, ville, téléphone, WhatsApp, email
- Horaires d'ouverture : par jour de semaine (lundi→dimanche), heure début/fin, ouvert/fermé
- Contacts de transfert humain : WhatsApp transfert, téléphone transfert, email transfert, message de transfert
- Statut : actif/inactif

**Règle :** Une agence principale (siège) est créée automatiquement à l'inscription.  
Agences supplémentaires si feature `multi_agences` active.

---

### Tabs conditionnels (selon features actives)

#### Tab — FAQ (si feature `faq` active)
- Liste de questions/réponses bilingues (fr/en)
- Catégorisation libre
- Toggle actif/inactif par question
- CRUD complet inline (pas de modal séparé)

**Backend :** `GET/POST/PATCH/DELETE /api/v1/knowledge/questions/` ✅

#### Tab — Menu (si feature `menu_digital` active)
- Catalogue d'items organisés par catégories
- Chaque item : nom, description, prix, disponibilité, image
- CRUD catégories + items
- Toggle disponible/indisponible

**Backend :** `GET/POST/PATCH/DELETE /api/v1/catalogue/` — à vérifier/compléter

#### Tab — Chambres (si feature `reservation_chambre` active)
- Types de chambres/logements avec descriptions, capacité, tarif nuit, équipements
- Liaison avec ressources de réservation

**Backend :** À créer via `CatalogueItem` avec `feature_slug=reservation_chambre`

#### Tab — Catalogue (si `catalogue_produits` OU `catalogue_services` OU `catalogue_trajets` OU `catalogue_produits_financiers` active)
- Adaptatif selon la feature active
- Même structure : items + catégories + prix
- Label tab = "Prestations" pour catalogue_services (secteur custom/PME/avocat)

#### Tab — Inscriptions (si feature `inscription_admission` active)
- Programmes/formations disponibles
- Conditions d'admission, frais, délais
- Documents requis

#### Tab — Services médicaux (si feature `orientation_patient` active)
- Spécialités disponibles, praticiens, tarifs consultation
- Horaires par praticien

#### Tab — Services publics (si feature `orientation_citoyens` active)
- Démarches disponibles, documents requis, délais, coûts

---

## Backend — Ce qui manque

### 1. Endpoints Agences PME

**Actuellement :** Le modèle `Agence` existe dans `apps/services/` mais aucun endpoint PME n'est exposé (seulement admin).

**À créer dans `apps/services/views.py` ou `apps/knowledge/views.py` :**

```python
# GET /api/v1/agences/        → liste agences du tenant
# POST /api/v1/agences/       → créer agence (si multi_agences active)
# PATCH /api/v1/agences/{id}/ → modifier agence
# DELETE /api/v1/agences/{id}/ → supprimer (pas le siège)
```

**Serializer `AgenceSerializer` :**
```python
fields = [
    "id", "nom", "est_siege", "adresse", "ville", "pays",
    "phone", "email", "whatsapp",
    "whatsapp_transfert", "phone_transfert", "email_transfert", "message_transfert",
    "est_active", "created_at"
]
```

**Modèle Agence — champs de transfert à ajouter si absents :**
```python
whatsapp_transfert  = models.CharField(max_length=20, blank=True)
phone_transfert     = models.CharField(max_length=20, blank=True)
email_transfert     = models.EmailField(blank=True)
message_transfert   = models.TextField(blank=True)
```

**Permission :** `IsAuthenticated` + filtre `entreprise=request.user.entreprise`  
**Contrainte :** L'agence `est_siege=True` ne peut pas être supprimée.

---

### 2. Endpoints Horaires PME

**Actuellement :** `HorairesOuverture` existe dans `apps/services/` mais pas exposé côté PME.

**À créer :**
```python
# GET  /api/v1/agences/{id}/horaires/  → horaires de l'agence
# POST /api/v1/agences/{id}/horaires/  → set/update horaires (upsert par jour)
```

**Structure payload :**
```python
{
  "horaires": [
    {"jour": 0, "heure_debut": "08:00", "heure_fin": "18:00", "est_actif": true},
    {"jour": 1, "heure_debut": "08:00", "heure_fin": "18:00", "est_actif": true},
    # jour: 0=lundi, 1=mardi, ..., 6=dimanche
    {"jour": 6, "est_actif": false}  # dimanche fermé
  ]
}
```

**Logique :** upsert — crée si absent, update si existant. Idempotent.

---

### 3. Enrichissement TenantKnowledge

**Migration à créer :**
```python
# apps/knowledge/migrations/000X_enrich_tenant_knowledge.py
class Migration:
    operations = [
        migrations.AddField('TenantKnowledge', 'reseaux_sociaux', 
                           models.JSONField(default=dict, blank=True)),
        migrations.AddField('TenantKnowledge', 'infos_supplementaires',
                           models.TextField(blank=True)),
        migrations.AddField('TenantKnowledge', 'ton_communication',
                           models.CharField(max_length=20, default='semi_formel',
                           choices=[('formel','Formel'),('semi_formel','Semi-formel'),
                                    ('decontracte','Décontracté')])),
        migrations.AddField('TenantKnowledge', 'langues_bot',
                           models.JSONField(default=list)),
    ]
```

**Serializer à mettre à jour :** `TenantKnowledgeSerializer` — ajouter ces 4 champs.

---

## Frontend — Refonte complète `/faq`

### Structure fichiers

```
src/app/(dashboard)/faq/
├── page.tsx                    # Orchestrateur principal — tabs dynamiques
├── _components/
│   ├── KnowledgeTabs.tsx       # Barre de tabs dynamiques
│   ├── tabs/
│   │   ├── EntrepriseTab.tsx   # Profil + Branding + Infos supp.
│   │   ├── AgencesTab.tsx      # Liste agences + horaires + transfert
│   │   ├── FaqTab.tsx          # Questions/réponses CRUD inline
│   │   ├── CatalogueTab.tsx    # Générique — menu/produits/services/etc.
│   │   └── GenericKnowledgeTab.tsx  # Fallback pour tabs spécialisés
│   ├── agences/
│   │   ├── AgenceCard.tsx      # Carte agence avec horaires inline
│   │   ├── AgenceForm.tsx      # Formulaire création/édition agence
│   │   └── HorairesEditor.tsx  # Grille 7 jours avec toggle + heures
│   └── faq/
│       ├── QuestionCard.tsx    # Question avec toggle actif + edit inline
│       └── QuestionForm.tsx    # Formulaire ajout/édition question
```

### Logique tabs dynamiques

```typescript
// page.tsx
const { features } = useFeaturesStore(); // features actives du tenant

const KNOWLEDGE_TABS = [
  { id: "entreprise",   label: "Entreprise",        always: true },
  { id: "agences",      label: "Agences & Horaires", always: true },
  { id: "faq",          label: "FAQ",               feature: "faq" },
  { id: "menu",         label: "Menu",              feature: "menu_digital" },
  { id: "chambres",     label: "Chambres",          feature: "reservation_chambre" },
  { id: "catalogue",    label: "Catalogue",         features: ["catalogue_produits","catalogue_services","catalogue_trajets","catalogue_produits_financiers"] },
  { id: "inscriptions", label: "Inscriptions",      feature: "inscription_admission" },
  { id: "medical",      label: "Services médicaux", feature: "orientation_patient" },
  { id: "citoyens",     label: "Services publics",  feature: "orientation_citoyens" },
];

const visibleTabs = KNOWLEDGE_TABS.filter(tab => {
  if (tab.always) return true;
  if (tab.feature) return isFeatureActive(tab.feature);
  if (tab.features) return tab.features.some(f => isFeatureActive(f));
  return false;
});
```

### Design guidelines

- **Tabs** : pills horizontales scrollables, couleur active = `theme.primary`
- **Cards sections** : fond `var(--bg-card)`, radius `rounded-2xl`, padding `p-6`
- **Labels sections** : uppercase tracking-widest, `text-[var(--text-muted)]`
- **Boutons save** : `btn-primary` aligné droite, toujours visible (sticky si form long)
- **État vide** : illustration + CTA clair pour remplir
- **Feedback** : toast success/error systématique
- **HorairesEditor** : grille 7 lignes, toggle gauche + inputs heure si actif, grisé si fermé

### Repositories à créer/mettre à jour

```typescript
// src/repositories/agences.repository.ts — NOUVEAU
export const agencesRepository = {
  getList: (): Promise<Agence[]> =>
    api.get("/api/v1/agences/"),
  create: (payload: CreateAgencePayload): Promise<Agence> =>
    api.post("/api/v1/agences/", payload),
  update: (id: string, payload: Partial<CreateAgencePayload>): Promise<Agence> =>
    api.patch(`/api/v1/agences/${id}/`, payload),
  delete: (id: string): Promise<void> =>
    api.delete(`/api/v1/agences/${id}/`),
  getHoraires: (id: string): Promise<Horaire[]> =>
    api.get(`/api/v1/agences/${id}/horaires/`),
  setHoraires: (id: string, horaires: HorairePayload[]): Promise<Horaire[]> =>
    api.post(`/api/v1/agences/${id}/horaires/`, { horaires }),
};

// Mettre à jour tenantKnowledgeRepository — ajouter nouveaux champs
// (reseaux_sociaux, infos_supplementaires, ton_communication, langues_bot)
```

### Types TypeScript à créer

```typescript
// src/types/api/agence.types.ts — ENRICHIR l'existant
export interface Agence {
  id: string;
  nom: string;
  est_siege: boolean;
  adresse: string;
  ville: string;
  pays: string;
  phone: string;
  email: string;
  whatsapp: string;
  whatsapp_transfert: string;
  phone_transfert: string;
  email_transfert: string;
  message_transfert: string;
  est_active: boolean;
  created_at: string;
}

export interface Horaire {
  id: string;
  jour: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=lundi
  heure_debut: string;  // "08:00"
  heure_fin: string;    // "18:00"
  est_actif: boolean;
}

export interface HorairePayload {
  jour: number;
  heure_debut?: string;
  heure_fin?: string;
  est_actif: boolean;
}
```

---

## Ordre d'implémentation recommandé

### Phase 1 — Backend (session dédiée)
1. Migration `TenantKnowledge` — 4 nouveaux champs
2. Mise à jour serializer `TenantKnowledgeSerializer`
3. Modèle `Agence` — ajouter champs transfert si absents
4. View `AgenceViewSet` (PME) + URLs
5. View `HorairesView` (par agence) + URLs
6. Tests : Swagger + vérifications directes

### Phase 2 — Frontend (1–2 sessions)
1. Types TypeScript + repositories
2. `page.tsx` orchestrateur + `KnowledgeTabs`
3. `EntrepriseTab` (profil + branding)
4. `AgencesTab` + `AgenceCard` + `HorairesEditor`
5. `FaqTab` (CRUD inline)
6. `CatalogueTab` (générique)
7. Tabs spécialisés selon priorité secteur

---

## Critères de validation

- [ ] `GET /api/v1/agences/` retourne les agences du tenant (filtrées)
- [ ] `PATCH /api/v1/agences/{id}/` persiste les champs transfert
- [ ] `POST /api/v1/agences/{id}/horaires/` crée/update horaires idempotent
- [ ] `PATCH /api/v1/knowledge/profils/` accepte `reseaux_sociaux`, `ton_communication`, `langues_bot`
- [ ] Tab Entreprise sauvegarde et recharge correctement
- [ ] Tab Agences : création, édition, horaires fonctionnels
- [ ] Tab FAQ : ajout/edit/delete/toggle inline
- [ ] Tabs dynamiques apparaissent/disparaissent selon features actives
- [ ] Design cohérent avec le design system (couleurs sectorielles, typography, spacing)
- [ ] `npx tsc --noEmit` → 0 erreurs