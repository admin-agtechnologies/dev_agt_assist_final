# FRONTEND PME — TODO
# AGT Assist Client — Plan de travail

---

## PHASE 0 — Fondations (prérequis techniques)

- [x] **PME-00** — Remplacer tous les emojis par des icônes Lucide React dans le layout, les composants UI partagés et toutes les pages existantes
  - `src/app/pme/layout.tsx` (nav icons, sidebar footer)
  - `src/components/ui/index.tsx` (EmptyState, ConfirmDeleteModal)
  - `src/app/pme/dashboard/page.tsx`
  - `src/app/pme/bots/page.tsx`
  - `src/app/pme/services/page.tsx`
  - `src/app/pme/appointments/page.tsx`
  - `src/app/pme/billing/page.tsx`
  - `src/app/pme/profile/page.tsx`
  - `src/app/login/page.tsx`

---

## PHASE 1 — Onboarding & Acquisition

- [] **PME-01** — Landing page publique (`/`)
  - Hero section, features, plans tarifaires, CTA inscription
  - Route publique (pas de redirect vers dashboard si non connecté)
  - Ajouter une image sur la landing page,ou un caroussel,un peu comme sur salma-studies.com
  - Faire un Fotter de haute Qualité, un peu comme sur salma-studies.com
  - améliorer la Navbr,avoir un vari logo 
  - avoir un section démo pour convaincre
  - ajouter une section témoignages également
  - ajouter des statistiques qui parlent

- [x] **PME-02** — Page Login enrichie (`/login`)
  - Magic link (connexion sans mot de passe par email)
  - Google OAuth
  - Mot de passe oublié / reset password
  - Lien vers inscription
  - Bouton pour revenir sur home
  - inclure uen image de quelqu'un qui est au téléphone, genre le form et l'image à droite,afin d'avoir un login/register frorm de haute qualité

- [x] **PME-03** — Page d'attente (`/pending`)
  - Accessible quand le compte n'est pas encore actif
  - Message de vérification email ou validation admin
  - Bouton renvoyer l'email de confirmation

- [x] **PME-04** — Pages système
  - Page 404 (`not-found.tsx`)
  - Page erreur globale (`error.tsx`)

- [x] **PME-05** — Tunnel d'onboarding step-by-step (`/onboarding`)
  - Étape 1 : Création de compte + affichage cadeau wallet 10 000 XAF,il faut ajouter l'émail et OAuth
  inclure la validation de mail obligatoire au milieu, si je mets un mail existant, maes infos précédentes se cahrgent,après validation,je tombe direct sur la suite de mon onboarding
  - Étape 2 : Profil entreprise (nom, secteur, description, WhatsApp)
  - Étape 3 : Sélecteur abonnement (Free, Pro, Premium, Gold)
    - Free : 2 000 msg, 1 bot WhatsApp + 1 bot vocal, 10 RDV, 50 mails rappels
    - Pro, Premium, Gold : à définir
  - Étape 4 : Paiement (solde wallet ou recharge Mobile Money)
  - Étape 5 : Attribution automatique Pack de Bots + confirmation
  - Icône relance onboarding accessible depuis le dashboard à tout moment

---

## PHASE 2 — Dashboard & Gestion

- [x] **PME-06** — Dashboard PME enrichi (`/pme/dashboard`)
  - Graphique connecté aux vraies stats (pas de données statiques)
  - Résumé abonnement + quota restant
  - Lien rapide vers chaque module

- [x] **PME-07** — Gestion compte (`/pme/profile`)
  - Formulaire édition profil utilisateur (nom, email, avatar)
  - Changement de mot de passe
  - Section entreprise (données tenant éditables)

- [x] **PME-08** — Base de connaissance entreprise (`/pme/knowledge`)
  - Gestion des infos métier transmises au bot
  - FAQ bilingue (fr/en) — CRUD complet
  - Services, horaires, description



---

## PHASE 3 — Module Bots (refonte)

- [x] **PME-09** — Interface bots enrichie (`/pme/bots`)
  - Onglet "Tester" : chat simulé avec le bot
  - Stats par bot (messages, appels, RDV)
  - Liste des RDV planifiés par ce bot
  - Liste des emails de rappel envoyés
  - Configuration des politiques de rappel (parmi celles définies par l'admin)

- [x] **PME-10** — Abonnements & Paiements (`/pme/billing`)
  - Historique des transactions
  - Téléchargement de factures
  - Modal changement de plan fonctionnelle
  - Modal recharge wallet (Mobile Money)
---

## PHASE 4 — Support & UX

- [x] **PME-11** — FAQ PME (`/pme/faq`)
  - CRUD bilingue (question/réponse fr + en)
  - Catégories, activation/désactivation

- [x] **PME-12** — Widget chatbot de support
  - Bouton fixe bas droite (premier widget)
  - Chatbot interactif pour aide à l'utilisation de la plateforme qui proposen de façon intélligente les racourcus au user

- [x] **PME-13** — Widget AGT-BOT WhatsApp
  - Bouton fixe bas droite (sous le chatbot)
  - Lien vers le bot WhatsApp AGT Technologies (pub de l'entreprise),numéro configurable depuis le dashboard admin

- [x] **PME-14** — Icône relance onboarding
  - Accessible en permanence depuis le layout PME
  - Relance le tunnel `/onboarding` à l'étape souhaitée

---

## LÉGENDE
- [ ] À faire
- [~] En cours
- [x] Terminé

## CONVENTIONS RAPPEL
- Zéro emoji dans le JSX — icônes Lucide React uniquement
- Zéro texte en dur — toujours `d.xxx` via `useLanguage()`
- Zéro `any` — typage explicite
- Trailing slash sur tous les endpoints API
- `createPortal` obligatoire pour les modales