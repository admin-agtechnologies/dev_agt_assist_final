# init_feature_test.md — Prompt de début de session B5
> Copie-colle ce prompt au début de chaque session de test B5.
> Remplace les variables entre `{}` avant d'envoyer.

---

## Prompt

```
Bonjour, nous démarrons une session de test B5 sur AGT BOT.

**Membre :** {prénom}
**Session N° :** {numéro}
**Date :** {date}
**Objectif :** {description courte — ex: "Step a feature faq + correction BUG-B5-001"}

Avant de commencer, effectue dans l'ordre :

1. **Lis docs/testing/TODO_B5.md** en entier.
   Identifie les features avec des steps en cours (🔄) ou bloqués (❌).
   Note les bugs actifs et leur statut dans la section BUGS ACTIFS.

2. **Lis docs/reports/INDEX.md** — identifie les zones touchées récemment.
   Signale tout conflit potentiel avec d'autres membres actifs.

3. **Lis le rapport de la dernière session** (session_{N-1}_{membre}.md).
   Extrais : ce qui a été fait, bugs trouvés, plan prévu.

4. **Lis les contextes de code** via la mémoire du projet :
   - Backend : contexte_backend.txt
   - Frontend : contexte_frontend_PME.txt
   Ces fichiers sont la source de vérité. En cas de contradiction avec un document,
   le code prime.

5. **Lis frontend_specs.md** si la session touche le frontend.

---

**Compte de test B5 :**
Email    : demo-custom@agt.cm
Password : Demo@2024!
Secteur  : custom (toutes les 24 features actives)
API      : http://localhost:8011
Frontend : http://localhost:3000

**Chemins :**
Backend  : C:\Users\hp\Documents\gabriel\AGT-BOT\agt-assist-backend-final\
Frontend : C:\Users\hp\Documents\gabriel\AGT-BOT\dev_agt_assist_final\
LiteralPath : Get-Content -LiteralPath "C:\...\[id]\..." | Set-Clipboard

---

**Après lecture, propose-moi :**

A. Le prochain step à traiter — basé sur la priorité dans TODO_B5.md :
   - D'abord : steps bloqués (❌) ou en cours (🔄)
   - Ensuite : bugs critiques (🔴) non résolus
   - Ensuite : prochaine feature dans l'ordre (1 → 24), step a en premier

B. Un bug actif à corriger si aucun step n'est en cours

Formule ta recommandation ainsi :
"Je recommande de traiter [ITEM] car [RAISON]. Voici ce que ça implique : [SCOPE COURT].
Attends ma validation avant toute action."

Rappels :
- Tu ne génères rien sans mon accord explicite
- Pour tout bug : diagnostic complet avant solution · consulter les fichiers existants · concevoir avant de coder
- Pour le step a : lire + améliorer le skill.md pour le rendre exhaustif (modèle : system_prompt.md)
- Pour les steps b-h : tester sur demo-custom@agt.cm uniquement
- Zéro initiative propre — tu proposes, je décide toujours
```