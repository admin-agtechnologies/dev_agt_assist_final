# HANDOFF — Frontend PME (AGT Assist Client) — 18 Avril 2026

## 1. CE QUI A ÉTÉ COMPLÉTÉ

- **[PME-12]** Interface test `/pme/bots/[id]/test/page.tsx` — cockpit de supervision complet : toggle WhatsApp/Vocal, 4 accordéons auto-expand (infos bot, rapport client live, transfert humain, email bot 3 étapes), transcription vocale temps réel
- **[NAV]** `layout.tsx` — sidebar mise à jour : FAQ retirée de la nav principale, footer enrichi avec "Configuration rapide" (ex-Relancer l'assistant), "Tutoriel interface", "Demander de l'aide"
- **[ROUTES]** `constants.ts` — `ROUTES.faq` remplacé par `ROUTES.help` + `ROUTES.tutorial`
- **[I18N]** `fr.ts` + `en.ts` — clés `nav.quickSetup`, `nav.help`, `nav.tutorial`, sections `help` et `tutorial` ajoutées
- **[PME-HELP]** `/pme/help/page.tsx` — page "Demander de l'aide" avec FAQ statiques AGT Platform (13 questions, 5 catégories, bilingue, filtrable, recherche), bouton chat widget programmatique, bouton WhatsApp AGT
- **[PME-TUTORIAL]** `/pme/tutorial/page.tsx` — tutoriel interactif 6 étapes avec écran d'accueil, stepper avec progression, illustrations SVG par section, navigation prev/next/skip, bouton "Accéder à cette section"
- **[WIDGET]** `SupportWidgets.tsx` — ouverture programmatique via `CustomEvent("agt:open-chat")`

## 2. EN COURS (non terminé)

- [ ] Test visuel complet de toutes les pages — à faire à la prochaine session
- [ ] Vérification `npx tsc --noEmit` sur le dernier fichier `help-page.tsx` installé — à confirmer

## 3. PROCHAINE ÉTAPE IMMÉDIATE

- Remarques sur la landing page `/` — à traiter en priorité
- Tour complet de la plateforme et signalement des anomalies
- Suppression de `/pme/faq/page.tsx` si non référencé ailleurs (vérifier avant de supprimer)

## 4. BUGS CONNUS / POINTS D'ATTENTION

- `SupportWidgets.tsx` — numéro WhatsApp `+237600000000` est un placeholder, à remplacer en production
- `ROUTES.faq` supprimé de `constants.ts` — vérifier qu'aucune autre page ne l'importe encore (notamment `knowledge/page.tsx` qui a un lien "Gérer la FAQ")
- `tutorial/page.tsx` — clés `d.tutorial.steps[key]` typées dynamiquement, vérifier que TypeScript accepte l'accès par clé string si erreur au prochain TSC
- Landing page — aucune modification faite cette session, état inconnu

## 5. COMMANDES UTILES

```bash
npm run dev:mock
npx tsc --noEmit
npm run build


# Comptes démo
pharmacie@example.com  → PME tenant t1
admin@agt.com          → Admin

# URLs clés à tester
http://localhost:3000/pme/dashboard
http://localhost:3000/pme/help
http://localhost:3000/pme/tutorial
http://localhost:3000/pme/bots/b1/test
```

---

À la prochaine session. Bon test de la plateforme 🎯