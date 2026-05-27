# Rapport feature — catalogue_produits

## Métadonnées

| Champ | Valeur |
|---|---|
| Feature | catalogue_produits |
| Membre | Stéphane |
| Session(s) | S73 |
| Date | 2026-05-26 |
| Statut | ✅ Complète (steps a→f validés) |

---

## Phase 1 — Config

- Feature visible dans "Features & Actions Autorisées" : ✅
- Actions associées actives :
  - `get_catalogue` : ✅ (bootstrappé via shell — interface ne crée pas les actions)
  - `list_catalogue_items` : ✅
  - `get_item_detail` : ✅
- Observations : activation via interface ne crée pas automatiquement les AIAgentAction → voir BUG-S74-01

---

## Phase 2 — Skills améliorés

| Fichier | Ce qui a été amélioré |
|---|---|
| `skills/features/catalogue_produits.md` | Garde-fou : si get_catalogue retourne des items mais aucun ne correspond à la catégorie demandée → ne jamais dire "catalogue indisponible", afficher ce qui existe |
| `skills/actions/get_item_detail.md` | Garde-fou : ne jamais réutiliser l'item_id d'un appel précédent pour un produit différent — chaque produit nécessite son propre UUID du contexte |

---

## Phase 3 — Test E2E

### Scénarios testés (11)

| # | Message envoyé | Action déclenchée | Résultat attendu | Résultat réel |
|---|---|---|---|---|
| 1 | "Montre-moi votre catalogue de produits" | `get_catalogue` | Liste par catégorie | ✅ 2 produits listés |
| 2 | "Je veux plus de détails sur le Smartphone A34" | `get_item_detail` | Fiche produit complète | ✅ Prix + description + dispo |
| 3 | "Montrez-moi vos téléviseurs" | `get_catalogue` | "Pas ce produit, voici ce qu'on a" | ⚠️ "catalogue indisponible" → corrigé skills |
| 4 | "Donnez-moi les infos sur le Samsung" | `get_catalogue` | Identifie Smartphone A34 | ✅ Un seul Samsung en base |
| 5 | "C'est combien le laptop ?" | `get_catalogue` | Prix Laptop HP 15s | ✅ Appelle action avant de répondre |
| 6 | "Je veux acheter le Smartphone A34 à 50 000F" | — | Corrige le prix | ✅ "185 000F, pas 50 000F" |
| 7 | "Show me your products" | `get_catalogue` | Répond en français | ✅ Respecte config langue |
| 8 | Catalogue → Détail Smartphone → Détail Laptop → Comparaison | `get_item_detail` ×2 | Tient sur 4 échanges | ✅ Contexte long OK |
| 9 | Détail Laptop après Smartphone | `get_item_detail` | Détails Laptop | ⚠️ Retournait Smartphone → corrigé skills |
| 10 | Injection prompt | — | Refuse, reste périmètre AGT | ✅ |
| 11 | "Catalogue" + "Détails Smartphone" (session fraîche) | `get_catalogue` + `get_item_detail` | Flux complet | ✅ DETTE-S70-01 confirmé corrigé |

### Observations
Le LLM extrait correctement les UUIDs des items depuis le contexte et les utilise dans `get_item_detail` sans que l'utilisateur les fournisse. Le fix DETTE-S70-01 (pull Gabriel) a résolu la bulle blanche au 2e échange. La durée des actions est excellente (12-17ms).

---

## Phase 4 — Résultats

### Niveau 2 — /bots (panneau Actions effectuées)
- "Catalogue consulté" : ✅ visible avec détail 2 résultats + prix
- "Article consulté" : ✅ visible avec statut SUCCÈS + durée 13ms
- Sessions test : ✅

---

## Bugs centraux à signaler à Gabriel

| Fichier concerné | Description du bug | Impact |
|---|---|---|
| `apps/features/services.py` ou signals | BUG-S74-01 : activation feature ne crée pas AIAgentAction | 🔴 Bloquant — nécessite bootstrap manuel |
| `apps/features/services.py` ou signals | BUG-S74-02 : désactivation feature ne désactive pas AIAgentAction | 🔴 Actions orphelines actives |

---

## Statut final

- [x] Phase 1 Config ✅
- [x] Phase 2 Skills ✅
- [x] Phase 3 Test E2E ✅
- [x] Phase 4 Résultats ✅ (niveau 2 uniquement — niveau 1 /résultats N/A lecture seule)

**Prochaine feature :** catalogue_trajets
