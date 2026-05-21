# AGT BOT — Architecture de test agent IA
> Document de référence — S46 Gabriel — 21 mai 2026
> **À uploader dans le project knowledge pour faire autorité sur les PDFs de conception.**

---

## Classification des 28 features C1

> ⚠️ Cette classification **override** les mentions "hors scope" des PDFs de conception features 1-28.
> Toutes les 28 features appartiennent au Chantier 1. Trois sont "coming soon" (non encore implémentées).

| Feature | Statut test | Raison |
|---|---|---|
| `faq` | ✅ Testable | Agent actif |
| `gestion_crm` | ✅ Testable | Agent actif |
| `transfert_humain` | ✅ Testable | Agent actif |
| `prise_rdv` | ✅ Testable | Agent actif |
| `menu_digital` | ✅ Testable | Agent actif |
| `catalogue_produits` | ✅ Testable | Agent actif |
| `catalogue_services` | ✅ Testable | Agent actif |
| `catalogue_trajets` | ✅ Testable | Agent actif |
| `catalogue_produits_financiers` | ✅ Testable | Agent actif |
| `reservation_table` | ✅ Testable | Agent actif |
| `reservation_chambre` | ✅ Testable | Agent actif |
| `reservation_billet` | ✅ Testable | Agent actif |
| `orientation_patient` | ✅ Testable | Agent actif |
| `orientation_citoyens` | ✅ Testable | Agent actif |
| `conciergerie` | ✅ Testable | Agent actif |
| `inscription_admission` | ✅ Testable | Agent actif |
| `suivi_commande` | ✅ Testable | Agent actif |
| `emails_rappel` | ✅ Testable | Agent actif |
| `communication` | ✅ Testable | Agent actif |
| `capture_prospect` | ✅ Testable | Agent actif |
| `simulation_credit` | ✅ Testable | Agent actif |
| `suivi_dossier` | ✅ Testable | Agent actif |
| `collecte_documents` | ✅ Testable | Agent actif |
| `multi_agences` | ✅ Testable | Agent actif |
| `commande_paiement` | ⏳ Coming soon | Provider paiement requis (C2) |
| `paiement_en_ligne` | ⏳ Coming soon | Accord Orange Money / MTN (C2) |
| `agent_vocal` | ⏳ Coming soon | Pipeline STT/TTS (C2) |
| `dashboard` | 🔵 Périmètre B6 | Couvert par Penka — B6 |

**Total : 28 features C1. 24 testables + 3 coming soon + 1 B6.**

---

## Architecture des tests — 3 niveaux

```
python manage.py test_agent                          # Niveau 1 (défaut)
python manage.py test_agent --level=2                # Niveau 2 seul
python manage.py test_agent --level=3                # Niveau 3 seul
python manage.py test_agent --all                    # Niveaux 1 + 2 + 3
python manage.py test_agent --level=1 --feature=faq  # Filtre par action
python manage.py test_agent --level=3 --secteur=restaurant
python manage.py test_agent --keep-data              # Conserve les données
```

---

## Niveau 1 — Actions unitaires (FakeLLM) ✅ S46 VALIDÉ

**Statut : 40/40 ✅**
**Fichiers :** `apps/agent/tests_e2e/scenarios.py` + `setup.py`
**Principe :** 1 message → 1 action → assertion sur AIActionLog + modèle persisté.
Le LLM est simulé (FakeLLM). Rapide (~7s pour 40 scénarios).

### 40 actions testées

