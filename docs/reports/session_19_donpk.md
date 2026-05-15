# Session 18 — donpk

> **Type :** Conception + Génération — Refactor pré-déploiement Vercel (Phase 0)
> **Date :** 2026-05-14
> **Branche de travail :** `develop`
> **Statut :** Phase 0 quasi terminée, décision hébergeur reportée à S20

---

## Résumé exécutif

Session consacrée à la **préparation du frontend pour le déploiement cloud**. L'objectif initial était de tout déployer sur Vercel pendant cette session, mais la session a glissé vers une phase de **conception et nettoyage du code** plus profonde que prévu, ce qui était nécessaire (le code n'était pas prêt pour la prod).

**Livrables concrets :**
- Refactor `SECTOR_URLS` → `getSectorUrl()` env-driven (6 fichiers modifiés, 1 fichier créé)
- Nettoyage de 10 fichiers `.env.{secteur}` obsolètes du repo
- Création branche `develop` + workflow Git deux-branches
- TODO de déploiement complète (`TODO_DEPLOYMENT_VERCEL_v2.md`)

**Décisions majeures actées :**
- Architecture **mono-repo** + 2 branches (`develop`, `main`)
- Domaine transport → `travel.agt-bot.com` (1 L) — frontend prêt, backend à aligner
- DNS dev custom (`dev-{secteur}.agt-bot.com`)
- 1 client OAuth par secteur × par env (20 clients à créer)

**Décisions reportées à S20 :**
- Choix définitif de l'hébergeur (Vercel Pro vs Cloudflare Pages vs alternatives)
- Application du mapping `transport → travel` côté backend (`apps/auth_bridge/_email_urls.py`)

---

## 1. Contexte initial

donpk a démarré la session en partant d'une intuition erronée : déployer 18 repositories GitHub (9 secteurs × dev/prod) sur Vercel pour 18 déploiements indépendants. Cette intuition cachait une **peur légitime** : éviter de casser la prod en pushant en dev.

La session a permis de **dérouler le bon mental model** :
- 1 seul repo Git mono = source de vérité unique
- 2 branches Git = 2 environnements logiques (preview / prod)
- N projets Vercel = N secteurs déployés indépendamment
- Variables d'env Vercel par projet × par scope = isolation propre

Cette compréhension a déclenché la suite des décisions techniques.

---

## 2. Décisions techniques prises

### 2.1 Architecture de déploiement

| Question | Décision | Rationale |
|---|---|---|
| Combien de repos GitHub ? | **1 seul** (`dev_agt_assist_final`) | Évite divergences silencieuses entre dev et prod, source unique de vérité |
| Combien de branches ? | **2** : `develop` + `main` | Séparation preview / production sans duplication de code |
| Combien de projets Vercel ? | **10** (1 par secteur : hub + 9 secteurs) | Chaque sous-domaine = 1 projet Vercel avec ses propres env vars |
| Méthode de merge develop → main | `git checkout main && git merge develop && git push origin main` | Méthode B (CLI local, pas de PR) — choix de donpk pour la simplicité solo |
| Protection branche `main` | **NON** | donpk veut pouvoir push en urgence sans friction |
| DNS dev custom | **OUI** (`dev-{secteur}.agt-bot.com`) | Test en conditions proches de la prod (donpk : *"pas le même OAuth partout en dev pour qu'au push prod tout marche"*) |
| Clients OAuth | **20 au total** : 10 dev + 10 prod | Isolation prod/dev par secteur, anticipe les besoins de Google Cloud Console |

### 2.2 Domaines sectoriels

Audit du code a révélé une **incohérence préexistante** sur le secteur transport :

| Source | Valeur trouvée |
|---|---|
| `SUBDOMAIN_MAP` (`sector-config.ts`) | `travell` (2L, faute de frappe) |
| `SECTOR_URLS` (`constants.ts`) | `transport.agt-bot.com` |
| SEO sitemap (`page.tsx`) | `transport.agt-bot.com` |
| `TODO_TEST_DEBUG_AGT.md` | `travell.agt-bot.com` |

**Décision donpk :** `travel.agt-bot.com` (1L, anglais correct, recommandation Claude).

