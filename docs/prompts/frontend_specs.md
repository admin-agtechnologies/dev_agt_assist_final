# frontend_specs.md — Règles obligatoires Frontend AGT BOT
> Document de référence. À lire obligatoirement avant tout travail frontend.
> Dernière mise à jour : Session 55 — Gabriel — 23/05/2026

---

## 1. COULEURS — RÈGLE ABSOLUE

**Zéro couleur hardcodée. Sans exception.**

Toutes les couleurs passent par `useSector().theme` ou les CSS variables du design system.

```tsx
// ❌ INTERDIT
style={{ backgroundColor: "#075E54" }}
className="bg-[#25D366]"
className="text-emerald-500"

// ✅ CORRECT
style={{ backgroundColor: theme.primary }}
style={{ backgroundColor: theme.accent }}
className="text-[var(--text)]"
className="bg-[var(--border)]"
```

Couleurs disponibles via `useSector().theme` :
- `theme.primary` — couleur principale sobre (fonds, headers, boutons primaires)
- `theme.accent` — couleur vive (CTA, badges, sélections actives)
- `theme.bg` — fond sectoriel

CSS variables disponibles partout :
- `var(--text)` · `var(--text-muted)` · `var(--bg)` · `var(--bg-card)` · `var(--border)`

---

## 2. TEXTE — I18N STRICT

**Zéro string en dur dans les composants. Sans exception.**

Tout texte visible par l'utilisateur passe par `useLanguage()` + dictionnaire.

```tsx
// ❌ INTERDIT
<p>Aucune session en cours.</p>
<button>Enregistrer</button>
title="Configuration du bot"

// ✅ CORRECT
<p>{t.testSessionsEmpty}</p>
<button>{t.configSave}</button>
title={t.configReadonlyTitle}
```

Processus pour ajouter un texte :
1. Ajouter la clé dans `src/dictionaries/fr/bots.fr.ts`
2. Ajouter la clé dans `src/dictionaries/en/bots.en.ts`
3. Utiliser `t.maCle` dans le composant

---

## 3. TAILLE DES FICHIERS

**Maximum 200 lignes par fichier (tolérance : ±30).**

Si un composant dépasse cette limite :
- Extraire la logique d'état dans un hook dédié `useXxx.ts`
- Extraire les sous-sections en composants `_ui/SectionXxx.tsx`
- Extraire les constantes dans `xxx.constants.ts`
- Extraire les types dans `xxx.types.ts`

---

## 4. TYPESCRIPT — ZÉRO ERREUR

**`npx tsc --noEmit` doit retourner 0 erreur après chaque livraison.**

Règles strictes :
- Zéro `any` implicite — typer explicitement tout paramètre
- Zéro import fantôme — vérifier que les modules importés existent bien au chemin indiqué
- Pour les chemins relatifs avec `[id]` dans Next.js, utiliser `-LiteralPath` en PowerShell pour lire les fichiers

---

## 5. CHEMINS D'IMPORT

**Toujours vérifier les chemins relatifs avant livraison.**

Pour les fichiers dans des dossiers profonds (ex: `[id]/test/_components/modals/`), compter le nombre exact de niveaux pour remonter. En cas de doute, utiliser les alias `@/` :

```tsx
// Préférer les alias quand possible
import { BotConfigSections } from "@/app/(dashboard)/bots/_components/tabs/_ui/BotConfigSections";

// Sinon compter précisément
// modals/ → _components/ → test/ → [id]/ → bots/ → ...
```

---

## 6. RÉUTILISATION — COMPOSANTS PARTAGÉS

**Avant de créer un nouveau composant, chercher s'il existe déjà.**

Composants partagés à réutiliser en priorité :
- `Accordion`, `CheckRow`, `useInputFocus` → `tabs/_ui/BotConfigElements.tsx`
- `BotConfigSections` → `tabs/_ui/BotConfigSections.tsx` (modes `edit` / `readonly`)
- `PanelAccordion` → `test/_components/_ui/PanelAccordion.tsx`
- `Overlay`, `ModalHeader` → `test/_components/_ui/modal-primitives.tsx`
- `PageHeader`, `Badge`, `Spinner`, `EmptyState` → `@/components/ui`
- `useToast()` → retourne `{success, error, info, warning}` — PAS `toast({type, message})`
- `useSector()` → `@/hooks/useSector` — NE JAMAIS dupliquer
- `useLanguage()` → `@/contexts/LanguageContext`

---

## 7. PATCH AUTO VS BOUTON SAVE

Règle de décision pour les interactions utilisateur :

| Type de champ | Comportement |
|---|---|
| Checkbox / Toggle binaire | **Patch auto immédiat** — appel API au clic, pas de bouton Save |
| Champs texte libres (input, textarea) | **Bouton Save explicite** — l'utilisateur valide intentionnellement |
| Slider numérique (température, etc.) | **Bouton Save explicite** |
| Pills de sélection (ton, langues) | **Bouton Save explicite** (font partie d'un formulaire) |

---

## 8. PROPS NOMMAGE — CONVENTIONS

- Handlers : toujours préfixer par `on` → `onToggle`, `onSave`, `onClose`, `onRefresh`
- Setters d'état passés en prop : préfixer par `set` → `setNom`, `setTon`
- Booléens : préfixer par `is` ou `has` → `isLoading`, `hasError`
- Ne jamais passer `setState` directement comme prop quand un handler nommé est plus clair

---

## 9. STRUCTURE DES DOSSIERS BOTS (référence)

```
src/app/(dashboard)/bots/
├── page.tsx                          — liste des bots
├── _components/
│   ├── bots.types.ts                 — BotPair, types locaux
│   ├── BotPairCard.tsx
│   ├── BotFormModal.tsx
│   ├── BotPairDetailPanel.tsx
│   ├── feature-tab-manifest.ts
│   └── tabs/
│       ├── bot-config.constants.ts   — FEATURE_GROUPS, SECTIONS_KB, TON_OPTIONS, LANGUES_OPTIONS
│       ├── BotConfigTab.tsx          — orchestrateur tab Config
│       ├── StatsTab.tsx
│       ├── ConversationsTab.tsx
│       └── _ui/
│           ├── BotConfigElements.tsx — Accordion, CheckRow, useInputFocus
│           ├── BotConfigSections.tsx — composant partagé 5 sections (edit + readonly)
│           └── _sections/            — sous-composants de BotConfigSections
│               ├── types.ts
│               ├── SectionBasics.tsx
│               ├── SectionIA.tsx
│               ├── SectionKB.tsx
│               └── SectionReadonly.tsx
└── [id]/test/
    ├── page.tsx
    └── _components/
        ├── ConversationPanel.tsx
        ├── WhatsAppSimulator.tsx
        ├── VoiceDemoPlayer.tsx
        ├── action-helpers.ts
        ├── _ui/
        │   ├── PanelAccordion.tsx
        │   ├── ActionsLog.tsx
        │   ├── BotConfigElements.tsx
        │   └── modal-primitives.tsx
        └── modals/
            ├── ActionModals.tsx
            └── SystemModals.tsx      — ModalConfigIA + ModalVideoDemo
```

---

## 10. POWERSHELL — LECTURE DE FICHIERS NEXT.JS

Les crochets `[id]` dans les chemins Next.js cassent `Get-Content`. Toujours utiliser `-LiteralPath` :

```powershell
# ❌ Échoue silencieusement
Get-Content "src\app\(dashboard)\bots\[id]\test\page.tsx"

# ✅ Correct
Get-Content -LiteralPath "C:\chemin\complet\src\app\(dashboard)\bots\[id]\test\page.tsx" | Set-Clipboard
```