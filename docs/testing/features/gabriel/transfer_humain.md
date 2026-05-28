# Rapport de session S80 — Gabriel

**Date :** 2026-05-28
**Feature :** transfert_humain (B5-4)
**Phases complétées :** 1 → 5

---

## Résumé

Session dédiée à la feature `transfert_humain`. Diagnostic complet du flux de persistance,
correction de 3 bugs dans l'engine, ajout de la logique `FIRE_AND_FORGET_ACTIONS`,
et validation E2E de 5 scénarios en BD.

---

## Bugs corrigés

### BUG-TH-001 — `_transfer_human()` ne persistait pas en BD

**Fichier :** `apps/agent/engine/core.py`
**Problème :** Le fallback automatique (max itérations atteint) changeait le statut
de la conversation mais ne créait pas de `TransfertHumain` ni de `TacheRelance` en BD.
**Fix :** Ajout de `TransfertHumain.objects.get_or_create()` + `TacheRelance.objects.create()`
dans `_transfer_human()` avec try/except pour rester non-bloquant.

### BUG-TH-002 — `transfer_to_human` ignoré quand LLM envoie reply+action

**Fichier :** `apps/agent/engine/core.py`
**Problème :** Quand le LLM envoyait `reply` ET `action: transfer_to_human` simultanément,
l'ancienne logique "reply prime" annulait l'action → rien en BD.
**Fix :** Introduction de `FIRE_AND_FORGET_ACTIONS` — pour ces actions, l'action est
exécutée ET le reply est conservé.

### BUG-TH-003 — Actions transactionnelles exécutées sans cycle ACTION_RESULT

**Fichier :** `apps/agent/engine/core.py`
**Problème :** Découvert lors de la correction BUG-TH-002 — si on exécutait toutes
les actions aveuglément en reply+action, les actions transactionnelles (create_reservation,
create_commande...) pouvaient confirmer un résultat avant de savoir si l'action avait réussi.
**Fix :** Séparation en deux catégories :

- `FIRE_AND_FORGET_ACTIONS` (9 actions) → exécute + garde reply
- Transactionnelles → reply ignoré, cycle normal action → ACTION_RESULT → reply obligatoire

### BUG-TH-004 — Skill `prise_rdv` ne gérait pas l'annulation C1

**Fichier :** `apps/agent/skills/features/prise_rdv.md`
**Problème :** Le LLM essayait de gérer les annulations de RDV lui-même au lieu de
transférer immédiatement — boucle infinie de collecte d'infos.
**Fix :** Ajout section `## ANNULATION ET MODIFICATION — C1 — RÈGLE ABSOLUE` avec
mots déclencheurs et instruction `transfer_to_human` immédiat.

### BUG-TH-005 — Skill `orientation_patient` ne transférait pas sur urgence déclarée

**Fichier :** `apps/agent/skills/features/orientation_patient.md`
**Problème :** La section urgence listait uniquement des symptômes précis. Une urgence
déclarée verbalement ("c'est urgent", "j'ai besoin d'un médecin maintenant") n'était
pas reconnue → le LLM demandait les symptômes au lieu de transférer.
**Fix :** Ajout mots déclencheurs généraux + règle absolue de transfert immédiat
sans collecte d'infos supplémentaires.

---

## Fichiers modifiés

| Fichier                                             | Type         | Description                                  |
| --------------------------------------------------- | ------------ | -------------------------------------------- |
| `apps/agent/engine/core.py`                         | Modification | BUG-TH-001/002/003 + FIRE_AND_FORGET_ACTIONS |
| `apps/agent/skills/features/prise_rdv.md`           | Modification | BUG-TH-004 annulation C1                     |
| `apps/agent/skills/features/orientation_patient.md` | Modification | BUG-TH-005 urgence déclarée                  |

---

## Tests E2E — 5/5 PASS

| #   | Scénario                       | TransfertHumain BD | Statut conv  | Résultat |
| --- | ------------------------------ | ------------------ | ------------ | -------- |
| 1   | Demande explicite humain       | ✅ `2af89a15`      | `transferee` | PASS     |
| 2   | Client en colère (3 appels)    | ✅ `b8fb7d7c`      | `transferee` | PASS     |
| 3   | Hors périmètre / remboursement | ✅ `61275d26`      | `transferee` | PASS     |
| 4   | Annulation RDV                 | ✅ `3d9fcbc9`      | `transferee` | PASS     |
| 5   | Urgence médicale               | ✅ `60b85183`      | `transferee` | PASS     |

---

## Architecture confirmée

- **Modèle utilisé :** `apps.knowledge.TransfertHumain` (nouveau système)
- **Modèle legacy ignoré :** `apps.conversations.TransfertHumain` (S1/S2)
- **Action :** `transfer_to_human` dans `apps/agent/actions/system_extra.py` ✅
- **Skill action :** `apps/agent/skills/actions/transfer_to_human.md` ✅ existait déjà

---

## Observations

- Le LLM DeepSeek respecte bien les instructions du skill `transfer_to_human.md`
- Le mécanisme `FIRE_AND_FORGET_ACTIONS` est un fix transversal bénéfique pour
  toutes les features — pas seulement le transfert humain
- Rechargement des skills obligatoire après modification : `python manage.py seed --only skills`

---

## Validation step h

✅ Les 5 phases sont complétées. Feature `transfert_humain` validée S80.
