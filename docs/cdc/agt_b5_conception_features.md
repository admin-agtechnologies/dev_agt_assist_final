# AGT Platform — Conception B5 : Base de connaissance & Features
## Chantier 1 — Phase 0 — Audit et Conception des Modèles
### Features 1 à 12 sur 24

*Document de référence — Session 32 — Gabriel — 18/05/2026*
*Version mi-parcours : features 1 à 12 validées*

---

## Préambule

Ce document est le résultat de l'audit approfondi des 12 premières features du bloc B5
(Chaîne métier complète) du Chantier 1. Il sert de boussole pour toutes les sessions
qui travailleront sur B5.

**Comment lire ce document :**
Chaque fiche feature décrit en français simple ce qui existe déjà, ce qui manque,
et exactement ce qu'il faut faire. Rien n'est ambigu. Aucune décision n'est laissée
à l'interprétation.

**Règle absolue :** Aucune modification de modèle de données n'est faite sans avoir
relu la section correspondante dans ce document. Aucune initiative silencieuse.

---

## 1. Principes architecturaux validés

### 1.1 Architecture en 3 couches

Toute activité du bot laisse une trace dans l'une de ces 3 couches :

| Couche | Modèle | Qui écrit | Ce qu'elle capture |
|--------|--------|-----------|-------------------|
| **Communication** | `AIConversation` / `AIMessage` | Bot + Client | Le dialogue brut complet |
| **Exécution** | `AIActionLog` | Bot uniquement | Chaque action exécutée : type, payload, résultat, durée, statut |
| **Résultat métier** | `Reservation`, `Commande`, `Inscription`... | Bot + Entreprise | L'outcome business à valeur opérationnelle |

**Règle fondamentale :** toute feature active produit **au minimum une vue stats** pour
l'entreprise. Pour les features sans Résultat métier (FAQ, catalogues d'orientation),
la source des stats est `AIActionLog`. Aucune feature n'est laissée sans visibilité.

### 1.2 Les 4 booléens sur le modèle Feature

Ces 4 booléens pilotent le comportement du bot et de l'interface pour chaque feature :

| Booléen | Signification |
|---------|--------------|
| `entreprise_configure_kb` | L'entreprise doit/peut configurer quelque chose dans `/knowledge` pour que cette feature fonctionne |
| `bot_lit_kb` | Le bot lit la KB de cette feature pendant la conversation avant d'agir |
| `bot_ecrit_result` | Le bot crée un enregistrement dans une table Résultat métier |
| `entreprise_peut_ecrire_result` | L'entreprise peut intervenir sur les résultats (valider, annoter) avec mention de source |

Sur le modèle `ResultRecord` (base abstraite de tous les résultats) :
- `source` : `bot` / `entreprise` / `systeme`
- `source_user` : FK User nullable (si source = entreprise)

### 1.3 Système de catalogues — Source canonique unique

**Décision définitive :** le Système 3 (`apps/catalogue` — `ItemCatalogue`) est la
source de vérité unique pour tous les catalogues. Les anciens systèmes sont dépréciés
et leurs données migrées.

| Système | Statut | Action |
|---------|--------|--------|
| S1 : `MenuCategorie`/`MenuPlat` (`apps/knowledge`) | Déprécié | Migrer vers `ItemCatalogue` + conserver le frontend |
| S2 : `CatalogueProduit`, `CatalogueService`, `CatalogueTrajet`, `ProduitFinancier` (`apps/knowledge`) | Déprécié | Migrer vers `ItemCatalogue` + récupérer les champs spécialisés |
| S3 : `Catalogue`/`CategorieCatalogue`/`ItemCatalogue` (`apps/catalogue`) | **Canonique** | Enrichir avec les champs manquants |

**Règle de migration :** on ne supprime rien tant que la migration n'est pas validée
par Gabriel sur un compte de test. Les anciens endpoints restent actifs pendant
la transition.

### 1.4 Règle frontend transversale

> **On n'expose sur le frontend que ce qui fonctionne réellement côté backend.**

Aucun bouton qui mène nulle part. Aucune promesse non tenue à l'utilisateur final.
Les fonctionnalités non encore opérationnelles sont masquées ou affichent
"Bientôt disponible".