| # | Action | Groupe | Statut |
|---|---|---|---|
| 1 | `init_conversation` | Système | ✅ |
| 2 | `update_context` | Système | ✅ |
| 3 | `create_contact` | Système | ✅ |
| 4 | `transfer_to_human` | Système | ✅ |
| 5 | `send_email` | Système | ✅ |
| 6 | `send_reminder` | Système | ✅ |
| 7 | `list_catalogue_items` | Catalogue | ✅ |
| 8 | `get_item_detail` | Catalogue | ✅ |
| 9 | `get_menu` | Catalogue sectoriel | ✅ |
| 10 | `get_room_types` | Catalogue sectoriel | ✅ |
| 11 | `check_disponibilite` | Réservations | ✅ |
| 12 | `create_reservation` | Réservations | ✅ |
| 13 | `create_commande` | Commandes | ✅ |
| 14 | `get_commande_statut` | Commandes | ✅ |
| 15 | `get_order_status` | Commandes | ✅ |
| 16 | `initiate_payment` | Commandes (coming soon) | ✅ appel direct |
| 17 | `convert_prospect` | CRM | ✅ |
| 18 | `capture_prospect` | CRM | ✅ |
| 19 | `get_catalogue` | Catalogue sectoriel | ✅ |
| 20 | `search_faq` | FAQ | ✅ |
| 21 | `get_services` | Catalogue sectoriel | ✅ |
| 22 | `get_trajets` | Catalogue sectoriel | ✅ |
| 23 | `get_agences` | Multi-agences | ✅ |
| 24 | `get_specialites` | Santé | ✅ |
| 25 | `get_specialite_par_symptomes` | Santé | ✅ |
| 26 | `get_programmes` | Éducation | ✅ |
| 27 | `create_inscription` | Éducation | ✅ |
| 28 | `get_inscription_statut` | Éducation | ✅ |
| 29 | `get_services_publics` | Public | ✅ |
| 30 | `create_dossier` | Public | ✅ |
| 31 | `get_dossier_statut` | Public | ✅ |
| 32 | `get_services_conciergerie` | Conciergerie | ✅ |
| 33 | `create_demande_conciergerie` | Conciergerie | ✅ |
| 34 | `get_annonces` | Communication | ✅ |
| 35 | `create_annonce` | Communication | ✅ |
| 36 | `simulate_credit` | Banking | ✅ |
| 37 | `create_dossier_banking` | Banking | ✅ |
| 38 | `get_dossier_statut_banking` | Banking | ✅ |
| 39 | `list_documents_requis` | Banking | ✅ |
| 40 | `confirmer_document` | Banking | ✅ |

### Corrections appliquées en S46 vs ancienne version

