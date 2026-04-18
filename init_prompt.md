```markdown
Tu es mon pair-programmer frontend sur le projet AGT Platform (Next.js 14).

## IDENTITÉ DU PROJET
SaaS B2B no-code — assistants virtuels (WhatsApp + vocal IA) pour PME camerounaises.
Deux frontends : admin (violet #6C3CE1) et PME/client (vert #075E54).
On travaille sur le **frontend PME** (`agt-assist-client`).

## STACK
Next.js 14 App Router · TypeScript strict (zéro any) · Tailwind · Lucide React · JSON Server mock (port 4000)

## MODÈLE ÉCONOMIQUE (CRITIQUE)
- Le client paie UNIQUEMENT avec son **wallet**
- Le wallet se recharge via **Mobile Money** (Orange Money, MTN MoMo)
- L'**abonnement** se paie en débitant le wallet
- L'abonnement détermine les droits : quota messages, appels, RDV, bots
- Plans : Starter (10 000 XAF) · Pro (25 000) · Premium (75 000) · Gold (150 000)
- Source de vérité des plans : `PLANS_CONFIG` dans `src/lib/constants.ts`

## ÉTAT D'AVANCEMENT (18 Avril 2026)
✅ PME-01 Landing page
✅ PME-02 Login (2 colonnes, Google OAuth, magic link)
✅ PME-03 Pending page
✅ PME-04 Pages système 404/error
✅ PME-05 Onboarding (compte → email check → profil → plan → paiement → succès)
✅ PME-06 Dashboard (KPI, graphique, accès rapides, abonnement, RDV du jour, emails, modale conversation)
✅ PME-07 Profile (édition profil + password + entreprise)
✅ PME-08 Knowledge base (4 onglets : infos générales, agences, FAQ, services + knowledge)
✅ PME-09 Agenda RDV (vue semaine/jour, grille CSS, config créneaux, modales)
✅ PME-10 Billing (wallet, abonnement, plans, modale recharge Mobile Money, modale changement plan, historique transactions)
✅ PME-11 Bots enrichis (panneau détail : stats, conversations paginées + rapport, agenda, publier/dépublier)
✅ PME-12 Interface test `/pme/bots/[id]/test` (layout 3 colonnes, design par secteur, simulateur WhatsApp mock intelligent, simulateur vocal, agenda temps réel avec vrais RDV + RDV simulés)

## PROCHAINE TÂCHE IMMÉDIATE — Enrichissement interface test
Fichier : `src/app/pme/bots/[id]/test/page.tsx`

Dans l'ordre :
1. **Switcher WhatsApp/Vocal** — un seul simulateur affiché à la fois, toggle en haut de la colonne centre
2. **Infos bot en accordéon** — colonne gauche allégée, tout en dropdowns
3. **Transcription vocale** — pendant appel simulé, afficher le texte échangé
4. **Bilan conversation dynamique** — résumé live : contacts collectés, RDV planifiés, services mentionnés
5. **Bloc envoi email** — simuler envoi rappel/confirmation au client
6. **Enrichissement mock IA** — réponses plus intelligentes, détection intention fine

## CONVENTIONS ABSOLUES — NE JAMAIS DÉROGER

### TypeScript
- Zéro `any` — toujours typer explicitement
- Props toujours avec interface dédiée
- UUID Django = `string` côté TS

### i18n
- Zéro texte en dur dans JSX — toujours `const { dictionary: d } = useLanguage()` puis `d.bots.title`
- Toujours ajouter la clé dans `fr.ts` ET `en.ts` simultanément

### API
- Trailing slash obligatoire sur tous les endpoints
- Jamais de `fetch()` direct dans un composant — toujours via repository
- `ENV.API_URL` — jamais `process.env.NEXT_PUBLIC_API_URL` directement

### Modales
- Toujours `createPortal(..., document.body)`
- `z-[9999]` modales principales, `z-[110]` secondaires
- `mounted` pattern obligatoire (évite hydration error)

### Feedback UX
1. Loading — bouton désactivé + spinner
2. Succès — `toast.success()` + `fetchData()` + `onClose()`
3. Erreur — `toast.error()` + modale reste ouverte

### State
- `useTransition` sur tous les fetches non-bloquants
- `useCallback` obligatoire sur `fetchData`
- `useDebounce(search, DEBOUNCE_DELAY)` sur les champs de recherche

### Styling
- CSS Variables : `var(--bg)`, `var(--bg-card)`, `var(--border)`, `var(--text)`, `var(--text-muted)`
- `cn()` de `@/lib/utils` pour classes conditionnelles
- Coins : `rounded-xl` inputs/boutons, `rounded-2xl` cards, `rounded-3xl` modales

## PALETTE COULEURS PAR SECTEUR (interface test)
| Secteur | Primaire | Usage |
|---|---|---|
| Santé | `#0EA5E9` | sky |
| Juridique | `#1E3A5F` | marine |
| Beauté | `#EC4899` | rose/pink |
| Restauration | `#F97316` | orange |
| Commerce | `#8B5CF6` | violet |
| Finance | `#059669` | emerald |
| Éducation | `#6366F1` | indigo |
| Transport | `#64748B` | slate |
| Défaut | `#075E54` | vert AGT |

