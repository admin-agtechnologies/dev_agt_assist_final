# Rapport de session — session_32_gabriel.md
**Session :** 32
**Membre :** Gabriel (Lead / Tech Lead)
**Date :** 18 mai 2026
**Durée estimée :** session longue (~8h)
**Bloc principal :** B5 — Chaîne métier complète (Phase 0)

---

## 1. Objectif de la session

Démarrer le bloc B5 (chemin critique) en réalisant la Phase 0 complète :
audit exhaustif de toutes les features, conception du modèle de données,
validation de l'ordre des itérations.

---

## 2. Ce qui a été accompli

### 2.1 Tour complet des 28 features

Chaque feature a été passée en revue une à une avec la méthode suivante :
- Ce qui existe déjà en base
- Ce qui manque (modèles, champs, actions bot, tabs frontend)
- Recommandation avec justification
- Validation Gabriel
- Clarifications sur les zones d'ombre

**Features validées in scope C1 :** 24 features
**Features hors scope C1 :** 4 (commande_paiement, paiement_en_ligne, agent_vocal, dashboard/B6)
**Nouvelles features banking ajoutées :** 3 (simulation_credit, suivi_dossier, collecte_documents)

### 2.2 Décisions architecturales majeures

#### Modèle de données

- **4 booléens Feature** validés :
  `entreprise_configure_kb`, `bot_lit_kb`, `bot_ecrit_result`, `entreprise_peut_ecrire_result`

- **Architecture 3 couches** validée :
  Communication (AIConversation) / Exécution (AIActionLog) / Résultat métier

- **Système de catalogues** : S3 (`ItemCatalogue`) devient l'unique source canonique.
  S1 (`MenuPlat`) et S2 (`CatalogueProduit`, `CatalogueService`, `CatalogueTrajet`,
  `ProduitFinancier`) sont dépréciés et leurs données migrées vers S3.

- **Bot M2M Agences** : `Bot.agence FK` → `Bot.agences ManyToManyField`.
  Un bot peut servir N agences configurables. Si N>1, le bot demande la ville au client.

- **`DetailsFinanciers`** : extension OneToOne sur `ItemCatalogue` pour le secteur banking.
  5 grands types : compte / credit / epargne / carte / transfert. `sous_type` libre.

- **`ResultRecord`** abstrait à créer comme base commune de tous les résultats.

#### Actions bot à créer (7 nouvelles)

`search_faq(query)` · `get_menu(categorie?)` · `get_catalogue(query?, categorie?)` ·
`get_services(query?)` · `get_trajets(depart?, arrivee?)` · `get_room_types()` ·
`get_order_status(numero_commande)` · `get_agences(ville?)` · `get_specialites()` ·
`get_specialite_par_symptomes(symptoms)` · `get_programmes(niveau?, filiere?)` ·
`get_services_publics(categorie?)` · `get_services_conciergerie(type?)` ·
`get_annonces(type?)` · `create_annonce(type, variables, filtre)` ·
`simulate_credit(montant, duree_mois, taux_annuel?)` ·
`get_dossier_statut(numero_dossier)` · `create_dossier_banking(type_demande)` ·
`list_documents_requis(produit_ou_type_dossier)` · `confirmer_document(dossier_id, document_nom)`

#### Nouveaux modèles à créer (10)

`DetailsFinanciers` · `ModeleCommunication` · `Annonce` · `ScenarioProspection` ·
`DemandeConciergerie` · `EmailLog` · `RapportClient` · `ContactNote` ·
`ConsultationFAQ` · `TransfertHumain`

#### Modifications de modèles existants (20+ modèles)

Voir les 2 documents PDF pour le détail complet de chaque champ.
Modèles impactés : `Feature`, `Ressource`, `Reservation`, `ChambreType`, `Commande`,
`ItemCatalogue`, `QuestionFrequente`, `Contact`, `AIConversation`, `TacheRelance`,
`ProspectCapture`, `Inscription`, `ProgrammeAdmission`, `ServiceCitoyen`, `Dossier`,
`SpecialiteMedicale`, `ProfilEntreprise`, `Payment`, `Bot`, `Agence`.

### 2.3 Renommages validés

| Ancien | Nouveau | Raison |
|---|---|---|
| `conversion_prospects` | `capture_prospect` | Plus précis — entrée inbound uniquement |
| `communication_etablissement` | `communication` | Feature universelle — nom trop sectoriel |

### 2.4 Matrice sectorielle enrichie

