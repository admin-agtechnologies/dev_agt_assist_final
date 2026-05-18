# AGT Platform — Conception B5 : Base de connaissance & Features
## Chantier 1 — Phase 0 — Features 13 à 28
### Suite du document features 1-12

*Document de référence — Session 32 — Gabriel — 18/05/2026*
*Version complète : toutes les features validées*

---

## Préambule

Ce document est la suite directe du document features 1-12.
Il couvre les features 13 à 28, incluant les 3 nouvelles features banking
ajoutées en Chantier 1. Les mêmes règles s'appliquent.

**Features hors scope Chantier 1 identifiées dans ce document :**
`commande_paiement` (F8) · `paiement_en_ligne` (F22) · `agent_vocal` (F24)
`dashboard` (couvert par B6)

---

## 1. Nouveaux modèles à créer

### 1.1 `DetailsFinanciers` (apps/catalogue ou apps/knowledge)

Extension one-to-one optionnelle sur `ItemCatalogue` pour les produits financiers.

```python
GRAND_TYPE_CHOICES = [compte, credit, epargne, carte, transfert]

class DetailsFinanciers(models.Model):
    item              = OneToOneField(ItemCatalogue, related_name="details_financiers")
    grand_type        = CharField(50, choices=GRAND_TYPE_CHOICES, default="autre")
    sous_type         = CharField(100) blank=True   # libre — "Crédit PME", "Visa Classic"

    taux_annuel_min   = DecimalField(5,2) null=True
    taux_annuel_max   = DecimalField(5,2) null=True
    taux_type         = CharField choices=[fixe, variable, negocie]  default=fixe

    montant_min       = DecimalField(15,2) null=True
    montant_max       = DecimalField(15,2) null=True
    devise            = CharField(10) default="XAF"

    duree_min_mois    = PositiveIntegerField null=True
    duree_max_mois    = PositiveIntegerField null=True

    documents_requis  = JSONField default=[]
    delai_traitement  = CharField(100) blank=True

    conditions_specifiques = JSONField default={}
    mis_a_jour_le     = DateTimeField auto_now=True
```

**5 grands types :**

| Grand type | Slug | Exemples |
|---|---|---|
| Comptes | `compte` | Courant, Épargne, Jeunes, Entreprise |
| Crédits | `credit` | Personnel, PME, Immobilier, Scolaire |
| Épargne & Placement | `epargne` | Livret, Plan épargne, Assurance vie |
| Cartes | `carte` | Visa, Mastercard, Prépayée, Débit |
| Transferts & Services | `transfert` | Mobile money, Virement international |

### 1.2 `ModeleCommunication` (apps/notifications — à créer)

KB pour la feature `communication_etablissement`.

```python
TYPE_CHOICES = [
    annonce_generale, resultats_scolaires, absence, evenement,
    convocation, urgence, rappel_echeance, autre
]

class ModeleCommunication(models.Model):
    entreprise            = FK(Entreprise)
    type_communication    = CharField choices=TYPE_CHOICES
    titre_template        = CharField(200)
    corps_template        = TextField
    variables_disponibles = JSONField list default=[]
    is_active             = BooleanField default=True
    secteur               = FK(SecteurActivite, null=True)
```

### 1.3 `Annonce` (apps/notifications)

ResultRecord pour `communication_etablissement`.

```python
class Annonce(models.Model):
    STATUT = [brouillon, planifiee, envoyee, echouee]
    entreprise              = FK(Entreprise)
    modele                  = FK(ModeleCommunication, null=True)
    sujet                   = CharField(300)
    corps                   = TextField
    statut                  = CharField choices=STATUT  default=brouillon
    date_envoi_planifiee    = DateTimeField null=True
    date_envoi_effectif     = DateTimeField null=True
    destinataires_count     = PositiveIntegerField default=0
    destinataires_filtre    = JSONField default={}
    envoye_par              = FK(User, null=True)
    source                  = CharField choices=[admin, bot]  default=admin
    created_at              = DateTimeField auto_now_add=True
```

### 1.4 `ScenarioProspection` (apps/contacts)

KB pour la feature `capture_prospect`.

