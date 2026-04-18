# HANDOFF — Frontend PME (AGT Assist Client) — 18 Avril 2026

## 1. CE QUI A ÉTÉ COMPLÉTÉ

- [PME-08~] Knowledge base — `fetchAll` robustifié, types enrichis (`appointment_duration_min` + `slot_buffer_min`)
- [PME-09] Agenda RDV `/pme/appointments` — vue semaine/jour, grille CSS, blocs colorés, config créneaux, modales détail/formulaire, 27 RDV mock
- [PME-10] Billing `/pme/billing` — wallet, abonnement + quotas, plans (alignés PLANS_CONFIG), modale recharge Mobile Money, modale changement plan, historique transactions
- [PME-11] Bots enrichis `/pme/bots` — panneau détail par bot (stats, conversations paginées, agenda, rapport conversation complet), bouton Publier/Dépublier, 3 bots mock pour t1
- [PME-12] Interface test `/pme/bots/[id]/test` — layout 3 colonnes, design dynamique par secteur, simulateur WhatsApp (mock intelligent : RDV, services, horaires, confirmation), simulateur vocal (appel, timer, mute), agenda temps réel avec vrais RDV + RDV simulés en amber pointillés
- [DATA] `db.json` enrichi : transactions, conversation_messages, 6 conversations avec rapports complets, 5 bots, plans corrigés (Starter/Pro/Premium/Gold)
- [TYPES] Transaction, ConversationMessage, ConversationAction, ConversationReport, Conversation enrichie
- [REPO] transactionsRepository, conversationMessagesRepository, walletsRepository.patch, conversationsRepository enrichi
- [I18N] Clés appointments, billing, bots enrichies — fr.ts + en.ts

## 2. EN COURS (non terminé)

- [ ] `npx tsc --noEmit` sur la dernière version de `/pme/bots/[id]/test/page.tsx` — à vérifier au démarrage de session

## 3. PROCHAINE ÉTAPE IMMÉDIATE

Enrichissement interface test `/pme/bots/[id]/test/page.tsx` :

**Dans l'ordre :**
1. Switcher WhatsApp/Vocal (un seul affiché à la fois, toggle en haut)
2. Infos bot en accordéon/dropdown (alléger la colonne gauche)
3. Transcription vocale en temps réel (affichage texte pendant appel simulé)
4. Bilan conversation dynamique (résumé live : contacts collectés, RDV, services mentionnés)
5. Bloc envoi email (simuler envoi rappel/confirmation au client)
6. Enrichissement mock IA (réponses plus intelligentes, détection intention plus fine)

## 4. BUGS CONNUS / POINTS D'ATTENTION

- `npx tsc --noEmit` à relancer sur `/pme/bots/[id]/test/page.tsx` — dernière version non vérifiée
- `loginWithGoogle` dans `AuthContext` → vérifier compatibilité `onboarding/page.tsx` `handleGoogleSuccess`
- Conversations c4, c5 (bot b1) n'ont pas de `conversation_messages` dans db.json — ok pour le mock mais à enrichir si besoin
- SupportWidgets bas droite pointent sur `+237600000000` (placeholder)
- `pme/services` retiré de la sidebar — géré via Base de connaissance uniquement

## 5. COMMANDES UTILES

```bash
npm run dev:mock
# URLs clés
http://localhost:3000/pme/bots
http://localhost:3000/pme/bots/b1/test
http://localhost:3000/pme/appointments
http://localhost:3000/pme/billing

# Comptes démo
pharmacie@example.com  → PME tenant t1 (3 bots)
admin@agt.com          → Admin

npx tsc --noEmit
npm run build
```