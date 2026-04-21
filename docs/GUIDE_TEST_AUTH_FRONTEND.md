# GUIDE DE TEST — Auth Frontend AGT Platform

> **À qui s'adresse ce guide ?**
> À tout développeur qui souhaite valider end-to-end le module auth du frontend client PME.
>
> **Ce guide couvre l'intégration frontend** : les appels API, la gestion d'état, le middleware, les redirections, la persistance du token. Le backend est supposé fonctionnel (voir `GUIDE_AUTH_AGT.md` côté backend).
>
> **Dernière validation :** 21 avril 2026

---

## Table des matières

1. [Rôle du frontend auth](#1-rôle-du-frontend-auth)
2. [Prérequis](#2-prérequis)
3. [Démarrage](#3-démarrage)
4. [Comptes de test](#4-comptes-de-test)
5. [Pages concernées](#5-pages-concernées)
6. [Groupe 1 — Landing & Middleware](#6-groupe-1--landing--middleware)
7. [Groupe 2 — Register & Vérification email](#7-groupe-2--register--vérification-email)
8. [Groupe 3 — Login classique](#8-groupe-3--login-classique)
9. [Groupe 4 — Mot de passe oublié + Reset](#9-groupe-4--mot-de-passe-oublié--reset)
10. [Groupe 5 — Magic link](#10-groupe-5--magic-link)
11. [Groupe 6 — Google OAuth](#11-groupe-6--google-oauth)
12. [Groupe 7 — Session, Refresh auto, Logout](#12-groupe-7--session-refresh-auto-logout)
13. [Groupe 8 — Garde anti-admin](#13-groupe-8--garde-anti-admin)
14. [Bugs connus](#14-bugs-connus)
15. [Troubleshooting](#15-troubleshooting)
16. [Commandes utiles](#16-commandes-utiles)

---

## 1. Rôle du frontend auth

Le frontend client PME (`agt-assist-client`) consomme les 12 endpoints `/api/v1/auth/*` du backend via `authRepository` et expose à l'utilisateur les flux suivants :

- **Inscription** → `/login` (tab register) ou `/onboarding`
- **Vérification email** → `/verify-email?token=...`
- **Connexion classique** → `/login`
- **Connexion Google OAuth** → `/login` (bouton Google)
- **Magic link** → `/login` (tab magic) puis `/magic-link?token=...`
- **Mot de passe oublié** → `/login` (vue forgot) puis `/reset-password?token=...`
- **Pending** (email non vérifié) → `/pending?email=...`
- **Déconnexion** → depuis le menu utilisateur, blacklist backend + clear local

**Règles frontend importantes :**
- Le frontend client PME n'accepte QUE les users `user_type === "entreprise"`. Les admins/superadmins sont rejetés par `ensureEntreprise()` dans `AuthContext`.
- Zéro `any` TypeScript — tous les types sont alignés sur le backend via `src/types/api/index.ts`.
- Zéro texte en dur — tous les libellés passent par `useLanguage()` + `dictionaries/fr.ts` ou `en.ts`.
- Refresh auto sur 401 thread-safe dans `src/lib/api-client.ts`.

**URL frontend :** http://localhost:3000
**URL backend :** http://localhost:8000

---

## 2. Prérequis

- Backend démarré avec tous les conteneurs `healthy` :
  ```powershell
  docker-compose ps
  ```
- Frontend en dev mode :
  ```powershell
  cd agt-assist-client
  npm run dev
  ```
- Données seedées (voir `GUIDE_AUTH_AGT.md` côté backend).
- `npx tsc --noEmit` passe sans erreur.
- DevTools du navigateur ouverts (F12) pour vérifier LocalStorage, cookies, console, requêtes réseau.

---

## 3. Démarrage

```powershell
cd agt-assist-client
npm install
npm run dev
```

Le frontend écoute sur http://localhost:3000.

Vérifier `.env.local` :
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<votre_client_id_google>
```

---

## 4. Comptes de test

| Email | Mot de passe | Type | Email vérifié | Usage typique |
|-------|--------------|------|---------------|---------------|
| `test1@demo.cm` | `Pme@2024!` | PME | ✅ | Login nominal, forgot pwd, magic link |
| `test2@demo.cm` | `Pme@2024!` | PME | ❌ | Test EMAIL_NOT_VERIFIED |
| `pharma@demo.cm` | `Pme@2024!` | PME seedée | ✅ | PME avec entreprise déjà créée |
| `gabriel@agt.cm` | `Admin@2024!` | admin AGT | ✅ | Test garde anti-admin |
| `superadmin@agt.cm` | `Admin@2024!` | superadmin | ✅ | Test garde anti-admin |

---

## 5. Pages concernées

| Route | Rôle | Public ? |
|-------|------|----------|
| `/` | Landing page | ✅ (redirige vers dashboard si connecté) |
| `/login` | Login + tabs (password, magic), forgot password | ✅ (redirige vers dashboard si connecté) |
| `/onboarding` | Register + création entreprise post-vérif | ✅ |
| `/verify-email?token=...` | Consomme un AuthToken verify_email | ✅ |
| `/pending?email=...` | Attente vérification email | ✅ |
| `/reset-password?token=...` | Consomme un AuthToken reset_password | ✅ |
| `/magic-link?token=...` | Consomme un AuthToken magic_link | ✅ |
| `/dashboard` | Dashboard PME | 🔒 |
| `/pme/*` | Routes métier PME | 🔒 |

---

## 6. Groupe 1 — Landing & Middleware

### Rôle
Vérifier que le middleware redirige correctement selon l'état d'authentification.

### Test 1.1 — Landing page déconnecté

**Étape :** ouvrir http://localhost:3000/ en navigation privée (pour garantir zéro token).

**Attendu :**
- La landing s'affiche
- Dans DevTools → Application → Cookies : pas de cookie `agt_auth`
- Dans LocalStorage : pas de token

### Test 1.2 — Landing page connecté

**Étape :**
1. Se connecter via `/login` avec `test1@demo.cm` / `Pme@2024!`
2. Ouvrir http://localhost:3000/

**Attendu :** redirection automatique vers `/dashboard` (via middleware).

### Test 1.3 — Accès route protégée sans token

**Étape :** en navigation privée, ouvrir http://localhost:3000/dashboard.

**Attendu :** redirection vers `/login?redirect=/dashboard`.

### Test 1.4 — Accès route auth flow sans token

**Étape :** en navigation privée, ouvrir http://localhost:3000/reset-password (sans param `?token=...`).

**Attendu :** la page s'affiche avec l'écran d'erreur "Lien invalide" (PAS de redirection vers `/login`). Confirme que le middleware autorise ces routes publiques.

**À tester aussi :**
- http://localhost:3000/magic-link → écran "Lien invalide"
- http://localhost:3000/verify-email → écran "Lien invalide"

### Test 1.5 — Blocage /admin

**Étape :** en connecté, ouvrir http://localhost:3000/admin.

**Attendu :** redirection vers `/dashboard` (middleware bloque explicitement `/admin` côté PME).

### Erreurs possibles — Groupe 1

| Symptôme | Cause | Solution |
|----------|-------|----------|
| `/reset-password` redirige vers `/login` | Middleware non à jour | Vérifier `PUBLIC_ROUTES` + `matcher` dans `src/middleware.ts` |
| Landing ne redirige pas vers dashboard quand connecté | Cookie `agt_auth` non posé | Vérifier `tokenStorage.set()` dans `api-client.ts` |

---

## 7. Groupe 2 — Register & Vérification email

### Rôle
Valider le flux d'inscription complet : création de compte → email envoyé → clic lien → compte vérifié → onboarding entreprise.

### Test 2.1 — Inscription d'un nouveau compte

**Étapes :**
1. Ouvrir http://localhost:3000/login en navigation privée
2. Cliquer sur le tab/lien "Créer un compte" (ou équivalent selon l'UI) → redirection vers `/onboarding`
3. Remplir le formulaire :
   - Nom : `Nouveau User Test`
   - Email : `nouveau@demo.cm`
   - Mot de passe : `Pme@2024!`
4. Valider

**Attendu :**
- Requête `POST /api/v1/auth/register/` dans l'onglet Network → statut 201
- Réponse contient `access`, `refresh`, `user` avec `is_email_verified: false`
- Redirection vers `/pending?email=nouveau@demo.cm` OU écran d'attente de vérification
- Cookie `agt_auth` posé (même si email non vérifié — JWT émis mais permission `IsEmailVerified` bloquera les endpoints métier)

### Test 2.2 — Récupérer le token verify_email en base

```powershell
docker-compose exec api python manage.py shell -c "from apps.users.models import AuthToken; t=AuthToken.objects.filter(user__email='nouveau@demo.cm', type='verify_email', used_at__isnull=True).first(); print(t.token if t else 'AUCUN')"
```

Noter le token.

### Test 2.3 — Vérifier l'email via /verify-email

**Étape :** ouvrir http://localhost:3000/verify-email?token=TOKEN_COPIE

**Attendu :**
- Écran "Vérification en cours..."
- Requête `POST /api/v1/auth/verify-email/` → 200
- Écran "Email vérifié ✓" avec barre de progression
- Après ~2s : redirection vers `/onboarding?verified=true`
- `is_email_verified` passe à `true` en base

### Test 2.4 — Token déjà utilisé

**Étape :** rejouer le même token via `/verify-email?token=TOKEN_DEJA_CONSOMME`

**Attendu :**
- Écran "Lien invalide"
- Message : "Token expire. Demandez un nouveau lien."
- Bouton "Retour à la connexion"

### Test 2.5 — Token inexistant

**Étape :** ouvrir `/verify-email?token=bidon123`

**Attendu :**
- Écran "Lien invalide"
- Message : "Token invalide."

### Test 2.6 — Renvoi d'email (resend)

**Étape :** depuis la page `/pending`, cliquer sur "Renvoyer l'email de vérification".

**Attendu :**
- Requête `POST /api/v1/auth/resend-verification/` → 200
- Message UI : "Email renvoyé ! Vérifiez votre boîte mail."
- En base : l'ancien token est invalidé (`used_at` renseigné), un nouveau token est créé

### Erreurs possibles — Groupe 2

| Symptôme | Cause | Solution |
|----------|-------|----------|
| 400 "Un compte avec cet email existe deja." au register | Email déjà utilisé | Utiliser un autre email ou supprimer le user en base |
| Pas d'email reçu sur Gmail | SMTP mal configuré | Récupérer le token en base (section 2.2) — en dev on utilise toujours cette méthode |
| `/verify-email` reste bloqué sur "Vérification..." | Backend down ou CORS | Vérifier logs backend + `NEXT_PUBLIC_API_URL` dans `.env.local` |

---

## 8. Groupe 3 — Login classique

### Rôle
Valider les 5 cas du login : succès PME, email non vérifié → redirection `/pending`, mauvais pwd, email inconnu, admin AGT rejeté.

### Test 3.1 — Login nominal PME vérifié

**Étapes :**
1. Ouvrir `/login` en navigation privée
2. Saisir `test1@demo.cm` / `Pme@2024!`
3. Valider

**Attendu :**
- Requête `POST /api/v1/auth/login/` → 200
- Réponse : `access`, `refresh`, `user` avec `user_type: "entreprise"`, `is_email_verified: true`
- `tokenStorage.set()` appelé → LocalStorage contient les tokens + cookie `agt_auth`
- Redirection vers `/dashboard`
- L'état `AuthContext.user` est peuplé

### Test 3.2 — Login email non vérifié → /pending

**Étapes :**
1. `/login` avec `test2@demo.cm` / `Pme@2024!`
2. Valider

**Attendu :**
- Requête `POST /api/v1/auth/login/` → **403** avec `{"detail": "EMAIL_NOT_VERIFIED", "email": "test2@demo.cm"}`
- `ApiError.isEmailNotVerified()` détecte le cas
- Redirection automatique vers `/pending?email=test2@demo.cm`
- **Aucun token stocké** (LocalStorage vide, pas de cookie `agt_auth`)

### Test 3.3 — Mauvais mot de passe

**Étapes :** `/login` avec `test1@demo.cm` / `MauvaisPwd!`

**Attendu :**
- Requête `POST /api/v1/auth/login/` → 401
- Message d'erreur UI : "Email ou mot de passe incorrect." (ou la clé `t.loginError` du dictionnaire)
- Reste sur `/login`, pas de redirection

### Test 3.4 — Email inexistant (anti-énumération)

**Étapes :** `/login` avec `inexistant@demo.cm` / `Pme@2024!`

**Attendu :**
- Requête → 401 avec **le même message** qu'au test 3.3
- UI affiche le même message d'erreur → impossible pour un attaquant de savoir si l'email existe

### Test 3.5 — Login admin AGT rejeté (garde frontend)

**Étapes :** `/login` avec `gabriel@agt.cm` / `Admin@2024!`

**Attendu :**
- Requête `POST /api/v1/auth/login/` → 200 (le backend accepte, il ne sait pas qu'on est sur le frontend PME)
- `ensureEntreprise(user)` dans `AuthContext.login()` lève une `Error("Accès réservé aux comptes entreprise.")`
- **Aucun token stocké** (le set n'est appelé qu'après `ensureEntreprise`)
- UI affiche l'erreur
- Reste sur `/login`

**Vérification LocalStorage** : pas de token, pas de cookie. L'admin n'est **jamais** dans l'état connecté côté frontend PME.

### Erreurs possibles — Groupe 3

| Symptôme | Cause | Solution |
|----------|-------|----------|
| 403 EMAIL_NOT_VERIFIED mais pas de redirection | `ApiError.isEmailNotVerified()` non appelé dans `login/page.tsx` | Vérifier le try/catch dans `handleLogin` |
| Login admin passe et user connecté | Garde `ensureEntreprise` manquante | Vérifier `AuthContext.tsx` ligne `ensureEntreprise(res.user)` |
| Tokens stockés même en cas d'échec | `tokenStorage.set()` appelé avant le guard | L'ordre correct : `login()` → `ensureEntreprise()` → `tokenStorage.set()` → `setUser()` |

---

## 9. Groupe 4 — Mot de passe oublié + Reset

### Rôle
Valider le flux complet : demande → email → clic lien → saisie nouveau pwd → connecté automatiquement.

### Test 4.1 — Demande de reset depuis /login

**Étapes :**
1. `/login` en nav privée
2. Cliquer sur "Mot de passe oublié ?"
3. Saisir `test1@demo.cm`
4. Valider

**Attendu :**
- Requête `POST /api/v1/auth/forgot-password/` → 200
- Réponse : `{"detail": "Si ce compte existe, un email a ete envoye."}`
- UI affiche l'écran "Email envoyé ! Vérifiez votre boîte mail." (même réponse si l'email n'existait pas — anti-énumération)

### Test 4.2 — Récupérer le token reset_password en base

```powershell
docker-compose exec api python manage.py shell -c "from apps.users.models import AuthToken; t=AuthToken.objects.filter(user__email='test1@demo.cm', type='reset_password', used_at__isnull=True).first(); print(t.token if t else 'AUCUN')"
```

### Test 4.3 — Page /reset-password avec token valide

**Étape :** ouvrir http://localhost:3000/reset-password?token=TOKEN

**Attendu :**
- Le formulaire s'affiche (pas de redirection vers `/login` — confirme que le middleware est bon)
- Icône clé + titre "Réinitialiser votre mot de passe"
- 2 champs password

### Test 4.4 — Validation côté frontend

**Étapes depuis le formulaire :**
- Saisir `123` dans les 2 champs → submit → erreur "Le mot de passe doit contenir au moins 8 caractères."
- Saisir `nouveauPwd123` et `autrePwd456` → submit → erreur "Les mots de passe ne correspondent pas."

**Attendu :** aucune requête backend (`Network` onglet vide pour les erreurs de validation).

### Test 4.5 — Reset nominal

**Étapes :**
1. Saisir `NewPwd2026!` dans les 2 champs
2. Valider

**Attendu :**
- Requête `POST /api/v1/auth/reset-password/` → 200
- Réponse : `access`, `refresh`, `user`
- Tokens stockés (LocalStorage + cookie)
- Écran "Mot de passe mis à jour ✓"
- Redirection vers `/dashboard` après ~2s
- L'utilisateur est **connecté** automatiquement
- Le token reset_password est consommé (`used_at` renseigné en base)

### Test 4.6 — Rejouer le même token

**Étape :** ouvrir `/reset-password?token=TOKEN_DEJA_UTILISE`

**Attendu :**
- Le formulaire s'affiche
- Après submit : écran "Lien invalide" avec message "Token expire. Demandez un nouveau lien."

### Test 4.7 — Token manquant ou inexistant

- `/reset-password` sans query string → écran "Lien invalide" immédiat (avant même une requête)
- `/reset-password?token=bidon` + submit → requête 400 → écran "Lien invalide"

### Test 4.8 — Login après reset

**Étape :** se déconnecter, puis re-login avec `test1@demo.cm` / `NewPwd2026!`

**Attendu :** login réussit avec le nouveau mot de passe.

**Restauration (optionnel)** : refaire un reset pour remettre `Pme@2024!`.

### Erreurs possibles — Groupe 4

| Symptôme | Cause | Solution |
|----------|-------|----------|
| 500 sur le reset | Token corrompu ou URL mal encodée | Régénérer un token et copier proprement |
| Page `/reset-password` redirige vers `/login` | Middleware non à jour | Voir modif 1 du handoff |
| Connexion non automatique après reset | `tokenStorage.set()` non appelé | Vérifier `handleSubmit` dans `reset-password/page.tsx` |

---

## 10. Groupe 5 — Magic link

### Rôle
Valider le flux one-click login : demande → email → clic lien → connecté directement, sans mot de passe.

### Test 5.1 — Demande de magic link depuis /login

**Étapes :**
1. `/login` en nav privée
2. Cliquer sur le tab "Lien magique"
3. Saisir `test1@demo.cm`
4. Cliquer sur "Recevoir un lien magique"

**Attendu :**
- Requête `POST /api/v1/auth/magic-link/request/` → 200
- Réponse : `{"detail": "Si ce compte existe et est verifie, un lien a ete envoye."}`
- UI affiche "Lien envoyé ! Vérifiez votre boîte mail."

### Test 5.2 — Récupérer le token magic_link

```powershell
docker-compose exec api python manage.py shell -c "from apps.users.models import AuthToken; t=AuthToken.objects.filter(user__email='test1@demo.cm', type='magic_link', used_at__isnull=True).first(); print(t.token if t else 'AUCUN')"
```

### Test 5.3 — Consommation automatique du token

**Étape :** ouvrir http://localhost:3000/magic-link?token=TOKEN

**Attendu :**
- Écran "Connexion en cours..." (loader animé)
- Requête `POST /api/v1/auth/magic-link/verify/` → 200
- Réponse : `access`, `refresh`, `user`
- Tokens stockés
- Écran "Bienvenue ✓" avec barre de progression
- Redirection vers `/dashboard` après ~1,5s
- Connecté automatiquement

### Test 5.4 — Magic link sur email non vérifié

Le backend **refuse silencieusement** d'envoyer un magic link à un email non vérifié (pour éviter de contourner la vérification email obligatoire).

**Étapes :**
1. Tab "Lien magique" avec `test2@demo.cm` (non vérifié)
2. Valider

**Attendu :**
- Requête → 200 (réponse neutre)
- UI affiche "Lien envoyé !" (même visuel, anti-énumération)
- En base : **aucun token magic_link n'est créé** pour `test2@demo.cm` (vérifier avec la commande 5.2)

### Test 5.5 — Token déjà consommé

**Étape :** rejouer le même token dans l'URL.

**Attendu :**
- Écran "Lien invalide"
- Message : "Token expire. Demandez un nouveau lien."

### Test 5.6 — Expiration (15 minutes)

Les magic links expirent après 15 minutes. Pour tester :
- Générer un token
- Attendre 15+ minutes (ou modifier `expires_at` en base)
- Ouvrir l'URL → écran "Lien invalide"

### Erreurs possibles — Groupe 5

| Symptôme | Cause | Solution |
|----------|-------|----------|
| Magic link créé pour email non vérifié | Backend mal configuré | Voir `magic_link_request` dans `auth_bridge/local.py` |
| Connexion ne persiste pas après `/magic-link` | `tokenStorage.set()` non appelé | Vérifier `useEffect` dans `magic-link/page.tsx` |

---

## 11. Groupe 6 — Google OAuth

### Rôle
Valider la connexion/inscription via Google — trusted, pas de vérification email requise.

### Prérequis
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` configuré dans `.env.local`
- L'origine `http://localhost:3000` autorisée dans la console Google Cloud

### Test 6.1 — Première connexion Google (création compte)

**Étapes :**
1. `/login` en nav privée
2. Cliquer sur "Continuer avec Google"
3. Sélectionner un compte Google neuf (jamais utilisé sur AGT)

**Attendu :**
- Popup Google OAuth s'ouvre
- Après sélection du compte, popup se ferme
- Requête `POST /api/v1/auth/google/` → 200
- Body : `{email, name, google_id: <sub>}`
- Réponse : user avec `is_email_verified: true`, `has_google_auth: true`
- Redirection vers `/dashboard` ou `/onboarding` selon la logique actuelle

### Test 6.2 — Reconnexion Google (compte existant)

**Étapes :** même compte Google, une seconde fois.

**Attendu :** idem, mais pas de création en base (`get_or_create` backend).

### Test 6.3 — Compte existant par email (sans google_id initial)

Si un user s'est inscrit par email/password puis se connecte avec Google la première fois, le backend doit :
- Vérifier l'email s'il ne l'était pas
- Persister le `google_id`

**Vérification en base :**
```powershell
docker-compose exec api python manage.py shell -c "from apps.users.models import User; u=User.objects.get(email='<email>'); print(f'google_id={u.google_id} verified={u.is_email_verified}')"
```

### Erreurs possibles — Groupe 6

| Symptôme | Cause | Solution |
|----------|-------|----------|
| Popup Google ne s'ouvre pas | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` manquant ou invalide | Vérifier `.env.local` + redémarrer `npm run dev` |
| `redirect_uri_mismatch` | Origine localhost:3000 non whitelist sur console Google | Ajouter l'origine dans la config OAuth Google Cloud |
| 400 sur `/auth/google/` | Backend refuse le payload | Vérifier `GoogleAuthSerializer` + logs backend |

---

## 12. Groupe 7 — Session, Refresh auto, Logout

### Rôle
Valider la persistance de session, le refresh automatique sur 401, et le logout avec blacklist.

### Test 7.1 — Persistance de session (F5)

**Étapes :**
1. Se connecter avec `test1@demo.cm`
2. Sur `/dashboard`, appuyer sur F5 (rechargement complet)

**Attendu :**
- Requête `GET /api/v1/auth/me/` au reload
- Réponse 200 avec le user
- `AuthContext.user` peuplé
- L'utilisateur reste connecté, pas de flash vers `/login`

### Test 7.2 — Refresh auto sur 401

**But :** simuler un access token expiré et vérifier que le frontend fait automatiquement le refresh.

**Setup :**
1. Se connecter
2. Dans DevTools → Application → LocalStorage, **modifier manuellement** le `access_token` pour qu'il soit invalide (ex: ajouter une lettre à la fin)

**Étape :** naviguer vers n'importe quelle page métier (ex: `/pme/appointments`).

**Attendu :**
- Première requête → 401
- Le client intercepte, appelle `POST /api/v1/auth/token/refresh/` avec le refresh token
- Nouveau access token stocké automatiquement
- La requête initiale est **rejouée** et réussit
- L'utilisateur ne voit aucune erreur

**Vérification réseau :** dans Network, on doit voir :
1. `GET /pme/appointments` → 401
2. `POST /auth/token/refresh/` → 200
3. `GET /pme/appointments` (retry) → 200

### Test 7.3 — Refresh token invalide → redirection login

**Setup :** modifier manuellement **les deux** tokens en LocalStorage pour qu'ils soient invalides.

**Étape :** naviguer sur une route protégée.

**Attendu :**
- Première requête → 401
- Refresh tenté → échoue (401)
- `tokenStorage.clear()` appelé → LocalStorage vidé
- L'erreur `ApiError(401)` remonte
- Au prochain render, middleware / AuthContext redirige vers `/login`

### Test 7.4 — Refresh thread-safe (N requêtes 401 simultanées)

**But :** vérifier qu'un seul refresh est déclenché même si plusieurs requêtes reçoivent 401 en même temps.

**Setup :** invalider le access token comme au test 7.2.

**Étape :** sur une page qui lance plusieurs requêtes au mount (ex: `/dashboard` qui charge stats + bots + appointments).

**Attendu dans Network :**
- Plusieurs 401 initiaux
- **Un seul** `POST /auth/token/refresh/`
- Toutes les requêtes initiales sont rejouées avec le nouveau token

**Preuve de fonctionnement** : regarder le code `isRefreshing` + `refreshQueue` dans `api-client.ts`.

### Test 7.5 — Logout

**Étapes :**
1. Connecté, cliquer sur le bouton/menu de déconnexion
2. Observer Network + LocalStorage

**Attendu :**
- Requête `POST /api/v1/auth/logout/` avec le refresh token en body → 200
- Réponse : `{"detail": "Deconnecte."}`
- LocalStorage vidé (pas de `access_token`, pas de `refresh_token`)
- Cookie `agt_auth` supprimé
- Redirection vers `/login`

### Test 7.6 — Logout avec token déjà invalide

**Setup :** modifier le refresh token en LocalStorage pour le casser.

**Étape :** cliquer sur logout.

**Attendu :**
- Requête `POST /auth/logout/` → 401 (refresh invalide)
- `AuthContext.logout()` attrape l'erreur dans son try/catch
- LocalStorage vidé **quand même** (clear est appelé dans tous les cas)
- Redirection vers `/login`

**Principe :** le logout côté frontend doit **toujours** aboutir, même si le backend refuse. L'appel backend est un "best effort" pour blacklister le refresh.

### Test 7.7 — Réutilisation d'un refresh blacklisté

**Setup :**
1. Se connecter avec `test1`
2. Copier le refresh token depuis LocalStorage
3. Se déconnecter (logout réussi → refresh blacklisté en base)
4. Dans un outil (Swagger / Postman), appeler `POST /auth/token/refresh/` avec le refresh copié

**Attendu :** 401 `"Token is invalid or expired"` — le blacklist fonctionne.

### Erreurs possibles — Groupe 7

| Symptôme | Cause | Solution |
|----------|-------|----------|
| F5 déconnecte l'utilisateur | `AuthContext` useEffect mal configuré | Vérifier que `me()` est appelé si token présent |
| Boucle infinie de refresh | `skipAuthRefresh` manquant sur `/auth/token/refresh/` | Vérifier `refreshToken()` dans `authRepository` |
| Logout ne blacklist pas | Backend bug fixé au prompt ? | Voir bug connu #1 dans `GUIDE_AUTH_AGT.md` backend |
| 2 requêtes refresh simultanées | `isRefreshing` flag cassé | Vérifier `api-client.ts` lignes `refreshQueue` |

---

## 13. Groupe 8 — Garde anti-admin

### Rôle
Vérifier qu'un admin/superadmin ne peut **jamais** être authentifié dans l'app client PME.

### Test 8.1 — Login admin AGT rejeté

Voir **Test 3.5** (Groupe 3).

### Test 8.2 — Reprise de session admin rejetée

**Setup (simulation d'une manipulation malveillante) :**
1. Obtenir un access token admin via Swagger (`/auth/login/` avec `gabriel@agt.cm`)
2. Copier `access` et `refresh`
3. Dans DevTools → LocalStorage sur localhost:3000, coller ces tokens
4. Poser aussi le cookie `agt_auth` manuellement
5. Ouvrir `/dashboard`

**Attendu :**
- Middleware laisse passer (cookie présent)
- `AuthContext` useEffect appelle `GET /auth/me/` → renvoie le user admin
- `ensureEntreprise(u)` lève une erreur
- `tokenStorage.clear()` appelé → tokens supprimés
- `setUser(null)` → pas d'état connecté
- Au prochain render, middleware redirige vers `/login` (cookie absent)

**Conclusion :** impossible pour un admin AGT d'accéder au dashboard PME, même avec des tokens volés.

### Test 8.3 — Google OAuth avec compte admin

Si un admin AGT a un compte Google lié, le backend renvoie `user_type: "admin"`. Même garde :

**Attendu :** `ensureEntreprise()` lève → tokens pas stockés → reste sur `/login`.

---

## 14. Bugs connus

| # | Bug | Impact | Fix |
|---|-----|--------|-----|
| 1 | Backend logout 500 `'RefreshToken' has no attribute 'blacklist'` _(pré-fix)_ | Logout impossible | Ajouter `rest_framework_simplejwt.token_blacklist` dans `INSTALLED_APPS` + `migrate` |

---

## 15. Troubleshooting

| Symptôme | Cause probable | Solution |
|----------|---------------|----------|
| CORS error au login | `CORS_ALLOWED_ORIGINS` ne contient pas `http://localhost:3000` | Vérifier `settings.py` backend |
| `Cannot find module @/contexts/AuthContext` | Path alias cassé | Vérifier `tsconfig.json` `paths` |
| `Dictionary has no property 'resetPassword'` | Blocs manquants | Voir modif 4 du handoff |
| `/reset-password` redirige vers `/login` | Middleware pas à jour | Voir modif 1 |
| Page blanche sur `/magic-link` | Erreur JS | Ouvrir DevTools console — souvent `Suspense` manquant autour de `useSearchParams` |
| Google popup se ferme immédiatement | Origine non whitelistée | Console Google Cloud → OAuth → ajouter `http://localhost:3000` |
| F5 déconnecte | Cookie `agt_auth` expiré ou `SameSite` trop strict | Vérifier `tokenStorage.set()` dans `api-client.ts` |
| `npx tsc --noEmit` erreur sur clé dictionnaire | Bloc ajouté mais pas dans les 2 fichiers | Vérifier `fr.ts` ET `en.ts` |

---

## 16. Commandes utiles

```powershell
# Démarrer le frontend
cd agt-assist-client
npm run dev

# Vérification TypeScript
npx tsc --noEmit

# Build production (valide plus strictement)
npm run build

# Récupérer un token (tous types) d'un user
docker-compose exec api python manage.py shell -c "from apps.users.models import AuthToken; [print(f'{t.type} | token={t.token[:15]}... | used={t.used_at is not None}') for t in AuthToken.objects.filter(user__email='EMAIL').order_by('-created_at')[:5]]"

# Forcer un user à non-vérifié (pour retester EMAIL_NOT_VERIFIED)
docker-compose exec api python manage.py shell -c "from apps.users.models import User; u=User.objects.get(email='EMAIL'); u.is_email_verified=False; u.save()"

# Voir l'état d'un user complet
docker-compose exec api python manage.py shell -c "from apps.users.models import User; u=User.objects.get(email='EMAIL'); print(f'type={u.user_type} verified={u.is_email_verified} has_google={bool(u.google_id)}')"

# Clear browser (nav privée) — recommandé entre les tests

# Relancer le frontend (quand .env.local modifié)
# Ctrl+C puis npm run dev
```

---

*GUIDE_TEST_AUTH_FRONTEND.md — AGT Technologies — 21 avril 2026*
*Testé sur agt-assist-client — Next.js 14.2 App Router TypeScript strict*
