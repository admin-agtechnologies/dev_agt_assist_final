# Session 37 — AGT Platform B5 — KB Socle Complet + Correction Serializers

**Membres :** Gabriel + Penka | **Date :** 19/05/2026 | **3 conversations compilées**

---

## Conversations comprises dans S37

| # | Titre | Périmètre |
|---|---|---|
| 1 | Vérification des tâches complétées et audit du contexte | Audit + plan B5 KB (Étapes 0→6) |
| 2 | Session courante (KB socle + seeders) | Étapes 0→4 + bootstrap + billing fix |
| 3 | Correction des bugs 500 dans serializers.py | Fix serializers + ChambresTab + MedicalTab |

---

## Fichiers livrés — S37 complet

### Backend

| Fichier | Action | Description |
|---|---|---|
| `apps/knowledge/serializers.py` | MODIFIÉ | Fix 5 bugs ImproperlyConfigured : ChambreType (image_url supprimé), CatalogueProduit (description_en/reference/stock supprimés), SpecialiteMedicale (description_fr→description, champs fantômes supprimés), CatalogueTrajet (prix→tarif), CatalogueService (description_en supprimé) + MenuCategorieSerializer nested plats + ScenarioProspectionSerializer ajouté + champs S33 sur tous les serializers |
| `apps/knowledge/serializers.py` | MODIFIÉ | ScenarioProspectionSerializer + champs S33 (mots_cles_symptomes, contact_urgence, etapes_procedure, etc.) ajoutés sur les serializers existants |
| `apps/knowledge/views.py` | MODIFIÉ | ScenarioProspectionViewSet ajouté |
| `apps/knowledge/urls.py` | MODIFIÉ | Route scenarios-prospection/ ajoutée |
| `apps/knowledge/bootstrap.py` | NOUVEAU | Seeders de fonctionnement KB — 3 exemples par feature, idempotent, déclenché au toggle activation |
| `apps/features/views/tenant.py` | MODIFIÉ | Appel bootstrap_kb_examples() au toggle activation feature |
| `apps/tenants/seeders/demo/base.py` | MODIFIÉ | Appel bootstrap_all_active_features() dans BaseDemoSeeder.run() |
| `apps/tenants/seeders/billing_seeder.py` | MODIFIÉ | +28 PLAN_SECTOR_FEATURES pour secteur "custom" (7 features × 4 plans) |

### Frontend

| Fichier | Action | Description |
|---|---|---|
| `src/dictionaries/fr/knowledge.fr.ts` | MODIFIÉ | +sections comingSoon, captureProspect, ressource |
| `src/dictionaries/en/knowledge.en.ts` | MODIFIÉ | Idem EN |
| `src/types/api/knowledge.types.ts` | MODIFIÉ | ScenarioProspection, ScenarioQuestion, CreateScenarioProspectionPayload |
| `src/repositories/knowledge.repository.ts` | MODIFIÉ | scenarioProspectionRepository ajouté |
| `src/app/(dashboard)/knowledge/_components/ComingSoonKbTab.tsx` | CORRIGÉ | i18n correct + d.knowledge.comingSoon |
| `src/app/(dashboard)/knowledge/_components/tabs/CaptureProspectTab.tsx` | CRÉÉ | CRUD ScenarioProspection, d.knowledge.captureProspect |
| `src/app/(dashboard)/knowledge/_components/tabs/RessourceKbTab.tsx` | CRÉÉ | Wrapper RessourceManager, d.knowledge.ressource |
| `src/app/(dashboard)/knowledge/_components/KnowledgeTabs.tsx` | MODIFIÉ | Flèches ChevronLeft/ChevronRight avec ResizeObserver |
| `src/app/(dashboard)/knowledge/page.tsx` | MODIFIÉ | 18 tabs câblés (billets ajouté, tous S35) |
| `src/app/(dashboard)/knowledge/_components/tabs/ChambresTab.tsx` | CORRIGÉ | EMPTY aligné modèle réel (image_url supprimé), CreateChambreTypePayload corrigé |
| `src/app/(dashboard)/knowledge/_components/tabs/MedicalTab.tsx` | CORRIGÉ | description_fr→description, tarif_consultation/duree_consultation_min supprimés, ajout mots_cles_symptomes + contact_urgence (S33) |

---

## Problèmes résolus

| Problème | Cause | Fix |
|---|---|---|
| 3 tabs 500 (Chambres, Catalogue, Médical) | Serializers avec champs fantômes | serializers.py corrigé (audit complet modèle par modèle) |
| 4e bug : CatalogueTrajet 500 | `prix` → `tarif`, `duree_min` → `duree_estimee` | serializers.py + bootstrap.py corrigés |
| 5e bug : CatalogueService 500 | `description_en` inexistant | serializers.py corrigé |
| Menu tab vide | MenuCategorieSerializer ne renvoyait pas les plats | Nested serializer MenuPlatSerializer avant MenuCategorieSerializer |
| 7 features manquantes sur demo-custom (22/29) | PLAN_SECTOR_FEATURES absent pour secteur "custom" | +28 entrées billing_seeder.py + seed --only=billing |
| KB tabs vides | Bootstrap jamais exécuté | bootstrap.py nouveau + intégration toggle + demo seeder |
| bootstrap.py warnings (6 champs incorrects) | Noms de champs supposés sans lire models.py | Corrigé : tarif, duree_estimee, description, Decimal taux_interet |
| Textes en dur dans composants KB | Violation règle i18n | Remplacé par d.knowledge.xxx |
| Scroll tabs invisible (18 tabs) | scrollbar-none sans indicateur | Flèches dynamiques avec ResizeObserver |

