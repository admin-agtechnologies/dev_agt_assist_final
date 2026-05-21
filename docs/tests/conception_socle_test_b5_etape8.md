# Conception — Socle Test B5 Étape 8
> Rédigé en Session 49 — Gabriel — 21/05/2026
> Statut : **CONCEPTION COMPLÈTE VALIDÉE — Non implémentée**
> À lire obligatoirement avant toute implémentation de ce périmètre.

---

## 1. Contexte & Objectif

### Situation de départ (S49)

À l'entrée de cette session, l'état B5 était :

| Étape | Statut |
|---|---|
| Étape 1 — Socle KB | ✅ |
| Étape 2 — Conception Résultats | ✅ |
| Étape 3 — Pages Résultats | ✅ |
| Étape 4 — Audit actions bot | ✅ |
| Étape 5 — 40 actions implémentées | ✅ |
| Étape 6 — Skills (78 .md + AgentSkill BD) | ✅ |
| Étape 7 — Tests 68/68 (N1 + N2 + N3) | ✅ |
| **Étape 8 — 28 itérations features** | ⏳ **PROCHAINE** |
| Étape 9 — Bascule webhook WhatsApp | ⏳ |

### Problème identifié

Tester les 28 features seul (Gabriel) = risque de 2 jours de travail séquentiel.
La solution : **parallélisation avec l'équipe** (Gabriel + Steven + Stéphane,
avec Penka et Steve possibles à tout moment).

---

## 2. Stratégie de parallélisation — Décisions validées

### Modèle retenu : Kanban queue

- Les features sont listées dans `docs/testing/FEATURES_QUEUE.md` partagé
- Chaque feature est **libre** jusqu'à ce que Gabriel y mette un prénom
- **Gabriel assigne** pour éviter les prises simultanées conflictuelles
- Une feature = un testeur à la fois

### Règles de résolution de bugs

| Type de bug | Responsable | Règle |
|---|---|---|
| Bug **frontend** | Le testeur qui l'a trouvé | Peut corriger seul |
| Bug **backend** | **Gabriel uniquement** | Personne d'autre ne touche le backend |
| Bug **ambigu** | Testeur → Gabriel avant toute action | Signaler sans tenter de fix |

### Prérequis avant d'envoyer les testeurs

Trois prérequis doivent être implémentés **en amont de toute attribution** :

1. `BotConfigTab.tsx` v2 — l'entreprise configure clairement les droits du bot
2. `ConversationPanel.tsx` v2 — le testeur voit les actions déclenchées en temps réel
3. `FEATURES_QUEUE.md` — le kanban partagé

---

## 3. Décisions architecturales clés (S49)

### A. `sections_actives` — rôle et traitement UI

Le champ `Bot.sections_actives` (JSONField, introduit S23) est devenu redondant
avec l'architecture Skills (Étape 6) : le `ContextBuilder` se base désormais
sur `features_autorisees_slugs` pour charger les skills actives.

**Décision validée :**
- `sections_actives` **reste en base et en backend** — aucune migration
- `sections_actives` **disparaît de l'interface** dans `BotConfigTab`
- Le state est conservé en mémoire côté frontend et continué d'être envoyé
  dans `handleSave()` — le backend gère, l'utilisateur ne voit pas
- L'entreprise configure **uniquement** les features autorisées

### B. Affichage des features — sans badge secteur

Pas de badge "secteur principal" par feature dans `BotConfigTab`.
Rationale : l'architecture est flexible — l'admin AGT assigne les features
dynamiquement. Afficher un secteur "Hôtel" sur une feature d'un compte restaurant
frustrerait l'utilisateur inutilement.

### C. Backend sérialisation des actions — Option A (nested)

`AIConversationSerializer` n'expose pas les `AIActionLog`.
Le frontend attend `actions_declenchees` mais le champ est toujours vide.

**Décision : Option A — nested serializer** (pas de nouvel endpoint)
- Ajouter `AIActionLogSerializer` dans `AIConversationSerializer`
- Un seul appel GET — la conversation de test a peu d'actions

---

## 4. Livrable A — `BotConfigTab.tsx` v2

