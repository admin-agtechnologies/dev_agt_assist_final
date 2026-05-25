# Template rapport de feature B5
> Un fichier par feature, par membre.
> Chemin : docs/testing/features/{membre}/{feature_slug}.md
> Signaler verbalement à Gabriel quand le rapport est prêt.

---

# Rapport feature — {feature_slug}

## Métadonnées
| Champ | Valeur |
|---|---|
| Feature | {feature_slug} |
| Membre | {prénom} |
| Session(s) | S{N} |
| Date | {date} |
| Statut | ✅ Complète / ⚠️ Partielle / ❌ Bloquée |

---

## Phase 1 — Config
> Tab Config du bot WhatsApp Demo sur demo-custom@agt.cm

- Feature visible dans "Features & Actions Autorisées" : ✅ / ❌
- Actions associées actives (liste) :
  - `{action_slug}` : ✅ / ❌
  - `{action_slug}` : ✅ / ❌
- Observations / anomalies config :

---

## Phase 2 — Skills améliorés
> Fichiers modifiés dans apps/agent/skills/

| Fichier | Ce qui a été amélioré |
|---|---|
| `skills/features/{feature_slug}.md` | ... |
| `skills/actions/{action}.md` | ... |

---

## Phase 3 — Test E2E
> WhatsApp Simulator — compte demo-custom@agt.cm

### Scénario testé
| # | Message envoyé | Action déclenchée | Résultat attendu | Résultat réel |
|---|---|---|---|---|
| 1 | "..." | `{action}` | ... | ✅ / ❌ |
| 2 | "..." | `{action}` | ... | ✅ / ❌ |
| 3 | "..." | — | Reply de confirmation | ✅ / ❌ |

### Observations
(Comportement du bot, qualité des réponses, cas limites rencontrés)

---

## Phase 4 — Résultats

### Niveau 1 — /résultats
- Onglet concerné : {nom de l'onglet}
- Objet créé visible : ✅ / ❌
- Données correctes : ✅ / ❌ / ⚠️ {détail}

### Niveau 2 — /bots (onglets)
- Conversations : ✅ / ❌
- Actions effectuées : ✅ / ❌
- Sessions test : ✅ / ❌

### Bugs corrigés (isolés)
| Fichier | Bug | Fix appliqué |
|---|---|---|
| `apps/agent/actions/{fichier}.py` | ... | diff ~{N} lignes |

---

## Bugs centraux à signaler à Gabriel
> Ces bugs touchent des fichiers partagés — ne pas modifier, signaler verbalement.

| Fichier concerné | Description du bug | Impact |
|---|---|---|
| `{fichier central}` | ... | 🔴 Bloquant / 🟡 Dégradé |

---

## Statut final
- [ ] Phase 1 Config ✅
- [ ] Phase 2 Skills ✅
- [ ] Phase 3 Test E2E ✅
- [ ] Phase 4 Résultats ✅
- [ ] Rapport complet → signalé verbalement à Gabriel

**Prochaine feature :** {feature_slug_suivant}