# Rapport de session — session_20_donpk

## Métadonnées

- **Membre :** donpk
- **Date :** 2026-05-14
- **Type de session :** Déploiement — Premier secteur frontend sur Vercel (Restaurant)
- **Durée estimée :** ~4h
- **Statut :** Restaurant en PRODUCTION sur `restaurant.agt-bot.com` ✅

---

## Objectif de la session

Déployer le premier secteur frontend (Restaurant) sur Vercel en production, en continuité de la S19 (préparation du code : refactor `getSectorUrl()`, nettoyage `.env`, mono-repo + 2 branches).

---

## Ce qui a été fait

1. **Vérification commit S19** — Confirmé que le refactor `SECTOR_URLS → getSectorUrl()` (commit `cf44191`) était bien poussé sur `origin/develop`.

2. **Décisions d'ouverture S20 actées** — Hébergeur Vercel Hobby, architecture preview→dev / prod→prod, annulation migration `travel`, pilotes Restaurant + Hub.

3. **Vérification `sector-urls.ts`** — Confirmé que la ligne 45 (`transport: 'travel'`) est bien commentée. Le slug `transport` reste actif, la migration `travel` est prête à activer par simple décommentage.

4. **Smoke test local** — `npm run dev:hub` → clic carte Restaurant → redirige vers `localhost:3001` ✅.

5. **Upgrade Next.js 14.2.5 → 14.2.35** — Le build Vercel échouait avec `ENOENT: page_client-reference-manifest.js`. Résolu en 2 étapes :
   - Mise à jour `package.json` : `"next": "^14.2.28"` → résolution vers 14.2.35
   - Régénération `package-lock.json` via `npm install`
   - Commit `a018938` sur `develop`.

6. **Suppression `src/app/(dashboard)/page.tsx`** — Ce fichier créait un conflit de route avec `src/app/page.tsx` (landing) sur `/` et déclenchait un bug Vercel connu (manifest non généré pour les route groups avec page.tsx à la racine). Le vrai dashboard (`/dashboard`) est dans `(dashboard)/dashboard/page.tsx` et reste intact.
   - Commit `069621c` sur `develop`.

7. **Merge `develop → main` + push** — Fast-forward `9a528ee..069621c`. Vercel a détecté le push et déclenché le Production build.

8. **Premier build Vercel réussi** — Next.js 14.2.35, 48 pages, 0 erreur, `agt-restaurant.vercel.app` accessible.

9. **Configuration variables d'env Vercel** — 8 variables au total (4 Production + 4 Preview) :
   - Production : `NEXT_PUBLIC_SECTOR=restaurant`, `NEXT_PUBLIC_API_URL=https://prod-api.agt-bot.com`, `NEXT_PUBLIC_FRONTEND_BASE=https://agt-bot.com`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID=<placeholder>`
   - Preview : `NEXT_PUBLIC_SECTOR=restaurant`, `NEXT_PUBLIC_API_URL=https://dev-api.agt-bot.com`, `NEXT_PUBLIC_FRONTEND_BASE=https://dev.agt-bot.com`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID=<placeholder>`

10. **Ajout domaine custom `restaurant.agt-bot.com`** — DNS CNAME déjà configuré chez Hostinger (précédemment). Vercel a validé instantanément → "Valid Configuration" ✅.

11. **Test prod** — `https://restaurant.agt-bot.com` affiche la landing Restaurant avec thème orange, console propre, zéro erreur bloquante ✅.

---

## Décisions prises