### 1.5 Images des plats et produits

| Version | Approche |
|---------|---------|
| **V1 (Chantier 1)** | Bibliothèque d'images statiques préconfigurées par type d'item. L'entreprise choisit dans une liste. Stockées dans `public/`. |
| **V2 (Chantier 2)** | Upload d'images réelles par l'entreprise — stockage cloud (S3/Cloudflare), miniatures automatiques. |

---

## 2. Modifications du modèle de données

### 2.1 Modèle `Feature` — 4 nouveaux booléens

```
entreprise_configure_kb  : BooleanField  default=False
bot_lit_kb               : BooleanField  default=False
bot_ecrit_result         : BooleanField  default=True   # toujours vrai
entreprise_peut_ecrire_result : BooleanField  default=False
```

Seeder à mettre à jour pour positionner ces booléens sur les 24 features.

### 2.2 Modèle `Ressource` — 8 nouveaux champs

```
duree_minutes            : PositiveIntegerField  default=30
delai_min_heures         : PositiveIntegerField  default=0
buffer_apres_minutes     : PositiveIntegerField  default=15
zone                     : CharField(50) choices=[terrasse, intérieur, salon_vip, autre]  blank=True
est_accessible_pmr       : BooleanField  default=False
tags                     : JSONField list  default=[]
chambre_type             : ForeignKey(ChambreType, null=True, blank=True)
trajet                   : ForeignKey(CatalogueTrajet, null=True, blank=True)
confirmation_automatique : BooleanField  default=False
politique_annulation     : CharField choices=[libre, avec_frais, non_remboursable]  default=libre
config_annulation        : JSONField  default={}
```

Note : `buffer_slot_min` sur `ProfilEntreprise` est déprécié. Conservé en base pour
compatibilité, non utilisé dans les nouveaux calculs.

### 2.3 Modèle `Reservation` — 6 nouveaux champs

```
notif_client_envoyee     : BooleanField  default=False
notif_entreprise_envoyee : BooleanField  default=False
montant_rembourse        : DecimalField(10,2)  null=True, blank=True
date_remboursement       : DateTimeField  null=True, blank=True
motif_annulation         : TextField  blank=True
annule_par               : CharField choices=[client, entreprise, systeme]  blank=True
```

Statuts enrichis : ajouter `en_cours` (check-in effectué) pour les features
avec durée (chambre, billet).

### 2.4 Modèle `ChambreType` — 2 nouveaux champs

```
prix_nuit                : DecimalField(10,2)  null=True, blank=True
equipements              : JSONField list  default=[]
```

### 2.5 Modèle `Commande` — 2 nouveaux champs

```
numero_commande          : CharField(30)  unique=True  non nullable
                           Format : CMD-YYYYMMDD-XXXX (généré à la création)
notes_client             : TextField  blank=True
                           Visible par le bot au client. Distinct de notes (interne).
```

### 2.6 Modèle `ItemCatalogue` — 10 nouveaux champs

```
image_url                : URLField  blank=True
temps_preparation_min    : PositiveIntegerField  null=True, blank=True
allergenes               : JSONField list  default=[]
est_disponible_aujourd_hui : BooleanField  default=True
stock                    : PositiveIntegerField  null=True, blank=True
                           null = pas de gestion de stock. Géré manuellement par l'entreprise.
reference                : CharField(100)  blank=True
duree_min                : PositiveIntegerField  null=True, blank=True
type_service             : CharField(50)  blank=True
action_suivante          : CharField choices=[proposer_rdv, proposer_inscription,
                           proposer_devis, contact_direct, proposer_billet, aucune]
                           default=aucune
classes                  : JSONField  default=[]
                           Format : [{"nom": "Standard", "prix": 5000}, {"nom": "VIP", "prix": 8000}]
ville_depart             : CharField(100)  blank=True
ville_arrivee            : CharField(100)  blank=True
```

### 2.7 Modèle `QuestionFrequente` — 1 nouveau champ

```
ordre                    : PositiveIntegerField  default=0
```

### 2.8 Nouveaux modèles à créer

#### `ConsultationFAQ` (dans `apps/knowledge` ou `apps/agent`)