---

## État des 18 tabs /knowledge (demo-custom@agt.cm) en fin de S37

| Tab | Backend | Frontend form | Données seed |
|---|---|---|---|
| Entreprise | ✅ 200 | ✅ | ✅ |
| Agences & Horaires | ✅ 200 | ✅ | ✅ |
| FAQ | ✅ 200 | ✅ | ✅ 3 questions |
| Menu | ✅ 200 + plats nested | ✅ | ✅ 1 catégorie + 3 plats |
| Chambres | ✅ 200 fixé | ✅ corrigé S37 | ✅ 3 types |
| Catalogue (produits) | ✅ 200 fixé | ⚠️ form envoie description_en, stock (inexistants) | ✅ 3 produits |
| Catalogue (services) | ✅ 200 fixé | ⚠️ form envoie duree_min (inexistant) | ✅ 3 services |
| Catalogue (trajets) | ✅ 200 fixé | ⚠️ form NaN sur tarif (prix→tarif non corrigé frontend) | ✅ 3 trajets |
| Catalogue (financiers) | ✅ 200 | ⚠️ à vérifier | ✅ 3 produits |
| Inscriptions | ✅ 200 | ✅ | ✅ 3 programmes |
| Services médicaux | ✅ 200 fixé | ✅ corrigé S37 + S33 | ✅ 3 spécialités |
| Services publics | ✅ 200 | ⚠️ champs S33 manquants | ✅ 3 services |
| Disponibilités | ✅ 200 | ✅ | ✅ |
| Tables | ✅ 200 | ✅ | ✅ |
| Billets | ✅ 200 | ✅ | ✅ 3 trajets |
| Capture prospect | ✅ 200 | ✅ | ✅ 1 scénario |
| 5× Bientôt disponible | — | 🕐 Normal | — |

---

## TÂCHES RESTANTES — À faire en S38

### PRIORITÉ 1 — Corriger les 3 sous-composants Catalogue (forms envoient mauvais champs)

**Fichiers :**
- `src/app/(dashboard)/knowledge/_components/catalogue/CatalogueProduitTab.tsx`
  → supprimer `description_en`, `reference`, `stock` du form EMPTY + payload
- `src/app/(dashboard)/knowledge/_components/catalogue/CatalogueServiceTab.tsx`
  → supprimer `duree_min` du form (champ inexistant)
- `src/app/(dashboard)/knowledge/_components/catalogue/CatalogueTrajetTab.tsx`
  → `prix` → `tarif`, `duree_min` → `duree_estimee` (string)

### PRIORITÉ 2 — Étape 5 : Champs S33 manquants dans tabs existants

- **CitoyensTab.tsx** : ajouter `etapes_procedure`, `horaires_service`, `delai_relance_jours`
- **InscriptionsTab.tsx** : ajouter `frais_scolarite_annuels`, `places_disponibles`, `documents_requis`, `etapes_inscription`
- **FaqTab.tsx** : ajouter champ `ordre` sur QuestionFrequente

### PRIORITÉ 3 — Étape 6 : Migration Menu/Catalogue → ItemCatalogue

Les tabs lisent encore les anciens modèles S1/S2. Les seeders écrivent dans ItemCatalogue (S34).
À migrer :
- `MenuTab.tsx` → lit Catalogue/CategorieCatalogue/ItemCatalogue
- `CatalogueTab.tsx` split par type → lit ItemCatalogue filtré
- `catalogue.repository.ts` → endpoints ItemCatalogue
- Types TS à mettre à jour

### PRIORITÉ 4 — Fix context.py FAQ dynamique

`context.py` utilise encore la FAQ statique. Migrer vers `search_faq(query)`.

---

## Seeds exécutés en S37

```bash
docker-compose -f docker-compose.dev.yml exec api python manage.py seed --only=billing
# → 28 PlanFeature custom créées ✅

docker-compose -f docker-compose.dev.yml exec api python manage.py seed --demo
# → 10/10 seeders OK, KB bootstrappé, zéro warning ✅
```

---

## Comptes de test

| Email | Mot de passe | Secteur | Notes |
|---|---|---|---|
| demo-custom@agt.cm | Demo@2024! | Custom | 29 features, plan Pro — compte ultime |
| demo-restaurant@agt.cm | Demo@2024! | Restaurant | |
| demo-sante@agt.cm | Demo@2024! | Santé | |

Backend : port 8011, `docker-compose -f docker-compose.dev.yml`
Frontend : localhost:3000


