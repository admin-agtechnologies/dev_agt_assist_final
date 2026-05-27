# Rapport de session — session_73_stephane

## Métadonnées

| Champ | Valeur |
|---|---|
| **Membre** | Stéphane |
| **Session N°** | 73 |
| **Date** | 2026-05-26 |
| **Type** | Génération Skills LLM + Audit qualité + Tests B5 (steps b→g) |
| **Durée estimée** | ~8h |
| **Statut** | ⚠️ Partielle — 4 features testées sur 5, `suivi_commande` reste à faire |

---

## Objectif de la session

**Partie 1 (matin) :** Produire les 9 skills actions et 5 skills features couvrant le périmètre B5 de Stéphane au niveau de rigueur maximum.

**Partie 2 (après-midi) :** Tester les 5 features sur l'interface WhatsApp Simulator avec le bot de test dédié, valider les steps b→g, corriger les skills, documenter les bugs backend/frontend.

---

## Ce qui a été fait — ordre chronologique

### Partie 1 — Skills (matin)

1. **Initialisation** — Lecture INDEX.md, TODO_B5.md, contextes frontend/backend.
2. **Audit des 5 skills features existants** — État évalué entre 30% et 50% du standard `menu_digital`.
3. **Génération v1 des 9 actions** — Corrections payload : `list_catalogue_items`, `create_reservation`, `send_reminder`.
4. **Création checklists** — `checklist_audit_actions.md` (52 critères) + `checklist_audit_features.md` (~65 critères).
5. **Audit v1 des 9 actions** — 3 points bloquants : `lignes[]` inventé, `numero_confirmation` inexistant.
6. **Génération v2 des 9 actions** — 52/52 checklist. Déployés.
7. **Génération v2 de 3 features** — `suivi_commande`, `reservation_table`, `reservation_billet` corrigés.
8. **Génération scénarios adversariaux** — 8 catégories, 40+ scénarios.

### Partie 2 — Tests (après-midi)

9. **Setup bot de test** — Création bot dédié `c521960d-3abd-490c-9d01-d2e071975dbe` sur `demo-custom@agt.cm`. Établissement convention Docker : `docker compose --env-file .env.dev -f docker-compose.dev.yml`.
10. **Pull fix DETTE-S70-01** — Gabriel a pushé un fix sur `core.py`, `llm.py`, `deepseek_provider.py`. Rebuild effectué. Fix confirmé ✅.
11. **catalogue_produits** — Steps b/c/d/e/f validés. 11 scénarios adversariaux testés. 2 corrections skills appliquées.
12. **catalogue_trajets** — Steps b/c/d/f validés. 10 scénarios adversariaux testés. 2 corrections skills appliquées.
13. **reservation_table** — Steps b/c/d validés. 6 scénarios testés. 2 corrections skills appliquées. 3 bugs backend/frontend identifiés.
14. **reservation_billet** — Steps b/c/d validés. 11 scénarios testés. 2 corrections skills appliquées. 2 bugs identifiés.
15. **Documentation bugs** — 6 bugs non résolvables via skills documentés (BUG-S74-01 à BUG-S74-06).

---

## Steps B5 traités

| Feature | Step | Résultat | Notes |
|---|---|---|---|
| `catalogue_produits` | a | ✅ | Skills 100% |
| `catalogue_produits` | b | ✅ | 2 items en base |
| `catalogue_produits` | c | ✅ | 3 actions bootstrappées via shell |
| `catalogue_produits` | d | ✅ | get_catalogue + get_item_detail OK |
| `catalogue_produits` | e | ✅ | N/A lecture seule — action exécutée correctement |
| `catalogue_produits` | f | ✅ | "Article consulté" + "Catalogue consulté" visibles |
| `catalogue_trajets` | a | ✅ | Skills 100% |
| `catalogue_trajets` | b | ✅ | 3 items + 6 CatalogueTrajet en base |
| `catalogue_trajets` | c | ✅ | get_trajets + list_catalogue_items bootstrappés |
| `catalogue_trajets` | d | ✅ | Filtre par ville fonctionne |
| `catalogue_trajets` | e | ✅ | N/A lecture seule |
| `catalogue_trajets` | f | ✅ | "Trajets consultés" visible |
| `reservation_table` | a | ✅ | Skills 100% |
| `reservation_table` | b | ✅ | 2 ressources table (4 et 6 couverts) |
| `reservation_table` | c | ✅ | check_disponibilite + create_reservation bootstrappés |
| `reservation_table` | d | ✅ | Flux complet collecte nom/tel/date → récap |
| `reservation_billet` | a | ✅ | Skills 100% |
| `reservation_billet` | b | ✅ | 2 ressources trajet (Bus Douala-Yaoundé 7h + Bus Yaoundé-Bafoussam) |
| `reservation_billet` | c | ✅ | check_disponibilite + create_reservation actives |
| `reservation_billet` | d | ✅ | E2E 2 billets avec récap complet |
| `suivi_commande` | a | ✅ | Skills 100% |
| `suivi_commande` | b→g | ⏳ | À faire session suivante |

---

## Découverte importante — gap produit interface

**Constat validé en session :**
- Activer une feature via l'onglet Config **ne crée pas** les `AIAgentAction` → le LLM n'a pas accès aux actions.
- Désactiver une feature **ne supprime pas** les `AIAgentAction` → le LLM peut toujours appeler des actions de features désactivées.

**Workaround actuel :** bootstrap manuel via shell pour chaque feature testée.

---

## Corrections skills appliquées