```python
class ConsultationFAQ(models.Model):
    conversation         = FK(AIConversation)
    question_posee       = TextField()
    question_matchee     = FK(QuestionFrequente, null=True)  # null si aucune trouvée
    score_similarite     = FloatField(default=0)
    reponse_donnee       = TextField()
    source               = "bot"  # toujours bot
    created_at           = DateTimeField(auto_now_add=True)
```

#### `TransfertHumain` (dans `apps/agent`)

```python
class TransfertHumain(models.Model):
    STATUT_CHOICES = [en_attente, pris_en_charge, resolu]
    conversation         = FK(AIConversation)
    agence               = FK(Agence)
    motif                = TextField()
    statut               = CharField choices=STATUT_CHOICES  default=en_attente
    assigne_a            = FK(User, null=True)  # collaborateur qui prend en charge
    pris_en_charge_le    = DateTimeField(null=True)
    resolu_le            = DateTimeField(null=True)
    source               = "bot"
    source_user          = FK(User, null=True)  # si enterprise modifie
    created_at           = DateTimeField(auto_now_add=True)
```

### 2.9 Actions bot à créer

| Action | Paramètres | Description |
|--------|-----------|-------------|
| `search_faq` | `query: str` | Recherche dans `QuestionFrequente` par mots-clés. Remplace l'injection statique. Retourne top 3-5 résultats. |
| `get_menu` | `categorie?: str` | Retourne les `ItemCatalogue` actifs liés à `feature=menu_digital`. |
| `get_catalogue` | `query?: str, categorie?: str` | Retourne les items actifs filtrés par query/catégorie. |
| `get_services` | `query?: str` | Retourne les items `feature=catalogue_services` avec `type_service` et `action_suivante`. |
| `get_trajets` | `depart?: str, arrivee?: str` | Filtre par `ville_depart`/`ville_arrivee`. Retourne lignes avec classes et horaires. |
| `get_room_types` | aucun | Retourne les `ChambreType` actifs avec `prix_nuit` et `equipements`. |
| `get_order_status` | `numero_commande: str` | Vérifie phone WhatsApp == Commande.contact.phone. Retourne statut + notes_client. |

---

## 3. Règles métier transversales

### 3.1 Notifications après réservation ou commande

S'applique à : `prise_rdv`, `reservation_table`, `reservation_chambre`,
`reservation_billet`, `orientation_patient`, `menu_digital`, `catalogue_produits`.

**Déclencheur 1 — Création par le bot :**
- Notifier l'entreprise (email ou WhatsApp selon config agence)
- Envoyer un accusé de réception au client avec les détails

**Déclencheur 2 — Changement de statut par l'entreprise :**
- Confirmé → notifier le client
- Annulé → notifier le client

Implémentation : signaux Django `post_save` sur `Reservation` et `Commande`.
Réutilise l'action `send_email` existante. Non implémenté en C1, modèle prêt.

### 3.2 Politique d'annulation par feature

| Feature | Politique par défaut | Configurable |
|---------|---------------------|-------------|
| `prise_rdv` | libre | Oui |
| `reservation_table` | libre | Oui |
| `reservation_chambre` | avec_frais | Oui |
| `reservation_billet` | non_remboursable | Oui |
| `orientation_patient` | libre | Oui |

Remboursement = Transaction de type `credit` référençant la Reservation annulée.
Champs `montant_rembourse` et `date_remboursement` sur `Reservation` pour traçabilité.

### 3.3 Livraison — Hors scope Chantier 1

La livraison (zones, frais, délais, politique) est un module à part entière différé
au Chantier 2. En Chantier 1 :
- Statut `livree` existe en base mais masqué côté frontend
- Les statuts visibles pour `menu_digital` et `catalogue_produits` sont :
  `en_attente` / `confirmee` / `en_preparation` / `prete` / `annulee`

### 3.4 `commande_paiement` — Hors scope Chantier 1

Requiert un provider de paiement externe opérationnel (Orange Money, MTN MoMo).
Badge "Bientôt disponible" en Chantier 1. Implémentation en Chantier 2.

### 3.5 FAQ — Injection statique remplacée

Le `ContextBuilder` actuel injecte toute la FAQ dans le system prompt (Bloc 2).
**À corriger en priorité** : supprimer la FAQ du Bloc 2, implémenter `search_faq(query)`
comme action dynamique. Scalabilité garantie quelle que soit la taille de la FAQ.

