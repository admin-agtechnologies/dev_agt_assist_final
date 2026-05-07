# AGT Frontend — TODO

## Phase 0 — Socle (séquentiel, bloquant — tout le monde attend)

### 0.1 — Mise en place physique + audit

- [x] **0-A : Création physique de l'arborescence complète**
  > Créer tous les dossiers et fichiers de la structure cible. Personne ne peut travailler sans ça.
  - [x] Créer toute l'arborescence avec des fichiers stub
  - [x] Chaque fichier contient juste un export vide ou un `// TODO`
  - [x] Les `index.ts` contiennent déjà tous les re-exports (même si le fichier cible est vide)
  - [x] Vérifier que `tsconfig.json` a les paths aliases (`@/types`, `@/repositories`, `@/components/ui`, `@/dictionaries`)
  - [x] `npx tsc --noEmit` → zéro erreur de chemin

- [x] **0-B : Audit & modularisation du code existant**
  > Nettoyer le code actuel sans toucher à la logique ni aux appels API. Ce qui marchait doit continuer à marcher.
  - [x] Identifier tous les fichiers > 260 lignes → les découper en sous-composants
  - [x] Supprimer tout texte en dur → déplacer dans `dictionaries/fr/` et `dictionaries/en/`
  - [x] Supprimer le code mort (composants non utilisés, imports inutiles)
  - [x] Vérifier que tous les imports utilisent les nouveaux aliases (`@/types`, etc.)
  - [x] `npx tsc --noEmit` → zéro erreur avant de continuer
  - [x] Test de non-régression : tous les modules existants fonctionnent identiquement

---

### 0.2 — Socle technique + composants partagés

- [x] **0-C : Socle technique**
  > Tout le code infrastructure dont dépendent tous les modules. À finir avant que quiconque touche à un module.
  - [x] `types/api/` — un fichier par domaine (`feature`, `catalogue`, `reservation`, `commande`, `contact`, `conversation`, `agence`, `user`) + `index.ts` qui re-exporte tout
  - [x] `lib/env.ts` — variables d'environnement typées (`ENV.API_URL`, `ENV.SECTOR`)
  - [x] `lib/api-client.ts` — fetch helper avec JWT + refresh token
  - [x] `lib/sector-config.ts` — `getCurrentSector()`, `SectorSlug`, `SUBDOMAIN_MAP`
  - [x] `lib/sector-theme.ts` — palettes de couleurs par secteur, `useSector()`
  - [x] `lib/sector-labels.ts` — labels métier par feature slug, `getFeatureLabel()`
  - [x] `lib/sector-configs/` — 10 fichiers secteur avec `defaultFeatures[]` et thème
  - [x] `hooks/useFeatures.ts` — `useActiveFeatures()`, `useHasFeature(slug)`
  - [x] `hooks/useSector.ts` — secteur courant + thème
  - [x] `hooks/useLanguage.ts` — langue active FR/EN
  - [x] `hooks/useConversation.ts` — polling conversation agent IA
  - [x] `dictionaries/fr/` — un fichier par module + `common.fr.ts` + `index.ts`
  - [x] `dictionaries/en/` — même structure
  - [x] `dictionaries/index.ts` — re-exporte fr et en, expose `t(lang, key)`
  - [x] `repositories/` — un fichier par domaine + `mock/` + `index.ts`

- [x] **0-D : Composants UI partagés**
  > Briques de base consommées par tous les modules. Zéro logique métier, zéro texte en dur.
  - [x] `StatusBadge` — badge coloré par statut, couleur pilotée par config
  - [x] `StatusFlow` — boutons de transition de statut, actions passées en props
  - [x] `DataTable` — liste générique avec pagination et slot filtres
  - [x] `FilterBar` — filtres statut/date, valeurs passées en props
  - [x] `PageHeader` — titre de page + bouton CTA, textes via dictionnaire
  - [x] `EmptyState` — état vide générique, message via dictionnaire
  - [x] `DetailCard` — fiche de détail avec slots configurables
  - [x] `Modal` / `ConfirmDialog` — modale générique avec actions en props
  - [x] `components/ui/index.ts` re-exporte tout
  - [x] Zéro texte en dur dans ces composants
  - [x] Zéro logique métier dans ces composants

---

## Phase 1 — Modules base (parallèle, débloqué après Phase 0)

