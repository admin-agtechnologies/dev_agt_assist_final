# TODO_ECOMMERCE — Secteur E-commerce (FINALE)
> **Membre actif : donpk**
> **Session 15**
> Slug : `ecommerce` | Port : `3005` | Prod : `e-commerce.agt-bot.com`
> Couleurs : `primary #E63946` · `accent #E63946` · `bg #FFF5F5`
> Compte de test : `ecommerceone@demo.cm / Pme@2024!`
> Lancement : `NEXT_PUBLIC_SECTOR=ecommerce npm run dev -- --port 3005`
> Patron : secteur School (S14) + Banking (S12)

---

## LÉGENDE
- ✅ = Fait et vérifié dans le code
- 🔴 = À faire
- ⚠️ = Point de vigilance
- ⏸️ = En pause (décision explicite)

---

## ÉTAPE 0 — Vérification slugs

- [x] ✅ `constants.ts` — clé `ecommerce` présente avec port `3005`
- [x] ✅ `logo-config.ts` — clé `ecommerce` présente
- [x] ✅ `LandingData.ts` — id `ecommerce` présent dans `SECTORS`
- [x] ✅ `SectorsSection.tsx` — icône `ecommerce: ShoppingCart` présente
- [x] ✅ `_email_urls.py` — clé `ecommerce` présente avec port `3005`
- [x] ✅ `sector-theme.ts` — entrée `ecommerce` complète (`#E63946`)
- [x] ✅ `sector-content.ts` — entrée `ecommerce` complète (ajoutée en S5)

> Aucune correction de slug nécessaire pour E-commerce. Tout était aligné dès le départ.

---

## PRÉ-REQUIS

- [ ] 🔴 Backend Django opérationnel (`python manage.py runserver`)
- [ ] 🔴 Seed e-commerce : `python manage.py seed_ecommerce` *(vérifier si existe, créer si absent)*
- [ ] 🔴 Login `ecommerceone@demo.cm / Pme@2024!` fonctionne
- [ ] 🔴 Port 3005 libre

---

## F1 — Landing centrale (hub) — Vérification rapide

- [ ] 🔴 Lancer hub : `NEXT_PUBLIC_SECTOR=hub npm run dev -- --port 3000`
- [ ] 🔴 Carte "E-commerce" présente dans `SectorsSection` avec id `ecommerce` ✅
- [ ] 🔴 Clic carte → redirige vers `localhost:3005`
- [ ] 🔴 Logo E-commerce visible dans la carte
- [ ] 🔴 Favicon hub inchangé ✅

> _Notes :_

---

## F2 — Landing sectorielle E-commerce

> **Flux principal. Patron exact : `src/app/_components/sector/school/`**

### Dictionnaires i18n

- [ ] 🔴 Créer `src/dictionaries/fr/ecommerce.fr.ts`
  - Pattern exact : `banking.fr.ts` et `school.fr.ts` — clés plates, `as const` obligatoire
  - Clés : `featuresTag`, `featuresTitle`
  - Clés features (6) : `feature1Title`…`feature6Title`, `feature1Desc`…`feature6Desc`
  - Features : Catalogue produits, Commande & Paiement, Suivi de commande,
    Conversion prospects, Support client 24/7, Relance panier abandonné
  - Icônes Lucide : `ShoppingCart`, `CreditCard`, `Package`, `TrendingUp`, `MessageCircle`, `RefreshCcw`
  - Clés stats : `stat1Label`, `stat2Label`, `stat3Label`, `stat4Label`
  - Clés témoignages : `testimonial1Quote`, `testimonial1Author`, `testimonial1Role`,
    `testimonial2Quote`, `testimonial2Author`, `testimonial2Role`
  - Clés CTA : `ctaTitle`, `ctaSubtitle`, `ctaBtn`, `ctaLogin`
  - Contenu : boutiques camerounaises, ventes WhatsApp, paniers abandonnés
  - ⚠️ Terminer par `} as const;`

- [ ] 🔴 Créer `src/dictionaries/en/ecommerce.en.ts` (traduction complète, `as const`)

- [ ] 🔴 Modifier `src/dictionaries/fr/index.ts` — ajouter APRÈS la ligne banking :
  ```ts
  import { ecommerce } from "./ecommerce.fr";
  ```
  Et dans `export const fr = {` ajouter :
  ```ts
  ecommerce,
  ```

