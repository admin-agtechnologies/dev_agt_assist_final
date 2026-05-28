# Rapport Feature — faq (1)

> Session : S75 — Gabriel — 2026-05-27
> Statut : ✅ Steps a→e validés

---

## Résumé

Feature `faq` testée et validée sur le compte `demo-custom@agt.cm`.
Skills feature et action réécrits et enrichis (v2).
Test WhatsApp Simulator concluant — `search_faq` déclenché correctement.

---

## Step a — Config Tab ✅

- Feature `faq` active sur le bot custom ✅
- Actions autorisées : `search_faq`, `create_contact`, `send_reminder`, `send_email`, `convert_prospect` ✅
- Logs confirmés :
  ```
  detected_feature=faq — chargement bloc6
  Bloc6 chargé pour feature=faq actions=['search_faq', ...]
  ```

---

## Step b — Skills ✅

Deux skills réécrits en v2 :

### `apps/agent/skills/features/faq.md`

- Ajout distinction couche statique (profil + FAQ + agences injectés) vs couche dynamique (search_faq)
- Flux standard étape par étape
- Cas multi-intentions (FAQ + transactionnel)
- Comportement selon résultat (found/not found/partiel/FAQ vide)
- Cas client conteste la FAQ
- Gardes-fous complets

### `apps/agent/skills/actions/search_faq.md`

- Contexte d'exécution explicité (2 couches de connaissance)
- Quand utiliser / quand NE PAS utiliser (agences, profil déjà injectés)
- Règles de construction de la query
- Exemples par secteur (restaurant, banque, santé, PME)
- Traitement du résultat (found/not found avec JSON exemples)
- Séquences typiques complètes
- Gardes-fous

---

## Step c — Test WhatsApp Simulator ✅

Messages testés :

- "Vous êtes où ?" → réponse depuis contexte injecté ✅
- "Quels sont vos horaires d'ouverture ?" → search_faq déclenché ✅
- "Vous acceptez quel mode de paiement ?" → search_faq déclenché ✅
- "Vous avez des offres spéciales pour les entreprises ?" → transfer_to_human ✅
- "C'est quoi vos tarifs et je voudrais passer une commande" → multi-intentions ✅

Logs backend : 200 sur tous les messages faq, feature correctement détectée.

---

## Step d — Résultats /results ✅

- Tab FAQ Consultations alimenté après les tests
- ConsultationFAQ créées en base à chaque appel search_faq

---

## Step e — Résultats /bots ✅

- Tab Stats : interactions faq visibles
- Tab Conversations : messages de test présents

---

## Bugs identifiés (non bloquants)

| ID           | Description                                                    | Statut          |
| ------------ | -------------------------------------------------------------- | --------------- |
| DETTE-S70-01 | DeepSeek JSON instable contexte long (provider_empty warnings) | Connu — reporté |
| BUG-S75-CRM  | CRM signal ignoré: 'NoneType' object is not subscriptable      | À investiguer   |

---

## Décisions prises

- `search_faq` = recherche dynamique en base — à appeler uniquement si contexte injecté insuffisant
- FAQ + agences + profil injectés statiquement au démarrage → le bot peut répondre sans action
- Skills encodés en UTF-8 (correction encoding Latin-1 appliquée)

---

## Prochaine feature

`gestion_crm` (2) — Session S76
