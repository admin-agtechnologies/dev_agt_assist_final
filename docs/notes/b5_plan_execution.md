# B5 — Plan d'exécution validé
> **Document de référence permanente — À LIRE au début de chaque session B5**
> Validé par Gabriel — Session 38 — 20 mai 2026
> ⚠️ Ne pas modifier sans accord explicite de Gabriel.

---

## Contexte dashboards — décisions prises

| Dashboard | Destinataire | Chantier |
|---|---|---|
| Dashboard tenant/métier | Entreprise cliente (stats, KB, résultats, config bot) | C1 — B6 (Penka) |
| Dashboard admin AGT | AGT opérateur (config secteurs, features-matrix, stats cross-tenants) | C2 |
| Dashboard développeur | Équipe technique AGT (skills, monitoring, debug agent, cache) | C2 |

---

## Ordre d'exécution B5 — non négociable

### Étape 1 — Finir le socle KB
- Formulaires manquants : `CatalogueProduitTab`, `CatalogueServiceTab`, `CatalogueTrajetTab`
- Fix `CitoyensTab`, `InscriptionsTab`, `FaqTab` (champs S33 manquants)
- Migration ItemCatalogue : S1/S2 → S3 (source canonique unique)
- Critère de sortie : 18/18 tabs ✅, migration validée sur compte de test Gabriel

### Étape 2 — Conception pages Résultats
- **Pas de génération avant conception.**
- Auditer les modèles tels qu'ils existent après S33 + les actions bot réelles
- Déduire le nombre exact de types de résultats (nombre à déterminer par audit — ne jamais supposer)
- Gabriel valide le nombre et la structure avant toute génération

### Étape 3 — Génération pages Résultats templates
- Générer les composants `*ResultCard` et pages dédiées selon la conception validée en Étape 2
- Réutilisation maximale — composants génériques paramètrables

