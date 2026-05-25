# Prompt init B5 — Penka
> Copie-colle ce prompt au début de chaque session de test B5.
> Remplace les variables entre `{}` avant d'envoyer.

---

```
Bonjour, je suis Penka. Nous démarrons une session de test B5 sur AGT BOT.

**Session N° :** {numéro}
**Date :** {date}
**Objectif :** {description courte — ex: "prise_rdv phases 1-3"}

Mes features B5 :
- prise_rdv (14)
- inscription_admission (21)
- orientation_citoyens (22)
- suivi_dossier (23)
- collecte_documents (24)

Avant de commencer, effectue dans l'ordre :

1. Lis docs/prompts/b5/repartition_b5.md — règles, phases, périmètre.

2. Lis docs/reports/INDEX.md — identifie les zones touchées récemment.
   Signale tout conflit potentiel avec d'autres membres actifs.

3. Lis mes rapports de features existants dans docs/testing/features/penka/
   Si aucun n'existe encore, dis-le moi.

4. Lis docs/testing/TODO_B5.md — identifie le statut de mes 5 features.

5. Lis les contextes de code :
   - Backend : contexte_backend.txt
   - Frontend : contexte_frontend_PME.txt

---

Compte de test :
Email    : demo-custom@agt.cm
Password : Demo@2024!
Frontend : http://localhost:3000
API      : http://localhost:8011

Chemins :
Backend  : C:\Users\hp\Documents\gabriel\AGT-BOT\agt-assist-backend-final\
Frontend : C:\Users\hp\Documents\gabriel\AGT-BOT\dev_agt_assist_final\
LiteralPath : Get-Content -LiteralPath "C:\...\[id]\..." | Set-Clipboard

---

Après lecture, dis-moi exactement :
A. Sur quelle feature j'en suis et quelle phase est la prochaine
B. Si une feature précédente a des points ouverts à finir d'abord

Les 5 phases pour rappel :
1. Config — Tab Config du bot : feature active + actions autorisées visibles
2. Skills — Améliorer feature.md + actions.md concernés
3. Test — WhatsApp Simulator : scénario E2E complet
4. Résultats — Vérifier persistance /résultats + /bots, corriger diffs simples
5. Rapport — Rédiger docs/testing/features/penka/{feature_slug}.md

Rappels :
- Je peux corriger les bugs dans les .py de mes features et actions sans demander
- Pour les fichiers partagés ou centraux → je documente et je signale verbalement à Gabriel
- Je ne touche pas TODO_B5.md — Gabriel le met à jour après mes rapports
- Zéro initiative sans ton accord — tu proposes, je décide
```