# end_feature_test.md — Prompt de fin de session B5
> Copie-colle ce prompt pour clore une session B5.
> Claude génère le rapport, met à jour TODO_B5.md et INDEX.md.

---

## Prompt

```
Nous clôturons la session B5. Génère les documents de fin de session.

**Membre :** {prénom}
**Session N° :** {numéro}
**Date :** {date}

---

## ÉTAPE 1 — Mise à jour de docs/testing/TODO_B5.md

Pour chaque step traité cette session :
- Mettre à jour le statut (⏳ → ✅ ou ❌ ou 🔄)
- Ajouter une note avec le numéro de session et le résultat

Pour chaque bug découvert cette session :
- Ajouter une ligne dans la section BUGS ACTIFS avec le format :
  | BUG-B5-XXX | feature | Backend/Frontend | 🔴/🟡 | description | ⏳/🔄/✅/❌ | S{N} |

Pour chaque bug résolu :
- Mettre à jour son statut → ✅ + ajouter "Résolu S{N}"

Ajouter une ligne dans la section HISTORIQUE :
| S{N} | {résumé des actions} |

---

## ÉTAPE 2 — Rapport de session

Format obligatoire :

# Rapport de session — session_{N}_{prénom}

## Métadonnées
| Champ | Valeur |
|---|---|
| Membre | {prénom} |
| Session N° | {numéro} |
| Date | {date} |
| Type | Test B5 / Debug / Skill audit |
| Statut | Terminée / Partielle |

## Objectif de la session
(1-2 phrases)

## Ce qui a été fait — ordre chronologique
(liste numérotée)

## Steps B5 traités
| Feature | Step | Résultat |
|---|---|---|
| ... | a/b/c/d/e/f/g/h | ✅/❌/🔄 |

## Bugs découverts
| ID | Feature | Description | Gravité |
|---|---|---|---|

## Bugs corrigés
| ID | Description | Solution |
|---|---|---|

## Décisions prises
| Décision | Rationale |
|---|---|

## Zones du code touchées
(liste)

## Fichiers créés / modifiés
| Fichier | Action |
|---|---|

## Plan S+1
1. ...
2. ...

## Prompt début S+1
(Copier init_feature_test.md avec les variables remplies)

---

## ÉTAPE 3 — Entrée INDEX.md (APPEND ONLY)

Format :

---
## session_{N}_{prénom}

- **Type :** Test B5 — {features traitées}
- **Date :** {date}
- **Steps validés :** {liste feature/step}
- **Bugs corrigés :** {IDs ou "Aucun"}
- **Bugs découverts :** {IDs ou "Aucun"}
- **Zones touchées :** {liste fichiers}
- **Fichiers modifiés :** {liste}
- **Rapport :** docs/reports/session_{N}_{prénom}.md
- **TODO_B5 :** docs/testing/TODO_B5.md mis à jour

Ne modifie aucune entrée existante dans INDEX.md.

---

Génère les 3 documents dans l'ordre. Attends ma validation sur TODO_B5.md
avant de finaliser le rapport.
```