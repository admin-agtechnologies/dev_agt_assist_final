# HANDOFF — Frontend PME (AGT Assist Client) — 18 Avril 2026

## 1. CE QUI A ÉTÉ COMPLÉTÉ

- [PME-00] Lucide React partout — zéro emoji JSX
- [PME-01] Landing page publique `/` — hero, features, plans, CTA, footer, i18n FR/EN
- [PME-02] Login enrichi `/login` — layout 2 colonnes, Google OAuth, magic link, forgot password, switch langue
- [PME-03] Page pending `/pending` — wrappée AuthShell, renvoyer email, contact support
- [PME-04] Pages système — 404 + error.tsx
- [PME-05] Onboarding `/onboarding` — étape compte + validation email simulée + profil + plan + paiement + succès
- [PME-06] Dashboard PME enrichi — KPI cards, graphique, accès rapides, abonnement + usage, RDV du jour, emails rappel, modale conversation détail
- [PME-07] Profil `/pme/profile` — édition profil + mot de passe + entreprise, layout 2 colonnes
- [PME-08] Base de connaissance `/pme/knowledge` — 4 onglets : infos générales (branding, contacts, transfert, horaires), agences CRUD, FAQ accordéon, services CRUD + knowledge
- [REFACTOR] `AuthShell`, `AuthLeftPanel`, `AuthTopBar`, `GoogleButton` extraits dans `src/components/auth/AuthShell.tsx`
- [FIX] Hydration error Toast corrigée — `mounted` pattern
- [FIX] `suppressHydrationWarning` sur `<body>`
- [FIX] Hot reload Windows — `webpack.watchOptions` dans `next.config.js`
- [FIX] `Location` → `AgencyLocation` pour éviter conflit avec type browser natif

## 2. EN COURS (non terminé)

- [~] PME-08 — Les horaires d'ouverture/RDV ne s'affichent pas dans l'onglet Infos générales malgré les données en `db.json` — cause probable : `tenant_knowledge` pour `t1` non chargé (données vides dans le formulaire), le fetch `tenantKnowledgeRepository.getByTenant` retourne null et les `hoursOpening`/`hoursAppt` ne s'affichent pas

## 3. PROCHAINE ÉTAPE IMMÉDIATE

Débugger le fetch `TabGeneral` dans `knowledge/page.tsx` :
- Vérifier que `GET /api/v1/tenant-knowledge?tenant_id=t1` retourne bien des données depuis JSON Server
- Vérifier que `GET /api/v1/business-hours?tenant_id=t1&type=opening` fonctionne
- Si les données arrivent mais le form reste vide → vérifier le mapping dans `fetchAll`

## 4. BUGS CONNUS / POINTS D'ATTENTION

- Horaires knowledge non affichés — voir section 2
- `loginWithGoogle` dans `AuthContext` retourne maintenant `AuthResponse` — vérifier compatibilité avec `onboarding/page.tsx` ligne `handleGoogleSuccess`
- Les widgets SupportWidgets bas droite pointent sur `+237600000000` (placeholder) — à remplacer par vrai numéro AGT
- Le dossier `wisp/` est peut-être encore présent — peut être supprimé
- `pme/services` retiré de la sidebar — géré exclusivement via Base de connaissance
- `pme/faq` reste dans la sidebar mais aussi accessible depuis Base de connaissance onglet FAQ

## 5. COMMANDES UTILES

```bash
# Lancer le projet
npm run dev:mock

# URLs à tester
http://localhost:3000              # Landing
http://localhost:3000/login        # Login
http://localhost:3000/pme/dashboard
http://localhost:3000/pme/knowledge

# Comptes démo
pharmacie@example.com / n'importe quel mot de passe  (PME, tenant t1)
admin@agt.com / n'importe quel mot de passe           (Admin)

# Vérifier TypeScript
npx tsc --noEmit

# Build complet
npm run build
```