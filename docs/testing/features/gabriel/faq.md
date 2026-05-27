# Rapport de test — Feature : faq
> Session : 75 | Membre : Gabriel | Date : 25/05/2026
> Secteurs : Tous | Actions : `search_faq`

---

## Résultat global

✅ **VALIDÉE** — avec bugs non bloquants documentés (BUG-FAQ-01, BUG-FAQ-02)

---

## Steps

| Step | Statut | Notes |
|---|---|---|
| a. Skills — Lire & Améliorer | ✅ | faq.md + search_faq.md réécrits en v2 (notion deux couches, multi-intentions, contestation client) |
| b. KB & données guide | ✅ | 9 QuestionFrequente en base pour demo-custom@agt.cm |
| c. Config bot | ✅ | Bot WhatsApp Demo actif, feature faq ACTIVE |
| d. Agent → lit | ✅ | Bot répond correctement depuis FAQ statique injectée |
| e. Agent → écrit | N/A | Feature lecture seule — bot_ecrit_result=False |
| f. Résultats visibles | ⚠️ | Tab FAQ visible dans /résultats mais vide (BUG-FAQ-01) |
| g. E2E complet | ✅ | Périmètre simulateur — WAHA reporté au branchement |
| h. Validation Gabriel | ✅ | Validé avec notes BUG-FAQ-01 + BUG-FAQ-02 |

---

## Scénario E2E — Simulateur (S75)

**Compte :** demo-custom@agt.cm
**Bot :** Bot WhatsApp Demo
**URL :** localhost:3000/bots/{id}/test

| # | Message envoyé | Résultat obtenu | Action déclenchée | Attendu | Statut |
|---|---|---|---|---|---|
| 1 | "Quels sont vos services ?" | Bot liste les services avec prix | Services consultés (catalogue) | Réponse FAQ ou catalogue | ✅ |
| 2 | "Comment puis-je vous contacter ?" | Bot répond avec téléphone, email, horaires | Aucune (couche statique) | Réponse depuis FAQ injectée | ✅ |
| 3 | "Vous livrez à domicile ?" | "Je vais vérifier cette information pour vous, un instant..." — bot s'arrête sans exécuter | Aucune | search_faq → found:false → transfer_to_human | ⚠️ BUG-FAQ-02 |
| 4 | "ça donne quoi ?" | Bot collecte nom/tél/email → transfer_to_human exécuté avec motif correct | transfer_to_human ✅ | Aurait dû se déclencher au message 3 | ⚠️ BUG-FAQ-02 |

**Résultat final de la séquence :**
- Statut conversation : **Transféré** ✅
- Motif : "Client demande si livraison à domicile disponible — information absente de la FAQ et du contexte"
- Contact collecté : nom, téléphone, email ✅
- `transfer_to_human` fonctionne correctement une fois déclenché ✅

---

## Bugs identifiés

### BUG-FAQ-01
- **Gravité :** 🟡 Non bloquant
- **Description :** `search_faq` n'est jamais appelé explicitement. Le bot répond toujours depuis la couche statique injectée, y compris pour des questions absentes de la FAQ. Résultat : aucune `ConsultationFAQ` créée en base → onglet FAQ de `/résultats` ne se peuple pas lors des conversations live.
- **Cause probable :** Le LLM ne passe pas à la couche dynamique même quand la question est absente du contexte statique. Ajustement du skill ou du system prompt nécessaire.
- **Statut :** ⏳ À diagnostiquer

### BUG-FAQ-02
- **Gravité :** 🟡 Non bloquant
- **Description :** Quand le bot dit "Je vais vérifier cette information pour vous, un instant...", il n'exécute pas l'action suivante automatiquement. Il faut un message de relance du client pour déclencher `transfer_to_human`. Le bot devrait enchaîner sur l'action sans attendre.
- **Comportement observé :** Message 3 → bot en attente. Message 4 ("ça donne quoi ?") → bot exécute enfin transfer_to_human.
- **Cause probable :** Le LLM génère une phrase de transition mais n'appelle pas l'action dans le même tour. Comportement à corriger dans le skill (supprimer la phrase de transition ou forcer l'action dans le même tour).
- **Statut :** ⏳ À diagnostiquer

---

## Améliorations apportées (Step a)

### faq.md (skill feature)
- Ajout section "Rôle de cette feature"
- Notion des deux couches explicitée (statique vs dynamique)
- Flux standard étape par étape
- Cas multi-intentions avec séquence recommandée
- Comportement selon type de résultat (found:true / found:false / FAQ vide)
- Gestion de la contestation client
- Gardes-fous enrichis

### search_faq.md (skill action)
- Contexte d'injection expliqué en tête (profil + agences déjà disponibles)
- Cas "ne pas utiliser" enrichis
- Payload avec règles de construction de query
- Exemples par secteur (Restaurant, Banque, Santé, PME)
- Séquences typiques dont réponse sans action (couche statique)
- Traitement du résultat avec exemples JSON

---

## Notes
- WAHA (WhatsApp live) : reporté au branchement — hors périmètre S75
- Step e N/A confirmé : faq est une feature de lecture, pas d'écriture de résultat
- Les skills v2 sont encodés UTF-8 — reseed confirmé propre (0 corruption d'accents)
- `transfer_to_human` fonctionne correctement une fois déclenché — à noter pour la feature transfert_humain