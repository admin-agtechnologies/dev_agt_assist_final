# Rapport de Session 9 — Gabriel
## AGT Platform — Test Vague 1, Redesign Onboarding, Hub Modules

---

**Date :** Mardi 12 mai 2026
**Membre :** Gabriel
**Session N° :** 9
**Durée estimée :** 15h00 → 18h30 (Yaoundé, GMT+1)
**Compte précédent :** Session 8 interrompue (tokens épuisés sans rapport)

---

## 1. Contexte de démarrage

La session 9 a démarré sans rapport de S8. Le HTML de la session précédente a été fourni et analysé pour reconstituer le contexte. À l'entrée de S9, l'état était le suivant :

- **7 fichiers S8 copiés et compilés** (2 backend + 5 frontend), backend redémarré
- **B06 (root cause de tout)** : la fix cross-origin (localStorage isolé par origine :3000/:3001) avait été produite en S8 mais non testée
- **B05** : URL du mail de vérification corrigée vers :3001
- **Onboarding welcome** : page 3 écrans livrée en S7, jamais testée proprement
- **Welcome loop (P3)** : identifiée comme bug critique en S8, fix proposée mais tokens coupés

La session s'est déroulée en 3 grandes phases : Tests & débug Vague 1 → Redesign de l'onboarding (conception + code) → Socle Hub Modules.

---

## 2. Phase 1 — Test et validation Vague 1

### 2.1 Test E2E nouveau venu

Gabriel a testé le scénario complet nouveau venu sur :3001 (restaurant). Le test a permis de valider ou révéler les éléments suivants :

**B05 ✅ VALIDÉ**
Le mail de vérification reçu contenait bien `http://localhost:3001/verify-email?token=...&sector=restaurant`. La fix `_email_urls.py` + `local.py` de S8 est opérationnelle.

**B06 ✅ VALIDÉ**
Le dashboard a chargé correctement sur :3001 après vérification du mail. L'authentification cross-origin fonctionne : le token est bien transmis entre les origines via la page `/auth-handoff`. Plus de 401 sur `features/active/`.

**B01 ✅ VALIDÉ**
Après le login, la redirection automatique vers `/welcome` s'est déclenchée correctement. Le champ `has_seen_welcome` est bien lu depuis `user.onboarding`.

**B02 ✅ VALIDÉ**
Le popup BONUS_CLAIM s'affiche avec une croix, le backdrop est cliquable, il n'est plus bloquant. Le délai de 2s fonctionne.

**B03 ✅ VALIDÉ**
Les CTAs de l'écran 3 du welcome ne font plus de 404. Les routes `/bots`, `/faq`, `/tutorial` sont correctement ciblées.

**B04 ✅ VALIDÉ**
Le claim-bonus a crédité 10 000 XAF sur le wallet, visible sur la page Facturation.

### 2.2 Bug P3 — Boucle /welcome

**Symptôme :** après avoir cliqué "Voir le tutoriel" sur l'écran 3 de `/welcome`, le user était redirigé en boucle vers `/welcome` au lieu d'atterrir sur `/tutorial`.

**Diagnostic :**
- `PATCH /onboarding/welcome-seen/` → 200 ✅ (serveur marque `has_seen_welcome=true`)
- Mais le state React en mémoire (`user.onboarding.has_seen_welcome`) n'était pas mis à jour
- Quand le layout de `/tutorial` se montait, il relisait l'ancienne valeur `false` → redirect /welcome → boucle

**Fix :** dans `welcome/page.tsx`, ajout de `await refreshUser()` après `markWelcomeSeen()`, avant `router.push()`. Cela force un re-fetch de `/auth/me/` qui retourne maintenant `has_seen_welcome: true`, cassant la boucle.

```diff
- const { user } = useAuth();
+ const { user, refreshUser } = useAuth();

  try {
    await onboardingRepository.markWelcomeSeen();
+   await refreshUser();
  } catch { ... }
  finally { router.push(href); }
```

**Résultat :** boucle supprimée, navigation vers `/tutorial` fonctionnelle ✅

### 2.3 Observations UX supplémentaires

Plusieurs problèmes UX ont été identifiés durant le test, en dehors des bugs formels :