```python
DECLENCHEUR_CHOICES = [premier_message, mot_cle, toujours]

class ScenarioProspection(models.Model):
    entreprise    = FK(Entreprise)
    nom           = CharField(150)
    questions     = JSONField list
                    # [{"ordre": 1, "question": "Quel est votre besoin ?",
                    #   "champ_cible": "interet_principal"}]
    declencheur   = CharField choices=DECLENCHEUR_CHOICES  default=premier_message
    is_active     = BooleanField default=True
```

### 1.5 `DemandeConciergerie` (apps/reservations ou apps/catalogue)

ResultRecord pour la feature `conciergerie`.

```python
class DemandeConciergerie(models.Model):
    STATUT = [recue, prise_en_charge, en_cours, effectuee, annulee]
    contact            = FK(Contact)
    conversation       = FK(AIConversation)
    agence             = FK(Agence)
    service            = FK(ItemCatalogue)
    chambre            = CharField(20) blank=True
    heure_souhaitee    = DateTimeField null=True
    notes_client       = TextField blank=True
    statut             = CharField choices=STATUT  default=recue
    pris_en_charge_par = FK(User, null=True)
    effectuee_le       = DateTimeField null=True
    source             = "bot"
    created_at         = DateTimeField auto_now_add=True
```

### 1.6 `EmailLog` (apps/notifications)

Log complet de tous les emails envoyés — consultable par l'entreprise.

```python
SOURCE_CHOICES = [
    reservation, commande, inscription, dossier,
    annonce, transfert, conciergerie, rappel, autre
]
STATUT_CHOICES = [en_attente, envoye, echec]

class EmailLog(models.Model):
    entreprise   = FK(Entreprise)
    destinataire = EmailField
    sujet        = CharField(300)
    corps        = TextField          # contenu complet lisible par l'entreprise
    template     = CharField(100) blank=True
    statut       = CharField choices=STATUT_CHOICES  default=en_attente
    envoye_le    = DateTimeField null=True
    erreur       = TextField blank=True
    source_type  = CharField choices=SOURCE_CHOICES  blank=True
    source_id    = UUIDField null=True
    created_at   = DateTimeField auto_now_add=True
```

### 1.7 `RapportClient` (apps/contacts)

Rapport global généré par analyse de toutes les conversations d'un contact.

```python
class RapportClient(models.Model):
    contact          = FK(Contact, related_name="rapports")
    resume_global    = TextField
    points_forts     = JSONField list  default=[]
    points_attention = JSONField list  default=[]
    recommandations  = JSONField list  default=[]
    nb_conversations = PositiveIntegerField
    periode_debut    = DateField
    periode_fin      = DateField
    genere_le        = DateTimeField auto_now_add=True
    genere_par       = CharField choices=[bot, admin]  default=bot
```

### 1.8 `ContactNote` (apps/contacts)

Notes manuelles avec historique sur un contact.

```python
class ContactNote(models.Model):
    contact    = FK(Contact, related_name="notes")
    texte      = TextField
    auteur     = FK(User)
    created_at = DateTimeField auto_now_add=True
```

---

## 2. Modifications de modèles existants

### 2.1 `Bot` — nouveaux champs

```
agences                = ManyToManyField(Agence)   # remplace agence FK
                         Migration : agence actuelle = premier élément du M2M
rappel_avant_heures    = PositiveIntegerField default=24
voiceProvider          = CharField(100) blank=True  # pour C2 agent_vocal
```

### 2.2 `Contact` — nouveaux champs

```
statut_crm   : ajouter valeur "contact" (4ème entre prospect et client)
               choices = [prospect, contact, client, inactif]
tags         = JSONField list  default=[]
resume_ia    = TextField blank=True   # dernier RapportClient.resume_global
```

### 2.3 `AIConversation` — nouveaux champs

```
rapport_texte     = TextField blank=True
rapport_genere_le = DateTimeField null=True
points_cles       = JSONField list  default=[]
```

Note : `contact FK` déjà présent dans le modèle actuel ✅

### 2.4 `TacheRelance` — nouveaux champs

```
statut      = CharField choices=[en_attente, executee, echouee]  default=en_attente
executee_le = DateTimeField null=True
```

### 2.5 `ProspectCapture` — nouveaux champs

