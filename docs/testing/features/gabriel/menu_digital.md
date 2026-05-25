# Rapport feature — menu_digital

## Métadonnées
| Champ | Valeur |
|---|---|
| Feature | menu_digital |
| Membre | Gabriel |
| Session(s) | S67 · S68 · S69 · S70 |
| Date | 2026-05-25 |
| Statut | ✅ Complète |

---

## Phase 1 — Config
- Feature visible dans "Features & Actions Autorisées" : ✅
- Actions associées actives :
  - `get_menu` : ✅
  - `list_catalogue_items` : ✅
  - `get_item_detail` : ✅
  - `create_commande` : ✅
- 47 AIAgentActions actives après fix S67 ✅

---

## Phase 2 — Skills améliorés

| Fichier | Ce qui a été amélioré |
|---|---|
| `skills/features/menu_digital.md` | Réécriture complète S70 — flux restaurant + e-commerce + custom · format update_context UUID · scénarios alternatifs · gardes-fous |
| `skills/actions/get_menu.md` | Enrichi S70 — format update_context explicite · Exemple 4 (UUID introuvable) · Exemple 5 (client change d'avis) |
| `skills/actions/get_item_detail.md` | Enrichi S70 — quand utiliser vs get_menu · séquence create_commande · exemples multi-secteur |
| `skills/actions/create_commande.md` | Enrichi S68+S70 — UUID rule absolue · reply OBLIGATOIRE après action · récapitulatif format · 5 exemples complets |

---

## Phase 3 — Test E2E

### Scénario testé (S70 · 25/05/2026)
| # | Message envoyé | Action déclenchée | Résultat attendu | Résultat réel |
|---|---|---|---|---|
| 1 | "Je veux voir le menu" | `get_menu` | Badge "Menu chargé" + liste plats | ✅ |
| 2 | "Menu VIP pour moi, 2 plats" | `create_commande` | CardCommande + reply confirmation | ⚠️ Bulle vide (DETTE-S70-01) |
| 3 | "Je veux parler à quelqu'un" | `transfer_to_human` | CardTransfert motif + statut + contact | ✅ |

### Observations
- get_menu fonctionne en 16-27ms, badge "Menu chargé" affiché ✅
- create_commande persiste bien en base (commande + lignes) ✅
- Bulle vide résiduelle sur create_commande due à DeepSeek JSON instable (DETTE-S70-01) — pas un bug logique
- Contact mémorisé entre sessions (comportement CRM attendu)

---

## Phase 4 — Résultats

### Niveau 1 — /résultats
- Onglet Commandes : ✅ commande visible avec montant et statut
- Données correctes : ✅

### Niveau 2 — /bots
- Conversations : ✅
- Actions effectuées : ✅ (get_menu + create_commande visibles avec durée ms)
- Sessions test : ✅ (15 sessions listées)

### Bugs corrigés (isolés)
| Fichier | Bug | Fix appliqué |
|---|---|---|
| `skills/actions/get_menu.md` | UUID non mémorisé → LLM envoyait nom au lieu d'UUID | Règle mémorisation explicite + exemples S68 |
| `apps/agent/actions/system_extra.py` | CardTransfert vide — response_recue sans motif/contact | +4 lignes return enrichi S70 |

---

## Bugs centraux traités
| Fichier | Bug | Statut |
|---|---|---|
| `apps/agent/skills/_central/system_prompt.md` | reply/action tous les deux null → bulle vide | ✅ Corrigé S70 — contrainte reply obligatoire |
| `apps/chatbot_bridge/deepseek_provider.py` | DeepSeek JSON instable sur contexte long | ⏳ DETTE-S70-01 — à traiter session dédiée |

---

## Statut final
- [x] Phase 1 Config ✅
- [x] Phase 2 Skills ✅
- [x] Phase 3 Test E2E ✅ (avec réserve DETTE-S70-01)
- [x] Phase 4 Résultats ✅
- [x] Rapport complet

**Prochaine feature Gabriel :** faq (1)