### 3.6 Sécurité suivi de commande

Le bot vérifie : `Commande.contact.phone == conversation.contact.phone`
avant de partager tout statut de commande. En cas d'échec : TransfertHumain automatique.
`numero_commande` est obligatoire, non nullable, généré à la création
au format `CMD-YYYYMMDD-XXXX`.

### 3.7 Gestion du stock

Le bot **lit** le stock pour vérifier la disponibilité. Il ne le modifie **jamais**.
La gestion du stock est exclusivement manuelle par l'entreprise dans l'interface.

### 3.8 Confirmation automatique conditionnelle

`Ressource.confirmation_automatique = True` ne confirme la réservation
automatiquement **que si le paiement est effectué**. Sans paiement, la réservation
reste en `en_attente` même si la confirmation automatique est activée.

---

## 4. Fiches features 1 à 12

---

### Feature 1 — `chatbot_whatsapp`

**Description métier :** Canal d'entrée WhatsApp. Le client envoie ses messages,
le bot répond. C'est la plomberie de tout le système.

**Ce qui existe :** `WahaSession` (statut connexion, QR code, numéro),
`AIConversation` (historique), `AIMessage` (messages), `send_text` via WAHA.

**Booléens Feature :**
`entreprise_configure_kb=False` | `bot_lit_kb=False` | `bot_ecrit_result=True`
(trace dans `AIActionLog`) | `entreprise_peut_ecrire_result=False`

**Actions à mener :**
1. Aucune modification de modèle nécessaire.
2. Vérifier que `check_quota("chatbot_whatsapp")` est le **premier appel** du pipeline
   de traitement de tout message entrant. Si quota = 0, réponse automatique au client.
3. Créer table `TransfertHumain` (voir §2.8).
4. Vérifier que chaque transfert humain crée bien un enregistrement `TransfertHumain`
   avec agence, motif, et statut `en_attente`.

**Note quota :** `chatbot_whatsapp` est la ressource mère. Quota épuisé = bot muet
sur toutes les features. Priorité absolue dans le pipeline.

---

### Feature 2 — `faq`

**Description métier :** L'entreprise rédige ses questions/réponses fréquentes.
Le bot les consulte à la demande pour répondre aux clients.

**Ce qui existe :** `FAQ` (conteneur), `QuestionFrequente` (questions avec catégorie),
tab FAQ dans `/knowledge` fonctionnel (1 seule FAQ affichée — voir action 2).

**Booléens Feature :**
`entreprise_configure_kb=True` | `bot_lit_kb=True` | `bot_ecrit_result=True`
(via `ConsultationFAQ`) | `entreprise_peut_ecrire_result=False`

