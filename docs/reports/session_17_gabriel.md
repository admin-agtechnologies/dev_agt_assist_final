# Rapport de session 17 — Gabriel
**Date :** 2026-05-13
**Type :** Conception + Génération — Modèle facturation-features + Refactor seed system

---

## 1. Objectif de la session

Suite directe de S16 où le bug bloquant suivant avait été identifié :
> **Les modules (features) ne s'affichent pas dans la sidebar d'un nouveau user,
> même après inscription et paiement.**

Root cause confirmée en S16 : `PlanFeature count = 0` pour tous les plans.
La règle d'activation (`SectorFeature EXISTS AND PlanFeature EXISTS AND TenantFeature.is_active=True`)
ne passe jamais car la table `PlanFeature` est vide.

**Objectif S17 :** Concevoir et implémenter le modèle billing-features correct,
puis peupler `PlanFeature` via le système de seed refactorisé.

---

## 2. Décisions de conception validées

### 2.1 Modèle économique (validé par Gabriel)

Vision à 3 couches :

```
Plan (Starter, Pro, Gold…)
  → features de base communes (tous secteurs)
  → extras sectoriels (restaurant ≠ hôtel)
  → quotas configurés par l'admin AGT
  → data-driven : aucun if secteur == 'x' dans le code

Feature
  → prix_unitaire (FCFA par quota)
  → type_quota (messages, rdv, contacts…)
  → quota_unitaire (ex: 100 messages par achat)

FeatureOrder (commande à la demande)
  → user commande du quota supplémentaire
  → débit wallet → quota_ajoute crédité sur TenantFeature
```

**Règle d'affichage sidebar (nouvelle) :**
```
Feature affichée SI :
  PlanFeature EXISTS pour (plan actif) ET (secteur=null OU secteur=mon_secteur)
  ET SectorFeature EXISTS pour mon_secteur
  ET TenantFeature.is_active = True
```

### 2.2 PlanSecteur (nouveau)

Un plan peut être lié à un ou plusieurs secteurs via `PlanSecteur`.
Aucune ligne = plan universel. Cela empêche un hôtel de voir les packs restaurant.

### 2.3 Seed system refactorisé (Laravel-style)

Remplacement du monolithique `seed.py` par :
```bash
python manage.py seed                         # tous les seeders dans l'ordre
python manage.py seed --only features,billing # seeders spécifiques
python manage.py seed --list                  # liste les seeders
```

Ordre d'exécution :
1. `features` → FeaturesSeeder (23 features + SectorFeature)
2. `billing` → BillingSeeder (plans + PlanSecteur + PlanFeature)
3. `payments` → PaymentsSeeder (MTN MoMo + Orange Money)
4. `tenants` → TenantsSeeder (secteurs + users démo)
5. `agent` → AgentSeeder (19 AIAction + AIAgentAction)

---

## 3. Fichiers générés (16 fichiers)

### Bloc A — Modèle facturation (7 fichiers)

| Fichier | Destination | Statut |
|---------|------------|--------|
| `features_models__init__.py` | `apps/features/models/__init__.py` | ✅ Placé |
| `feature.py` | `apps/features/models/feature.py` | ✅ Placé |
| `plan.py` | `apps/features/models/plan.py` | ✅ Placé |
| `tenant.py` | `apps/features/models/tenant.py` | ✅ Placé |
| `0005_billing_features_enrichment.py` | `apps/features/migrations/` | ✅ Placé (renommé 0005) |
| `services.py` | `apps/features/services.py` | ✅ Placé |
| `serializers.py` | `apps/features/serializers.py` | ✅ Placé |
| `admin.py` | `apps/features/admin.py` | ✅ Placé (quota → quota_inclus) |

### Bloc B — Seed system (8 fichiers)

| Fichier | Destination | Statut |
|---------|------------|--------|
| `seed.py` | `apps/tenants/management/commands/seed.py` | ✅ Placé |
| `seeders/__init__.py` | `apps/tenants/seeders/__init__.py` | ✅ Placé |
| `base.py` | `apps/tenants/seeders/base.py` | ✅ Placé |
| `features_seeder.py` | `apps/tenants/seeders/features_seeder.py` | ✅ Placé |
| `billing_seeder.py` | `apps/tenants/seeders/billing_seeder.py` | ✅ Placé |
| `payments_seeder.py` | `apps/tenants/seeders/payments_seeder.py` | ✅ Placé |
| `tenants_seeder.py` | `apps/tenants/seeders/tenants_seeder.py` | ✅ Placé — **bug S18** |
| `agent_seeder.py` | `apps/tenants/seeders/agent_seeder.py` | ✅ Placé |

---

## 4. État à la fin de session

### Ce qui fonctionne

- ✅ Modèles features splittés en `models/` (feature.py, plan.py, tenant.py)
- ✅ Nouveaux modèles `PlanSecteur` et `FeatureOrder` dans le schéma
- ✅ `PlanFeature` enrichi avec `secteur_id` (base commune vs extras sectoriels)
- ✅ `Feature` enrichi avec `prix_unitaire`, `type_quota`, `quota_unitaire`
- ✅ `TenantFeature` enrichi avec `quota_total`, `quota_consomme`
- ✅ `services.py` mis à jour : `get_features_with_quota()` filtre par secteur
- ✅ `admin.py` corrigé (`quota` → `quota_inclus`)
- ✅ Système seed central `python manage.py seed` opérationnel
- ✅ 23 features seedées avec succès
- ✅ 5 plans + 27 PlanFeature base commune seedés avec succès
- ✅ 2 providers de paiement seedés

