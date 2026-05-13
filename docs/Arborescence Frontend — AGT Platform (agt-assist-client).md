# Arborescence Frontend — AGT Platform (agt-assist-client)
> Générée en session 14 — donpk
> Source de vérité : `contexte_frontend_PME.txt` lu intégralement
> ⚠️ Les zones marquées `[SLUG ⚠️]` sont des zones de désalignement slug à corriger

---

```
agt-assist-client/
│
├── public/
│   ├── AGT-BOT-logo/
│   │   ├── logo_banque/          # Assets banking (clé logo-config: "ecole" ⚠️ banking déjà corrigé)
│   │   ├── logo_ecole/           # Assets school   [SLUG ⚠️ clé encore "ecole" dans logo-config]
│   │   ├── logo_hotel/
│   │   ├── logo_pme/
│   │   ├── logo_restaurant/
│   │   ├── logo_sante/           # (fichier : sante.svg — BUG-006 déjà corrigé)
│   │   ├── logo_transport/
│   │   ├── logo_public/
│   │   ├── logo_ecommerce/
│   │   ├── logo_personnalise/
│   │   └── centrale.svg          # Hub central (fond coloré en dur — dette S10)
│   ├── og-image.png
│   ├── favicon.ico
│   └── ...
│
├── src/
│   │
│   ├── app/                              # Next.js App Router
│   │   │
│   │   ├── layout.tsx                    # Root layout — favicon sectoriel dynamique (S10)
│   │   ├── page.tsx                      # ⚠️ FICHIER CLÉ — switch secteur → composant landing
│   │   │                                 #   case "restaurant" → RestaurantLandingContent
│   │   │                                 #   case "banking"    → BankingLandingContent
│   │   │                                 #   default           → LandingPageContent (hub)
│   │   │                                 #   À MODIFIER : ajouter case "school"
│   │   ├── robots.ts
│   │   ├── sitemap.ts
│   │   ├── error.tsx
│   │   ├── not-found.tsx                 # 404 sectoriel
│   │   │
│   │   ├── _components/                  # Composants privés à app/ (landing uniquement)
│   │   │   ├── LandingPageContent.tsx    # Assemblage landing HUB
│   │   │   │
│   │   │   ├── landing/                  # Composants partagés entre toutes les landings
│   │   │   │   ├── LandingData.ts        # ⚠️ FICHIER CLÉ — SECTORS[], SECTOR_ICON_MAP
│   │   │   │   │                         #   id "ecole" → à renommer "school"
│   │   │   │   │                         #   id "clinique" → à renommer "clinical" (futur)
│   │   │   │   │                         #   id "voyage" → à renommer "transport" (futur)
│   │   │   │   ├── LandingNavbar.tsx     # Navbar landing — logo sectoriel via getLogoAssets()
│   │   │   │   ├── LandingFooter.tsx     # Footer landing — bgColor sectoriel
│   │   │   │   ├── HeroCarousel.tsx      # Carrousel hero hub
│   │   │   │   ├── StatsSection.tsx      # Section stats hub
│   │   │   │   ├── SectorsSection.tsx    # ⚠️ FICHIER CLÉ — sélecteur secteurs interactif
│   │   │   │   │                         #   SECTOR_ICONS: "ecole" → à renommer "school"
│   │   │   │   ├── FeaturesSection.tsx   # Section features hub
│   │   │   │   ├── FeatureCard.tsx       # Carte feature individuelle
│   │   │   │   ├── DemoSection.tsx       # Section démo vidéo (chat hardcodé restaurant — dette S10)
│   │   │   │   ├── TestimonialsCarousel.tsx  # Carrousel témoignages
│   │   │   │   ├── CtaSection.tsx        # Section CTA final
│   │   │   │   ├── BentoSectorCard.tsx   # Carte secteur format bento
│   │   │   │   └── SectorCard.tsx        # Carte secteur simple (orphelin après S10 — à supprimer)
│   │   │   │
│   │   │   └── sector/                   # Composants landing par secteur
│   │   │       ├── restaurant/           # ✅ COMPLET (S2)
│   │   │       │   ├── RestaurantHero.tsx
│   │   │       │   ├── RestaurantFeatures.tsx
│   │   │       │   └── RestaurantLandingContent.tsx
│   │   │       │
│   │   │       ├── banking/              # ✅ COMPLET (S12)
│   │   │       │   ├── BankingHero.tsx
│   │   │       │   ├── BankingFeatures.tsx
│   │   │       │   └── BankingLandingContent.tsx
│   │   │       │
│   │   │       └── school/               # 🔴 À CRÉER (S14 — session actuelle)
│   │   │           ├── SchoolHero.tsx
│   │   │           ├── SchoolFeatures.tsx
│   │   │           └── SchoolLandingContent.tsx
│   │   │
│   │   ├── (auth)/                       # Groupe route — layout auth partagé
│   │   │   └── onboarding/
│   │   │       └── page.tsx              # Onboarding multi-étapes (sector → identity → features → account)
│   │   │
│   │   ├── (dashboard)/                  # Groupe route — layout dashboard (Sidebar + Header)
│   │   │   ├── layout.tsx                # Layout dashboard principal
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx              # Page d'accueil dashboard
│   │   │   │
│   │   │   ├── welcome/
│   │   │   │   └── page.tsx              # 4 écrans d'onboarding post-inscription (S9)
│   │   │   │
│   │   │   ├── bots/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── test/
│   │   │   │           ├── page.tsx
│   │   │   │           └── _components/
│   │   │   │               └── test.types.ts
│   │   │   │
│   │   │   ├── appointments/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── types.ts
│   │   │   │   └── hooks/
│   │   │   │       └── useAppointments.ts
│   │   │   │
│   │   │   ├── billing/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── contacts/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── conversations/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── faq/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── feedback/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── help/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── knowledge/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── profile/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── services/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── settings/
│   │   │   │   ├── page.tsx
│   │   │   │   └── modules/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── tutorial/
│   │   │   │   ├── page.tsx
│   │   │   │   └── _components/
│   │   │   │       ├── tutorial.types.tsx
│   │   │   │       ├── tutorialscreens.tsx
│   │   │   │       └── tutorialillustrations.tsx
│   │   │   │
│   │   │   └── modules/                  # Hub modules sectoriels dynamiques
│   │   │       ├── layout.tsx
│   │   │       ├── page.tsx              # Vue principale modules (3 tabs: Actifs/Disponibles/Upgrade)
│   │   │       │
│   │   │       ├── agences/
│   │   │       │   └── page.tsx
│   │   │       ├── catalogue/
│   │   │       │   └── page.tsx
│   │   │       ├── catalogue-services/
│   │   │       │   └── page.tsx
│   │   │       ├── catalogue-trajets/
│   │   │       │   └── page.tsx
│   │   │       ├── commande-paiement/
│   │   │       │   └── page.tsx
│   │   │       ├── commandes/
│   │   │       │   ├── page.tsx
│   │   │       │   └── [id]/
│   │   │       │       └── page.tsx
│   │   │       ├── conciergerie/
│   │   │       │   └── page.tsx
│   │   │       ├── contacts/
│   │   │       │   ├── page.tsx
│   │   │       │   └── [id]/
│   │   │       │       └── page.tsx
│   │   │       ├── dossiers/
│   │   │       │   ├── page.tsx          # Secteur public — dossiers citoyens
│   │   │       │   └── [id]/
│   │   │       │       └── page.tsx
│   │   │       ├── inscriptions/
│   │   │       │   ├── page.tsx          # ✅ Secteur école — inscriptions & admissions
│   │   │       │   └── [id]/
│   │   │       │       └── page.tsx
│   │   │       ├── menu-digital/
│   │   │       │   └── page.tsx
│   │   │       ├── reservation-chambre/
│   │   │       │   └── page.tsx
│   │   │       ├── reservation-table/
│   │   │       │   └── page.tsx
│   │   │       └── reservations/
│   │   │           ├── page.tsx
│   │   │           └── [id]/
│   │   │               └── page.tsx
│   │   │
│   │   ├── auth-handoff/
│   │   │   └── page.tsx                  # Réception token cross-origin (S8)
│   │   │
│   │   ├── login/
│   │   │   └── page.tsx
│   │   │
│   │   ├── magic-link/
│   │   │   └── page.tsx
│   │   │
│   │   ├── pending/
│   │   │   └── page.tsx                  # En attente de vérification email
│   │   │
│   │   ├── reset-password/
│   │   │   └── page.tsx
│   │   │
│   │   └── verify-email/
│   │       └── page.tsx
│   │
│   ├── components/                       # Composants réutilisables partagés
│   │   │
│   │   ├── auth/
│   │   │   └── AuthShell.tsx             # Panneau gauche sectoriel (gradient, logo, tagline, stats)
│   │   │
│   │   ├── catalogue/
│   │   │   ├── CatalogueEditor.tsx
│   │   │   └── ItemForm.tsx
│   │   │
│   │   ├── commandes/
│   │   │   ├── CommandeCard.tsx
│   │   │   ├── CommandeFilters.tsx
│   │   │   ├── CommandeStatusBadge.tsx
│   │   │   └── CommandeStatusFlow.tsx
│   │   │
│   │   ├── contacts/
│   │   │   ├── CrmSignalChart.tsx
│   │   │   └── InteractionTimeline.tsx
│   │   │
│   │   ├── data/
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── dossiers/
│   │   │   ├── DossierCard.tsx
│   │   │   └── DossierStatusFlow.tsx
│   │   │
│   │   ├── forms/
│   │   │   ├── FormField.tsx
│   │   │   ├── SelectInput.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── inscriptions/
│   │   │   ├── DocumentsChecklist.tsx
│   │   │   ├── InscriptionCard.tsx
│   │   │   └── InscriptionStatusFlow.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx               # Sidebar principale — useSector() pour couleurs
│   │   │   ├── Sidebar.config.ts         # FEATURE_TO_ROUTE, DASHBOARD_ROUTES
│   │   │   ├── SidebarDynamicNav.tsx     # Nav dynamique selon features actives
│   │   │   ├── SidebarPinnedModules.tsx  # Modules épinglés + quotas (S9)
│   │   │   └── index.ts
│   │   │
│   │   ├── modules/
│   │   │   ├── ModuleHubTemplate.tsx     # Template générique hub module (S9)
│   │   │   ├── ModuleTabActive.tsx
│   │   │   ├── ModuleTabAvailable.tsx
│   │   │   └── ModuleTabUpgrade.tsx
│   │   │
│   │   ├── onboarding/
│   │   │   ├── AccountStep.tsx
│   │   │   ├── EmailCheckStep.tsx
│   │   │   ├── FeatureCard.tsx
│   │   │   ├── FeaturePicker.tsx
│   │   │   └── IdentityStep.tsx
│   │   │   └── SectorPicker.tsx          # Sélecteur secteur — couleurs depuis SECTOR_THEMES
│   │   │
│   │   ├── reservations/
│   │   │   ├── ReservationCard.tsx
│   │   │   ├── ReservationFilters.tsx
│   │   │   └── ressourcemanager/
│   │   │       ├── DisponibiliteGrid.tsx
│   │   │       ├── RessourceForm.tsx
│   │   │       └── index.ts
│   │   │
│   │   ├── sector/
│   │   │   ├── SectorBadge.tsx
│   │   │   ├── SectorNav.tsx             # Navigation modules sectoriels dans dashboard
│   │   │   └── index.ts
│   │   │
│   │   ├── settings/
│   │   │   ├── FeatureCard.tsx
│   │   │   └── FeatureGrid.tsx
│   │   │
│   │   ├── ui/
│   │   │   ├── PageHeader.tsx            # Props: title + subtitle (PAS description)
│   │   │   ├── ThemeProvider.tsx
│   │   │   ├── Toast.tsx                 # useToast() → {success, error, info, warning}
│   │   │   ├── Spinner.tsx (via index)
│   │   │   └── index.ts
│   │   │
│   │   ├── welcome/
│   │   │   ├── WelcomeScreen1.tsx
│   │   │   ├── WelcomeScreen2.tsx        # Sélection modules
│   │   │   ├── WelcomeScreen3.tsx        # NEW S9
│   │   │   └── WelcomeScreen4.tsx
│   │   │
│   │   ├── OnboardingBanner.tsx
│   │   └── SupportWidgets.tsx
│   │
│   ├── contexts/
│   │   ├── AuthContext.tsx               # Auth state + user (entreprise, secteur, features)
│   │   └── LanguageContext.tsx           # Locale (fr/en) + Dictionary type
│   │
│   ├── dictionaries/                     # i18n — FR + EN
│   │   │
│   │   ├── index.ts                      # getDict(lang) + t(lang, path)
│   │   ├── fr.ts                         # Point d'entrée → délègue à fr/index.ts
│   │   ├── en.ts                         # Point d'entrée → délègue à en/index.ts
│   │   │
│   │   ├── fr/
│   │   │   ├── index.ts                  # ⚠️ FICHIER CLÉ — importe et exporte tout
│   │   │   │                             #   À MODIFIER : ajouter import/export banking ✅ FAIT
│   │   │   │                             #   À MODIFIER : ajouter import/export school 🔴 À FAIRE
│   │   │   ├── common.fr.ts
│   │   │   ├── dashboard.fr.ts
│   │   │   ├── auth.fr.ts
│   │   │   ├── landing.fr.ts
│   │   │   ├── onboarding.fr.ts
│   │   │   ├── bots.fr.ts
│   │   │   ├── services.fr.ts
│   │   │   ├── reservations.fr.ts
│   │   │   ├── billing.fr.ts
│   │   │   ├── knowledge.fr.ts
│   │   │   ├── contacts.fr.ts
│   │   │   ├── conversations.fr.ts
│   │   │   ├── catalogue.fr.ts
│   │   │   ├── commandes.fr.ts
│   │   │   ├── profile.fr.ts
│   │   │   ├── feedback.fr.ts
│   │   │   ├── dossiers.fr.ts
│   │   │   ├── inscriptions.fr.ts
│   │   │   ├── nav.fr.ts
│   │   │   ├── errors.fr.ts
│   │   │   ├── plans.fr.ts
│   │   │   ├── pending.fr.ts
│   │   │   ├── verifyEmail.fr.ts
│   │   │   ├── resetPassword.fr.ts
│   │   │   ├── magicLink.fr.ts
│   │   │   ├── settings.fr.ts
│   │   │   ├── faq.fr.ts
│   │   │   ├── support.fr.ts
│   │   │   ├── help.fr.ts
│   │   │   ├── tutorial.fr.ts
│   │   │   ├── bug.fr.ts
│   │   │   ├── appointments.fr.ts
│   │   │   ├── restaurant.fr.ts          # ✅ Secteur restaurant
│   │   │   └── banking.fr.ts             # ✅ Secteur banking (S12)
│   │   │                                 # 🔴 school.fr.ts — À CRÉER
│   │   │
│   │   └── en/
│   │       ├── index.ts                  # ⚠️ FICHIER CLÉ — même structure que fr/index.ts
│   │       ├── common.en.ts
│   │       ├── dashboard.en.ts
│   │       ├── auth.en.ts
│   │       ├── landing.en.ts
│   │       ├── onboarding.en.ts
│   │       ├── bots.en.ts
│   │       ├── services.en.ts
│   │       ├── reservations.en.ts
│   │       ├── billing.en.ts
│   │       ├── knowledge.en.ts
│   │       ├── contacts.en.ts
│   │       ├── conversations.en.ts
│   │       ├── catalogue.en.ts
│   │       ├── commandes.en.ts
│   │       ├── profile.en.ts
│   │       ├── feedback.en.ts
│   │       ├── dossiers.en.ts
│   │       ├── inscriptions.en.ts
│   │       ├── nav.en.ts
│   │       ├── errors.en.ts
│   │       ├── plans.en.ts
│   │       ├── pending.en.ts
│   │       ├── verifyEmail.en.ts
│   │       ├── resetPassword.en.ts
│   │       ├── magicLink.en.ts
│   │       ├── settings.en.ts
│   │       ├── faq.en.ts
│   │       ├── support.en.ts
│   │       ├── help.en.ts
│   │       ├── tutorial.en.ts
│   │       ├── bug.en.ts
│   │       ├── appointments.en.ts
│   │       ├── restaurant.en.ts          # ✅ Secteur restaurant
│   │       └── banking.en.ts             # ✅ Secteur banking (S12)
│   │                                     # 🔴 school.en.ts — À CRÉER
│   │
│   ├── hooks/
│   │   ├── useConversation.ts
│   │   ├── useDebounce.ts
│   │   ├── useFeatures.ts                # useActiveFeatures(), useDesiredFeatures(), useSectorFeatures()
│   │   ├── useLanguage.ts
│   │   ├── useOnboarding.ts
│   │   └── useSector.ts                  # ⚠️ HOOK CANONIQUE — { sector, theme } — NE JAMAIS DUPLIQUER
│   │
│   ├── lib/
│   │   ├── api-client.ts                 # apiClient + tokenStorage
│   │   ├── constants.ts                  # ⚠️ FICHIER CLÉ — SECTOR_URLS, ROUTES, TOKEN_KEY
│   │   │                                 #   "ecole" → à renommer "school"  🔴
│   │   │                                 #   "clinique" → à renommer "clinical" (futur)
│   │   │                                 #   "voyage" → à renommer "transport" (futur)
│   │   ├── env.ts                        # ENV.SECTOR, ENV.API_URL — toujours passer par ENV
│   │   ├── feature-descriptions.ts       # Descriptions FR/EN par feature slug
│   │   ├── feature-icon-map.tsx          # Icônes Lucide par feature slug
│   │   ├── hub-modules.ts                # Config modules hub dashboard (S9)
│   │   ├── logo-config.ts                # ⚠️ FICHIER CLÉ — getLogoAssets(slug) + LOGO_MAP
│   │   │                                 #   clé "ecole" → à renommer "school"  🔴
│   │   │                                 #   clé "clinique" → à renommer "clinical" (futur)
│   │   │                                 #   clé "voyage" → à renommer "transport" (futur)
│   │   ├── sector-config.ts              # ✅ SectorSlug (type), SECTORS[], getCurrentSector()
│   │   │                                 #   Slugs canoniques : "school", "clinical", "transport"
│   │   ├── sector-content.ts             # ✅ Contenu marketing par secteur (tagline, stats, testimonial)
│   │   │                                 #   🔴 entrée "school" manquante — à ajouter
│   │   ├── sector-labels.ts              # getFeatureLabel(slug, lang) — labels nav/page
│   │   ├── sector-redirect.ts            # redirectAfterAuth(slug, tokens) — cross-origin
│   │   ├── sector-theme.ts               # ✅ SECTOR_THEMES — primary, accent, bg, defaultFeatures
│   │   └── utils.ts                      # cn(), initials(), etc.
│   │
│   ├── middleware.ts                     # Routes publiques / protégées
│   │
│   ├── repositories/                     # Couche accès API (pattern repository)
│   │   ├── index.ts                      # Export centralisé de tous les repositories
│   │   ├── agent.repository.ts
│   │   ├── agences.repository.ts
│   │   ├── auth.repository.ts
│   │   ├── bots.repository.ts
│   │   ├── catalogues.repository.ts
│   │   ├── commandes.repository.ts       # + billingActionsRepository
│   │   ├── contacts.repository.ts        # + politiquesRappelRepository
│   │   ├── conversations.repository.ts
│   │   ├── features.repository.ts
│   │   ├── feedback.repository.ts        # + onboardingRepository + tutorialRepository
│   │   ├── knowledge.repository.ts
│   │   ├── public-features.repository.ts
│   │   ├── reservations.repository.ts    # + ressourcesRepository
│   │   ├── tenants.repository.ts         # + secteursRepository
│   │   ├── users.repository.ts
│   │   └── mock/
│   │       ├── dossiers.mock.ts
│   │       └── inscriptions.mock.ts
│   │
│   └── types/
│       ├── onboarding.ts
│       └── api/
│           ├── index.ts                  # Export centralisé
│           ├── agence.types.ts           # Service, Agence, HorairesOuverture
│           ├── auth.types.ts
│           ├── billing.types.ts
│           ├── bot.types.ts
│           ├── catalogue.types.ts
│           ├── chatbot.types.ts
│           ├── commande.types.ts
│           ├── contact.types.ts
│           ├── conversation.types.ts
│           ├── crm.types.ts              # Dossier, Inscription, statuts
│           ├── feature.types.ts
│           ├── knowledge.types.ts
│           ├── reservation.types.ts
│           ├── service.types.ts
│           ├── shared.types.ts           # PaginatedResponse, etc.
│           ├── stats.types.ts
│           ├── user.types.ts
│           └── whatsapp.types.ts
│
├── tailwind.config.ts
├── next.config.js (ou .ts)
├── tsconfig.json
├── package.json                          # Scripts dev:school → port 3004
├── next-env.d.ts
└── .env.local                            # NEXT_PUBLIC_SECTOR, NEXT_PUBLIC_API_URL
```

