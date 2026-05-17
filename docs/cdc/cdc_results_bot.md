# CDC — Sessions Résultats Bot (R1 / R2 / R3)
**AGT Platform — Knowledge × Bot × Results**
*Rédigé en fin de session — sert de contexte de départ pour les sessions R1, R2, R3*

---

## Vision produit

L'expérience complète d'un module sur AGT Platform se déroule en 3 temps :

```
[1] CONFIGURE      [2] BOT AGIT        [3] RÉSULTATS
────────────────   ─────────────────   ─────────────────────
Tenant écrit  →→→  Bot lit Knowledge   Bot écrit en BD
/knowledge         + modules actifs    pendant les conversations
                                       Tenant lit dans /results
```

**Règle fondamentale :**
- La Knowledge Base = ce que le bot SAIT (source de vérité statique, configurée par le tenant)
- Les Results = ce que le bot A FAIT (données opérationnelles, écrites en temps réel)
- Ces deux zones ne se mélangent jamais

---

## Architecture actuelle — état des lieux

### Ce qui existe et fonctionne ✅

**Knowledge Base (configurée par le tenant) :**
| Modèle | App backend | Tab frontend |
|---|---|---|
| ProfilEntreprise | `apps/knowledge` | EntrepriseTab |
| Agence + Horaires | `apps/tenants` | AgencesTab |
| FAQ / QuestionFrequente | `apps/knowledge` | FaqTab |
| MenuCategorie / MenuPlat | `apps/knowledge` | MenuTab |
| ChambreType | `apps/knowledge` | ChambresTab |
| CatalogueProduit / Service / Trajet / ProduitFinancier | `apps/knowledge` | CatalogueTab |
| ProgrammeAdmission | `apps/knowledge` | InscriptionsTab |
| SpecialiteMedicale | `apps/knowledge` | MedicalTab |
| ServiceCitoyen | `apps/knowledge` | CitoyensTab |

**Modèles Results (existent en BD) :**
| Modèle | App backend | Page frontend existante |
|---|---|---|
| Reservation | `apps/reservations` | `/modules/reservations` |
| Inscription | `apps/inscriptions` | `/modules/inscriptions` |
| Dossier | `apps/dossiers` | `/modules/dossiers` |
| Commande | `apps/catalogue` | `/modules/commandes` |
| Contact | `apps/contacts` | `/modules/contacts` |
| Conversation | `apps/conversations` | — |

### Ce qui manque ❌

1. **Le pont Bot → BD** : pour la majorité des features, le bot ne crée pas encore automatiquement les enregistrements Results pendant les conversations. Les modèles existent en base, mais les intent handlers côté chatbot sont absents ou partiels.

2. **Une page Results unifiée** : les pages `/modules/reservations` etc. existent mais sont globales, sans filtre par feature, et sans lien avec la Knowledge correspondante.