```
score_qualification  = PositiveIntegerField default=0
notes_qualification  = TextField blank=True
scenario             = FK(ScenarioProspection, null=True)
```

### 2.6 `Inscription` — nouveaux champs

```
statut          : ajouter valeur "documents_manquants"
notes_dossier   = TextField blank=True
```

### 2.7 `ProgrammeAdmission` — nouveaux champs

```
niveau          : enrichir choices avec : primaire, college, lycee, bts_dut,
                  licence, master, doctorat, formation_pro, autre
                  (remplace : primaire, secondaire, superieur, formation_pro)
frais_scolarite_annuels = DecimalField null=True
places_disponibles      = PositiveIntegerField null=True
documents_requis        = JSONField list  default=[]
etapes_inscription      = JSONField list  default=[]
```

### 2.8 `ServiceCitoyen` — nouveaux champs

```
etapes_procedure    = JSONField list  default=[]
horaires_service    = JSONField default={}
delai_relance_jours = PositiveIntegerField default=7
```

### 2.9 `Dossier` — nouveau champ

```
service_citoyen = FK(ServiceCitoyen, null=True)
```

### 2.10 `SpecialiteMedicale` — nouveaux champs

```
mots_cles_symptomes = JSONField list  default=[]
contact_urgence     = CharField(20) blank=True
# Convention dans le JSON medecins :
# [{"nom": "Dr. Mbarga", "titre": "Cardiologue", "ressource_id": "uuid"}]
```

### 2.11 `ProfilEntreprise` — nouveau champ

```
contact_urgence_global = CharField(20) blank=True
```

### 2.12 `Payment` — nouveau champ

```
reservation = FK(Reservation, null=True, blank=True)
```

### 2.13 `ItemCatalogue` — ajout choice `action_suivante`

```
action_suivante : ajouter valeur "traiter_demande"
                  (pour conciergerie)
```

---

## 3. Règles métier transversales (nouvelles)

### 3.1 Distinction email triptyque

| Feature | Cible | Direction | Canal |
|---|---|---|---|
| `capture_prospect` | Inconnus / 1er contact | Entrant WhatsApp | WhatsApp |
| `gestion_crm` | Contacts connus | Consultation admin | Interface |
| `communication_etablissement` | Contacts connus | Sortant | Email uniquement |

### 3.2 Bot M2M agences

Un bot peut servir 1 à N agences (configurable à la création).
- Bot sert 1 agence → sélection automatique, pas de question au client
- Bot sert N agences → le bot demande la ville/agence en début de conversation
- `AIConversation.agence` → renseigné dès la sélection

### 3.3 Garde-fous banking (BUG B-001 / B-002)

- B-001 : le bot ne donne **jamais** le solde d'un compte → décline
- B-002 : le bot ne fait **jamais** de recommandation financière personnalisée → propose un RDV

Ces règles sont dans la description système du Bot (champ `Bot.description`).

### 3.4 Garde-fou santé

Le bot ne fait **jamais** de diagnostic → oriente vers un médecin.
Urgence (mots-clés détectés) → `contact_urgence` immédiat, aucun délai.

### 3.5 Garde-fou éducation

Le bot ne donne **jamais** de résultats scolaires individuels → redirection officielle.
Communications proactives = **email uniquement, jamais WhatsApp**.

### 3.6 Garde-fou secteur public

Le bot représente **une seule entité** → hors périmètre = TransfertHumain.

### 3.7 Seeder banking — intégration centrale

`seed_bank.py` à intégrer dans `SEEDERS_REGISTRY` sous clé `"banking"`.
Actuellement isolé — non appelé par `python manage.py seed`.

### 3.8 Renommage slugs

| Ancien | Nouveau | Impact |
|---|---|---|
| `conversion_prospects` | `capture_prospect` | Backend seeder + frontend SECTOR_THEMES + actions bot |

---

## 4. Fiches features 13 à 28

---

### Feature 13 — `catalogue_produits_financiers`

**Description métier :** Une banque ou microfinance publie ses produits financiers.
Le bot les présente au client et oriente toujours vers un RDV conseiller — sans
jamais donner de conseil personnalisé ni accéder aux données du compte.

**Secteur principal :** Banking (+ tous secteurs via marketplace)

