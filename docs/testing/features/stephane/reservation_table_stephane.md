# Rapport feature — reservation_table

## Métadonnées

| Champ | Valeur |
|---|---|
| Feature | reservation_table |
| Membre | Stéphane |
| Session(s) | S73 |
| Date | 2026-05-26 |
| Statut | ⚠️ Partielle — steps a→d validés, steps e→h à compléter |

---

## Phase 1 — Config

- Feature visible dans "Features & Actions Autorisées" : ✅ (activée via interface)
- Actions associées actives :
  - `check_disponibilite` : ✅ (bootstrappé via shell — interface ne crée pas les actions)
  - `create_reservation` : ✅ (bootstrappé via shell)
- Observations : activation via interface ne crée pas les AIAgentAction → BUG-S74-01

---

## Phase 2 — Skills améliorés

| Fichier | Ce qui a été amélioré |
|---|---|
| `skills/features/reservation_table.md` | Garde-fou heure ambiguë : si le client donne "2h", "3h", "matin" → demander format précis "19h00, 20h30" avant check_disponibilite |
| `skills/features/reservation_table.md` | Garde-fou téléphone : dès réception d'un numéro (chiffres avec/sans +237) → valider immédiatement et avancer, ne jamais boucler |

---

## Phase 3 — Test E2E

### Scénarios testés (6)

| # | Message envoyé | Action déclenchée | Résultat attendu | Résultat réel |
|---|---|---|---|---|
| 1 | "Table pour 10 personnes" | `transfer_to_human` | Transfert humain groupes > 8 | ✅ Motif correct |
| 2 | "Réserver une table pour hier soir" | — | Refuse date passée | ✅ |
| 3 | "Table pour 4 personnes ce soir à 12h" (créneau déjà pris) | `check_disponibilite` | Signaler conflit | ⚠️ Accepte sans détecter conflit — BUG-S74-03 |
| 4 | "Je veux annuler ma réservation" | `transfer_to_human` | Transfert pour annulation | ✅ Motif correct |
| 5 | "Je veux réserver une table" (sans nb couverts) | — | Demande le nombre | ✅ |
| 6 | E2E : table 2 personnes demain 19h + nom + tel | `check_disponibilite` + `create_reservation` | Récap complet + confirmation | ✅ Flux complet OK |

### Scénario E2E détaillé (#6)
```
Client : "Table pour 2 personnes demain soir 19h"
→ check_disponibilite → disponible
→ "C'est à quel nom ?"
Client : "Sats"
→ "Merci Sats ! Votre numéro de téléphone ?"
Client : "671949527"
→ create_reservation
→ Récap : Table 2 couverts · Demain 19h · Sats · +237671949527
```

### Observations
La carte inline "RDV planifié" s'affiche avec "INFOS MANQUANTES" même après collecte complète — bug frontend BUG-S74-04. La boucle sur l'heure ambiguë ("2h", "3h") a été corrigée dans le skill. Le flux E2E complet fonctionne.

---

## Phase 4 — Résultats

### Niveau 2 — /bots (panneau Actions effectuées)
- Actions visibles : ✅ check_disponibilite + create_reservation
- Carte inline : ⚠️ "INFOS MANQUANTES" — BUG-S74-04

### Steps e→h
- Step e (persistance en base) : ⏳ à vérifier session suivante
- Step f (/résultats) : ⏳
- Step g (E2E documenté complet) : ⏳
- Step h (validation Gabriel) : ⏳

---

## Bugs centraux à signaler à Gabriel

| Fichier concerné | Description du bug | Impact |
|---|---|---|
| `apps/agent/actions/reservations.py` — `CheckDisponibiliteAction` | BUG-S74-03 : ne vérifie pas les réservations existantes → double booking possible | 🔴 Bloquant production |
| `src/app/(dashboard)/bots/[id]/test/_components/ActionCards.tsx` | BUG-S74-04 : carte "RDV planifié" affiche INFOS MANQUANTES même après collecte | 🟡 Dégradé UX |

---

## Statut final

- [x] Phase 1 Config ✅
- [x] Phase 2 Skills ✅
- [x] Phase 3 Test E2E ✅ (partiel — 6 scénarios)
- [ ] Phase 4 Résultats ⏳

**Prochaine feature :** reservation_billet
