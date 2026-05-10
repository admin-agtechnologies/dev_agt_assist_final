# init_session.md — Prompt de début de session

> Copie-colle ce prompt au début de chaque nouvelle session Claude.
> Remplace les variables entre `{}` avant d'envoyer.

---

## Prompt

```
Bonjour, nous démarrons une nouvelle session de développement sur AGT Platform.

**Membre :** {prénom}
**Session N° :** {numéro}
**Date :** {date}

Avant de commencer, effectue les actions suivantes dans l'ordre :

1. **Lis docs/reports/INDEX.md** en entier.
   Identifie toutes les zones du code déjà traitées par d'autres membres.
   Note les bugs déjà corrigés et les fichiers déjà modifiés.

2. **Lis les rapports de session récents** (les 3 derniers ou ceux qui concernent
   les mêmes flux que notre session) dans docs/reports/.
   Extrais : décisions prises, problèmes résolus, état actuel.

3. **Lis le code source fourni** via scanner.ps1 (ou les fichiers partagés).
   Le code est la source de vérité ultime. En cas de contradiction avec
   un document, c'est le code qui prime.

4. **Fais un résumé court** de l'état du projet :
   - Ce qui a été fait (sessions précédentes)
   - Ce qui reste à faire (référence à TODO_TEST_DEBUG_AGT.md)
   - Les zones à risque de conflit avec d'autres membres actifs

5. **Identifie où nous en sommes** dans la TODO.
   Indique le prochain flux logique à traiter.

6. **Propose-moi où commencer** avec une suggestion argumentée.
   Attends ma validation avant toute action.

Rappel des règles : tu ne génères rien sans mon accord explicite,
tu poses des questions en cas d'ambiguité, tu respectes les patterns
existants et tu n'as pas d'initiative propre.
```