**Ce qui existe :** `ItemCatalogue` (Système 3) + seeder banking avec 5 produits
(Compte Épargne+, Compte Courant Pro, Crédit personnel, Crédit PME...).
Route `/modules/catalogue` fonctionnelle.

**Booléens Feature :**
`entreprise_configure_kb=True` | `bot_lit_kb=True` | `bot_ecrit_result=False`
(AIActionLog uniquement) | `entreprise_peut_ecrire_result=False`

**Actions à mener :**
1. Créer modèle `DetailsFinanciers` (§1.1) — extension OneToOne sur `ItemCatalogue`
2. Migrer `ProduitFinancier` (S2) vers `ItemCatalogue` + `DetailsFinanciers`
3. `action_suivante = "proposer_rdv"` par défaut pour tous les produits financiers
4. Intégrer `seed_bank.py` dans `SEEDERS_REGISTRY` (§3.7)
5. Vérifier garde-fous B-001 et B-002 dans la description Bot banking (§3.3)

**Champs manquants :** `DetailsFinanciers` (nouveau modèle — voir §1.1)

---

### Feature 14 — `inscription_admission`

**Description métier :** Un étudiant ou parent dépose une demande d'admission via
WhatsApp. Le bot le guide, collecte les pièces requises et crée le dossier.
L'établissement le traite depuis son tableau de bord.

**Secteur principal :** Éducation (tous niveaux — primaire à doctorat)

**Ce qui existe :** `Inscription` (apps/inscriptions, complet), `ProgrammeAdmission`
(apps/knowledge, partiellement rempli), actions `create_inscription` et
`get_inscription_statut`.

**Booléens Feature :**
`entreprise_configure_kb=True` | `bot_lit_kb=True` | `bot_ecrit_result=True`
| `entreprise_peut_ecrire_result=True`

**Actions à mener :**
1. Enrichir `ProgrammeAdmission` : `niveau` (8 valeurs), `frais_scolarite_annuels`,
   `places_disponibles`, `documents_requis`, `etapes_inscription` (§2.7)
2. Ajouter sur `Inscription` : `numero_dossier` (auto CMD-YYYYMMDD-XXXX),
   `programme FK`, `est_hors_periode`, `notes_dossier`,
   statut `documents_manquants` (§2.6)
3. Créer action `get_programmes(niveau?, filiere?)`
4. Règle hors période : créer mais signaler, ne jamais refuser (même principe que R14)
5. Notifications : **email uniquement, jamais WhatsApp proactif** (§3.5)
6. Garde-fou : le bot refuse de donner les résultats individuels (§3.5)

---

### Feature 15 — `orientation_patient`

**Description métier :** Un patient décrit ses symptômes. Le bot l'oriente vers la
bonne spécialité et prend le rendez-vous — sans jamais faire de diagnostic.

**Secteur principal :** Santé

**Ce qui existe :** `SpecialiteMedicale` (apps/knowledge), actions
`check_disponibilite` et `create_reservation`, infrastructure Ressource/Reservation.

**Booléens Feature :**
`entreprise_configure_kb=True` | `bot_lit_kb=True` | `bot_ecrit_result=True`
| `entreprise_peut_ecrire_result=True`

**Actions à mener :**
1. Ajouter sur `SpecialiteMedicale` : `mots_cles_symptomes` (JSONField),
   `contact_urgence` (CharField), convention `ressource_id` dans JSON medecins (§2.10)
2. Ajouter `contact_urgence_global` sur `ProfilEntreprise` (§2.11)
3. Créer actions `get_specialites()` et `get_specialite_par_symptomes(symptoms)`
4. Disponibilités médecins : hors scope C1 — créneaux généraux via Ressource
5. Garde-fous dans description Bot (§3.4)

**Hors scope C1 :** gestion fine des agendas médicaux individuels

---

### Feature 16 — `orientation_citoyens`

**Description métier :** Un citoyen demande comment accomplir une démarche
administrative. Le bot l'informe sur les documents et étapes, et ouvre son dossier.

**Secteur principal :** Public

**Ce qui existe :** `ServiceCitoyen` (6 catégories), `Dossier` (très complet :
numero_dossier auto, statuts riches dont `documents_manquants`, JSONB docs requis/fournis).

