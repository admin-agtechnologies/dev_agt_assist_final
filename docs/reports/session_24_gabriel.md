# Rapport de session — session_24_gabriel

## Métadonnées

| Champ | Valeur |
|-------|--------|
| Membre | Gabriel |
| Session N° | 24 |
| Date | 2026-05-14 |
| Type | Conception produit + Génération full-stack — Refonte complète Plans & Features |
| Durée estimée | ~6h |
| Statut | Terminée ✅ |
| Commits | `flush + seed` validé en dev |

---

## Contexte de départ

La session 23 (Gabriel + donpk) avait livré le Module Bots V2 complet. La prochaine
étape logique était les tests E2E agent/bots — mais Gabriel a identifié une priorité
bloquante : les seeders de plans et features contenaient des données approximatives,
incohérentes et incomplètes. Tester sur une base de données bancale n'a pas de sens.
La session 24 a donc été entièrement consacrée à "préparer le terrain" : concevoir
et implémenter le modèle économique complet d'AGT Platform.

---

## Ce qui a été fait — Narration complète

### Acte 1 — La conception des plans (décisions fondamentales)

Tout a commencé par une question simple : combien coûtent vraiment les plans ?

Le boss avait une vision claire : **3 plans commerciaux + 1 plan d'entrée**.
Après clarification (la mention "3000k" était une coquille pour 300k), on a
validé la structure tarifaire suivante :

| Plan | Mensuel | Installation | Positionnement |
|------|---------|--------------|----------------|
| **Découverte** | 10 000 XAF | Gratuite | Conversion — on investit pour convaincre |
| **Starter** | 50 000 XAF | 100 000 XAF | PME débutante, volume modéré |
| **Business** | 150 000 XAF | 250 000 XAF | PME active, multi-agences |
| **Pro** | 300 000 XAF | 500 000 XAF | Tout illimité, tranquillité totale |

**Décision clé :** Le plan Découverte est un investissement délibéré — on perd
de l'argent sur ce plan pour convertir. Le PME doit pouvoir tester toutes les
features avec de très petits quotas pour voir comment ça marche.

---

### Acte 2 — La philosophie de pricing des features

**Deux philosophies s'affrontaient :**
- Option A : On facture uniquement ce qui coûte vraiment (WhatsApp et vocal)
- Option B : Les quotas comme levier commercial (tout a un quota pour inciter à monter de plan)

**Décision : Option B validée par Gabriel.**

Rationale : même les choses "gratuites" (emails, RDV) ont un coût indirect —
serveurs, cloud, équipe dev, factures entreprise. Et surtout, les quotas sont
le meilleur levier pour pousser vers des plans supérieurs.

**Exception importante validée :** Les emails sont techniquement gratuits via
Gmail SMTP actuellement. Mais à grande échelle, Google bloque au-delà de 500/jour.
Il faudra migrer vers Amazon SES (~0.06 XAF/email) ou Brevo. Coût futur anticipé,
quota justifié dès maintenant.

---

### Acte 3 — Le catalogue features : 25 features, 2 familles

**25 features au total** (23 existantes + gestion_crm + transfert_humain).

**2 renames actés :**
- `conversion_prospects` → `prospection_active` (le terme "prospects" était trop
  corporate pour les PME camerounaises)
