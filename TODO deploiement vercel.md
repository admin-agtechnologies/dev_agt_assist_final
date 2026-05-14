# TODO — Déploiement Frontend AGT Platform sur Vercel (v2 — finale)

> **Décisions actées :**
> - Architecture : **1 repo GitHub mono** (`dev_agt_assist_final`) → **N projets Vercel** (un par secteur).
> - Branches : `develop` = preview/staging, `main` = production.
> - Backend déployé : `https://dev-api.agt-bot.com` (dev) + `https://prod-api.agt-bot.com` (prod).
> - Pilote : Restaurant preview → Hub preview → DNS prod Restaurant → DNS prod Hub → 8 secteurs restants.
> - Injection secteur : via `NEXT_PUBLIC_SECTOR` configuré dans Vercel UI (pas via `.env.{secteur}`).

## Légende checkboxes

| `[ ]` à faire · `[x]` fait & vérifié · `[~]` en cours · `[!]` bloquant |

---

# Phase 0 — Préreq local & nettoyage

## 0.1 Audit Git & repo

- [ ] Repo `dev_agt_assist_final` à jour sur GitHub
- [ ] Branche `main` existe et stable
- [ ] Branche `develop` existe (créer si absente : `git checkout -b develop main && git push -u origin develop`)
- [ ] `.gitignore` exclut `.env`, `.env.local`, `.env.*.local`, `node_modules`, `.next`
- [ ] **Vérification secrets fuités** : `git log --all -p | grep -iE "GOCSPX|client_secret|sk_live"` → aucun résultat sensible
- [ ] Si secrets commités historiquement : rotation immédiate côté Google + nouvelle paire de clés

## 0.2 Nettoyage des fichiers `.env.{secteur}` obsolètes

> **Constat S18 :** ton `package.json` injecte `NEXT_PUBLIC_SECTOR` via `cross-env` directement dans chaque script `dev:{secteur}`. Les 8 fichiers `.env.{secteur}` à la racine ne sont **jamais lus** par Next.js (qui ne lit que `.env.local`). Ils créent de la confusion et risquent de leaker des credentials.

- [ ] Lister les `.env.*` actuels : `.env.banking`, `.env.clinical`, `.env.custom`, `.env.ecommerce`, `.env.hotel`, `.env.pme`, `.env.public`, `.env.restaurant`, `.env.school`, `.env.transport`
- [ ] Vérifier que chacun ne contient **rien d'unique** par rapport à `.env.local` (juste `NEXT_PUBLIC_SECTOR=xxx` qui est déjà géré par `cross-env`)
- [ ] **Supprimer** ces 8 fichiers du repo :
  ```bash
  git rm .env.banking .env.clinical .env.custom .env.ecommerce \
         .env.hotel .env.pme .env.public .env.restaurant \
         .env.school .env.transport
  git commit -m "chore: remove obsolete per-sector .env files (sector injected via cross-env)"
  ```
- [ ] ⚠️ **Avant suppression**, vérifier qu'aucun script ou code ne lit ces fichiers (grep `.env.pme` etc. dans le code)
- [ ] Si certains fichiers contiennent des secrets uniques : extraire d'abord, puis supprimer

## 0.3 Nettoyage `.env.local`

- [ ] Retirer la double-déclaration `NEXT_PUBLIC_API_URL` (tu as dit que tu allais commenter celle en `:8011`)
- [ ] Vérifier qu'il n'y a **aucun trailing slash** sur les URLs : `https://dev-api.agt-bot.com` (pas `/`)
- [ ] Vérifier que `.env.local` est bien dans `.gitignore` (jamais commité)
- [ ] Créer un `.env.example` (ce, lui, commité) avec les clés sans valeurs sensibles :
  ```
  NEXT_PUBLIC_API_URL=
  NEXT_PUBLIC_GOOGLE_CLIENT_ID=
  ```

## 0.4 Refactor `SECTOR_URLS` env-driven (BLOQUANT)

> ⚠️ **Ne pas déployer sans ça.** Aujourd'hui `src/lib/constants.ts → SECTOR_URLS` contient des `http://localhost:300x` hard-codés. Le hub déployé sur Vercel enverra donc les users sur `localhost`. 100% cassé.