- **P2 — Modules non persistés à l'inscription** : les 6 modules choisis par Gabriel pendant l'onboarding n'apparaissaient pas dans l'écran "Vos modules actifs" du welcome. Le backend ne persistait que les 4 features du plan Starter (`chatbot_whatsapp`, `dashboard`, `faq`, `emails_rappel`). Les `feature_slugs` envoyés depuis le frontend étaient ignorés par `activate_selected_features()` qui échouait silencieusement sur les features hors-plan.
- **P1 — Popup abonnement avant /welcome** : le popup UPGRADE_PLAN apparaissait sur `/dashboard` avant le redirect `/welcome`. Bug de timing dans le layout.
- **Bannière "tester votre bot"** : visible même quand l'utilisateur est déjà sur la page de test du bot. Confusion.
- **"Voir le tutoriel" → boucle** : traité ci-dessus (P3 fixé).

---

## 3. Phase 2 — Redesign de l'onboarding

### 3.1 Conception

Suite aux observations de test, Gabriel a demandé un redesign complet du flow onboarding. La session a consacré une partie importante à la conception avant tout code.

**Nouveau flow welcome (4 écrans) :**

| Écran | Contenu | Action principale |
|---|---|---|
| 1 | Bienvenue [Nom] 🎉 | → Commencer |
| 2 | Modules : ceux choisis à l'inscription + ajout d'autres depuis le secteur ou cross-secteur | → C'est parti |
| 3 | Paiement : wallet + claim bonus + sélection plan | → Payer / Recharger |
| 4 | Par où commencer ? Tester / Configurer / Tutoriel | → markWelcomeSeen() + navigation |

**Règles décidées :**
- Pendant le welcome : zéro popup externe (welcome gère tout)
- Après welcome : popup central (UPGRADE_PLAN) sur chaque changement de route si pas d'abonnement actif
- Plus de bannière (Gabriel a choisi le popup central comme système unique)
- `feature_slugs` → persistés en `is_desired=True` même hors plan (pas activés, mais tracés)
- localStorage `AGT_WELCOME_MODULES` pour les modules sélectionnés entre les écrans

**Conception `is_desired` :**
Gabriel a validé que les modules désirés doivent être visibles côté admin AGT pour les analytics (features les plus demandées). Choix : `Option B` — champ `is_desired` sur `TenantFeature`, requêtable directement.

### 3.2 Chantier 1 Backend — `is_desired`

**5 fichiers backend générés et appliqués :**

`apps/features/models.py` — ajout de `is_desired = BooleanField(default=False)` sur `TenantFeature`. Index `agt_tf_is_desired_idx` pour les requêtes analytics. `__str__` enrichi avec ⭐.

`apps/features/migrations/0003_tenantfeature_is_desired.py` — migration appliquée avec succès :
```
Applying features.0003_tenantfeature_is_desired... OK
```

`apps/features/serializers.py` — `is_desired` ajouté à `ActiveFeatureSerializer` et `TenantFeatureSerializer`.

`apps/features/services.py` — deux nouvelles fonctions :
- `get_desired_features(entreprise)` : retourne toutes les TenantFeature `is_desired=True`, y compris hors plan. Utilisé par Welcome Screen 2 et analytics admin.
- `mark_features_as_desired(entreprise, feature_slugs)` : marque les slugs choisis comme désirés sans les activer. Crée le TenantFeature si absent (cas features hors plan Starter). Idempotent.
- `get_features_with_quota()` enrichi : retourne maintenant `is_desired` dans chaque dict.

`apps/auth_bridge/_onboarding.py` — `activate_selected_features()` reécrite : au lieu d'essayer d'activer les features choisies (qui échouait silencieusement pour les features hors plan), appelle maintenant `bootstrap_tenant_features()` + `mark_features_as_desired()`.

`apps/features/views.py` — endpoint `GET /api/v1/features/desired/` ajouté (`desired` action sur `TenantFeatureViewSet`).

`apps/features/urls.py` — route `/features/desired/` enregistrée.

**Bug découvert pendant la mise en place :** `apps.tenants.utils` n'existe pas dans le projet → `views.py` crashait au démarrage. Corrigé en inlinant `get_entreprise()` directement dans `views.py`.

### 3.3 Chantier 2 Frontend — Welcome 4 écrans

**9 fichiers frontend générés :**

`src/repositories/features.repository.ts` — ajout de `getDesired()` (GET /features/desired/) et `getSectorFeatures(sectorSlug)` (GET /features/by-sector/?sector=). Type `ActiveFeature` enrichi avec `is_desired: boolean`.

