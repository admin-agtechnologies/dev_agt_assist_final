# Rapport de test feature — prise_rdv

## Métadonnées

| Champ | Valeur |
|---|---|
| Feature | prise_rdv (feature 14) |
| Membre | Penka (donpk) |
| Session | 72 |
| Date | 2026-05-25 |
| Statut global | ⏳ En cours — phases a-b partielles, c-e non démarrées |

## Statut des phases

| Phase | Description | Statut | Observations |
|---|---|---|---|
| a | Skills — amélioration prise_rdv.md + actions | ✅ Terminé | 10 fichiers réécrits, encodage corrigé, logique backend correcte |
| b | Test WhatsApp Simulator — scénario E2E | ⏳ Partiel | Flux partiel validé, create_reservation hallucinée sur bot demo |
| c | Vérification persistance /résultats + /bots | ❌ Bloqué | Bloqué par hallucination LLM (prompt trop long) |
| d | Corriger diffs simples | ❌ Non démarré | |
| e | Rapport final feature | ❌ Non démarré | |

## Scénarios testés

### T1 — Flux nominal Chemin B (client ne connaît pas la ressource)
**Message :** "Bonjour je voudrais prendre un rendez-vous"
**Résultat :** ✅ check_disponibilite appelé correctement — ressources présentées au client

### T2 — Annulation RDV
**Message :** "Bonjour je voudrais annuler mon rendez-vous"
**Résultat :** ✅ transfer_to_human déclenché immédiatement — motif correct — statut Transférée

### T3 — Client en colère
**Message :** "Ça fait 3 fois que j'essaie, c'est inadmissible"
**Résultat :** ✅ transfer_to_human déclenché — priorité haute — motif précis

### T4 — Demande humain explicite
**Message :** "Je veux parler à un responsable"
**Résultat :** ✅ transfer_to_human déclenché immédiatement

### T5 — Flux nominal Chemin A (client connaît le médecin)
**Message :** "Bonjour je veux un RDV avec Dr. Martin lundi à 10h"
**Résultat :** ⏳ Partiel :
- check_disponibilite ✅ (date_debut:"2026-06-01T10:00:00" format ISO correct)
- Dr. Martin identifié dans les résultats ✅
- Nom collecté ✅
- Téléphone collecté ✅
- Email demandé ✅
- Récapitulatif affiché ✅
- create_reservation ❌ — LLM hallucine la confirmation sans appeler l'action

### T6 — Flux avec email
**Résultat :** ✅ Bot demande l'email après téléphone — comportement correct

## Bugs identifiés durant les tests

| ID | Description | Gravité | Statut |
|---|---|---|---|
| BUG-T-01 | create_reservation hallucinée sur bot demo (prompt 81k chars) | 🔴 Critique | Ouvert — nécessite bot dédié |
| BUG-T-02 | Email redemandé 2x quand "Non merci" → retry déclenché | 🟠 Majeur | Ouvert |
| BUG-T-03 | Widget "RDV planifié — INFOS MANQUANTES" affiché prématurément | 🟡 Cosmétique | Ouvert |
| BUG-T-04 | datetime naive RuntimeWarning dans Reservation | 🟡 Mineur | Ouvert |

## Corrections apportées aux skills

### prise_rdv.md (v1 → v4)
- **v1** : encodage cassé, contenu minimal
- **v2** : séquence corrigée, ISO 8601, dates relatives converties
- **v3** : logique check_disponibilite corrigée (feature_slug pas ressource_id) + 2 chemins A/B
- **v4** : gardes-fous anti-hallucination — JAMAIS reply confirmation sans [ACTION_RESULT create_reservation]

### Actions système réécrites
Tous les fichiers .md : encodage UTF-8 propre + niveau system_prompt.md

### convert_prospect.md
Fichier créé — action manquante dans le projet

## Blocages en cours

1. **Bot demo trop large** : 81 549 chars de prompt, prise_rdv à la position 42 274 — LLM ignore les gardes-fous
2. **Bot dédié** : créé mais actions check_dispo/create_reservation non activées sur l'AIAgent

## Prochaines actions (session 73)

1. Activer check_dispo + create_reservation sur le bot dédié via shell
2. Relancer tests sur bot dédié (prompt ~15k chars — fiable)
3. Valider le flux complet : create_reservation en base ✅
4. Vérifier /résultats : Reservation persistée
5. Tester tous les cas limites restants
6. Rédiger rapport final