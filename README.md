# AGT Platform — Backend

API du SaaS multi-secteurs AGT Bots (chatbot WhatsApp + agent vocal IA).
Django 5 + DRF + PostgreSQL 16 + Redis 7 + RabbitMQ 3.13 + Celery 5.

> **Public visé :** développeurs backend ET frontend. Ce guide vous fait passer de zéro à une API qui répond en 5 minutes, sans rien savoir de l'archi.

---

## Sommaire

1. [Prérequis](#1-prérequis)
2. [Démarrage rapide (mode dev)](#2-démarrage-rapide-mode-dev)
3. [URLs et ports](#3-urls-et-ports)
4. [Comptes de test (issus du seed)](#4-comptes-de-test-issus-du-seed)
5. [Tester l'API en PowerShell](#5-tester-lapi-en-powershell)
6. [Commandes courantes](#6-commandes-courantes)
7. [Architecture des services](#7-architecture-des-services)
8. [Troubleshooting](#8-troubleshooting)
9. [Endpoints disponibles](#9-endpoints-disponibles)

---

## 1. Prérequis

| Outil | Version minimale | Vérifier |
|---|---|---|
| Docker Desktop | 4.x avec Compose v2 | `docker --version` |
| Git | 2.x | `git --version` |
| PowerShell | 5.1+ ou 7.x | `$PSVersionTable.PSVersion` |

**Ports requis libres sur la machine hôte :**

| Service | Port hôte |
|---|---|
| API Django | `8011` |
| PostgreSQL | `5432` |
| Redis | `6379` |
| RabbitMQ AMQP | `5672` |
| RabbitMQ Management UI | `15672` |

> ⚠️ Si un de ces ports est occupé, soit vous libérez le port, soit vous adaptez `docker-compose.dev.yml`.

---

## 2. Démarrage rapide (mode dev)

### Première fois — installation complète

Depuis le dossier racine du projet (`agt-assist-backend-final`) :

```powershell
# 1. Préparer les variables d'environnement
cp .env.example .env

# 2. Démarrer toute la stack (db + redis + rabbitmq + api + worker + beat)
docker-compose -f docker-compose.dev.yml up -d

# 3. Attendre ~30 secondes que les healthchecks passent puis vérifier
docker-compose -f docker-compose.dev.yml ps

# 4. Appliquer les migrations
docker-compose -f docker-compose.dev.yml exec api python manage.py migrate

# 5. Charger les données de démo (secteurs, plans, entreprises, comptes de test)
docker-compose -f docker-compose.dev.yml exec api python manage.py seed --reset
```

À la fin du `seed`, vous verrez s'afficher la liste des comptes de test et un résumé de ce qui a été créé.

### Vérification rapide

```powershell
Invoke-WebRequest -Uri http://localhost:8011/api/docs/ -UseBasicParsing | Select-Object StatusCode
# StatusCode = 200 → tout fonctionne
```

### Démarrage suivant (la stack a déjà été initialisée)

```powershell
docker-compose -f docker-compose.dev.yml up -d
```

C'est tout. Pas besoin de re-migrer ni re-seeder, les données persistent dans les volumes.

### Tout arrêter

```powershell
# Stop sans perdre les données
docker-compose -f docker-compose.dev.yml down

# Stop + reset complet (purge la DB et le cache)
docker-compose -f docker-compose.dev.yml down -v
```

---

## 3. URLs et ports

| Service | URL | Description |
|---|---|---|
| **API** | http://localhost:8011/ | Racine de l'API |
| **Swagger UI** | http://localhost:8011/api/docs/ | Documentation interactive |
| **ReDoc** | http://localhost:8011/api/redoc/ | Documentation alternative |
| **Schema OpenAPI** | http://localhost:8011/api/schema/ | Schéma JSON brut |
| **Admin Django** | http://localhost:8011/admin/ | Back-office |
| **RabbitMQ UI** | http://localhost:15672/ | Login: `agt_user` / `agt_password` |

> 📌 **Note pour le frontend :** la base URL de l'API est `http://localhost:8011/api/v1/`. Les endpoints sont préfixés (ex: `/api/v1/auth/login/`, `/api/v1/tenants/`).

---

## 4. Comptes de test (issus du seed)

Tous ces comptes sont créés automatiquement par `manage.py seed --reset`.

### Administrateurs AGT

| Email | Mot de passe | Rôle |
|---|---|---|
| `superadmin@agt.cm` | `Admin@2024!` | Superadmin (accès total) |
| `gabriel@agt.cm` | `Admin@2024!` | Admin AGT |

### Comptes PME de démo

Chaque compte représente une entreprise d'un secteur différent. Mot de passe identique pour tous : `Pme@2024!`.

| Email | Secteur | Entreprise |
|---|---|---|
| `pharma@demo.cm` | Santé | Pharmacie du Centre |
| `hotel@demo.cm` | Hôtellerie | Hotel Hilltop Yaoundé |
| `resto@demo.cm` | Restauration | Restaurant La Terrasse |
| `clinique@demo.cm` | Santé | Clinique Espoir |
| `salon@demo.cm` | Beauté | Salon Beauty Queen |
| `immo@demo.cm` | Immobilier | Immo Invest CM |

### Données de démo associées

Le seed crée également :
- 10 secteurs d'activité
- 5 plans tarifaires (Gratuit → Gold)
- 4 opérateurs téléphoniques
- 5 providers de paiement
- 12 bots
- 5 clients + 5 RDV + 5 conversations sur le tenant Hôtel

---

## 5. Tester l'API en PowerShell

> Utilisez `Invoke-WebRequest` ou son alias `iwr`. Évitez `curl` sous Windows : c'est en réalité `Invoke-WebRequest` aliasé, ce qui pose des soucis de syntaxe.

### Astuce : éviter le warning de sécurité

Ajoutez systématiquement `-UseBasicParsing` :

```powershell
Invoke-WebRequest -Uri http://localhost:8011/api/docs/ -UseBasicParsing
```

### Login PME et récupération du token JWT

```powershell
$body = @{
    email = "hotel@demo.cm"
    password = "Pme@2024!"
} | ConvertTo-Json

$response = Invoke-WebRequest `
    -Uri "http://localhost:8011/api/v1/auth/login/" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body `
    -UseBasicParsing

$tokens = $response.Content | ConvertFrom-Json
$accessToken = $tokens.access
Write-Host "Access token: $accessToken"
```

### Appel d'un endpoint protégé

```powershell
$headers = @{ Authorization = "Bearer $accessToken" }

Invoke-WebRequest `
    -Uri "http://localhost:8011/api/v1/tenants/me/" `
    -Headers $headers `
    -UseBasicParsing | Select-Object -ExpandProperty Content
```

### Lister les features actives du tenant

```powershell
Invoke-WebRequest `
    -Uri "http://localhost:8011/api/v1/features/active/" `
    -Headers $headers `
    -UseBasicParsing | Select-Object -ExpandProperty Content
```

### POST avec payload JSON

```powershell
$body = @{
    nom = "Mon nouveau service"
    prix = 5000
} | ConvertTo-Json

Invoke-WebRequest `
    -Uri "http://localhost:8011/api/v1/services/" `
    -Method POST `
    -Headers $headers `
    -ContentType "application/json" `
    -Body $body `
    -UseBasicParsing
```

---

## 6. Commandes courantes

### Logs

```powershell
# Suivre les logs de l'API en direct
docker-compose -f docker-compose.dev.yml logs -f api

# Logs des workers Celery
docker-compose -f docker-compose.dev.yml logs -f worker

# Logs de tous les services
docker-compose -f docker-compose.dev.yml logs -f
```

### Shell Django

```powershell
docker-compose -f docker-compose.dev.yml exec api python manage.py shell
```

### Accès direct à la base PostgreSQL

```powershell
docker-compose -f docker-compose.dev.yml exec db psql -U agt_user -d agt_platform

# Une seule requête sans rentrer dans psql
docker-compose -f docker-compose.dev.yml exec db psql -U agt_user -d agt_platform -c "\dt"
```

### Re-seed sans détruire les volumes

```powershell
docker-compose -f docker-compose.dev.yml exec api python manage.py seed --reset
```

> Le flag `--reset` efface les données métier puis re-seed. Les migrations ne sont pas touchées.

### Reset complet (dernier recours)

```powershell
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml exec api python manage.py migrate
docker-compose -f docker-compose.dev.yml exec api python manage.py seed --reset
```

### Créer un superuser supplémentaire

```powershell
docker-compose -f docker-compose.dev.yml exec api python manage.py createsuperuser
```

### Lancer les tests

```powershell
docker-compose -f docker-compose.dev.yml exec api pytest
```

### Rebuild après modification du `Dockerfile` ou de `requirements.txt`

```powershell
docker-compose -f docker-compose.dev.yml up -d --build
```

---

## 7. Architecture des services

La stack `docker-compose.dev.yml` lance 6 conteneurs :

| Service | Image | Rôle | Port hôte |
|---|---|---|---|
| `db` | `postgres:16-alpine` | Base de données principale | `5432` |
| `redis` | `redis:7-alpine` | Cache + broker results | `6379` |
| `rabbitmq` | `rabbitmq:3.13-management-alpine` | Broker Celery | `5672` / `15672` |
| `api` | Build local | Django + Gunicorn | `8011` |
| `worker` | Build local | Celery worker (tâches async) | — |
| `beat` | Build local | Celery beat (tâches planifiées) | — |

Les volumes nommés `agt_dev_postgres_data`, `agt_dev_redis_data`, `agt_dev_rabbitmq_data`, `agt_dev_media`, `agt_dev_static` persistent les données entre redémarrages.

---

## 8. Troubleshooting

### `duplicate key value violates unique constraint "pg_class_relname_nsp_index"` lors de `migrate`

Cause : un volume Postgres résiduel d'une ancienne version du projet.

Solution :

```powershell
docker-compose -f docker-compose.dev.yml down -v
docker volume ls | Select-String "agt"
# Supprimer manuellement les volumes orphelins si nécessaire
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml exec api python manage.py migrate
```

### `service "db" is not running`

Vous avez fait `down` mais pas `up`. Relancez :

```powershell
docker-compose -f docker-compose.dev.yml up -d
```

### `role "postgres" does not exist`

Vous utilisez le mauvais utilisateur. Le user Postgres du projet est `agt_user`, pas `postgres` :

```powershell
docker-compose -f docker-compose.dev.yml exec db psql -U agt_user -d agt_platform
```

### `Connection refused` sur http://localhost:8000

Le port n'est pas `8000` mais `8011`. Utilisez :

```powershell
Invoke-WebRequest -Uri http://localhost:8011/api/docs/ -UseBasicParsing
```

### Le warning `the attribute 'version' is obsolete`

Cosmétique, n'affecte rien. Pour le supprimer, retirez la ligne `version: "3.x"` en tête de `docker-compose.dev.yml`.

### Les conteneurs `api`/`worker`/`beat` ne démarrent pas

Vérifiez les logs : `docker-compose -f docker-compose.dev.yml logs api`. Les causes habituelles sont :
- `db` pas encore healthy (attendre 20-30 s puis relancer)
- variables manquantes dans `.env` → comparer avec `.env.example`
- modifications de `requirements.txt` non rebuildées → `up -d --build`

### Le seed plante en cours de route

Lancez avec `--reset` qui purge les données métier avant de re-seeder :

```powershell
docker-compose -f docker-compose.dev.yml exec api python manage.py seed --reset
```

---

## 9. Endpoints disponibles

L'API est versionnée sous `/api/v1/`. Les modules suivants sont exposés :

| Préfixe | Module |
|---|---|
| `/api/v1/auth/` | Authentification (login, refresh, register) |
| `/api/v1/users/` | Gestion utilisateurs |
| `/api/v1/tenants/` | Entreprises et agences |
| `/api/v1/contacts/` | CRM et contacts |
| `/api/v1/features/` | Catalogue de features actives |
| `/api/v1/bots/` | Bots WhatsApp / vocaux |
| `/api/v1/services/` | Services proposés par l'entreprise |
| `/api/v1/appointments/` | Rendez-vous et agendas |
| `/api/v1/conversations/` | Conversations clients |
| `/api/v1/billing/` | Plans, abonnements, factures |
| `/api/v1/knowledge/` | Base de connaissance |
| `/api/v1/feedback/` | Feedback clients |
| `/api/v1/dashboard/` | Métriques et KPI |
| `/api/v1/history/` | Historique des actions |
| `/api/v1/notifications/` | Emails et rappels |
| `/api/v1/chatbot/` | Bridge chatbot |
| `/api/v1/onboarding/` | Parcours d'onboarding PME |
| `/api/v1/catalogue/` | Catalogue produits / items |
| `/api/v1/reservations/` | Ressources et réservations |
| `/api/v1/agent/` | Agent IA et actions |
| `/agt/v1/` | Endpoints internes (admin AGT) |

> 📚 **Documentation complète :** http://localhost:8011/api/docs/

---

## Aller plus loin

- **Documentation de conception :** voir `01_rapport_conception.md` à la racine du repo (modèle de données, règles métier, design patterns)
- **Contrats API :** voir `05_api_contracts.md`
- **Codes d'erreur :** voir `06_error_codes.md`
- **Données de seed :** voir `04_seed_data.md`

---

**Dernière mise à jour :** mai 2026
**Mainteneurs :** équipe backend AGT