`src/hooks/useFeatures.ts` — factory function `makeFeaturesHook` pour éviter la duplication. Ajout de `useDesiredFeatures()`, `useSectorFeatures(sectorSlug)`.

`src/components/welcome/WelcomeScreen2.tsx` — redesign complet. Charge les features désirées (pre-selectionnées) + toutes les features du secteur courant + toutes les features cross-secteur (via `useSectorFeatures("custom")`). Fusion en une liste unifiée sans doublons. Toggles sauvegardés en localStorage (`AGT_WELCOME_MODULES`). Badge "Votre choix" pour les features is_desired. Icône 🔒 pour les features mandatory.

`src/components/welcome/WelcomeScreen3.tsx` (NOUVEAU) — écran paiement. Charge plans (`GET /billing/plans/?is_active=true`) et wallet (`walletsRepository.getMine()`). Bouton "Réclamer mon bonus 10 000 XAF" (si pas encore réclamé). Sélection du plan (cartes Starter/Pro). Indicateur solde après paiement (vert si suffisant, ambre si insuffisant). Bouton "Payer avec mon portefeuille" (`billingActionsRepository.confirmUpgrade()`) ou lien "Recharger →" vers /billing. Bouton "Réajuster mes modules" pour revenir à Screen2.

`src/components/welcome/WelcomeScreen4.tsx` — renommage de l'ancien Screen3 (CTAs finaux : Tester / Configurer / Tutoriel). Logique inchangée, juste renommé.

`src/app/(dashboard)/welcome/page.tsx` — étendu de 3 à 4 écrans. Gestion localStorage pour `selectedSlugs`. `handlePaymentSuccess()` vide le localStorage et passe à Screen4. `handleFinalChoice()` appelle `markWelcomeSeen()` + `refreshUser()` (fix P3) + navigation.

`src/app/(dashboard)/layout.tsx` — suppressions popup/banner pendant `/welcome`. Ajout `useEffect` : recheck onboarding sur chaque `pathname` change (post-welcome uniquement). Suppression de la bannière `OnboardingBanner` (remplacée par popup central unique). Suppression du popup `UPGRADE_PLAN` si `pathname === "/billing"`.

**Bugs TypeScript résolus :**
- Conflit `Wallet` type entre `billing.types.ts` et `commande.types.ts` → import corrigé vers `commande.types`
- Erreur syntaxe destructuring `{ features: allFeatures: allSector }` → corrigé en `{ features: allSector }`

**Régression PERSONNALISATION onboarding corrigée :**
`PublicSectorFeaturesView` ne gérait pas le cas `sector=custom`. Ajout d'un bloc spécial : quand `sector=custom`, retourner toutes les `Feature.objects.filter(is_active=True)`.

### 3.4 Chantier 3 — Post-welcome popup

Le layout.tsx a été modifié pour déclencher `recheckCurrentPage()` sur chaque changement de route après le welcome. Le popup central remplace la bannière pour tous les états onboarding post-welcome.

---

## 4. Phase 3 — Hub Modules (socle)

### 4.1 Conception validée

**Décision architecture :**
- Chaque module Hub = page Next.js indépendante avec URL propre (`/modules/[path]`)
- `modules/layout.tsx` = tab bar horizontale partagée, dynamique (ne montre que les modules `is_active=True` du tenant)
- `modules/page.tsx` = redirect vers le premier module actif
- Les pages standalone (Bots, Conversations, FAQ, Contacts, Billing) restent inchangées
- Sidebar : uniquement les modules `is_pinned=True` en raccourci (simplification à faire S10)

**13 modules Hub définis :**

| Slug | URL | Type |
|------|-----|------|
| reservation_table | /modules/reservation-table | agent_reads |
| reservation_chambre | /modules/reservation-chambre | agent_reads |
| menu_digital | /modules/menu-digital | user_writes |
| commande_paiement | /modules/commande-paiement | agent_reads |
| prise_rendez_vous | /modules/prise-rdv | agent_reads |
| catalogue_produits | /modules/catalogue-produits | user_writes |
| catalogue_services_tarifs | /modules/catalogue-services | user_writes |
| catalogue_trajets_tarifs | /modules/catalogue-trajets | user_writes |
| inscriptions_admissions | /modules/inscriptions | agent_reads |
| multi_agences | /modules/agences | user_writes |
| conciergerie_virtuelle | /modules/conciergerie | agent_reads |
| communication_etablissement | /modules/communication | collaborative |
| conversion_prospects | /modules/prospects | agent_reads |

