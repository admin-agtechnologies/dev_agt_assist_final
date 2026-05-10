# Rapport de session — session_1_gabriel

## Métadonnées

| Champ | Valeur |
|-------|--------|
| Membre | Gabriel |
| Date | 2026-05-09 |
| Type | Planification |
| Durée estimée | ~2h |
| Statut | Terminée |

---

## Objectif de la session

Structurer le plan de test & débogage complet d'AGT Platform V1 post-migration, et mettre en place les outils de collaboration pour l'équipe.

---

## Ce qui a été fait

1. **Discussion et structuration du plan de test**
   - Définition de l'approche depth-first (secteur par secteur)
   - Choix du secteur de départ : Restaurant (le plus riche en features)
   - Définition et validation de l'ordre des 10 secteurs
   - Définition des 10 flux génériques (F1 → F10)
   - Validation du périmètre V1 (inclus / exclu)

2. **Génération de la TODO principale**
   - Fichier : `TODO_TEST_DEBUG_AGT.md`
   - Structure : préambule + 10 flux génériques + 10 branches sectorielles + validation finale + annexes
   - Restaurant : section de référence entièrement détaillée
   - Secteurs 2-10 : même structure, spécificités détaillées, socle en vérification rapide

3. **Mise en place des outils de collaboration**
   - `docs/reports/` : rapports de session nommés `session_N_membre.md`
   - `docs/reports/INDEX.md` : registre centralisé (append only)
   - `docs/prompts/setup_claude.md` : configuration projet Claude + règles de comportement
   - `docs/prompts/init_session.md` : prompt de début de session
   - `docs/prompts/end_session.md` : prompt de fin de session

---

## Décisions prises

| Décision | Rationale |
|----------|-----------|
| Approche depth-first | Premier secteur amortit les bugs du socle pour les 9 suivants |
| Restaurant en premier | RDV variant + commande + paiement + menu = couverture maximale |
| Test local avant prod | Solidité avant exposition |
| Conception = source de vérité | Versions en ligne actuelles non représentatives |
| Landings à refaire | Ne respectent pas la conception actuelle |
| Double niveau test agent | Interface interne (persistance) + WAHA (live) |
| Plan flexible, pas rigide | Direction > rigidité, 60 itérations > 6 |
| F1 (landings) dans le périmètre | Le test drive la correction |
| Bug tracking double | Inline (réactivité) + INDEX centralisé (traçabilité) |
| INDEX append-only | Chaque membre écrit son bloc, personne n'écrase |
| Rapports nommés par membre | Traçabilité individuelle + parallélisation |

---

## Difficultés rencontrées

- Outils de création de fichiers indisponibles en fin de session (sandbox) → livrables fournis en markdown inline dans le chat

---

## Problèmes résolus

- Aucun bug technique cette session (session de planification)

---

## Zones du code touchées

- Aucune (session de planification et documentation uniquement)

---

## Fichiers créés / modifiés

| Fichier | Action |
|---------|--------|
| `TODO_TEST_DEBUG_AGT.md` | Créé |
| `docs/reports/session_1_gabriel.md` | Créé |
| `docs/reports/INDEX.md` | Créé |
| `docs/prompts/setup_claude.md` | Créé |
| `docs/prompts/init_session.md` | Créé |
| `docs/prompts/end_session.md` | Créé |

---

## Prompt de la session suivante

Copier-coller le contenu de `docs/prompts/init_session.md` en début de session.
La prochaine session démarre sur **F1 — Landing centrale (hub) du secteur Restaurant**.

---

## Notes libres

- La TODO est un guide directionnel, pas un script rigide
- Bien distinguer bug commun (socle) vs bug sectoriel lors du débogage
- Convention de commit à respecter dès la session 2 :
  `test(restaurant): F1 landing hub — KO / fix(...) — ... / test(...) — OK`