**Booléens Feature :**
`entreprise_configure_kb=True` | `bot_lit_kb=True` | `bot_ecrit_result=True`
| `entreprise_peut_ecrire_result=True`

**Actions à mener :**
1. Ajouter sur `ServiceCitoyen` : `etapes_procedure`, `horaires_service`,
   `delai_relance_jours` (§2.8)
2. Ajouter sur `Dossier` : `service_citoyen FK` (§2.9)
3. Créer action `get_services_publics(categorie?)`
4. Règle secteur public : le bot représente une seule entité (§3.6)

**Retour sur `Inscription` :** ajouter statut `documents_manquants` par cohérence (§2.6)

---

### Feature 17 — `multi_agences`

**Description métier :** Une entreprise avec plusieurs agences configure chaque bot
pour servir une ou plusieurs agences. Le bot demande au client son agence si
nécessaire.

**Secteur principal :** Banking, Hôtellerie, Transport (toute entreprise multi-sites)

**Ce qui existe :** Architecture Entreprise/Agence bien documentée, R3 (quota agences),
tab "Agences & Horaires" fonctionnel.

**Booléens Feature :**
`entreprise_configure_kb=False` | `bot_lit_kb=True` (lit Agence)
| `bot_ecrit_result=False` | `entreprise_peut_ecrire_result=False`

**Actions à mener :**
1. Migrer `Bot.agence FK` → `Bot.agences M2M` (§2.1)
   Migration : agence actuelle = premier élément du M2M
2. Ajouter sur `Agence` : `latitude`, `longitude`, `description_courte` (§2.1)
3. Créer action `get_agences(ville?)`
4. Logique de sélection agence dans `AIConversation` (§3.2)

**Hors scope C1 :** routing centralisé (un numéro → N bots) = C2

---

### Feature 18 — `gestion_crm`

**Description métier :** Chaque interaction enrichit automatiquement la fiche du
client. L'entreprise dispose d'un CRM vivant alimenté par le bot.

**Secteur principal :** Tous

**Ce qui existe :** `Contact`, `ContactCRMSignal`, `ProspectCapture`,
service layer complet (`find_or_create_contact`, `add_crm_signal`...).
Actions `create_contact` et `convert_prospect` existantes.

**Booléens Feature :**
`entreprise_configure_kb=False` | `bot_lit_kb=True` (lit Contact)
| `bot_ecrit_result=True` | `entreprise_peut_ecrire_result=True`

**Actions à mener :**
1. Enrichir `Contact` : ajouter valeur `contact` dans `statut_crm`, ajouter
   `tags` JSONField, `resume_ia` TextField (§2.2)
2. Créer modèle `ContactNote` (§1.8)
3. Créer modèle `RapportClient` (§1.7)
4. Ajouter sur `AIConversation` : `rapport_texte`, `rapport_genere_le`,
   `points_cles` (§2.3)
5. Page `/contacts` : enrichir avec statuts CRM, tags, notes, timeline, score

---

### Feature 19 — `conciergerie`

**Description métier :** Un client à l'hôtel demande un service (taxi, room service,
blanchisserie). Le bot enregistre la demande, le staff la traite.

**Secteur principal :** Hôtellerie

**Ce qui existe :** `ItemCatalogue` (Système 3) avec `feature_slug="conciergerie"`
déjà dans les scénarios de test. Aucun ResultRecord dédié.

**Booléens Feature :**
`entreprise_configure_kb=True` | `bot_lit_kb=True` | `bot_ecrit_result=True`
| `entreprise_peut_ecrire_result=True`

**Actions à mener :**
1. Créer tab "Conciergerie" dans `/knowledge` → `ItemCatalogue` feature_slug=conciergerie
2. Créer modèle `DemandeConciergerie` (§1.5)
3. Créer action `get_services_conciergerie(type?)`
4. Ajouter `action_suivante = "traiter_demande"` dans les choices (§2.13)
5. Lien chambre : récupérer depuis `Reservation` active si disponible

---

### Feature 20 — `communication_etablissement`

**Description métier :** L'établissement envoie des communications groupées à ses
contacts par email (jamais WhatsApp). Le bot peut répondre aux questions sur les
annonces et déclencher des envois à la demande du staff.

