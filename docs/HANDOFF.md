```

---

## HANDOFF — Fin de session

Fichier à garder sous le coude pour la prochaine session.

```markdown
# HANDOFF — Session 21 avril 2026 (PM)

## Ce qui a été complété

### Backend auth — Phases 1 à 4 intégralement terminées et testées
- Phase 1 : modèle `AuthToken` unifié (verify_email / reset_password / magic_link), `google_id` sur User, `has_google_auth` computed dans `UserMeSerializer`, `create_superuser` force `is_email_verified=True`, migration 0003 users
- Phase 2 : singleton `PlatformSettings` avec `welcome_bonus_*` + `allow_multi_entreprises_per_user`, endpoint `GET/PATCH /api/v1/billing/settings/` (admin only pour PATCH), refactor `EntrepriseViewSet.perform_create` avec création transactionnelle User + Entreprise + UserEntreprise + Wallet + Transaction bonus, seed.py refactorisé pour `_reset()` descendant
- Phase 3 : permission globale `IsEmailVerified` dans `core/permissions.py`, ajoutée à `DEFAULT_PERMISSION_CLASSES`, refactor `register` (plus de création entreprise), `google_auth` persiste `google_id`
- Phase 4 : 4 nouveaux endpoints `/auth/forgot-password/`, `/auth/reset-password/`, `/auth/magic-link/request/`, `/auth/magic-link/verify/` — helpers `_consume_previous_tokens`, `_create_token`, `_send_email` factorisés, 4 serializers + 4 APIViews avec `@extend_schema` complets
- Fix bug `logout` 500 : ajout de `rest_framework_simplejwt.token_blacklist` dans `INSTALLED_APPS` + migrations

### Tests backend (via Swagger) — 23 tests OK
G1 Health, G2 Register+Verify+Resend (7), G3 Login (5), G4 partiel (Me + Refresh)

### Frontend — Intégration auth complète (4 modifs chirurgicales)
- `src/middleware.ts` : ajout routes publiques `verify-email`, `reset-password`, `magic-link` + matchers
- `src/app/reset-password/page.tsx` : **créée** (formulaire + validation + redirection auto)
- `src/app/magic-link/page.tsx` : **créée** (consommation auto du token + redirection dashboard)
- `src/dictionaries/fr.ts` + `en.ts` : blocs `resetPassword` et `magicLink` ajoutés

### Vérif TypeScript
`npx tsc --noEmit` : **zéro erreur**.

## Ce qui est en cours

### Tests frontend end-to-end
Guide `GUIDE_TEST_AUTH_FRONTEND.md` rédigé avec 8 groupes de tests (Landing, Register, Login, Forgot/Reset, Magic link, Google, Session/Refresh/Logout, Garde anti-admin). À dérouler entièrement.

### Tests backend restants
G4.5 logout, G5 IsEmailVerified, G6 forgot+reset, G7 magic link, G8 Google OAuth, G9 création entreprise E2E. À compléter pour finaliser `GUIDE_AUTH_AGT.md` côté backend.

## Prochaine étape immédiate

1. Dérouler `GUIDE_TEST_AUTH_FRONTEND.md` groupe par groupe
2. Noter les bugs rencontrés → fixer
3. Compléter les tests backend manquants (G4.5 à G9) via Swagger
4. Consolider les 2 guides (backend + frontend) en versions finales

Ensuite : migration des autres modules métier frontend (bots, conversations, billing, knowledge...) pour passer de db.json fake aux vrais endpoints Django.

## Bugs connus

| # | Composant | Bug | Statut |
|---|-----------|-----|--------|
| 1 | Backend | Logout 500 `'RefreshToken' has no attribute 'blacklist'` | ✅ FIXÉ (token_blacklist ajouté aux INSTALLED_APPS) |

## Commandes utiles

```powershell
# Backend — démarrage propre
cd agt-assist-backend
docker-compose down -v
docker-compose up -d --build
docker-compose exec api python manage.py migrate
docker-compose exec api python manage.py seed

# Frontend — dev mode
cd agt-assist-client
npm run dev

# Récupérer un token auth d'un user en base
docker-compose exec api python manage.py shell -c "from apps.users.models import AuthToken; t=AuthToken.objects.filter(user__email='EMAIL', type='TYPE', used_at__isnull=True).first(); print(t.token if t else 'AUCUN')"
# TYPE = verify_email | reset_password | magic_link

# Force un user à non-vérifié (retester EMAIL_NOT_VERIFIED)
docker-compose exec api python manage.py shell -c "from apps.users.models import User; u=User.objects.get(email='EMAIL'); u.is_email_verified=False; u.save()"

# TypeCheck frontend
cd agt-assist-client
npx tsc --noEmit
```

## Comptes de test

| Email | Password | Type | Vérifié |
|-------|----------|------|---------|
| superadmin@agt.cm | Admin@2024! | superadmin | ✅ |
| gabriel@agt.cm | Admin@2024! | admin AGT | ✅ |
| pharma@demo.cm ... immo@demo.cm | Pme@2024! | PME seedée | ✅ |
| test1@demo.cm | Pme@2024! | PME (test) | ✅ |
| test2@demo.cm | Pme@2024! | PME (test) | ❌ |
