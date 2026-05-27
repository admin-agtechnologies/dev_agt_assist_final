# end_session.md — Prompt de fin de session AGT BOT
> Copie-colle ce prompt pour clore une session.
> Claude génère le rapport, puis met à jour INDEX.md.
> C'est toi qui décides du moment de clore.

---

## Signal de contexte lourd (envoyé par Claude, pas par toi)

```
⚠️ Contexte lourd détecté. Je suggère de rédiger le rapport de fin de session
avant de continuer. Tu gardes le dernier mot.
```

---

## Prompt de clôture

```
Nous clôturons la session. Génère le rapport de fin de session.

**Membre :** {prénom}
**Session N° :** {numéro}
**Date :** {date}

Le rapport doit suivre exactement ce format, dans l'ordre chronologique strict :

---

# Rapport de session — session_{N}_{prénom}

## Métadonnées
| Champ | Valeur |
|---|---|
| Membre | {prénom} |
| Session N° | {numéro} |
| Date | {date} |
| Type | debug / génération / conception / planning |
| Durée estimée | {durée} |
| Statut | Terminée / Partielle |

## Objectif de la session
(1-3 phrases — ce qu'on voulait accomplir)

## Ce qui a été fait — ordre chronologique
(Liste numérotée dans l'ordre exact des actions réalisées pendant la session.
Chaque item = une action concrète avec son résultat.
Exemple :
1. Audit du modèle Bot — constat : ChatbotViewSet inaccessible aux PME
2. Décision : ajouter action @chatbot dans BotViewSet avec ChatbotPMESerializer
3. Génération BotConfigSections.tsx — composant partagé 5 sections
4. Bug TS2305 : SectorColors → SectionColors — corrigé
5. Validation visuelle — 0 erreur tsc confirmé par Gabriel)

## Décisions prises
| Décision | Rationale |
|---|---|
| ... | ... |

## Bugs corrigés
| ID | Description | Fichier(s) | Solution |
|---|---|---|---|
| BUG-S{N}-01 | ... | ... | ... |

## Zones du code touchées
(liste des dossiers / fichiers significatifs)

## Fichiers créés / modifiés
| Fichier | Chemin complet | Action | Lignes |
|---|---|---|---|
| ... | src/app/... | Créé / Modifié | ~xxx |

## Specs traitées cette session
(Si la session traitait des specs Gabriel — lister les specs abordées et leur statut)
| Spec | Statut |
|---|---|
| ... | ✅ Terminé / ⏳ Partiel / ❌ Reporté |

## Décisions reportées / dette créée
(Points volontairement non traités, avec la raison)

## Plan d'action S+1
(Ce que la prochaine session doit faire en premier, dans l'ordre)
1. ...
2. ...

## Prompt de début de S+1
(Prompt prêt à copier-coller pour la prochaine session — compléter les {variables})

---

Une fois le rapport généré et validé par moi :

1. Place-le dans docs/reports/session_{N}_{prénom}.md
2. Ajoute une entrée à la fin de docs/reports/INDEX.md (APPEND ONLY — jamais de réécriture) :

---
## session_{N}_{prénom}

- **Type :** {type}
- **Date :** {date}
- **Flux couverts :** {liste}
- **Bugs corrigés :** {IDs ou "Aucun"}
- **Zones touchées :** {dossiers/fichiers}
- **Fichiers créés :** {liste ou "Aucun"}
- **Fichiers modifiés :** {liste ou "Aucun"}
- **Specs traitées :** {liste ou "Aucune"}
- **Dette créée :** {liste ou "Aucune"}
- **⚠️ PowerShell LiteralPath :** Pour lire les fichiers touchés avec [id] dans le chemin,
  utiliser : Get-Content -LiteralPath "C:\chemin\complet\fichier" | Set-Clipboard
- **Rapport :** docs/reports/session_{N}_{prénom}.md

Ne modifie aucune entrée existante dans INDEX.md.
```