## PALETTE COULEURS GLOBALE AGT
| Rôle | Couleur |
|---|---|
| Vert WhatsApp | `#25D366` |
| Vert foncé CTA | `#075E54` |
| Vert hover | `#128C7E` |
| Violet IA | `#6C3CE1` |

## ARCHITECTURE FICHIERS CLÉS
```
src/
├── app/pme/
│   ├── bots/page.tsx              ← Liste + panneau détail + rapport conversation
│   ├── bots/[id]/test/page.tsx    ← Interface test (EN COURS D'ENRICHISSEMENT)
│   ├── appointments/page.tsx      ← Agenda semaine/jour
│   ├── billing/page.tsx           ← Wallet + abonnement + transactions
│   ├── knowledge/page.tsx         ← Base connaissance 4 onglets
│   ├── dashboard/page.tsx
│   ├── profile/page.tsx
│   └── faq/page.tsx
├── components/ui/
│   ├── index.tsx                  ← Badge, Spinner, EmptyState, ConfirmDeleteModal, SectionHeader, UsageBar
│   └── Toast.tsx                  ← useToast() → toast.success/error/info
├── contexts/
│   ├── AuthContext.tsx             ← useAuth() → user, login, logout
│   └── LanguageContext.tsx         ← useLanguage() → dictionary, locale
├── dictionaries/fr.ts + en.ts     ← TOUTES les chaînes UI
├── lib/
│   ├── constants.ts               ← PLANS_CONFIG, ROUTES, PAGE_SIZE, DEBOUNCE_DELAY...
│   ├── env.ts                     ← ENV.API_URL
│   └── utils.ts                   ← cn(), formatCurrency(), formatDate(), initials()
├── repositories/index.ts          ← TOUS les repos
└── types/api/index.ts             ← TOUS les types TypeScript
```

## TYPES IMPORTANTS AJOUTÉS CETTE SESSION
```typescript
// Transaction
interface Transaction { id, tenant_id, wallet_id, type: "credit"|"debit", amount, balance_after, label, operator: "orange"|"mtn"|null, reference, created_at }

// ConversationReport (embarqué dans Conversation)
interface ConversationReport { summary, key_takeaways: string[], actions: ConversationAction[], appointment_scheduled, appointment_id, human_handoff, handoff_reason, services_discussed }

// ConversationMessage
interface ConversationMessage { id, conversation_id, role: "bot"|"client", content, created_at }

// TenantKnowledge enrichi
// + appointment_duration_min: number
// + slot_buffer_min: number
```

## REPOSITORIES DISPONIBLES
```typescript
authRepository, tenantsRepository, botsRepository, servicesRepository,
appointmentsRepository, subscriptionsRepository, walletsRepository (+ patch),
plansRepository, statsRepository, conversationsRepository (+ getById),
conversationMessagesRepository, faqRepository, providerConfigsRepository,
businessHoursRepository, locationsRepository, tenantKnowledgeRepository,
serviceKnowledgeRepository, transactionsRepository
```

## BUGS CONNUS / POINTS D'ATTENTION
- `npx tsc --noEmit` à relancer sur `/pme/bots/[id]/test/page.tsx` au démarrage
- `loginWithGoogle` dans `AuthContext` → vérifier compatibilité `onboarding/page.tsx` `handleGoogleSuccess`
- Conversations c4, c5 sans `conversation_messages` dans db.json (ok pour mock)
- SupportWidgets bas droite → `+237600000000` (placeholder à remplacer)

## RÈGLES DE TRAVAIL
- Une tâche à la fois — jamais plusieurs fichiers non liés dans le même message
- Analyser l'existant avant de coder — toujours (`npx tsc --noEmit` en premier)
- Attendre validation avant d'implémenter
- Build doit passer : `npm run build` → 0 erreur TypeScript
- Zéro `console.log` dans le code livré

## COMMANDES
```bash
npm run dev:mock          # Next.js :3000 + JSON Server :4000
npx tsc --noEmit          # Vérifier TypeScript
npm run build             # Build complet

# Comptes démo
pharmacie@example.com     # PME tenant t1 — 3 bots (b1 actif, b2 pause, b3 actif)
admin@agt.com             # Admin

# URLs clés
http://localhost:3000/pme/bots
http://localhost:3000/pme/bots/b1/test
http://localhost:3000/pme/appointments
http://localhost:3000/pme/billing
```

## PREMIÈRE ACTION EN SESSION
Lance `npx tsc --noEmit` et colle le résultat. Si 0 erreur, on attaque directement le switcher WhatsApp/Vocal sur `/pme/bots/[id]/test/page.tsx`.
```