**Actions à mener :**
1. Ajouter champ `ordre` sur `QuestionFrequente` (migration).
2. Corriger l'interface `/knowledge` pour exposer plusieurs FAQ thématiques distinctes
   (aujourd'hui 1 seule FAQ affichée même si plusieurs existent en base).
3. **Priorité haute :** supprimer l'injection statique de la FAQ dans le `ContextBuilder`
   (Bloc 2). Créer action `search_faq(query)` qui recherche par mots-clés
   (`ILIKE` sur `question_fr` et `categorie`).
4. Créer modèle `ConsultationFAQ` (voir §2.8). Le logger à chaque appel de
   `search_faq` avec : question posée, question matchée, score, réponse donnée.

**Champs manquants :** `ordre` sur `QuestionFrequente`.

---

### Feature 3 — `prise_rdv`

**Description métier :** Un client prend rendez-vous via WhatsApp. Le bot vérifie
les disponibilités et crée le rendez-vous automatiquement.

**Ce qui existe :** `Ressource` (type=praticien/salle), `DisponibiliteRessource`
(créneaux hebdomadaires), `Reservation` (le RDV), actions `check_disponibilite`
et `create_reservation`. Règle R14 : jamais de refus sec, toujours
`en_attente_confirmation` si créneau indisponible.

**Booléens Feature :**
`entreprise_configure_kb=True` | `bot_lit_kb=True` | `bot_ecrit_result=True`
| `entreprise_peut_ecrire_result=True` (confirmer, annuler, marquer honoré)

**Actions à mener :**
1. Ajouter sur `Ressource` : `duree_minutes` (défaut 30), `delai_min_heures` (défaut 0),
   `buffer_apres_minutes` (défaut 15). **Ces 3 champs profitent à toutes les features
   de réservation** : `reservation_table`, `reservation_chambre`, `reservation_billet`,
   `orientation_patient`.
2. Créer tab **"Disponibilités"** dans `/knowledge`, visible uniquement si
   `prise_rdv` est active. L'entreprise configure ses ressources et créneaux ici.
3. Mettre à jour `check_disponibilite` pour intégrer `buffer_apres_minutes` dans
   le calcul des créneaux libres.
4. Page Résultats : filtrer les `Reservation` par `feature.slug = "prise_rdv"`.
5. Ajouter boutons de changement de statut (confirmer / annuler / honoré / no-show)
   sur la page Résultats.
6. Brancher les notifications (§3.1) quand le backend notifications sera prêt.

**Champs manquants sur `Ressource` :** `duree_minutes`, `delai_min_heures`,
`buffer_apres_minutes`, `politique_annulation`, `config_annulation`.

---

### Feature 4 — `reservation_table`

**Description métier :** Un client réserve une table au restaurant via WhatsApp.
Le bot vérifie les tables disponibles et crée la réservation.

**Ce qui existe :** Même infrastructure que `prise_rdv` (`Ressource` type=table,
`DisponibiliteRessource`, `Reservation`). Aucune KB dédiée, aucun tab frontend.

**Booléens Feature :**
`entreprise_configure_kb=True` | `bot_lit_kb=True` | `bot_ecrit_result=True`
| `entreprise_peut_ecrire_result=True`

**Actions à mener :**
1. Créer tab **"Tables"** dans `/knowledge`, visible uniquement si
   `reservation_table` est active. Interface pour créer/modifier les tables
   (`Ressource` type=table).
2. Ajouter sur `Ressource` : `zone` (terrasse/intérieur/salon_vip/autre),
   `est_accessible_pmr`, `tags`.
3. Mêmes actions que `prise_rdv` sur le buffer, les notifications, la page Résultats
   et les boutons de statut.

**Champs manquants sur `Ressource` :** `zone`, `est_accessible_pmr`, `tags`
(en plus des 3 champs communs de `prise_rdv`).

---

### Feature 5 — `reservation_chambre`

**Description métier :** Un client réserve une chambre d'hôtel via WhatsApp.
Le bot présente les types disponibles, vérifie les dates et crée la réservation.

**Ce qui existe :** `ChambreType` (types de chambres avec description), `Ressource`
(type=chambre, chambres physiques), `Reservation`. Tab "Chambres" dans `/knowledge`
pour les types. Pas d'interface pour les chambres individuelles.

**Booléens Feature :**
`entreprise_configure_kb=True` | `bot_lit_kb=True` | `bot_ecrit_result=True`
| `entreprise_peut_ecrire_result=True`

**Actions à mener :**
1. Ajouter sur `ChambreType` : `prix_nuit`, `equipements` (JSONField list).
2. Ajouter sur `Ressource` : `chambre_type FK → ChambreType` (nullable) — lien
   entre la chambre physique et sa catégorie.
3. Créer action bot `get_room_types` : retourne les `ChambreType` actifs avec
   `prix_nuit` et `equipements`. Appelée quand le client demande les chambres disponibles.
4. Créer interface dans `/knowledge` pour les chambres individuelles
   (`Ressource` type=chambre).
5. Ajouter statut `en_cours` sur `Reservation` pour le check-in.
6. Politique d'annulation : `avec_frais` par défaut (§3.2).

**Champs manquants sur `ChambreType` :** `prix_nuit`, `equipements`.
**Champs manquants sur `Ressource` :** `chambre_type FK`.

---

### Feature 6 — `reservation_billet`

**Description métier :** Un client réserve une place dans un transport via WhatsApp.
Le bot présente les trajets, vérifie les places disponibles et émet le billet.

**Ce qui existe :** `CatalogueTrajet` (lignes avec horaires et tarifs), `Ressource`
(type=trajet, véhicules), `Reservation`. Actions `check_disponibilite` et
`create_reservation` existantes.

**Booléens Feature :**
`entreprise_configure_kb=True` | `bot_lit_kb=True` | `bot_ecrit_result=True`
| `entreprise_peut_ecrire_result=True`

**Actions à mener :**
1. Ajouter sur `Ressource` : `trajet FK → CatalogueTrajet` (nullable) — lien
   entre le véhicule et sa ligne. Permet au bot de connaître le tarif et les horaires.
2. Ajouter sur `Reservation` : `numero_billet` (référence courte imprimable),
   `siege` (nullable, si gestion des places).
3. Ajouter sur `Ressource` : `confirmation_automatique` (True pour transport —
   confirmation auto si paiement reçu, §3.8).
4. Politique d'annulation : `non_remboursable` par défaut (§3.2).
5. Ajouter statut `en_cours` sur `Reservation` (voyage en cours).
6. Créer interface dans `/knowledge` pour les véhicules (`Ressource` type=trajet).

**Champs manquants sur `Reservation` :** `numero_billet`, `siege`.
**Champs manquants sur `Ressource` :** `trajet FK`, `confirmation_automatique`.

---

### Feature 7 — `menu_digital`

**Description métier :** Le restaurant publie son menu. Un client consulte et
commande directement via WhatsApp. Le bot enregistre la commande.

**Ce qui existe :** `MenuCategorie`/`MenuPlat` (S1, déprécié), `Catalogue`/
`CategorieCatalogue`/`ItemCatalogue` (S3, canonique), `Commande` + `LigneCommande`,
tab "Menu" dans `/knowledge` (branché sur S1).

**Booléens Feature :**
`entreprise_configure_kb=True` | `bot_lit_kb=True` | `bot_ecrit_result=True`
| `entreprise_peut_ecrire_result=True` (confirmer, préparer, marquer prête)

**Actions à mener :**
1. **Migration S1 → S3 :** rebrancher le tab "Menu" sur `ItemCatalogue`.
   Migrer les données `MenuCategorie`/`MenuPlat` vers `Catalogue`/`ItemCatalogue`
   avec `feature_slug = "menu_digital"`. Valider avec Gabriel sur un compte de test
   avant suppression de S1.
2. Ajouter sur `ItemCatalogue` : `image_url`, `temps_preparation_min`, `allergenes`,
   `est_disponible_aujourd_hui`.
3. Images V1 : bibliothèque statique par type de plat (§1.5).
4. Créer action bot `get_menu(categorie?)`.
5. Statuts `Commande` C1 : `en_attente` / `confirmee` / `en_preparation` / `prete`
   / `annulee`. Masquer `livree` côté frontend (§3.3).
6. Ajouter `numero_commande` et `notes_client` sur `Commande` (§2.5).

**Champs manquants sur `ItemCatalogue` :** `image_url`, `temps_preparation_min`,
`allergenes`, `est_disponible_aujourd_hui`.

---

### Feature 8 — `commande_paiement` — HORS SCOPE CHANTIER 1

**Description métier :** Passer et payer une commande directement via WhatsApp
avec un provider de paiement intégré.

**Décision :** Différée au Chantier 2. Requiert un provider externe opérationnel
(Orange Money, MTN MoMo, carte bancaire).

**En Chantier 1 :**
- Feature visible dans la marketplace modules
- Badge "Bientôt disponible" — non activable
- Les commandes créées par `menu_digital` et `catalogue_produits` fonctionnent sans
  paiement intégré. L'entreprise contacte le client manuellement pour le règlement.

---

### Feature 9 — `catalogue_produits`

**Description métier :** Une boutique publie son catalogue. Un client consulte,
commande via WhatsApp. Le bot enregistre la commande sans paiement immédiat.

**Ce qui existe :** `CatalogueProduit` (S2, déprécié — a `stock`, `reference`,
`image_url`), S3 canonique sans ces champs, `Commande` + `LigneCommande`.

**Booléens Feature :**
`entreprise_configure_kb=True` | `bot_lit_kb=True` | `bot_ecrit_result=True`
| `entreprise_peut_ecrire_result=True`

**Actions à mener :**
1. **Migration S2 → S3 :** rebrancher tab "Catalogue" sur `ItemCatalogue`.
   Migrer `CatalogueProduit` avec récupération des champs `stock`, `reference`,
   `image_url`. Valider avec Gabriel avant suppression de S2.
2. Ajouter sur `ItemCatalogue` : `stock` (nullable — null = pas de gestion de stock),
   `reference`.
3. **Règle stock :** le bot lit `stock` pour vérifier disponibilité.
   Il ne le modifie **jamais** (§3.7). Gestion manuelle par l'entreprise.
4. Créer action bot `get_catalogue(query?, categorie?)`.
5. Images V1 : bibliothèque statique (§1.5).

**Champs manquants sur `ItemCatalogue` :** `stock`, `reference` (en plus des
champs `menu_digital`).

---

### Feature 10 — `suivi_commande`

**Description métier :** Un client demande où en est sa commande. Le bot retrouve
la commande et donne le statut en temps réel, sans intervention humaine.

**Ce qui existe :** `Commande` avec tous les statuts, `LigneCommande`, `Contact`
(phone connu depuis WhatsApp).

**Booléens Feature :**
`entreprise_configure_kb=False` | `bot_lit_kb=False` | `bot_ecrit_result=True`
(via `AIActionLog`) | `entreprise_peut_ecrire_result=False`

**Actions à mener :**
1. Ajouter `numero_commande` sur `Commande` : obligatoire, unique, non nullable,
   format `CMD-YYYYMMDD-XXXX`, généré à la création automatiquement.
2. Ajouter `notes_client` sur `Commande` : texte visible par le bot au client.
   Distinct de `notes` (usage interne entreprise uniquement).
3. Créer action bot `get_order_status(numero_commande)` avec vérification de sécurité :
   `Commande.contact.phone == conversation.contact.phone`.
   En cas d'échec : déclencher `TransfertHumain` automatiquement.
4. In scope Chantier 1 — fonctionne sans paiement intégré.

**Champs manquants sur `Commande` :** `numero_commande`, `notes_client`.

---

### Feature 11 — `catalogue_services`

**Description métier :** Une entreprise de services liste ses prestations avec tarifs
et durées. Le bot présente l'offre et oriente vers la prochaine action (RDV, devis,
inscription...) selon la configuration.

