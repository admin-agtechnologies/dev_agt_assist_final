# TODO_SCHOOL — Secteur Éducation (FINALE)
> **Membre actif : donpk**
> **Dernière mise à jour : Session 14**
> Slug : `school` | Port : `3004` | Prod : `school.agt-bot.com`
> Couleurs : `primary #3A0CA3` · `accent #6D28D9` · `bg #F8F0FF`
> Compte de test : `schoolone@demo.cm / Pme@2024!`
> Lancement : `NEXT_PUBLIC_SECTOR=school npm run dev -- --port 3004`
> Contrainte absolue : **communications parents/élèves = email uniquement, jamais WhatsApp proactif**

---

## LÉGENDE
- ✅ = Fait et vérifié dans le code
- 🔴 = À faire
- ⚠️ = Point de vigilance
- ⏸️ = En pause (décision explicite)

---

## ÉTAPE 0 — Correction des slugs

- [x] ✅ `src/lib/constants.ts` — `"ecole"` → `"school"`
- [x] ✅ `src/lib/logo-config.ts` — `"ecole"` → `"school"`
- [x] ✅ `apps/auth_bridge/_email_urls.py` — `"ecole"` → `"school"`
- [x] ✅ `src/app/_components/landing/LandingData.ts` — id `"ecole"` → `"school"`
- [x] ✅ `src/app/_components/landing/SectorsSection.tsx` — icône `ecole` → `school`

> **Note restante :** `"clinique"` → `"clinical"` et `"voyage"` → `"transport"` non encore traités.
> Ces corrections sont reportées aux sessions Santé et Transport.

---

## PRÉ-REQUIS

- [ ] 🔴 Backend Django opérationnel (`python manage.py runserver`)
- [ ] 🔴 Seed école : `python manage.py seed_school` *(vérifier si existe, créer si absent)*
- [ ] 🔴 Login `schoolone@demo.cm / Pme@2024!` fonctionne
- [ ] 🔴 Port 3004 libre

---

## F1 — Landing centrale (hub) — Vérification rapide

- [ ] 🔴 Lancer hub : `NEXT_PUBLIC_SECTOR=hub npm run dev -- --port 3000`
- [ ] 🔴 Carte "Éducation" présente dans `SectorsSection` avec id `"school"` ✅ (corrigé Étape 0)
- [ ] 🔴 Clic carte → redirige vers `localhost:3004`
- [ ] 🔴 Logo École visible dans la carte
- [ ] 🔴 Favicon hub inchangé ✅

> _Notes :_

---

## F2 — Landing sectorielle École

### Dictionnaires i18n
- [x] ✅ `src/dictionaries/fr/school.fr.ts` — créé avec `as const`
- [x] ✅ `src/dictionaries/en/school.en.ts` — créé avec `as const`
- [x] ✅ `src/dictionaries/fr/index.ts` — `school` branché
- [x] ✅ `src/dictionaries/en/index.ts` — `school` branché

> ⚠️ **Point de vigilance :** import écrit `import {school}` sans espace dans `fr/index.ts`.
> Non bloquant TypeScript, mais à corriger pour cohérence de style au prochain passage.

### Composants landing
- [x] ✅ `src/app/_components/sector/school/SchoolHero.tsx`
  - Carrousel 4 slides, violet `#3A0CA3` / `#6D28D9`
  - Images Unsplash éducation
  - `style={{}}` complexes extraits en `React.CSSProperties` ✅
- [x] ✅ `src/app/_components/sector/school/SchoolFeatures.tsx`
  - 6 features, icônes Lucide (`GraduationCap`, `CalendarDays`, `Mail`, `BookOpen`...)
- [x] ✅ `src/app/_components/sector/school/SchoolLandingContent.tsx`
  - Pattern `BankingLandingContent.tsx` respecté
  - Stats : 10k+ | 24/7 | 98% | 3x
  - Sections : Hero + Features + Stats + Testimonials + CTA + Footer

### Routing
- [x] ✅ `src/app/page.tsx` — `case "school": return <SchoolLandingContent />;`
- [x] ✅ Métadonnées SEO school ajoutées dans `METADATA`
  - canonical : `https://school.agt-bot.com`
  - title : "AGT-BOT École — Admissions & Communication IA"

### Validation F2
- [ ] 🔴 `npx tsc --noEmit` → 0 erreur *(à vérifier sur ta machine)*
- [ ] 🔴 Lancer `NEXT_PUBLIC_SECTOR=school npm run dev -- --port 3004`
- [ ] 🔴 Vérification visuelle : hero violet, 4 slides, features école, logo dans navbar
- [ ] 🔴 Responsive mobile validé
- [ ] 🔴 0 régression restaurant (port 3001) et banking (port 3002)

> _Notes :_

---

## F3 — Onboarding sectoriel École

