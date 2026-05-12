# INDEX — Registre des sessions AGT Platform

> ⚠️ **Règle absolue : APPEND ONLY.**
> Chaque membre ajoute son bloc en fin de session.
> Ne jamais modifier ni reformuler un bloc existant.
> Format : `## session_{N}_{membre}`

---

## session_1_gabriel

- **Type :** Planification
- **Date :** 2026-05-09
- **Flux couverts :** Aucun (session de planification)
- **Bugs corrigés :** Aucun
- **Zones touchées :** `/docs` uniquement
- **Fichiers créés :** `TODO_TEST_DEBUG_AGT.md`, `docs/reports/`, `docs/prompts/`
- **Rapport :** `docs/reports/session_1_gabriel.md`


## session_2_gabriel

- **Type :** Génération — Frontend Landing Hub + Landing Restaurant
- **Date :** 2026-05-09
- **Flux couverts :** F1 (Landing Hub ✅), F2 (Landing Restaurant ✅), F3 (Onboarding — réflexion préparée uniquement, rien généré)
- **Bugs corrigés :** BUG-001 (SECTOR_ROUTES), BUG-002 (images hero 404), BUG-003 (doublon routing onboarding), BUG-004 (footer couleur restaurant), BUG-005 (testimonials couleur restaurant), BUG-006 (logo sante accent fichier)
- **Zones touchées :** `src/app/_components/landing/`, `src/app/_components/sector/restaurant/`, `src/lib/`, `src/dictionaries/`, `src/app/page.tsx`, `public/AGT-BOT-logo/`
- **Fichiers créés :** 19 fichiers
- **Fichiers modifiés :** `constants.ts`, `page.tsx`, `dictionaries/*/index.ts`
- **Fichiers supprimés :** `src/app/onboarding/page.tsx` (doublon routing)
- **Rapport :** `docs/reports/session_2_gabriel.md`

## session_3_gabriel

- **Type :** Génération — Onboarding Phase 1 complet (F3+F4 fusionnés)
- **Date :** 2026-05-09
- **Flux couverts :** F3 ✅ (visuels validés), F4 (logique à tester en S4)
- **Bugs corrigés :** BUG-007 (SectorFeature import), BUG-008 (RegisterPayload doublon), BUG-009 (window.google TS), BUG-010 (LOGO_CONFIG→getLogoAssets), BUG-011 (backLabel prop), BUG-012 (res scope login Google handler)
- **Zones touchées :** `apps/features/`, `apps/auth_bridge/`, `src/app/(auth)/onboarding/`, `src/app/verify-email/`, `src/app/login/`, `src/components/onboarding/`, `src/repositories/`, `src/lib/`, `src/types/api/`
- **Fichiers créés :** 7 (IdentityStep, AccountStep, EmailCheckStep, public-features.repository, feature-descriptions, feature-icon-map, sector-redirect)
- **Fichiers modifiés :** 13
- **Rapport :** `docs/reports/session_3_gabriel.md`

## session_4_gabriel

- **Type :** Debug + Modularisation — Flows auth onboarding E2E
- **Date :** 2026-05-10
- **Flux couverts :** F3/F4 tests E2E ✅, flows auth nominaux ✅
- **Bugs corrigés :** BUG-013 à BUG-019
- **Bug reporté S5 :** BUG-020 (secteur non persisté localStorage avant auth)
- **Zones touchées :** `apps/auth_bridge/` (modularisé), `config/settings.py`, `src/app/verify-email/`, `src/app/not-found.tsx`, `src/dictionaries/fr/errors.fr.ts`, `src/dictionaries/en/errors.en.ts`, `src/lib/constants.ts`, `.env.local`
- **Fichiers créés :** 4 backend (`_tokens.py`, `_email.py`, `_onboarding.py`, `local.py` refactorisé), 1 frontend (`not-found.tsx` sectoriel)
- **Fichiers modifiés :** 6
- **Rapport :** `docs/reports/session_4_gabriel.md`

## session_5_gabriel