**Ce qui existe :** `CatalogueService` (S2, déprécié — a `duree_min`, `image_url`),
tab "Catalogue" dans `/knowledge` avec label "Prestations" prévu pour ce secteur.
Usage multi-secteurs : PME, Santé, Custom.

**Booléens Feature :**
`entreprise_configure_kb=True` | `bot_lit_kb=True` | `bot_ecrit_result=True`
(via `AIActionLog`) | `entreprise_peut_ecrire_result=False`

**Actions à mener :**
1. **Migration S2 → S3 :** rebrancher tab sur `ItemCatalogue` avec récupération
   de `duree_min`.
2. Ajouter sur `ItemCatalogue` : `duree_min`, `type_service` (libre, ex: "consultation",
   "formation", "audit"), `action_suivante` (choices — voir §2.6).
3. Créer action bot `get_services(query?)` : retourne items avec `type_service`
   et `action_suivante`.
4. Le bot enchaîne selon `action_suivante` : si `proposer_rdv`, appelle
   `check_disponibilite` dans la même conversation.
5. Interface `/knowledge` : l'entreprise configure `type_service` et
   `action_suivante` par prestation.

**Champs manquants sur `ItemCatalogue` :** `duree_min`, `type_service`,
`action_suivante`.

---

### Feature 12 — `catalogue_trajets`