### 4.2 Fichiers générés

**15 fichiers :**

`src/lib/hub-modules.ts` — registre central. Interface `HubModule` : slug, path, labelFr/En, descFr/En, iconName, type, apiEndpoint, color. Fonctions utilitaires `getHubBySlug()`, `getHubByPath()`, `HUB_SLUGS` Set.

`src/components/modules/ModuleHubTemplate.tsx` — composant template partagé. Header avec gradient coloré propre à chaque module. Stat bar (total, ce mois, type agent/user). Liste d'items générique avec `GenericItemCard`. Skeleton loading. Empty state différencié : `agent_reads` → "L'agent collecte les données ici", `user_writes` → "Commencez par ajouter". Boutons Refresh et Ajouter (user_writes). Prop `renderItem` pour override par module.

`src/app/(dashboard)/modules/layout.tsx` — tab bar sticky au top. Charge les features actives via `useActiveFeatures()`. Filtre par `HUB_SLUGS`. Affiche l'icône + label du module pour chaque tab. Couleur active = `module.color`. Bouton "Gérer" (→ /modules/manage, à créer S10).

`src/app/(dashboard)/modules/page.tsx` — redirect vers le premier module Hub actif.

**11 pages modules** (pattern identique : fetch API → items state → ModuleHubTemplate) :
reservation-table, reservation-chambre, menu-digital, commande-paiement, prise-rdv, catalogue-produits, catalogue-services, catalogue-trajets, inscriptions, agences, conciergerie.

### 4.3 État au moment du rapport

- `GET /features/active/ 200 1972` — fonctionne ✅
- `/modules/reservation-table` et `/modules/reservations/` → 200 ✅
- 404 gracieux pour les endpoints non encore créés (commandes, orders, knowledge/menu) → empty state affiché correctement ✅
- `/modules/manage` → 404 (page à créer) ⚠️

---

## 5. Bugs résiduels à traiter en S10

### 🔴 Critique

**Slug uniqueness (register 500)**
- Symptôme : `IntegrityError: duplicate key value violates unique constraint "agt_entreprises_slug_key"` quand deux entreprises ont le même nom slugifié.
- Cause : `patch_entreprise_after_register()` dans `_onboarding.py` ne gère pas les collisions de slug.
- Fix : ajouter un suffixe court aléatoire si le slug existe déjà.
- Localisation : `apps/auth_bridge/_onboarding.py`, fonction `patch_entreprise_after_register()`, bloc `if company_name`.
- Impact : bloque l'inscription de nouveaux users ayant des noms similaires à des users existants.

**Mark desired non testé proprement**
- Le crash slug empêche de valider `[mark_desired]` en logs. À confirmer dès que le slug bug est fixé.

### 🟡 Moyen

**Popup UPGRADE_PLAN même abonné**
- Symptôme : sur `/settings`, popup "Choisissez votre abonnement" apparaît malgré un Starter actif.
- Cause probable : check engine retourne UPGRADE_PLAN même pour plan Starter (plan gratuit vs plan payant logique à vérifier dans `engine.py`).
- Non investigué faute de temps.

**Sidebar non mise à jour**
- Le lien "Mes modules" n'est pas dans la sidebar.
- La section modules épinglés n'est pas wired.
- Chantier à faire en S10 avec la Sidebar.tsx / Sidebar.config.ts.

**`/modules/manage` → 404**
- Le bouton "Gérer" du layout pointe vers une page inexistante.
- Décision S10 : créer la page ou supprimer le bouton.

**Modules hub visibles uniquement si dans le plan**
- La tab bar filtre par `is_active=True`.
- Les modules `is_desired=True` mais hors plan ne s'affichent pas.
- À résoudre : inclure les desired dans la tab bar avec un badge "Upgrade".

---

## 6. Décisions techniques de session

