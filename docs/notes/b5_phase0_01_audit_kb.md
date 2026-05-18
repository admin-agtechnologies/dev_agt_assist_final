# B5 Phase 0 — Audit KB & Conception des Modèles
## Note de livrable — Session 32 — Gabriel (Lead) — 18/05/2026

> **Usage :** Ce fichier est la référence permanente de la Phase 0.1+0.6 du bloc B5.
> Toute session travaillant sur B5 doit le lire avant d'agir.
> Il est complété à chaque avancement de la Phase 0.

---

## 1. Contexte et objectif

Le bloc B5 (Chaîne métier complète) est sur le chemin critique du Chantier 1.
Il débloques B6 (Stats) et B4 (Tutoriel). La Phase 0 constitue le socle sur lequel
les 20+ itérations de modules métier s'appuient.

Cette note documente les décisions prises en session 32 sur les phases 0.1 et 0.6 :
- Audit exhaustif de toutes les features et leur état d'implémentation
- Validation de l'ordre des itérations
- Conception complète des modèles de données pour les 28 features
- Décisions architecturales validées par Gabriel

---

## 2. Livrables de cette phase

| Fichier | Contenu | Emplacement |
|---|---|---|
| `agt_b5_conception_features_1_12.pdf` | Conception features 1-12 | Outputs S32 + à uploader dans la base de connaissance |
| `agt_b5_conception_features_1_12.tex` | Source LaTeX Overleaf | Outputs S32 |
| `agt_b5_conception_features_1_12.md` | Source Markdown éditable | Outputs S32 |
| `agt_b5_conception_features_13_28.pdf` | Conception features 13-28 + banking | Outputs S32 + à uploader |
| `agt_b5_conception_features_13_28.tex` | Source LaTeX Overleaf | Outputs S32 |
| `agt_b5_conception_features_13_28.md` | Source Markdown éditable | Outputs S32 |

> **Action requise :** uploader les 2 PDFs dans la base de connaissance Claude
> du projet pour qu'ils soient accessibles aux prochaines sessions.

---

## 3. Inventaire complet des 28 features

### 3.1 Features Chantier 1 — In scope

| # | Slug | Secteur principal | KB modèle | Result modèle | Nouveau ? |
|---|---|---|---|---|---|
| 1 | `chatbot_whatsapp` | Tous | `WahaSession` | `AIActionLog` | Non |
| 2 | `faq` | Tous | `FAQ` + `QuestionFrequente` | `ConsultationFAQ` | Partiel |
| 3 | `prise_rdv` | Tous | `Ressource` + `DisponibiliteRessource` | `Reservation` | Non |
| 4 | `reservation_table` | Restaurant | `Ressource` type=table | `Reservation` | Partiel |
| 5 | `reservation_chambre` | Hôtel | `ChambreType` + `Ressource` | `Reservation` | Non |
| 6 | `reservation_billet` | Transport | `CatalogueTrajet` + `Ressource` | `Reservation` | Non |
| 7 | `menu_digital` | Restaurant | `ItemCatalogue` (migration S1→S3) | `Commande` | Migration |
| 9 | `catalogue_produits` | E-commerce | `ItemCatalogue` (migration S2→S3) | `Commande` | Migration |
| 10 | `suivi_commande` | Tous | `Commande` (lecture) | `AIActionLog` | Non |
| 11 | `catalogue_services` | PME/Santé/Custom | `ItemCatalogue` (migration S2→S3) | `AIActionLog` | Migration |
| 12 | `catalogue_trajets` | Transport | `ItemCatalogue` (migration S2→S3) | `AIActionLog` | Migration |
| 13 | `catalogue_produits_financiers` | Banking | `ItemCatalogue` + `DetailsFinanciers` | `AIActionLog` | **NOUVEAU** |
| 14 | `inscription_admission` | Éducation | `ProgrammeAdmission` (enrichi) | `Inscription` (enrichie) | Partiel |
| 15 | `orientation_patient` | Santé | `SpecialiteMedicale` (enrichie) | `Reservation` type=praticien | Partiel |
| 16 | `orientation_citoyens` | Public | `ServiceCitoyen` (enrichi) | `Dossier` (enrichi) | Partiel |
| 17 | `multi_agences` | Tous multi-sites | `Agence` (Bot M2M) | `AIActionLog` | Migration |
| 18 | `gestion_crm` | Tous | `Contact` (enrichi) | `ContactCRMSignal` + `RapportClient` | Partiel |
| 19 | `conciergerie` | Hôtel | `ItemCatalogue` slug=conciergerie | `DemandeConciergerie` | **NOUVEAU** |
| 20 | `communication` | Tous | `ModeleCommunication` | `Annonce` | **NOUVEAU** |
| 21 | `capture_prospect` | Tous | `ScenarioProspection` | `ProspectCapture` (enrichi) | Partiel |
| 25 | `emails_rappel` | Tous | — | `EmailLog` | **NOUVEAU** |
| 26 | `simulation_credit` | Banking | — (calcul pur) | `AIActionLog` | **NOUVEAU** |
| 27 | `suivi_dossier` | Banking | — | `Dossier` type=banking | **NOUVEAU** |
| 28 | `collecte_documents` | Banking | `DetailsFinanciers.documents_requis` | `Dossier.documents_fournis` | **NOUVEAU** |

