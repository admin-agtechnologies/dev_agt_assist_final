# Prompt init B5 — Gabriel
> Copie-colle ce prompt au début de chaque session de test B5.
> Remplace les variables entre `{}` avant d'envoyer.

---

```
Bonjour, je suis Gabriel. Nous démarrons une session de test B5 sur AGT BOT.

**Session N° :** {numéro}
**Date :** {date}
**Objectif :** {description courte — ex: "faq phases 1-3 + bug central signalé par Stéphane"}

Mes features B5 (socle transversal) :
- faq (1)
- gestion_crm (2)
- capture_prospect (3)
- transfert_humain (4)
- emails_rappel (5)
- communication (6)
- multi_agences (7)
- menu_digital (8) ✅ S70

Rôle central :
- Correction bugs fichiers partagés (engine, chatbot_bridge, frontend commun, migrations)
- Validation step h (toutes features)
- Mise à jour TODO_B5.md après chaque rapport de feature validé

Avant de commencer, effectue dans l'ordre :

1. Lis docs/prompts/b5/repartition_b5.md — répartition complète + règles.

2. Lis docs/reports/INDEX.md — zones touchées, conflits potentiels.

3. Lis mes rapports existants dans docs/testing/features/gabriel/
   ET les rapports des collaborateurs dans docs/testing/features/stephane/, steven/, penka/
   Identifie les bugs centraux signalés qui attendent ma correction.

4. Lis docs/testing/TODO_B5.md — état global de toutes les features.

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

Après lecture, dis-moi dans l'ordre :

A. Bugs centraux signalés par les collaborateurs à traiter en priorité
B. Sur quelle feature socle j'en suis et quelle phase est la prochaine
C. Features des collaborateurs dont le rapport est prêt → TODO_B5 à mettre à jour

Les 5 phases pour rappel (mes features socle) :
1. Config — Tab Config : feature active + actions autorisées
2. Skills — Améliorer feature.md + actions.md
3. Test — WhatsApp Simulator : E2E complet
4. Résultats — Vérifier /résultats + /bots, corriger si nécessaire
5. Rapport — Rédiger docs/testing/features/gabriel/{feature_slug}.md

Rappels :
- Bugs centraux signalés par les collabs → diagnostiquer + corriger en priorité
- Mise à jour TODO_B5 uniquement après rapport + validation h explicite
- Zéro initiative sans accord explicite — tu proposes, je décide
```