| Décision | Rationale |
|----------|-----------|
| Hébergeur : **Vercel Hobby** (gratuit) | Pas de budget immédiat. Risque ToS commercial accepté explicitement par donpk. |
| Backend : **preview→dev-api / prod→prod-api** | Architecture standard, évite pollution BDD prod par tests preview. |
| Backend : **NON modifié en S20** | Repo backend local pas à jour, version en ligne stable. Devops à alerter plus tard. |
| Slug transport : **reste `transport.agt-bot.com`** | Annulation de la migration vers `travel` (S19). Ligne 45 de `sector-urls.ts` reste commentée pour future activation. |
| DNS pattern prod : **`secteur.agt-bot.com`** | Standard, `NEXT_PUBLIC_FRONTEND_BASE=https://agt-bot.com` identique partout. |
| DNS pattern preview : **`secteur.dev.agt-bot.com`** | `NEXT_PUBLIC_FRONTEND_BASE=https://dev.agt-bot.com`. DNS à créer chez Hostinger. |
| DNS : **Option B — manuels chez Hostinger** | donpk préfère garder Hostinger comme fournisseur DNS (pas de transfert NS vers Vercel). |
| Suppression `(dashboard)/page.tsx` | Conflit de route avec `app/page.tsx` + bug Vercel manifest. Le vrai dashboard (`/dashboard`) reste intact. |
| Upgrade Next.js 14.2.5 → 14.2.35 | Fix bug ENOENT manifest + correctifs sécurité. |
| OAuth : **placeholder temporaire** | Client OAuth dev partagé utilisé en placeholder. Vrais clients dédiés par secteur × env à créer en Phase 3 quand les DNS seront actifs. |

---

## Difficultés rencontrées

1. **Build Vercel ENOENT `page_client-reference-manifest.js`** — Bug Vercel connu avec les route groups contenant un `page.tsx` à la racine. Résolu par suppression du fichier + upgrade Next.js.
2. **`npm ci` échoue** — `package.json` avait `"next": "^14.2.28"` mais `package-lock.json` figé sur 14.2.5. Résolu par `npm install` (régénération lock file).
3. **`npm install` EBUSY** — Fichier `next-swc` verrouillé par un processus Next.js en cours. Résolu en fermant tous les terminaux + `Remove-Item node_modules` + `npm install`.
4. **Git checkout bloqué par fichier modifié** — `TODO deploiement vercel.md` non commité empêchait `git checkout main`. Résolu par `git stash` / `git stash pop`.

---

## Problèmes résolus

| ID | Description | Solution | Fichiers |
|----|-------------|----------|----------|
| BUG-S20-01 | Build Vercel ENOENT manifest pour route group `(dashboard)` | Suppression `src/app/(dashboard)/page.tsx` + upgrade Next.js 14.2.35 | `package.json`, `package-lock.json`, `src/app/(dashboard)/page.tsx` (supprimé) |

---

## Zones du code touchées

```
src/app/(dashboard)/page.tsx    ← SUPPRIMÉ (fix Vercel build)
package.json                    ← next 14.2.5 → 14.2.35
package-lock.json               ← régénéré
next-env.d.ts                   ← modifié auto par Next.js
TODO deploiement vercel.md      ← ajusté
```

---

## Fichiers créés / modifiés

| Fichier | Action |
|---------|--------|
| `src/app/(dashboard)/page.tsx` | **SUPPRIMÉ** — fix bug Vercel manifest |
| `package.json` | Modifié — `next` 14.2.5 → ^14.2.28 (résolu 14.2.35) |
| `package-lock.json` | Régénéré |
| `next-env.d.ts` | Modifié auto par Next.js |
| `TODO deploiement vercel.md` | Modifié |

---

## Commits de la session

| Hash | Message | Branche |
|------|---------|---------|
| `a018938` | `chore(deps): upgrade next 14.2.5 → 14.2.35 (fix Vercel build ENOENT manifest)` | develop → main |
| `069621c` | `fix(vercel): remove route-group root page.tsx causing ENOENT manifest error on Vercel build` | develop → main |

---

## État de déploiement fin de session

| Projet Vercel | Domaine prod | Statut | Domaine preview | Statut |
|---|---|---|---|---|
| `agt-restaurant` | `restaurant.agt-bot.com` | ✅ EN LIGNE | `restaurant.dev.agt-bot.com` | ⏳ DNS à créer chez Hostinger |
| `agt-hub` | `agt-bot.com` | ⏳ Projet non créé | `dev.agt-bot.com` | ⏳ |
| 8 autres secteurs | — | ⏳ | — | ⏳ |