---

## Légende

| Symbole | Signification |
|---------|--------------|
| ✅ | Complet et validé |
| 🔴 | À créer / À faire (session actuelle) |
| ⚠️ | Zone de désalignement slug ou risque |
| (S_N_) | Créé ou modifié en session N |

---

## Récapitulatif des désalignements slugs à corriger (TOUS SECTEURS)

> Stratégie proposée : corriger tous les secteurs en une seule passe (Étape 0 globale)
> plutôt que secteur par secteur — moins de risque d'oublier un callsite.

### Désalignements identifiés

| Secteur | Slug canonique (`sector-config.ts`) | Clé actuelle (`constants.ts`) | Clé actuelle (`logo-config.ts`) | Clé actuelle (`_email_urls.py`) |
|---------|-------------------------------------|-------------------------------|----------------------------------|----------------------------------|
| Éducation | `school` | `ecole` ⚠️ | `ecole` ⚠️ | `ecole` ⚠️ |
| Santé | `clinical` | `clinique` ⚠️ | `clinique` ⚠️ | `clinique` ⚠️ |
| Transport | `transport` | `voyage` ⚠️ | `voyage` ⚠️ | `voyage` ⚠️ |
| Banking | `banking` | `banking` ✅ | `banking` ✅ | `banking` ✅ |
| Restaurant | `restaurant` | `restaurant` ✅ | `restaurant` ✅ | `restaurant` ✅ |
| PME | `pme` | `pme` ✅ | `pme` ✅ | `pme` ✅ |
| Hôtel | `hotel` | `hotel` ✅ | `hotel` ✅ | `hotel` ✅ |
| E-commerce | `ecommerce` | `ecommerce` ✅ | `ecommerce` ✅ | `ecommerce` ✅ |
| Public | `public` | `public` ✅ | `public` ✅ | `public` ✅ |
| Custom | `custom` | `personnalise` ⚠️ | `personnalise` ⚠️ | *(pas d'URL)* |

### Fichiers frontend impactés par les désalignements

| Fichier | Clés à renommer |
|---------|----------------|
| `src/lib/constants.ts` | `ecole`→`school`, `clinique`→`clinical`, `voyage`→`transport` |
| `src/lib/logo-config.ts` | `ecole`→`school`, `clinique`→`clinical`, `voyage`→`transport` |
| `src/app/_components/landing/LandingData.ts` | id `ecole`→`school`, id `clinique`→`clinical`, id `voyage`→`transport` |
| `src/app/_components/landing/SectorsSection.tsx` | icônes `ecole`→`school`, `clinique`→`clinical`, `voyage`→`transport` |

### Fichier backend impacté

| Fichier | Clés à renommer |
|---------|----------------|
| `apps/auth_bridge/_email_urls.py` | `ecole`→`school`, `clinique`→`clinical`, `voyage`→`transport` |

> **Note :** `personnalise`/`custom` est un cas particulier — `custom` n'a pas d'URL sectorielle
> dédiée (redirige vers `/onboarding` directement). Vérifier si la clé `personnalise` dans
> `constants.ts` est utilisée comme slug ou comme id de carte uniquement.

---

*Arborescence générée en session 14 — donpk*
*Source : `contexte_frontend_PME.txt` intégral + sessions 2 à 13*