**Secteur principal :** Éducation (+ tous secteurs — `is_default=False`)

**Ce qui existe :** Aucun modèle — à créer de zéro.

**Booléens Feature :**
`entreprise_configure_kb=True` | `bot_lit_kb=True` | `bot_ecrit_result=True`
| `entreprise_peut_ecrire_result=True`

**Actions à mener :**
1. Créer app `apps/notifications/` (si non existante)
2. Créer modèle `ModeleCommunication` (§1.2) — KB des templates
3. Créer modèle `Annonce` (§1.3) — ResultRecord des envois
4. Créer actions `get_annonces(type?)` et `create_annonce(type, variables, filtre)`
5. Ajouter à `SECTOR_MATRIX` pour **tous les secteurs** (`is_default=False`)
6. Route frontend `/modules/communications`

**Règle absolue :** email uniquement, jamais WhatsApp proactif.
**Pièces jointes :** hors scope C1, prévoir champ en C2.

---

### Feature 21 — `capture_prospect` (ex `conversion_prospects`)

**Description métier :** Quand un inconnu envoie son premier message, le bot le
qualifie intelligemment, capture ses coordonnées et crée sa fiche prospect.

**Secteur principal :** Tous (`is_default=False`)

**Ce qui existe :** Actions `capture_prospect` et `convert_prospect` dans
`apps/agent/actions/crm.py`, modèle `ProspectCapture`.

**Booléens Feature :**
`entreprise_configure_kb=True` (ScenarioProspection) | `bot_lit_kb=True`
| `bot_ecrit_result=True` | `entreprise_peut_ecrire_result=False`

**Actions à mener :**
1. Renommer le slug `conversion_prospects` → `capture_prospect` partout
   (backend seeder + frontend SECTOR_THEMES.defaultFeatures) (§3.8)
2. Créer modèle `ScenarioProspection` (§1.4)
3. Enrichir `ProspectCapture` : `score_qualification`, `notes_qualification`,
   `scenario FK` (§2.5)
4. Créer action `get_scenarios_prospection()` pour que le bot lise le scénario actif
5. Ajouter à `SECTOR_MATRIX` pour **tous les secteurs** (`is_default=False`)

**Point d'entrée :** inbound WhatsApp uniquement (R5 — le bot n'initie jamais).
QR code et formulaire web = entrées supplémentaires (C2 pour le web form).

---

### Feature 22 — `paiement_en_ligne` — HORS SCOPE CHANTIER 1

**Description métier :** Paiement direct via MTN MoMo ou Orange Money à travers le bot.

**Décision :** Différé — accord commercial providers requis.
Badge "Bientôt disponible". Infrastructure `apps/payments/` conservée sans extension.

---

### Feature 23 — `dashboard` — Couvert par B6

**Décision :** La feature `dashboard` dans `BASE_FEATURES` est `is_mandatory=True`,
la v1 est fonctionnelle. La refonte en 3 niveaux (B6) est documentée dans
AGT_Chantier1.pdf et assignée à Penka. Hors scope de ce document.

---

### Feature 24 — `agent_vocal` — HORS SCOPE CHANTIER 1

**Description métier :** Le client appelle, l'IA répond en voix.

**Architecture validée :** STT → AIAgent existant → TTS. Même agent, canal différent.
`canal = "vocal"` déjà dans `AIConversation.canal`. Aucun autre changement de modèle.
**Chantier 2 :** brancher le pipeline STT/TTS sur l'agent existant.

---

### Feature 25 — `emails_rappel`

**Description métier :** Après une réservation ou commande, le bot programme
automatiquement un email de rappel envoyé au client avant l'heure prévue.

**Secteur principal :** Tous (BASE_FEATURES)

**Ce qui existe :** Actions `send_email` (stub) et `send_reminder` (crée TacheRelance),
modèle `TacheRelance`, Celery configuré.

**Booléens Feature :**
`entreprise_configure_kb=False` | `bot_lit_kb=False`
| `bot_ecrit_result=True` (EmailLog) | `entreprise_peut_ecrire_result=False`

