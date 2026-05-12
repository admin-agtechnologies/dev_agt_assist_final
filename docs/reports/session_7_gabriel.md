# Session 7 — Convergence onboarding + Mes Modules + Welcome page + Vague 1 fixes

**Date :** 11-12 mai 2026
**Membre :** Gabriel
**Statut :** Backend testé et validé ✅ — Frontend code produit, partiellement testé, **4 fixes Vague 1 en attente de test**
**Commits :** [à compléter après push] backend + frontend
**Tests :** 25 tests unitaires onboarding OK ✅

---

## 🎯 Objectif initial

Implémenter le flux "First Contact" (F6 Dashboard de la TODO) avec :
1. Page `/welcome` post-inscription en 3 écrans
2. Système de modules épinglés dans la sidebar avec quotas
3. Page `/modules` avec 3 tabs (Actifs / Disponibles / Upgrade)
4. Convergence onboarding : assurer que tout user passe par Config + Test + Tuto, peu importe l'ordre

---

## 💡 Décisions clés prises pendant la session

### D1 — UX du flux first contact : 3 chemins qui convergent
**Problème métier soulevé par Gabriel :**
> *"Si je configure, je dois encore tester ; si je teste sans config, alors config, ensuite test pour vérifier ma config, ensuite tuto. Si le user fait d'abord le tuto, c'est ok il aura fait le tour."*

**Décision finale :**
```
Cas A — Config en premier   → Config → Test → Tuto
Cas B — Test en premier      → Test → Config → RE-Test (post-config) → Tuto
Cas C — Tuto en premier      → Tuto → fin (le tuto fait le tour complet)
```

**Implémentation :** machine à états à 3 booléens + 2 timestamps :
- `has_configured_bot` / `configured_at`
- `has_tested_bot` / `tested_at`
- `has_visited_tutorial`

Le **timestamp comparison `tested_at > configured_at`** détecte le besoin de re-test après config. Trois règles de convergence dans `engine.py` couvrent les 8 combinaisons possibles avec une logique unifiée.

### D2 — Bannière sticky non-bloquante (pas popup modal)
**Pourquoi pas popup ?** Le user reviendrait constamment à un popup tant que la condition n'est pas remplie → invasif.

**Solution :** nouvelle action `SHOW_BANNER` côté backend, distincte de `SHOW_POPUP`. Le frontend rend :
- `SHOW_POPUP` → modal centré (intros, félicitations)
- `SHOW_BANNER` → bannière en haut du dashboard, sticky tant que la condition reste vraie

**Avantage :** la bannière disparaît automatiquement quand le booléen métier flippe (déclenché par signal backend). Pas besoin de "fermer" — elle s'efface naturellement.

### D3 — Booléens onboarding exposés sur `/auth/me/`
**Problème découvert en test :** le frontend redirige vers `/welcome` selon `user.has_seen_welcome`, mais ce champ n'était pas exposé par l'API. **Le redirect ne s'est jamais déclenché.**

**Décision :** objet imbriqué `user.onboarding.has_seen_welcome` (extensible) au lieu de champs plats.

```typescript
user.onboarding = {
  has_seen_welcome: bool,
  has_claimed_bonus: bool,
  has_configured_bot: bool,
  has_tested_bot: bool,
  has_visited_tutorial: bool,
}
```

### D4 — Convergence en queue de pipeline (après les intros per-page)
**Choix d'ordre des règles :** convergence en **positions 10-12**, après les intros per-page (positions 4-9), avant le fallback dashboard (position 13).

**Rationale :** laisser le user découvrir les pages naturellement (intros) avant de l'orienter vers les étapes manquantes. La convergence ne préempte pas les intros.

### D5 — Popup non intrusif
**Découverte test :** popup d'abonnement saute immédiatement à l'arrivée sans croix de fermeture → user bloqué.

