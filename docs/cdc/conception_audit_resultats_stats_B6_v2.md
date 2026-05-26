# Conception — Audit Modèles Résultats + Stats B6 v2
> Rédigé en Session 60 — Gabriel — 24/05/2026
> Statut : **CONCEPTION VALIDÉE SUR CODE RÉEL — Prête à implémenter**
> Audit mené fichier par fichier sur `agt-assist-backend-final/apps/`
> À lire obligatoirement avant toute implémentation de ce périmètre.

---

## 1. Contexte & Objectif

Avant de lancer les stats B6 v2 et les 28 itérations features (B5 Étape 8),
un audit complet des modèles de données résultats a été mené feature par feature,
en lisant le code réel — pas les suppositions.

**Règle appliquée :** le code est la source de vérité. Toute décision de migration
est basée sur le fichier `models.py` réel de l'app concernée.

---

## 2. Résultat de l'audit — Ce qui existait déjà

> Ces migrations ont été **annulées** car le code existant couvre déjà le besoin.

| Supposition initiale | Réalité du code | Décision |
|---|---|---|
| Ajouter `reference_externe` sur `Reservation` | `numero_billet` + `siege` existent déjà comme colonnes dédiées (B5 S33) | ✅ Annulée |
| Créer `TransfertHumain` | Existe dans `apps/conversations/models.py` avec `raison`, `statut`, `agent`, `pris_en_charge_at`, `resolu_at` | ✅ Annulée |
| Ajouter `nb_destinataires` sur `Annonce` | `destinataires_count` existe déjà sur `Annonce` (`apps/notifications/models.py`) | ✅ Annulée |
| Créer table `Document` pour `collecte_documents` | `documents_requis` + `documents_fournis` JSONB sur `Dossier` et `Inscription` suffisants pour Chantier 1 | ✅ Annulée |
| App `communication` | N'existe pas — `Annonce` est dans `apps/notifications/` | ✅ Corrigé |
| App `banking` | N'existe pas — dossiers banking dans `apps/dossiers/` | ✅ Corrigé |

---

## 3. Migrations réelles — 4 migrations + 1 nouvelle app

### Récapitulatif

| # | Fichier migration | App | Contenu | Prochaine migration |
|---|---|---|---|---|
| M2 | `catalogue/migrations/0004_consultationcatalogue.py` | `catalogue` | Nouvelle table `ConsultationCatalogue` | 0004 |
| M5 | `tenants/migrations/0004_consultationagence.py` | `tenants` | Nouvelle table `ConsultationAgence` | 0004 |
| M6 | `sante/migrations/0001_initial.py` | `sante` (**nouvelle app**) | Nouvelle table `OrientationPatient` | 0001 |
| M7 | `dossiers/migrations/0004_simulationcredit.py` | `dossiers` | Nouvelle table `SimulationCredit` | 0004 |
| M9 | `contacts/migrations/0005_interactioncontact_types.py` | `contacts` | +3 TYPE_CHOICES sur `InteractionContact` | 0005 |

---

### M2 — `ConsultationCatalogue` dans `apps/catalogue/`

**Features couvertes :** `menu_digital` · `catalogue_produits` · `catalogue_services` ·
`catalogue_trajets` · `catalogue_produits_financiers`

**Problème :** Ces features ne font que lire le catalogue. Aucun enregistrement résultat.
Stats = 0 donnée exploitable.

**Modèle :**

```python
class ConsultationCatalogue(models.Model):
    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(
        "agent.AIConversation", on_delete=models.CASCADE,
        related_name="consultations_catalogue"
    )
    feature      = models.ForeignKey(
        "features.Feature", on_delete=models.PROTECT,
        related_name="consultations_catalogue"
    )
    item         = models.ForeignKey(
        "catalogue.ItemCatalogue", on_delete=models.SET_NULL,
        null=True, blank=True, related_name="consultations"
    )
    item_nom     = models.CharField(max_length=200, blank=True)  # snapshot
    action_slug  = models.CharField(max_length=100)  # list_catalogue_items / get_item_detail
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "agt_consultations_catalogue"
        ordering = ["-created_at"]
        indexes  = [
            models.Index(fields=["conversation"]),
            models.Index(fields=["feature", "created_at"]),
            models.Index(fields=["item"]),
        ]
```

**Ce que ça débloque :** top items consultés · volume par jour · taux détail vs liste.

**Actions agent à mettre à jour :** `list_catalogue_items` · `get_item_detail`

---

### M5 — `ConsultationAgence` dans `apps/tenants/`

**Feature couverte :** `multi_agences`

**Problème :** `get_agences` retourne une liste, aucun log. Stats nulles.

**Modèle :**

