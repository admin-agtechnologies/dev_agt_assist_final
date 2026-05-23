# init_session.md — Prompt de début de session AGT BOT
> Copie-colle ce prompt au début de chaque nouvelle session Claude.
> Remplace les variables entre `{}` avant d'envoyer.

---

## Prompt

```
Bonjour, nous démarrons une nouvelle session de développement sur AGT BOT.

**Membre :** {prénom}
**Session N° :** {numéro}
**Date :** {date}
**Objectif principal :** {description courte de l'objectif}

Avant de commencer, effectue les actions suivantes dans l'ordre :

1. **Lis docs/reports/INDEX.md** en entier.
   Identifie toutes les zones du code déjà traitées.
   Note les bugs déjà corrigés et les fichiers déjà modifiés.
   ⚠️ Pour lire les fichiers sur disque avec des crochets dans le chemin (ex: [id]),
   utilise toujours -LiteralPath en PowerShell :
   Get-Content -LiteralPath "C:\chemin\complet\fichier" | Set-Clipboard

2. **Lis le rapport de la dernière session** (session_{N-1}_{membre}.md).
   Extrais : décisions prises, bugs résolus, état actuel, plan d'action prévu.

3. **Lis le contexte de code** via la mémoire du projet :
   - Backend : contexte_backend.txt
   - Frontend : contexte_frontend_PME.txt (ou project_frontend.txt selon la session)
   Le code est la source de vérité ultime. En cas de contradiction avec un document,
   c'est le code qui prime.

4. **Si la session touche le frontend**, lis obligatoirement frontend_specs.md
   (disponible dans la mémoire du projet).
   Ce document contient les règles non négociables : couleurs sectorielles, i18n,
   taille des fichiers, TypeScript, réutilisation des composants.
   Ne touche aucun fichier frontend avant d'avoir lu ce document.

5. **Suivi des specs en cours** :
   Gabriel travaille avec une liste de specs qu'il donne une par une.
   Si des specs ont été traitées dans des sessions précédentes, elles sont
   documentées dans INDEX.md. Identifie où on en est dans la liste.

6. **Fais un résumé court** de l'état du projet :
   - Ce qui a été fait (sessions précédentes)
   - Ce qui reste à faire dans la TODO (référence : AGT_Chantier1 dans la mémoire du projet)
   - Les zones à risque de conflit avec d'autres membres actifs
   - L'avancement des specs en cours

7. **Identifie où nous en sommes** dans la TODO.
   Indique le prochain flux logique à traiter.
   La prochaine cible connue est : B6 — Statistiques & Dashboard (3 niveaux).

8. **Propose-moi où commencer** avec une suggestion argumentée.
   Attends ma validation avant toute action.

Rappel des règles :
- Tu ne génères rien sans mon accord explicite
- Tu poses des questions en cas d'ambiguité
- Tu respectes les patterns existants
- Zéro initiative propre
- Pour toute modification backend : tu expliques d'abord le problème,
  tu proposes la solution, tu attends mon OK avant de générer
- Fichiers frontend : toujours complets (jamais de diffs), toujours < 200 lignes,
  toujours 0 erreur tsc, toujours 0 texte en dur, toujours couleurs sectorielles
```