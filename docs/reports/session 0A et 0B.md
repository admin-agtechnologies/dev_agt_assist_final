# HANDOFF — Session 0-B AGT Platform Frontend
**Date :** 07 Mai 2026  
**Phase :** 0-B — Audit & modularisation  
**Statut :** ✅ Terminé (hors validation tsc finale bloquée par 0-C)

---

## CE QUI A ÉTÉ FAIT

### 0-B.1 — Code mort supprimé ✅
- Supprimé dans `types/api/index.ts` (session précédente)
- Tous les imports inutiles nettoyés

### 0-B.2 — Fichiers > 260 lignes découpés ✅

| Fichier original | Avant | Après | Nouveaux fichiers créés |
|---|---|---|---|
| `src/app/onboarding/page.tsx` | 606 | 168 | `_components/OnboardingNavbar.tsx`, `OnboardingStepper.tsx`, `GoogleSignupButton.tsx`, `steps/StepAccount.tsx`, `StepEmailCheck.tsx`, `StepProfile.tsx`, `StepPlan.tsx`, `StepPayment.tsx`, `StepSuccess.tsx` |
| `src/app/pme/layout.tsx` | 343 | 112 | `_components/PmeSidebarNav.tsx`, `PmeMobileHeader.tsx` |

### 0-B.2 — Fichiers skippés (justification)

| Fichier | Lignes | Raison du skip |
|---|---|---|
| `pme/tutorial/_components/TutorialIllustrations.tsx` | 320 | SVG purs — zéro logique, zéro état, découpage artificiel |
| `pme/appointments/components/RdvModal.tsx` | 306 | Un seul formulaire, état partagé entre tous les champs |
| `src/app/login/page.tsx` | 291 | 4 vues partageant le même état email/isPending |
| `pme/knowledge/components/TabLocations.tsx` | 272 | Liste + 2 modales partageant le même état agences/form |
| `pme/bots/_components/tabs/BotSettingsPanel.tsx` | 267 | Formulaire + panneau statut, état partagé |

### 0-B.3 — Imports aliases ✅
- Vérification faite : tous les imports utilisent déjà `@/contexts`, `@/components`, `@/repositories`, `@/types`, `@/lib`
- Les seuls `../` présents sont des imports intra-module légitimes (ex: `appointments/components/` → `appointments/types`)
- **Rien à corriger**

---

## CE QUI RESTE À FAIRE

### ⚠️ Blocage compilation actuel
Deux fichiers contiennent des caractères UTF-8 corrompus (encodage Windows) :
- `src/lib/sector-config.ts` → erreur `stream did not contain valid UTF-8`
- `src/lib/sector-theme.ts` → même erreur

**Ces fichiers sont des stubs vides créés en session précédente avec des `// TODO` mal encodés.**  
**Fix immédiat** : remplacer leur contenu par du code propre — mais c'est une tâche **0-C**, pas 0-B.

---

## PROCHAINE ÉTAPE : 0-C — Socle technique

> **Prérequis :** corriger l'encodage de `sector-config.ts` et `sector-theme.ts` en premier (2 minutes).

### Fichiers à faire en 0-C (dans l'ordre) :

#### 1. Fix encodage (déblocage immédiat)
- `src/lib/sector-config.ts` — remplacer le stub corrompu par le vrai code
- `src/lib/sector-theme.ts` — idem
- `src/lib/sector-labels.ts` — idem
- `src/lib/env.ts` — idem

#### 2. Découper `types/api/index.ts` (900 lignes → fichiers par domaine)
Les stubs existent déjà dans `src/types/api/` mais sont vides (`// TODO`) :
```
src/types/api/
├── feature.types.ts      ← vide, à remplir
├── catalogue.types.ts    ← vide, à remplir
├── reservation.types.ts  ← vide, à remplir
├── commande.types.ts     ← vide, à remplir
├── contact.types.ts      ← vide, à remplir
├── conversation.types.ts ← vide, à remplir
├── agence.types.ts       ← vide, à remplir
├── user.types.ts         ← vide, à remplir
└── index.ts              ← re-exporte tout (900 lignes actuellement)
```
**Action :** déplacer les types de `index.ts` dans leurs fichiers respectifs, puis `index.ts` ne fait que re-exporter.

#### 3. Découper `repositories/index.ts` (828 lignes → fichiers par domaine)
Les fichiers existent déjà mais sont vides :
```
src/repositories/
├── features.repository.ts      ← vide, à remplir
├── catalogues.repository.ts    ← vide, à remplir
├── reservations.repository.ts  ← vide, à remplir
├── commandes.repository.ts     ← vide, à remplir
├── contacts.repository.ts      ← vide, à remplir
├── conversations.repository.ts ← vide, à remplir
├── agences.repository.ts       ← vide, à remplir
└── index.ts                    ← 828 lignes, à vider après découpage
```

#### 4. Découper `dictionaries/fr.ts` (1009 lignes) et `dictionaries/en.ts` (998 lignes)
Les dossiers `fr/` et `en/` existent avec des stubs vides :
```
src/dictionaries/
├── fr/
│   ├── common.fr.ts       ← vide
│   ├── dashboard.fr.ts    ← vide
│   ├── catalogue.fr.ts    ← vide
│   ├── reservations.fr.ts ← vide
│   ├── commandes.fr.ts    ← vide
│   ├── contacts.fr.ts     ← vide
│   ├── conversations.fr.ts← vide
│   ├── settings.fr.ts     ← vide
│   ├── billing.fr.ts      ← vide
│   └── index.ts           ← vide, doit fusionner tout
├── en/
│   └── (même structure)
├── fr.ts                  ← 1009 lignes, source de vérité actuelle
└── en.ts                  ← 998 lignes, source de vérité actuelle
```

#### 5. Compléter les fichiers sector-configs (stubs vides)
```
src/lib/sector-configs/
├── hotel.ts      ← vide
├── restaurant.ts ← vide
├── pme.ts        ← vide
├── banking.ts    ← vide
├── clinical.ts   ← vide
├── school.ts     ← vide
├── ecommerce.ts  ← vide
├── transport.ts  ← vide
├── public.ts     ← vide
└── custom.ts     ← vide
```

#### 6. Hooks à compléter (stubs vides)
- `src/hooks/useFeatures.ts` — partiellement implémenté, à vérifier
- `src/hooks/useSector.ts` — implémenté, dépend de `sector-config.ts`
- `src/hooks/useLanguage.ts` — à vérifier
- `src/hooks/useConversation.ts` — à vérifier

---

## APRÈS 0-C : Phase 1 — Migration pme/ → (dashboard)/

La migration de `src/app/pme/` vers `src/app/(dashboard)/` se fait en Phase 1.  
Elle nécessite que 0-C soit complet car `(dashboard)/layout.tsx` consomme `useSector()` qui dépend de `sector-config.ts`.

---

## RÈGLES À RESPECTER (rappel)
- Max 2 lignes par fichier
- Zéro `any` TypeScript
- Zéro texte en dur dans le JSX — tout via `useLanguage()` + dictionnaires
- Trailing slash sur tous les endpoints API
- `npx tsc --noEmit` → zéro erreur après chaque modification

---

## COMMANDES UTILES
```bash
npx tsc --noEmit          # Vérifier TypeScript
npm run dev               # Lancer le serveur
```

## STACK
- Next.js 14 App Router + TypeScript strict + Tailwind CSS
- Backend Django REST API sur `http://localhost:8000/api/v1/`
- Auth JWT avec refresh token