### Étape 4 — Audit & conception actions bot spécialisées
- Auditer les features telles qu'elles existent après S33 (modèles, données, relations)
- Déduire la liste exacte des actions à créer/modifier (pas supposée d'avance)
- Concevoir chaque action : paramètres, logique, retour attendu, gardes-fous
- Gabriel valide la liste et la conception avant toute implémentation

### Étape 5 — Implémentation actions bot spécialisées
- Implémenter chaque action selon la conception validée en Étape 4
- Exemples attendus (liste non exhaustive — affinée en Étape 4) :
  `search_faq`, `get_menu`, `get_catalogue`, `get_services`,
  `get_trajets`, `get_room_types`, `get_order_status`
- Sécurité `get_order_status` : vérifier `Commande.contact.phone == conversation.contact.phone`

### Étape 6 — Architecture & écriture skills

#### Principe — Architecture hybride 3 couches

| Élément | Stockage | Cache | Modifiable sans redéploi |
|---|---|---|---|
| System prompt central | Fichier disque | Mémoire Django (`lru_cache`) | Non — versionné git |
| Skills actions | Fichiers disque | Mémoire Django (`lru_cache`) | Non — lié au code Python |
| Skills features | BD (`AgentSkill`) | Redis TTL 1h | Oui |
| Skills secteurs | BD (`AgentSkill`) | Redis TTL 1h | Oui |
| Config tenant | BD | Non | Oui |
| KB tenant | BD | Non | Oui |

**Modèle Django à créer :**
```python
class AgentSkill(models.Model):
    NIVEAU = [('feature', 'Feature'), ('secteur', 'Secteur')]
    niveau     = CharField(choices=NIVEAU)
    slug       = SlugField()       # feature slug ou secteur slug
    contenu_md = TextField()
    version    = IntegerField(default=1)
    updated_at = DateTimeField(auto_now=True)
    # Signal post_save → invalide cache Redis automatiquement
```

**Structure fichiers disque :**
```
apps/agent/skills/
  _central/
    system_prompt.md     ← comportement global + instructions utilisation skills
  actions/
    search_faq.md
    get_menu.md
    get_order_status.md
    ...                  ← un fichier par action
```

**Injection sélective dans ContextBuilder :**
Le ContextBuilder ne charge pas tous les skills — il sélectionne :
1. Toujours : system prompt central (~500 tokens)
2. Toujours : skill secteur du tenant (~300 tokens)
3. Par feature active du bot : skill feature correspondant (~200 tokens)
4. Skills actions référencés uniquement par les features actives (~150 tokens/action)

→ Un tenant avec 5 features actives charge ~2 000 tokens de skills au lieu de 15 000+.

#### Format optimisé LLM pour chaque skill

```markdown
## QUAND
[1-2 phrases max — condition déclenchante]

## COMMENT
[étapes numérotées courtes]

## PARAMÈTRES
[tableau : nom | type | obligatoire | exemple]

## GARDES-FOUS
[liste bullets — ce que le bot ne doit JAMAIS faire]

## EXEMPLE
[JSON d'appel correct]
```

#### Ordre d'écriture des skills
1. System prompt central (Niveau 0) — chef d'orchestre, dit comment utiliser les skills
2. Skills actions (Niveau 1) — un par action implémentée en Étape 5
3. Skills features (Niveau 2) — un par feature, référence les skills actions concernés
4. Skills secteurs (Niveau 3) — un par secteur, vocabulaire + ton + gardes-fous sectoriels

### Étape 7 — Script de test en 2 phases

#### Phase A — Test actions isolées
- Mock conversation, tester chaque action indépendamment
- Valider que chaque action persiste correctement en base
- **Critère de sortie : 100% des actions persistent correctement**

#### Phase B — Test agent-LLM complet
- L'agent utilise les skills correctement
- Enchaîne les bonnes actions dans le bon ordre
- Respecte les gardes-fous
- **Critère de sortie : script passe sans erreur sur les scénarios nominaux**

### Étape 8 — 28 itérations features (interface de test interne)
Pour chaque feature non différée, dérouler les 8 étapes :
```
a. Modèle KB        — champs en BD, booléens positionnés
b. Tab config       — tab /knowledge opérationnel
c. Config bot       — feature apparaît dans config bot, cochable/décochable
d. Agent lit KB     — agent interroge bien la KB en début de conversation
e. Agent écrit      — agent persiste dans la bonne table de résultats
f. Page Résultats   — template branché et personnalisé
g. Test E2E interne — config → conversation → résultat persisté → résultat visible
h. Validation Gabriel — validation explicite sur la chaîne complète
```
**Une feature n'est "faite" que quand les 8 points sont validés par Gabriel.**
Test via l'interface interne — pas WhatsApp à ce stade.

### Étape 9 — Bascule webhook WhatsApp
- Brancher `apps/agent/` en remplacement de `chatbot_bridge/production_actions.py`
- **Fait après les 28 itérations** — base saine et testée sur interface interne
- Le webhook valide la même chaîne sur WhatsApp live
- Debug facilité : base prouvée = tout problème est isolé au canal WhatsApp

---

## Features hors scope Chantier 1 (ne pas itérer)
| Feature | Raison | Chantier |
|---|---|---|
| `commande_paiement` | Provider paiement requis | C2 |
| `paiement_en_ligne` | Accord Orange Money / MTN | C2 |
| `agent_vocal` | Pipeline STT/TTS | C2 |
| `dashboard` | Couvert par B6 (Penka) | B6 |

---

## Règles permanentes B5

- **Le modèle de données est la source de vérité.** L'agent se conforme aux modèles, pas l'inverse.
- **Pas de génération sans conception validée** — vaut pour les pages Résultats ET les actions bot.
- **Pas de modification de modèle de données** sans relire les PDFs de conception (features 1-12 et 13-28).
- **Pas de skip d'étape** dans les 8 points de l'itération feature.
- **Script test Phase A + Phase B validés avant tout test interface** — toujours.
- **Webhook en dernier** — toujours après les 28 itérations.
- Le nombre de types de Résultats et la liste exacte des actions sont à déterminer par audit — **ne jamais supposer**.
- Les skills actions sont sur disque (versionnés git). Les skills features et secteurs sont en BD (éditables sans redéploiement).