- [ ] 🔴 Modifier `src/dictionaries/en/index.ts` — même opération avec `ecommerce.en`

- [ ] 🔴 Vérifier `src/contexts/LanguageContext.tsx` — ajouter `ecommerce?` au type `Dictionary` si nécessaire

### Composants landing

- [ ] 🔴 Créer `src/app/_components/sector/ecommerce/EcommerceHero.tsx`
  - Carrousel 4 slides, rouge `#E63946`
  - Images Unsplash e-commerce / boutiques africaines
  - Slides : Catalogue produits | Suivi commandes | Relance panier | Support 24/7
  - Badge : "Commerce en ligne"
  - CTA → `ROUTES.onboarding` (import depuis `@/lib/constants`)
  - ⚠️ Tous les `style={{}}` complexes extraits en `React.CSSProperties` avant le `return`

- [ ] 🔴 Créer `src/app/_components/sector/ecommerce/EcommerceFeatures.tsx`
  - Grille 6 features, couleur `#E63946`
  - Icônes : `ShoppingCart`, `CreditCard`, `Package`, `TrendingUp`, `MessageCircle`, `RefreshCcw`
  - Pattern exact : `SchoolFeatures.tsx`

- [ ] 🔴 Créer `src/app/_components/sector/ecommerce/EcommerceLandingContent.tsx`
  - Assemble : EcommerceHero + EcommerceFeatures + Stats + Testimonials + CTA + Footer
  - `const logo = getLogoAssets("ecommerce")`
  - `const PRIMARY = "#E63946"` · `const ACCENT = "#E63946"`
  - Footer fond sombre e-commerce : `bgColor="#3D0000"` (à ajuster selon logo)
  - Pattern exact : `SchoolLandingContent.tsx`

### Routing

- [ ] 🔴 Modifier `src/app/page.tsx` — ajouter le cas `"ecommerce"` dans `SectorPage()` :
  ```ts
  case "ecommerce": return <EcommerceLandingContent />;
  ```
  ⚠️ Ne pas casser `restaurant`, `banking`, `school` déjà présents

- [ ] 🔴 Ajouter métadonnées SEO dans `METADATA` de `page.tsx` :
  ```ts
  ecommerce: {
    title: "AGT-BOT E-commerce — Catalogue, Commandes & Suivi IA",
    description: "Automatisez votre boutique : catalogue interactif, suivi commandes et relance panier sans code.",
    alternates: { canonical: "https://e-commerce.agt-bot.com" },
    openGraph: {
      url: "https://e-commerce.agt-bot.com",
      title: "AGT-BOT E-commerce — Catalogue, Commandes & Suivi IA",
      description: "Automatisez votre boutique en ligne avec l'IA.",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "AGT-BOT E-commerce" }],
    },
  },
  ```

### Validation F2

- [ ] 🔴 `npx tsc --noEmit` → 0 erreur
- [ ] 🔴 Lancer `NEXT_PUBLIC_SECTOR=ecommerce npm run dev -- --port 3005`
- [ ] 🔴 Vérification visuelle : hero rouge, 4 slides, features e-commerce, logo dans navbar
- [ ] 🔴 Responsive mobile validé
- [ ] 🔴 0 régression restaurant (port 3001), banking (port 3002), school (port 3004)

> _Notes :_

---

## F3 — Onboarding sectoriel E-commerce

- [ ] 🔴 Depuis hub → clic carte E-commerce → `localhost:3005/onboarding`
- [ ] 🔴 **SectorPicker** : carte "E-commerce" avec couleur `#E63946`
- [ ] 🔴 Sélection → `localStorage.agt_sector = "ecommerce"`
- [ ] 🔴 Features pré-cochées depuis `SECTOR_THEMES.ecommerce.defaultFeatures` :
  `catalogue_produits`, `commande_paiement`, `suivi_commande`, `conversion_prospects`
- [ ] 🔴 **IdentityStep** : champ nom de la boutique renseigné
- [ ] 🔴 **AccountStep** : plan sélectionné, features e-commerce dans récapitulatif
- [ ] 🔴 **Paiement** : sandbox → succès → génération agent
- [ ] 🔴 **Redirection** : `redirectAfterAuth("ecommerce", tokens)` → `localhost:3005/dashboard`

