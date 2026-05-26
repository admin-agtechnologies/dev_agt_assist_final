# Rapport de test — catalogue_services
**Session** : 74  
**Membre** : Steven  
**Date** : 2026-05-25  
**Statut final** : ✅ Validé — steps a→h complétés  

---

## Résumé exécutif

Feature `catalogue_services` testée et validée sur le tenant **AGT BOT — Démo Complète**
(`demo-custom@agt.cm`). Skill mis à jour en BD. 2 bugs corrigés pendant la session.
1 bug de données ouvert, signalé à Gabriel.

---

## Steps réalisés

### Step a — Lecture et amélioration du skill
- Fichier source lu : `apps/agent/skills/features/catalogue_services.md`
- Lacunes identifiées : actions non documentées, paramètres absents, zéro exemple JSON,
  séquence obligatoire non explicitée, cas limites non couverts, différenciation sectorielle absente.
- Skill réécrit de zéro — version exhaustive calquée sur le modèle `system_prompt.md`.
- **Stockage** : skill en BD (`AgentSkill` niveau=feature, slug=catalogue_services).
  Le fichier `.md` sur disque n'est pas utilisé — la BD est la source de vérité.

### Step b — Vérification données KB
- Entreprise : AGT BOT — Démo Complète (`a7dfc230-40ff-4354-895a-2fbe8d3f0445`)
- Items `catalogue_services` disponibles : **6**
  - Audit PME — 150 000 FCFA
  - Pack Formation — 45 000 FCFA
  - Service principal — prix null (sur devis)
  - Produit phare — prix null (sur devis)
  - Consultation / Devis — 0 FCFA (gratuit)
  - + 1 item supplémentaire
- ⚠️ `action_suivante = "aucune"` sur tous les items → BUG-B5-S75-01 (données KB)

### Step c — Configuration bot
- `TenantFeature` catalogue_services : ✅ active
- Actions bootstrappées sur l'agent (elles étaient absentes) :
  - `get_services` ✅
  - `get_item_detail` ✅
  - `list_catalogue_items` ✅
  - `get_catalogue` ✅
- Note : `catalogue_sectoriel` n'est pas un slug d'AIAction — les slugs réels sont
  `list_catalogue_items` et `get_catalogue`. Le TODO_B5 référence un mauvais nom.

### Step d — Test get_services
- Message : "Quels services proposez-vous ?"
- Résultat : ✅ 6 items retournés, feedback affiché, tag "Services consultés" visible
- Durée : 26ms

### Step e — Test get_item_detail
- Message : "Je veux plus de détails sur l'Audit PME"
- Résultat : ✅ Détails corrects, UUID mémorisé depuis get_services
- Durée : 41ms

### Step f — Persistance /résultats
- 2 actions loggées ✅
- Résumé automatique correct ✅
- Statut ACTIVE, timestamps corrects ✅

### Step g — Scénario E2E complet
Scénario nominal (4 messages) :
1. "Quels services proposez-vous ?" → get_services ✅
2. "Je veux les détails du Pack Formation" → get_item_detail ✅ (UUID mémorisé)
3. "Et pour l'Audit PME ?" → get_item_detail ✅ (2ème item sans rappeler get_services)
4. "Je suis intéressé, comment réserver ?" → réponse vide ❌ (BUG-B5-S75-01)

### Step h — Validation et corrections

**2 bugs corrigés pendant la session :**

#### BUG-B5-S75-02 — UUID inventé (CORRIGÉ)
- **Symptôme** : client demande directement un service sans passer par la liste
  → bot appelle `get_item_detail` avec un UUID inventé → erreur 1ms ❌
- **Cause** : skill ne guidait pas le bot à appeler `get_services` en arrière-plan
- **Fix** : ajout dans le skill de la règle critique UUID + diagramme flux direct +
  exemple 7 montrant le comportement attendu
- **Résultat après fix** : ✅ bot appelle `get_services` silencieusement, trouve l'UUID,
  enchaîne sur `get_item_detail` — transparent pour l'utilisateur

#### BUG-B5-S75-03 — Réponse vide sur count=0 (CORRIGÉ)
- **Symptôme** : "Avez-vous un service de plomberie ?" → bulle vide ❌
- **Cause** : `GetServicesAction` retournait `{"items": [], "count": 0}` sans message
  d'erreur → LLM ne savait pas quoi répondre
- **Fix** : deux actions combinées :
  1. Ajout dans le skill de la règle "réponse vide INTERDITE" + exemple 8
  2. Mise à jour du skill en BD via script `update_skill.py`
- **Résultat après fix** : ✅ "Je n'ai pas trouvé de service de plomberie dans notre
  catalogue. Souhaitez-vous que je vous mette en contact avec un conseiller ?"

---

## Bugs ouverts

### BUG-B5-S75-01 — action_suivante vide sur tous les items KB
- **Statut** : ⚠️ Ouvert — correction de données, pas de code
- **Symptôme** : client dit "je veux réserver" → bot bloque, réponse vide
- **Cause** : tous les items demo-custom ont `action_suivante = "aucune"` en base
- **Fix recommandée** : mettre `action_suivante = "proposer_rdv"` sur les items
  concernés (Audit PME, Pack Formation, Consultation/Devis)
- **Impact utilisateur** : bot ne propose pas de RDV après présentation d'un service
- **À signaler à** : Gabriel (correction KB seed ou admin)

---

## Observations techniques

- Le skill `catalogue_services` est stocké en **BD** (`AgentSkill`), pas sur disque.
  Toute modification doit passer par un script `manage.py shell` ou l'admin Django.
  Le fichier `.md` sur disque est ignoré.
- `catalogue_sectoriel` dans TODO_B5 = nom du fichier Python, pas un slug d'action.
  Les slugs réels : `list_catalogue_items`, `get_catalogue`.
- Pattern BUG UUID transverse : même problème identifié sur `menu_digital` (BUG-B5-001).
  La règle "get_services en arrière-plan" devrait être appliquée à toutes les features
  catalogue (`catalogue_produits`, `catalogue_trajets`).

---

## Fichiers modifiés

| Fichier | Type | Action |
|---------|------|--------|
| `AgentSkill` BD (slug=catalogue_services) | BD | Mise à jour contenu_fr complet |
| `apps/agent/skills/features/catalogue_services.md` | Disque | Mis à jour (non utilisé) |
| `AIAgentAction` agent demo-custom | BD | 4 actions bootstrappées |

---

## Prochaine feature recommandée
**reservation_chambre (16)** — Step a.