- [x] **1.1 — Dashboard + layout shell**
  > Shell principal de l'application. Charge le thème sectoriel, injecte les CSS variables, affiche la navigation dynamique selon les features actives.
  - [x] `app/(dashboard)/layout.tsx` — charge thème + injecte CSS variables
  - [x] `components/layout/Sidebar.tsx` — navigation filtrée par features actives
  - [x] `components/layout/Header.tsx` — header avec user menu
  - [x] `app/(dashboard)/page.tsx` — dashboard avec widgets dynamiques selon features

- [ ] **1.2 — Conversations + Agent IA**
  > Liste et détail des conversations avec l'agent IA. Polling toutes les 2 secondes pour les messages en cours.
  - [x] `app/(dashboard)/conversations/page.tsx` — liste conversations
  - [x] `app/(dashboard)/conversations/[id]/page.tsx` — détail avec polling
  - [x] `components/conversations/MessageBubble.tsx`
  - [x] `components/conversations/StatusMessage.tsx`
  - [x] `components/conversations/ConversationStatus.tsx`
  - [ ] `repositories/conversations.repository.ts` — branché sur API réelle

- [ ] **1.3 — Contacts / CRM**
  > Gestion des contacts et prospects du tenant. CRM signals et historique d'interactions.
  - [ ] `app/(dashboard)/contacts/page.tsx` — liste contacts + prospects
  - [ ] `app/(dashboard)/contacts/[id]/page.tsx` — fiche contact avec historique
  - [ ] `components/contacts/ContactCard.tsx`
  - [ ] `components/contacts/InteractionTimeline.tsx`
  - [ ] `components/contacts/CRMSignalChart.tsx`
  - [ ] `repositories/contacts.repository.ts` — branché sur API réelle

- [ ] **1.4 — Settings + Billing + FAQ + Bots**
  > Modules de configuration et gestion du compte. Feature toggles, abonnement, base de connaissances, gestion des bots.
  - [ ] `app/(dashboard)/settings/page.tsx` — feature toggles + config tenant
  - [ ] `app/(dashboard)/billing/page.tsx` — abonnement + historique paiements
  - [ ] `app/(dashboard)/faq/page.tsx` — base de connaissances
  - [ ] `app/(dashboard)/bots/page.tsx` — gestion bots WhatsApp
  - [ ] `repositories/agences.repository.ts` — branché sur API réelle

---

## Phase 2 — Modules génériques (parallèle, débloqué après Phase 0)

- [ ] **2.1 — Catalogue**
  > Module générique utilisé par 8 features différentes (menu, produits, trajets, services...). Le label et le CTA changent selon la feature active, le composant est identique.
  - [ ] `app/(dashboard)/modules/catalogue/page.tsx` — liste catalogues
  - [ ] `app/(dashboard)/modules/catalogue/[id]/page.tsx` — détail avec catégories et items
  - [ ] `components/catalogue/CatalogueCard.tsx`
  - [ ] `components/catalogue/CatalogueEditor.tsx`
  - [ ] `components/catalogue/CategorySection.tsx`
  - [ ] `components/catalogue/ItemCard.tsx`
  - [ ] `components/catalogue/ItemForm.tsx`
  - [ ] `repositories/catalogues.repository.ts` — branché sur API réelle

- [ ] **2.2 — Réservations + Ressources**
  > Module générique pour reservation_table, reservation_chambre, reservation_billet, prise_rdv. La ressource (table/chambre/praticien) et les labels changent selon la feature.
  - [ ] `app/(dashboard)/modules/reservations/page.tsx`
  - [ ] `app/(dashboard)/modules/reservations/[id]/page.tsx`
  - [ ] `components/reservations/ReservationCard.tsx`
  - [ ] `components/reservations/ReservationFilters.tsx`
  - [ ] `components/reservations/RessourceManager/index.tsx`
  - [ ] `components/reservations/RessourceManager/RessourceForm.tsx`
  - [ ] `components/reservations/RessourceManager/DisponibiliteGrid.tsx`
  - [ ] `repositories/reservations.repository.ts` — branché sur API réelle

