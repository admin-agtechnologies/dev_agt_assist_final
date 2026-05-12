
# Plan de Test & Débogage — AGT Platform V1

> **Statut :** Document de pilotage post-migration. Approche test-driven user-centric.
> **Méthode :** Parcours en profondeur, secteur par secteur. Restaurant en tête.
> **Philosophie :** Ce document est un **guide directionnel**, pas un script rigide. La direction prime sur la rigidité.

---

## Table des matières

1. [Contexte & stratégie](#1-contexte--stratégie)
2. [Setup technique local](#2-setup-technique-local)
3. [Conventions de travail](#3-conventions-de-travail)
4. [Définition générique des flux F1 → F10](#4-définition-générique-des-flux-f1--f10)
5. Branches sectorielles
   - 5.1 Restaurant — priorité 1 (référence détaillée)
   - 5.2 Hôtel
   - 5.3 E-commerce
   - 5.4 Transport
   - 5.5 Banque & Microfinance
   - 5.6 Santé & Hôpitaux
   - 5.7 PME & Entreprises
   - 5.8 Éducation
   - 5.9 Secteur Public
   - 5.10 Personnalisé (Custom)
6. [Validation finale & déploiement](#6-validation-finale--déploiement)

---

## 1. Contexte & stratégie

### 1.1 Objectif

Tester de bout en bout l'ensemble des fonctionnalités d'AGT Platform V1 en se mettant dans la peau d'un utilisateur réel pour chaque secteur d'activité. Chaque dysfonctionnement détecté est diagnostiqué, analysé puis corrigé sur le frontend et/ou le backend selon nécessité.

### 1.2 Approche : test en profondeur (depth-first)

**Principe :** parcourir chaque secteur de A à Z (de la landing au test du bot et au suivi post-interaction) avant de passer au suivant. La première branche est la plus coûteuse mais corrige le socle commun pour les 9 secteurs suivants.

**Décisions prises :**
- Le test simule un **vrai client** du secteur, pas un client générique
- Le but est un **produit final**, pas un prototype — on préfère 60 itérations à 6
- La conception (cahier des charges + spec technique) est la **seule source de vérité**. Tout écart entre la version actuelle et la conception est un bug à corriger
- Les landings actuelles seront refaites en suivant la conception

**Risque identifié — bug commun vs bug sectoriel :**
Convention de diagnostic : si un bug observé sur Restaurant persiste à l'identique sur Hôtel, c'est un bug du socle. S'il est isolé, c'est un bug sectoriel.

### 1.3 Ordre des secteurs

| # | Secteur | Slug | Sous-domaine | Justification |
|---|---|---|---|---|
| 1 | Restaurant | `restaurant` | restaurant.agt-bot.com | RDV variant + commande + paiement + menu — le plus riche |
| 2 | Hôtel | `hotel` | hotel.agt-bot.com | RDV variant chambre + conciergerie — capitalise sur Restaurant |
| 3 | E-commerce | `ecommerce` | e-commerce.agt-bot.com | Pas de RDV → valide ce chemin alternatif + suivi commande |
| 4 | Transport | `transport` | travell.agt-bot.com | Pas de RDV, réservation billet (flow différent du panier) |
| 5 | Banque | `banking` | banking.agt-bot.com | Multi-agences = architecture unique |
| 6 | Santé | `clinical` | clinical.agt-bot.com | RDV médical + orientation patient |
| 7 | PME | `pme` | pme.agt-bot.com | Conversion prospects = feature unique |
| 8 | Éducation | `school` | school.agt-bot.com | Pas de paiement transactionnel |
| 9 | Secteur Public | `public` | public.agt-bot.com | Le plus simple, aucun paiement |
| 10 | Personnalisé | `custom` | — | Stress test final de l'architecture data-driven |

### 1.4 Périmètre V1

**Inclus :** landings, authentification, onboarding, dashboard, configuration métier, agent IA texte (WhatsApp), agent vocal (POC), paiements (Orange Money + MTN MoMo + carte), notifications email, fonctionnalités transversales.

**Exclu V1 :** application mobile native, géolocalisation avancée, API publique pour tiers, messagerie temps réel hors chatbot.

---

## 2. Setup technique local

### 2.1 Architecture de déploiement local

À chaque session de test, deux instances frontend tournent en parallèle sur la machine locale :

| Port | Variable d'environnement | Rôle |
|------|--------------------------|------|
| Port A (3000) | `NEXT_PUBLIC_SECTOR=hub` | Landing centrale |
| Port B (3001) | `NEXT_PUBLIC_SECTOR={sector_slug}` | Secteur en cours de test |

**Backend :** une seule instance Django multi-tenant. Toutes les actions des deux frontends pointent vers le même backend.

### 2.2 Commandes de lancement

```bash
# Terminal 1 — Frontend hub
NEXT_PUBLIC_SECTOR=hub npm run dev -- --port 3000

# Terminal 2 — Frontend secteur (exemple Restaurant)
NEXT_PUBLIC_SECTOR=restaurant npm run dev -- --port 3001

# Terminal 3 — Backend Django
python manage.py runserver
```

> Adapter selon les scripts définis dans `package.json`.

### 2.3 Outils de test du bot

| Niveau | Outil | Usage |
|--------|-------|-------|
| 1 — Persistance | Interface de test interne intégrée à l'app | Flux logiques, persistance BDD, calculs |
| 2 — Live | WAHA (webhook WhatsApp) | Validation finale en condition réelle |

**Convention :** chaque scénario testé d'abord sur l'interface interne, puis rejoué sur WAHA pour les scénarios critiques.

### 2.4 Pré-requis avant de commencer

- [ ] Backend Django opérationnel en local
- [ ] Base seedée avec les 10 secteurs et leurs `SectorFeature`
- [ ] Compte admin AGT créé
- [ ] Variables d'environnement frontend documentées dans `.env.local.example`
- [ ] WAHA accessible avec au moins un numéro WhatsApp de test
- [ ] Sandbox Mobile Money (Orange + MTN) configuré
- [ ] Sandbox carte bancaire configuré
- [ ] Provider email de test (Mailtrap, Mailpit ou équivalent)

---

## 3. Conventions de travail

### 3.1 Notation des checkboxes

| Symbole | Signification |
|---------|---------------|
| `[ ]` | À faire |
| `[x]` | Terminé et validé |
| `[~]` | En cours / partiellement validé |
| `[!]` | Bug détecté — voir bug log |

### 3.2 Capture des bugs — double niveau

**1. Note inline** sous la tâche concernée — observation rapide.

**2. Bug log centralisé** par secteur, en fin de section sectorielle :

| Colonne | Description |
|---------|-------------|
| ID | `{SECTOR}-NNN` (ex. `R-001` pour Restaurant) |
| Flux | F1 à F10 |
| Description | Symptôme observé |
| Sévérité | basse / moyenne / haute / bloquante |
| Frontend / Backend | F / B / F+B |
| Statut | ouvert / en cours / corrigé / régression |

### 3.3 Flexibilité du plan

⚠️ **Ce plan est un guide directionnel, pas un script rigide.**

- L'ordre des sous-tâches dans un flux peut être adapté
- Un flux antérieur peut être réouvert si un flux ultérieur révèle un problème
- Une checkbox non cochée en fin de secteur ne bloque pas le passage si le bug est trivial et documenté
- Si un bug bloquant est trouvé sur Restaurant et impacte plusieurs secteurs, il est traité immédiatement

### 3.4 Discipline de commit

```
test(restaurant): F4 onboarding paiement MTN — KO
fix(restaurant): F4 onboarding paiement MTN — webhook handler
test(restaurant): F4 onboarding paiement MTN — OK
```

---

## 4. Définition générique des flux F1 → F10

### F1 — Landing centrale (hub)
Vérification de la page d'entrée publique sur Port A. Contenu, navigation, redirection vers landings sectorielles, cohérence avec la conception.

### F2 — Landing sectorielle
Vérification de la landing du secteur sur Port B. Contenu spécifique au métier, **uniquement les features réellement implémentées**, CTA pointant vers `/onboarding` et `/login`.

### F3 — Register
Création de compte via 3 méthodes : email + mot de passe, Google OAuth, lien magique. Validation, gestion des erreurs.

### F4 — Onboarding sectoriel
Sélection du secteur → infos entreprise → choix abonnement → paiement → génération automatique de l'agent → redirection dashboard.

### F5 — Login / Logout / Reset
Login multi-méthodes, logout, reset password, expiration session, accès non autorisé.

### F6 — Dashboard first contact
Premier accès post-onboarding. État initial, tour guidé éventuel, navigation, wallet et abonnement visibles.

### F7 — Configuration métier
Renseignement des données spécifiques au secteur : ressources métier, services, FAQ, paramètres agent.

### F8 — Test agent IA
Scénarios métier joués via interface interne (persistance) puis WAHA (live). Test du POC vocal.

### F9 — Suivi post-interaction
Côté propriétaire : dashboard mis à jour, stats, historique, notifications email.

### F10 — Transversal
Signaler un problème, langue (FR/EN), centre d'aide, tutoriels.

---

## 5. Branches sectorielles

---

### 5.1 Restaurant — priorité 1

> **Section de référence détaillée.** Le socle commun (F1, F3, F5, F6, F9, F10) est validé ici une fois pour toutes — sur les autres secteurs il sera vérifié en surface avec attention aux régressions.

**Sous-domaine :** `restaurant.agt-bot.com`
**Slug :** `restaurant`
**Variante RDV :** Réservation de table
**Features sectorielles :** Menu digital, Commande & paiement
**Ressources métier :** plats, tables, horaires d'ouverture

#### F1 — Landing centrale (hub)

- [x] Lancer Port A avec `NEXT_PUBLIC_SECTOR=hub`
- [x] Header : logo, navigation, sélecteur de langue, bouton login, CTA principal
- [x] Section hero : titre, sous-titre, CTA primaire et secondaire
- [x] Section "Fonctionnalités" générique
- [x] Section "Démo" / vidéo
- [x] Section "Solutions par secteur" : présence des **9 cartes sectorielles**
- [x] Carte Restaurant : icône, label, lien vers `restaurant.agt-bot.com`
- [x] Section "Témoignages"
- [x] Section CTA finale
- [x] Footer : liens, contact, mentions légales
- [x] Responsive mobile / tablette / desktop
- [x] Bascule de langue FR/EN
- [x] Validation visuelle conforme à la conception

> _Notes inline :_

#### F2 — Landing sectorielle Restaurant

- [x] Lancer Port B avec `NEXT_PUBLIC_SECTOR=restaurant`
- [x] Header : cohérence avec landing centrale, lien retour vers le hub
- [x] Hero spécifique restauration
- [x] Liste des features : **uniquement features actives** (Menu digital, Commande & paiement, Réservations table, base universelle). **Ne pas afficher** les features non implémentées (fidélité, livraison)
- [x] CTA principal vers `/onboarding`
- [x] CTA secondaire vers `/login`
- [x] Section tarifs : alignement avec backend
- [x] Témoignages contextualisés restauration
- [x] Footer, responsive, FR/EN

> _Notes inline :_

#### F3 — Register

- [x] Accès à `/onboarding` (ou `/register`)
- [x] **Méthode 1 — Email + mot de passe** : formulaire, validations, email de confirmation, lien d'activation
- [x] **Méthode 2 — Google OAuth** : redirect, retour, création compte
- [x] **Méthode 3 — Lien magique** : saisie, réception, clic = connexion
- [x] Gestion erreurs : email déjà utilisé, mdp faible, lien expiré, lien réutilisé
- [x] Cohérence champs avec modèle utilisateur backend
- [x] Bascule entre les 3 méthodes sans perte de contexte
- [x] Lien "déjà inscrit ?" → `/login`

> _Notes inline :_

#### F4 — Onboarding sectoriel Restaurant

- [x] **Étape 1 — Sélection secteur** : affichage 10 secteurs ou pré-sélection, choix Restaurant, confirmation
- [x] **Étape 2 — Infos entreprise** : champs requis (nom, email, tel, adresse, ville, pays), validations
- [x] **Étape 3 — Choix abonnement** : plans, montants FCFA cohérents backend, sélection
- [x] **Étape 4 — Paiement** :
  - [x] Orange Money — flow sandbox complet
  - [x] MTN Mobile Money — flow sandbox complet
  - [x] Carte bancaire — flow + 3D Secure
  - [x] Gestion échecs : message clair, retry possible
- [x] **Étape 5 — Génération agent** : feedback visuel, création tenant, application `SectorFeature`, init wallet
- [x] **Étape 6 — Redirection dashboard** : pas de 404/500/écran blanc

> _Notes inline :_

#### F5 — Login / Logout / Reset

- [x] Logout depuis menu utilisateur, cookie/session supprimé
- [x] Re-login email + mdp
- [x] Re-login Google
- [x] Re-login lien magique
- [x] Reset password : demande → email → page reset → nouveau mdp → connexion
- [x] Expiration session : inactif → tentative action → redirect login
- [x] Accès dashboard sans session → redirect login
- [x] Réutilisation lien magique consommé → message clair

> _Notes inline :_

#### F6 — Dashboard first contact

- [x] Layout : sidebar, header, zone contenu
- [x] État initial : sections vides + CTA "Ajouter votre premier..."
- [x] Tour guidé éventuel — testable et skippable
- [x] Navigation : Vue d'ensemble, Réservations, Menu, Tables, Clients, Stats, Agent, Wallet, Abonnement, Paramètres
- [x] Wallet : solde, historique consommations
- [x] Abonnement : plan, renouvellement, quotas
- [x] Sélecteur langue FR/EN sur tout le dashboard
- [x] Avatar → menu (profil, paramètres, déconnexion)

> _Notes inline :_

#### F7 — Configuration métier Restaurant

- [ ] **Menu — Ajout plat** : nom, description, prix, catégorie, photo, dispo
- [ ] **Menu — Modifier, dupliquer, supprimer, désactiver**
- [ ] **Catégories menu** : créer, ordonner, supprimer
- [ ] **Tables — Ajout** : numéro, capacité, zone
- [ ] **Tables — Modifier, supprimer, désactiver**
- [ ] **Horaires** : plages par jour, fermetures, exceptions
- [ ] **FAQ** : ajouter quelques Q/R
- [ ] **Paramètres agent** : nom, ton, langue par défaut, message d'accueil

> _Notes inline :_

#### F8 — Test agent IA Restaurant

**Sur interface interne (validation persistance) :**

- [ ] **Scénario A — Salutation et FAQ** : "Bonjour, êtes-vous ouverts ?" → réponse selon horaires
- [ ] **Scénario B — Présentation menu** : l'agent liste catégories et plats actifs
- [ ] **Scénario C — Réservation table** : date, heure, nb pers → vérif dispo → confirmation → **vérification BDD**
- [ ] **Scénario D — Commande à emporter** : sélection plats → calcul total **déterministe** → paiement → confirmation → **vérification BDD (commande + lignes + transaction)**
- [ ] **Scénario E — Hors-scope** : "Pouvez-vous me livrer ?" → décline avec élégance
- [ ] **Scénario F — Annulation réservation** par client final
- [ ] **Scénario G — Question ambiguë** → demande clarification

**Sur WAHA (live WhatsApp) :**

- [ ] Re-jouer Scénario C
- [ ] Re-jouer Scénario D
- [ ] Vérifier email de confirmation côté client final
- [ ] Latence acceptable

**Agent vocal (POC) :**

- [ ] Appel entrant simulé
- [ ] Transcription voix → texte (STT)
- [ ] Réponse texte → voix (TTS)
- [ ] Cohérence avec scénarios texte

> _Notes inline :_

#### F9 — Suivi post-interaction

- [ ] Dashboard mis à jour : nouvelle réservation visible
- [ ] Dashboard mis à jour : nouvelle commande visible
- [ ] Stats : compteurs incrémentés (messages, réservations, commandes, CA)
- [ ] Historique conversations consultable
- [ ] Notification email reçue par l'entreprise
- [ ] Action propriétaire : confirmer/annuler/modifier réservation
- [ ] Action propriétaire : marquer commande "préparée" / "récupérée"
- [ ] Wallet débité du coût des interactions

> _Notes inline :_

#### F10 — Transversal

- [ ] **Signaler un problème** : formulaire, envoi, accusé, ticket créé côté admin
- [ ] **Bascule FR → EN** : tout traduit, pas de clé manquante, pas de chaîne en dur
- [ ] **Bascule EN → FR** : symétrique
- [ ] **Centre d'aide** : accessible, contenu présent
- [ ] **Tutoriels** : accessible, contenu présent
- [ ] **Mise à jour profil** : nom, photo, mdp
- [ ] **Mise à jour infos entreprise**
- [ ] **Déconnexion finale**

> _Notes inline :_

#### Bug log — Restaurant

| ID | Flux | Description | Sévérité | F / B | Statut |
|----|------|-------------|----------|-------|--------|
| R-001 |  |  |  |  |  |
| R-002 |  |  |  |  |  |

---

### 5.2 Hôtel

> **Note :** socle commun déjà validé sur Restaurant. Vérifier en surface F1, F3, F5, F6, F9, F10 et détailler F2, F4, F7, F8.

**Sous-domaine :** `hotel.agt-bot.com`
**Slug :** `hotel`
**Variante RDV :** Réservation de chambre
**Features sectorielles :** Conciergerie virtuelle
**Ressources métier :** chambres, services conciergerie

#### F1 — vérification rapide
- [ ] Carte Hôtel présente et lien fonctionnel

#### F2 — Landing sectorielle Hôtel
- [ ] Lancer Port B avec `NEXT_PUBLIC_SECTOR=hotel`
- [ ] Hero orienté hôtellerie
- [ ] Features : Réservation chambre, Conciergerie, base universelle
- [ ] CTA, tarifs, témoignages, footer, responsive, FR/EN

> _Notes inline :_

#### F3 — vérification rapide

#### F4 — Onboarding sectoriel Hôtel
- [ ] Sélection secteur Hôtel
- [ ] Infos entreprise (nb étoiles, nb chambres si pertinent)
- [ ] Abonnement, paiement
- [ ] Vérifier variante "Réservation chambre" remplace "RDV générique"
- [ ] Génération agent, redirection dashboard

> _Notes inline :_

#### F5, F6 — vérification rapide

#### F7 — Configuration métier Hôtel
- [ ] **Chambres — Ajout** : type (simple, double, suite), tarif/nuit, capacité, équipements, photos
- [ ] **Chambres — Modifier, désactiver, supprimer**
- [ ] **Disponibilités** : périodes
- [ ] **Conciergerie** : ajouter service (taxi, blanchisserie, restauration en chambre, excursion), tarif, durée, gratuit/payant
- [ ] **Conciergerie — Modifier, désactiver, supprimer**
- [ ] **FAQ hôtel** : check-in/out, équipements, annulation
- [ ] **Paramètres agent**

> _Notes inline :_

#### F8 — Test agent IA Hôtel

**Interface interne :**
- [ ] **A — Salutation, présentation hôtel**
- [ ] **B — Disponibilités** : "Chambre double du 12 au 15 mars ?"
- [ ] **C — Réservation chambre** : sélection → calcul → paiement → confirmation → **persistance BDD**
- [ ] **D — Service conciergerie** (taxi, restauration en chambre)
- [ ] **E — Politique d'annulation** (FAQ)
- [ ] **F — Hors-scope** : décline gracieusement

**WAHA :**
- [ ] Re-jouer C et D
- [ ] Email confirmation

**Vocal :**
- [ ] Appel entrant simulé, scénario réservation

> _Notes inline :_

#### F9 — Suivi post-interaction
- [ ] Réservation chambre visible
- [ ] Demande conciergerie visible
- [ ] Stats actualisées
- [ ] Notification email
- [ ] Action propriétaire : confirmer/refuser, marquer service "fait"

#### F10 — vérification rapide

#### Bug log — Hôtel

| ID | Flux | Description | Sévérité | F / B | Statut |
|----|------|-------------|----------|-------|--------|
| H-001 |  |  |  |  |  |

---

### 5.3 E-commerce

> **Note :** premier secteur **sans RDV**. Valide explicitement que l'absence de variante RDV ne casse rien.

**Sous-domaine :** `e-commerce.agt-bot.com`
**Slug :** `ecommerce`
**Variante RDV :** aucune
**Features sectorielles :** Catalogue produits, Commande & paiement, Suivi commande
**Ressources métier :** produits, commandes (statuts)

#### F1, F3, F5, F6 — vérification rapide

#### F2 — Landing sectorielle E-commerce
- [ ] Lancer Port B avec `NEXT_PUBLIC_SECTOR=ecommerce`
- [ ] Hero orienté commerçants en ligne
- [ ] Features : Catalogue, Commande & paiement, Suivi commande, base universelle. **Pas de RDV**
- [ ] CTA, tarifs, témoignages, footer

> _Notes inline :_

#### F4 — Onboarding sectoriel E-commerce
- [ ] Sélection secteur E-commerce
- [ ] Infos entreprise, abonnement, paiement
- [ ] **Vérifier que l'étape RDV est bien absente**
- [ ] Génération agent, redirection dashboard

> _Notes inline :_

#### F7 — Configuration métier E-commerce
- [ ] **Catégories produits** : créer, ordonner
- [ ] **Produits — Ajout** : nom, description, prix, photos, stock, variantes (taille, couleur)
- [ ] **Produits — Modifier, désactiver, supprimer**
- [ ] **Statuts commande** : confirmer la liste (nouveau, payé, préparé, expédié, livré, annulé)
- [ ] **FAQ e-commerce** : livraison, retours, paiement
- [ ] **Paramètres agent**

> _Notes inline :_

#### F8 — Test agent IA E-commerce

**Interface interne :**
- [ ] **A — Présentation catalogue**
- [ ] **B — Recherche produit**
- [ ] **C — Commande complète** : sélection → panier → calcul total déterministe → paiement → confirmation → **persistance BDD**
- [ ] **D — Suivi commande** : "Où en est ma commande N°XXX ?"
- [ ] **E — Question stock** : produit en rupture → info correcte
- [ ] **F — Question livraison/retour**

**WAHA :**
- [ ] Re-jouer C complet
- [ ] Re-jouer D après mise à jour statut côté propriétaire

> _Notes inline :_

#### F9 — Suivi post-interaction
- [ ] Commande visible dans dashboard
- [ ] Mise à jour statut → client peut le retrouver via bot
- [ ] Stats CA, nb commandes
- [ ] Notification email

#### F10 — vérification rapide

#### Bug log — E-commerce

| ID | Flux | Description | Sévérité | F / B | Statut |
|----|------|-------------|----------|-------|--------|
| E-001 |  |  |  |  |  |

---

### 5.4 Transport

**Sous-domaine :** `travell.agt-bot.com`
**Slug :** `transport`
**Variante RDV :** aucune
**Features sectorielles :** Catalogue trajets & tarifs, Réservation billet
**Ressources métier :** trajets, classes de billet

#### F1, F3, F5, F6 — vérification rapide

#### F2 — Landing sectorielle Transport
- [ ] Lancer Port B avec `NEXT_PUBLIC_SECTOR=transport`
- [ ] Hero orienté compagnies de transport
- [ ] Features : Catalogue trajets, Réservation billet, base universelle
- [ ] CTA, tarifs, témoignages, footer

> _Notes inline :_

#### F4 — Onboarding sectoriel Transport
- [ ] Sélection secteur Transport
- [ ] Infos entreprise (nb véhicules)
- [ ] Abonnement, paiement
- [ ] Génération agent (sans RDV), redirection dashboard

> _Notes inline :_

#### F7 — Configuration métier Transport
- [ ] **Trajets — Ajout** : origine, destination, jours d'opération, horaires, tarif, classes
- [ ] **Trajets — Modifier, désactiver, supprimer**
- [ ] **Classes de billet** : standard, VIP, etc. + tarification
- [ ] **FAQ transport** : bagages, annulation, durée
- [ ] **Paramètres agent**

> _Notes inline :_

#### F8 — Test agent IA Transport

**Interface interne :**
- [ ] **A — Recherche trajet** : "Bus pour Bafoussam demain ?"
- [ ] **B — Présentation horaires et classes**
- [ ] **C — Réservation billet** : sélection → paiement → confirmation → **persistance BDD**
- [ ] **D — Question tarif**
- [ ] **E — Trajet inexistant** : décline correctement

**WAHA :**
- [ ] Re-jouer C
- [ ] Email confirmation avec billet

> _Notes inline :_

#### F9 — Suivi post-interaction
- [ ] Réservation visible côté entreprise
- [ ] Édition/annulation/marquer "embarqué"
- [ ] Stats : nb billets vendus, CA

#### F10 — vérification rapide

#### Bug log — Transport

| ID | Flux | Description | Sévérité | F / B | Statut |
|----|------|-------------|----------|-------|--------|
| T-001 |  |  |  |  |  |

---

### 5.5 Banque & Microfinance

> **Note :** **multi-agences** = feature architecturalement unique. Tester finement.

**Sous-domaine :** `banking.agt-bot.com`
**Slug :** `banking`
**Variante RDV :** Prise de RDV conseiller
**Features sectorielles :** Catalogue produits financiers, Multi-agences
**Ressources métier :** agences, conseillers, produits financiers

#### F1, F3, F5, F6 — vérification rapide

#### F2 — Landing sectorielle Banque
- [ ] Lancer Port B avec `NEXT_PUBLIC_SECTOR=banking`
- [ ] Hero orienté banques et microfinances
- [ ] Features : RDV conseiller, Catalogue financier, Multi-agences, base universelle
- [ ] CTA, tarifs, témoignages

> _Notes inline :_

#### F4 — Onboarding sectoriel Banque
- [ ] Sélection secteur Banque
- [ ] Infos entreprise (institution mère)
- [ ] Abonnement, paiement
- [ ] Génération agent, redirection dashboard

> _Notes inline :_

#### F7 — Configuration métier Banque
- [ ] **Agences — Ajout** : nom, adresse, ville, téléphone, horaires
- [ ] **Agences — Modifier, désactiver, supprimer**
- [ ] **Conseillers** : assignation à une agence, créneaux
- [ ] **Produits financiers** : nom, taux, conditions, documents requis (manuel)
- [ ] **Produits — Modifier, désactiver**
- [ ] **FAQ banking**
- [ ] **Paramètres agent** (caractère informationnel — pas de conseil financier)

> _Notes inline :_

#### F8 — Test agent IA Banque

**Interface interne :**
- [ ] **A — Présentation produits financiers**
- [ ] **B — Question taux/conditions**
- [ ] **C — Documents requis pour ouvrir un compte**
- [ ] **D — RDV conseiller** : agence → conseiller → créneau → confirmation → **persistance BDD**
- [ ] **E — Demande sensible** ("Donnez-moi mon solde") : décline (pas d'accès systèmes internes V1)
- [ ] **F — Localisation agence** : info textuelle (pas de géoloc V1)

**WAHA :**
- [ ] Re-jouer D
- [ ] Email confirmation avec documents à apporter

> _Notes inline :_

#### F9 — Suivi post-interaction
- [ ] RDV visible côté agence concernée (isolation multi-agences)
- [ ] Notification email à l'agence et au conseiller
- [ ] Stats globales et par agence

#### F10 — vérification rapide

#### Bug log — Banque

| ID | Flux | Description | Sévérité | F / B | Statut |
|----|------|-------------|----------|-------|--------|
| B-001 |  |  |  |  |  |

---

### 5.6 Santé & Hôpitaux

> **Note :** L'agent **ne prend pas de décision médicale**. Vérifier ce garde-fou.

**Sous-domaine :** `clinical.agt-bot.com`
**Slug :** `clinical`
**Variante RDV :** Prise de RDV (consultation médicale)
**Features sectorielles :** Orientation patient
**Ressources métier :** spécialités, médecins, créneaux

#### F1, F3, F5, F6 — vérification rapide

#### F2 — Landing sectorielle Santé
- [ ] Lancer Port B avec `NEXT_PUBLIC_SECTOR=clinical`
- [ ] Hero orienté professionnels de santé
- [ ] Features : RDV consultation, Orientation patient, base universelle
- [ ] CTA, tarifs, témoignages

> _Notes inline :_

#### F4 — Onboarding sectoriel Santé
- [ ] Sélection secteur Santé
- [ ] Infos entreprise (clinique / cabinet)
- [ ] Abonnement, paiement
- [ ] Génération agent, redirection dashboard

> _Notes inline :_

#### F7 — Configuration métier Santé
- [ ] **Spécialités** : créer (cardiologie, pédiatrie, etc.)
- [ ] **Médecins** : ajouter, associer à spécialité, photos
- [ ] **Créneaux** : disponibilités par médecin
- [ ] **Orientation patient** : règles symptômes → spécialité (informationnel, pas diagnostic)
- [ ] **FAQ santé** : préparation, documents, urgences
- [ ] **Paramètres agent** (ton bienveillant, disclaimer médical)

> _Notes inline :_

#### F8 — Test agent IA Santé

**Interface interne :**
- [ ] **A — Symptômes vagues** : "J'ai mal à la poitrine" → orientation spécialité + recommandation de consulter (sans diagnostic)
- [ ] **B — RDV avec spécialité connue** : "RDV en cardiologie"
- [ ] **C — Sélection médecin et créneau** → confirmation → **persistance BDD**
- [ ] **D — Urgence déclarée** : orientation immédiate vers les urgences
- [ ] **E — Demande de diagnostic** : décline et redirige vers médecin
- [ ] **F — Annulation/report RDV**

**WAHA :**
- [ ] Re-jouer C
- [ ] Email confirmation avec rappels

> _Notes inline :_

#### F9 — Suivi post-interaction
- [ ] RDV visibles dans l'agenda du médecin
- [ ] Notification médecin / secrétariat
- [ ] Stats : nb consultations, par spécialité

#### F10 — vérification rapide

#### Bug log — Santé

| ID | Flux | Description | Sévérité | F / B | Statut |
|----|------|-------------|----------|-------|--------|
| S-001 |  |  |  |  |  |

---

### 5.7 PME & Entreprises

**Sous-domaine :** `pme.agt-bot.com`
**Slug :** `pme`
**Variante RDV :** Prise de RDV (commercial)
**Features sectorielles :** Catalogue services & tarifs, Conversion prospects
**Ressources métier :** services, prospects

#### F1, F3, F5, F6 — vérification rapide

#### F2 — Landing sectorielle PME
- [ ] Lancer Port B avec `NEXT_PUBLIC_SECTOR=pme`
- [ ] Hero orienté PME
- [ ] Features : RDV commercial, Catalogue services, Conversion prospects, base universelle

> _Notes inline :_

#### F4 — Onboarding sectoriel PME
- [ ] Sélection secteur PME
- [ ] Infos entreprise, abonnement, paiement
- [ ] Génération agent, redirection dashboard

> _Notes inline :_

#### F7 — Configuration métier PME
- [ ] **Services — Ajout** : nom, description, tarif (fixe / sur devis), durée
- [ ] **Services — Modifier, désactiver, supprimer**
- [ ] **Conversion prospects** : configurer champs à capturer (nom, tel, besoin, budget)
- [ ] **FAQ PME**
- [ ] **Paramètres agent** (ton commercial, professionnel)

> _Notes inline :_

#### F8 — Test agent IA PME

**Interface interne :**
- [ ] **A — Présentation services**
- [ ] **B — Demande de devis** : capture infos prospect même sans achat → **persistance BDD prospect**
- [ ] **C — RDV commercial**
- [ ] **D — Question prix / délai**
- [ ] **E — Visite simple sans intention d'achat** : capture quand même le contact

**WAHA :**
- [ ] Re-jouer B et C
- [ ] Vérifier prospect en base

> _Notes inline :_

#### F9 — Suivi post-interaction
- [ ] Liste prospects visible avec niveau d'intérêt
- [ ] RDV commerciaux dans agenda
- [ ] Stats : nb prospects, taux conversion

#### F10 — vérification rapide

#### Bug log — PME

| ID | Flux | Description | Sévérité | F / B | Statut |
|----|------|-------------|----------|-------|--------|
| P-001 |  |  |  |  |  |

---

### 5.8 Éducation

> **Note :** Pas de paiement transactionnel via le bot. Communications parents/élèves par **email**, pas WhatsApp.

**Sous-domaine :** `school.agt-bot.com`
**Slug :** `school`
**Variante RDV :** Prise de RDV (admission, info)
**Features sectorielles :** Inscriptions & admissions, Communication établissement
**Ressources métier :** formations, calendrier, modèles de communication

#### F1, F3, F5, F6 — vérification rapide

#### F2 — Landing sectorielle École
- [ ] Lancer Port B avec `NEXT_PUBLIC_SECTOR=school`
- [ ] Hero orienté établissements
- [ ] Features : Inscriptions, Communication, RDV admission, base universelle
- [ ] **Vérifier** : pas de promesse WhatsApp pour communications proactives

> _Notes inline :_

#### F4 — Onboarding sectoriel École
- [ ] Sélection secteur Éducation
- [ ] Infos entreprise (établissement)
- [ ] Abonnement, paiement
- [ ] Génération agent, redirection dashboard

> _Notes inline :_

#### F7 — Configuration métier École
- [ ] **Formations / cursus** : ajouter, modifier, supprimer
- [ ] **Calendrier admissions** : périodes, dates clés
- [ ] **Modèles de communication** : annonces (résultats, absences, événements) — par email
- [ ] **FAQ éducation** : prérequis, frais, débouchés
- [ ] **Paramètres agent**

> _Notes inline :_

#### F8 — Test agent IA École

**Interface interne :**
- [ ] **A — Info sur une formation**
- [ ] **B — Demande inscription / dossier admission** : guidage processus, documents
- [ ] **C — RDV avec service admission**
- [ ] **D — Question parent sur résultats** : info publique seulement, redirection officielle pour le personnel
- [ ] **E — Annonce d'événement** : déclenchement communication email aux parents

**WAHA :**
- [ ] Re-jouer A et B

> _Notes inline :_

#### F9 — Suivi post-interaction
- [ ] Demandes admission visibles
- [ ] RDV admission dans agenda
- [ ] Stats : nb demandes par formation

#### F10 — vérification rapide

#### Bug log — Éducation

| ID | Flux | Description | Sévérité | F / B | Statut |
|----|------|-------------|----------|-------|--------|
| Ed-001 |  |  |  |  |  |

---

### 5.9 Secteur Public

> **Note :** chaque entité publique = **tenant distinct**. L'agent ne représente jamais l'administration globale. Pas de paiement métier.

**Sous-domaine :** `public.agt-bot.com`
**Slug :** `public`
**Variante RDV :** Prise de RDV (citoyen — service public)
**Features sectorielles :** Orientation citoyens
**Ressources métier :** procédures, documents requis

#### F1, F3, F5, F6 — vérification rapide

#### F2 — Landing sectorielle Public
- [ ] Lancer Port B avec `NEXT_PUBLIC_SECTOR=public`
- [ ] Hero orienté entités publiques
- [ ] Features : Orientation citoyens, RDV, base universelle

> _Notes inline :_

#### F4 — Onboarding sectoriel Public
- [ ] Sélection secteur Public
- [ ] Infos entreprise (entité publique précise)
- [ ] Abonnement, paiement (plateforme uniquement)
- [ ] Génération agent, redirection dashboard

> _Notes inline :_

#### F7 — Configuration métier Public
- [ ] **Procédures** : ajouter (titre, description, étapes, documents requis)
- [ ] **Procédures — Modifier, désactiver**
- [ ] **FAQ public**
- [ ] **Paramètres agent** (ton institutionnel, neutre)

> _Notes inline :_

#### F8 — Test agent IA Public

**Interface interne :**
- [ ] **A — Question sur procédure** : "Comment obtenir un acte de naissance ?"
- [ ] **B — Documents requis pour démarche**
- [ ] **C — RDV avec un service**
- [ ] **D — Demande hors compétence** : décline et oriente
- [ ] **E — Plainte / réclamation** : enregistre et oriente

**WAHA :**
- [ ] Re-jouer A

> _Notes inline :_

#### F9 — Suivi post-interaction
- [ ] Demandes citoyennes consultables
- [ ] RDV planifiés
- [ ] Stats : volume par procédure

#### F10 — vérification rapide

#### Bug log — Secteur Public

| ID | Flux | Description | Sévérité | F / B | Statut |
|----|------|-------------|----------|-------|--------|
| Pu-001 |  |  |  |  |  |

---

### 5.10 Personnalisé (Custom)

> **Stress test architectural.** Aucune `SectorFeature` préconfigurée. L'utilisateur choisit librement. Valide définitivement l'architecture 100% data-driven.

**Sous-domaine :** — (pas de sous-domaine dédié)
**Slug :** `custom`
**Particularité :** assemblage libre de features

#### F1 — Landing centrale
- [ ] Mention "Votre secteur n'est pas listé ?" + lien vers flow custom

#### F2 — Landing sectorielle
- [ ] Décision : landing dédiée custom ou accès via onboarding seulement ?
- [ ] Si landing : la créer en cohérence

> _Notes inline :_

#### F3 — vérification rapide

#### F4 — Onboarding sectoriel Custom
- [ ] Sélection "Personnalisé"
- [ ] **Étape Feature Picker** : catalogue complet des 22 features avec descriptions
- [ ] Sélection d'un sous-ensemble
- [ ] Validation cohérence (règles d'incompatibilité éventuelles)
- [ ] Infos entreprise, abonnement, paiement
- [ ] Génération agent avec **uniquement** features choisies
- [ ] Redirection dashboard

> _Notes inline :_

#### F5, F6 — vérification rapide

#### F7 — Configuration métier Custom
- [ ] Dashboard affiche **uniquement** sections correspondant aux features choisies
- [ ] Aucune section "fantôme" non sélectionnée
- [ ] Configuration de chaque feature choisie

> _Notes inline :_

#### F8 — Test agent IA Custom
- [ ] Construire 2-3 combinaisons de features et tester chacune
- [ ] Agent répond cohéremment dans le périmètre choisi
- [ ] Agent décline les demandes hors features sélectionnées

> _Notes inline :_

#### F9, F10 — vérification rapide

#### Bug log — Custom

| ID | Flux | Description | Sévérité | F / B | Statut |
|----|------|-------------|----------|-------|--------|
| C-001 |  |  |  |  |  |

---

## 6. Validation finale & déploiement

### 6.1 Checklist pré-prod

- [ ] Tous les bugs bloquants et hauts résolus
- [ ] Aucune régression du socle commun lors de la dernière passe
- [ ] Tests de charge minimaux backend
- [ ] Backup BDD avant déploiement
- [ ] Variables d'environnement de production validées
- [ ] Sandbox paiements remplacé par credentials prod
- [ ] WAHA configuré numéros prod
- [ ] DNS sous-domaines configurés et SSL valides
- [ ] Monitoring (logs, alertes, métriques) actif

### 6.2 Stratégie de déploiement

Local jusqu'à ce que Restaurant soit solide, puis déploiement progressif.

- [ ] Déploiement Restaurant
- [ ] Smoke tests prod Restaurant
- [ ] Déploiement Hôtel
- [ ] Déploiement E-commerce
- [ ] Déploiement Transport
- [ ] Déploiement Banque
- [ ] Déploiement Santé
- [ ] Déploiement PME
- [ ] Déploiement Éducation
- [ ] Déploiement Secteur Public
- [ ] Déploiement landing centrale
- [ ] Déploiement Custom

### 6.3 Post-déploiement

- [ ] Surveillance logs sur 48h
- [ ] Métriques (latence, 500, conversion onboarding)
- [ ] Communication interne sur leçons apprises
- [ ] Mise à jour de ce document avec les améliorations

---

## Annexes

### A1 — Liste des features V1

À compléter avec les 22 features de la conception backend, leur slug et leur statut d'activation par secteur.

### A2 — Modèle de données

Référence à `contexte_backend.txt` — section "Modèle de données complet" (32 tables).

### A3 — Décisions prises au cours de cette session de planification

| Décision | Rationale |
|----------|-----------|
| Approche depth-first par secteur | Premier secteur amortit les bugs du socle |
| Restaurant en premier | Le plus riche (RDV variant + commande + paiement + menu) |
| Test local avant prod | Solidité avant exposition |
| Conception = source de vérité | Versions en ligne actuelles non représentatives |
| Landings à refaire | Ne respectent pas la conception |
| Double niveau de test agent | Interface interne + WAHA |
| Plan flexible, pas rigide | Direction > rigidité |
| F1 inclus dans le périmètre | Le test drive la correction |
| Bug tracking double | Inline + log centralisé |

### A4 — Glossaire rapide

- **Tenant** : entité contractuelle (entreprise abonnée)
- **Agence** : unité opérationnelle d'un tenant
- **SectorFeature** : association data-driven secteur ↔ feature
- **WAHA** : passerelle WhatsApp pour tests live et production
- **Wallet** : porte-monnaie électronique du tenant
- **Socle commun** : composants partagés par tous les secteurs (auth, dashboard, agent core, paiement, notifications)

---

*Fin du document. Ce plan est vivant — toute amélioration est bienvenue.*
```

---

**Notes :**
- Le markdown est dans le bloc ci-dessus, prêt à coller dans un fichier `.md`
- Toutes les décisions de notre discussion sont reprises en annexe A3
- Le glossaire en A4 sécurise la compréhension par toute personne de l'équipe
- Quand l'outil de création de fichier sera réopérationnel, je pourrai te livrer le `.md` directement en téléchargement

Tu peux commencer la branche **Restaurant — F1** dès que ton environnement local est lancé.