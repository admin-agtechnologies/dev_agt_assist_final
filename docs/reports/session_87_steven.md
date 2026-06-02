# Rapport de test — orientation_patient
> Membre : Steven
> Session : S87
> Date : 2026-05-30
> Statut final : VALIDE (en attente validation Gabriel step h)

---

## Feature testée

| Champ | Valeur |
|---|---|
| Slug | orientation_patient |
| Secteur | Santé |
| Actions | get_specialites, get_specialite_par_symptomes |
| Modèle persisté | OrientationPatient |
| Tenant test | AGT BOT — Démo Complète (id: 3153ac76-92f2-4f09-bff0-26e02df181e8) |
| Bot id | 4bf815e2-6e3e-45fe-9097-4d3fcfbb5faa |

---

## Steps

### a. Skill.md — Lu et amélioré ✅
- `orientation_patient.md` v2 écrit (146 lignes)
- Ajouts par rapport à v1 :
  - Tableau choix d'action (get_specialites vs get_specialite_par_symptomes)
  - Séquences complètes avec payloads exacts
  - Payload exact : champ `symptoms` (pas `symptomes`)
  - Cas urgence — transfer_to_human immédiat
  - Cas aucun résultat — transfer_to_human fallback
  - Persistance OrientationPatient documentée
  - Séquence 4 : règle post-create_contact avec date déjà connue
  - Gardes-fous absolus

### b. KB & données guide ✅
- 3 spécialités existantes : Gynécologie, Médecine Générale, Pédiatrie
- `mots_cles_symptomes` tous vides → peuplés via shell
- 2 spécialités ajoutées : Cardiologie, Neurologie
- Total final : 5 spécialités avec mots-clés en base

| Spécialité | Mots-clés |
|---|---|
| Cardiologie | douleur poitrine, essoufflement, palpitations, coeur, thorax |
| Gynécologie | douleur abdominale, regles, grossesse, ventre, pelvis |
| Médecine Générale | fievre, rhume, toux, fatigue, grippe, mal gorge, courbatures |
| Neurologie | maux de tete, vertiges, migraine, tete, etourdissements |
| Pédiatrie | enfant, bebe, fievre enfant, toux enfant, nourrisson |

### c. Config bot ✅
- 2 actions liées au bot via shell :
  - `get_specialites` (id: 1aa7ccd3-59a8-48ac-bb63-fb7a103bf01b) → created: True, est_active: True
  - `get_specialite_par_symptomes` (id: cd956241-a862-4477-9f07-76bf55498234) → created: True, est_active: True
- Note : action `orientation` absente comme AIAction (alias métier uniquement — normal)

### d. Agent → lit ✅
- `get_specialite_par_symptomes` déclenché sur description symptômes → 16-42ms
- `get_specialites` déclenché sur demande liste → 13ms
- 5 spécialités retournées correctement
- Neurologie recommandée pour maux de tête + vertiges ✅

### e. Agent → écrit ✅
- `OrientationPatient` créé automatiquement par `get_specialite_par_symptomes`
- Vérification en base : 5 enregistrements dont 2 issus des tests S87

| Spécialité | Urgence | Symptômes |
|---|---|---|
| Neurologie | normal | maux de tête, vertiges |
| Cardiologie | urgent | douleur poitrine, essoufflement |

### f. Résultats visibles ✅
- Onglet **Orientations** visible dans `/résultats`
- 20 résultats affichés
- Steven (697500000) visible — statut En attente ✅

### g. E2E complet ✅

**Scénario S1 — Symptômes → orientation immédiate**
```
Client : "Bonjour, j'ai des maux de tête et des vertiges depuis 2 jours"
→ get_specialite_par_symptomes déclenché immédiatement (feedback discret)
→ Neurologie recommandée, 12 000 FCFA, RDV proposé
Résultat : SUCCÈS
```

**Scénario S2 — Liste spécialités**
```
Client : "Quelles spécialités médicales proposez-vous ?"
→ get_specialites déclenché immédiatement
→ 5 spécialités listées correctement
Résultat : SUCCÈS
```

**Scénario S3 — Urgence**
```
Client : "J'ai une douleur intense dans la poitrine, c'est urgent, j'ai besoin d'aide maintenant"
→ transfer_to_human immédiat, priorité urgente
→ Aucun appel à get_specialite_par_symptomes
→ Conversation marquée Transférée
Résultat : SUCCÈS
```

**Scénario S4 — E2E complet avec RDV**
```
symptômes → orientation → oui RDV → nom + tel + date → check_dispo → create_reservation
→ 4-5 actions enchaînées sans redondance
→ RDV confirmé avec référence
→ Email de confirmation déclenché
Résultat : SUCCÈS
```

### h. Validation Gabriel
- ⏳ En attente de validation explicite Gabriel

---

## Bugs identifiés et corrigés

### BUG-S87-01 — Reply avant action ✅ CORRIGÉ
- **Description** : LLM produit reply d'attente + detected_feature au lieu de déclencher l'action immédiatement. Nécessitait un message supplémentaire du client.
- **Fichiers modifiés** :
  - `apps/agent/skills/_central/system_prompt.md` (Gabriel)
    - `get_specialite_par_symptomes` ajouté dans liste déclenchement immédiat
    - Règle ABSOLUE `detected_feature + action immédiate` ajoutée
  - `apps/agent/engine/core.py` (Gabriel)
    - `get_specialite_par_symptomes` et `get_specialites` ajoutés dans `FIRE_AND_FORGET_ACTIONS`
    - Nouveau bloc `immediate_action_hint` — force conversion reply en status + pending_feature_slug si feature immédiate
- **Statut** : CORRIGÉ S87

### BUG-S87-02 — send_email validation_error template manquant ✅ CORRIGÉ
- **Description** : `AIAction send_email` avait `required_fields=['template']` en base. LLM envoyait `to+body+subject` sans `template` → `validation_error` à chaque fois.
- **Fix** : `AIAction send_email required_fields=['to']` via shell
- **Statut** : CORRIGÉ S87

### BUG-S87-03 — Date oubliée après create_contact ✅ CORRIGÉ
- **Description** : Quand le client donnait nom + tel + date en un message, le LLM oubliait la date après exécution de `create_contact` et la redemandait.
- **Fichiers modifiés** :
  - `apps/agent/engine/core.py` (Gabriel)
    - `[RAPPEL] Message original du client` injecté dans `current_input` après `ACTION_RESULT`
  - `apps/agent/skills/features/orientation_patient.md` (Steven)
    - Séquence 4 ajoutée : règle post-create_contact avec date déjà connue
  - `apps/agent/skills/features/gestion_crm.md` (Steven)
    - Section "Après create_contact" ajoutée
- **Statut** : CORRIGÉ S87

---

## Bugs à signaler Gabriel

### BUG-S87-04 — ACTION_RESULT affiché en bulle chat
- **Description** : Dans certains cas, le contenu brut `[ACTION_RESULT send_email] {...}` s'affiche en bulle de chat au lieu d'une réponse propre.
- **Périmètre** : Frontend `WhatsAppSimulator.tsx` (Gabriel)
- **Gravité** : 🟡 Moyen
- **Statut** : ⏳ À corriger

---

## Notes techniques

- Compte test : `demo-custom@agt.cm / Demo@2024!`
- SMTP non configuré en dev → `send_email` statut `queued` (normal en dev)
- Action `orientation` absente comme `AIAction` → à créer si nécessaire pour V3
- `mots_cles_symptomes` initialement vides sur toutes les spécialités → peuplés manuellement en S87
- `required_fields` de `send_email` corrigé en base (était `['template']` → `['to']`)