- [ ] **2.3 — Commandes**
  > Module générique pour commande_paiement, conciergerie, suivi_commande. Workflow de statuts configurable.
  - [ ] `app/(dashboard)/modules/commandes/page.tsx`
  - [ ] `app/(dashboard)/modules/commandes/[id]/page.tsx`
  - [ ] `components/commandes/CommandeCard.tsx`
  - [ ] `components/commandes/CommandeStatusBadge.tsx`
  - [ ] `components/commandes/CommandeStatusFlow.tsx`
  - [ ] `components/commandes/CommandeFilters.tsx`
  - [ ] `repositories/commandes.repository.ts` — branché sur API réelle

- [ ] **2.4 — Sector-configs × 10 + dictionaries complets**
  > Préconfiguration de chaque secteur (features par défaut, thème, labels) et traductions complètes FR/EN pour tous les modules.
  - [ ] `lib/sector-configs/hotel.ts` — defaultFeatures + thème bleu marine/or
  - [ ] `lib/sector-configs/restaurant.ts` — defaultFeatures + thème bordeaux/orange
  - [ ] `lib/sector-configs/pme.ts`
  - [ ] `lib/sector-configs/banking.ts`
  - [ ] `lib/sector-configs/clinical.ts`
  - [ ] `lib/sector-configs/school.ts`
  - [ ] `lib/sector-configs/ecommerce.ts`
  - [ ] `lib/sector-configs/transport.ts`
  - [ ] `lib/sector-configs/public.ts`
  - [ ] `lib/sector-configs/custom.ts` — defaultFeatures vide, tout activable
  - [ ] Compléter `dictionaries/fr/` et `dictionaries/en/` pour tous les modules

---

## Phase 3 — Modules optionnels (parallèle, débloqué après Phase 0)

- [ ] **3.1 — Inscriptions (school)**
  > Module spécifique au secteur éducation. Branché sur JSON Server mock tant que le backend n'est pas prêt.
  - [ ] `app/(dashboard)/modules/inscriptions/page.tsx`
  - [ ] `app/(dashboard)/modules/inscriptions/[id]/page.tsx`
  - [ ] `components/inscriptions/InscriptionCard.tsx`
  - [ ] `components/inscriptions/DocumentsChecklist.tsx`
  - [ ] `components/inscriptions/InscriptionStatusFlow.tsx`
  - [ ] `repositories/mock/inscriptions.mock.ts` + `db.json`

- [ ] **3.2 — Dossiers citoyens (public)**
  > Module spécifique au secteur public. Branché sur JSON Server mock tant que le backend n'est pas prêt.
  - [ ] `app/(dashboard)/modules/dossiers/page.tsx`
  - [ ] `app/(dashboard)/modules/dossiers/[id]/page.tsx`
  - [ ] `components/dossiers/DossierCard.tsx`
  - [ ] `components/dossiers/DossierStatusFlow.tsx`
  - [ ] `repositories/mock/dossiers.mock.ts` + `db.json`

- [ ] **3.3 — Onboarding / feature picker (custom)**
  > Écran de sélection de features pour le secteur custom et la première connexion de tout nouveau tenant. Communique avec le backend pour persister les choix.
  - [ ] `app/(auth)/onboarding/page.tsx` — choix du secteur
  - [ ] `components/onboarding/SectorPicker.tsx` — grille des secteurs disponibles
  - [ ] `components/onboarding/FeaturePicker.tsx` — sélection modules selon abonnement
  - [ ] `components/onboarding/FeatureCard.tsx` — carte d'une feature avec description
  - [ ] Branché sur `repositories/features.repository.ts` pour persister les choix

---

## Phase 4 — Intégration & déploiement (séquentiel, bloquant)

- [ ] **4.1 — Intégration secteurs + CI/CD**
  > Valider chaque secteur de bout en bout, brancher les modules optionnels sur le backend réel, mettre en place les pipelines de déploiement.
  - [ ] Brancher chaque `.env` sectoriel et valider visuellement (couleurs, labels, navigation)
  - [ ] Tester chaque feature toggle — module apparaît/disparaît correctement
  - [ ] Connecter modules optionnels (inscriptions, dossiers) au backend réel quand prêt
  - [ ] Audit final : zéro fichier > 260 lignes, zéro texte en dur, `npx tsc --noEmit` propre
  - [ ] CI/CD — un pipeline par secteur
  - [ ] Documentation déploiement — ajouter un secteur en 30 minutes