- `paiement_frais` → `paiement_en_ligne` (plus clair : payer une dette/facture via
  le bot — différent de `commande_paiement` qui est de l'achat)

**Famille A — 11 features gratuites/illimitées (is_mandatory partout) :**
`dashboard` · `faq` · `gestion_crm` · `transfert_humain` · `menu_digital` ·
`catalogue_produits` · `catalogue_services` · `catalogue_trajets` ·
`catalogue_produits_financiers` · `suivi_commande` · `orientation_citoyens`

**Décision fondamentale :** `gestion_crm` est `is_mandatory=True` dans TOUS les
secteurs. Chaque conversation WhatsApp crée un contact — ne pas avoir le CRM
activé est illogique.

**Famille B — 13 features à quota (levier commercial) :**
`chatbot_whatsapp` · `agent_vocal` · `emails_rappel` · `prise_rdv` ·
`reservation_table` · `reservation_chambre` · `reservation_billet` ·
`commande_paiement` · `paiement_en_ligne` · `inscription_admission` ·
`communication_etablissement` · `prospection_active` · `multi_agences`

---

### Acte 4 — Le pricing mathématique des quotas WhatsApp

Gabriel a challengé les quotas initiaux (5 500 messages pour Starter à 50k).
Le calcul réel a été fait :

**Coût DeepSeek V4 Flash (vérifié via web_search, mai 2026) :**
- Input cache miss : $0.14/M tokens
- Output : $0.28/M tokens
- Avec cache système (prompts répétitifs) : coût blended ~$0.001/message
- En XAF (1$ ≈ 600 XAF) : **~0.6 XAF par message WhatsApp**

**Consommation réelle d'une PME :**
- Un client WhatsApp = 4-6 messages aller-retour en moyenne
- PME "Starter" typique = PME active = 100 clients/jour × 4 msgs × 26 jours = 10 400 msgs/mois
- Donner 5 500 msgs à une PME qui paie 50k = la bloquer en 2 semaines → éthiquement faux

**Quotas validés (marges ~30-40%) :**

| Plan | WhatsApp | Vocal | Emails | RDV/Résa | Recharge |
|------|----------|-------|--------|----------|---------|
| Découverte | 100 | 10 min | 50 | 15 | — |
| Starter | 30 000 | 500 min | 5 000 | 300 | 10k XAF → 3k msgs |
| Business | 100 000 | 2 000 min | 20 000 | 1 500 | idem |
| Pro | ∞ | ∞ | ∞ | ∞ | — |

**Décision sur les recharges :** Le prix de recharge est volontairement plus
élevé que le plan ramené à l'unité. Règle : passer au plan supérieur doit
TOUJOURS coûter moins cher que recharger pour atteindre le même quota.
Ex : Starter → Business via recharge = ~230k XAF. Business direct = 100k XAF.

**Décision sur l'agent vocal :** L'unité est la **minute**, pas l'appel.
Un appel peut durer 2 ou 15 minutes — la minute est l'unité de facturation des
APIs téléphonie (Twilio, Africa's Talking) et plus juste pour le PME.

---

### Acte 5 — Le gating par plan (quelles features dans quel plan)

Décision : le plan détermine AUSSI l'accès (pas seulement le quota).

**Gating validé :**

| Feature | Découverte | Starter | Business | Pro |
|---------|-----------|---------|----------|-----|
| Famille A complète | ✅ | ✅ | ✅ | ✅ |
| WhatsApp, vocal, emails, RDV | ✅ | ✅ | ✅ | ✅ |
| Commande & paiement | ❌ | ✅ | ✅ | ✅ |
| Paiement en ligne | ❌ | ✅ | ✅ | ✅ |
| Inscription/Admission | ❌ | ✅ | ✅ | ✅ |
| Communication établissement | ❌ | ✅ | ✅ | ✅ |
| Prospection active | ❌ | ❌ | ✅ | ✅ |

**Décision spécifique sur `communication_etablissement` :** Initialement bloquée
à Business. Gabriel a corrigé : pour les écoles, c'est leur métier de base (envoyer
des bulletins aux parents). Bloquée à Business = pénaliser les écoles sur Starter.
Solution : disponible dès Starter (c'est une feature sectorielle, les non-écoles
ne la verront jamais grâce au SectorFeature gate).

---

### Acte 6 — La matrice sectorielle (10 secteurs)

Pour chaque secteur, trois règles s'appliquent :
1. Toute Famille A applicable → `is_default=True`, `is_mandatory=True`
2. Famille B cœur métier → `is_default=True`, `is_mandatory=False`
3. Famille B optionnelle → `is_default=False`, `is_mandatory=False`

**Deux features fantômes découvertes et remplacées :**
- `conciergerie` (hôtel) → remplacée par `catalogue_services` + `paiement_en_ligne`
  (n'existait plus dans le catalogue des 25 features)
- `orientation_patient` (santé) → remplacée par `gestion_crm`
  (fiche patient automatique — même logique, nom plus cohérent)

**Plans recommandés par secteur (pour l'onboarding) :**
- Starter : Restaurant · Éducation · E-commerce · PME
- Business : Hôtel · Santé · Banque · Transport · Public

---

### Acte 7 — Le modèle Plan enrichi (migration backend)

Le modèle `apps/billing/models.py` Plan ne contenait pas le champ `frais_installation`.
Décision : l'ajouter directement (migration propre) plutôt que de le gérer en config
statique ou en commentaire.

**Migration générée :** `apps/billing/migrations/0004_plan_frais_installation.py`
`DecimalField(max_digits=10, decimal_places=2, default=0)`

**3 serializers mis à jour :** `PlanSerializer`, `AdminPlanSerializer`,
`CreateAdminPlanSerializer`, `PatchAdminPlanSerializer` → champ `frais_installation`
exposé dans tous.

---

### Acte 8 — La génération des seeders (4 vagues)

**Problème `--reset` résolu :** La commande `seed` ne supportait pas `--reset`.
Tentative d'ajout → bloqué par FK PROTECTED entre `Abonnement` et `Plan`.
Solution finale : `python manage.py flush` + `python manage.py seed` en dev
(données de démo non critiques).

**features_seeder.py — réécriture complète :**
- 24 features avec `type_quota`, `prix_unitaire`, `quota_unitaire` renseignés
- Matrice sectorielle complète (10 secteurs × N features)
- Règles `is_default` / `is_mandatory` appliquées proprement
- `_BASE` helper partagé : dashboard + faq + gestion_crm + transfert_humain
  (obligatoires partout)

**billing_seeder.py — réécriture complète :**
- 4 nouveaux plans (decouverte, starter, business, pro) avec `frais_installation`
- `_FAMILLE_A` helper : 11 features gratuites illimitées dans tous les plans
- `PLAN_BASE_FEATURES` : gating explicite par plan
- `PLAN_SECTOR_FEATURES` : reservation_table / reservation_chambre / reservation_billet
  en sectoriel (quotas différents selon le plan)
- Suppression automatique anciens plans (gratuit, premium, gold) + leurs Abonnements

**Résultat du seed complet après flush :**
- 10 secteurs ✅
- 24 features ✅
- 124 SectorFeatures ✅
- 4 plans ✅
- 79 PlanFeature base ✅
- 12 PlanFeature sectorielles ✅
- 3 users démo recréés ✅

---

### Acte 9 — Les 3 fichiers frontend (vague finale)

**Découverte critique via vérification :** Les slugs frontend (`SectorSlug`) ≠
slugs backend. Frontend : `banking`, `clinical`, `school`. Backend : `banque`,
`sante`, `education`. Sans vérification du `sector-config.ts` réel, le
`sector-theme.ts` aurait eu des clés TypeScript invalides. La vérification
a évité un build cassé.

**`billing.types.ts` :** Ajout `frais_installation?: number` (optionnel —
plus safe que requis), unification des deux types `Plan` qui coexistaient,
`Subscription` alignée sur le backend réel (`days_remaining` inclus).

**`constants.ts` :** `PLANS_CONFIG` migré vers les 4 nouveaux plans avec
`installation_fee` exposé. `PlanSlug` = `"decouverte" | "starter" | "business" | "pro"`.
`SECTOR_URLS` conservé (deprecated, toujours importé par LandingData.ts).

**`sector-theme.ts` :** Slugs corrigés vers les noms frontend canoniques.
`defaultFeatures` mis à jour : `paiement_en_ligne` pour hôtel, santé, banque,
éducation, transport.

**Build TypeScript après application :** 4 erreurs pré-existantes (Tenant type —
S23) — **0 erreur introduite par S24.** ✅

---

## Décisions prises (tableau de synthèse)

| Décision | Rationale |
|----------|-----------|
| Option B — quotas comme levier commercial | Coûts réels + incitation à monter de plan |
| Agent vocal = minutes (pas appels) | APIs téléphonie facturent à la minute |
| Découverte = perte délibérée (100 msgs) | Investissement acquisition, pas un plan viable |
| Recharge > plan au prorata | Upgrade toujours moins cher que recharger |
| `gestion_crm` is_mandatory partout | Toute conversation crée un contact |
| `communication_etablissement` dès Starter | Cœur métier école — pas un outil avancé |
| `frais_installation` dans le modèle | Champ réel, pas de config statique |
| `flush + seed` > `--reset` en dev | FK PROTECTED trop complexe à gérer proprement |
| Vérification `sector-config.ts` avant génération | Slugs frontend ≠ slugs backend |

---

## Bugs corrigés

| ID | Description | Fix |
|----|-------------|-----|
| BUG-S24-01 | Features fantômes `conciergerie` et `orientation_patient` dans les seeders | Remplacées par features existantes |
| BUG-S24-02 | `Plan.delete()` bloqué par FK PROTECTED (Abonnement) | Suppression Abonnements d'abord |
| BUG-S24-03 | `sector-theme.ts` avec slugs backend (sante/banque) au lieu de frontend (clinical/banking) | Corrigé après vérification sector-config.ts |

---

## Bugs connus / Dettes créées

| ID | Fichier | Description | Priorité |
|----|---------|-------------|---------|
| BUG-S24-04 | `apps/tenants/setup.py` | `Plan 'gratuit' introuvable` — onboarding cherche encore l'ancien plan | Haute |
| BUG-S24-05 | Bootstrap hôtel | `Feature 'conciergerie' introuvable` — référence hardcodée dans le bootstrap | Haute |
| DETTE-S24-01 | `tenants.repository.ts` + `LeftCockpitPanel.tsx` | Type `Tenant` manquant dans le barrel (pré-S24, noté S23) | Haute |
| DETTE-S24-02 | `commande.types.ts` | Doublon `Plan` interface sans `frais_installation` | Moyenne |
| DETTE-S24-03 | `LandingData.ts` | Import `SECTOR_URLS` deprecated — migrer vers `getSectorUrl()` | Basse |
| DETTE-S24-04 | `apps/tenants/setup.py` | Plan par défaut nouveau user = 'gratuit' → à changer en 'decouverte' | Haute |

---

## Fichiers créés / modifiés

### Backend

| Fichier | Action |
|---------|--------|
| `apps/billing/models.py` | Modifié — ajout `frais_installation` |
| `apps/billing/migrations/0004_plan_frais_installation.py` | Créé — migration auto |
| `apps/billing/serializers.py` | Modifié — `frais_installation` dans `PlanSerializer` |
| `apps/admin_api/serializers/plans.py` | Modifié — `frais_installation` dans 3 serializers |
| `apps/tenants/seeders/features_seeder.py` | Réécrit — 24 features + matrice 10 secteurs |
| `apps/tenants/seeders/billing_seeder.py` | Réécrit — 4 plans + gating + quotas |

### Frontend

| Fichier | Action |
|---------|--------|
| `src/types/api/billing.types.ts` | Modifié — `frais_installation`, unification types |
| `src/lib/constants.ts` | Modifié — 4 nouveaux plans, nouveaux slugs |
| `src/lib/sector-theme.ts` | Modifié — slugs frontend corrects, defaultFeatures mis à jour |

---

## État du build

```
npx tsc --noEmit
Found 4 errors in 2 files (PRÉ-EXISTANTS — non liés à S24)
  LeftCockpitPanel.tsx:4  — Tenant non exporté
  tenants.repository.ts:4 — Tenant, CreateTenantPayload, TenantFilters manquants
```

**0 erreur introduite par S24.** ✅

---

## Seed de référence (après flush)

```bash
docker-compose -f docker-compose.dev.yml exec api python manage.py flush
docker-compose -f docker-compose.dev.yml exec api python manage.py seed

# Résultat attendu :
# 10 secteurs · 24 features · 124 SectorFeatures
# 4 plans · 79 PlanFeature base · 12 PlanFeature sectorielles
# 2 providers paiement · 3 users démo · 19 AIActions · 11 HelpEntries
```

---

## Plan S25 — Session suivante

### Priorité 1 — Stabiliser le build (15 min)
Corriger les 4 erreurs TypeScript pré-existantes :
ajouter `Tenant`, `CreateTenantPayload`, `TenantFilters` dans `src/types/api/index.ts`
et aligner `tenants.repository.ts`.

### Priorité 2 — Corriger l'onboarding (30 min)
`BUG-S24-04` : Dans `apps/tenants/setup.py`, remplacer `Plan.objects.get(slug='gratuit')`
par `Plan.objects.get(slug='decouverte')` pour que les nouveaux users démo
reçoivent le bon abonnement.

`BUG-S24-05` : Trouver et corriger la référence hardcodée à `conciergerie` dans
le bootstrap hôtel.

### Priorité 3 — Page Modules (conception + génération)
Concevoir et implémenter la page permettant à un PME de :
- Voir ses features actives avec leur quota consommé / quota total
- Upgrade son plan directement depuis la page
- Acheter du quota supplémentaire (FeatureOrder)
- Comprendre ce qui se débloque avec le plan supérieur

### Priorité 4 — Page Billing mise à jour
Mettre à jour `src/app/(dashboard)/billing/` pour afficher :
- `frais_installation` dans la sélection de plan
- Les 4 nouveaux plans avec leurs vrais prix
- L'indicateur de quota par feature (lié aux PlanFeature)

---

## Entrée INDEX.md

```markdown
## session_24_gabriel

- **Type :** Conception produit + Génération full-stack — Refonte Plans & Features
- **Date :** 2026-05-14
- **Flux couverts :** Modèle économique complet (features, plans, quotas, gating, secteurs)
- **Bugs corrigés :** BUG-S24-01 (features fantômes), BUG-S24-02 (FK PROTECTED Plan delete), BUG-S24-03 (slugs sector-theme)
- **Zones touchées :**
  - `apps/billing/models.py` (+frais_installation)
  - `apps/billing/migrations/0004_plan_frais_installation.py` (NEW)
  - `apps/billing/serializers.py`
  - `apps/admin_api/serializers/plans.py`
  - `apps/tenants/seeders/features_seeder.py` (réécrit)
  - `apps/tenants/seeders/billing_seeder.py` (réécrit)
  - `src/types/api/billing.types.ts`
  - `src/lib/constants.ts`
  - `src/lib/sector-theme.ts`
- **Fichiers créés :** `0004_plan_frais_installation.py`
- **Fichiers modifiés :** 8
- **Migrations :** `billing.0004` ✅
- **Seed validé :** flush + seed complet ✅ (24 features, 4 plans, 124 SectorFeatures)
- **Build TypeScript :** 0 erreur nouvelle (4 pré-existantes Tenant — non liées)
- **Décisions majeures :**
  - Option B pricing (quotas comme levier commercial)
  - 4 plans : Découverte 10k/gratuit · Starter 50k/100k · Business 150k/250k · Pro 300k/500k
  - 2 familles features : A (gratuit/illimité) · B (quota rechargeable)
  - Gating : commande/paiement/inscription dès Starter · prospection dès Business
  - gestion_crm is_mandatory=True dans tous les secteurs
  - Agent vocal = minutes (pas appels)
  - Recharge toujours plus chère que plan équivalent
- **Dettes créées :** BUG-S24-04 (setup.py plan gratuit), BUG-S24-05 (conciergerie bootstrap), DETTE-S24-01 à 04
- **Rapport :** `docs/reports/session_24_gabriel.md`
- **Session suivante (S25) :** Stabiliser build + corriger onboarding + Page Modules + Billing
```