3. **Configurabilité de `reservation_table`** : pas de modèle Knowledge dédié (le bot sait faire des réservations de table mais n'a rien à lire dans la KB pour ça).

4. **`conciergerie` et `communication_etablissement`** : ni Knowledge ni Results définis.

---

## Matrice des 24 features — Read / Write

> Lecture = bot lit depuis Knowledge avant de répondre
> Écriture = bot crée un enregistrement en BD pendant la conversation

| # | Feature slug | Knowledge (bot lit) | Results (bot écrit) | KB ✅ | Results ✅ |
|---|---|---|---|---|---|
| 1 | `faq` | QuestionFrequente | *(répond, rien créé)* | ✅ | N/A |
| 2 | `menu_digital` | MenuCategorie, MenuPlat | Commande | ✅ | ⚠️ pont ? |
| 3 | `commande_paiement` | Catalogue* | Commande | ✅ | ⚠️ pont ? |
| 4 | `suivi_commande` | Commande existante (lecture) | *(informe, rien créé)* | ✅ | N/A |
| 5 | `catalogue_produits` | CatalogueProduit | Commande | ✅ | ⚠️ pont ? |
| 6 | `catalogue_services` | CatalogueService | *(oriente, rien créé)* | ✅ | N/A |
| 7 | `catalogue_trajets` | CatalogueTrajet | Commande / Reservation | ✅ | ⚠️ pont ? |
| 8 | `catalogue_produits_financiers` | ProduitFinancier | *(oriente, rien créé)* | ✅ | N/A |
| 9 | `reservation_chambre` | ChambreType | Reservation | ✅ | ⚠️ pont ? |
| 10 | `reservation_table` | *(rien)* | Reservation | ❌ | ⚠️ pont ? |
| 11 | `reservation_billet` | CatalogueTrajet | Reservation | ✅ partiel | ⚠️ pont ? |
| 12 | `inscription_admission` | ProgrammeAdmission | Inscription | ✅ | ⚠️ pont ? |
| 13 | `orientation_patient` | SpecialiteMedicale | Reservation (RDV médical) | ✅ | ⚠️ pont ? |
| 14 | `orientation_citoyens` | ServiceCitoyen | Dossier | ✅ | ⚠️ pont ? |
| 15 | `rdv` | Agence + Horaires | Reservation | ✅ | ⚠️ pont ? |
| 16 | `multi_agences` | Agence + Horaires | *(route, rien créé)* | ✅ | N/A |
| 17 | `gestion_crm` | Contact existant | Contact enrichi | ✅ | ⚠️ pont ? |
| 18 | `conciergerie` | *(non défini)* | *(non défini)* | ❌ | ❌ |
| 19 | `communication_etablissement` | *(non défini)* | *(non défini)* | ❌ | ❌ |
| 20 | `transfert_humain` | ProfilEntreprise (whatsapp/email transfert) | *(transfère, rien créé)* | ✅ | N/A |
| 21 | `paiement_en_ligne` | *(géré par Billing)* | Paiement | — | — |
| 22 | `prise_rdv` | Agence + Horaires | Reservation | ✅ | ⚠️ pont ? |
| 23 | `prospection_active` | *(à définir)* | Contact | ❌ | ⚠️ |
| 24 | `dashboard` | *(stats lecture seule)* | *(rien créé)* | N/A | N/A |

**Légende ⚠️ pont ?** = le modèle Results existe en BD mais le bot ne l'alimente pas encore automatiquement. C'est le chantier principal de R1/R2/R3.

---

## Les 5 types de Results

Toutes les features ne produisent que **5 types d'enregistrements** :

```
Reservation  ←  rdv, prise_rdv, reservation_chambre, reservation_table,
                reservation_billet, orientation_patient, catalogue_trajets

Commande     ←  menu_digital, catalogue_produits, catalogue_trajets,
                commande_paiement

Inscription  ←  inscription_admission

Dossier      ←  orientation_citoyens

Contact      ←  gestion_crm (+ toutes les features enrichissent le Contact)
```

**Conséquence architecturale :** on construit **5 composants Results**, pas 24.
Chaque feature pointe vers le composant qui correspond à son type de Result.

---

## Plan des 3 sessions

### Session R1 — Socle + features "lecture seule"

**Objectif :** Créer l'infrastructure Results et valider le pattern de bout en bout sur les features qui ne créent rien.

**Étape R1-0 — Socle page Results**
- Créer `/knowledge/results` ou onglet `Results` dans la page `/knowledge` existante
- Template vide par feature (routing + structure)
- Composant `ResultsEmptyState` réutilisable

**Étape R1-1 — `faq`**
- Vérif : le bot lit bien les QuestionFrequente → test dans le chat
- Results : compteur de questions posées (depuis Conversation) — affichage simple

**Étape R1-2 — `catalogue_services`**
- Vérif : le bot lit bien CatalogueService → test chat
- Results : rien créé → afficher les conversations qui ont mentionné ce catalogue

**Étape R1-3 — `catalogue_produits_financiers`**
- Même pattern que catalogue_services

**Étape R1-4 — `multi_agences`**
- Vérif : le bot route bien selon l'agence → test chat
- Results : rien créé → stats d'agence depuis les conversations

**Livrable R1 :** infrastructure Results en place, pattern validé, 4 features couvertes.

---

### Session R2 — Features transactionnelles (le cœur)

**Objectif :** Auditer et compléter les ponts Bot → BD pour les 5 types de Results transactionnels, puis construire les pages Results correspondantes.

**Étape R2-0 — Audit des intent handlers**
Pour chaque feature transactionnelle :
1. Tester dans le chat — le bot comprend-il l'intention ?
2. Vérifier en BD — l'enregistrement a-t-il été créé ?
3. Si non → identifier où ajouter le pont (chatbot_bridge ou apps/*)

**Étape R2-1 — Commandes** (`menu_digital`, `catalogue_produits`, `commande_paiement`)
- Audit pont bot → Commande
- Fix si absent
- Page Results : liste des Commandes filtrées par feature_slug + statut + date
- Composant `CommandeResultCard` réutilisable

**Étape R2-2 — Reservations** (`rdv`, `reservation_chambre`, `reservation_table`, `orientation_patient`)
- Audit pont bot → Reservation
- Fix si absent
- Page Results : liste des Reservations filtrées + timeline + statut
- Composant `ReservationResultCard` réutilisable

**Étape R2-3 — Inscriptions** (`inscription_admission`)
- Audit pont bot → Inscription
- Fix si absent
- Page Results : liste des Inscriptions + statut dossier
- Composant `InscriptionResultCard` réutilisable

**Étape R2-4 — Dossiers** (`orientation_citoyens`)
- Audit pont bot → Dossier
- Fix si absent
- Page Results : liste des Dossiers + catégorie + statut
- Composant `DossierResultCard` réutilisable

**Étape R2-5 — Contacts** (`gestion_crm`)
- Audit enrichissement Contact pendant conversation
- Page Results : contacts créés/enrichis par le bot + date + source

**Livrable R2 :** les 5 types de Results alimentés par le bot, pages Results construites et fonctionnelles.

---

### Session R3 — Features sectorielles restantes

**Objectif :** Couvrir les features restantes en réutilisant les composants de R2.

**Étape R3-1 — `catalogue_trajets` + `reservation_billet`**
- Audit pont → Reservation ou Commande
- Brancher sur le composant Results existant

**Étape R3-2 — `orientation_patient`**
- Compléter si non terminé en R2
- Spécificité : Reservation de type "médical" → filtre dédié

**Étape R3-3 — `conciergerie`**
- Définir ce que le bot doit lire (Knowledge à créer ?)
- Définir ce qu'il écrit (Contact enrichi ? Dossier ?)
- Implémenter les 2 côtés

**Étape R3-4 — `communication_etablissement`**
- Même démarche que conciergerie
- Probablement : Knowledge = modèle Annonce/Communication, Results = Conversation

**Étape R3-5 — `prospection_active`**
- Audit du comportement bot actuel
- Results = Contact avec tag "prospect"

**Livrable R3 :** 24 features couvertes, Results complets pour tous les modules actifs.

---

## Règles d'implémentation pour les sessions R1/R2/R3

### Architecture Results

```
src/app/(dashboard)/knowledge/
├── _components/
│   ├── results/
│   │   ├── ResultsEmptyState.tsx       ← état vide générique
│   │   ├── CommandeResultCard.tsx      ← carte commande
│   │   ├── ReservationResultCard.tsx   ← carte réservation
│   │   ├── InscriptionResultCard.tsx   ← carte inscription
│   │   ├── DossierResultCard.tsx       ← carte dossier
│   │   └── ContactResultCard.tsx       ← carte contact enrichi
│   └── tabs/
│       └── ResultsTab.tsx              ← onglet Results (switche selon feature active)
```

### Pattern de test pour chaque feature (à répéter ×N)

```
1. CONFIG    → ouvrir /knowledge, aller sur le tab de la feature, vérifier que la KB est bien remplie
2. BOT LIT   → ouvrir le chat, poser une question liée à la feature, vérifier la réponse
3. BOT ÉCRIT → vérifier en BD : SELECT * FROM <table_results> ORDER BY created_at DESC LIMIT 5;
4. RESULTS   → ouvrir le tab Results, vérifier que l'enregistrement apparaît
```

### Commande de vérification BD (Docker)

```powershell
# Vérifier les Reservations créées par le bot
docker-compose -f docker-compose.dev.yml exec api python manage.py shell -c "
from apps.reservations.models import Reservation
qs = Reservation.objects.order_by('-created_at')[:5]
for r in qs:
    print(r.id, r.created_at, r.statut)
"
```

---

## Décisions architecturales prises

| Décision | Choix retenu | Raison |
|---|---|---|
| Où afficher les Results ? | Onglet `Results` dans `/knowledge` | UX unifiée — configure ici, vois ici |
| 24 composants ou 5 ? | 5 composants Results réutilisables | Les 24 features ne produisent que 5 types |
| Construire Results avant que le bot écrive ? | Non — auditer/fixer le pont d'abord | Sinon la page Results sera toujours vide |
| Ordre des sessions ? | R1 (socle + lecture seule) → R2 (transactionnel) → R3 (sectoriels) | Valider le pattern avant de passer à l'échelle |
| `conciergerie` et `communication_etablissement` | Traiter en R3 après avoir défini la KB | Pas assez définis pour implémenter maintenant |

---

## Contexte technique à relire en début de session R1

- `apps/knowledge/models.py` — tous les modèles Knowledge
- `apps/reservations/`, `apps/inscriptions/`, `apps/dossiers/`, `apps/catalogue/` — modèles Results
- `apps/chatbot_bridge/` ou équivalent — point d'entrée du bot, là où ajouter les ponts
- `src/app/(dashboard)/knowledge/page.tsx` — page Knowledge actuelle avec ALL_TABS
- `src/repositories/agences.repository.ts`, `p5.repository.ts` — repositories existants

---

*Document généré en session — Gabriel / donpk*
*À placer dans `docs/cdc/cdc_results_bot.md`*