```python
class ConsultationAgence(models.Model):
    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(
        "agent.AIConversation", on_delete=models.CASCADE,
        related_name="consultations_agence"
    )
    agence       = models.ForeignKey(
        "tenants.Agence", on_delete=models.SET_NULL,
        null=True, blank=True, related_name="consultations"
    )
    agence_nom   = models.CharField(max_length=200, blank=True)  # snapshot
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "agt_consultations_agence"
        ordering = ["-created_at"]
        indexes  = [
            models.Index(fields=["conversation"]),
            models.Index(fields=["agence", "created_at"]),
        ]
```

**Action agent à mettre à jour :** `get_agences`

**Rationale placement :** `Agence` vit dans `apps/tenants/models.py`.
Créer une app `agences` séparée = sur-engineering.

---

### M6 — `OrientationPatient` dans nouvelle app `apps/sante/`

**Feature couverte :** `orientation_patient`

**Problème :** 🔴 Bloquant. Aucune table résultat. Actions `get_specialites` et
`get_specialite_par_symptomes` n'écrivent rien en base.

**Scaffolding requis :**
```bash
docker-compose -f docker-compose.dev.yml exec api python manage.py startapp sante apps/sante
```
Puis ajouter `"apps.sante"` dans `config/settings.py` → `INSTALLED_APPS`.

**Modèle :**

```python
class OrientationPatient(models.Model):
    URGENCE_CHOICES = [
        ("urgent",     "Urgent"),
        ("normal",     "Normal"),
        ("non_urgent", "Non urgent"),
    ]

    id                 = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation       = models.ForeignKey(
        "agent.AIConversation", on_delete=models.CASCADE,
        related_name="orientations_patient"
    )
    specialite         = models.CharField(max_length=200)
    symptomes          = models.JSONField(default=list)
    niveau_urgence     = models.CharField(
        max_length=20, choices=URGENCE_CHOICES, blank=True
    )
    disclaimer_affiche = models.BooleanField(default=True)
    created_at         = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "agt_orientations_patient"
        ordering = ["-created_at"]
        indexes  = [
            models.Index(fields=["conversation"]),
            models.Index(fields=["specialite", "created_at"]),
        ]
```

**Action agent à mettre à jour :** `get_specialite_par_symptomes`

---

### M7 — `SimulationCredit` dans `apps/dossiers/`

**Feature couverte :** `simulation_credit`

**Problème :** 🔴 Bloquant. Données dans `AIActionLog.response_recue` JSONB.
Impossible à agréger. `class Simulation` → 0 résultat dans tout le codebase.

**Placement :** `apps/dossiers/` — pas d'app `banking` séparée. Les dossiers
banking vivent dans `apps/dossiers/`. C'est le bon endroit.

**Modèle :**

```python
class SimulationCredit(models.Model):
    TYPE_CHOICES = [
        ("immobilier", "Immobilier"),
        ("auto",       "Auto"),
        ("personnel",  "Personnel"),
        ("autre",      "Autre"),
    ]

    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(
        "agent.AIConversation", on_delete=models.CASCADE,
        related_name="simulations_credit"
    )
    montant      = models.DecimalField(max_digits=15, decimal_places=2)
    duree_mois   = models.IntegerField()
    taux         = models.DecimalField(max_digits=5, decimal_places=2)
    mensualite   = models.DecimalField(max_digits=15, decimal_places=2)
    type_credit  = models.CharField(
        max_length=20, choices=TYPE_CHOICES, default="autre"
    )
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "agt_simulations_credit"
        ordering = ["-created_at"]
        indexes  = [
            models.Index(fields=["conversation"]),
            models.Index(fields=["type_credit", "created_at"]),
        ]
```

**Action agent à mettre à jour :** `simulate_credit`

---

### M9 — `InteractionContact.TYPE_CHOICES` dans `apps/contacts/`

**0 migration Django** — les `choices` sont des métadonnées Python, pas des
contraintes DB. Un simple diff sur `models.py` suffit.

**Types existants (8) :**
```python
("conversation",  "Conversation WhatsApp"),
("rendez_vous",   "Rendez-vous"),
("commande",      "Commande"),
("reservation",   "Réservation"),
("message",       "Message"),
("inscription",   "Inscription"),
("dossier",       "Dossier"),
("note",          "Note manuelle"),
```

**Types à ajouter (3) :**
```python
("consultation_catalogue", "Consultation catalogue"),
("orientation_patient",    "Orientation patient"),
("consultation_agence",    "Consultation agence"),
```

**Rationale :** Ces 3 nouveaux types permettent de tracer les nouvelles tables
dans le fil d'activité de la fiche client. `transfert_humain` n'est pas ajouté
car il est déjà tracé via `conversation` (statut=transferee).

---

## 4. Features suffisantes — aucune migration

