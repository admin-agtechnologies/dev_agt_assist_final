# Session 36 — AGT Platform B5 — KB Socle + Seeders de fonctionnement

**Membre :** Gabriel | **Date :** 19/05/2026 | **Durée :** ~4h

---

## Objectifs de la session

- Corriger les violations de règles i18n (textes en dur) dans les composants KB
- Finaliser le câblage des 18 tabs sur /knowledge
- Implémenter les seeders de fonctionnement KB (3 exemples par module)
- Résoudre les 7 features manquantes sur le compte demo-custom

---

## Fichiers livrés

### Frontend

| Fichier | Action | Description |
|---|---|---|
| `src/dictionaries/fr/knowledge.fr.ts` | MODIFIÉ | Ajout sections comingSoon, captureProspect, ressource |
| `src/dictionaries/en/knowledge.en.ts` | MODIFIÉ | Idem EN |
| `src/app/(dashboard)/knowledge/_components/ComingSoonKbTab.tsx` | CORRIGÉ | Suppression textes en dur → d.knowledge.comingSoon |
| `src/app/(dashboard)/knowledge/_components/tabs/CaptureProspectTab.tsx` | CORRIGÉ | Suppression textes en dur → d.knowledge.captureProspect |
| `src/app/(dashboard)/knowledge/_components/tabs/RessourceKbTab.tsx` | CORRIGÉ | Suppression textes en dur → d.knowledge.ressource |
| `src/app/(dashboard)/knowledge/_components/KnowledgeTabs.tsx` | MODIFIÉ | Ajout flèches gauche/droite scroll avec ResizeObserver |
| `src/app/(dashboard)/knowledge/page.tsx` | MODIFIÉ | 18 tabs câblés (ajout billets + tous S35) |

### Backend

| Fichier | Action | Description |
|---|---|---|
| `apps/knowledge/bootstrap.py` | NOUVEAU | Seeders de fonctionnement KB — 3 exemples par feature, idempotent |
| `apps/features/views/tenant.py` | MODIFIÉ | Appel bootstrap_kb_examples() au toggle activation |
| `apps/tenants/seeders/demo/base.py` | MODIFIÉ | Appel bootstrap_all_active_features() dans BaseDemoSeeder.run() |
| `apps/tenants/seeders/billing_seeder.py` | MODIFIÉ | +28 PLAN_SECTOR_FEATURES pour secteur "custom" (7 features × 4 plans) |

---

## Problèmes résolus

| Problème | Cause | Fix |
|---|---|---|
| Textes en dur dans ComingSoonKbTab | Violation règle i18n | Remplacé par d.knowledge.comingSoon |
| Tab billets manquant (17 tabs au lieu de 18) | Oubli reservation_billet dans ALL_TABS | Ajouté tab "billets" → RessourceKbTab(featureSlug="reservation_billet") |
| 7 features manquantes sur demo-custom | PLAN_SECTOR_FEATURES absent pour secteur "custom" | 28 nouvelles entrées billing_seeder + seed --only=billing |
| Scroll tabs invisible | scrollbar-none sans indicateur visuel | Flèches ChevronLeft/ChevronRight dynamiques |
| KB tabs vides (pas de données guide) | Bootstrap jamais exécuté | Nouveau bootstrap.py + intégration demo seeder + toggle |
| bootstrap.py warnings champs incorrects | Noms de champs modèles mal supposés | Corrigé : tarif, duree_estimee, description, décimal taux_interet |

---

## État des 18 tabs /knowledge (demo-custom)

| Tab | Endpoint | Statut |
|---|---|---|
| Entreprise | /knowledge/profils/ | ✅ 200 |
| Agences & Horaires | /tenants/agences/ | ✅ 200 |
| FAQ | /knowledge/questions/ | ✅ 200 — 3 questions |
| Menu | /knowledge/menu-categories/ | ✅ 200 — 1 catégorie + 3 plats |
| Chambres | /knowledge/chambre-types/ | ❌ 500 — ChambreTypeSerializer: image_url invalide |
| Catalogue | /knowledge/catalogue-produits/ | ❌ 500 — CatalogueProduitSerializer: description_en invalide |
| Inscriptions | /knowledge/programmes-admission/ | ✅ 200 — 3 programmes |
| Services médicaux | /knowledge/specialites-medicales/ | ❌ 500 — SpecialiteMedicaleSerializer: description_fr invalide |
| Services publics | /knowledge/services-citoyens/ | ✅ 200 — 3 services |
| Disponibilités | /reservations/ressources/?feature_slug=prise_rdv | ✅ 200 |
| Tables | /reservations/ressources/?feature_slug=reservation_table | ✅ 200 |
| Billets | /reservations/ressources/?feature_slug=reservation_billet | ✅ 200 |
| Capture prospect | /knowledge/scenarios-prospection/ | ✅ 200 — 1 scénario |
| Conciergerie | — | 🕐 Bientôt disponible |
| Communication | — | 🕐 Bientôt disponible |
| Simulation crédit | — | 🕐 Bientôt disponible |
| Suivi dossier | — | 🕐 Bientôt disponible |
| Collecte documents | — | 🕐 Bientôt disponible |

