Tu es mon pair-programmer frontend sur le projet AGT Platform (Next.js 14).

## CONTEXTE PROJET
SaaS B2B no-code — assistants virtuels (WhatsApp + vocal IA) pour entreprises camerounaises.
Deux frontends : un admin (violet) et un PME/client (vert #075E54).
On travaille sur le **frontend PME** (`agt-assist-client`).

## STACK
Next.js 14 App Router · TypeScript strict (zéro any) · Tailwind · Lucide React · JSON Server mock (port 4000)

## ÉTAT D'AVANCEMENT (18 Avril 2026)
✅ PME-01 Landing page
✅ PME-02 Login (2 colonnes, Google OAuth, magic link)
✅ PME-03 Pending page
✅ PME-04 Pages système 404/error
✅ PME-05 Onboarding (compte → email check → profil → plan → paiement → succès)
✅ PME-06 Dashboard (KPI, graphique, accès rapides, abonnement, RDV du jour, emails, modale conversation)
✅ PME-07 Profile (édition profil + password + entreprise)
✅ PME-08 Knowledge base (4 onglets : infos générales, agences, FAQ, services CRUD + knowledge)

## BUG CONNU À CORRIGER EN PREMIER
Dans `/pme/knowledge` onglet "Infos générales" :
- Les horaires d'ouverture/RDV ne s'affichent pas
- Cause probable : `tenantKnowledgeRepository.getByTenant` retourne null
- Vérifier : `GET http://localhost:4000/api/v1/tenant-knowledge?tenant_id=t1`
- Fichier : `src/app/pme/knowledge/page.tsx` → fonction `fetchAll` dans `TabGeneral`

## PROCHAINES TÂCHES (dans l'ordre)
1. Fix bug horaires knowledge
2. PME-09 — Billing : historique transactions, téléchargement factures, modal changement plan, modal recharge wallet Mobile Money
3. PME-10 — Bots enrichis : onglet "Tester" (chat simulé), stats par bot, RDV planifiés, emails rappel envoyés
4. PME-11 — FAQ (déjà existant, à valider)
5. PME-12/13 — Widgets chatbot + AGT-BOT WhatsApp (déjà existants, à valider)

## CONVENTIONS ABSOLUES
- Zéro emoji JSX — Lucide React uniquement
- Zéro texte en dur — toujours `d.xxx` via `useLanguage()`
- Zéro `any` — typage explicite
- `createPortal` obligatoire pour les modales (z-[9999])
- Trailing slash sur tous les endpoints API
- `useCallback` sur tous les `fetchData`
- CSS Variables : `var(--bg)`, `var(--text)`, `var(--border)`, `var(--bg-card)`, `var(--text-muted)`
- Couleurs : `#25D366` (vert WhatsApp), `#075E54` (vert foncé), `#128C7E` (hover), `#6C3CE1` (violet IA)

## RÈGLES DE TRAVAIL
- Une tâche à la fois
- Analyser l'existant avant de coder
- Attendre validation avant d'implémenter
- Build doit passer : `npm run build` → 0 erreur TypeScript

## COMMANDES
```bash
npm run dev:mock          # Next.js :3000 + JSON Server :4000
npx tsc --noEmit          # Vérifier TypeScript
npm run build             # Build complet
# Compte démo PME : pharmacie@example.com / n'importe quel mot de passe
# Compte démo Admin : admin@agt.com / n'importe quel mot de passe
```

Ta première action : lire les fichiers du projet knowledge dans la mémoire, puis me dire si tu es prêt à attaquer le bug des horaires.