| Décision | Détail |
|----------|--------|
| `is_desired` sur TenantFeature (Option B) | Visible admin analytics, pas de duplication data |
| Popup central unique | Plus de bannière post-welcome, tout passe par OnboardingPopup |
| localStorage pour modules welcome | `AGT_WELCOME_MODULES` — vidé après paiement réussi |
| Hub Modules = pages indépendantes | URLs propres `/modules/[path]`, layout partagé |
| `refreshUser()` après markWelcomeSeen | Fix boucle /welcome définitif |
| `get_entreprise()` inliné dans views.py | `apps.tenants.utils` n'existe pas |

---

## 7. Fichiers modifiés S9

### Backend
| Fichier | Action |
|---------|--------|
| `apps/features/models.py` | +`is_desired` sur TenantFeature |
| `apps/features/migrations/0003_tenantfeature_is_desired.py` | Créé |
| `apps/features/serializers.py` | +`is_desired` sur les 2 serializers |
| `apps/features/services.py` | +`get_desired_features()`, +`mark_features_as_desired()`, `get_features_with_quota()` enrichi |
| `apps/features/views.py` | +action `desired`, `get_entreprise()` inliné |
| `apps/features/urls.py` | +route `/features/desired/` |
| `apps/auth_bridge/_onboarding.py` | `activate_selected_features()` réécrite (bootstrap + mark_desired) |

### Frontend
| Fichier | Action |
|---------|--------|
| `src/app/(dashboard)/welcome/page.tsx` | 3→4 écrans, localStorage, refreshUser fix |
| `src/components/welcome/WelcomeScreen2.tsx` | Redesign — desired + sector + cross-sector |
| `src/components/welcome/WelcomeScreen3.tsx` | NOUVEAU — écran paiement |
| `src/components/welcome/WelcomeScreen4.tsx` | Renommage ex-Screen3 |
| `src/app/(dashboard)/layout.tsx` | Recheck route-change, suppression bannière |
| `src/repositories/features.repository.ts` | +getDesired(), +getSectorFeatures(), +is_desired type |
| `src/hooks/useFeatures.ts` | +useDesiredFeatures(), +useSectorFeatures() |
| `src/lib/hub-modules.ts` | NOUVEAU — registre 13 modules Hub |
| `src/components/modules/ModuleHubTemplate.tsx` | NOUVEAU — template beauté |
| `src/app/(dashboard)/modules/layout.tsx` | NOUVEAU — tab bar dynamique |
| `src/app/(dashboard)/modules/page.tsx` | NOUVEAU — redirect |
| `modules/reservation-table/page.tsx` | NOUVEAU |
| `modules/reservation-chambre/page.tsx` | NOUVEAU |
| `modules/menu-digital/page.tsx` | NOUVEAU |
| `modules/commande-paiement/page.tsx` | NOUVEAU |
| `modules/prise-rdv/page.tsx` | NOUVEAU |
| `modules/catalogue-produits/page.tsx` | NOUVEAU |
| `modules/catalogue-services/page.tsx` | NOUVEAU |
| `modules/catalogue-trajets/page.tsx` | NOUVEAU |
| `modules/inscriptions/page.tsx` | NOUVEAU |
| `modules/agences/page.tsx` | NOUVEAU |
| `modules/conciergerie/page.tsx` | NOUVEAU |

---

## 8. Prompt de démarrage S10

```
Session 10 — Gabriel — Agent IA Restaurant

Contexte S9 :
- Onboarding welcome 4 écrans livré et fonctionnel
- Hub Modules socle posé (13 modules, template, layout tab bar)
- is_desired sur TenantFeature (migration 0003 appliquée)
- features/active/ fonctionne (200 ✅)
- Bug slug uniqueness bloque les nouvelles inscriptions

Avant tout code S10 :
1. Fixer slug uniqueness dans _onboarding.py (~5 lignes)
2. Tester register propre → vérifier [mark_desired] dans logs
3. Vérifier sidebar (lien Mes modules absent)

Focus principal S10 :
- Agent IA restaurant — fonctionnalité complète
- Connexion modules Hub restaurant (réservation-table, menu-digital, commande-paiement)
  avec l'agent WhatsApp
- Pages Hub spécifiques restaurant avec vraies données

Rappel règles : propose avant de coder, max 5 fichiers en debug,
pas d'initiative sans accord explicite.
```

---

**Total fichiers S9 :** 7 backend + 22 frontend = **29 fichiers**
**Bugs P0 résolus :** B01, B02, B03, B04, B05, B06, P3
**Bonne nuit Gabriel** 🌙