**Implication :** le mapping `transport → travel` doit être propagé côté backend (`apps/auth_bridge/_email_urls.py`) pour que les liens d'email atterrissent au bon endroit. Cette modification backend a été **différée** : le code frontend prêt à l'activer (ligne commentée dans `SECTOR_SUBDOMAIN_OVERRIDES`), à décommenter une fois le backend aligné.

### 2.3 Méthode de bascule dev → prod

Choix donpk : **Méthode B (CLI locale)**.

```bash
# Quand develop est validé en preview
git checkout main
git pull origin main
git merge develop
git push origin main   # → Vercel déploie la prod automatiquement
```

**Décliné** : Méthode A (PR via GitHub UI) → donpk préfère le CLI direct.
**Décliné** : Méthode C (PR via `gh` CLI) → idem.

Note Claude : si l'équipe grandit, basculer vers Méthode C avec protection `main` pour éviter qu'un junior pousse cassé.

---

## 3. Travail accompli

### 3.1 Phase 0 — §0.1 Audit Git ✅

- Repo `dev_agt_assist_final` confirmé sur `github.com/admin-agtechnologies/`
- `git remote -v` : 1 seul remote `origin`
- Branche `develop` créée et trackée : `git checkout -b develop && git push -u origin develop`
- `.gitignore` validé : exclut `.env`, `.env.local`, `.env.*.local`
- Aucun secret fuité dans l'historique : `git log --all -p | Select-String "GOCSPX-|client_secret|sk_live_"` retourne vide ✅
- Modification `.gitignore` suspecte (Git voyait le fichier comme "binaire") : **stashée** pour ne pas bloquer, à réinspecter en S+1

### 3.2 Phase 0 — §0.2 Suppression `.env.{secteur}` ✅

10 fichiers supprimés du repo (`.env.banking`, `.env.clinical`, `.env.custom`, `.env.ecommerce`, `.env.hotel`, `.env.pme`, `.env.public`, `.env.restaurant`, `.env.school`, `.env.transport`).

**Vérification préalable :** confirmé que ces fichiers n'étaient lus par aucun script (`scanner.ps1` les exclut explicitement via `.env*`, et `package.json` injecte `NEXT_PUBLIC_SECTOR` via `cross-env`).

**Sauvegarde du client OAuth :** le `NEXT_PUBLIC_GOOGLE_CLIENT_ID` qui était dans `.env.restaurant` est désormais dans `.env.local` (gitignored).

**Commit :** `247011a` — `chore(env): remove obsolete per-sector .env files`
**Push :** `develop` ✅

### 3.3 Phase 0 — §0.3 Correction `.env.local` ✅

Doublon `NEXT_PUBLIC_API_URL` (une ligne `localhost:8011` et une `dev-api.agt-bot.com`) résolu. État actuel :
- Une seule ligne `NEXT_PUBLIC_API_URL=https://dev-api.agt-bot.com` non commentée
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` présent
- `NEXT_PUBLIC_FRONTEND_BASE=` ajouté (vide → fallback dev local)

### 3.4 Phase 0 — §0.4 Refactor `SECTOR_URLS` → `getSectorUrl()` ✅ (code) / ⏳ (commit)

**Problème résolu :** `SECTOR_URLS` était hard-codé avec des `http://localhost:300x` dans `constants.ts`. En prod, ces URLs auraient leak dans le bundle JS → hub Vercel aurait redirigé les users sur localhost. 100% cassé.

**Solution livrée :** une fonction unique `getSectorUrl(slug)` qui :
- En dev (`NEXT_PUBLIC_FRONTEND_BASE` vide) → fallback `http://localhost:{port}` (comportement identique à avant)
- En prod (`NEXT_PUBLIC_FRONTEND_BASE` défini) → construit `https://{subdomain}.{host}` dynamiquement
- Gère les cas spéciaux (`ecommerce` → `e-commerce`, hub → apex sans sous-domaine, `custom` → `/onboarding`)

**Pattern réutilisé :** la nouvelle fonction lit `NEXT_PUBLIC_FRONTEND_BASE` qui était **déjà** créée par donpk en S5. Aucun doublon de variable d'env. Aucune nouvelle dette.