**Actions à mener :**
1. Créer modèle `EmailLog` (§1.6) — log complet de tous les emails
2. Refactoriser `send_email` pour créer un `EmailLog` à chaque appel
3. Ajouter sur `TacheRelance` : `statut` + `executee_le` (§2.4)
4. Ajouter `rappel_avant_heures` sur `Bot` (défaut 24h) (§2.1)
5. Vérifier tâche Celery planifiée pour l'exécution des rappels
6. Page `/modules/emails` : liste de tous les emails avec contenu lisible
7. Configurer SMTP production

**12 scénarios d'envoi couverts :**
Confirmation réservation · Rappel RDV · Changement statut réservation ·
Confirmation commande · Changement statut commande · Inscription soumise ·
Résultat admission · Documents manquants (dossier) · Dossier traité ·
Communication établissement · Alerte transfert humain · Alerte conciergerie

---

### Feature 26 — `simulation_credit` (BANKING — NOUVEAU C1)

**Description métier :** Un client demande "combien seront mes mensualités pour
un crédit de 2M XAF sur 24 mois à 12% ?". Le bot calcule et répond instantanément,
sans accéder aux données personnelles du client.

**Secteur principal :** Banking

**Ce qui existe :** Aucun modèle ni action dédiée.

**Booléens Feature :**
`entreprise_configure_kb=False` | `bot_lit_kb=False` (calcul pur)
| `bot_ecrit_result=True` (AIActionLog) | `entreprise_peut_ecrire_result=False`

**Formule appliquée par le bot :**
```
mensualite = (montant × taux_mensuel) / (1 - (1 + taux_mensuel)^(-duree_mois))
taux_mensuel = taux_annuel / 12 / 100
cout_total = mensualite × duree_mois
```

**Actions à mener :**
1. Créer action `simulate_credit(montant, duree_mois, taux_annuel?)` :
   - Si `taux_annuel` non fourni → utilise le taux du produit `DetailsFinanciers`
     correspondant (si le client a précisé un produit)
   - Calcul côté serveur (jamais confié au LLM — même principe que les montants)
   - Retourne : `mensualite`, `cout_total`, `cout_interets`
2. Logger dans `AIActionLog` avec payload complet
3. Le bot n'enregistre aucun `ResultRecord` — calcul informatif uniquement

**Garde-fou :** le bot précise toujours "cette simulation est indicative, consultez
un conseiller pour une offre personnalisée."

---

### Feature 27 — `suivi_dossier` (BANKING — NOUVEAU C1)

**Description métier :** Un client suit l'état de sa demande d'ouverture de compte
ou de crédit — sans se déplacer à l'agence.

**Secteur principal :** Banking

**Ce qui existe :** `Dossier` (apps/dossiers) est très complet et générique.
Il est conçu pour le secteur Public mais s'applique parfaitement à Banking.

**Booléens Feature :**
`entreprise_configure_kb=False` | `bot_lit_kb=False` (lit Dossier)
| `bot_ecrit_result=True` (Dossier créé si demande complète)
| `entreprise_peut_ecrire_result=True` (conseiller traite le dossier)

**Actions à mener :**
1. Réutiliser `Dossier` avec `feature_slug = "suivi_dossier"` et types de demande
   banking : `ouverture_compte`, `demande_credit`, `renouvellement_carte`,
   `changement_conseiller`, `reclamation`, `autre`
2. Créer action `get_dossier_statut(numero_dossier)` avec vérification sécurité :
   `Dossier.contact.phone == conversation.contact.phone`
3. Créer action `create_dossier_banking(type_demande)` — guide le client dans
   la constitution de son dossier et liste les documents requis
4. `numero_dossier` auto-généré : format `BNK-YYYYMMDD-XXXX`
5. Notifications email à chaque changement de statut

---

### Feature 28 — `collecte_documents` (BANKING — NOUVEAU C1)

**Description métier :** Le bot guide le client étape par étape dans la liste des
documents à fournir selon le produit financier choisi. L'entreprise valide
manuellement la réception de chaque pièce.

**Secteur principal :** Banking

**Ce qui existe :** `documents_requis` et `documents_fournis` sur `Dossier` (JSONB) ✅
`DetailsFinanciers.documents_requis` (JSONField) ✅

**Booléens Feature :**
`entreprise_configure_kb=True` | `bot_lit_kb=True`
| `bot_ecrit_result=True` (met à jour Dossier.documents_fournis)
| `entreprise_peut_ecrire_result=True` (valide la réception)