---

## Dettes techniques actives

| ID | Description | Impact | Coût | Priorité |
|----|-------------|--------|------|----------|
| **DETTE-S19-01** | Alignement backend `transport → travel` (ligne 45 `sector-urls.ts` commentée) | Aucun tant qu'on reste sur `transport` | 1h (front + back + test) | Basse — quand repo backend à jour |
| **DETTE-S20-01** | `.env.example` manquant | Nouveau dev doit deviner les variables | 5 min | Basse |
| **DETTE-S20-02** | `SUBDOMAIN_MAP` mentionne encore `travell` dans `sector-config.ts` | Aucun fonctionnel (mapping mort) | 2 min | Cosmétique — à nettoyer avec DETTE-S19-01 |
| **DETTE-S20-03** | DNS Hostinger : `travell` créé au lieu de `transport` | Mauvais sous-domaine quand on déploiera Transport | Renommer CNAME chez Hostinger | À faire avant déploiement Transport |
| **DETTE-S20-04** | DNS preview (`*.dev.agt-bot.com`) non créés chez Hostinger | Preview builds inaccessibles via domaine custom | Créer CNAME chez Hostinger | S21 |
| **DETTE-S20-05** | OAuth : placeholder partagé au lieu de clients dédiés par secteur × env | Google login ne fonctionne pas sur les domaines custom | Créer 20 clients OAuth dans Google Cloud Console | Phase 3 TODO Vercel |
| **DETTE-S20-06** | DNS manquants chez Hostinger : `banking`, `pme`, `public`, `ecommerce` | Pas de DNS prêt pour ces secteurs | Créer les CNAME | Avant déploiement de chaque secteur |
| Héritée S5 | `theme.label` rétrocompat à migrer | Cosmétique | Faible | Reportée indéfiniment |

---

## DNS existants chez Hostinger (constatés en S20)

| Type | Name | Points to | Utilisable pour |
|------|------|-----------|-----------------|
| CNAME | `www` | `...vercel-dns-017.com` | Hub prod ✅ |
| CNAME | `restaurant` | `...vercel-dns-017.com` | Restaurant prod ✅ (ACTIVÉ en S20) |
| CNAME | `school` | `...vercel-dns-017.com` | School prod (futur) |
| CNAME | `travell` | `...vercel-dns-017.com` | ⚠️ À renommer `transport` (DETTE-S20-03) |
| CNAME | `hotel` | `...vercel-dns-017.com` | Hotel prod (futur) |
| CNAME | `clinical` | `...vercel-dns-017.com` | Clinical prod (futur) |
| A | `dev-api` | `187.77.167.137` | Backend dev ✅ |

**DNS manquants pour prod :** `banking`, `pme`, `public`, `ecommerce` (ou `e-commerce`)
**DNS manquants pour preview :** tous (`dev`, `restaurant.dev`, etc.)

---

## TODO de déploiement — Points à ajuster dans `TODO_DEPLOYMENT_VERCEL_v2.md`

| Section | Correction |
|---------|------------|
| Phase 0 | Marquer §0.1 à §0.4 comme `[x]` fait |
| Phase 0.4 | Supprimer la mention de `NEXT_PUBLIC_USE_SUBDOMAINS` (pas utilisé, remplacé par `NEXT_PUBLIC_FRONTEND_BASE`) |
| Phase 0.5 | Marquer build Restaurant et Hub comme `[x]` |
| Phase 7 ligne Transport | Remplacer `travell.agt-bot.com` par `transport.agt-bot.com` |
| Annexe A ligne Transport | Idem |

---

## Plan d'action S21

### Ordre proposé