**Fichiers livrés :**

| # | Fichier | Action | Lignes |
|---|---|---|---|
| 1 | `src/lib/env.ts` | Modifié — ajout `FRONTEND_BASE` | 22 |
| 2 | `src/lib/sector-urls.ts` | **NOUVEAU** — source de vérité unique | 105 |
| 3 | `src/lib/constants.ts` | Modifié — suppression `SECTOR_URLS` et `SectorKey` | 137 |
| 4 | `src/lib/sector-redirect.ts` | Modifié — utilise `getSectorUrl()` | 87 |
| 5 | `src/app/_components/landing/LandingData.ts` | Patch ciblé — re-export `getSectorUrl` | — |
| 6 | `src/app/_components/landing/SectorsSection.tsx` | Patch ciblé — alias `getSectorHref` | — |

**Tous les fichiers < 200 lignes ✅. Pattern existant respecté ✅. Aucune dette technique ajoutée ✅.**

**Validation :**
- `npm run build` avec `NEXT_PUBLIC_SECTOR=restaurant` → **succès** (48 pages générées, zéro erreur TypeScript)
- Aucune référence à `SECTOR_URLS` restante dans `src/` (vérifié par `Select-String`)

**État commit :** **⏳ NON COMMITÉ** au moment de la rédaction de ce rapport. donpk doit lancer :

```powershell
git add -A
git status   # vérifier la liste
git commit -m "refactor(sector-urls): replace hard-coded SECTOR_URLS with env-driven getSectorUrl()"
git push origin develop
```

**À faire dès la fin de session.** Sinon le travail des dernières heures n'est pas sauvegardé sur GitHub.

### 3.5 TODO de déploiement Vercel produite

Document `TODO_DEPLOYMENT_VERCEL_v2.md` créé (livré en téléchargement). Couvre :
- Phase 0 : préreq local & nettoyage
- Phase 1-2 : compte Vercel + projet Restaurant pilote
- Phase 3 : OAuth Google
- Phase 4-6 : Hub + DNS
- Phase 7 : 8 secteurs restants
- Phase 8-11 : synchro backend, monitoring, rollback, Go/No-Go

---

## 4. Découverte importante sur les conditions d'hébergement

### 4.1 Vérification du type de compte GitHub

donpk a vérifié `github.com/admin-agtechnologies` via le navigateur. Indices observés :
- Avatar rond (= compte perso, pas org)
- Onglets : Overview, Repositories, Projects, Packages, Stars (PAS de "People" ni "Teams")
- Calendrier de contributions présent (= compte perso)
- "Created 1,046 commits in 23 repositories" + bouton "Follow"

**Verdict définitif :** `admin-agtechnologies` est un **compte personnel GitHub**, pas une organisation.

**Note Claude :** j'avais initialement présumé que c'était une org (à cause du préfixe `admin-`). C'était une **inférence non vérifiée**. À éviter à l'avenir : poser la question avant de présumer.

### 4.2 Conséquence : Hobby techniquement utilisable mais légalement interdit

| Critère | Résultat |
|---|---|
| Vercel Hobby acceptera le repo techniquement ? | ✅ OUI (pas une org) |
| Vercel Hobby autorisé pour AGT légalement ? | ❌ NON |

**Raison :** AGT vend des abonnements commerciaux (Starter 10k, Pro 25k, Premium 75k, Gold 150k XAF). Le plan Hobby est restreint à un usage non-commercial strict. Toute détection d'usage commercial (formulaires de paiement Mobile Money visibles, abonnements actifs, etc.) peut entraîner une suspension de compte sans préavis.

