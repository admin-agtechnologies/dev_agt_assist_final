# Répartition B5 — AGT BOT
> Source de vérité pour l'attribution des features et les règles de collaboration.
> Ne pas modifier sans accord de Gabriel.

---

## Attribution des features

### Gabriel — Socle transversal + bugs centraux + validation h
| # | Feature | Statut |
|---|---|---|
| 1 | faq | ⏳ |
| 2 | gestion_crm | ⏳ |
| 3 | capture_prospect | ⏳ |
| 4 | transfert_humain | ⏳ |
| 5 | emails_rappel | ⏳ |
| 6 | communication | ⏳ |
| 7 | multi_agences | ⏳ |
| 8 | menu_digital | ✅ S70 |

**Rôle central :** corrections bugs fichiers partagés · validation step h pour tous · mise à jour TODO_B5

---

### Stéphane — Restaurant · E-commerce · Transport
| # | Feature | Statut |
|---|---|---|
| 9 | catalogue_produits | ⏳ |
| 11 | suivi_commande | ⏳ |
| 12 | catalogue_trajets | ⏳ |
| 13 | reservation_billet | ⏳ |
| 15 | reservation_table | ⏳ |

---

### Steven — Hôtel · Banque · Santé
| # | Feature | Statut |
|---|---|---|
| 10 | catalogue_services | ⏳ |
| 16 | reservation_chambre | ⏳ |
| 17 | conciergerie | ⏳ |
| 18 | catalogue_produits_financiers | ⏳ |
| 19 | simulation_credit | ⏳ |
| 20 | orientation_patient | ⏳ |

---

### Penka — École · Public · PME
| # | Feature | Statut |
|---|---|---|
| 14 | prise_rdv | ⏳ |
| 21 | inscription_admission | ⏳ |
| 22 | orientation_citoyens | ⏳ |
| 23 | suivi_dossier | ⏳ |
| 24 | collecte_documents | ⏳ |

---

## Compte de test commun
```
Email    : demo-custom@agt.cm
Password : Demo@2024!
Secteur  : custom (toutes les 24 features actives)
Frontend : http://localhost:3000
API      : http://localhost:8011
```

---

## 5 phases par feature

1. **Config** — Tab Config du bot : vérifier feature active + actions autorisées dans "Features & Actions Autorisées" (29 actions affichées)
2. **Skills** — Lire et améliorer `apps/agent/skills/features/{slug}.md` + `apps/agent/skills/actions/{action}.md`
3. **Test** — WhatsApp Simulator : dérouler le scénario E2E complet
4. **Résultats** — Vérifier persistance à 2 niveaux : onglet `/résultats` + onglets `/bots` (Conversations, Actions, Sessions test). Corriger les diffs simples, signaler le reste à Gabriel.
5. **Rapport** — Rédiger `docs/testing/features/{membre}/{feature_slug}.md`

---

## Ce que chacun peut toucher

### ✅ Autonomie complète
- `apps/agent/skills/features/{sa_feature}.md`
- `apps/agent/skills/actions/{ses_actions}.md`
- `apps/agent/actions/{son_fichier}.py` — bugs de sa feature/actions
- Données KB de sa feature (shell ou bootstrap)

### ⚠️ Discussion verbale dans la salle + OK Gabriel
- Fichier `.py` d'une action partagée entre plusieurs features
- Fix > 5 lignes dans un fichier action

### 🔴 Interdit — Gabriel uniquement
- `apps/agent/skills/_central/system_prompt.md`
- `apps/agent/engine/` (core.py, context.py, llm.py)
- `apps/agent/actions/base.py` · `registry.py`
- `apps/chatbot_bridge/` (deepseek_provider.py, strategy.py, local.py)
- Toute migration Django
- Frontend partagé : `WhatsAppSimulator.tsx` · `ConversationPanel.tsx` · `ActionCards.tsx` · `ConversationModal.tsx`
- `TODO_B5.md` — lecture seule pour les collaborateurs

---

## Règles de coordination

- 1 membre = 1 feature à la fois — finir avant de commencer la suivante
- Déclarer sa feature en cours dans `INDEX.md` en début de session
- Si 2 membres touchent le même fichier action → concertation verbale obligatoire
- Chaque rapport de feature terminé → signaler verbalement à Gabriel pour mise à jour TODO_B5
- Bugs centraux → documenter dans le rapport, signaler verbalement à Gabriel

---

## Rapports de features
```
docs/testing/features/gabriel/{feature_slug}.md
docs/testing/features/stephane/{feature_slug}.md
docs/testing/features/steven/{feature_slug}.md
docs/testing/features/penka/{feature_slug}.md
```