---
# Prompt de démarrage — Session S38 AGT Platform B5

Tu es l'assistant de développement d'AGT BOT. Tu travailles avec Gabriel et son équipe.
Applique strictement les règles définies dans le prompt système.
Lis d'abord docs/reports/INDEX.md pour détecter les conflits.

---

## Contexte de reprise — S37 terminée (19/05/2026)

### Compte de test principal
- URL : localhost:3000 | Backend : port 8011
- Email : demo-custom@agt.cm | Password : Demo@2024!
- 29 features actives, plan Pro, 18 tabs sur /knowledge

### État /knowledge en fin S37

| Tab | Statut |
|---|---|
| Entreprise, Agences, FAQ, Menu, Chambres, Inscriptions, Services médicaux, Services publics, Disponibilités, Tables, Billets, Capture prospect | ✅ OK |
| Catalogue (produits/services/trajets/financiers) | ⚠️ Backend 200 mais forms frontend envoient mauvais champs |
| 5 × Bientôt disponible | 🕐 Normal |

---

## TÂCHES S38 — dans cet ordre

### TÂCHE 1 — Corriger les 3 sous-composants Catalogue (URGENT)

Les forms Catalogue envoient des champs qui n'existent plus sur les modèles Django.

**`CatalogueProduitTab.tsx`**
- EMPTY form supprime : `description_en`, `reference`, `stock`
- Champs réels : `nom_fr`, `nom_en`, `description_fr`, `prix`, `is_available`, `ordre`

**`CatalogueServiceTab.tsx`**
- EMPTY form supprime : `duree_min` (inexistant)
- Champs réels : `nom_fr`, `nom_en`, `description_fr`, `prix`, `is_available`, `ordre`

**`CatalogueTrajetTab.tsx`**
- EMPTY form : `prix` → `tarif`, `duree_min` → `duree_estimee` (string type, ex : "4h")
- Champs réels : `depart_fr`, `destination_fr`, `tarif`, `duree_estimee`, `horaires_depart`, `is_available`

Méthode : lire chaque composant via Get-Content, fournir diffs < 5 lignes par fichier.

---

### TÂCHE 2 — Étape 5 : Champs S33 manquants dans tabs existants

**`CitoyensTab.tsx`**
Ajouter dans le form EMPTY et le formulaire :
- `etapes_procedure` (textarea JSON ou string)
- `horaires_service` (string)
- `delai_relance_jours` (number)

**`InscriptionsTab.tsx`**
Ajouter :
- `frais_scolarite_annuels` (number)
- `places_disponibles` (number)
- `documents_requis` (textarea — liste séparée par virgule)
- `etapes_inscription` (textarea)

**`FaqTab.tsx`**
Ajouter champ `ordre` (number) sur QuestionFrequente.

---

### TÂCHE 3 — Étape 6 : Migration Menu/Catalogue → ItemCatalogue

Les tabs Menu et Catalogue lisent encore les anciens modèles S1/S2 (MenuCategorie/MenuPlat, CatalogueProduit, etc.). Les seeders démo écrivent dans ItemCatalogue (S34). À migrer :

Fichiers à créer/modifier (5) :
- `src/app/(dashboard)/knowledge/_components/tabs/MenuTab.tsx` → lit Catalogue/CategorieCatalogue/ItemCatalogue
- `src/app/(dashboard)/knowledge/_components/catalogue/CatalogueProduitTab.tsx` → lit ItemCatalogue type=produit
- `src/app/(dashboard)/knowledge/_components/catalogue/CatalogueServiceTab.tsx` → lit ItemCatalogue type=service
- `src/app/(dashboard)/knowledge/_components/catalogue/CatalogueTrajetTab.tsx` → lit ItemCatalogue type=trajet
- `src/repositories/catalogue.repository.ts` → endpoints ItemCatalogue

Endpoints backend ItemCatalogue : `/api/v1/catalogue/items/?type=produit` (à confirmer avec invoque-request).

---

### TÂCHE 4 — Fix context.py FAQ dynamique

`apps/knowledge/context.py` utilise une FAQ statique hardcodée.
Migrer vers `search_faq(query, entreprise)` qui lit QuestionFrequente en base.

---

## Fichiers importants à lire en début de session

```powershell
# Lire les composants Catalogue actuels
Get-Content src/app/(dashboard)/knowledge/_components/catalogue/CatalogueProduitTab.tsx | Set-Clipboard
Get-Content src/app/(dashboard)/knowledge/_components/catalogue/CatalogueServiceTab.tsx | Set-Clipboard
Get-Content src/app/(dashboard)/knowledge/_components/catalogue/CatalogueTrajetTab.tsx | Set-Clipboard

# Vérifier endpoint ItemCatalogue
# invoque-request GET /api/v1/catalogue/items/ avec demo-custom@agt.cm
```

## Règles rappel
- Zéro texte en dur → dictionnaire i18n
- Max 200 lignes/fichier
- Backend d'abord → tester → frontend
- Lire models.py avant tout serializer ou form