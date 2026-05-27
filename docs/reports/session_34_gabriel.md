# Session 34 — Gabriel — 18/05/2026

## Métadonnées
| Champ | Valeur |
|---|---|
| Membre | Gabriel |
| Session N° | 34 |
| Date | 18/05/2026 |
| Type | Backend + Frontend — B5 Phase 0.3 Seeders + Interface Admin |
| Statut | ✅ Terminée |
| Branche | main |

## Objectif de la session
B5 Phase 0.3 — Architecture seeders Groupe 1 / Groupe 2 + interface admin
features-matrix temporaire

## Ce qui a été fait

### Refactoring architecture seeders
- Nouveau système 2 groupes : Groupe 1 (fonctionnement, prod-safe) /
  Groupe 2 (démo, dev-only)
- `seed.py` → flag `--demo`, `--only=demo`, `--only=demo:secteur`
- Pattern modulaire `demo/` avec `BaseDemoSeeder` + 10 seeders sectoriels

### Fichiers générés / modifiés
**Groupe 1 :**
- `features_seeder.py` — 29 features, 4 booléens KB/Result, renommages
  slugs (communication, capture_prospect), 153 SectorFeature
- `billing_seeder.py` — slugs corrigés + conciergerie/orientation_patient/
  simulation_credit/suivi_dossier dans PLAN_SECTOR_FEATURES
- `agent_seeder.py` — fix actions CRM + réservations universelles (prise_rdv)
  + 7 nouvelles actions B5 (search_faq active, banking inactives)
- `seed.py` — commande centrale refactorisée

**Groupe 2 :**
- `demo/base.py` — BaseDemoSeeder + helpers (upsert_faq, upsert_catalogue,
  upsert_ressource, upsert_bot)
- `demo/registry.py` + 10 seeders : restaurant, hotel, banque, sante,
  education, ecommerce, transport, pme, public, custom

**Supprimés :**
- `seed_bank.py` (absorbé dans demo/banque.py)
- `seed_agent.py` (remplacé par agent_seeder dans registry)

### Interface admin /admin/features-matrix
**Backend :**
- `apps/features/views/admin_views.py` — 3 vues admin (AllowAny +
  authentication_classes=[], token Bearer custom)
- `apps/features/urls.py` — 3 routes admin ajoutées

**Frontend :**
- `src/app/admin/features-matrix/page.tsx` — auth token + tabs
- `BooleansMatrix.tsx` — 29 features × 4 booléens, toggle inline PATCH
- `SectorMatrix.tsx` — 29 features × 10 secteurs, checkbox inline PATCH
- `middleware.ts` — exception `/admin/features-matrix` ajoutée

### README.md
Refonte complète — nouvelle architecture seed, commandes de dev
(migrations, logs, reset, tests, containers)

### Tests
- `manage.py seed --demo` → ✅ 10/10 secteurs, Groupe 1 + 2 clean
- Test de non-régression frontend → ✅ aucune régression

## Bugs corrigés (hors scope initial, découverts en audit)
- `billing_seeder` : slugs dépréciés + features sectorielles manquantes
- `agent_seeder` : 2 actions CRM broken (conversion_prospects),
  reservation actions trop restrictives
- `demo/base.py` : est_active inexistant sur QuestionFrequente,
  ItemCatalogue hiérarchie incorrecte, Ressource.entreprise/feature manquants,
  Bot.description → Bot.personnalite

## Prochaine session (S35)
- Socle KB : tabs /knowledge branchés sur nouveaux modèles S33
- Fix context.py FAQ statique → search_faq(query)
- ChambreType, ProgrammeAdmission, SpecialiteMedicale, ServiceCitoyen