- [ ] Lire `src/lib/constants.ts` (section `SECTOR_URLS`) et `src/lib/sector-redirect.ts`
- [ ] **Proposition technique** (à valider avant codage) :
  - Introduire 2 vars d'env :
    - `NEXT_PUBLIC_DOMAIN_BASE` (ex: `agt-bot.com` en prod, vide en dev)
    - `NEXT_PUBLIC_USE_SUBDOMAINS` (`true` en prod, `false` en dev)
  - Une fonction `getSectorUrl(slug: SectorKey)` qui retourne :
    - Si `USE_SUBDOMAINS=false` → lookup table localhost (conservée en dev uniquement)
    - Si `USE_SUBDOMAINS=true` → `https://{slug-mapping}.{DOMAIN_BASE}` (avec mapping `ecommerce → e-commerce`, `transport → travell` etc.)
  - Backward compat : `SECTOR_URLS` reste exporté pour le dev mais marqué `@deprecated`, ou remplacé totalement par la fonction
- [ ] Aligner `src/lib/sector-redirect.ts` sur la nouvelle logique
- [ ] Tester local : `npm run dev:restaurant` → la card "Restaurant" sur le hub redirige bien vers `localhost:3001`
- [ ] Tester local : forcer `NEXT_PUBLIC_USE_SUBDOMAINS=true` + `NEXT_PUBLIC_DOMAIN_BASE=agt-bot.com` → la fonction génère bien `https://restaurant.agt-bot.com`
- [ ] Commit sur `develop`, jamais directement sur `main`

## 0.5 Builds locaux — la vérité avant Vercel