> _Notes :_

---

## F4 — Inscription nouveau compte E-commerce

- [ ] 🔴 `/onboarding` port 3005 — secteur E-commerce pré-sélectionné
- [ ] 🔴 Email de vérification reçu — lien pointe vers `localhost:3005`
- [ ] 🔴 Clic lien → `/verify-email` → redirect dashboard e-commerce
- [ ] 🔴 `localStorage.agt_sector = "ecommerce"` persisté

> _Notes :_

---

## F5 — Login / Logout / Reset

- [ ] 🔴 `/login` port 3005 → panneau gauche rouge e-commerce
  - Tagline depuis `SECTOR_CONTENT.ecommerce` ✅ (déjà en place en S5)
  - Stats : `×2 Conversion`, `24/7 Support client`, `−80% Paniers perdus`
- [ ] 🔴 Login `ecommerceone@demo.cm / Pme@2024!` → dashboard e-commerce
- [ ] 🔴 Logout → `/login` thème rouge conservé
- [ ] 🔴 Reset password → email avec thème e-commerce
- [ ] 🔴 Accès dashboard sans token → redirect `/login`

> _Notes :_

---

## F6 — Dashboard first contact

- [ ] 🔴 Dashboard thème e-commerce (`#E63946`)
- [ ] 🔴 Sidebar : libellé "E-commerce" visible
- [ ] 🔴 SectorNav : modules e-commerce affichés :
  - `catalogue_produits` → `/modules/catalogue`
  - `commande_paiement` → `/modules/commande-paiement`
  - `suivi_commande` → `/modules/commandes`
  - `conversion_prospects` → `/modules/contacts`
- [ ] 🔴 Page `/welcome` : étapes cohérentes pour une boutique
- [ ] 🔴 0 régression restaurant, banking, school

> _Notes :_

---

## F7 — Configuration métier E-commerce ⏸️

> **Statut : EN PAUSE** — avancer d'abord sur les landings Hotel, Transport, Clinical, Public, PME.
> Reprendre F7-F10 E-commerce après que tous les landings sectoriels soient faits.

- [ ] ⏸️ **Catalogue Produits — Ajout** : nom, description, prix, image, stock, catégorie, statut
- [ ] ⏸️ **Catalogue — Modifier / Désactiver / Supprimer**
- [ ] ⏸️ **Gestion Commandes** :
  - Statuts : En attente → Payée → Expédiée → Livrée → Annulée
  - Mise à jour statut + numéro de tracking
- [ ] ⏸️ **Relance panier abandonné** :
  - Délai configurable (ex: 1h, 24h après abandon)
  - Message de relance WhatsApp automatique
- [ ] ⏸️ **FAQ E-commerce** :
  - Politique retour et remboursement
  - Délais de livraison
  - Moyens de paiement acceptés
  - Procédure réclamation
- [ ] ⏸️ **Paramètres agent** :
  - Nom de l'agent (ex: "Assistant Boutique")
  - Ton : commercial / chaleureux
  - Ne jamais inventer un stock ou un prix

---

## F8 — Test agent IA E-commerce ⏸️

> **Statut : EN PAUSE** — même décision que F7.

- [ ] ⏸️ **A — Recherche produit** :
  - "Avez-vous des chaussures de sport en taille 42 ?"
  - L'agent liste les produits correspondants depuis le catalogue
  - Pas de produits inventés

- [ ] ⏸️ **B — Commande via WhatsApp** :
  - "Je veux commander 2 paires de la référence X"
  - `CreateCommandeAction` déclenché → commande créée BDD en statut `"en_attente"`
  - ⚠️ Vérifier persistance : `GET /api/v1/commandes/`

- [ ] ⏸️ **C — Suivi de commande** :
  - "Où en est ma commande #1234 ?"
  - L'agent retourne le statut et le numéro de tracking si disponible

- [ ] ⏸️ **D — Panier abandonné** :
  - Simuler un abandon → attendre le délai configuré
  - Message de relance WhatsApp envoyé automatiquement
  - ⚠️ Vérifier que le message est personnalisé (nom client, produit)

- [ ] ⏸️ **E — Question retour produit** :
  - "Je veux retourner un article"
  - L'agent explique la procédure depuis la FAQ

