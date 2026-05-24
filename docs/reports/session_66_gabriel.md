# Rapport de session — session_66_gabriel

## Métadonnées
| Champ | Valeur |
|---|---|
| Membre | Gabriel |
| Session N° | 66 |
| Date | 2026-05-24 |
| Type | Debug + Conception + Génération — Backend + Frontend |
| Durée estimée | ~2h30 |
| Statut | Partielle (socle posé, bugs secondaires reportés S67) |

---

## Objectif de la session
Comprendre pourquoi le bot ne persistait pas les sessions, corriger ce bug critique, puis poser le socle de débogage structuré (TODO vivante, audit system prompt, contrat JSON LLM, cycle itératif).

---

## Ce qui a été fait — ordre chronologique

1. **Diagnostic initial** — Analyse des logs : GET `/agent/conversations/?mode=test&bot_id=...` retournait toujours 6401 bytes même après de nouveaux messages → la nouvelle conversation n'apparaissait pas dans la liste filtrée.
2. **Cause racine identifiée** — `AIConversation` créée sans `bot=bot` dans `views.py` → filtre `?bot_id=` l'excluait → session disparaissait au refresh.
3. **Fix BUG-S66-01** — `apps/agent/views.py` : résolution `bot` depuis `bot_id` + assignation au `create()`.
4. **Fix BUG-S66-02** — `src/types/api/agent.types.ts` : ajout `bot_id?` dans `HandleMessagePayload`.
5. **Fix BUG-S66-03** — `WhatsAppSimulator.tsx` : ajout prop `botId` + passage au `sendMessage()`.
6. **Fix BUG-S66-04** — `page.tsx` : diff 1 ligne — passage `botId={botId}` à `WhatsAppSimulator`.
7. **Nettoyage code mort backend** — `apps/chatbot_bridge/urls.py` vidé · `apps/chatbot_bridge/views.py` vidé (TestChatView supprimé).
8. **Validation persistance** ✅ — Session "Gabriel — Active" survit au refresh, apparaît dans la liste.
9. **Conception TODO vivante** — Structuration du plan de débogage en 4 blocs (SOCLE ENGINE / FRONTEND / FEATURES / STATS) avec 26 actions + bugs actifs + règles de session.
10. **Audit ENG-01** — Lecture `system_prompt.md` sur disque : fichier existe mais manque totalement le RESPONSE_SCHEMA et le contexte itératif → cause racine de BUG-S66-05.
11. **Conception contrat JSON LLM** — Validation des 3 cas (reply / action+feedback / après ACTION_RESULT) + cas erreur missing_fields. Décision : Option C — source de vérité unique sur disque.
12. **Corrections identifiées** : `intention_achat` type CRM invalide → corrigé en `interet` ; `phone` non persisté en base ; CRM signal défensif requis.
13. **Génération fichier 1** — `apps/agent/skills/_central/system_prompt.md` : blocs COMPORTEMENT + FONCTIONNEMENT + FORMAT avec 4 exemples JSON concrets.
14. **Génération fichier 2** — `apps/agent/engine/context.py` : suppression `RESPONSE_SCHEMA` hardcodé + retrait de `build()`.
15. **Génération fichier 3** — `apps/agent/engine/core.py` : 3 fixes (phone persisté, feedback LLM lu + persisté role='status', CRM signal défensif skip).
16. **Ajustements frontend FE-01/FE-03** — `WhatsAppSimulator.tsx` : heure HH:MM sur bulles + point animé sur messages status. Plusieurs itérations de correction syntaxe JSX (fragment `<>` requis dans ternaire).
17. **Migration cassée découverte** — `knowledge.0010` appliquée avant `contacts.0005` → `InconsistentMigrationHistory` au `migrate`. Cause : dépendance de migration manquante.
18. **Test scénario restaurant** — Conversation complète (nom, menu, commande, téléphone, livraison) → LLM répond en JSON parsé ✅, conversation cohérente ✅, heure visible ✅, session persiste ✅. Mais : feedback italique non affiché systématiquement, téléphone non persisté en base, commande non créée (LLM n'a pas déclenché l'action).

---

## Décisions prises
| Décision | Rationale |
|---|---|
| Option C : RESPONSE_SCHEMA source de vérité unique dans system_prompt.md | Artefact métier modifiable sans redéployer Django |
| ENG-02 : response_format json_object + renforcement prompt (les deux) | Garantie technique + guide structurel = zéro risque |
| ENG-03 : cycle itératif LLM + feedback continu au client | Meilleure UX que l'ignore silencieux |
| Feedback LLM contextualisé (champ "feedback" dans JSON) avec fallback FeedbackSelector | LLM connaît le contexte → feedback plus riche ; fallback si LLM ne coopère pas |
| 4 types CRM stricts : interet, preference, budget, comportement | Aligné sur les choices du modèle ContactCRMSignal |
| TODO vivante comme file de travail priorisée inter-sessions | Évite les corrections en désordre et les régressions |