La matrice `SECTOR_MATRIX` du seeder a été enrichie avec :
- `communication` → **tous secteurs** (`is_default=False`)
- `capture_prospect` → **tous secteurs** (`is_default=False`)
- `prise_rdv` → **tous secteurs** (`is_default=False` pour ceux qui ne l'ont pas par défaut)
- `agent_vocal` → **tous secteurs** (`is_default=False`) + page "Bientôt disponible"
- 3 nouvelles features banking : `simulation_credit`, `suivi_dossier`, `collecte_documents`

Voir note `docs/notes/b5_phase0_01_audit_kb.md` pour la matrice complète par secteur.

### 2.5 Corrections de bugs et zones d'ombre identifiées

| Problème | Localisation | Action requise |
|---|---|---|
| FAQ injectée statiquement dans ContextBuilder Bloc 2 | `apps/agent/engine/context.py` | Remplacer par action `search_faq(query)` à la demande — priorité haute |
| `seed_bank.py` isolé du seed central | `apps/tenants/seeders/` | Intégrer dans `SEEDERS_REGISTRY` sous clé `"banking"` en S33 |
| `Bot.agence FK` incompatible avec la vision multi-agences | `apps/agent/models/` | Migrer vers `Bot.agences M2M` en S33 |
| `MenuCategorie/MenuPlat` et `CatalogueProduit` non migrés vers `ItemCatalogue` | Multiple | Migration S33 + validation Gabriel sur compte de test |
| `numero_commande` absent sur `Commande` | `apps/catalogue/models/` | Ajouter — obligatoire, non nullable, format CMD-YYYYMMDD-XXXX |
| `contact FK` absent sur `AIConversation` | `apps/agent/models/` | Vérifier — devrait déjà exister via `create_contact` action |
| FAQ multi-thématiques non exposées dans l'interface | Frontend `/knowledge` | Corriger tab FAQ pour afficher plusieurs conteneurs FAQ distincts |

### 2.6 Notes importantes

**Sur la FAQ :** `search_faq(query)` remplace l'injection statique. Même entreprise avec
100 000 questions → pas d'explosion des tokens. On ne charge que les 3-5 questions
les plus pertinentes selon la demande du client.

**Sur le bot vocal :** `agent_vocal` = même agent IA, nouveau canal. Pipeline :
STT → AIAgent existant → TTS. Aucune duplication de logique métier. Chantier 2.

**Sur la simulation crédit :** calcul côté serveur Django, jamais confié au LLM
(même principe que les montants de commandes). Formule validée.

**Sur `seed_results` (S35) :** seeder de démonstration séparé (`python manage.py seed_results`),
NON inclus dans le seed global. Permet de visualiser les pages Results avant que l'agent
soit opérationnel. Désactivé quand l'agent est prêt.

**Sur le Skills système (S36) :** modèle `Skill` (slug, contenu markdown, feature FK,
secteur FK, version) + chargement on-demand dans le PromptBuilder. Urgence élevée —
c'est ce qui donnera au bot une intelligence comportementale cohérente par feature.

### 2.7 Livrables générés

| Livrable | Format | Description |
|---|---|---|
| `agt_b5_conception_features_1_12` | PDF + TEX + MD | Conception features 1-12, architecture, modèles |
| `agt_b5_conception_features_13_28` | PDF + TEX + MD | Conception features 13-28, banking, hors scope |
| `docs/notes/b5_phase0_01_audit_kb.md` | MD | Note de référence permanente Phase 0 |
| `docs/reports/sessions/session_32_gabriel.md` | MD | Ce rapport |

> **Action requise :** uploader les 2 PDFs dans la base de connaissance Claude du projet.

---

## 3. Ce qui reste à faire — Phase 0

| Session | Tâche | Périmètre |
|---|---|---|
| **S33** | Migrations + Seeders | Toutes les modifications modèles en code + seed_bank intégré + renommages + FeaturesSeeder/AgentSeeder mis à jour |
| **S34** | Socle KB complet | Tabs KB manquants (Tables, Disponibilités, Conciergerie, Communications) + rebranchement Menu/Catalogue sur ItemCatalogue + test par secteur (9 secteurs) |
| **S35** | Socle Results | ResultRecord abstrait + pages Results par feature + seed_results débranchable |
| **S36** | Skills système | Modèle Skill + 30 skills par feature/secteur + intégration PromptBuilder on-demand |

**Après S36 → Phase 0 terminée → Vague 1 (feature pilote à choisir).**

---

## 4. Zones à risque de conflit

| Zone | Risque | Qui alerter |
|---|---|---|
| `apps/features/models/` | Seeder features modifié en S33 — Stéphane a travaillé dessus | Stéphane avant S33 |
| `apps/catalogue/` + `apps/knowledge/` | Migration S1/S2 → S3 — Stéphane a des bugs corrigés ici | Stéphane avant S34 |
| `apps/agent/engine/context.py` | Correction injection FAQ statique — peut impacter le comportement du bot | Tester en mode test après correction |
| `SECTOR_THEMES` frontend | Renommages slugs + nouvelles features | Vérifier avec Penka si elle travaille sur ce fichier |

---

## 5. Décisions reportées (à prendre plus tard)

| Décision | Contexte | Quand |
|---|---|---|
| Choix feature pilote Vague 1 | Quelle feature tester en premier avec l'agent réel | Début S37 |
| KPI dashboard par secteur | Tableau proposé en S32 — à valider formellement | Début B6 |
| Provider STT/TTS pour `agent_vocal` | Twilio vs autre | Chantier 2 |
| Accord commercial Orange Money / MTN MoMo | Bloquant pour `paiement_en_ligne` | Avant déploiement prod |
| Modèles de communication email templates | Contenu des templates par secteur | S34 |

---

## 6. État général du projet après cette session

**B1 (Auth) :** En cours — Steven/Steve
**B2 (Onboarding) :** En cours — Stéphane
**B3 (Facturation) :** C1-C4 validés, C5-C10 en attente
**B5 (Chaîne métier) :** Phase 0.1+0.6 complète — Phase 0.2-0.5 planifiées (S33-S36)
**B6 (Stats) :** En attente de B5
**B4 (Tutoriel) :** En attente de B6

**Chemin critique :** B5 S33 → S34 → S35 → S36 → Vague 1 → B6 → B4

---

*Rapport généré en fin de session 32 — Gabriel (Lead) — 18/05/2026*
*AG Technologies — Confidentiel*