| Bug | Correction |
|---|---|
| `TacheRelance(agence=)` inexistant | Supprimé de `system_extra.py` (transfer_to_human + send_reminder) |
| `EmailLog(conversation=, contact=)` inexistants | → `source_type="autre"`, `source_id=conversation.id` |
| `Reservation(feature=)` inexistant | Supprimé de `reservations.py` et du scénario setup |
| `Inscription(est_hors_periode=)` inexistant | → `statut="hors_periode"` (choice existant) |
| `SpecialiteMedicale(is_active=)` inexistant | → `is_available=True` |
| `ProgrammeAdmission(nom=, filiere=, est_ouvert=)` inexistants | → `nom_fr=`, supprimé `filiere`/`est_ouvert` |
| `FAQ(agence=, feature=)` inexistants | Supprimés |
| `QuestionFrequente.question/reponse` inexistants | → `question_fr`/`reponse_fr` |
| `ChambreType` dans `apps.reservations` | → `apps.knowledge` |
| `get_trajets` filtre `ville_depart` inexistant | → filtre `nom`/`description` + metadata fallback |
| `update_context` required_fields `conversation_summary` | → `[]` (c'est un champ du bloc LLM, pas du payload) |
| `initiate_payment` `is_active=False` → absent du registre | → appel direct `InitiatePaymentAction().run()` |

---

## Niveau 2 — Scénarios feature complets (FakeLLM) ⬜ S47

**Statut : non implémenté**
**Fichiers cibles :** `apps/agent/tests_e2e/features/`

### Principe
Pour chaque feature, simuler une vraie conversation multi-tours :
- Message 1 : demande floue → agent redemande un champ manquant
- Message 2 : complétion → action déclenchée → persistance
- Assertion finale : objet créé en base **ET** visible via endpoint REST

### Setup
Utilise le compte `demo-custom@agt.cm` (seedé, toutes features actives, données riches).

### 24 features à couvrir

| Feature | Actions impliquées | Assertion finale |
|---|---|---|
| `faq` | `search_faq` | `ConsultationFAQ` créée |
| `menu_digital` | `get_menu`, `list_catalogue_items` | items retournés |
| `catalogue_produits` | `get_catalogue`, `get_item_detail` | items retournés |
| `catalogue_services` | `get_services` | items avec `action_suivante` |
| `catalogue_trajets` | `get_trajets` | trajets retournés |
| `catalogue_produits_financiers` | `get_catalogue`, `simulate_credit` | simulation calculée |
| `prise_rdv` | `check_disponibilite`, `create_reservation` | `Reservation` en base |
| `reservation_table` | `check_disponibilite`, `create_reservation` | `Reservation` en base |
| `reservation_chambre` | `get_room_types`, `create_reservation` | `Reservation` en base |
| `reservation_billet` | `get_trajets`, `create_reservation` | `Reservation` + `numero_billet` |
| `menu_digital` (commande) | `get_menu`, `create_commande` | `Commande` + `LigneCommande` |
| `suivi_commande` | `get_commande_statut`, `get_order_status` | statut retourné |
| `gestion_crm` | `convert_prospect`, `capture_prospect` | `Contact.statut` avancé |
| `capture_prospect` | `capture_prospect` | `Contact` prospect créé |
| `orientation_patient` | `get_specialites`, `get_specialite_par_symptomes` | disclaimer présent |
| `conciergerie` | `get_services_conciergerie`, `create_demande_conciergerie` | `DemandeConciergerie` en base |
| `inscription_admission` | `get_programmes`, `create_inscription` | `Inscription` + `numero_dossier` |
| `orientation_citoyens` | `get_services_publics`, `create_dossier` | `Dossier` + `numero_dossier` |
| `communication` | `get_annonces`, `create_annonce` | `Annonce` statut=planifiee |
| `emails_rappel` | `send_email`, `send_reminder` | `EmailLog` + `TacheRelance` |
| `simulation_credit` | `simulate_credit` | mensualite > 0, disclaimer |
| `suivi_dossier` | `create_dossier_banking`, `get_dossier_statut_banking` | `Dossier` BNK- |
| `collecte_documents` | `list_documents_requis`, `confirmer_document` | documents_fournis mis à jour |
| `multi_agences` | `get_agences` | agences retournées |

---

## Niveau 3 — Scénarios sectoriels (FakeLLM) ⬜ S47

**Statut : non implémenté**
**Fichiers cibles :** `apps/agent/tests_e2e/sectors/`

### Principe
Enchaîner 3 à 5 features typiques d'un secteur dans une seule conversation.
Valider que le contexte se conserve entre les tours (nom client retenu, etc.).

### Scénarios prioritaires

**Restaurant**
```
search_faq("horaires") → get_menu() → create_commande(items) → send_email(confirmation)
Assertion : Commande en base, EmailLog créé, contexte.contact.nom persisté
```

**Hôtel**
```
get_room_types() → check_disponibilite() → create_reservation() → create_demande_conciergerie()
Assertion : Reservation + DemandeConciergerie en base, statuts corrects
```

**Custom (toutes features)**
```
search_faq() → get_services() → capture_prospect() → create_inscription() → send_email()
Assertion : Contact créé, Inscription en base, EmailLog présent
```

**Banking**
```
simulate_credit(5M, 24m) → create_dossier_banking(ouverture_compte) →
list_documents_requis() → confirmer_document()
Assertion : Dossier BNK- créé, documents_fournis mis à jour
```

---

## Règles permanentes

- **Niveau 1 doit passer avant de travailler sur le Niveau 2.**
- **Niveau 2 doit passer avant de travailler sur le Niveau 3.**
- **Webhook WhatsApp (Étape 9 B5) après validation Niveau 2 minimum.**
- `initiate_payment` : toujours appel direct (bypass engine) — `is_active=False` intentionnel.
- `dashboard`, `commande_paiement`, `paiement_en_ligne`, `agent_vocal` : skip propre dans tous les niveaux.
- Setup Niveau 2 et 3 : utiliser `demo-custom@agt.cm` (compte Pro, toutes features, données riches).

---

*Généré en S46 — Gabriel — 21 mai 2026*
*Fait autorité sur les PDFs de conception pour la classification des features de test.*
