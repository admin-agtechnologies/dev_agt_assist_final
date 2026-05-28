# Rapport de test B5 — Feature `reservation_chambre`
**Feature ID :** 16
**Membre :** Steven
**Session :** 77
**Date :** 28 mai 2026
**Statut final :** ⚠️ Partiellement validée — bugs résiduels périmètre Gabriel

---

## 1. Résumé

La feature `reservation_chambre` permet à un client d'hôtel de réserver une chambre
via WhatsApp. Le bot interroge la base de connaissance (ChambreType), présente les
chambres disponibles, collecte les informations du client, crée la réservation et
envoie un email de confirmation.

Le flux principal est fonctionnel et validé quand DeepSeek retourne du JSON valide.
Les bugs résiduels sont liés à l'instabilité JSON de DeepSeek en contexte long
(DETTE-S70-01 — périmètre Gabriel) et à une inversion de dates par le LLM.

---

## 2. Étapes validées

| Step | Description | Statut |
|------|-------------|--------|
| a | ChambreType en BD (3 chambres, is_available=True) | ✅ |
| b | /knowledge tab Chambres — affichage + CRUD | ✅ |
| c | Config bot — feature visible et cochée | ✅ |
| d | Agent lit la KB (get_room_types déclenché, chambres listées) | ✅ |
| e | Agent écrit le résultat (create_reservation ✅, 0 erreurs) | ✅ |
| f | Page Résultats onglet Chambres — réservation visible | ✅ |
| g | E2E partiel — réservation créée + email envoyé avec contenu | ⚠️ |
| h | Validation Gabriel | ⏳ |

---

## 3. Bugs corrigés en session

### BUG-S77-01 — `create_reservation` absente des AIAgentAction du bot demo-custom
- **Cause :** Action non ajoutée aux actions du bot AGT BOT Démo Complète
- **Correction :** Ajout via shell (`AIAgentAction.objects.get_or_create`)
- **Fichier :** BD uniquement

### BUG-S77-02 — Skill `create_reservation` absent de la BD
- **Cause :** `seed --only skills` jamais relancé depuis ajout du skill
- **Correction :** `python manage.py seed --only skills`

### BUG-S77-03 — Ressources type chambre absentes pour le tenant custom
- **Cause :** `Ressource` de type chambre inexistantes pour AGT BOT Démo Complète
- **Correction :** Création via shell — 3 ressources liées aux ChambreType existants
- **Fichier :** BD uniquement

### BUG-S77-04 — `get_room_types` retournait ChambreType.id au lieu de ressource_id
- **Cause :** Le LLM passait l'ID du ChambreType à create_reservation
- **Correction :** `catalogue_sectoriel.py` — ajout `ressource_id` dans le résultat
- **Fichier :** `apps/agent/actions/catalogue_sectoriel.py`

### BUG-S77-05 — `create_reservation` non chargée par le Bloc6
- **Cause :** Le Bloc6 ne charge que les actions liées à la feature par FK.
  `create_reservation` liée à `prise_rdv` uniquement.
- **Correction 1 :** `create_reservation` → `is_system=True`, `feature=None` (BD)
- **Correction 2 :** Ajout de `"create_reservation"` dans `SYSTEM_ACTIONS_UTILES` de `core.py`
- **Fichier :** `apps/agent/engine/core.py`

### BUG-S77-06 — `send_email` payload vide (mismatch noms de champs)
- **Cause :** `send_email.md` utilisait `destinataire_email/sujet/corps`
  mais l'action attend `to/subject/body`
- **Correction :** `send_email.md` mis à jour avec les bons noms de champs
- **Fichier :** `apps/agent/skills/actions/send_email.md`

### BUG-S77-07 — ValidationError Django sur ressource_id invalide (slug au lieu d'UUID)
- **Cause :** LLM inventait `chambre_confort` comme ressource_id
- **Correction :** Validation UUID avant interrogation BD dans `validate_business`
- **Fichier :** `apps/agent/actions/reservations.py`

### BUG-S77-08 — Dates inversées (date_debut > date_fin)
- **Cause :** LLM inverse systématiquement arrivée/départ
- **Correction :** Validation `d_debut < d_fin` dans `execute` de `CreateReservationAction`
- **Fichier :** `apps/agent/actions/reservations.py`

---

## 4. Améliorations skills apportées en session

| Fichier | Changement |
|---------|-----------|
| `reservation_chambre.md` | Séquence stricte, règles JAMAIS/TOUJOURS, mémorisation ressource_id |
| `get_room_types.md` | Déclenchement immédiat, payload vide, mémorisation ressource_id |
| `send_email.md` | Correction noms de champs (to/subject/body), exemple reservation_chambre |

---

## 5. Bugs ouverts (périmètre Gabriel)

### DETTE-S70-01 (existante) — DeepSeek JSON instable contexte long
- **Symptôme :** `LLM n'a pas retourné de JSON valide — fallback texte brut`
  `provider_empty signalé` / `Réponse LLM invalide — ni reply ni action`
- **Impact :** Bot répète ses réponses, email envoyé vide, flux bloqué
- **Fichier :** `apps/chatbot_bridge/deepseek_provider.py`
- **Périmètre :** Gabriel

### BUG-S77-09 — Inversion dates LLM résiduelle
- **Symptôme :** RuntimeWarning `date_debut=2026-06-13 > date_fin=2026-06-09`
  malgré la validation ajoutée — le LLM continue d'inverser
- **Cause probable :** DeepSeek interprète "du 9 juin au 13 juin" comme
  date_debut=13, date_fin=9 (inversion logique)
- **Périmètre :** Gabriel — peut nécessiter une correction dans le skill
  `create_reservation.md` pour forcer l'ordre des dates

---

## 6. Données de test

| Champ | Valeur |
|-------|--------|
| Compte | demo-custom@agt.cm |
| Bot ID | 5355336a-b6da-4328-8a75-7b1e195d4b42 |
| Clients test | Fatou · 699000001 · fatou@gmail.com |
| | Kofi · 691000003 · 60t6tea7g0@Inovic.com |
| Séjour testé | 10 juin → 13 juin 2026, 2 personnes |
| Chambres | Standard (25 000), Confort (45 000), Suite Junior (75 000) |

---

## 7. Points ouverts pour Gabriel

1. Corriger `deepseek_provider.py` — instabilité JSON contexte long (DETTE-S70-01)
2. Investiguer inversion dates LLM (BUG-S77-09)
3. Valider la feature après correction DeepSeek (step h)
4. Confirmer comportement attendu quand contact déjà connu en BD
   (bot saute la collecte nom/téléphone — est-ce souhaitable ?)