- **Type :** Refactoring architectural + Migration sectorielle
- **Date :** 2026-05-10 → 2026-05-11
- **Flux couverts :** Phase 1 complète (architecture sectorielle V2 + BUG-020). Phase 2 (F6 Dashboard) reportée à S6.
- **Bugs corrigés :** BUG-020 (persistance sector_slug localStorage), BUG-018 (extension barre verify-email), BUG-019 (extension logo 404 sectoriel), Dette TECH-001 (4 sources de vérité unifiées), Dette TECH-002 (doublon useSector supprimé)
- **Zones touchées :** `src/lib/sector-config.ts`, `src/lib/sector-theme.ts`, `src/lib/sector-content.ts` (NEW), `src/lib/sector-redirect.ts`, `src/components/auth/AuthShell.tsx`, `src/components/onboarding/SectorPicker.tsx`, `src/app/not-found.tsx`, `src/app/verify-email/page.tsx`, `src/app/pending/page.tsx`, `src/app/login/page.tsx`, `src/app/(auth)/onboarding/page.tsx`. Suppression complète de `src/lib/sector-configs/` (10 fichiers).
- **Fichiers créés :** `src/lib/sector-content.ts`
- **Fichiers modifiés :** 11 fichiers
- **Fichiers supprimés :** 10 fichiers (`src/lib/sector-configs/*.ts`)
- **Commit Git :** `cca13af` sur `main` + commit complémentaire pour `(auth)/onboarding/page.tsx`
- **Rapport :** `docs/reports/session_5_gabriel.md`
- **Dette créée :** DETTE-S5-01 (logo central vert), DETTE-S5-02 (backend SECTOR_EMAIL_CONFIG), DETTE-S5-03 (landing S2), DETTE-S5-04 (bots.types.ts SECTOR_COLORS hérité), DETTE-S5-05 (theme.label rétrocompat à migrer)

## session_6_gabriel

- **Type :** Conception + Génération + Debug — Backend features/onboarding
- **Date :** 2026-05-11
- **Flux couverts :** F6 (conception validée : welcome + modules), backend préparatoire au frontend S7
- **Bugs corrigés :** Import OnboardingProgress manquant, URL welcome-seen non enregistrée, PlanFeature starter vide
- **Zones touchées :** `apps/features/` (models, services, serializers, views, urls, migrations), `apps/onboarding/` (models, views, urls, migrations)
- **Fichiers créés :** 2 migrations (`0002_tenantfeature_is_pinned`, `0003_onboardingprogress_has_seen_welcome`)
- **Fichiers modifiés :** 8 fichiers backend
- **Commit :** `353211f`
- **Rapport :** `docs/reports/session_6_gabriel.md`

## session_7_gabriel