---

## Bugs corrigés
| ID | Description | Fichier(s) | Solution |
|---|---|---|---|
| BUG-S66-01 | Session disparaît au refresh — bot non persisté sur AIConversation | `apps/agent/views.py` | Résolution bot depuis bot_id + assignation au create() |
| BUG-S66-02 | TS2339 — bot_id absent de HandleMessagePayload | `src/types/api/agent.types.ts` | Ajout `bot_id?: string` |
| BUG-S66-03 | sendMessage n'envoyait pas bot_id | `WhatsAppSimulator.tsx` | Ajout prop `botId` + passage au payload |
| BUG-S66-04 | page.tsx ne passait pas botId à WhatsAppSimulator | `page.tsx` | Diff 1 ligne |
| BUG-S66-05 (partiel) | RESPONSE_SCHEMA absent du system prompt — LLM ignorait la structure JSON | `system_prompt.md` + `context.py` + `core.py` | Fichiers générés et appliqués — test partiel OK mais actions non déclenchées |

---

## Zones du code touchées
- `apps/agent/views.py`
- `apps/agent/engine/context.py`
- `apps/agent/engine/core.py`
- `apps/agent/skills/_central/system_prompt.md`
- `apps/chatbot_bridge/urls.py`
- `apps/chatbot_bridge/views.py`
- `src/types/api/agent.types.ts`
- `src/app/(dashboard)/bots/[id]/test/_components/WhatsAppSimulator.tsx`
- `src/app/(dashboard)/bots/[id]/test/page.tsx`

---

## Fichiers créés / modifiés
| Fichier | Chemin complet | Action | Lignes |
|---|---|---|---|
| views.py | apps/agent/views.py | Modifié | ~120 |
| context.py | apps/agent/engine/context.py | Modifié | ~110 |
| core.py | apps/agent/engine/core.py | Modifié | ~180 |
| system_prompt.md | apps/agent/skills/_central/system_prompt.md | Modifié | ~110 |
| urls.py | apps/chatbot_bridge/urls.py | Vidé (code mort) | ~5 |
| views.py | apps/chatbot_bridge/views.py | Vidé (code mort) | ~5 |
| agent.types.ts | src/types/api/agent.types.ts | Modifié | ~60 |
| WhatsAppSimulator.tsx | src/app/(dashboard)/bots/[id]/test/_components/WhatsAppSimulator.tsx | Modifié | ~200 |
| page.tsx | src/app/(dashboard)/bots/[id]/test/page.tsx | Modifié (diff 1 ligne) | ~180 |

---

## Specs traitées cette session
| Spec | Statut |
|---|---|
| DETTE-S65-01 — LLM JSON DeepSeek | ⏳ Partiel (system prompt corrigé, actions non déclenchées) |
| DETTE-S65-02 — Italique messages status | ⏳ Partiel (frontend prêt, backend émet le feedback mais pas toujours) |
| ENG-01 Audit system_prompt.md | ✅ Terminé |
| ENG-02 Forcer JSON DeepSeek + renforcer prompt | ✅ Fichiers appliqués |
| ENG-03 CRM signal défensif | ✅ Corrigé dans core.py |
| FE-01 Heure sur bulles | ✅ Validé visuellement |
| FE-02 Tri sessions plus récent en premier | ⏳ Non traité |
| FE-03 Status en italique | ✅ Frontend prêt |

---

## Décisions reportées / dette créée
| Item | Description | Raison |
|---|---|---|
| BUG-S66-06 | LLM ne déclenche pas les actions (create_commande, etc.) — probablement ENG-04 (skill files manquants) | Session terminée avant diagnostic |
| BUG-S66-07 | Téléphone non persisté en base malgré fix phone dans core.py | Migration contacts.0005 non appliquée (InconsistentMigrationHistory) |
| BUG-S66-08 | InconsistentMigrationHistory : knowledge.0010 avant contacts.0005 | Dépendance de migration manquante à corriger |
| BUG-S66-09 | Feedback italique non systématique — backend émet parfois mais pas toujours | Lié à ENG-04 + skill files |
| BUG-S66-10 | Suggestions WhatsAppSimulator incorrectes (RDV, orientation patient sur bot restaurant) | activeFeatures non filtrées pour ce bot |
| TODO vivante | Maintenir et mettre à jour la TODO à chaque session | Document à créer en fichier dédié S67 |
| DB cleanup | `migrate chatbot_bridge zero` — supprimer tables TestSession/TestMessage | Volontairement reporté au prochain `down -v` |

---

## Plan d'action S67

1. **EN PREMIER** — Corriger `InconsistentMigrationHistory` : ajouter dépendance `contacts.0005` dans `knowledge/migrations/0010`, puis `migrate`
2. Vérifier que `apps/agent/skills/actions/` contient bien les skill files pour chaque action (ENG-04) — lister les fichiers présents sur disque
3. Tester à nouveau le scénario restaurant après ENG-04 — vérifier que le LLM déclenche `create_commande`
4. Corriger le tri sessions `FE-02` — `.order_by("-created_at")` dans `get_queryset`
5. Corriger suggestions `BUG-S66-10` — filtrer par `activeFeatures` du bot courant
6. Formaliser la TODO comme fichier `docs/TODO_SOCLE.md` (basé sur la TODO construite en S66)