**Décision (Vague 1 fix B02) :**
- **Délai 2 secondes** avant ouverture (le user respire d'abord)
- **Croix de fermeture toujours visible**, même pour UPGRADE_PLAN
- **Backdrop cliquable** pour fermer
- Pas de notion de "popup bloquant" — on assume qu'il reviendra au prochain tab si la condition reste vraie

### D6 — Signaux backend déjà câblés en S7
Les booléens `has_configured_bot` et `has_tested_bot` étaient des coquilles vides en base — aucun signal ne les flippait. **3 nouveaux signaux ajoutés en S7** :
- `post_save` sur `knowledge.ProfilEntreprise` → has_configured_bot
- `post_save` sur `knowledge.FAQ` → has_configured_bot
- `post_save` sur `knowledge.QuestionFrequente` → has_configured_bot
- `post_save` sur `chatbot_bridge.TestMessage` (role=user) → has_tested_bot

**Validation live :** créer une FAQ via shell → `configured_at` immédiatement mis à jour ✅

### D7 — Dette technique acceptée
- `engine.py` : 582 lignes (dépasse 200) — registre unique de règles, découpage casserait le pattern.
- `tests.py` : 338 lignes (dépasse 200) — tests groupés par règle, le découpage n'apporterait rien.

Décision explicite : **on accepte** ces 2 fichiers, c'est cohérent métier.

---

## 🏗️ Architecture livrée

### Backend (8 fichiers S7 + 2 fichiers Vague 1)

```
apps/onboarding/
├── models.py                          ← +configured_at, +tested_at
├── migrations/
│   └── 0004_onboardingprogress_timestamps.py
├── signals.py                         ← +3 signaux config/test
├── engine.py                          ← +3 règles convergence + 1 helper
├── serializers.py                     ← +SHOW_BANNER
└── tests.py                           ← +11 tests S7

apps/knowledge/apps.py                 ← ready() pour brancher signaux
apps/chatbot_bridge/apps.py            ← ready() pour brancher signaux
apps/users/serializers.py              ← +onboarding dans UserMeSerializer (B01)
```

### Frontend (17 fichiers S7 + 3 fichiers Vague 1)

```
src/
├── types/
│   ├── onboarding.ts                  ← +SHOW_BANNER, +WelcomeSeenResponse
│   └── api/user.types.ts              ← +UserOnboarding (B01)
├── repositories/
│   ├── features.repository.ts         ← +pin(), +used/is_pinned/is_mandatory
│   └── feedback.repository.ts         ← +markWelcomeSeen()
├── hooks/
│   └── useOnboarding.ts               ← gestion popup ET bannière en parallèle
├── components/
│   ├── OnboardingPopup.tsx            ← non intrusif (B02)
│   ├── OnboardingBanner.tsx           ← NEW — bannière sticky
│   ├── layout/
│   │   ├── Sidebar.tsx                ← +section Épinglés +lien Mes modules
│   │   ├── Sidebar.config.ts          ← +route modules
│   │   └── SidebarPinnedModules.tsx   ← NEW — modules épinglés avec quotas
│   ├── modules/
│   │   ├── ModuleTabActive.tsx        ← NEW
│   │   ├── ModuleTabAvailable.tsx     ← NEW
│   │   └── ModuleTabUpgrade.tsx       ← NEW
│   └── welcome/
│       ├── WelcomeScreen1.tsx         ← NEW — bienvenue + bonus
│       ├── WelcomeScreen2.tsx         ← NEW — modules + quotas
│       └── WelcomeScreen3.tsx         ← NEW — 3 CTA finaux
└── app/(dashboard)/
    ├── layout.tsx                     ← +redirect /welcome via user.onboarding (B01)
    ├── modules/page.tsx               ← NEW — page Mes modules
    └── welcome/page.tsx               ← NEW — page first contact
```

---

## 🔄 Comportement complet du système d'onboarding (référence)

### Flow nouveau venu (target)

```
1. Inscription → email vérif → login
2. Layout dashboard détecte user.onboarding.has_seen_welcome = false
3. Redirect automatique vers /welcome
4. Écran 1 : "Bienvenue [Nom] 🎉" → bouton Commencer
5. Écran 2 : Liste modules actifs avec quotas → bouton C'est parti
6. Écran 3 : 3 CTA (Tester / Configurer / Tutoriel)
7. User clique l'un des 3 → markWelcomeSeen() + redirect vers la cible
8. À partir de là, bannière de convergence s'affiche selon état
```

### Logique convergence (machine à états)

| `configured_at` | `tested_at` | `tutorial` | Bannière |
|:-:|:-:|:-:|---|
| NULL | NULL | False | SILENCE (welcome gère) |
| ≠NULL | NULL | False | **CONVERGENCE_TEST** |
| NULL | ≠NULL | False | **CONVERGENCE_CONFIG** |
| ≠NULL | ≠NULL et tested_at < configured_at | False | **CONVERGENCE_TEST** (re-test) |
| ≠NULL | ≠NULL et tested_at >= configured_at | False | **CONVERGENCE_TUTORIAL** |
| n'importe quoi | n'importe quoi | True | SILENCE total |

### Endpoints utilisés

| Endpoint | Méthode | Rôle |
|---|---|---|
| `/api/v1/auth/me/` | GET | Inclut `user.onboarding.*` (Vague 1) |
| `/api/v1/onboarding/check/` | POST `{page}` | Évalue les règles, retourne SHOW_POPUP/SHOW_BANNER/NONE |
| `/api/v1/onboarding/welcome-seen/` | PATCH | Marque welcome vu |
| `/api/v1/onboarding/claim-bonus/` | POST | Réclame bonus 10k XAF |
| `/api/v1/onboarding/tutorial/` | GET/PATCH | Progression tutoriel |
| `/api/v1/features/active/` | GET | Liste features avec used/is_pinned |
| `/api/v1/features/{slug}/pin/` | POST | Toggle pin |

---

## 🐛 Liste exhaustive des 13 bugs identifiés en test

Classés par **gravité × facilité** (priorité finale).

### 🔴 Vague 1 — P0 (fixes proposés, en attente de test)

| ID | Bug | État | Fix proposé |
|---|---|---|---|
| **B01** | `has_seen_welcome` non exposé par `/auth/me/` → redirect /welcome jamais déclenché | ⏳ Fix livré | `UserMeSerializer.get_onboarding()` retourne objet imbriqué avec 5 booléens. Frontend lit `user.onboarding.has_seen_welcome`. |
| **B02** | Popup intrusif (immédiat, sans croix, backdrop non cliquable pour UPGRADE_PLAN) | ⏳ Fix livré | Délai 2s + croix toujours présente + backdrop cliquable + Escape fonctionne toujours. Plus de notion de "popup bloquant". |
| **B03** | Popup CTA hrefs `/pme/*` → 404 (routes frontend = `/billing`, `/bots`, `/faq`, `/tutorial`) | ⏳ Fix livré | `engine.py` : tous les hrefs corrigés. `/pme/billing → /billing`, `/pme/bots → /bots`, `/pme/knowledge → /faq` (route réelle), `/pme/tutorial → /tutorial`. |
| **B04** | claim-bonus échoue silencieusement | ❌ Pas fixé | **Diagnostic requis** — demander à l'utilisateur les captures Network (status code + body) avant de fixer. |

### 🟠 Vague 2 — P1 (à traiter après validation Vague 1)

| ID | Bug | Gravité | Effort | Note |
|---|---|---|---|---|
| **B05** | Email de vérif redirige vers `localhost:3000` au lieu de `:3001` | Critique | Facile | Backend : `_frontend_base()` ou `FRONTEND_BASE_URL` mal configuré pour le secteur restaurant en dev. À vérifier dans `apps/auth_bridge/local.py` + `SECTOR_URLS` constants. |
| **B06** | Tokens d'auth pas transférés vers sous-domaine sectoriel → 401 cascade | Bloquant | Complexe | Cross-domain SSO. Le redirect vers `localhost:3001` après login sur `localhost:3000` perd le token (cookies same-origin). Solutions possibles : URL fragment, postMessage, ou cookie partagé sur `.localhost`. |
| **B07** | 401 déclenche boucle infinie d'erreurs (2102 erreurs en quelques secondes — voir capture) | Critique | Facile | Frontend : ajouter circuit breaker dans `api-client.ts` ou les repositories qui catch 401 et stop retry. |
| **B08** | Création de bot échoue avec popup erreur (compte resto) | Bloquant | À diag | Probablement lié à B06 (token absent) ou problème de quota. **Diagnostic Network requis.** |
| **B10** | Modules cochés à l'inscription n'apparaissent pas dans sidebar/page modules | Critique | À diag | Très probablement même cause que B06 (401 → `features/active/` retourne vide → sidebar et /modules vides). À revérifier après fix B06. |

### 🟡 Vague 3 — P2 (gros chantier)

| ID | Bug | Gravité | Effort |
|---|---|---|---|
| **B09** | Régression base de connaissance V1→V2 : 3 onglets manquants | Régression | Gros |

**Détail B09 :** Le V1 (prod `assist.ag-technologies.tech/pme/knowledge`) a **4 onglets** :
1. **Infos générales** — Mon entreprise, contacts, transfert humain
2. **Agences** — Multi-établissements
3. **FAQ** — Questions fréquentes
4. **Services & Tarifs** — Catalogue de services

Le V2 (dev `localhost:3001/faq`) n'a que la FAQ. Les modèles backend existent (`ProfilEntreprise`, `Agence`, `Service`) mais le frontend ne rend plus les 3 autres onglets. **Captures fournies en S7, à charger dans le contexte de S8.**

Probablement 1 session entière à reconstruire ces 3 onglets.

### 🟡 Vague 4 — P2/P3 (cosmétique)

| ID | Bug | Gravité | Effort |
|---|---|---|---|
| **B11** | Dashboard affiche "lettre A" au lieu du logo sectoriel | Cosmétique | Facile |
| **B12** | Thème sectoriel ne s'applique pas convenablement | UX | À diag |
| **B13** | Logout réinitialise les couleurs vers le hub (alors qu'on est sur un secteur) | UX | Facile |

---

## 📊 État actuel à la fin de S7

### ✅ Validé et committé

- Backend convergence onboarding : 8 fichiers + 25 tests OK
- Backend signaux config/test : opérationnels (test live confirmé)
- Migration `0004_onboardingprogress_timestamps` appliquée

### ⏳ Code produit, **NON testé**, attend test S8

- 17 fichiers frontend S7 (sidebar, modules, welcome, banner)
- 5 fichiers Vague 1 (B01, B02, B03) — backend + frontend

### ❌ Non traité

- B04 (diagnostic claim-bonus) — **première action S8**
- B05 → B13 (8 bugs restants)

---

## 🎬 Plan d'action S8 (à dérouler dans l'ordre)

### Étape 1 — Tester la Vague 1 (B01 + B02 + B03)

**Avant tout autre travail.** Si la Vague 1 ne marche pas, le reste est inutile à corriger.

Scénario nouveau venu avec mail jetable :
1. Inscription resto (mail jetable) → email vérif → login
2. **Attendu :** redirect automatique vers `/welcome` ✨ (était cassé en S7)
3. **Attendu :** Les 3 écrans s'affichent
4. Clic CTA final → redirect (pas 404 cette fois)
5. **Attendu :** Popup BONUS_CLAIM apparaît APRÈS 2s avec croix + backdrop fermable

### Étape 2 — Diagnostic B04 (claim-bonus)

Le user devra fournir **captures Network** :
- Status code de la requête `POST /api/v1/onboarding/claim-bonus/`
- Response body
- Request headers (vérifier que le token est présent)

Sans ces infos, fix impossible à l'aveugle.

### Étape 3 — Vague 2 (P1)

Dans l'ordre : B05 → B07 → B06 → B08 → B10
(B05 simple d'abord, B07 protège contre la cascade, B06 le complexe au cœur, B08 et B10 se résoudront probablement avec B06)

### Étape 4 — Vague 3 (P2)

B09 — Reconstruction des 3 onglets base de connaissance. Probablement 1 session entière. Demander à Gabriel les captures V1 (déjà fournies en S7, à recharger).

### Étape 5 — Vague 4 (P2/P3)

B11 → B13 — cosmétique, peuvent attendre.

---

## 🎓 CE QUE J'AI APPRIS SUR LA FAÇON DE TRAVAILLER DE GABRIEL

> Cette section est essentielle pour les prochaines sessions de Claude. À LIRE EN PREMIER quand on démarre S8.

### 1. Décisions et autorité
- **Gabriel décide, Claude propose.** Pas d'initiative sans validation.
- En cas d'ambiguïté : **toujours poser une question avant d'agir**, jamais supposer.
- **Multi-tour OK :** Gabriel préfère plusieurs allers-retours rapides plutôt qu'une grosse génération à l'aveugle.

### 2. Façon de poser les questions
- **Questions UI avec `ask_user_input_v0`** quand on demande une décision claire (préférable au texte long).
- **Max 3 questions par tour**, options claires (2-4 par question).
- Pour les questions de **logique métier**, ne **pas poser de questions techniques** : Gabriel valide la logique, Claude trouve la solution technique.
- Quand Gabriel répond, il **reprend les questions une par une** avec "Q : / R :".

### 3. Génération de code
- **Toujours les fichiers complets**, jamais de diffs (sauf modifs < 5 lignes).
- Limite **200 lignes par fichier (+50 tolérance)**. Si dépassement justifié, **signaler et demander accord** (ex: engine.py registre central).
- **Backend first si simple**, frontend après.
- **5 à 15 fichiers max par génération.** Au-delà, découper.
- Présenter les fichiers via `present_files` avec **tableau de placement** (numéro → destination).

### 4. Tests et environnement
- **Backend Django via Docker Compose** : commandes type `docker-compose -f docker-compose.dev.yml exec api python manage.py [...]`
- Tests onboarding : `docker-compose -f docker-compose.dev.yml exec api python manage.py test apps.onboarding -v 2`
- Frontend : `npm run dev` (port 3001 pour restaurant, etc.)
- TypeScript check : `npx tsc --noEmit`
- **Le README backend documente Docker Compose** — toujours s'y référer pour les commandes.

### 5. Scan code source
- **Le scanner.ps1 n'est pas redemandé à chaque session.** Le contexte frontend et backend est dans la **mémoire du projet** sous les noms `contexte_frontend_PME.txt` et `contexte_backend.txt`. Ne **JAMAIS** demander à relancer le scanner si ces fichiers sont dans les `<project_files>`.

### 6. Style de réponse
- **Toujours classer les bugs par gravité × facilité** avant de proposer un ordre de traitement.
- Donner toujours un **plan d'attaque par vague**, jamais "voici les 13 fixes".
- **Honnêteté > complaisance** : si Claude ne sait pas, il dit "je ne peux pas fixer à l'aveugle, j'ai besoin de X". Pas d'inventions.
- **Reformuler la logique métier dans les mots de Gabriel** pour vérifier la compréhension avant de coder.

### 7. Tests utilisateurs réels
- **Gabriel teste lui-même** avec :
  - Un compte existant (resto@demo.cm, hotel@demo.cm) pour les régressions
  - Un mail jetable pour simuler un nouveau user
- Il **note les bugs au fil de l'eau** et les remonte en lot après chaque test.
- **Ne pas demander 4 scénarios d'un coup** — un scénario à la fois.

### 8. Bonnes pratiques projet
- **Patterns existants > nouveaux patterns.** Lire ce qui existe avant de créer (sidebar, repository, hook, etc.).
- **Réutilisation > création** (composants, hooks, utils).
- **Mobile-first et responsive**.
- **Design system existant** (CSS vars `--color-primary`, `--text`, `--bg-card`, etc.).
- **Pas de localStorage / sessionStorage dans les artifacts** (mais OK dans le projet réel).

### 9. Rapports de session
- **Long mais exploitable** > court mais incomplet.
- **Décisions prises avec rationale.**
- **État précis** (validé / en attente de test / à faire).
- **Liste de bugs avec priorisation.**
- **Plan d'action S+1.**
- **Prompt de début de session** prêt à copier-coller en fin de rapport.

### 10. APPEND ONLY sur INDEX.md
- **Ne jamais réécrire INDEX.md**, toujours ajouter.
- Le nom des rapports : `session_{N}_{membre}.md` dans `docs/reports/`.

---

## 📋 Prompt de début de S8 (à copier-coller au démarrage)

```
Bonjour Claude, nous démarrons la session 8 de développement sur AGT Platform.

**Membre :** Gabriel
**Session N° :** 8
**Date :** [date du jour]
**Objectif principal :** tester la Vague 1 (B01+B02+B03) puis diagnostiquer B04, puis enchaîner sur la Vague 2.

Avant de commencer, effectue ces actions dans l'ordre :

1. **Lis docs/reports/INDEX.md** et identifie les zones traitées par les sessions précédentes.
   En particulier la note "Façon de travailler de Gabriel" — applique-la dès le premier message.

2. **Lis le rapport de session_7_gabriel.md** en entier.
   Tu y trouveras :
   - Les 13 bugs identifiés classés en 4 vagues
   - Les 4 fixes Vague 1 proposés mais NON TESTÉS
   - Le scénario de test à dérouler en premier
   - Les décisions de design prises pour le système d'onboarding

3. **Vérifie les contextes** :
   - Le code source backend est dans contexte_backend.txt (déjà dans la mémoire du projet, ne PAS redemander)
   - Le code source frontend est dans contexte_frontend_PME.txt (idem)
   - Si tu as besoin de quelque chose qui n'est pas dans ces contextes, demande-le.

4. **Première action à proposer :**
   Demande-moi les captures du scénario nouveau venu (mail jetable → /welcome → click CTA) pour
   valider que les fixes B01+B02+B03 fonctionnent. Si tout est OK on enchaîne sur B04.

   POUR B04 (claim-bonus échoue silencieusement), tu auras besoin :
   - Status code de la requête POST /api/v1/onboarding/claim-bonus/
   - Response body
   - Headers (vérifier token présent)

5. **Ne génère aucun code avant d'avoir un retour de mes tests Vague 1.**

Rappels :
- Tu ne génères rien sans mon accord explicite
- Tu poses des questions en cas d'ambiguïté (ask_user_input_v0)
- Tu respectes les patterns existants
- Tu réutilises au maximum (composants, hooks, repositories existants)
- Fichiers complets, jamais de diffs (sauf < 5 lignes)
- 200 lignes par fichier max (+50 tolérance), tu signales si dépassement
- Backend = Docker Compose (cf README), Frontend = npm run dev
- Pas de scanner.ps1 — les contextes sont en mémoire du projet
```

---

## 📦 Livrables S7

### Backend (10 fichiers — 8 S7 + 2 Vague 1)
1. `apps/onboarding/models.py` — +configured_at, +tested_at
2. `apps/onboarding/migrations/0004_onboardingprogress_timestamps.py`
3. `apps/onboarding/signals.py` — +3 signaux
4. `apps/onboarding/engine.py` — +3 règles + Vague 1 fix B03
5. `apps/onboarding/serializers.py` — +SHOW_BANNER
6. `apps/onboarding/tests.py` — +11 tests
7. `apps/knowledge/apps.py` — ready() signaux
8. `apps/chatbot_bridge/apps.py` — ready() signaux
9. `apps/users/serializers.py` — +UserMeSerializer.onboarding (Vague 1 B01)

### Frontend (19 fichiers — 17 S7 + 2 Vague 1)
1. `src/types/onboarding.ts` — +SHOW_BANNER
2. `src/types/api/user.types.ts` — +UserOnboarding (Vague 1 B01)
3. `src/repositories/features.repository.ts` — +pin()
4. `src/repositories/feedback.repository.ts` — +markWelcomeSeen()
5. `src/hooks/useOnboarding.ts` — popup + banner parallèles
6. `src/components/OnboardingPopup.tsx` — non intrusif (Vague 1 B02)
7. `src/components/OnboardingBanner.tsx` — NEW
8. `src/components/layout/Sidebar.tsx` — +pinned +modules link
9. `src/components/layout/Sidebar.config.ts` — +modules route
10. `src/components/layout/SidebarPinnedModules.tsx` — NEW
11. `src/components/modules/ModuleTabActive.tsx` — NEW
12. `src/components/modules/ModuleTabAvailable.tsx` — NEW
13. `src/components/modules/ModuleTabUpgrade.tsx` — NEW
14. `src/components/welcome/WelcomeScreen1.tsx` — NEW
15. `src/components/welcome/WelcomeScreen2.tsx` — NEW
16. `src/components/welcome/WelcomeScreen3.tsx` — NEW
17. `src/app/(dashboard)/layout.tsx` — +redirect welcome (Vague 1 B01)
18. `src/app/(dashboard)/modules/page.tsx` — NEW
19. `src/app/(dashboard)/welcome/page.tsx` — NEW

---

## 🎯 Indicateurs de succès S7

- ✅ Backend convergence opérationnel (25 tests OK)
- ✅ Signaux config/test câblés et testés live
- ✅ 17 fichiers frontend TypeScript clean (`npx tsc --noEmit` = 0 erreur après 4 micro-fixes)
- ⏳ Vague 1 fixes proposés (B01, B02, B03 livrés ; B04 attend diagnostic)
- ❌ Scénario new user non re-testé après Vague 1 (action S8)

---

**Fin du rapport S7.**