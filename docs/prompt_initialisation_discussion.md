# PROMPT DE SESSION — AGT Platform (Backend audit + Frontend integration)

## Identité du projet

SaaS B2B **AGT Platform** — assistants virtuels WhatsApp + vocal IA pour PME africaines (Cameroun).

- **Backend** : Django 5 + DRF + PostgreSQL + Redis + RabbitMQ + Docker (`agt-assist-backend`)
- **Frontend PME** : Next.js 14 App Router + TypeScript strict + Tailwind (`agt-assist-client`, port 3000)
- **Frontend Admin** : Next.js 14 App Router + TypeScript strict + Tailwind (`agt-assist-agt`, port 3001)

---

## Stack technique

```
Backend  : Django 5, DRF, PostgreSQL, Redis, RabbitMQ, Docker
Frontend : Next.js 14 App Router, TypeScript strict (zéro any), Tailwind CSS
Auth     : JWT (SimpleJWT) + vérification email + Google OAuth
```

---

## Règles absolues de travail

- **Jamais de code avant analyse de l'existant**
- **Une tâche à la fois** — jamais plusieurs fichiers non liés dans le même message
- **PowerShell** : pas de `&&`, utiliser `;` — pas de `Set-Clipboard` dans les commandes Docker
- **Zéro `any` TypeScript** — `npx tsc --noEmit` doit passer à zéro erreur après chaque modification frontend
- **Zéro texte en dur dans le JSX** — toujours via `useLanguage()` + dictionnaires `fr.ts`/`en.ts`
- **Trailing slash obligatoire** sur tous les endpoints Django (`/api/v1/bots/` pas `/api/v1/bots`)
- **Zéro accent dans le code Python** (les noms métier restent libres)
- Diffs ciblés quand possible, fichiers complets uniquement si vraiment nécessaire
- Contenu brut dans le chat (copier-coller manuel dans VSCode) — pas de download (encodage Windows casse l'UTF-8)
- Tests une étape à la fois avec validation avant la suivante

---

## Méthode de travail pour chaque tâche

1. **Analyser l'existant** (modèles, relations, endpoints, composants)
2. **Conception fonctionnelle** (que fait-on, pourquoi)
3. **Conception technique** (fichiers concernés, structure)
4. **Implémentation** (code propre, modulaire, commenté)
5. **Vérification** (`tsc --noEmit`, cohérence conventions)

---

## Architecture backend

```
apps/
├── users/           # User (superadmin/admin/entreprise) + Role + Permission + Profil
├── tenants/         # Entreprise + SecteurActivite + UserEntreprise
├── bots/            # Bot + NumeroTelephone + Operateur + ConfigProvider
├── services/        # Service + Agence + HorairesOuverture + DescriptionService
├── appointments/    # RendezVous + Client + PolitiqueRappel
├── conversations/   # Conversation + MessageConversation + RapportConversation
├── billing/         # Plan + Abonnement + Wallet + Transaction + ServicePaiement
├── knowledge/       # ProfilEntreprise + FAQ + QuestionFrequente
├── dashboard/       # Stats agrégées (pas de modèle propre)
└── auth_bridge/     # Login, Register, Google OAuth, Verify Email, JWT
```

**Pattern Strategy** : `USE_LOCAL_X=True` → `local.py` / `False` → microservice distant  
**AUTH_USER_MODEL** = `"users.User"`  
**Isolation tenant** : toujours filtrer par `entreprise` du user connecté  
**3 user_type** : `superadmin` / `admin` / `entreprise`

---

## Architecture frontend PME (`agt-assist-client`)

```
src/
├── app/pme/
│   ├── dashboard/      # Stats + graphiques
│   ├── bots/           # Liste bots + [id]/test cockpit
│   ├── services/       # CRUD services
│   ├── appointments/   # Agenda RDV (vue semaine/jour)
│   ├── billing/        # Wallet + abonnement + transactions
│   ├── profile/        # Profil user + entreprise
│   └── knowledge/      # ProfilEntreprise + FAQ + Services knowledge
├── contexts/
│   ├── AuthContext.tsx     # user, login, logout, refreshUser, isPme
│   └── LanguageContext.tsx # fr/en
├── repositories/index.ts   # Tous les appels API
├── types/api/index.ts      # Types alignés sur le vrai backend Django
└── lib/
    ├── api-client.ts   # tokenStorage + refresh auto 401 thread-safe
    └── constants.ts    # ROUTES, PAGE_SIZE...
```

**Règle frontend PME** : `user_type === "entreprise"` UNIQUEMENT — jamais admin/superadmin  
**`refreshUser()`** : disponible dans `AuthContext`, rappelle `/api/v1/auth/me/` et met à jour le state

---

## État d'avancement actuel

### ✅ Modules intégrés (frontend branché sur vrai backend)

| Module | Endpoints |
|--------|-----------|
| Auth (12 endpoints) | `/api/v1/auth/*` |
| Profil | `PATCH /api/v1/users/update_me/`, `POST /api/v1/users/change_password/`, `PATCH /api/v1/tenants/me_update/` |
| Facturation | `/api/v1/billing/wallets/`, `/api/v1/billing/abonnements/mon-abonnement/`, `/api/v1/billing/plans/`, `/api/v1/billing/transactions/` |
| Base de connaissance | `/api/v1/knowledge/profils/`, `/api/v1/knowledge/faqs/`, `/api/v1/knowledge/questions/` |

### ❌ Modules à auditer + intégrer (objet de cette session)

1. **Rendez-vous** (`/pme/appointments`) → `apps/appointments/` + `apps/services/`
2. **Bots** (`/pme/bots`) → `apps/bots/`
3. **Tableau de bord** (`/pme/dashboard`) → `apps/dashboard/`

### ⚠️ Endpoints 404 connus (backend à créer)
- `/api/v1/business-hours` → `HorairesOuverture` (dans `apps/services/`)
- `/api/v1/service-knowledge` → `DescriptionService` (dans `apps/knowledge/`)
- `/api/v1/locations` → `Agence` (dans `apps/services/`)

---

## Alignements de noms déjà faits (important)

Ces types frontend sont **déjà alignés** sur le backend réel :

| Type | Champs backend réels |
|------|---------------------|
| `Service` | `nom`, `prix`, `duree_min` (pas `name`, `price`, `duration_min`) |
| `Wallet` | `solde`, `devise`, `frozen_balance` (pas `balance`, `currency`) |
| `Subscription` | `statut`, `usage_messages`, `plan.nom`, `plan.prix` |
| `Transaction` | `montant`, `service_paiement_nom` |
| `Plan` | `nom`, `prix`, `devise`, `limite_messages`, `limite_appels` |
| `TenantKnowledge` | `site_web`, `email_contact`, `message_accueil`, `duree_rdv_min` |
| `FAQ` | `titre`, `is_active` (conteneur seulement) |
| `QuestionFrequente` | `question_fr/en`, `reponse_fr/en`, `categorie` |

---

## Objectif de cette session — Méthode en 2 phases par module

### Phase 1 — Audit backend (à faire en premier)
Pour chaque module (Rendez-vous, Bots, Dashboard) :

1. **Lire** les modèles Django existants (`models.py`)
2. **Vérifier** la présence de toutes les tables du diagramme de classes
3. **Vérifier** toutes les contraintes relationnelles (FK, OneToOne, M2M)
4. **Vérifier** que les attributs des modèles couvrent tous les besoins du frontend mock
5. **Ajuster** si nécessaire (sans casser les migrations existantes)
6. **Vérifier** les serializers, views, urls — permissions PME
7. **Tester** via Swagger (`http://localhost:8000/api/docs/`)
8. **Documenter** dans un guide de test

**Sources de vérité** :
- **Diagramme de classes + contraintes** → structure des tables et relations
- **Frontend mock actuel** → attributs requis par les tables
- L'intégration frontend = changer la source de données, PAS une refonte

### Phase 2 — Intégration frontend
1. Aligner les types TypeScript sur les vrais champs backend
2. Corriger les URLs dans `repositories/index.ts`
3. Supprimer les gardes `if (!user?.tenant_id) return` → utiliser `user?.entreprise?.id`
4. `npx tsc --noEmit` → zéro erreur

---

## Contraintes modèle de données (source de vérité)

- `User` central unique — 3 types : `superadmin` / `admin` / `entreprise`
- `Profil` : OneToOne avec `User`
- `Entreprise` ↔ `User` : many-to-many via `UserEntreprise`
- Un `NumeroTelephone` autorise max **2 bots** : 1 WhatsApp + 1 Vocal
- `Bot.bot_paire` : OneToOne (WhatsApp ↔ Vocal)
- `Wallet` : OneToOne avec `Entreprise`
- `Abonnement` lié à `Entreprise` (pas au User)
- `ProfilEntreprise` : OneToOne avec `Entreprise` (dans `apps/knowledge/`)
- `FAQ` → `QuestionFrequente` (1 FAQ = N questions)
- `RendezVous` attaché à `Agenda` (obligatoire) et `Service` (optionnel)
- Isolation tenant : chaque requête PME filtrée par `entreprise` du user connecté
- Pattern Strategy : `USE_LOCAL_X=True` → `local.py` / `False` → client microservice

---

## Comptes de test (seed actuel)

| Email | Password | Type |
|-------|----------|------|
| `superadmin@agt.cm` | `Admin@2024!` | superadmin |
| `gabriel@agt.cm` | `Admin@2024!` | admin AGT |
| `pharma@demo.cm` | `Pme@2024!` | PME — Pharmacie |
| `hotel@demo.cm` | `Pme@2024!` | PME — Hôtel |
| `resto@demo.cm` | `Pme@2024!` | PME — Restaurant |
| `clinique@demo.cm` | `Pme@2024!` | PME — Clinique |
| `salon@demo.cm` | `Pme@2024!` | PME — Salon |
| `immo@demo.cm` | `Pme@2024!` | PME — Immobilier |

---

## Commandes utiles

```powershell
# Backend — reset complet
cd agt-assist-backend
docker-compose down
docker-compose up -d --build
docker-compose exec api python manage.py migrate
docker-compose exec api python manage.py seed

# Backend — logs
docker-compose logs api --tail=50

# Backend — shell Django
docker-compose exec api python manage.py shell

# Frontend
cd agt-assist-client
npm run dev
npx tsc --noEmit

# Swagger
# http://localhost:8000/api/docs/
```

---

## Format de réponse attendu

- Structuré, concret, concis
- Code directement exploitable — zéro commentaires d'instructions à supprimer
- Fichiers complets et propres — pas de patches avec des `////` à lire
- Tableau de placement pour chaque fichier livré
- Une tâche à la fois — attendre validation avant la suivante

---

## Première action attendue

Commence par lire les fichiers existants du module à travaillerdans la mémoire avant de proposer quoi que ce soit :
1. `apps/{module}/models.py`
2. `apps/{module}/serializers.py`
3. `apps/{module}/views.py`
4. `apps/{module}/urls.py`

Puis présente un **diagnostic complet** (gaps modèle, permissions manquantes, attributs frontend non couverts) avant toute implémentation.

note à considérer:
*salut, dans une autre session j'ai beacoup avancé dans le backend. j'ai débogué entièrement les 12 endpoints du module auth, création de compte et conexion, avec tout ce qui est au tour,ainis que la facturation,base de connaissance et le profil. j'ai également intégré ous ces poinst dans le frontend et j'ai dans les sources un handoof de fin de session. tu vas scanner complètement la mémoire du projet pour comprendre.
voici mes objectifs:

* vérifier,débogguer,tester,documenter coté backend et intégrer coté frontend les modules, gestion de rendez vous,gestion des bots,demander de l'aide,laisser un témoignage,signaler un problème et tableau de bord, du  backend au frontend,1 à a fois,après quoi je pourrai me concentre sur faire marcher de façon tangible le bot dans l'onglet test avec les appels de fonctions nécessaire car après cette session, je vais installer ollama,vraiment mettre en palec ce bot dans l'app chatbot et mettre sur pied le systeme d'apels de focntion de systeme prompt afin qu'il subisse direct le résulats,je devrai aussi installer waha community pour les sessions et les webhooks urls à configurer à partir de numéros existants.
* continuer les itérations modifs backend+intégration frontend puis-je compter sur toi dans le respect de mon dome de travail ?
je note que tu ne vas exécuter aucun code dans ta console, tout code tu devras me le donner, si tu veux un fichier en détail, tu regarde dans la mémoire sinon tu me le demande avec Get-content path | Set-Clipboard. on travaille de façon méthodique, un bloc à la fois. on commence par reset le backend et le lancer et vérifier+stabiliser le cas échéanbt d'erreurs le build coté frontend.
Dernière chose, dans le backend on devra se rassurer de l'exitence du seeder pour le compte de démo avec un hotel aitd es donnes fiables sur tous les plans :
**Compte démo de référence :** `hotel@demo.cm` / `Pme@2024!`
n'ou blie pas après ton audit de me demander ce que je souhaite faire maintenant.