| Feature | Table | Champs clés disponibles |
|---|---|---|
| `faq` | `ConsultationFAQ` | `a_trouve_reponse`, `created_at` |
| `chatbot_whatsapp` | `AIConversation` | `statut`, `canal`, `nb_messages`, `created_at` |
| `conciergerie` | `DemandeConciergerie` | `statut`, `service`, `contact`, `created_at` |
| `gestion_crm` | `Contact` + `InteractionContact` + `ContactCRMSignal` + `RapportClient` | Complet — `resume_ia`, signaux, interactions, rapport global |
| `capture_prospect` | `ProspectCapture` | `score_qualification`, `infos_collectees`, `created_at` |
| `emails_rappel` | `EmailLog` | `statut`, `source_type`, `created_at` |
| `commande_paiement` | `Commande` + `LigneCommande` | `montant_total`, `statut`, `numero_commande` |
| `suivi_commande` | `Commande` | `statut` exposé |
| `prise_rdv` | `Reservation` | `statut`, `date_debut`, `necessite_rappel` |
| `reservation_table` | `Reservation` | `statut`, `nb_personnes`, `zone` |
| `reservation_chambre` | `Reservation` | `statut`, `date_debut/fin` (type chambre via `ressource.chambre_type`) |
| `reservation_billet` | `Reservation` | `numero_billet`, `siege` (colonnes dédiées B5 S33) |
| `transfert_humain` | `TransfertHumain` (`apps/conversations/`) | `statut`, `raison`, `agent`, `pris_en_charge_at` |
| `communication` | `Annonce` (`apps/notifications/`) | `statut`, `destinataires_count`, `date_envoi_effectif` |
| `inscription_admission` | `Inscription` (`apps/inscriptions/`) | `statut`, `numero_dossier`, `filiere`, `documents_fournis` |
| `orientation_citoyens` | `Dossier` (`apps/dossiers/`) | `statut`, `numero_dossier`, `type_demande`, `service_citoyen` |
| `suivi_dossier` | `Dossier` (`apps/dossiers/`) | `statut`, `numero_dossier` (format BNK-) |
| `collecte_documents` | `Dossier.documents_fournis` JSONB | Suffisant Chantier 1 |

---

## 5. Actions agent à mettre à jour (4)

| Action slug | Modification | Nouvelle table |
|---|---|---|
| `list_catalogue_items` | Créer `ConsultationCatalogue` après lecture | `ConsultationCatalogue` |
| `get_item_detail` | Créer `ConsultationCatalogue` après lecture détail | `ConsultationCatalogue` |
| `get_agences` | Créer `ConsultationAgence` après retour liste | `ConsultationAgence` |
| `get_specialite_par_symptomes` | Créer `OrientationPatient` après orientation | `OrientationPatient` |
| `simulate_credit` | Créer `SimulationCredit` après calcul | `SimulationCredit` |

---

## 6. Seeders à adapter

Les seeders sectoriels suivants doivent créer des entrées dans les nouvelles tables :

| Seeder | Nouvelles entrées à créer |
|---|---|
| `restaurant.py`, `hotel.py`, `ecommerce.py`, `transport.py`, `pme.py` | `ConsultationCatalogue` |
| `banque.py` | `SimulationCredit` |
| `sante.py` | `OrientationPatient` |
| `public.py` | (rien — `Dossier` suffit) |
| Tous secteurs avec multi-agences | `ConsultationAgence` |

---

## 7. Conception Stats B6 v2 — Décisions validées

### 7.1 Architecture générale — 3 niveaux

```
N1 — /bots onglet Stats      → stats par bot, par feature active
N2 — /statistiques           → stats cross-bots, données cumulées
N3 — /dashboard              → vue exécutive sectorielle macro
```

**Pas d'app Django séparée.** Enrichissement de `apps/agent/bot_stats.py`
et `apps/dashboard/views.py`. Architecture existante conservée.

---

### 7.2 N3 — Dashboard `/dashboard`

**Layout :**
```
[ KPI sectoriel 1 ] [ KPI sectoriel 2 ] [ KPI fixe 1 ] [ KPI fixe 2 ]
[ Courbe multi-features — une ligne par feature active ─────────────── ]
[ Widgets sectoriels existants ─────────────────────────────────────── ]
```

**KPIs fixes (tous secteurs) :** Conversations (période) · Actions déclenchées

**KPIs sectoriels dynamiques selon `secteur_slug` :**

| Secteur | KPI 1 | KPI 2 |
|---|---|---|
| `restaurant` | Réservations table | Menus consultés |
| `hotel` | Réservations chambre | Taux occupation |
| `banque` | Dossiers traités | Simulations crédit |
| `sante` | Orientations patient | RDV planifiés |
| `education` | Inscriptions | Dossiers admis |
| `ecommerce` | Commandes | Catalogues consultés |
| `transport` | Billets réservés | Trajets consultés |
| `pme` | Prospects capturés | Contacts CRM |
| `public` | Dossiers citoyens | Orientations |
| `custom` | Prospects capturés | Transferts humains |