- [ ] `npm ci` (clean install)
- [ ] `npx tsc --noEmit` — zéro erreur TypeScript
- [ ] `cross-env NEXT_PUBLIC_SECTOR=restaurant npm run build` — succès
- [ ] `cross-env NEXT_PUBLIC_SECTOR=hub npm run build` — succès
- [ ] `cross-env NEXT_PUBLIC_SECTOR=hotel npm run build` — succès (test d'un 3ème secteur pour valider)
- [ ] Lancer `npm run start` après build et tester le rendu en mode prod
- [ ] Inspecter taille `.next/` (alerter si > 50 Mo)

## 0.6 Validation backend déployé

- [ ] Health check : `curl https://dev-api.agt-bot.com/api/v1/health/` (ou endpoint équivalent) → 200
- [ ] Health check : `curl https://prod-api.agt-bot.com/api/v1/health/` → 200
- [ ] CORS dev backend : autoriser `https://*.vercel.app` et `http://localhost:300*`
- [ ] CORS prod backend : autoriser `https://*.agt-bot.com`
- [ ] **Test CORS dans navigateur** : ouvrir un site quelconque, lancer dans la console :
  ```js
  fetch('https://dev-api.agt-bot.com/api/v1/health/').then(r => console.log(r.status))
  ```
  → doit retourner 200 sans erreur préflight
- [ ] `FRONTEND_BASE_URL` côté backend = `https://agt-bot.com` en prod

---

# Phase 1 — Compte Vercel

- [ ] Compte Vercel créé (email pro)
- [ ] 2FA activé
- [ ] GitHub connecté (Vercel ↔ GitHub OAuth autorisé sur le repo `dev_agt_assist_final`)
- [ ] Plan : Hobby pour démarrer (gratuit, 1 user, 6000 min build/mois). Passer à Pro ($20/mois) si :
  - Plus de 1 collaborateur
  - Build minutes dépassés (10 projets × N rebuilds peut chauffer)
  - Bandwidth > 100 GB/mois

---

# Phase 2 — Projet Vercel `agt-restaurant` (pilote)

## 2.1 Création du projet

- [ ] Vercel dashboard → **Add New → Project**
- [ ] Importer `dev_agt_assist_final`
- [ ] Project Name : `agt-restaurant`
- [ ] Framework Preset : **Next.js** (auto-détecté)
- [ ] Root Directory : `./`
- [ ] Build Command : `npm run build` (laisser défaut)
- [ ] Install Command : `npm ci` (override pour reproductibilité)
- [ ] Output Directory : `.next` (défaut)
- [ ] Node.js version : aligner avec ta version locale (Settings → General → Node.js Version après création)
- [ ] **NE PAS Deploy encore** — d'abord les env vars

## 2.2 Variables d'env Restaurant

> Settings → Environment Variables. **Cocher Production ET Preview** pour chaque ligne (jamais Development).

**Bloc Production** (build depuis `main`) :

| Variable | Valeur | Scope |
|---|---|---|
| `NEXT_PUBLIC_SECTOR` | `restaurant` | Production |
| `NEXT_PUBLIC_API_URL` | `https://prod-api.agt-bot.com` | Production |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | _(rempli en Phase 3)_ | Production |
| `NEXT_PUBLIC_DOMAIN_BASE` | `agt-bot.com` | Production |
| `NEXT_PUBLIC_USE_SUBDOMAINS` | `true` | Production |

**Bloc Preview** (build depuis `develop` et toute autre branche) :

| Variable | Valeur | Scope |
|---|---|---|
| `NEXT_PUBLIC_SECTOR` | `restaurant` | Preview |
| `NEXT_PUBLIC_API_URL` | `https://dev-api.agt-bot.com` | Preview |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | _(rempli en Phase 3)_ | Preview |
| `NEXT_PUBLIC_DOMAIN_BASE` | `agt-bot.com` | Preview |
| `NEXT_PUBLIC_USE_SUBDOMAINS` | `true` | Preview |

- [ ] Toutes les vars Production saisies
- [ ] Toutes les vars Preview saisies

## 2.3 Production Branch

- [ ] Settings → Git → **Production Branch** = `main`
- [ ] Vérifier qu'aucune autre config Git n'est forcée (laisser auto pour les preview branches)

## 2.4 Premier déploiement

- [ ] Cliquer **Deploy** depuis l'écran de création
- [ ] Vercel build `main` → URL prod auto-générée (ex: `agt-restaurant.vercel.app`)
- [ ] Déclencher la preview `develop` :
  ```bash
  git checkout develop
  git commit --allow-empty -m "trigger vercel preview"
  git push origin develop
  ```
- [ ] Attendre que la preview build → URL preview persistante (ex: `agt-restaurant-git-develop-{team}.vercel.app`)
- [ ] **Noter les 2 URLs** quelque part (besoin pour Phase 3 OAuth)

## 2.5 Smoke tests preview Restaurant

> Sur l'URL preview `develop` :

- [ ] Page d'accueil se charge (HTTP 200)
- [ ] Logos sectoriels Restaurant chargent (pas de 404 assets)
- [ ] Console navigateur : aucune erreur rouge bloquante
- [ ] Network tab : appels API → `https://dev-api.agt-bot.com`
- [ ] Pas d'erreur CORS
- [ ] `/onboarding`, `/login` accessibles
- [ ] Toggle FR/EN
- [ ] Mobile responsive (DevTools)
- [ ] **Bouton "Continuer avec Google" affiché** mais ne marche pas encore (normal, OAuth en Phase 3)

---

# Phase 3 — OAuth Google Restaurant

## 3.1 Préparation Google Cloud Console

- [ ] https://console.cloud.google.com/ → projet `agt-platform` (ou créer)
- [ ] Activer **People API** (ou Google+ API selon le SDK utilisé)
- [ ] OAuth consent screen → External
  - App name : `AGT Platform`
  - Authorized domains : `agt-bot.com`, `vercel.app`
  - Support email + Developer contact

## 3.2 Client OAuth Restaurant — Production

- [ ] Credentials → **Create Credentials → OAuth client ID**
- [ ] Type : **Web application**
- [ ] Name : `AGT Restaurant — Production`
- [ ] **Authorized JavaScript origins** :
  - `https://restaurant.agt-bot.com`
- [ ] **Authorized redirect URIs** :
  - `https://restaurant.agt-bot.com/login`
  - `https://restaurant.agt-bot.com/onboarding`
  - (Ajouter tout autre chemin où le SDK Google fait un callback — vérifier dans `AuthShell.tsx` et `login/page.tsx`)
- [ ] Récupérer `Client ID` → stocker dans gestionnaire de secrets
- [ ] `Client Secret` n'est pas utilisé côté front (flow implicit ou GIS) mais le stocker au cas où

## 3.3 Client OAuth Restaurant — Preview/Dev

- [ ] Create Credentials → OAuth client ID
- [ ] Name : `AGT Restaurant — Dev/Preview`
- [ ] **Authorized JavaScript origins** :
  - URL preview Vercel notée en §2.4 (ex: `https://agt-restaurant-git-develop-{team}.vercel.app`)
  - `http://localhost:3001` (dev local Restaurant)
- [ ] **Authorized redirect URIs** :
  - URL preview Vercel + `/login`, `/onboarding`
  - `http://localhost:3001/login`, `http://localhost:3001/onboarding`
- [ ] Récupérer `Client ID`

## 3.4 Injection dans Vercel

- [ ] Vercel → `agt-restaurant` → Settings → Environment Variables
- [ ] Éditer `NEXT_PUBLIC_GOOGLE_CLIENT_ID` :
  - Production = Client ID de §3.2
  - Preview = Client ID de §3.3
- [ ] **Redéployer** (Deployments → Latest → ⋯ → Redeploy) — les changements d'env ne s'appliquent qu'au prochain build

## 3.5 Tests OAuth

- [ ] Sur URL preview, cliquer "Continuer avec Google" → popup Google
- [ ] Compte test → autoriser → callback OK
- [ ] Vérifier en BDD backend qu'un user a bien `google_id` non-null
- [ ] Vérifier que la redirection post-auth pointe vers le bon dashboard sectoriel

---

# Phase 4 — Projet Vercel `agt-hub`

## 4.1 Création + env vars

- [ ] Add New Project → même repo `dev_agt_assist_final` → nom `agt-hub`
- [ ] Production Branch = `main`
- [ ] Variables d'env (réplique §2.2 avec adaptations) :

**Production** :
| Variable | Valeur |
|---|---|
| `NEXT_PUBLIC_SECTOR` | `hub` |
| `NEXT_PUBLIC_API_URL` | `https://prod-api.agt-bot.com` |
| `NEXT_PUBLIC_DOMAIN_BASE` | `agt-bot.com` |
| `NEXT_PUBLIC_USE_SUBDOMAINS` | `true` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | _(à voir : le hub a-t-il besoin d'OAuth ? Si auth seulement sur les secteurs, laisser vide)_ |

**Preview** : idem mais `https://dev-api.agt-bot.com`.

- [ ] Deploy
- [ ] Trigger preview avec push vide sur develop si pas auto

## 4.2 Smoke tests hub preview

- [ ] Landing centrale s'affiche
- [ ] 9 cards secteurs visibles
- [ ] Clic sur card "Restaurant" → redirige vers `https://restaurant.agt-bot.com` (404 ATTENDU : pas encore de DNS)
- [ ] **Test alternatif** : modifier temporairement `NEXT_PUBLIC_USE_SUBDOMAINS=false` + adapter pour pointer vers URL preview Restaurant → vérifier que le mécanisme de redirection fonctionne
- [ ] Mobile responsive
- [ ] FR/EN

---

# Phase 5 — DNS Restaurant prod

## 5.1 Préparation DNS

- [ ] Identifier registrar de `agt-bot.com` (Namecheap, OVH, Gandi, Cloudflare, etc.)
- [ ] Accès au panneau DNS confirmé
- [ ] Lister les enregistrements DNS actuels (screenshot pour backup)

## 5.2 Mapping `restaurant.agt-bot.com` → Vercel

- [ ] Vercel → `agt-restaurant` → Settings → Domains → **Add**
- [ ] Saisir `restaurant.agt-bot.com`
- [ ] Vercel affiche les enregistrements à créer (CNAME `restaurant` → `cname.vercel-dns.com`)
- [ ] Créer le CNAME chez le registrar
- [ ] Attendre propagation (< 10 min en général)
- [ ] Vercel émet automatiquement le certificat SSL Let's Encrypt
- [ ] Vérifier statut `Valid Configuration` côté Vercel
- [ ] Test : `https://restaurant.agt-bot.com` répond avec le bon contenu et HTTPS

## 5.3 Mise à jour OAuth avec domaine custom

- [ ] Retour Google Cloud Console → client OAuth Production Restaurant (§3.2)
- [ ] Vérifier que `https://restaurant.agt-bot.com` est dans origins ET redirect URIs (normalement déjà fait)
- [ ] Tester login Google depuis `https://restaurant.agt-bot.com` → succès

## 5.4 Smoke tests prod Restaurant

- [ ] HTTPS cadenas vert
- [ ] Cert Let's Encrypt valide (`curl -vI https://restaurant.agt-bot.com 2>&1 | grep -E "issuer|expire"`)
- [ ] Aucun mixed content
- [ ] OAuth fonctionne en prod
- [ ] Onboarding complet possible
- [ ] Lighthouse mobile : Performance > 70, Accessibility > 90, SEO > 90

---

# Phase 6 — DNS Hub prod

## 6.1 Mapping apex + www

- [ ] Vercel → `agt-hub` → Settings → Domains → Add `agt-bot.com`
- [ ] Add `www.agt-bot.com`
- [ ] Configurer redirect www → apex (ou inverse)
- [ ] DNS apex `@` :
  - A record → `76.76.21.21` OU
  - ALIAS/ANAME → `cname.vercel-dns.com` (si registrar supporte)
- [ ] DNS `www` : CNAME → `cname.vercel-dns.com`
- [ ] Propagation + SSL

## 6.2 Smoke tests hub prod

- [ ] `https://agt-bot.com` charge la landing
- [ ] `https://www.agt-bot.com` redirige bien
- [ ] Clic "Restaurant" → `https://restaurant.agt-bot.com` qui marche
- [ ] Lighthouse OK

---

# Phase 7 — Réplique 8 secteurs restants

> Pattern identique pour chaque. Le pilote Restaurant a validé toute la chaîne, c'est mécanique maintenant.

Ordre recommandé (selon priorité TODO_TEST_DEBUG_AGT.md) :

- [ ] **Hôtel** — `agt-hotel` → `hotel.agt-bot.com` — port local 3006
- [ ] **E-commerce** — `agt-ecommerce` → `e-commerce.agt-bot.com` — port 3005 ⚠️ slug `ecommerce` mais domaine avec tiret `e-commerce`
- [ ] **Transport** — `agt-transport` → `travell.agt-bot.com` — port 3009 ⚠️ slug `transport` mais domaine `travell` (2L) — confirmer avec Gabriel si c'est volontaire
- [ ] **Banking** — `agt-banking` → `banking.agt-bot.com` — port 3002
- [ ] **Clinical** — `agt-clinical` → `clinical.agt-bot.com` — port 3003
- [ ] **PME** — `agt-pme` → `pme.agt-bot.com` — port 3008
- [ ] **School** — `agt-school` → `school.agt-bot.com` — port 3004
- [ ] **Public** — `agt-public` → `public.agt-bot.com` — port 3007

Pour chacun :
- [ ] Créer projet Vercel (réutilise le repo)
- [ ] Env vars (changer juste `NEXT_PUBLIC_SECTOR`)
- [ ] 2 clients OAuth Google (prod + dev)
- [ ] Injecter les client IDs
- [ ] Smoke tests preview
- [ ] DNS + SSL
- [ ] Update OAuth prod avec domaine custom
- [ ] Smoke tests prod

---

# Phase 8 — Synchro backend post-déploiement

- [ ] Backend `FRONTEND_BASE_URL` = `https://agt-bot.com`
- [ ] CORS backend autorise tous les sous-domaines déployés
- [ ] Templates email backend : liens construits avec `{sector}.agt-bot.com`
- [ ] **Test E2E complet** : inscription depuis hub prod → email reçu → clic lien → atterrit sur le bon sous-domaine sectoriel
- [ ] BUG-S18-01 et BUG-S18-02 (seeders) corrigés AVANT que des users prod ne tentent l'onboarding

---

# Phase 9 — Monitoring & observabilité

- [ ] Vercel Analytics activé (gratuit basique)
- [ ] Notifications Vercel sur build failure (Slack/email)
- [ ] (Optionnel) Sentry pour error tracking front : `@sentry/nextjs`
- [ ] (Optionnel) UptimeRobot / Better Uptime pour monitoring uptime
- [ ] Dashboard de suivi des 10 sous-domaines (status, dernier deploy, erreurs)

---

# Phase 10 — Rollback (procédure d'urgence)

## 10.1 Rollback instantané via Vercel

- [ ] Vercel dashboard → projet concerné → Deployments
- [ ] Identifier précédent deploy `Ready` + `Production`
- [ ] ⋯ → **Promote to Production**
- [ ] Switch atomique en < 5 secondes

## 10.2 Rollback via Git

- [ ] `git revert <commit-fautif>` puis `git push origin main`
- [ ] Vercel rebuild auto (~2-5 min)

## 10.3 Hotfix sans toucher main

- [ ] Branche `hotfix/xxx` depuis `main`
- [ ] Fix + commit + push → Vercel preview de la branche
- [ ] Si OK → PR vers `main`

---

# Phase 11 — Go/No-Go pré-lancement public

## 11.1 Technique

- [ ] Les 10 sous-domaines déployés en HTTPS
- [ ] Aucune URL `localhost` ne fuite dans le HTML/JS bundlé (test : `view-source:` + grep)
- [ ] Aucun secret visible dans les fichiers JS bundlés
- [ ] Headers sécurité OK (HSTS, X-Content-Type-Options, X-Frame-Options, CSP minimum)
- [ ] `robots.txt` cohérent
- [ ] `sitemap.xml` généré
- [ ] favicon présent partout
- [ ] Open Graph (`alternates` déjà en place ✅ dans le code)

## 11.2 Légal

- [ ] CGU
- [ ] Politique de confidentialité
- [ ] Mentions légales
- [ ] Cookies si RGPD applicable
- [ ] Email de contact actif

## 11.3 Backend & data

- [ ] BUG-S18-01 et BUG-S18-02 fermés
- [ ] Sidebar non vide (problème S17)
- [ ] BDD prod nettoyée (pas de comptes test/seed)
- [ ] Sauvegardes BDD auto actives
- [ ] Backend tient 10 users simultanés sans 500

---

# Annexes

## A — Mapping projet ↔ domaine ↔ port

| Projet Vercel | Domaine prod | Port local | Slug code |
|---|---|---|---|
| `agt-hub` | `agt-bot.com` + `www.agt-bot.com` | 3000 | `hub` |
| `agt-restaurant` | `restaurant.agt-bot.com` | 3001 | `restaurant` |
| `agt-banking` | `banking.agt-bot.com` | 3002 | `banking` |
| `agt-clinical` | `clinical.agt-bot.com` | 3003 | `clinical` |
| `agt-school` | `school.agt-bot.com` | 3004 | `school` |
| `agt-ecommerce` | `e-commerce.agt-bot.com` | 3005 | `ecommerce` |
| `agt-hotel` | `hotel.agt-bot.com` | 3006 | `hotel` |
| `agt-public` | `public.agt-bot.com` | 3007 | `public` |
| `agt-pme` | `pme.agt-bot.com` | 3008 | `pme` |
| `agt-transport` | `travell.agt-bot.com` | 3009 | `transport` |

## B — Variables d'env récapitulatif (toutes les vars utilisées)

| Variable | Production | Preview | Dev local |
|---|---|---|---|
| `NEXT_PUBLIC_SECTOR` | par projet (hub/restaurant/...) | idem | injecté par `cross-env` |
| `NEXT_PUBLIC_API_URL` | `https://prod-api.agt-bot.com` | `https://dev-api.agt-bot.com` | `http://localhost:8000` ou autre |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | client prod du secteur | client dev du secteur | client dev du secteur |
| `NEXT_PUBLIC_DOMAIN_BASE` | `agt-bot.com` | `agt-bot.com` | (vide ou non utilisé) |
| `NEXT_PUBLIC_USE_SUBDOMAINS` | `true` | `true` | `false` |

## C — Workflow Git type une fois en place

```bash
# Travail sur une feature
git checkout -b feat/ma-feature develop
# ... code ...
git push origin feat/ma-feature
# → Vercel build des previews sur les 10 projets pour cette branche

# Validation : merge feature → develop
git checkout develop
git merge feat/ma-feature
git push origin develop
# → Vercel build des previews "develop" (URL stable)

# Mise en prod : merge develop → main
git checkout main
git merge develop
git push origin main
# → Vercel build des 10 projets en prod, atomic switch
```

## D — Coûts Vercel prévisionnels

| Plan | Prix | Build min/mois | Bandwidth | Suffit pour |
|---|---|---|---|---|
| Hobby | 0$ | 6000 | 100 GB | Démarrage 1-3 secteurs |
| Pro | 20$/user/mois | 24000 | 1 TB | 10 projets + équipe |

> 10 projets sur Hobby fonctionne tant que les builds restent sous quota. Tester avant de payer.

---

*Fin de la TODO. À cocher au fil de la session. Toute déviation doit être actée avec Gabriel.*