**Risques supplémentaires Hobby :**
- Hard cap : app passe offline si quota dépassé (100 GB bandwidth/mois partagés entre les 10 secteurs)
- 1 seul developer seat (pas de partage de gestion avec l'équipe)
- Logs runtime de 1h seulement

### 4.3 Idée écartée : "2 repos pour éviter Pro"

donpk a évoqué l'option de revenir à 2 repos (dev + prod) si Hobby ne marchait pas. **Cette option a été écartée** parce qu'elle ne résout pas le problème de fond (commercial). Avec 2 repos sur Hobby, on viole quand même les ToS Vercel — juste avec 2 violations au lieu d'une.

### 4.4 Stratégie recommandée pour S20

**Test gratuit puis upgrade Pro avant exposition publique :**

1. Créer un compte Vercel Hobby (gratuit, sans CB)
2. Importer le repo + 1 projet pilote (Restaurant) en preview
3. Valider que le pipeline marche (build, OAuth, API)
4. **Avant d'attribuer un DNS public** (`restaurant.agt-bot.com`), upgrade vers Pro ($20/mois)
5. Configurer un spend limit ferme pour ne jamais dépasser le budget

**$20/mois = 12 000 XAF/mois ≈ 1 abonnement Starter d'un client AGT.** Économiquement marginal à l'échelle de la plateforme.

**Décision finale reportée à S20** sur instruction de donpk.

---

## 5. Bugs identifiés (rien de bloquant côté code)

| ID | Description | Sévérité | Statut |
|----|-------------|----------|--------|
| BUG-S20-mineur-01 | `.gitignore` git voit comme "binaire" (probable BOM UTF-16 ou encoding Windows-1252) | Cosmétique | Stashé, à réinspecter S20 |
| BUG-S20-mineur-02 | `.env.restaurant` contenait des caractères mal encodés (`â†'`, `dÃ©finir`) | Résolu par suppression | Fermé |
| Incohérence préexistante | Slug `transport` vs `travell.agt-bot.com` vs `transport.agt-bot.com` selon le fichier | Conception | Décidé : `travel.agt-bot.com`, à propager backend |

Aucun bug bloquant pour avancer en S20.

---

## 6. Dette technique acceptée / créée

### Dette créée

**DETTE-S20-01 — Alignement backend pour `transport → travel`**

Le mapping `transport → travel` est commenté dans `sector-urls.ts` (ligne 47) tant que `apps/auth_bridge/_email_urls.py` côté backend n'est pas mis à jour. Sinon, les liens d'email de vérification atterriront sur un sous-domaine qui n'existe pas.

**Action à effectuer en S20 (ou plus tard) :**
1. Modifier `apps/auth_bridge/_email_urls.py` → `SECTOR_DEV_BASES` et fonctions liées
2. Décommenter la ligne 47 de `src/lib/sector-urls.ts`
3. Test E2E : créer un user `transport`, recevoir l'email, cliquer, atterrir sur la bonne URL

**Coût estimé :** 1h max (frontend + backend + test).

### Dette acceptée (héritée)

**TECH-S5-XX (déjà acceptée S5)** — La rétrocompatibilité `theme.label` à migrer plus tard. Non touchée par cette session.

---

## 7. État précis fin de session

### Ce qui est validé ✅

- Mono-repo + 2 branches Git en place
- 10 `.env.{secteur}` supprimés, commit pushé
- `.env.local` clean (1 seule ligne `API_URL`, ajout `FRONTEND_BASE`)
- Refactor `SECTOR_URLS → getSectorUrl()` codé et buildé sans erreur
- Type GitHub du compte vérifié (perso, pas org)
- TODO de déploiement complète produite

### Ce qui est en attente immédiate (dès fin de session) ⏳

- **Commit + push du refactor sur `develop`** — donpk doit lancer `git add -A && git commit && git push` avant de fermer son PC
- **Test fonctionnel hub → restaurant** — `npm run dev:hub`, vérifier que clic sur card Restaurant redirige bien vers `localhost:3001`

### Ce qui est reporté à S20 ⏳⏳

- Décision finale hébergeur (Vercel Pro vs Cloudflare vs autre)
- Création du compte Vercel
- Phase 1-11 de la TODO de déploiement
- Alignement backend `transport → travel`
- Réinspection du `.gitignore` stashé

---

## 8. Plan d'action S20

### Ordre proposé

1. **Étape 0 (5 min)** — Récap : confirmer commit du refactor pushé, validation test fonctionnel
2. **Étape 1 (10 min)** — Trancher choix d'hébergeur définitif (Vercel Pro vs Cloudflare)
3. **Étape 2 (1h)** — Si Vercel Pro : créer compte, importer repo, projet pilote Restaurant en preview
4. **Étape 3 (30 min)** — Backend : aligner `_email_urls.py` pour `transport → travel`, décommenter override frontend
5. **Étape 4 (30 min)** — Créer 1er client OAuth Google dev pour Restaurant, injecter dans Vercel
6. **Étape 5 (15 min)** — Smoke tests preview Restaurant (URL Vercel auto, pas encore de DNS)

**Objectif S20 :** finir avec **1 projet Vercel preview fonctionnel** pour Restaurant. Pas de DNS public. Pas de prod. Juste valider toute la chaîne sur 1 secteur avant de répliquer.

### Risques anticipés S20

- Si CORS backend pas configuré pour `*.vercel.app` → erreurs preflight au premier fetch. Anticiper avant de tester.
- Si donpk choisit Cloudflare Pages au lieu de Vercel → refonte partielle de la TODO de déploiement (Cloudflare a un système d'env vars différent).
- `dev-api.agt-bot.com` et `prod-api.agt-bot.com` doivent être confirmés accessibles avant de démarrer.

---

## 9. Prompt de début de S20 (à copier-coller dans nouvelle conversation)

```
Tu es l'assistant de développement d'AGT Platform. Tu travailles avec donpk.
[... règles habituelles AGT en début de prompt ...]

CONTEXTE S20 — DÉPLOIEMENT FRONTEND VERCEL

Session précédente (S20) :
- Phase 0 quasi terminée : refactor SECTOR_URLS → getSectorUrl() en place, mono-repo confirmé, branches develop/main en place
- Décision hébergeur reportée à cette session (S20)
- Compte GitHub `admin-agtechnologies` confirmé COMPTE PERSO (pas une org)
- Vercel Hobby techniquement utilisable mais commercial interdit → Vercel Pro recommandé

Documents à lire EN PREMIER :
1. docs/reports/session_18_donpk.md (rapport de S20, source de vérité)
2. TODO_DEPLOYMENT_VERCEL_v2.md (TODO maître pour le déploiement)
3. INDEX.md (vérifier les zones touchées par les autres membres)

Décisions actées en S20 (NE PAS rediscuter sauf demande explicite) :
- 1 repo + 2 branches develop/main
- 10 projets Vercel (1 par secteur)
- transport → travel.agt-bot.com (1L)
- DNS dev custom (dev-{secteur}.agt-bot.com)
- 1 OAuth par secteur × env (20 clients à créer)
- Méthode merge develop → main : checkout + merge local (pas de PR)

À TRANCHER EN OUVERTURE DE S20 :
1. Choix hébergeur définitif : Vercel Pro (recommandé) / Cloudflare Pages / autre ?
2. Confirmer que le commit refactor SECTOR_URLS a bien été pushé en fin de S20

PLAN D'ACTION S20 :
1. Trancher choix hébergeur
2. Aligner backend `apps/auth_bridge/_email_urls.py` pour transport → travel
3. Décommenter ligne 47 de src/lib/sector-urls.ts
4. Créer compte Vercel + 1er projet pilote (Restaurant) en preview
5. Smoke tests preview Restaurant

Avant de démarrer, dis-moi :
1. Sur quel hébergeur on part définitivement ?
2. Le commit du refactor S20 est-il pushé sur develop ? (Vérification : git log -3 develop)
```

---

## 10. Notes méta — leçons de communication

Pour ma propre amélioration en S+1 :

1. **Ne pas présumer sans vérification.** Je t'ai annoncé "🔴 BLOQUANT : c'est une org" sur la base du nom `admin-agtechnologies` sans demander à voir. Tu as eu raison de challenger. À l'avenir : poser la question avant d'affirmer un fait technique vérifiable.

2. **Distinguer "technique" et "contractuel".** Cette session a montré qu'un point peut être techniquement OK mais légalement interdit (Hobby + usage commercial). Bien expliciter cette distinction quand elle existe.

3. **Le "test → upgrade" est un pattern utile.** Quand un user hésite sur un payant, lui montrer qu'il peut valider gratuitement avant de payer. Ça lève la friction décisionnelle sans engager un mauvais choix.

---

*Fin du rapport S20.*