**Actions à mener :**
1. Créer action `list_documents_requis(produit_ou_type_dossier)` :
   - Lit `DetailsFinanciers.documents_requis` si produit connu
   - Sinon lit les documents standards pour le type de dossier
   - Retourne la liste numérotée avec statut de chaque pièce
2. Créer action `confirmer_document(dossier_id, document_nom)` :
   - Ajoute le document dans `Dossier.documents_fournis`
   - Si tous les documents fournis → notifie le conseiller
3. Interface entreprise : vue "Pièces reçues" sur le dossier avec cases à cocher
   (validation manuelle par le conseiller) — source=entreprise
4. **Upload réel de documents :** hors scope C1 — C2.
   En C1 : le client dit "j'ai apporté ma CNI" → le bot coche, le conseiller valide
   physiquement en agence

---

## 5. Tableau récapitulatif des actions prioritaires (Features 13-28)

| Priorité | Action | Feature(s) | Type |
|---|---|---|---|
| 🔴 Haute | Renommer `conversion_prospects` → `capture_prospect` partout | capture_prospect | Config |
| 🔴 Haute | Intégrer `seed_bank` dans `SEEDERS_REGISTRY` | banking | Seeder |
| 🔴 Haute | Créer `DetailsFinanciers` + migrer `ProduitFinancier` | catalogue_produits_financiers | Migration |
| 🔴 Haute | Créer `EmailLog` + refactoriser `send_email` | emails_rappel | Backend |
| 🔴 Haute | Migrer `Bot.agence FK` → `Bot.agences M2M` | multi_agences | Migration |
| 🟡 Moyenne | Créer `DemandeConciergerie` | conciergerie | Backend |
| 🟡 Moyenne | Créer `ModeleCommunication` + `Annonce` | communication_etablissement | Backend |
| 🟡 Moyenne | Créer `ScenarioProspection` + enrichir `ProspectCapture` | capture_prospect | Backend |
| 🟡 Moyenne | Enrichir `ProgrammeAdmission` (7 champs) | inscription_admission | Migration |
| 🟡 Moyenne | Enrichir `SpecialiteMedicale` + `ProfilEntreprise` | orientation_patient | Migration |
| 🟡 Moyenne | Enrichir `ServiceCitoyen` + `Dossier` | orientation_citoyens | Migration |
| 🟡 Moyenne | Créer `RapportClient` + `ContactNote` | gestion_crm | Backend |
| 🟡 Moyenne | Ajouter statut CRM `contact` + `tags` + `resume_ia` | gestion_crm | Migration |
| 🟡 Moyenne | Ajouter rapport sur `AIConversation` | gestion_crm | Migration |
| 🟡 Moyenne | Créer actions banking (simulate_credit, get/create_dossier_banking) | F26, F27, F28 | Backend |
| 🟢 Basse | `communication_etablissement` → tous secteurs | communication_etablissement | Seeder |
| 🟢 Basse | `capture_prospect` → tous secteurs | capture_prospect | Seeder |
| 🟢 Basse | Page `/modules/emails` | emails_rappel | Frontend |
| 🟢 Basse | Page `/modules/communications` | communication_etablissement | Frontend |

---

## 6. Récapitulatif features hors scope

| Feature | Décision | Chantier |
|---|---|---|
| `commande_paiement` | Provider paiement requis | C2 |
| `paiement_en_ligne` | Accord commercial providers | C2 |
| `agent_vocal` | Pipeline STT/TTS — même agent, nouveau canal | C2 |
| `dashboard` | Couvert par B6 (Penka) | B6 |
| Upload documents (collecte_documents) | Infrastructure stockage cloud | C2 |
| Livraison (menu_digital / catalogue_produits) | Module dédié | C2 |
| Routing centralisé (multi_agences) | Un numéro → N bots | C2 |
| Bot routing centralisé | Un numéro → N bots | C2 |
| Disponibilités fine médecins | Agenda médical complet | C2 |

---

*Document généré en session 32 — Gabriel (Lead) — 18/05/2026*
*AG Technologies — Confidentiel*
*Ce document complète le document features 1-12 — ensemble ils couvrent les 28 features du projet*
