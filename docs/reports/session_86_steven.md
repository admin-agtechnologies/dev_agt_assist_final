# Rapport de test — simulation_credit (feature 19)

**Membre :** Steven  
**Session :** 86  
**Date :** 2026-05-29  
**Statut global :** ✅ Validée — 5 phases complètes

---

## Phase 1 — Config ✅

- Feature `Simulation de crédit` visible dans la section FINANCE du Tab Config
- Cochée et active sur le Bot WhatsApp Demo (demo-custom)
- 29 features actives au total — toutes les actions héritées automatiquement

---

## Phase 2 — Skills ✅

- `simulation_credit.md` (feature) — complet, aucune modification nécessaire
- `simulate_credit.md` (action) — complet, aucune modification nécessaire
- Skills stabilisés depuis S81, cohérents avec le comportement observé

---

## Phase 3 — Test WhatsApp Simulator ✅

Compte : demo-custom@agt.cm / Demo@2024!  
Frontend : http://localhost:3000

### S1 — Simulation simple ✅
- Input : "Je veux simuler un crédit de 5 millions sur 36 mois"
- Action `simulate_credit` déclenchée en 102ms
- Résultat : mensualité ~166 072 FCFA, taux 12%, coût total ~5 978 576 FCFA
- Disclaimer "simulation indicative" présent ✅
- Proposition dossier présente ✅

### S2 — Double scénario comparatif ✅
- Input : "Montre-moi la différence entre 24 mois et 48 mois pour 5 millions"
- 2 actions `simulate_credit` déclenchées en séquence (50ms + 4ms)
- Comparaison pédagogique : différence d'intérêts expliquée (648 817 vs 1 320 121 FCFA)
- 3 simulations loggées dans le panneau actions ✅

### S3 — Garde-fou sans montant ✅
- Input : "Je veux simuler un crédit"
- Aucune action déclenchée
- Bot demande le montant manquant ✅

### S4 — Proposition dossier + collecte contact ✅
- Simulation 2M/12 mois → mensualité ~177 698 FCFA
- "Oui je veux déposer un dossier" → bot collecte téléphone
- `create_contact` déclenché automatiquement (27ms)
- Téléphone 697500000 enregistré en BD ✅
- Réponse : conseiller à contacter + préférence horaire demandée ✅

### Bug observé
- **BUG-S86-01** (périmètre frontend/simulator) : freeze UI occasionnel après
  2e message dans une même session — le frontend ne renvoie pas la requête POST.
  Le backend n'est pas impacté (logs confirmés). À signaler à Gabriel.

---

## Phase 4 — Persistance BD ✅

```python
SimulationCredit.objects.count() → 16
```

Les 5 simulations de la session correctement persistées :
- 2 000 000 / 12 mois / 177 697 FCFA
- 3 000 000 / 24 mois / 141 220 FCFA
- 5 000 000 / 48 mois / 131 669 FCFA
- 5 000 000 / 24 mois / 235 367 FCFA
- 5 000 000 / 36 mois / 166 071 FCFA

---

## Bugs corrigés durant la session
Aucun — feature fonctionnelle sans correction nécessaire.

## Bugs ouverts
- **BUG-S86-01** : freeze UI simulator (frontend) — périmètre Gabriel

## Notes
- Le fallback taux automatique (corrigé BUG-S80-02 en S81) fonctionne
  correctement — taux 12% appliqué depuis le produit financier du tenant.
- La chaîne simulate_credit → create_contact → proposition dossier
  est fluide et pédagogique.