---

## Bugs 500 identifiés — à corriger en S37

### Bug 1 — ChambreTypeSerializer
```
Field name `image_url` is not valid for model `ChambreType`
```
**Fichier :** `apps/knowledge/serializers.py` → `ChambreTypeSerializer`
**Fix :** Supprimer `image_url` des fields (champ n'existe pas sur le modèle)
**Modèle réel :** id, entreprise, nom_fr, nom_en, description_fr, description_en, capacite, is_available, ordre, prix_nuit, equipements

### Bug 2 — CatalogueProduitSerializer
```
Field name `description_en` is not valid for model `CatalogueProduit`
```
**Fichier :** `apps/knowledge/serializers.py` → `CatalogueProduitSerializer`
**Fix :** Supprimer `description_en` et `reference` et `stock` (inexistants)
**Modèle réel :** id, entreprise, nom_fr, nom_en, description_fr, prix, is_available, ordre

### Bug 3 — SpecialiteMedicaleSerializer
```
Field name `description_fr` is not valid for model `SpecialiteMedicale`
```
**Fichier :** `apps/knowledge/serializers.py` → `SpecialiteMedicaleSerializer`
**Fix :** `description_fr` → `description`, supprimer `equipements`, `tarif_consultation`, `duree_consultation_min`
**Modèle réel :** id, entreprise, nom_fr, nom_en, description, medecins, is_available, ordre, mots_cles_symptomes, contact_urgence

---

## Étapes restantes du plan S35 (à continuer en S37)

### PRIORITÉ 1 — Corriger les 3 bugs 500 serializers (débloquer Chambres, Catalogue, Médical)
Fichiers : `apps/knowledge/serializers.py`
Objectif : zéro 500 sur /knowledge

### PRIORITÉ 2 — Corriger les tabs frontend correspondants
- `ChambresTab.tsx` : EMPTY form utilise `image_url` → à supprimer
- `MedicalTab.tsx` : EMPTY form utilise `description_fr`, `tarif_consultation`, `duree_consultation_min` → corriger selon modèle réel
- `CatalogueTab.tsx` : vérifier cohérence avec le modèle réel CatalogueProduit/Service/Trajet/ProduitFinancier

### PRIORITÉ 3 — Étape 5 du plan S35 : Upgrade tabs existants champs S33
Tabs à upgrader (champs S33 absents des formulaires) :
- `MedicalTab` : ajouter mots_cles_symptomes, contact_urgence
- `CitoyensTab` : ajouter etapes_procedure, horaires_service, delai_relance_jours
- `InscriptionsTab` : ajouter frais_scolarite_annuels, places_disponibles, documents_requis, etapes_inscription
- `FaqTab` : ajouter champ ordre sur QuestionFrequente

### PRIORITÉ 4 — Étape 6 : Migration Menu/Catalogue → ItemCatalogue (5 fichiers)
- MenuTab + 4 sous-composants catalogue
- catalogue.repository.ts

---

## Comptes de test

| Email | Mot de passe | Secteur | Notes |
|---|---|---|---|
| demo-custom@agt.cm | Demo@2024! | Custom | Compte test ultime — 29 features, plan Pro |
| demo-restaurant@agt.cm | Demo@2024! | Restaurant | |
| demo-sante@agt.cm | Demo@2024! | Santé | |

---

## Commandes utiles

```bash
# Seed complet
docker-compose -f docker-compose.dev.yml exec api python manage.py seed --demo

# Seed billing seulement
docker-compose -f docker-compose.dev.yml exec api python manage.py seed --only=billing

# Logs API
docker compose -f docker-compose.dev.yml logs api --tail=50 -f

# Check features demo-custom
docker-compose -f docker-compose.dev.yml exec api python manage.py shell -c "
from django.contrib.auth import get_user_model
from apps.features.models import TenantFeature
User = get_user_model()
user = User.objects.filter(email='demo-custom@agt.cm').first()
ent = user.user_entreprises.first().entreprise
print(TenantFeature.objects.filter(entreprise=ent, is_active=True).count(), 'features actives')
"
```