- [ ] 🔴 Depuis hub → clic carte École → `localhost:3004/onboarding`
- [ ] 🔴 **SectorPicker** : carte "Éducation" avec couleurs `#3A0CA3` / `#6D28D9`
- [ ] 🔴 Sélection → `localStorage.agt_sector = "school"`
- [ ] 🔴 Features pré-cochées depuis `SECTOR_THEMES.school.defaultFeatures` :
  - `inscription_admission`, `prise_rdv`, `communication_etablissement`, `catalogue_services`
- [ ] 🔴 **IdentityStep** : champ nom de l'établissement renseigné
- [ ] 🔴 **AccountStep** : plan sélectionné, features école dans récapitulatif
- [ ] 🔴 **Paiement** : sandbox → succès → génération agent
- [ ] 🔴 **Redirection** : `redirectAfterAuth("school", tokens)` → `localhost:3004/dashboard`

> _Notes :_

---

## F4 — Inscription nouveau compte École

- [ ] 🔴 `/onboarding` port 3004 — secteur École pré-sélectionné
- [ ] 🔴 Email de vérification reçu — lien pointe vers `localhost:3004`
  - ⚠️ Dépend de la correction `_email_urls.py` ✅ déjà faite
- [ ] 🔴 Clic lien → `/verify-email` → redirect dashboard école
- [ ] 🔴 `localStorage.agt_sector = "school"` persisté

> _Notes :_

---

## F5 — Login / Logout / Reset

- [ ] 🔴 `/login` port 3004 → panneau gauche violet école
  - Tagline depuis `SECTOR_CONTENT.school`
  - ⚠️ Vérifier que l'entrée `school` existe dans `src/lib/sector-content.ts`
    - Le rapport S14 indique "déjà créé en S5" — **à confirmer visuellement**
- [ ] 🔴 Login `schoolone@demo.cm / Pme@2024!` → dashboard école
- [ ] 🔴 Logout → `/login` thème violet conservé
- [ ] 🔴 Reset password → email avec thème violet école
- [ ] 🔴 Accès dashboard sans token → redirect `/login`

### Si `sector-content.ts` entrée `school` absente — diff à appliquer
```ts
// Ajouter dans SECTOR_CONTENT de src/lib/sector-content.ts :
school: {
  taglineFr: "Votre établissement, toujours disponible.",
  taglineEn: "Your school, always reachable.",
  descriptionFr: "Des dizaines d'établissements gèrent leurs admissions avec AGT.",
  descriptionEn: "Dozens of institutions manage their admissions with AGT.",
  stats: [
    { valueFr: "10 000+", valueEn: "10,000+", labelFr: "inscriptions traitées", labelEn: "enrollments processed" },
    { valueFr: "200+",    valueEn: "200+",    labelFr: "RDV admission / mois",  labelEn: "admission appts / month" },
    { valueFr: "98%",     valueEn: "98%",     labelFr: "taux de réponse",       labelEn: "response rate" },
  ],
  testimonial: {
    quote: "Nos admissions sont désormais gérées 24h/24. Les familles adorent la réactivité.",
    quoteEn: "Our admissions are now managed 24/7. Families love the responsiveness.",
    author: "Dr. Nkemdirim Ayuk",
    role: "Directeur, Institut Supérieur de Yaoundé",
    initials: "NA",
  },
  badgeFr: "Secteur Éducation",
  badgeEn: "Education Sector",
},
```

> _Notes :_

---

## F6 — Dashboard first contact

- [ ] 🔴 Dashboard thème école (`#3A0CA3` / `#6D28D9`)
- [ ] 🔴 Sidebar : libellé "Éducation" visible
- [ ] 🔴 SectorNav : modules école affichés :
  - `inscription_admission` → `/modules/inscriptions`
  - `prise_rdv` → `/modules/reservations`
  - `communication_etablissement` → `/modules/catalogue`
  - `catalogue_services` → `/modules/catalogue`
- [ ] 🔴 Page `/welcome` : étapes cohérentes pour un établissement
- [ ] 🔴 0 régression restaurant et banking

> _Notes :_

---

## F7 — Configuration métier École ⏸️

> **Statut : EN PAUSE** — Décision prise en S14 : avancer d'abord sur les landings
> des autres secteurs (E-commerce, Hotel, Transport, Clinical, Public, PME).
> Reprendre F7-F10 School après que tous les landings sectoriels soient faits.

- [ ] ⏸️ **Formations / Cursus — Ajout** : nom, niveau, durée, frais, documents requis, statut
- [ ] ⏸️ **Formations — Modifier / Désactiver / Supprimer**
- [ ] ⏸️ **Calendrier des admissions** : périodes ouvertures, année scolaire, respect par l'agent
- [ ] ⏸️ **Modèles de communication email** : variables `{nom_etudiant}`, `{filiere}`, etc.
  - ⚠️ Communications proactives = email uniquement, JAMAIS WhatsApp