| Fichier | Correction |
|---|---|
| `skills/features/catalogue_produits.md` | Garde-fou : catégorie inexistante → ne pas dire "indisponible" si catalogue non vide |
| `skills/actions/get_item_detail.md` | Garde-fou : ne pas réutiliser l'item_id précédent pour un produit différent |
| `skills/features/catalogue_trajets.md` | Garde-fou : ne jamais inventer horaires/gare sans check_disponibilite |
| `skills/features/reservation_table.md` | Garde-fou heure ambiguë + collecte téléphone sans boucle |
| `skills/features/reservation_billet.md` | Garde-fou : ne jamais mentionner prix sans get_trajets + heure/gare sans check_disponibilite |

---

## Bugs découverts (non résolvables via skills)

| ID | Zone | Description | Gravité |
|---|---|---|---|
| BUG-S74-01 | Backend — features/services | Activation feature via interface ne crée pas les AIAgentAction | 🔴 Haute |
| BUG-S74-02 | Backend — features/services | Désactivation feature ne désactive pas les AIAgentAction | 🔴 Haute |
| BUG-S74-03 | Backend — reservations actions | check_disponibilite ne vérifie pas les conflits de créneau existants | 🔴 Haute |
| BUG-S74-04 | Frontend — ActionCards | Carte "RDV planifié" affiche toujours "INFOS MANQUANTES" même après collecte | 🟡 Moyenne |
| BUG-S74-05 | Backend — catalogue actions | get_trajets retourne mauvais sens sur filtre ville (icontains sans ordre) | 🟡 Moyenne |
| BUG-S74-06 | Frontend — WhatsAppSimulator | Suggestions non filtrées par features actives (déjà BUG-B5-008 S67) | 🟡 Moyenne |

---

## Bugs corrigés

| ID | Description | Solution |
|---|---|---|
| DETTE-S70-01 | DeepSeek JSON instable contexte long — bulle blanche | Pull Gabriel S74 — fix `core.py` + `llm.py` + `deepseek_provider.py` ✅ |

---

## Scénarios adversariaux testés

### catalogue_produits (11 scénarios)
Catégorie inexistante ✅ | Produit ambigu ✅ | Prix sans catalogue ✅ | Injection prix ✅ | Langue anglaise ✅ | Contexte long 4 échanges ✅ | Réutilisation mauvais UUID ⚠️ corrigé skills | Injection prompt ✅

### catalogue_trajets (10 scénarios)
Trajet inexistant ✅ | Filtre ville partiel ✅ | Injection prix ✅ | Réservation directe → hallucination horaire ⚠️ corrigé skills | Destination ambiguë ✅ | Quantité sans destination ✅ | Sens inverse ⚠️ BUG-S74-05 | Calcul total ✅ | Changement d'avis ✅ | Date passée ✅

### reservation_table (6 scénarios)
Groupe > 8 → transfer humain ✅ | Date passée ✅ | Créneau déjà pris ⚠️ BUG-S74-03 | Annulation → transfer humain ✅ | Sans nb couverts ✅ | Heure ambiguë → boucle ⚠️ corrigé skills

### reservation_billet (11 scénarios)
E2E 2 billets ✅ | Trajet inexistant ✅ | 60 places → transfer humain ✅ | Sans préciser trajet ✅ | Sens inverse ⚠️ BUG-S74-05 | Hallucination horaire ⚠️ corrigé skills | Date passée ✅ | Changement trajet ✅ | 8 billets calcul ✅ | Injection prix ⚠️ hallucine prix mémoire → corrigé skills | Infos incomplètes ✅

---

## État des 5 features B5 de Stéphane

| Feature | Steps validés | Statut | Prochaine étape |
|---|---|---|---|
| `catalogue_produits` (9) | a b c d e f | ✅ Avancé | Steps g + h |
| `catalogue_trajets` (12) | a b c d e f | ✅ Avancé | Steps g + h |
| `reservation_table` (15) | a b c d | 🔄 En cours | Steps e f g h |
| `reservation_billet` (13) | a b c d | 🔄 En cours | Steps e f g h |
| `suivi_commande` (11) | a | ⏳ À faire | Steps b→h |

---

## Points ouverts / signalements pour Gabriel

1. **BUG-S74-01/02** — Gap critique : l'interface ne synchronise pas les `AIAgentAction` à l'activation/désactivation des features. À corriger dans `apps/features/services.py` ou via signals.
2. **BUG-S74-03** — `check_disponibilite` ne vérifie pas les réservations existantes → double booking possible.
3. **BUG-S74-04** — Carte ActionCards "INFOS MANQUANTES" — données collectées non reflétées dans la carte inline.
4. **BUG-S74-05** — `GetTrajetsAction` filtre `icontains` non directionnel — retourne sens inverse.
5. **BUG-S74-06 = BUG-B5-008** — Suggestions simulateur non filtrées par features actives (déjà signalé S67).
6. **Convention Docker** établie pour ce projet : `docker compose --env-file .env.dev -f docker-compose.dev.yml`

---

## Prompt début session suivante (S75 — Stéphane)

```
Bonjour, je suis Stéphane. Session 75 — suite B5.

Session précédente (S73 étendue) :
- 4 features testées : catalogue_produits ✅, catalogue_trajets ✅,
  reservation_table 🔄, reservation_billet 🔄
- Skills corrigés sur les 4 features testées
- 6 bugs backend/frontend documentés (BUG-S74-01 à BUG-S74-06) — à corriger par Gabriel

Aujourd'hui :
1. Finir suivi_commande steps b→g
2. Compléter steps e/f/g/h sur reservation_table et reservation_billet
3. Steps g/h sur catalogue_produits et catalogue_trajets

Compte de test :
Email    : demo-custom@agt.cm
Password : Demo@2024!
Bot test : c521960d-3abd-490c-9d01-d2e071975dbe
Docker   : docker compose --env-file .env.dev -f docker-compose.dev.yml
```