| # | Étape | Durée estimée |
|---|-------|---------------|
| 1 | **Rappel dettes** — Lister DETTE-S19-01 à DETTE-S20-06 | 2 min |
| 2 | **Preview Restaurant** — Créer DNS `restaurant.dev.agt-bot.com` chez Hostinger + ajouter domaine Preview dans Vercel + trigger preview build (`git push develop` ou commit vide) + smoke test | 20 min |
| 3 | **Hub prod** — Créer projet `agt-hub` sur Vercel + env vars (Production + Preview) + deploy + ajouter domaine `agt-bot.com` (apex) + DNS | 30 min |
| 4 | **Hub preview** — DNS `dev.agt-bot.com` chez Hostinger + ajouter domaine Preview dans Vercel + test | 15 min |
| 5 | **Test cross-projet** — Hub prod → clic carte Restaurant → redirige vers `restaurant.agt-bot.com` | 10 min |
| 6 | **8 secteurs restants** — Pattern mécanique identique à Restaurant (créer projet + env vars + deploy + DNS). Ordre : hotel, school, clinical, banking, ecommerce, pme, public, transport | 2-3h |
| 7 | **Mise à jour TODO** — Cocher les phases terminées, corriger les erreurs identifiées | 15 min |

### Risques anticipés S21

- **CORS backend** : si `prod-api.agt-bot.com` n'autorise pas `https://restaurant.agt-bot.com` en origin, les appels API échoueront. À vérifier en ouvrant `restaurant.agt-bot.com/login` et en regardant l'onglet Network/Console.
- **DNS apex `agt-bot.com`** : l'apex nécessite un enregistrement **A** (pas CNAME) pointant vers `76.76.21.21` (IP Vercel). Si Hostinger a déjà un A record sur `@`, il faudra le modifier.
- **Hostinger CNAME `e-commerce`** : vérifier si Hostinger accepte un tiret dans le nom du CNAME (pour `e-commerce.agt-bot.com`). Si non, on devra ajuster le mapping frontend.

---

## Prompt de début de S21 (à copier-coller)