**Fichier :** `src/app/(dashboard)/bots/_components/tabs/BotConfigTab.tsx`
**Taille estimée :** ~200 lignes

### 4.1 Suppression de l'accordéon sections_actives

```tsx
// Conservé mais JAMAIS rendu — ne pas supprimer ce state
const [sectionsActives, setSectionsActives] = useState<string[]>(
  bot.sections_actives ?? []
);
// handleSave() continue d'envoyer sections_actives: sectionsActives
```

### 4.2 Groupement features — const à déclarer hors composant

```tsx
import {
  Bot, CalendarDays, ShoppingBag, Users,
  Landmark, Coins, Sparkles
} from "lucide-react";

const FEATURE_GROUPS: Array<{
  key: string;
  icon: React.ElementType;
  label: string;
  slugs: string[];
}> = [
  {
    key: "core",
    icon: Bot,
    label: "Core",
    slugs: ["chatbot_whatsapp", "faq", "suivi_commande", "transfert_humain"],
  },
  {
    key: "rdv",
    icon: CalendarDays,
    label: "Réservations",
    slugs: ["prise_rdv", "reservation_table", "reservation_chambre", "reservation_billet"],
  },
  {
    key: "catalogue",
    icon: ShoppingBag,
    label: "Catalogue & Ventes",
    slugs: ["menu_digital", "catalogue_produits", "catalogue_services", "catalogue_trajets"],
  },
  {
    key: "crm",
    icon: Users,
    label: "CRM & Prospection",
    slugs: ["gestion_crm", "capture_prospect", "emails_rappel", "communication"],
  },
  {
    key: "public",
    icon: Landmark,
    label: "Public & Éducation",
    slugs: ["inscription_admission", "orientation_patient", "orientation_citoyens", "multi_agences"],
  },
  {
    key: "finance",
    icon: Coins,
    label: "Finance",
    slugs: ["catalogue_produits_financiers", "simulation_credit", "suivi_dossier", "collecte_documents"],
  },
  {
    key: "custom",
    icon: Sparkles,
    label: "Custom",
    slugs: ["conciergerie"],
  },
];
```

### 4.3 Logique de rendu des groupes

```tsx
{FEATURE_GROUPS.map(group => {
  const groupFeatures = features.filter(f => group.slugs.includes(f.slug));
  if (groupFeatures.length === 0) return null; // groupe vide = masqué

  return (
    <div key={group.key} className="mb-4">
      <div className="flex items-center gap-2 mb-2 pb-1 border-b border-[var(--border)]">
        <group.icon className="w-4 h-4 text-[var(--text-muted)]" />
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          {group.label}
        </span>
      </div>
      {groupFeatures.map(feature => (
        <CheckRow
          key={feature.id}
          checked={featuresSet.includes(feature.id)}
          onChange={() => toggle(featuresSet, setFeaturesSet, feature.id)}
          label={feature.nom_fr}
          sub={feature.description_fr ?? undefined}          // nouveau champ backend
          badge={feature.entreprise_configure_kb ? "KB requise" : undefined}  // nouveau champ backend
          colors={colors}
        />
      ))}
    </div>
  );
})}
```

**Badge "KB requise" :** couleur warning/orange — indique que cette feature
nécessite une configuration dans /knowledge avant que le bot puisse l'utiliser.

### 4.4 Prérequis backend — `ActiveFeatureSerializer`

**Fichier :** `apps/features/serializers.py`

`ActiveFeatureSerializer` n'expose pas `description_fr` ni `entreprise_configure_kb`.
Ces champs existent en BD sur le modèle `Feature`.

**Diff `ActiveFeatureSerializer` :**
```python
description_fr          = serializers.CharField(required=False, allow_blank=True)
entreprise_configure_kb = serializers.BooleanField(required=False)
```

**Diff service layer** (fonction `get_features_with_quota`) :
```python
"description_fr":          feature.description_fr,
"entreprise_configure_kb": feature.entreprise_configure_kb,
```

**Diff type frontend** (`ActiveFeature`) :
```typescript
description_fr?: string;
entreprise_configure_kb?: boolean;
```

