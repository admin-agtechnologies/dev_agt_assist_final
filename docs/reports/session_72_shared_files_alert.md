# ⚠️ Remontée Gabriel — Fichiers système centraux modifiés en S72 (donpk)

**Date :** 2026-05-25 — Session 72
**Membre :** Penka (donpk)

---

## Fichiers engine centraux modifiés — validation requise

Ces fichiers impactent **toutes les features de tous les membres**.
À valider avant merge.

### 1. `apps/agent/engine/core.py`
**Nature :** Retry logic complète sur réponse LLM invalide
**Changements :**
- Ajout `RETRY_REMINDER` dynamique (inclut les actions déjà exécutées ce tour)
- Ajout `actions_done_tour` — tracking actions du tour pour éviter les doublons lors du retry
- Ajout `FATAL_REPLY` — message neutre affiché après retries épuisés (jamais transfer_to_human pour bug LLM)
- `_build_history()` enrichi avec `actions_done_tour` pour contexte complet pendant retry
- Méthode `_fatal_response()` ajoutée
- **Suppression** : transfer_to_human sur réponse invalide → remplacé par FATAL_REPLY

**Risque :** Faible — logique additive, aucune régression sur les flux existants

### 2. `apps/agent/engine/llm.py`
**Nature :** Fix détection reply vide/espaces
**Changements :**
- `provider_empty` étendu aux espaces (`not raw_reply.strip()` au lieu de `== ""`)
- `_normalize()` : `reply=""` et `reply="   "` normalisés à `None`
- Fallback reply : `.strip()` appliqué avant retour

**Risque :** Faible — fix correctif, améliore robustesse

### 3. `apps/chatbot_bridge/deepseek_provider.py`
**Nature :** Augmentation max_tokens
**Changements :**
- `max_tokens: 1024 → 4096`

**Risque :** Faible — augmente coût légèrement, élimine les réponses tronquées

---

## Skills actions système modifiés

Ces fichiers sont utilisés par toutes les features :

| Fichier | Nature |
|---|---|
| `apps/agent/skills/actions/transfer_to_human.md` | Réécriture encodage + enrichissement exemples |
| `apps/agent/skills/actions/create_contact.md` | Réécriture encodage + enrichissement |
| `apps/agent/skills/actions/update_context.md` | Réécriture encodage + enrichissement |
| `apps/agent/skills/actions/send_email.md` | Réécriture encodage + enrichissement |
| `apps/agent/skills/actions/send_reminder.md` | Réécriture encodage + enrichissement |
| `apps/agent/skills/actions/convert_prospect.md` | **NOUVEAU** — action manquante créée |

---

## Diff à appliquer — system_prompt.md

Ajouter dans la section **"Contraintes absolues"** après la ligne
`"reply" OU "action" est OBLIGATOIRE à chaque réponse` :

```diff
+ - INTERDIT de retourner reply vide ("") ou reply null sans action simultanée.
+   Si tu n'as rien à dire → produis un reply de transition neutre.
+   Exemple : "Je vérifie cela pour vous, un instant."
+   Un reply vide ou null sans action est une erreur fatale qui casse l'expérience client.
```

---

## Action requise Gabriel

1. Valider les 3 fichiers engine (core.py, llm.py, deepseek_provider.py)
2. Appliquer le diff system_prompt.md
3. Re-seeder skills : `docker-compose -f docker-compose.dev.yml exec api python manage.py seed --only=skills`
4. Activer check_dispo + create_reservation sur le bot dédié prise_rdv :
   ```python
   # Bot id : a3917a4b-2d3b-4942-b9b8-8ae6a30c03ff
   # Agent : Assistant Siège
   # Actions à activer : check_disponibilite, create_reservation
   ```