### Ce qui ne fonctionne pas encore

- ❌ **`TenantsSeeder` échoue** — bug S18 (voir section 5)
- ❌ `SectorFeature = 0` car les secteurs n'existaient pas au moment où `FeaturesSeeder` a tourné
- ❌ `PlanFeature sectorielles = 0` pour la même raison
- ❌ La sidebar est donc toujours vide (root cause non encore résolue)

---

## 5. Bug à corriger en S18

### BUG-S18-01 — `tenants_seeder.py` : mauvais nom de champ

**Erreur :**
```
Invalid field name(s) for model SecteurActivite: 'nom'.
```

**Cause :** `tenants_seeder.py` utilise `nom` dans `update_or_create`, mais le vrai
champ de `SecteurActivite` est `label_fr` + `label_en` (pas `nom`).

**Fix (diff minimal) dans `apps/tenants/seeders/tenants_seeder.py` :**

```python
# Avant
SECTEURS = [
    {"slug": "restaurant", "nom": "Restaurant & Restauration"},
    ...
]

# Dans _seed_secteurs()
_, created = SecteurActivite.objects.update_or_create(
    slug=s["slug"], defaults={"nom": s["nom"], "is_active": True}
)

# Après
SECTEURS = [
    {"slug": "restaurant", "label_fr": "Restaurant & Restauration", "label_en": "Restaurant & Hospitality"},
    ...
]

# Dans _seed_secteurs()
_, created = SecteurActivite.objects.update_or_create(
    slug=s["slug"],
    defaults={"label_fr": s["label_fr"], "label_en": s["label_en"], "is_active": True}
)
```

**Impact :** Ce bug bloque le seeder `tenants` → donc `agent` ne tourne pas non plus
(les secteurs n'existent pas → les entreprises démo ne peuvent pas être créées).

### BUG-S18-02 — Ordre des seeders vs dépendances

`FeaturesSeeder` (étape 1) crée les features et essaie de créer les `SectorFeature`,
mais les secteurs n'existent pas encore (créés à l'étape 4 par `TenantsSeeder`).

Résultat : `SectorFeature = 0` et `PlanFeature sectorielles = 0`.

**Deux solutions possibles :**

**Option A (recommandée)** : Déplacer `_seed_secteurs()` dans `FeaturesSeeder`
ou créer un `SecteurSeeder` séparé qui passe en étape 1.

**Option B** : Garder l'ordre actuel et relancer `seed --only features`
APRÈS que `tenants` a créé les secteurs.

### BUG-S18-03 (pré-existant) — `reservations.0001_initial` DuplicateTable

À chaque `down -v` + `up`, la migration `reservations.0001_initial` échoue avec :
```
DuplicateTable: relation "agt_ressources" already exists
```

Workaround obligatoire avant chaque `migrate` :
```bash
python manage.py migrate reservations 0001 --fake
python manage.py migrate
```

**Ce bug est pré-existant et hors scope S17.** Il faut investiguer quelle
migration crée `agt_ressources` avant `reservations.0001_initial`.

---

## 6. Données démo perdues

L'ancien `seed.py` contenait des données démo riches (6 entreprises, clients,
RDV, conversations) qui ne sont pas encore portées dans `TenantsSeeder`.

Ces données ont été délibérément laissées de côté (décision Gabriel S17) pour
garder une architecture propre. À porter en session future dans `TenantsSeeder`.

L'ancien fichier est toujours sur disque à :
`apps/tenants/management/commands/` (renommé ou supprimé selon ce que Gabriel a fait).

---

## 7. Plan S18

**Priorité 1 — Débloquer la sidebar (objectif principal depuis S16)**

1. Corriger `tenants_seeder.py` (BUG-S18-01) : `nom` → `label_fr` + `label_en`
2. Corriger l'ordre des seeders (BUG-S18-02) : secteurs avant features
3. Relancer `python manage.py seed` complet
4. Vérifier : `python manage.py shell -c "from apps.features.models import PlanFeature; print(PlanFeature.objects.count())"`
5. Créer un nouveau user → vérifier que la sidebar affiche les modules

**Priorité 2 — Investiguer BUG-S18-03** (`reservations` DuplicateTable)
pour ne plus avoir besoin du `--fake` workaround.

**Priorité 3 (future session)** — Porter les données démo dans `TenantsSeeder`

---

## 8. Prompt de démarrage S18

```
Bonjour, session 18 — Gabriel.
On reprend sur le bug bloquant sidebar (modules invisibles pour nouveau user).

État :
- Modèle facturation-features complet et migré ✅
- Seed system Laravel-style en place ✅
- 2 bugs bloquants dans les seeders à corriger avant de tester :
  1. BUG-S18-01 : tenants_seeder.py utilise 'nom' au lieu de 'label_fr'/'label_en'
  2. BUG-S18-02 : secteurs créés après features → SectorFeature = 0
- Bug pré-existant migrations reservations (workaround --fake obligatoire)

Objectif S18 : corriger les 2 bugs seeders → seed complet → sidebar fonctionnelle.
Lire INDEX.md puis proposer.
```