> Si ce prérequis backend n'est pas implémenté, omettre le badge et le `sub`.
> Le groupement fonctionne sans.

---

## 5. Livrable B — Backend `AIConversationSerializer`

**Fichier :** `apps/agent/serializers.py`

### Diff complet (~30 lignes)

```python
# Ajouter AVANT AIConversationSerializer
class AIActionLogSerializer(serializers.ModelSerializer):
    action_slug = serializers.CharField(source="action.slug", read_only=True)

    class Meta:
        model  = AIActionLog
        fields = ["id", "action_slug", "statut", "response_recue", "duree_ms", "created_at"]
        read_only_fields = fields


# Modifier AIConversationSerializer
class AIConversationSerializer(serializers.ModelSerializer):
    messages            = AIMessageSerializer(many=True, read_only=True)
    actions_declenchees = AIActionLogSerializer(
        source="action_logs",   # vérifier le related_name sur AIActionLog.conversation FK
        many=True,
        read_only=True,
    )

    class Meta:
        model  = AIConversation
        fields = [
            "id", "agent", "agence", "contact", "canal", "mode",
            "statut", "contexte", "messages",
            "actions_declenchees",  # NOUVEAU
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "contexte", "created_at", "updated_at"]
```

> ⚠️ Vérifier le `related_name` dans `apps/agent/models/ai_message.py`.
> Si différent de `action_logs`, ajuster `source=` en conséquence.

**Test invoque-request après implémentation :**
```
GET /api/v1/agent/conversations/{id}/
→ "actions_declenchees" présent et non vide
→ "response_recue" contient les données JSON de l'action
```

---

## 6. Livrable C — `agent.types.ts` (diff)

**Fichier :** `src/types/api/agent.types.ts`

```typescript
// AVANT
export interface AIActionDeclenchee {
  action_slug: string;
  statut: 'succes' | 'echec' | 'en_cours';
  created_at: string;
}

// APRÈS
export interface AIActionDeclenchee {
  id: string;
  action_slug: string;
  statut: 'succes' | 'echec' | 'en_cours' | 'timeout' | 'validation_failed';
  response_recue?: Record<string, unknown>; // données persistées — NOUVEAU
  duree_ms?: number;                        // temps d'exécution ms — NOUVEAU
  created_at: string;
}
```

---

## 7. Livrable D — `ConversationPanel.tsx` v2

**Fichier :** `src/app/(dashboard)/bots/[id]/test/_components/ConversationPanel.tsx`
**Taille estimée :** ~200 lignes

### Structure — 3 zones

```
┌──────────────────────────────────────────┐
│  ZONE 1 — Header                         │
│  Nom du bot  ·  Badge statut conv.       │
├──────────────────────────────────────────┤
│  ZONE 2 — Features actives du bot        │
│  Chips 2 colonnes :                      │
│  [✅ FAQ] [✅ Menu digital]              │
│  [✅ Prise RDV] [⚠️ Catalogue]          │
├──────────────────────────────────────────┤
│  ZONE 3 — Timeline actions               │
│  Icône + label + badge statut + durée    │
│  Résumé payload (1 ligne)                │
└──────────────────────────────────────────┘
```

### Map `ACTION_META` — lucide-react (hors composant)