### 3.2 Features hors scope Chantier 1

| # | Slug | Raison | Badge | Chantier |
|---|---|---|---|---|
| 8 | `commande_paiement` | Provider paiement externe requis | "Bientôt disponible" | C2 |
| 22 | `paiement_en_ligne` | Accord commercial Orange/MTN requis | "Bientôt disponible" | C2 |
| 23 | `dashboard` | Couvert par B6 (Penka) | — | B6 |
| 24 | `agent_vocal` | Pipeline STT/TTS — C2 | "Bientôt disponible" (TOUS secteurs) | C2 |

### 3.3 Base features (tous secteurs, obligatoires)

```
chatbot_whatsapp  is_mandatory=True
faq               is_mandatory=True
emails_rappel     is_mandatory=False
dashboard         is_mandatory=True
agent_vocal       is_mandatory=False  → page "Bientôt disponible"
```

---

## 4. Matrice sectorielle complète (post-session 32)

### Légende
- ✅ = `is_default=True` (activée par défaut à l'onboarding)
- ○ = `is_default=False` (disponible, activable par l'entreprise)
- 🔴 = Hors scope C1 — badge "Bientôt disponible"
- **gras** = feature déjà dans l'ancienne matrice
- *italique* = ajout session 32

### `restaurant`

| Feature | Défaut |
|---|---|
| **`chatbot_whatsapp`** | ✅ obligatoire |
| **`faq`** | ✅ obligatoire |
| **`emails_rappel`** | ✅ |
| **`dashboard`** | ✅ obligatoire |
| `agent_vocal` | ○ 🔴 |
| **`reservation_table`** | ✅ |
| **`menu_digital`** | ✅ |
| **`commande_paiement`** | ○ 🔴 |
| *`suivi_commande`* | ✅ |
| *`prise_rdv`* | ○ (événements, chef's table) |
| *`catalogue_services`* | ○ (traiteur, cours de cuisine) |
| *`gestion_crm`* | ✅ |
| *`capture_prospect`* | ○ |
| *`communication`* | ○ |
| *`multi_agences`* | ○ |
| *`paiement_en_ligne`* | ○ 🔴 |

### `hotel`

| Feature | Défaut |
|---|---|
| **`chatbot_whatsapp`** | ✅ obligatoire |
| **`faq`** | ✅ obligatoire |
| **`emails_rappel`** | ✅ |
| **`dashboard`** | ✅ obligatoire |
| `agent_vocal` | ○ 🔴 |
| **`reservation_chambre`** | ✅ |
| **`conciergerie`** | ✅ |
| *`prise_rdv`* | ✅ (spa, activités, transfers) |
| *`catalogue_services`* | ○ (spa, excursions) |
| *`menu_digital`* | ○ (restaurant interne) |
| *`suivi_commande`* | ○ (room service) |
| *`multi_agences`* | ○ |
| *`gestion_crm`* | ✅ |
| *`capture_prospect`* | ○ |
| *`communication`* | ○ |
| *`paiement_en_ligne`* | ○ 🔴 |

### `sante`

| Feature | Défaut |
|---|---|
| **`chatbot_whatsapp`** | ✅ obligatoire |
| **`faq`** | ✅ obligatoire |
| **`emails_rappel`** | ✅ |
| **`dashboard`** | ✅ obligatoire |
| `agent_vocal` | ○ 🔴 |
| **`prise_rdv`** | ✅ |
| **`orientation_patient`** | ✅ |
| *`catalogue_services`* | ✅ (consultations, examens, bilans) |
| *`gestion_crm`* | ✅ |
| *`multi_agences`* | ○ (groupe médical) |
| *`capture_prospect`* | ○ |
| *`communication`* | ○ |
| *`inscription_admission`* | ○ (si formation médicale interne) |
| *`paiement_en_ligne`* | ○ 🔴 |

### `banque`

| Feature | Défaut |
|---|---|
| **`chatbot_whatsapp`** | ✅ obligatoire |
| **`faq`** | ✅ obligatoire |
| **`emails_rappel`** | ✅ |
| **`dashboard`** | ✅ obligatoire |
| `agent_vocal` | ○ 🔴 |
| **`prise_rdv`** | ✅ |
| **`catalogue_produits_financiers`** | ✅ |
| **`multi_agences`** | ○ |
| *`simulation_credit`* | ✅ (NOUVEAU C1) |
| *`suivi_dossier`* | ✅ (NOUVEAU C1) |
| *`collecte_documents`* | ✅ (NOUVEAU C1) |
| *`gestion_crm`* | ✅ |
| *`capture_prospect`* | ○ |
| *`communication`* | ○ |
| *`paiement_en_ligne`* | ○ 🔴 |

### `education`

| Feature | Défaut |
|---|---|
| **`chatbot_whatsapp`** | ✅ obligatoire |
| **`faq`** | ✅ obligatoire |
| **`emails_rappel`** | ✅ |
| **`dashboard`** | ✅ obligatoire |
| `agent_vocal` | ○ 🔴 |
| **`prise_rdv`** | ✅ (admissions, orientation) |
| **`inscription_admission`** | ✅ |
| **`communication`** | ✅ |
| *`catalogue_services`* | ✅ (formations, cursus) |
| *`gestion_crm`* | ✅ |
| *`multi_agences`* | ○ (multi-campus) |
| *`capture_prospect`* | ○ (futurs étudiants) |

### `ecommerce`

| Feature | Défaut |
|---|---|
| **`chatbot_whatsapp`** | ✅ obligatoire |
| **`faq`** | ✅ obligatoire |
| **`emails_rappel`** | ✅ |
| **`dashboard`** | ✅ obligatoire |
| `agent_vocal` | ○ 🔴 |
| **`catalogue_produits`** | ✅ |
| **`commande_paiement`** | ○ 🔴 |
| **`suivi_commande`** | ✅ |
| *`prise_rdv`* | ○ (showroom, démonstration) |
| *`capture_prospect`* | ✅ |
| *`gestion_crm`* | ✅ |
| *`communication`* | ○ |
| *`multi_agences`* | ○ |
| *`paiement_en_ligne`* | ○ 🔴 |

### `transport`

| Feature | Défaut |
|---|---|
| **`chatbot_whatsapp`** | ✅ obligatoire |
| **`faq`** | ✅ obligatoire |
| **`emails_rappel`** | ✅ |
| **`dashboard`** | ✅ obligatoire |
| `agent_vocal` | ○ 🔴 |
| *`catalogue_trajets`* | ✅ |
| *`reservation_billet`* | ✅ |
| *`suivi_commande`* | ✅ (suivi billet) |
| *`multi_agences`* | ✅ (gares/agences) |
| *`prise_rdv`* | ○ (fret, réclamations) |
| *`gestion_crm`* | ✅ |
| *`capture_prospect`* | ○ |
| *`communication`* | ○ (alertes perturbations) |
| *`paiement_en_ligne`* | ○ 🔴 |

### `pme`

| Feature | Défaut |
|---|---|
| **`chatbot_whatsapp`** | ✅ obligatoire |
| **`faq`** | ✅ obligatoire |
| **`emails_rappel`** | ✅ |
| **`dashboard`** | ✅ obligatoire |
| `agent_vocal` | ○ 🔴 |
| *`catalogue_services`* | ✅ |
| *`prise_rdv`* | ✅ |
| *`capture_prospect`* | ✅ (cœur PME) |
| *`gestion_crm`* | ✅ |
| *`catalogue_produits`* | ○ (si vend des produits) |
| *`suivi_commande`* | ○ |
| *`communication`* | ○ |
| *`multi_agences`* | ○ |
| *`commande_paiement`* | ○ 🔴 |

### `public`

| Feature | Défaut |
|---|---|
| **`chatbot_whatsapp`** | ✅ obligatoire |
| **`faq`** | ✅ obligatoire |
| **`emails_rappel`** | ✅ |
| **`dashboard`** | ✅ obligatoire |
| `agent_vocal` | ○ 🔴 |
| *`orientation_citoyens`* | ✅ |
| *`prise_rdv`* | ✅ (RDV mairie/préfecture) |
| *`communication`* | ✅ (annonces administratives) |
| *`gestion_crm`* | ○ (suivi citoyens, optionnel) |
| *`multi_agences`* | ○ (services déconcentrés) |
| *`capture_prospect`* | ○ |

### `custom`

Toutes les features disponibles à `is_default=False`. L'entreprise choisit librement.

---

## 5. Décisions architecturales validées

### 5.1 Architecture 3 couches de traçabilité

| Couche | Modèle | Qui écrit |
|---|---|---|
| Communication | `AIConversation` / `AIMessage` | Bot + Client |
| Exécution | `AIActionLog` | Bot uniquement |
| Résultat métier | `Reservation`, `Commande`, `Inscription`... | Bot + Entreprise |

**Principe :** toute feature active produit au minimum une vue stats depuis `AIActionLog`.
Aucune feature n'est laissée sans visibilité pour l'entreprise.

### 5.2 Les 4 booléens Feature

```python
entreprise_configure_kb       : BooleanField  default=False
bot_lit_kb                    : BooleanField  default=False
bot_ecrit_result              : BooleanField  default=True
entreprise_peut_ecrire_result : BooleanField  default=False
```

### 5.3 Système de catalogues — Source canonique unique

**Décision définitive :** `ItemCatalogue` (Système 3, `apps/catalogue`) est canonique.
- S1 (`MenuCategorie`/`MenuPlat`) → migrer, frontend conservé
- S2 (`CatalogueProduit`, `CatalogueService`, `CatalogueTrajet`, `ProduitFinancier`) → migrer

### 5.4 Bot M2M Agences

```python
# AVANT (à remplacer)
Bot.agence = ForeignKey(Agence)

# APRÈS (migration)
Bot.agences = ManyToManyField(Agence)
```

Comportement : bot sert 1 agence → sélection auto. Bot sert N agences → demande au client.

### 5.5 Politique d'annulation par type de feature

| Feature | Politique défaut | Config |
|---|---|---|
| `prise_rdv` | libre | Oui |
| `reservation_table` | libre | Oui |
| `reservation_chambre` | avec_frais | Oui |
| `reservation_billet` | non_remboursable | Oui |
| `orientation_patient` | libre | Oui |

### 5.6 Notifications — règle universelle

- WhatsApp = **entrant uniquement** (R5 — jamais proactif)
- Notifications proactives = **email uniquement** via `EmailLog`
- `send_email` refactorisé pour créer un `EmailLog` à chaque appel

### 5.7 Règles critiques par secteur

**Banking :**
- BUG B-001 : bot ne donne jamais le solde d'un compte
- BUG B-002 : bot ne fait jamais de recommandation financière personnalisée
- Calcul `simulation_credit` côté serveur — jamais confié au LLM

**Santé :**
- Bot ne fait jamais de diagnostic
- Urgence → `contact_urgence` immédiat, aucun délai

**Éducation :**
- Bot ne donne jamais de résultats scolaires individuels
- Communications = email uniquement, jamais WhatsApp

**Public :**
- Bot représente une seule entité (un tenant = une institution)
- Hors périmètre → TransfertHumain

### 5.8 Renommages et corrections

| Ancien slug | Nouveau slug | Impact |
|---|---|---|
| `conversion_prospects` | `capture_prospect` | Backend seeder + frontend SECTOR_THEMES + actions CRM |
| `communication_etablissement` | `communication` | Backend seeder + frontend SECTOR_THEMES + tabs |

### 5.9 Seed banking

`seed_bank.py` est actuellement isolé (commande séparée, non appelée par `python manage.py seed`).
**Action S33 :** intégrer dans `SEEDERS_REGISTRY` sous clé `"banking"`.

---

## 6. Nouveaux modèles — résumé rapide

| Modèle | App | Sert à |
|---|---|---|
| `DetailsFinanciers` | `apps/catalogue` | Extension OneToOne produits financiers |
| `ModeleCommunication` | `apps/notifications` | KB templates emails `communication` |
| `Annonce` | `apps/notifications` | ResultRecord envois groupés |
| `ScenarioProspection` | `apps/contacts` | KB questions qualification prospects |
| `DemandeConciergerie` | `apps/reservations` | ResultRecord services hôtel |
| `EmailLog` | `apps/notifications` | Log universel tous emails envoyés |
| `RapportClient` | `apps/contacts` | Analyse globale conversations d'un contact |
| `ContactNote` | `apps/contacts` | Notes manuelles entreprise sur un contact |
| `ConsultationFAQ` | `apps/knowledge` | ResultRecord léger consultation FAQ |
| `TransfertHumain` | `apps/agent` | ResultRecord transferts vers staff |

---

## 7. Modifications modèles existants — résumé

Voir documents PDF pour le détail complet des champs. Les modèles impactés :

`Feature` · `Ressource` · `Reservation` · `ChambreType` · `Commande` · `ItemCatalogue` ·
`QuestionFrequente` · `Contact` · `AIConversation` · `TacheRelance` · `ProspectCapture` ·
`Inscription` · `ProgrammeAdmission` · `ServiceCitoyen` · `Dossier` · `SpecialiteMedicale` ·
`ProfilEntreprise` · `Payment` · `Bot` · `Agence`

---

## 8. Plan Phase 0 — suite

| Session | Tâche | Critère de fin |
|---|---|---|
| **S33** | Migrations + Seeders mis à jour | `python manage.py seed` sans erreur |
| **S34** | Socle KB complet + tour des 9 secteurs | Chaque feature active a son tab KB |
| **S35** | Socle Results + `seed_results` débranchable | Feature active → page Results visible |
| **S36** | Skills système | Bot charge ses skills à la demande |

---

*Note créée en session 32 — Gabriel (Lead) — 18/05/2026*
*À conserver et enrichir à chaque session Phase 0*