```
Tu es l'assistant de développement d'AGT Platform. Tu travailles avec donpk et son équipe.
Lis attentivement ces règles et applique-les strictement à chaque session.

### AUTORITÉ & INITIATIVE
- Tu respectes strictement la TODO (TODO_TEST_DEBUG_AGT.md). Tu ne t'en écartes pas sans accord explicite.
- Tu ne prends aucune initiative sans me demander d'abord.
- En cas d'ambiguïté, tu poses une question avant d'agir. Tu ne suppose rien.
- Tu proposes, je décide. Toujours.

### QUALITÉ & DETTE TECHNIQUE
- Toujours les meilleurs choix techniques, jamais de raccourcis pour avancer vite.
- Zéro dette technique acceptée sans décision explicite de ma part.
- Respecte strictement les patterns et bonnes pratiques existants du projet.

### TAILLE DES FICHIERS
- Aucun fichier de plus de 200 lignes (tolérance : ±50).

### GÉNÉRATION DE CODE
- Tâches de génération (nouveau code) : tu peux proposer des blocs de 5 à 15 fichiers à la fois.
- Tâches de débogage : maximum 5 fichiers par itération, étape par étape.
- Pour les modifications simples (< 5 lignes) : fournis uniquement les diffs.
- Pour les modifications longues : fournis les fichiers complets.
- Pour toute modification backend : explique d'abord le problème simplement, propose la solution, et attends mon OK explicite.

### GESTION DU CONTEXTE
- Si le contexte devient lourd, signale-le et suggère de clore la session.
- C'est moi qui ai le dernier mot sur le moment de clore.

### PARALLÉLISATION & CONFLITS
- Au début de chaque session, lis INDEX.md pour identifier les zones déjà traitées.
- Si conflit potentiel, signale immédiatement.

### RAPPORT DE SESSION
- En fin de session, rapport nommé session_{N}_{membre}.md dans docs/reports/.
- Ajouter une entrée à INDEX.md (APPEND ONLY).

---

CONTEXTE S21 — DÉPLOIEMENT FRONTEND VERCEL (suite)

Session précédente (S20) :
- Restaurant en PRODUCTION sur `restaurant.agt-bot.com` ✅
- Build Vercel réussi (Next.js 14.2.35, 48 pages, 0 erreur)
- Bug `(dashboard)/page.tsx` corrigé (suppression fichier → fix manifest Vercel)
- Variables d'env Vercel configurées (Production + Preview scopes)
- DNS Hostinger `restaurant` → Vercel déjà en place (préexistant)
- OAuth : placeholder partagé en attendant clients dédiés (Phase 3)

Décisions actées en S20 (NE PAS rediscuter) :
- Vercel Hobby — risque ToS commercial accepté
- 1 repo + 2 branches develop/main
- preview→dev-api / prod→prod-api (standard)
- transport.agt-bot.com (PAS travel, PAS travell) — ligne 45 commentée dans sector-urls.ts
- DNS manuels chez Hostinger (Option B, pas de transfert NS vers Vercel)
- NEXT_PUBLIC_FRONTEND_BASE = https://agt-bot.com (prod) / https://dev.agt-bot.com (preview)
- 10 projets Vercel (1 par secteur)
- OAuth : 1 client par secteur × env (20 à créer, placeholder en attendant)

DETTES TECHNIQUES À RAPPELER EN DÉBUT DE SESSION :
- DETTE-S19-01 : Alignement backend transport → travel (quand repo backend à jour)
- DETTE-S20-01 : .env.example manquant (5 min)
- DETTE-S20-02 : SUBDOMAIN_MAP mentionne encore travell (cosmétique)
- DETTE-S20-03 : DNS Hostinger travell au lieu de transport (à renommer)
- DETTE-S20-04 : DNS preview (*.dev.agt-bot.com) non créés
- DETTE-S20-05 : OAuth placeholder au lieu de clients dédiés
- DETTE-S20-06 : DNS manquants pour banking, pme, public, ecommerce

Documents de référence :
1. docs/reports/session_20_donpk.md (ce rapport)
2. TODO_DEPLOYMENT_VERCEL_v2.md (TODO maître)
3. INDEX.md (conflits)

PLAN D'ACTION S21 :
1. Preview Restaurant : DNS restaurant.dev.agt-bot.com + config Vercel + test
2. Hub prod : projet agt-hub + env vars + deploy + DNS agt-bot.com (apex A record)
3. Hub preview : DNS dev.agt-bot.com + test
4. Test cross-projet : Hub → clic Restaurant → restaurant.agt-bot.com
5. 8 secteurs restants (pattern mécanique identique)
6. Mise à jour TODO

RISQUES ANTICIPÉS :
- CORS backend : vérifier que prod-api autorise *.agt-bot.com
- DNS apex : agt-bot.com nécessite un A record (76.76.21.21), pas un CNAME
- DNS e-commerce : vérifier que Hostinger accepte un tiret dans le sous-domaine

Avant de démarrer, confirme :
1. Le CORS backend est-il configuré pour accepter https://*.agt-bot.com ?
2. Tu veux qu'on commence par Preview Restaurant ou Hub prod ?
```

---

## Notes méta — leçons de la session

1. **Toujours merger `develop → main` avant de déployer.** On a perdu 15 min parce que le premier build Vercel utilisait `main` qui était 2 commits en retard. Le rapport S19 le signalait mais on l'a oublié.

2. **Les route groups Next.js `(xxx)/page.tsx` sont un piège Vercel.** Le build local passe mais le tracing Vercel échoue. Bug documenté mais pas encore corrigé upstream. À retenir pour tout futur route group.

3. **`npm install` après modification de `package.json` est obligatoire.** Modifier la version dans `package.json` sans régénérer `package-lock.json` casse `npm ci` (utilisé par Vercel).

4. **Vérifier les DNS Hostinger en début de session.** donpk avait déjà créé les CNAME — on ne le savait pas. 10 min gagnées si on avait vérifié plus tôt.

5. **Le contexte de conversation atteint sa limite vers 20-25 échanges techniques.** Signaler et proposer de clore dès le 15ème échange dense.