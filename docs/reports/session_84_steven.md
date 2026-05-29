# Rapport de test — conciergerie (feature 17)

**Membre :** Steven
**Session :** 84
**Date :** 2026-05-29
**Statut global :** ✅ Validée — tous bugs corrigés

---

## Phase 1 — Config ✅
- Feature `Conciergerie` active et cochée dans le tab Config du bot
- 29 features/actions actives — tout coché

## Phase 2 — Skills ✅
- `conciergerie.md` : règles urgence renforcées + déclenchement immédiat + transfer_hint
- `create_demande_conciergerie.md` : payload corrigé + règle extraction chambre
- `get_services_conciergerie.md` : inchangé, correct

## Phase 3 — Tests E2E ✅

| Scénario | Résultat |
|---|---|
| S1 — Liste services conciergerie | ✅ PASS — déclenchement immédiat au 1er message |
| S2 — Réservation navette aéroport chambre 205 | ✅ PASS — create_demande_conciergerie + chambre 205 persistés |
| S3 — Urgence panne climatisation | ✅ PASS — transfer_to_human automatique sans interaction client |

## Phase 4 — Résultats ✅
- DemandeConciergerie persistée en BD : service=Navette aeroport, chambre=205, statut=recue ✅
- TransfertHumain persisté en BD : motif=Panne climatisation, statut=en_attente ✅
- Visible dans /résultats UI ✅

---

## Bugs corrigés

| ID | Description | Fichiers modifiés |
|---|---|---|
| BUG-S84-01 | Déclenchement tardif get_services_conciergerie | `conciergerie.md` · `system_prompt.md` |
| BUG-S84-02 | LLM appelait create_reservation au lieu de create_demande_conciergerie | `core.py` (FEATURES_WITH_RESERVATION) · `create_demande_conciergerie.md` · AIAgentAction BD |
| BUG-S84-03 | Catalogue conciergerie vide — seed absent | BD seed manuel (3 ItemCatalogue créés) |
| BUG-S84-04 | Urgence chambre sans transfer_to_human automatique | `conciergerie.md` · `core.py` (transfer_hint) · `llm.py` |
| BUG-S84-05 | Chambre non transmise dans payload create_demande_conciergerie | `conciergerie.py` (extraction regex résumé) |

## Fichiers modifiés

| Fichier | Action |
|---|---|
| `apps/agent/skills/features/conciergerie.md` | Modifié |
| `apps/agent/skills/actions/create_demande_conciergerie.md` | Modifié |
| `apps/agent/skills/_central/system_prompt.md` | Modifié |
| `apps/agent/engine/core.py` | Modifié — FEATURES_WITH_RESERVATION + transfer_hint |
| `apps/agent/engine/llm.py` | Modifié — transfer_hint transmis |
| `apps/agent/actions/conciergerie.py` | Modifié — extraction chambre depuis résumé |
| BD AIAgentAction | get_services_conciergerie + create_demande_conciergerie ajoutées |
| BD ItemCatalogue | 3 services conciergerie créés manuellement |