**Description métier :** Une compagnie de transport publie ses lignes, horaires
et tarifs. Le bot présente les trajets disponibles et oriente vers la réservation
de billet.

**Ce qui existe :** `CatalogueTrajet` (S2, déprécié — `depart_fr`, `destination_fr`,
`prix`, `duree_min`, `horaires_depart` JSONField, `is_available`), tab "Catalogue"
dans `/knowledge`.

**Booléens Feature :**
`entreprise_configure_kb=True` | `bot_lit_kb=True` | `bot_ecrit_result=True`
(via `AIActionLog`) | `entreprise_peut_ecrire_result=False`

**Actions à mener :**
1. **Migration S2 → S3 :** rebrancher tab sur `ItemCatalogue` avec récupération
   des champs `CatalogueTrajet`.
2. Ajouter sur `ItemCatalogue` : `classes` (JSONField liste de classes avec prix),
   `ville_depart`, `ville_arrivee` (champs structurés pour filtrage bot, en complément
   du texte libre `depart_fr`/`destination_fr`).
3. `action_suivante` = `"proposer_billet"` — fixe pour cette feature, pas configurable
   par l'entreprise.
4. Le FK `Ressource.trajet → CatalogueTrajet` (décidé en feature 6) assure le lien
   entre la ligne (catalogue) et les véhicules (ressources réservables).