- [ ] ⏸️ WAHA (WhatsApp live) : re-jouer scénarios A, B, C

---

## F9 — Suivi post-interaction ⏸️

> **Statut : EN PAUSE** — même décision que F7.

- [ ] ⏸️ Commande visible dans `/modules/commandes` avec statut `"en_attente"`
- [ ] ⏸️ Transitions : `en_attente` → `payee` → `expediee` → `livree` ou `annulee`
- [ ] ⏸️ Notification email au gérant lors d'une nouvelle commande
- [ ] ⏸️ Stats dashboard :
  - Nombre de commandes par jour
  - Taux de conversion (vues produit → commande)
  - Taux de relance panier réussie

---

## F10 — Validation finale ⏸️

> **Statut : EN PAUSE** — reprendre quand F7-F9 sont terminés.

- [ ] ⏸️ `npx tsc --noEmit` → 0 erreur TypeScript
- [ ] ⏸️ 0 régression restaurant, banking, school
- [ ] ⏸️ Responsive mobile validé (landing + dashboard)
- [ ] ⏸️ Logo E-commerce SVG transparent dans navbar
- [ ] ⏸️ Favicon E-commerce affiché sur port 3005
- [ ] ⏸️ Redirect post-auth e-commerce → `localhost:3005`

---

## BUG LOG — E-commerce

| ID | Flux | Description | Sévérité | F/B | Statut |
|----|------|-------------|----------|-----|--------|
| Ec-001 | | | | | |

---

## TABLEAU DES FICHIERS

| Fichier | Action | Statut |
|---------|--------|--------|
| `src/dictionaries/fr/ecommerce.fr.ts` | Créer | 🔴 F2 |
| `src/dictionaries/en/ecommerce.en.ts` | Créer | 🔴 F2 |
| `src/dictionaries/fr/index.ts` | Modifier — brancher ecommerce | 🔴 F2 |
| `src/dictionaries/en/index.ts` | Modifier — brancher ecommerce | 🔴 F2 |
| `src/app/_components/sector/ecommerce/EcommerceHero.tsx` | Créer | 🔴 F2 |
| `src/app/_components/sector/ecommerce/EcommerceFeatures.tsx` | Créer | 🔴 F2 |
| `src/app/_components/sector/ecommerce/EcommerceLandingContent.tsx` | Créer | 🔴 F2 |
| `src/app/page.tsx` | Modifier — cas `"ecommerce"` + metadata SEO | 🔴 F2 |
| `apps/management/commands/seed_ecommerce.py` | Créer si absent | 🟡 Pré-requis |

---

## ORDRE D'EXÉCUTION

```
ÉTAPE 1 — Dictionnaires FR + EN (~30 min)
  ├─ ecommerce.fr.ts  (as const obligatoire)
  ├─ ecommerce.en.ts  (as const obligatoire)
  └─ Brancher dans fr/index.ts + en/index.ts

ÉTAPE 2 — Composants landing (~90 min)
  ├─ EcommerceHero.tsx    (4 slides, rouge #E63946)
  ├─ EcommerceFeatures.tsx (6 features)
  └─ EcommerceLandingContent.tsx (assemblage)

ÉTAPE 3 — Routing + SEO (~20 min)
  ├─ page.tsx → cas "ecommerce" + METADATA
  ├─ npx tsc --noEmit → 0 erreur
  └─ Vérification visuelle port 3005

ÉTAPE 4 — F1 hub vérification rapide (~10 min)

ÉTAPE 5 — F3 + F4 + F5 + F6 vérifications (~45 min)

ÉTAPES 6-9 — F7→F10 (⏸️ après autres landings)
```

---

## PROCHAINES ÉTAPES après E-commerce F2 validé

```
Hotel   → port 3006 · primary #1A3C5E · accent #C9A84C
Transport → port 3009 · primary #023E8A · accent #0EA5E9
Clinical  → port 3003 · primary #0077B6 · accent #00B4D8
Public    → port 3007 · primary #2D3561 · accent #DC2626
PME       → port 3008 · primary #075E54 · accent #10B981
```

---

*TODO E-commerce finale — donpk — Session 15*
*Patron : School (S14) + Banking (S12)*
*sector-content.ts ✅ déjà complet (S5) — aucune modification nécessaire*