- **Type :** Génération full-stack — Convergence onboarding + Mes Modules + Welcome page + Vague 1 fixes
- **Date :** 2026-05-11 → 2026-05-12
- **Flux couverts :** F6 Dashboard first contact (backend complet ✅, frontend produit ⏳, Vague 1 fixes proposés ⏳)
- **Bugs corrigés (testés) :** Aucun (S7 = features). Backend tests : 25 OK (11 nouveaux).
- **Bugs identifiés (à corriger) :** B01 à B13 — 13 bugs classés en 4 vagues par gravité × facilité (voir rapport)
- **Fixes Vague 1 proposés mais NON TESTÉS :** B01 (has_seen_welcome non exposé), B02 (popup intrusif), B03 (hrefs /pme/* → 404)
- **Fix Vague 1 en attente diagnostic :** B04 (claim-bonus échoue silencieusement)
- **Zones touchées :**
  - **Backend :** `apps/onboarding/` (models, migrations 0004, signals, engine, serializers, tests), `apps/knowledge/apps.py`, `apps/chatbot_bridge/apps.py`, `apps/users/serializers.py`
  - **Frontend :** `src/types/onboarding.ts`, `src/types/api/user.types.ts`, `src/repositories/features.repository.ts`, `src/repositories/feedback.repository.ts`, `src/hooks/useOnboarding.ts`, `src/components/OnboardingPopup.tsx`, `src/components/OnboardingBanner.tsx` (NEW), `src/components/layout/Sidebar.tsx`, `src/components/layout/Sidebar.config.ts`, `src/components/layout/SidebarPinnedModules.tsx` (NEW), `src/components/modules/*` (NEW ×3), `src/components/welcome/*` (NEW ×3), `src/app/(dashboard)/layout.tsx`, `src/app/(dashboard)/modules/page.tsx` (NEW), `src/app/(dashboard)/welcome/page.tsx` (NEW)
- **Fichiers créés :** 19 (8 backend S7 + 17 frontend S7 — déduction faite des édits)
- **Fichiers modifiés (Vague 1) :** 5 (UserMeSerializer, engine.py hrefs, user.types.ts, OnboardingPopup.tsx, dashboard layout.tsx)
- **Commits :** [à compléter après push utilisateur]
- **Rapport :** `docs/reports/session_7_gabriel.md`
- **Architecture introduite :**
  - 3 règles de convergence dans engine.py (CONVERGENCE_TEST, CONVERGENCE_CONFIG, CONVERGENCE_TUTORIAL)
  - Action SHOW_BANNER distincte de SHOW_POPUP (bannière sticky vs modal)
  - Page /welcome 3 écrans (post-inscription, redirect via user.onboarding.has_seen_welcome)
  - Page /modules avec 3 tabs (Actifs / Disponibles / Upgrade)
  - Sidebar enrichie : section Épinglés avec barres de quota + lien permanent Mes modules
  - 3 signaux backend (ProfilEntreprise, FAQ, QuestionFrequente → has_configured_bot ; TestMessage → has_tested_bot)
  - UserMe.onboarding (objet imbriqué : 5 booléens d'état)
- **Dette acceptée :** engine.py 539 lignes (registre central), tests.py 338 lignes (groupage par règle)
- **Plan S8 :** tester Vague 1 → diagnostic B04 → Vague 2 (B05-B10) → Vague 3 (B09 reconstruction base de connaissance) → Vague 4 (B11-B13 cosmétique)

---

# 📚 NOTE PERMANENTE — Façon de travailler de Gabriel

> **À LIRE EN PREMIER à chaque nouvelle session.** Cette section documente les
> habitudes et règles de collaboration apprises au fil des sessions. Elle évite
> à Gabriel de reconfigurer Claude à chaque démarrage.

## Autorité et décisions
- **Gabriel décide, Claude propose.** Aucune initiative sans validation explicite.
- En cas d'ambiguïté : poser une question avant d'agir, ne jamais supposer.
- Multi-tour OK : Gabriel préfère plusieurs allers-retours rapides plutôt qu'une grosse génération à l'aveugle.

## Façon de poser les questions
- Préférer `ask_user_input_v0` aux questions en prose (UI plus rapide sur mobile).
- **Maximum 3 questions par tour**, options claires (2-4 par question).
- Pour les questions de **logique métier**, ne PAS poser de questions techniques. Gabriel valide la logique, Claude trouve la solution technique.
- Reformuler la logique métier dans les mots de Gabriel pour vérifier la compréhension AVANT de coder.

## Génération de code
- **Fichiers complets, pas de diffs** (sauf modifs < 5 lignes).
- Limite **200 lignes par fichier (+50 tolérance)**. Signaler tout dépassement et demander accord.
- **Backend first si simple**, frontend après.
- **5 à 15 fichiers max par génération.** Au-delà, découper en blocs.
- Présenter via `present_files` avec **tableau de placement** (numéro livré → destination réelle).
- **Patterns existants > nouveaux patterns.** Toujours lire ce qui existe avant de créer.
- **Réutilisation > création** (composants, hooks, utils, repositories).
- **Mobile-first et responsive.**
- **Design system existant** (CSS vars `--color-primary`, `--text-muted`, `--bg-card`, etc.).
- **Pas de localStorage/sessionStorage dans les artifacts Claude** (mais OK dans le projet réel Next.js).

## Tests et environnement
- **Backend Django via Docker Compose.** Commandes type :
  `docker-compose -f docker-compose.dev.yml exec api python manage.py [...]`
- **README backend documente Docker Compose** — toujours s'y référer pour les commandes.
- **Frontend :** `npm run dev` (port 3001 pour restaurant, 3006 pour hôtel, etc.)
- TypeScript check : `npx tsc --noEmit`
- Lancer la base de données / faire `migrate` / `test` toujours via `docker-compose exec api`

## Contextes code source — IMPORTANT
- Le **scanner.ps1 N'EST PAS redemandé à chaque session.**
- Les contextes complets sont **dans la mémoire du projet** :
  - `contexte_frontend_PME.txt` — code source frontend complet
  - `contexte_backend.txt` — code source backend complet
- **NE JAMAIS demander à Gabriel de relancer le scanner** si ces fichiers sont déjà dans `<project_files>`.
- Utiliser `project_knowledge_search` pour chercher dedans, ou `view`/`grep` directement sur `/mnt/project/*.txt`.

## Tests utilisateurs réels
- **Gabriel teste lui-même** avec :
  - Comptes existants (resto@demo.cm, hotel@demo.cm) pour les régressions
  - Mail jetable pour simuler un nouveau user (le scénario qui couvre vraiment le code S7)
- Il note les bugs au fil de l'eau et les remonte en lot après chaque test.
- **NE PAS demander 4 scénarios d'un coup** — un scénario à la fois.

## Style de réponse Claude
- **Toujours classer les bugs par gravité × facilité** avant de proposer un ordre de traitement.
- Donner un **plan d'attaque par vague**, jamais "voici les 13 fixes en vrac".
- **Honnêteté > complaisance** : "je ne peux pas fixer à l'aveugle, j'ai besoin de captures Network" plutôt qu'inventer.
- **Pas de flatterie** — Gabriel est direct, il préfère des réponses techniques claires.

## Rapports de fin de session
- **Long mais exploitable** > court mais incomplet.
- Doivent contenir :
  - **Décisions prises** avec rationale
  - **État précis** : ce qui est validé / en attente de test / à faire
  - **Liste de bugs** avec priorisation
  - **Plan d'action S+1**
  - **Prompt de début de session S+1** prêt à copier-coller

## INDEX.md
- **APPEND ONLY.** Ne jamais réécrire ni reformuler les blocs existants.
- Nom des rapports : `session_{N}_{membre}.md` dans `docs/reports/`.
- Si Gabriel renomme un rapport pour corriger une faute, ne pas y toucher après.

## Particularités projet
- Sectorialisation : 11 secteurs (restaurant, hotel, etc.) avec build séparé (`NEXT_PUBLIC_SECTOR`).
- Multi-instances frontend : un port par secteur (3001 restaurant, 3006 hôtel, etc.).
- Source de vérité sectorielle : trio `sector-config.ts` / `sector-theme.ts` / `sector-content.ts` (refactor S5).
- Hook canonique : `useSector()` dans `src/hooks/useSector.ts` (ne JAMAIS dupliquer).
- Logos sectoriels : `getLogoAssets(slug)` dans `@/lib/logo-config` (NON `@/lib/sector-config`).
- Toast : `useToast()` retourne `{success, error, info, warning}` (méthodes), PAS une fonction `toast({type, message})`.
- PageHeader props : `title` + `subtitle` (PAS `description`).

## session_9_gabriel

- **Type :** Debug + Génération — Test Vague 1, Redesign Onboarding, Hub Modules
- **Date :** 2026-05-12
- **Flux couverts :** F4 (Onboarding welcome ✅ — 4 écrans, paiement, modules), F5 (Auth cross-origin ✅), F6 (Dashboard — Hub Modules socle posé)
- **Bugs corrigés :** B01 (has_seen_welcome ✅), B02 (popup non-intrusif ✅), B03 (hrefs 404 ✅), B04 (claim-bonus ✅), B05 (mail → :3001 ✅), B06 (auth cross-origin ✅), P3 (boucle /welcome → refreshUser fix ✅), KeyError is_desired (services.py ✅), Régression PERSONNALISATION onboarding (custom sector ✅)
- **Zones touchées :**
  - `apps/features/` (models, migrations, serializers, services, views, urls)
  - `apps/auth_bridge/` (_onboarding.py)
  - `src/app/(dashboard)/welcome/` (page.tsx — 4 écrans)
  - `src/app/(dashboard)/modules/` (layout.tsx, page.tsx + 11 pages Hub)
  - `src/app/(dashboard)/layout.tsx`
  - `src/components/welcome/` (WelcomeScreen2, WelcomeScreen3 NEW, WelcomeScreen4)
  - `src/components/modules/ModuleHubTemplate.tsx` (NEW)
  - `src/lib/hub-modules.ts` (NEW)
  - `src/repositories/features.repository.ts`
  - `src/hooks/useFeatures.ts`
- **Fichiers créés :** 16 (migration 0003, WelcomeScreen3, WelcomeScreen4, ModuleHubTemplate, hub-modules.ts, modules/layout.tsx, modules/page.tsx, 11 pages modules Hub)
- **Fichiers modifiés :** 13 (models.py, serializers.py, services.py, views.py, urls.py, _onboarding.py, welcome/page.tsx, WelcomeScreen2.tsx, layout.tsx, features.repository.ts, useFeatures.ts, welcome/page.tsx fix refreshUser)
- **Bugs résiduels connus :** Slug uniqueness IntegrityError (register 500), /modules/manage 404, popup UPGRADE_PLAN même abonné (à investiguer engine.py), Sidebar sans lien Mes modules, mark_desired non testé proprement (bloqué par slug bug)
- **Décisions architecture :** is_desired sur TenantFeature (Option B, analytics admin), popup central unique (plus de bannière), localStorage AGT_WELCOME_MODULES, Hub Modules = pages Next.js indépendantes /modules/[path]
- **Rapport :** `docs/reports/session_9_gabriel.md`