- [ ] ⏸️ **FAQ Éducation** : prérequis, frais, débouchés, procédure retrait
- [ ] ⏸️ **Paramètres agent** : nom, ton formel, garde-fou résultats individuels

---

## F8 — Test agent IA École ⏸️

> **Statut : EN PAUSE** — même décision que F7.

- [ ] ⏸️ **A** — "Quelles sont les formations disponibles ?"
- [ ] ⏸️ **B** — "Je veux m'inscrire en Master Informatique" → `CreateInscriptionAction`
- [ ] ⏸️ **C** — "Prendre RDV service admission" → créneau → persistance BDD
- [ ] ⏸️ **D** — "Mon enfant est-il admis ?" → agent refuse, redirige
  - ⚠️ Garde-fou OBLIGATOIRE dans les instructions agent
- [ ] ⏸️ **E** — "Annonce portes ouvertes" → email déclenché
- [ ] ⏸️ WAHA : scénarios A et B — vérifier absence de WhatsApp proactif

---

## F9 — Suivi post-interaction ⏸️

> **Statut : EN PAUSE** — même décision que F7.

- [ ] ⏸️ Inscription visible dans `/modules/inscriptions` statut `"soumise"`
- [ ] ⏸️ Transitions : `soumise` → `en_etude` → `acceptee` ou `refusee`
- [ ] ⏸️ RDV visible agenda, isolation multi-agences
- [ ] ⏸️ Notification email au service admission
- [ ] ⏸️ Stats : demandes/formation, RDV/mois, taux acceptation

---

## F10 — Validation finale ⏸️

> **Statut : EN PAUSE** — reprendre quand F7-F9 sont terminés.

- [ ] ⏸️ `npx tsc --noEmit` → 0 erreur TypeScript
- [ ] ⏸️ 0 régression restaurant, banking, ecommerce
- [ ] ⏸️ Responsive mobile validé (landing + dashboard)
- [ ] ⏸️ Logo École SVG transparent dans navbar
- [ ] ⏸️ Favicon École affiché sur port 3004
- [ ] ⏸️ Redirect post-auth → `localhost:3004`

---

## BUG LOG — École

| ID | Flux | Description | Sévérité | F/B | Statut |
|----|------|-------------|----------|-----|--------|
| Sc-W01 | F2 | Import `{school}` sans espace dans `fr/index.ts` | cosmétique | F | ouvert |
| Sc-001 | | | | | |

---

## TABLEAU DES FICHIERS — ÉTAT FINAL

| Fichier | Action | Statut |
|---------|--------|--------|
| `src/lib/constants.ts` | `"ecole"` → `"school"` | ✅ Fait |
| `src/lib/logo-config.ts` | `"ecole"` → `"school"` | ✅ Fait |
| `apps/auth_bridge/_email_urls.py` | `"ecole"` → `"school"` | ✅ Fait |
| `src/app/_components/landing/LandingData.ts` | id `"ecole"` → `"school"` | ✅ Fait |
| `src/app/_components/landing/SectorsSection.tsx` | icône `ecole` → `school` | ✅ Fait |
| `src/dictionaries/fr/school.fr.ts` | Créé avec `as const` | ✅ Fait |
| `src/dictionaries/en/school.en.ts` | Créé avec `as const` | ✅ Fait |
| `src/dictionaries/fr/index.ts` | `school` branché | ✅ Fait |
| `src/dictionaries/en/index.ts` | `school` branché | ✅ Fait |
| `src/app/_components/sector/school/SchoolHero.tsx` | Créé | ✅ Fait |
| `src/app/_components/sector/school/SchoolFeatures.tsx` | Créé | ✅ Fait |
| `src/app/_components/sector/school/SchoolLandingContent.tsx` | Créé | ✅ Fait |
| `src/app/page.tsx` | cas `"school"` + metadata SEO | ✅ Fait |
| `src/lib/sector-content.ts` | entrée `school` | ⚠️ À vérifier (dit fait en S5) |
| `apps/management/commands/seed_school.py` | À créer si absent | 🔴 À vérifier |

---

## PROCHAINES ÉTAPES (après validation F1-F6)

```
Une fois F1→F6 School validés visuellement :

1. Passer à E-commerce (TODO_ECOMMERCE.md — Session 15)
   └─ Même workflow : Étape 0 slugs → Dicos → Composants → Routing

2. Puis Hotel, Transport, Clinical, Public, PME
   (dans l'ordre de la TODO_TEST_DEBUG_AGT.md)

3. Revenir sur School F7→F10 quand tous les landings sont faits
```

---

*TODO School finale — donpk — Session 14*
*Code source vérifié après travail avec agent externe*
*Patron : Banking (S12) — Rapport de session S14 validé*