**Courbe principale :** AreaChart multi-lignes — une ligne par feature active.
Filtres : 7j / 30j / 90j (défaut 30j). Clic → redirect `/statistiques`.

---

### 7.3 N2 — Statistiques `/statistiques`

**Filtres :** Périmètre bots (tous ou 1) · Période (Jour/Semaine/Mois/3m/6m/An/Perso)

**Contenu par tab feature :**
```
[ KPI 1 ] [ KPI 2 ] [ KPI 3 ] [ KPI 4 ]
[ AreaChart temporelle — volume par jour ]
[ 3 dernières entrées ]
[ Bouton → Voir tous les résultats ]
```

---

### 7.4 N1 — Tab Stats `/bots`

**Filtres période :** Jour / Semaine / Mois / 3 mois / 6 mois / Année / Personnalisée

**Contenu par feature :**
```
┌─ Feature [icône] [label] ─────────────── [toggle masquer] ──┐
│ [ KPI 1 ] [ KPI 2 ] [ KPI 3 ] [ KPI 4 ]                    │
│ [ AreaChart volume/jour ] [ BarChart comparaison semaines ]  │
│ [ 3 dernières entrées ]   [ → Voir résultats ]              │
└─────────────────────────────────────────────────────────────┘
```

---

### 7.5 Backend — Enrichissements nécessaires (S61)

**`apps/agent/bot_stats.py`** — ajouter `historique` par feature :
```python
{
  "feature_slug": {
    "kpis": { ... },
    "historique": [
      {"date": "2026-05-01", "valeur": 12},
      ...
    ]
  }
}
```

**`apps/dashboard/views.py`** — ajouter `kpis_sectoriels` dynamiques
selon `entreprise.secteur.slug`.

---

## 8. Feuille de route complète

| Session | Contenu | Dépendances | Charge |
|---|---|---|---|
| **S60** | 4 migrations + scaffolding app `sante` + update 5 actions agent + seeders + tests | — | L |
| **S61** | Backend stats v2 — `historique` par feature + KPIs sectoriels 10 secteurs | S60 ✅ | M |
| **S62** | Frontend N1 StatsTab refondu (filtres + AreaChart + BarChart + drill-down) | S61 ✅ | M |
| **S63** | Frontend N2 `/statistiques` + N3 `/dashboard` | S61 ✅ | L |
| **S64** | Modales conversations unifiées + audit tabs /results + /bots + UI-2 améliorée | S63 ✅ | M |
| **S65+** | 28 itérations features B5 Étape 8 | S64 ✅ UI-1+UI-2 validées | XL |

---

## 9. Prérequis avant S65 (28 itérations)

- [ ] UI-1 `/bots` validée par Gabriel
- [ ] UI-2 `/bots/[id]/test` validée par Gabriel
- [ ] `docs/bugs/` — 28 fichiers créés (commande PowerShell dans `conception_socle_test_b5_etape8.md`)
- [ ] `docs/testing/FEATURES_QUEUE.md` créé

---

## 10. Ordre d'implémentation S60

```
1. Scaffolding app sante
   docker-compose -f docker-compose.dev.yml exec api python manage.py startapp sante apps/sante
   → Ajouter "apps.sante" dans config/settings.py

2. Générer les 4 modèles (models.py dans chaque app)
   catalogue/models.py    → +ConsultationCatalogue
   tenants/models.py      → +ConsultationAgence
   sante/models.py        → OrientationPatient (fichier créé)
   dossiers/models.py     → +SimulationCredit

3. Générer les 4 migrations
   makemigrations catalogue → 0004_consultationcatalogue
   makemigrations tenants   → 0004_consultationagence
   makemigrations sante     → 0001_initial
   makemigrations dossiers  → 0004_simulationcredit

4. Diff contacts/models.py → +3 TYPE_CHOICES sur InteractionContact

5. migrate → vérifier 0 erreur

6. Update 5 actions agent

7. Adapter seeders sectoriels

8. Re-seed demo-custom@agt.cm / Demo@2024!

9. Tests invoque-request sur chaque nouvelle table
```

---

## 11. Compte de test S60

```
Email    : demo-custom@agt.cm
Password : Demo@2024!
API      : http://localhost:8011
```

Login :
```powershell
$r = Invoke-RestMethod -Uri "http://localhost:8011/api/v1/auth/login/" `
     -Method POST -ContentType "application/json" `
     -Body '{"email":"demo-custom@agt.cm","password":"Demo@2024!"}'
$token = $r.access
```
