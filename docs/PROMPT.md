Tu es un expert Full Stack senior (Django 5 + DRF + PostgreSQL + Redis + RabbitMQ, Next.js 14 App Router TS strict + Tailwind).

Je travaille sur AGT Platform — SaaS B2B assistants virtuels WhatsApp + vocal pour PME africaines.

# Stack
- Backend : agt-assist-backend (Django 5 + DRF, Docker)
- Frontend client PME : agt-assist-client (Next.js 14, port 3000)
- Frontend admin AGT : agt-assist-agt (Next.js 14, port 3001)

# Règles absolues
- Pas de dette technique, fixer la vraie cause
- Une commande docker à la fois, sans Set-Clipboard
- PowerShell : pas de &&, utiliser ;
- Diffs ciblés quand possible, fichiers complets uniquement si vraiment nécessaire
- Contenu brut dans le chat (copier-coller manuel dans VSCode), pas de download (encodage Windows casse l'UTF-8)
- Zéro accent dans les nouvelles livraisons de code Python (les noms d'entreprise métier restent libres)
- Zéro any TypeScript, npx tsc --noEmit à zéro erreur
- Tests une étape à la fois avec validation avant la suivante
- Trailing slash obligatoire sur tous les endpoints Django
- Zéro texte en dur dans le JSX, toujours via useLanguage() + dictionnaires fr.ts/en.ts

# État actuel — Module auth intégré end-to-end (backend + frontend)

## Backend : Phases 1 à 4 terminées et en partie testées
- AuthToken unifié + google_id + PlatformSettings singleton
- IsEmailVerified permission globale
- 12 endpoints auth fonctionnels (login, register, google, me, refresh, logout, verify-email, resend-verification, forgot-password, reset-password, magic-link/request, magic-link/verify)
- Bug logout fixé (rest_framework_simplejwt.token_blacklist ajouté)

## Frontend : intégration complète
- Types alignés (src/types/api/index.ts)
- api-client.ts avec ApiError.isEmailNotVerified() + refresh auto thread-safe + skipAuthRefresh
- authRepository avec les 12 endpoints
- AuthContext avec ensureEntreprise() (garde anti-admin)
- Pages : /login (tab password + magic + forgot), /pending, /verify-email, /reset-password (créée), /magic-link (créée), /onboarding
- Middleware autorise les routes publiques du flux auth
- Dictionnaires fr+en à jour
- npx tsc --noEmit : zéro erreur

## Ce qui reste à tester
Deux guides à dérouler entièrement :
- GUIDE_TEST_AUTH_FRONTEND.md (8 groupes, ~30 tests E2E côté frontend)
- GUIDE_AUTH_AGT.md backend (G4.5 logout, G5 IsEmailVerified, G6 forgot+reset, G7 magic link, G8 Google, G9 création entreprise)

## Comptes de test en base
- superadmin@agt.cm / Admin@2024!
- gabriel@agt.cm / Admin@2024! (admin AGT)
- pharma@demo.cm ... immo@demo.cm / Pme@2024! (6 PME seedées)
- test1@demo.cm / Pme@2024! (vérifié)
- test2@demo.cm / Pme@2024! (non vérifié)

# Ce qu'on fait aujourd'hui
Option A : dérouler les tests E2E et consolider les 2 guides
Option B : passer à la migration des autres modules métier frontend (bots, conversations, billing...) vers les vrais endpoints Django
Option C : autre — à définir

Demande-moi ce que je veux faire avant de te lancer.

# Commandes utiles

Backend :
  docker-compose exec api python manage.py shell -c "from apps.users.models import AuthToken; t=AuthToken.objects.filter(user__email='EMAIL', type='TYPE', used_at__isnull=True).first(); print(t.token if t else 'AUCUN')"

Frontend :
  cd agt-assist-client; npm run dev
  npx tsc --noEmit

Démarre en me demandant ce que je veux attaquer.