```tsx
import {
  MessageCircle, CalendarCheck, CalendarSearch,
  UtensilsCrossed, ShoppingCart, Package, Bus,
  ClipboardList, Mail, Search, UserCheck,
  PhoneForwarded, CreditCard, Building2,
  Stethoscope, GraduationCap, FileText,
  Wallet, ArrowRightLeft, Calculator,
  PiggyBank, Wrench, Megaphone, HelpCircle,
  Network, BookOpen, FolderOpen, Receipt, Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ActionMeta { icon: LucideIcon; label: string }

const ACTION_META: Record<string, ActionMeta> = {
  search_faq:                  { icon: MessageCircle,   label: "FAQ consultée" },
  create_reservation:          { icon: CalendarCheck,   label: "Réservation créée" },
  check_disponibilite:         { icon: CalendarSearch,  label: "Dispo vérifiée" },
  get_menu:                    { icon: UtensilsCrossed, label: "Menu consulté" },
  create_commande:             { icon: ShoppingCart,    label: "Commande créée" },
  get_catalogue:               { icon: Package,         label: "Catalogue consulté" },
  get_catalogue_sectoriel:     { icon: Package,         label: "Catalogue sectoriel" },
  get_trajets:                 { icon: Bus,             label: "Trajets consultés" },
  create_prospect:             { icon: ClipboardList,   label: "Contact collecté" },
  send_email:                  { icon: Mail,            label: "Email envoyé" },
  suivi_commande:              { icon: Search,          label: "Commande suivie" },
  transfer_to_human:           { icon: PhoneForwarded,  label: "Transfert humain" },
  initiate_payment:            { icon: CreditCard,      label: "Paiement initié" },
  get_services:                { icon: Wrench,          label: "Services consultés" },
  get_room_types:              { icon: Building2,       label: "Chambres consultées" },
  get_specialites:             { icon: Stethoscope,     label: "Spécialités consultées" },
  create_inscription:          { icon: GraduationCap,   label: "Inscription créée" },
  create_dossier:              { icon: FileText,        label: "Dossier créé" },
  get_dossier_status:          { icon: FolderOpen,      label: "Dossier consulté" },
  get_solde:                   { icon: Wallet,          label: "Solde consulté" },
  create_virement:             { icon: ArrowRightLeft,  label: "Virement initié" },
  simulate_pret:               { icon: Calculator,      label: "Prêt simulé" },
  get_produits_financiers:     { icon: PiggyBank,       label: "Produits consultés" },
  send_communication:          { icon: Megaphone,       label: "Communication envoyée" },
  get_services_citoyens:       { icon: Network,         label: "Services citoyens" },
  get_programme_admission:     { icon: BookOpen,        label: "Programme consulté" },
  create_relance:              { icon: Receipt,         label: "Relance créée" },
  update_context:              { icon: UserCheck,       label: "Contexte mis à jour" },
  get_concierge_services:      { icon: Building2,       label: "Conciergerie consultée" },
  gestion_crm:                 { icon: Users,           label: "CRM mis à jour" },
  _default:                    { icon: HelpCircle,      label: "Action déclenchée" },
};

function getActionMeta(slug: string): ActionMeta {
  return ACTION_META[slug] ?? ACTION_META._default;
}
```

### Helper `summarizePayload` (hors composant)

```typescript
function summarizePayload(
  slug: string,
  response: Record<string, unknown> | undefined
): string | null {
  if (!response) return null;
  const s = (v: unknown) => (v != null ? String(v) : null);
  switch (slug) {
    case "create_reservation":
      return [s(response.ressource_nom), s(response.contact_nom),
              s(response.heure_debut)].filter(Boolean).join(" · ");
    case "search_faq":
      return s(response.question)?.slice(0, 60) ?? null;
    case "create_commande":
      return `${response.nb_items ?? "?"} article(s) · ${response.montant_total ?? "?"} XAF`;
    case "create_prospect":
      return [s(response.nom), s(response.phone)].filter(Boolean).join(" · ");
    case "suivi_commande":
      return s(response.statut_commande);
    case "simulate_pret":
      return `${response.mensualite ?? "?"} XAF/mois · ${response.duree_mois ?? "?"} mois`;
    case "get_solde":
      return `${response.solde ?? "?"} XAF`;
    case "create_inscription":
      return [s(response.programme_nom), s(response.statut)].filter(Boolean).join(" · ");
    case "get_menu":
      return `${response.nb_categories ?? "?"} catégorie(s)`;
    case "get_trajets":
      return [s(response.ville_depart), s(response.ville_arrivee)].filter(Boolean).join(" → ");
    default:
      return null;
  }
}
```

### Rendu Zone 3 — Timeline (pattern)

