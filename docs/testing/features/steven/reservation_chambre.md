# Rapport de test B5 — Feature `reservation_chambre`
**Feature ID :** 16  
**Membre :** Steven  
**Session :** 77  
**Date :** 27 mai 2026  
**Statut final :** ⚠️ Partiellement validée — 2 bugs ouverts (périmètre Gabriel)

---

## 1. Résumé

La feature `reservation_chambre` permet à un client d'hôtel de réserver une chambre
via WhatsApp. Le bot interroge la base de connaissance (ChambreType), présente les
chambres disponibles, collecte les informations du client, crée la réservation et
envoie un email de confirmation.

Le flux principal est fonctionnel et validé. Deux bugs bloquants sur des fichiers
centraux (engine/core.py) empêchent la validation complète du step send_email.

---

## 2. Étapes validées

| Step | Description | Statut |
|------|-------------|--------|
| a | ChambreType en BD (3 chambres, is_available=True) | ✅ |
| b | /knowledge tab Chambres — affichage + CRUD | ✅ |
| c | Config bot — feature visible et cochée | ✅ |
| d | Agent lit la KB (get_room_types déclenché, chambres listées) | ✅ |
| e | Agent écrit le résultat (create_reservation ✅, 0 erreurs) | ✅ |
| f | Page Résultats onglet Chambres — réservation Fatou visible | ✅ |
| g | E2E partiel — réservation créée et persistée | ⚠️ |
| h | Validation Gabriel | ⏳ |

---

## 3. Bugs corrigés en session

### BUG-S77-01 — `create_reservation` absente des AIAgentAction du bot demo-custom
- **Symptôme :** Action inconnue dans les logs, LLM appelait `create_booking`
- **Cause :** `create_reservation` non ajoutée aux actions du bot AGT BOT Démo Complète
- **Correction :** Ajout manuel via shell (`AIAgentAction.objects.get_or_create`)
- **Fichier :** BD uniquement

### BUG-S77-02 — Skill `create_reservation` absent de la BD
- **Symptôme :** WARNING `[skills] Index features introuvable` à chaque requête
- **Cause :** `seed --only skills` jamais relancé depuis ajout du skill
- **Correction :** `python manage.py seed --only skills`
- **Fichier :** BD uniquement

### BUG-S77-03 — Ressources type chambre absentes pour le tenant custom
- **Symptôme :** `create_reservation` échoue — "ressource introuvable"
- **Cause :** Les `Ressource` de type `chambre` n'existaient pas pour AGT BOT Démo Complète
- **Correction :** Création via shell — 3 ressources liées aux ChambreType existants
- **Fichier :** BD uniquement

### BUG-S77-04 — `get_room_types` retournait l'ID du ChambreType au lieu du ressource_id
- **Symptôme :** `create_reservation` échoue — "ressource_id invalide"
- **Cause :** Le LLM passait l'ID du ChambreType à create_reservation qui attend un ID de Ressource
- **Correction :** `catalogue_sectoriel.py` — ajout de `ressource_id` dans le résultat de `get_room_types`
- **Fichier :** `apps/agent/actions/catalogue_sectoriel.py`

---

## 4. Bugs ouverts (périmètre Gabriel)

### BUG-S77-05 — `create_reservation` non chargée par le Bloc6
- **Symptôme :** Bloc6 chargé sans `create_reservation` :
  `actions=['get_room_types', 'create_contact', 'send_reminder', 'send_email', 'convert_prospect']`
- **Cause :** Le Bloc6 filtre les actions par FK feature. `create_reservation` passée
  en `is_system=True` + `feature=None` mais le Bloc6 ne charge pas les actions système.
- **Impact :** Le bot ne peut pas appeler `create_reservation` en conditions normales.
  Fonctionne uniquement quand l'action est dans les `AIAgentAction` du bot ET chargée
  par le Bloc6 (prouvé lors des tests précédents de cette session).
- **Correction nécessaire :** `apps/agent/engine/core.py` — inclure les actions
  `is_system=True` dans le chargement Bloc6
- **Périmètre :** Gabriel

### BUG-S77-06 — Timeouts LLM récurrents sur reservation_chambre
- **Symptôme :** Bot dit "Je vérifie les chambres disponibles" puis se bloque
  sans appeler `get_room_types`. Timeout silencieux, aucune erreur dans les logs.
- **Cause probable :** Prompt Bloc6 trop lourd ou timeout DeepSeek sur cette feature
- **Impact :** Scénario E2E complet non reproductible de manière fiable
- **Périmètre :** Gabriel

---

## 5. Améliorations du skill apportées en session

### `reservation_chambre.md` — mis à jour
- Ajout directive obligatoire : utiliser `ressource_id` (pas `id` du ChambreType)
- Ajout séquence obligatoire post-réservation : `send_email` si email collecté
- Ajout section gardes-fous : ne jamais inventer un ressource_id

### `catalogue_sectoriel.py` — `GetRoomTypesAction` corrigée (S77)
- Ajout de `ressource_id` dans le résultat de `get_room_types`
- Lookup : `Ressource.objects.filter(entreprise=e, chambre_type=c, est_active=True).first()`

---

## 6. Données de test

| Champ | Valeur |
|-------|--------|
| Compte | demo-custom@agt.cm |
| Bot ID | 5355336a-b6da-4328-8a75-7b1e195d4b42 |
| Client test | Fatou · 699000001 · fatou@gmail.com |
| Séjour testé | 30 mai → 2 juin 2026, 2 personnes |
| Chambre | Standard (25 000 XAF/nuit) |
| Réservation créée | ✅ visible onglet Chambres |

---

## 7. Points ouverts pour Gabriel

1. Corriger `engine/core.py` pour inclure les actions `is_system=True` dans le Bloc6
2. Investiguer les timeouts LLM sur `reservation_chambre` (BUG-S77-06)
3. Valider la feature après correction du Bloc6 (step h)
4. Confirmer si `send_email` doit être conditionnel à la config email de l'entreprise
   (champ `payment_configs` ou `profil_entreprise` ?)