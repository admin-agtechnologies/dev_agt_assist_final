# Rapport feature — catalogue_trajets

## Métadonnées

| Champ | Valeur |
|---|---|
| Feature | catalogue_trajets |
| Membre | Stéphane |
| Session(s) | S73 |
| Date | 2026-05-26 |
| Statut | ✅ Complète (steps a→f validés) |

---

## Phase 1 — Config

- Feature visible dans "Features & Actions Autorisées" : ✅
- Actions associées actives :
  - `get_trajets` : ✅ (bootstrappé via shell)
  - `list_catalogue_items` : ✅ (déjà présente)
- Observations : même gap BUG-S74-01 — actions non créées automatiquement

---

## Phase 2 — Skills améliorés

| Fichier | Ce qui a été amélioré |
|---|---|
| `skills/features/catalogue_trajets.md` | Garde-fou : ne jamais mentionner horaires (ex: "07h00") ni lieu de départ précis (ex: "Gare de Mvan") sans avoir appelé `check_disponibilite`. Si le client demande les horaires → collecter la date puis appeler `check_disponibilite`. Si changement de destination → mettre à jour contexte immédiatement et relancer `get_trajets`. |

---

## Phase 3 — Test E2E

### Scénarios testés (10)

| # | Message envoyé | Action déclenchée | Résultat attendu | Résultat réel |
|---|---|---|---|---|
| 1 | "Quels sont vos trajets disponibles ?" | `get_trajets` | Liste 3 trajets avec prix et durée | ✅ |
| 2 | "Vous avez un trajet Douala Yaoundé ?" | — (contexte) | Confirmation sans re-appel action | ✅ UUID mémorisé |
| 3 | "Je veux aller à Ngaoundéré" | `get_trajets` | "Pas trouvé, contacter équipe ?" | ✅ |
| 4 | "Vous avez des trajets depuis Douala ?" | `get_trajets` | 2 trajets Douala uniquement | ✅ Filtre icontains correct |
| 5 | "Je veux le trajet Douala Yaoundé à 1 000F" | `get_trajets` | Corrige le prix (4 000F) | ✅ |
| 6 | "Je veux réserver 2 places Bafoussam demain matin" | `get_trajets` | Collecte infos + invente horaire | ⚠️ Hallucination "Gare de Mvan 07h00" → corrigé skills |
| 7 | "Je veux aller à Yaoundé" | `get_trajets` | Demande ville de départ | ✅ |
| 8 | "Je veux 3 places" (sans destination) | — | Demande destination + date | ✅ |
| 9 | "Je veux aller de Yaoundé à Douala" | `get_trajets` | Trajet Yaoundé→Douala | ⚠️ Retourne Douala→Yaoundé — BUG-S74-05 backend |
| 10 | "Trajet Douala Yaoundé pour hier" | — | Refuse date passée | ✅ |

### Observations
Deux sources de données distinctes : `ItemCatalogue` (utilisé par `get_trajets`) avec 3 items, et `CatalogueTrajet` (onglet Billets KB) avec 6 trajets. Le LLM filtre correctement par ville via `icontains` sur le nom. La hallucination d'horaires et de gares est le principal risque — corrigé dans le skill.

---

## Phase 4 — Résultats

### Niveau 2 — /bots (panneau Actions effectuées)
- "Trajets consultés" : ✅ visible
- Sessions test : ✅

---

## Bugs centraux à signaler à Gabriel

| Fichier concerné | Description du bug | Impact |
|---|---|---|
| `apps/agent/actions/catalogue.py` — `GetTrajetsAction` | BUG-S74-05 : filtre `icontains` non directionnel — "Yaoundé→Douala" retourne "Douala→Yaoundé" | 🟡 Dégradé — sens inverse retourné |

---

## Statut final

- [x] Phase 1 Config ✅
- [x] Phase 2 Skills ✅
- [x] Phase 3 Test E2E ✅
- [x] Phase 4 Résultats ✅

**Prochaine feature :** reservation_table