```tsx
{conversation.actions_declenchees.map(action => {
  const meta = getActionMeta(action.action_slug);
  const Icon = meta.icon;
  const summary = summarizePayload(action.action_slug, action.response_recue);
  const isOk = action.statut === "succes";

  return (
    <div key={action.id}
      className="flex gap-3 py-2.5 border-b border-[var(--border)] last:border-0">
      <div className={cn(
        "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
        isOk ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
      )}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-[var(--text)]">{meta.label}</span>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {action.duree_ms && (
              <span className="text-[10px] text-[var(--text-muted)]">{action.duree_ms}ms</span>
            )}
            <span className={cn(
              "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
              isOk ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-500"
            )}>
              {isOk ? "✓" : "✗"}
            </span>
          </div>
        </div>
        {summary && (
          <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">{summary}</p>
        )}
      </div>
    </div>
  );
})}
```

---

## 8. Livrable E — `FEATURES_QUEUE.md`

**Emplacement :** `docs/testing/FEATURES_QUEUE.md`

**Règles :**
- Gabriel met le prénom + date quand il assigne une feature
- Testeur coche les steps au fur et à mesure
- Bug frontend → note dans le fichier · Bug backend → appelle Gabriel

**Contenu :**

```markdown
# Features Queue — B5 Étape 8
> Règle : Gabriel assigne (prénom + date devant). 1 feature = 1 testeur à la fois.
> Steps : a=KB · b=Tab config · c=Config bot · d=Agent lit · e=Agent écrit
>         f=Résultats · g=E2E interne · h=Validation Gabriel
> Bug frontend : corriger seul + noter ici.
> Bug backend : STOP → appeler Gabriel avant tout fix.

---

## 🤖 Core
- [ ] **chatbot_whatsapp** — _libre_ — [ ]a [ ]b [ ]c [ ]d [ ]e [ ]f [ ]g [ ]h
- [ ] **faq** — _libre_ — [ ]a [ ]b [ ]c [ ]d [ ]e [ ]f [ ]g [ ]h
- [ ] **suivi_commande** — _libre_ — [ ]a [ ]b [ ]c [ ]d [ ]e [ ]f [ ]g [ ]h
- [ ] **transfert_humain** — _libre_ — [ ]a [ ]b [ ]c [ ]d [ ]e [ ]f [ ]g [ ]h
- [ ] **gestion_crm** — _libre_ — [ ]a [ ]b [ ]c [ ]d [ ]e [ ]f [ ]g [ ]h

## 📅 Réservations
- [ ] **prise_rdv** — _libre_ — [ ]a [ ]b [ ]c [ ]d [ ]e [ ]f [ ]g [ ]h
- [ ] **reservation_table** — _libre_ — [ ]a [ ]b [ ]c [ ]d [ ]e [ ]f [ ]g [ ]h
- [ ] **reservation_chambre** — _libre_ — [ ]a [ ]b [ ]c [ ]d [ ]e [ ]f [ ]g [ ]h
- [ ] **reservation_billet** — _libre_ — [ ]a [ ]b [ ]c [ ]d [ ]e [ ]f [ ]g [ ]h

## 🛒 Catalogue & Ventes
- [ ] **menu_digital** — _libre_ — [ ]a [ ]b [ ]c [ ]d [ ]e [ ]f [ ]g [ ]h
- [ ] **catalogue_produits** — _libre_ — [ ]a [ ]b [ ]c [ ]d [ ]e [ ]f [ ]g [ ]h
- [ ] **catalogue_services** — _libre_ — [ ]a [ ]b [ ]c [ ]d [ ]e [ ]f [ ]g [ ]h
- [ ] **catalogue_trajets** — _libre_ — [ ]a [ ]b [ ]c [ ]d [ ]e [ ]f [ ]g [ ]h

## 👥 CRM & Prospection
- [ ] **capture_prospect** — _libre_ — [ ]a [ ]b [ ]c [ ]d [ ]e [ ]f [ ]g [ ]h
- [ ] **emails_rappel** — _libre_ — [ ]a [ ]b [ ]c [ ]d [ ]e [ ]f [ ]g [ ]h
- [ ] **communication** — _libre_ — [ ]a [ ]b [ ]c [ ]d [ ]e [ ]f [ ]g [ ]h

## 🏛️ Public & Éducation
- [ ] **inscription_admission** — _libre_ — [ ]a [ ]b [ ]c [ ]d [ ]e [ ]f [ ]g [ ]h
- [ ] **orientation_patient** — _libre_ — [ ]a [ ]b [ ]c [ ]d [ ]e [ ]f [ ]g [ ]h
- [ ] **orientation_citoyens** — _libre_ — [ ]a [ ]b [ ]c [ ]d [ ]e [ ]f [ ]g [ ]h
- [ ] **multi_agences** — _libre_ — [ ]a [ ]b [ ]c [ ]d [ ]e [ ]f [ ]g [ ]h

## 💰 Finance (Banking)
- [ ] **catalogue_produits_financiers** — _libre_ — [ ]a [ ]b [ ]c [ ]d [ ]e [ ]f [ ]g [ ]h
- [ ] **simulation_credit** — _libre_ — [ ]a [ ]b [ ]c [ ]d [ ]e [ ]f [ ]g [ ]h
- [ ] **suivi_dossier** — _libre_ — [ ]a [ ]b [ ]c [ ]d [ ]e [ ]f [ ]g [ ]h
- [ ] **collecte_documents** — _libre_ — [ ]a [ ]b [ ]c [ ]d [ ]e [ ]f [ ]g [ ]h

## 🎭 Custom
- [ ] **conciergerie** — _libre_ — [ ]a [ ]b [ ]c [ ]d [ ]e [ ]f [ ]g [ ]h

---

## ❌ Hors scope Chantier 1
- **commande_paiement** → C2 (provider paiement externe requis)
- **paiement_en_ligne** → C2 (accord Orange Money / MTN requis)
- **agent_vocal** → C2 (pipeline STT/TTS)
- **dashboard** → B6 (Penka)
```