5. Créer action bot `get_trajets(depart?, arrivee?)` : filtre sur `ville_depart`
   et `ville_arrivee`.

**Champs manquants sur `ItemCatalogue` :** `classes`, `ville_depart`, `ville_arrivee`.

---

## 5. Tableau récapitulatif des actions prioritaires

| Priorité | Action | Feature(s) | Type |
|----------|--------|-----------|------|
| 🔴 Haute | Corriger `ContextBuilder` : supprimer FAQ du Bloc 2, créer `search_faq` | FAQ | Backend |
| 🔴 Haute | Ajouter `numero_commande` sur `Commande` (non nullable, unique) | suivi_commande | Migration |
| 🔴 Haute | Ajouter les 4 booléens sur `Feature` + seeder | Toutes | Migration |
| 🔴 Haute | Ajouter les 8 champs sur `Ressource` | rdv, table, chambre, billet | Migration |
| 🟡 Moyenne | Migration S1/S2 → S3 (`ItemCatalogue`) | menu, produits, services, trajets | Migration |
| 🟡 Moyenne | Créer tab "Disponibilités" dans `/knowledge` | prise_rdv | Frontend |
| 🟡 Moyenne | Créer tab "Tables" dans `/knowledge` | reservation_table | Frontend |
| 🟡 Moyenne | Corriger tab FAQ multi-FAQ | faq | Frontend |
| 🟡 Moyenne | Créer modèle `TransfertHumain` | chatbot_whatsapp | Backend |
| 🟡 Moyenne | Créer modèle `ConsultationFAQ` | faq | Backend |
| 🟢 Basse | Ajouter 10 champs sur `ItemCatalogue` | menu, produits, services, trajets | Migration |
| 🟢 Basse | Créer actions bot `get_menu`, `get_catalogue`, `get_services`, `get_trajets` | Multiples | Backend |
| 🟢 Basse | Bibliothèque images statiques V1 | menu, produits | Frontend |
| 🟢 Basse | Badge "Bientôt disponible" sur `commande_paiement` | commande_paiement | Frontend |

---

## 6. Ordre d'exécution recommandé

```
ÉTAPE 1 — Migrations (faire en un seul lot)
  ├─ Feature : 4 booléens + seeder
  ├─ Ressource : 8 champs
  ├─ Reservation : 6 champs + statut en_cours
  ├─ ChambreType : 2 champs
  ├─ Commande : numero_commande + notes_client
  ├─ ItemCatalogue : 10 champs
  ├─ QuestionFrequente : ordre
  ├─ Créer TransfertHumain
  └─ Créer ConsultationFAQ

ÉTAPE 2 — Backend actions (par ordre de dépendance)
  ├─ search_faq (débloquer tests FAQ)
  ├─ get_menu + get_catalogue + get_services + get_trajets + get_room_types
  └─ get_order_status (avec vérification sécurité)

ÉTAPE 3 — Migrations données S1/S2 → S3
  ├─ Valider sur compte de test avec Gabriel
  └─ Supprimer S1/S2 après validation

ÉTAPE 4 — Frontend
  ├─ Rebrancher tab Menu/Catalogue sur ItemCatalogue
  ├─ Créer tabs Disponibilités + Tables
  ├─ Corriger tab FAQ multi-FAQ
  └─ Badge Bientôt disponible sur commande_paiement
```

---

*Document généré en session 32 — Gabriel (Lead) — 18/05/2026*
*AGT Technologies — Confidentiel*
*Suite : features 13 à 24 dans le prochain document de session*
