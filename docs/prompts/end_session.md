# end_session.md — Prompt de fin de session

> Copie-colle ce prompt pour clore une session.
> Claude génère le rapport, puis met à jour INDEX.md.
> C'est toi qui décides du moment de clore — Claude peut le suggérer
> si le contexte devient lourd, mais n'impose jamais.

---

## Signal de contexte lourd (envoyé par Claude, pas par toi)

```
⚠️ Contexte lourd détecté. Je suggère de rédiger le rapport de fin de session
avant de continuer. Tu gardes le dernier mot — dis-moi si tu veux continuer
ou clore la session.
```

---

## Prompt de clôture

```
Nous clôturons la session. Génère le rapport de fin de session.

**Membre :** {prénom}
**Session N° :** {numéro}
**Date :** {date}

Le rapport doit suivre exactement ce format :

---

# Rapport de session — session_{N}_{prénom}

## Métadonnées
- Membre, date, type de session (debug / génération / planning), durée estimée, statut

## Objectif de la session
(1-3 phrases)

## Ce qui a été fait
(liste chronologique des actions)

## Décisions prises
(tableau : décision | rationale)

## Difficultés rencontrées
(liste, ou "Aucune")

## Problèmes résolus
(pour chaque bug : ID du bug log, description, solution appliquée, fichiers modifiés)

## Zones du code touchées
(liste des dossiers / fichiers significatifs)

## Fichiers créés / modifiés
(tableau : fichier | action)

## Prompt de la session suivante
(suggestion de point de départ pour la prochaine session,
en référence à la TODO)

## Notes libres
(observations, risques identifiés, recommandations)

---

Une fois le rapport généré et validé par moi :

1. Place-le dans docs/reports/session_{N}_{prénom}.md
2. Ajoute une entrée à docs/reports/INDEX.md (APPEND ONLY) :

## session_{N}_{prénom}
- Type : {type}
- Date : {date}
- Flux couverts : {liste}
- Bugs corrigés : {IDs ou "Aucun"}
- Zones touchées : {dossiers/fichiers}
- Rapport : docs/reports/session_{N}_{prénom}.md

Ne modifie aucune entrée existante dans INDEX.md.
```