---

## Prompt de début de S67

```
Bonjour, nous démarrons la session 67 sur AGT BOT.

**Membre :** Gabriel
**Session N° :** 67
**Date :** {date}
**Objectif principal :** Corriger InconsistentMigrationHistory, auditer ENG-04 (skill files actions), tester déclenchement d'actions réel, continuer le débogage socle.

Avant de commencer, effectue dans l'ordre :

1. Lis docs/reports/INDEX.md en entier.
2. Lis le rapport session_66_gabriel.md — extrais décisions, bugs résolus, état, plan S67.
3. Lis contexte_backend.txt et contexte_frontend_PME.txt via la mémoire du projet.
4. Lis frontend_specs.md si la session touche le frontend.

--- ÉTAT EN DÉBUT DE S67 ---

✅ CORRIGÉ EN S66 :
- BUG-S66-01 : session disparaît au refresh → bot_id persisté sur AIConversation (views.py)
- BUG-S66-02/03/04 : bot_id propagé frontend (agent.types.ts, WhatsAppSimulator, page.tsx)
- BUG-S66-05 : RESPONSE_SCHEMA absent → system_prompt.md refondu (4 exemples JSON concrets)
- ENG-03 : CRM signal défensif dans core.py
- FE-01 : heure HH:MM sur bulles WhatsAppSimulator
- Nettoyage code mort : chatbot_bridge/urls.py + views.py vidés

🔴 PRIORITÉ 1 — À corriger AVANT tout test :
- BUG-S66-08 : InconsistentMigrationHistory
  knowledge.0010_transferthumain_demandeconciergerie dépend de contacts.0005
  mais contacts.0005 n'est pas déclarée dans les dépendances de knowledge.0010
  FIX : ajouter ("contacts", "0005_alter_interactioncontact_type") dans dependencies
  Fichier : apps/knowledge/migrations/0010_transferthumain_demandeconciergerie.py
  Ensuite : docker-compose -f docker-compose.dev.yml exec api python manage.py migrate

🔴 PRIORITÉ 2 — ENG-04 : Audit skill files actions sur disque
  Lister : apps/agent/skills/actions/ — quels slugs ont un .md, lesquels manquent
  Sans skill file, le LLM ne sait pas comment construire le payload → actions jamais déclenchées
  Commande :
  docker-compose -f docker-compose.dev.yml exec api find apps/agent/skills/actions -name "*.md" | Set-Clipboard

🟡 PRIORITÉ 3 — FE-02 : Tri sessions plus récent en premier
  Fichier : apps/agent/views.py → get_queryset() → ajouter .order_by("-created_at")

🟡 PRIORITÉ 4 — BUG-S66-10 : Suggestions incorrectes dans WhatsAppSimulator
  "Prendre un RDV", "Orientation médicale" affichés sur bot restaurant
  → filtrer par activeFeatures du bot courant

--- TODO SOCLE (à formaliser en docs/TODO_SOCLE.md) ---

BLOC 1 ENGINE :
[✅] ENG-01 Audit system_prompt.md
[✅] ENG-02 Forcer JSON DeepSeek + renforcer prompt
[✅] ENG-03 CRM signal défensif
[⏳] ENG-04 Audit skill files actions sur disque

BLOC 2 FRONTEND :
[✅] FE-01 Heure sur bulles
[⏳] FE-02 Tri sessions plus récent en premier
[✅] FE-03 Status en italique (frontend prêt)
[⏳] FE-04 Actions déclenchées visibles dans ConversationPanel
[⏳] FE-05 Cartes inline reservation/email dans WhatsAppSimulator

BLOC 3 FEATURES : 26 actions à tester une par une — après BLOC 1 + 2 validés

BUGS ACTIFS :
[🔴] BUG-S66-06 LLM ne déclenche pas les actions → lié ENG-04
[🔴] BUG-S66-07 Téléphone non persisté en base → migration bloquée
[🔴] BUG-S66-08 InconsistentMigrationHistory → PRIORITÉ 1
[🟡] BUG-S66-09 Feedback non systématique → lié ENG-04
[🟡] BUG-S66-10 Suggestions incorrectes → FE filter activeFeatures

--- CHEMINS ---
Backend  : C:\Users\hp\Documents\gabriel\AGT-BOT\agt-assist-backend-final\
Frontend : C:\Users\hp\Documents\gabriel\AGT-BOT\dev_agt_assist_final\
LiteralPath : Get-Content -LiteralPath "C:\...\[id]\..." | Set-Clipboard

Propose-moi où commencer (BUG-S66-08 en premier) et attends ma validation.
```