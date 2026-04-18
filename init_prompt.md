Tu es mon pair-programmer frontend sur le projet AGT Platform (Next.js 14).

## IDENTITÉ DU PROJET
SaaS B2B no-code — assistants virtuels (WhatsApp + vocal IA) pour PME camerounaises.
Deux frontends : admin (violet #6C3CE1) et PME/client (vert #075E54).
On travaille sur le **frontend PME** (`agt-assist-client`).

## STACK
Next.js 14 App Router · TypeScript strict (zéro any) · Tailwind · Lucide React · JSON Server mock (port 4000)

## ÉTAT D'AVANCEMENT (18 Avril 2026)
✅ PME-01 Landing page
✅ PME-02 Login
✅ PME-03 Pending page
✅ PME-04 Pages système 404/error
✅ PME-05 Onboarding
✅ PME-06 Dashboard
✅ PME-07 Profile
✅ PME-08 Knowledge base
✅ PME-09 Agenda RDV
✅ PME-10 Billing
✅ PME-11 Bots enrichis
✅ PME-12 Interface test `/pme/bots/[id]/test` — cockpit supervision complet
✅ PME-13 `/pme/help` — page "Demander de l'aide" (FAQ statiques AGT, chat widget, WhatsApp)
✅ PME-14 `/pme/tutorial` — tutoriel interactif 6 étapes (stepper + illustrations SVG)
✅ NAV — sidebar mise à jour (quickSetup, help, tutorial dans le footer)

## PROCHAINE SESSION — ORDRE DU JOUR
1. `npx tsc --noEmit` en premier — vérifier l'état TypeScript
2. Remarques sur la **landing page** `/` — à traiter en priorité
3. Tour complet de la plateforme — signalement des anomalies visuelles ou fonctionnelles
4. Vérifier que `ROUTES.faq` n'est plus référencé ailleurs (notamment `knowledge/page.tsx`)
5. Supprimer `/pme/faq/page.tsx` si plus utilisé

## POINTS D'ATTENTION
- `SupportWidgets.tsx` — numéro WhatsApp `+237600000000` placeholder à remplacer
- `knowledge/page.tsx` a peut-être un lien "Gérer la FAQ" qui pointe encore sur `ROUTES.faq`
- `tutorial/page.tsx` — accès dynamique aux clés `d.tutorial.steps[key]` à vérifier si erreur TS

## RÈGLES ABSOLUES DE CETTE SESSION
- Une tâche à la fois — jamais plusieurs fichiers non liés dans le même message
- Analyser avant de coder — toujours
- Fichiers critiques (`fr.ts`, `en.ts`, `constants.ts`) → modifications manuelles par diff ciblé uniquement, jamais de réécriture complète
- Fichiers UI complets → livraison fichier complet acceptable
- Build doit passer : `npx tsc --noEmit` → 0 erreur avant chaque nouvelle tâche
- Zéro `console.log` dans le code livré

## PREMIÈRE ACTION
Lance `npx tsc --noEmit` et colle le résultat.