---

## 9. Ordre d'implémentation

```
1. Backend — Gabriel
   a. Vérifier related_name sur AIActionLog.conversation dans ai_message.py
   b. Diff AIActionLogSerializer + AIConversationSerializer (§5)
   c. Diff ActiveFeatureSerializer + service layer (§4.4)
   d. Test invoque-request :
      GET /api/v1/agent/conversations/{id}/ → "actions_declenchees" peuplé
      GET /api/v1/features/active/ → "description_fr" + "entreprise_configure_kb" présents

2. Frontend types — tout membre
   a. Diff agent.types.ts (§6)
   b. Mise à jour type ActiveFeature (§4.4)
   c. npx tsc --noEmit → 0 erreur avant de continuer

3. ConversationPanel v2 — tout membre
   a. Implémenter §7 complet
   b. Test : simulateur → envoyer message → vérifier Zone 3 peuplée

4. BotConfigTab v2 — tout membre
   a. Implémenter §4 complet
   b. Vérifier groupes visibles sur compte custom (toutes features actives)
   c. Vérifier badge "KB requise" sur faq, prise_rdv, menu_digital

5. FEATURES_QUEUE.md — Gabriel
   a. Créer docs/testing/FEATURES_QUEUE.md (§8)
   b. Partager avec l'équipe

6. Lancement parallèle
   a. Gabriel assigne 1 feature par testeur disponible
   b. Chaque testeur suit les steps a→h
   c. Bug frontend → corrige seul · Bug backend → Gabriel
```

---

## 10. Compte de test recommandé

Utiliser le compte **secteur `custom`** — il possède toutes les 28 features
actives (secteur "compte test ultime B5" dans `features_seeder.py`).
Demander les credentials à Gabriel en début de session.

---

## 11. Récapitulatif dévis

| Livrable | Fichier(s) | Backend | Lignes |
|---|---|---|---|
| A — BotConfigTab v2 | 1 modifié | ✅ Oui (ActiveFeatureSerializer) | ~200 |
| B — AIConversationSerializer | 1 modifié | ✅ Oui — bloquant | ~30 diff |
| C — agent.types.ts | 1 diff | — | ~8 diff |
| D — ConversationPanel v2 | 1 réécrit | Dépend de B | ~200 |
| E — FEATURES_QUEUE.md | 1 créé | — | ~60 |

**Total : 5 fichiers · ~500 lignes · 1 session suffisante si B validé en premier**
