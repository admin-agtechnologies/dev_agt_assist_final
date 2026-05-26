# TODO B5 — Test & Validation des 24 features
> Compte de test : `demo-custom@agt.cm / Demo@2024!` (secteur custom — toutes features actives)
> Statuts : ⏳ À faire · 🔄 En cours · ✅ Validé · ❌ Bloqué
> Règle : consulter ce fichier en début ET fin de chaque session · mettre à jour après chaque step validé

---

## RÈGLES DE TRAVAIL

- **Step a** : lire le skill.md existant + l'améliorer pour le rendre exhaustif (modèle : system_prompt.md). Couvre la feature ET toutes ses actions associées. Exemples concrets, séquences obligatoires, cas limites, gardes-fous.
- **Step b** : vérifier que des données KB existent en base pour cette feature sur demo-custom. Si absent → créer via bootstrap ou shell.
- **Step c** : vérifier feature active sur le tenant + AIAgentAction présente + est_active=True.
- **Step d** : tester que le bot appelle l'action de lecture et retourne des données réelles.
- **Step e** : tester que le bot déclenche l'action d'écriture et persiste l'objet en base.
- **Step f** : vérifier que l'objet créé est visible dans /résultats côté frontend.
- **Step g** : scénario E2E complet documenté (messages envoyés + résultats attendus + résultats réels).
- **Step h** : validation explicite Gabriel sur la chaîne complète.
- **Bugs** : diagnostic complet backend + frontend avant toute solution · toujours consulter les fichiers existants · toujours concevoir avant de coder.

---

## ── SOCLE — Features transversales ──────────────────────────────────────────

### 1. faq
**Secteur(s) :** Tous | **Actions :** `search_faq`

| Step | Statut | Notes |
|---|---|---|
| a. Skill.md — Lire & Améliorer | ✅ S75 | faq.md + search_faq.md v2 — notion deux couches statique/dynamique |
| b. KB & données guide | ✅ S75 | 9 QuestionFrequente en base demo-custom |
| c. Config bot | ✅ S75 | Bot actif, feature faq ACTIVE |
| d. Agent → lit | ✅ S75 | Réponses correctes depuis FAQ statique injectée |
| e. Agent → écrit | N/A | Lecture seule — bot_ecrit_result=False |
| f. Résultats visibles | ⚠️ S75 | Tab FAQ visible mais vide — BUG-FAQ-01 |
| g. E2E complet | ✅ S75 | Simulateur — WAHA reporté |
| h. Validation Gabriel | ✅ S75 | Validé avec notes BUG-FAQ-01 + BUG-FAQ-02 |

---

### 2. gestion_crm
**Secteur(s) :** Tous | **Actions :** `create_contact`, `update_context`, `manage_contact`

| Step | Statut | Notes |
|---|---|---|
| a. Skill.md — Lire & Améliorer | ✅ S75 | 4 skills v2 + manage_contact créé — fix crm_signals payload |
| b. KB & données guide | N/A | Pas de KB propre |
| c. Config bot | ✅ S75 | 3 actions liées à l'agent |
| d. Agent → lit | ✅ S75 | create_contact + update_context fonctionnels |
| e. Agent → écrit | ⚠️ S75 | manage_contact non déclenché — BUG-CRM-01 |
| f. Résultats visibles | ✅ S75 | Thomas visible dans /résultats onglet Clients |
| g. E2E complet | ✅ S75 | Simulateur — WAHA reporté |
| h. Validation Gabriel | ✅ S75 | Validé avec notes BUG-CRM-01/02/03 |

---


### 3. capture_prospect
**Secteur(s) :** Tous | **Actions :** `create_contact`, `create_prospect`

| Step | Statut | Notes |
|---|---|---|
| a. Skill.md — Lire & Améliorer | ⏳ | |
| b. KB & données guide | ⏳ | |
| c. Config bot | ⏳ | |
| d. Agent → lit | ⏳ | |
| e. Agent → écrit | ⏳ | |
| f. Résultats visibles | ⏳ | |
| g. E2E complet | ⏳ | |
| h. Validation Gabriel | ⏳ | |

---

### 4. transfert_humain
**Secteur(s) :** Tous | **Actions :** `transfer_to_human`

| Step | Statut | Notes |
|---|---|---|
| a. Skill.md — Lire & Améliorer | ⏳ | |
| b. KB & données guide | ⏳ | N/A — pas de KB pour cette feature |
| c. Config bot | ⏳ | |
| d. Agent → lit | ⏳ | |
| e. Agent → écrit | ⏳ | Crée un TransfertHumain en base |
| f. Résultats visibles | ⏳ | |
| g. E2E complet | ⏳ | |
| h. Validation Gabriel | ⏳ | |

---

### 5. emails_rappel
**Secteur(s) :** Tous | **Actions :** `send_email`, `send_reminder`

| Step | Statut | Notes |
|---|---|---|
| a. Skill.md — Lire & Améliorer | ⏳ | |
| b. KB & données guide | ⏳ | |
| c. Config bot | ⏳ | |
| d. Agent → lit | ⏳ | |
| e. Agent → écrit | ⏳ | |
| f. Résultats visibles | ⏳ | |
| g. E2E complet | ⏳ | |
| h. Validation Gabriel | ⏳ | |

---

### 6. communication
**Secteur(s) :** Tous | **Actions :** `create_annonce`, `get_annonces`, `send_communication`

| Step | Statut | Notes |
|---|---|---|
| a. Skill.md — Lire & Améliorer | ⏳ | |
| b. KB & données guide | ⏳ | |
| c. Config bot | ⏳ | |
| d. Agent → lit | ⏳ | |
| e. Agent → écrit | ⏳ | |
| f. Résultats visibles | ⏳ | |
| g. E2E complet | ⏳ | |
| h. Validation Gabriel | ⏳ | |

---

### 7. multi_agences
**Secteur(s) :** Tous | **Actions :** `get_agences`

| Step | Statut | Notes |
|---|---|---|
| a. Skill.md — Lire & Améliorer | ⏳ | |
| b. KB & données guide | ⏳ | N/A — lit les agences en base |
| c. Config bot | ⏳ | |
| d. Agent → lit | ⏳ | |
| e. Agent → écrit | ⏳ | N/A — lecture seule |
| f. Résultats visibles | ⏳ | |
| g. E2E complet | ⏳ | |
| h. Validation Gabriel | ⏳ | |

---

## ── RESTAURANT / E-COMMERCE ──────────────────────────────────────────────────

### 8. menu_digital
**Secteur(s) :** Restaurant, E-commerce | **Actions :** `get_menu`, `list_catalogue_items`, `get_item_detail`, `create_commande`

| Step | Statut | Notes |
|---|---|---|
| a. Skill.md — Lire & Améliorer | 🔄 S67 | get_menu vu · create_commande vu · à améliorer |
| b. KB & données guide | ✅ S67 | Items catalogue présents via seeder |
| c. Config bot | ✅ S67 | 47 AIAgentActions actives après fix |
| d. Agent → lit | ✅ S67 | get_menu → SUCCÈS 16ms · JSON validé |
| e. Agent → écrit | ❌ BUG-B5-001 | create_commande échoue — item_id UUID requis mais LLM ne mémorise pas |
| f. Résultats visibles | ⏳ | |
| g. E2E complet | ⏳ | |
| h. Validation Gabriel | ⏳ | |

---

### 9. catalogue_produits
**Secteur(s) :** E-commerce, PME | **Actions :** `list_catalogue_items`, `get_item_detail`, `create_commande`

| Step | Statut | Notes |
|---|---|---|
| a. Skill.md — Lire & Améliorer | ⏳ | |
| b. KB & données guide | ⏳ | |
| c. Config bot | ⏳ | |
| d. Agent → lit | ⏳ | |
| e. Agent → écrit | ⏳ | |
| f. Résultats visibles | ⏳ | |
| g. E2E complet | ⏳ | |
| h. Validation Gabriel | ⏳ | |

---

### 10. catalogue_services
**Secteur(s) :** PME, Santé | **Actions :** `get_services`, `catalogue_sectoriel`

| Step | Statut | Notes |
|---|---|---|
| a. Skill.md — Lire & Améliorer | ⏳ | |
| b. KB & données guide | ⏳ | |
| c. Config bot | ⏳ | |
| d. Agent → lit | ⏳ | |
| e. Agent → écrit | ⏳ | |
| f. Résultats visibles | ⏳ | |
| g. E2E complet | ⏳ | |
| h. Validation Gabriel | ⏳ | |

---

### 11. suivi_commande
**Secteur(s) :** Restaurant, E-commerce | **Actions :** `get_commande_statut`, `get_order_status`

| Step | Statut | Notes |
|---|---|---|
| a. Skill.md — Lire & Améliorer | ⏳ | |
| b. KB & données guide | ⏳ | Dépend d'une commande créée (step e de menu_digital) |
| c. Config bot | ⏳ | |
| d. Agent → lit | ⏳ | |
| e. Agent → écrit | ⏳ | N/A — lecture seule |
| f. Résultats visibles | ⏳ | |
| g. E2E complet | ⏳ | |
| h. Validation Gabriel | ⏳ | |

---

## ── TRANSPORT ────────────────────────────────────────────────────────────────

### 12. catalogue_trajets
**Secteur(s) :** Transport | **Actions :** `get_trajets`, `list_catalogue_items`

| Step | Statut | Notes |
|---|---|---|
| a. Skill.md — Lire & Améliorer | ⏳ | |
| b. KB & données guide | ⏳ | |
| c. Config bot | ⏳ | |
| d. Agent → lit | ⏳ | |
| e. Agent → écrit | ⏳ | |
| f. Résultats visibles | ⏳ | |
| g. E2E complet | ⏳ | |
| h. Validation Gabriel | ⏳ | |

---

### 13. reservation_billet
**Secteur(s) :** Transport | **Actions :** `check_disponibilite`, `create_reservation`, `resa_billet`

| Step | Statut | Notes |
|---|---|---|
| a. Skill.md — Lire & Améliorer | ⏳ | |
| b. KB & données guide | ⏳ | |
| c. Config bot | ⏳ | |
| d. Agent → lit | ⏳ | |
| e. Agent → écrit | ⏳ | |
| f. Résultats visibles | ⏳ | |
| g. E2E complet | ⏳ | |
| h. Validation Gabriel | ⏳ | |

---

## ── HÔTEL / RESTAURATION ──────────────────────────────────────────────────────

### 14. prise_rdv
**Secteur(s) :** Santé, PME, Public | **Actions :** `check_disponibilite`, `create_reservation`, `create_rdv`

| Step | Statut | Notes |
|---|---|---|
| a. Skill.md — Lire & Améliorer | ⏳ | |
| b. KB & données guide | ⏳ | |
| c. Config bot | ⏳ | |
| d. Agent → lit | ⏳ | |
| e. Agent → écrit | ⏳ | |
| f. Résultats visibles | ⏳ | |
| g. E2E complet | ⏳ | |
| h. Validation Gabriel | ⏳ | |

---

### 15. reservation_table
**Secteur(s) :** Restaurant | **Actions :** `check_disponibilite`, `create_reservation`, `resa_table`

| Step | Statut | Notes |
|---|---|---|
| a. Skill.md — Lire & Améliorer | ⏳ | |
| b. KB & données guide | ⏳ | |
| c. Config bot | ⏳ | |
| d. Agent → lit | ⏳ | |
| e. Agent → écrit | ⏳ | |
| f. Résultats visibles | ⏳ | |
| g. E2E complet | ⏳ | |
| h. Validation Gabriel | ⏳ | |

---

### 16. reservation_chambre
**Secteur(s) :** Hôtel | **Actions :** `get_room_types`, `check_disponibilite`, `create_reservation`

| Step | Statut | Notes |
|---|---|---|
| a. Skill.md — Lire & Améliorer | ⏳ | |
| b. KB & données guide | ⏳ | |
| c. Config bot | ⏳ | |
| d. Agent → lit | ⏳ | |
| e. Agent → écrit | ⏳ | |
| f. Résultats visibles | ⏳ | |
| g. E2E complet | ⏳ | |
| h. Validation Gabriel | ⏳ | |

---

### 17. conciergerie
**Secteur(s) :** Hôtel | **Actions :** `get_services_conciergerie`, `create_demande_conciergerie`

| Step | Statut | Notes |
|---|---|---|
| a. Skill.md — Lire & Améliorer | ⏳ | |
| b. KB & données guide | ⏳ | |
| c. Config bot | ⏳ | |
| d. Agent → lit | ⏳ | |
| e. Agent → écrit | ⏳ | |
| f. Résultats visibles | ⏳ | |
| g. E2E complet | ⏳ | |
| h. Validation Gabriel | ⏳ | |

---

## ── BANQUE ───────────────────────────────────────────────────────────────────

### 18. catalogue_produits_financiers
**Secteur(s) :** Banque | **Actions :** `get_catalogue`, `get_catalogue_fin`, `get_item_detail`

| Step | Statut | Notes |
|---|---|---|
| a. Skill.md — Lire & Améliorer | ⏳ | |
| b. KB & données guide | ⏳ | |
| c. Config bot | ⏳ | |
| d. Agent → lit | ⏳ | |
| e. Agent → écrit | ⏳ | |
| f. Résultats visibles | ⏳ | |
| g. E2E complet | ⏳ | |
| h. Validation Gabriel | ⏳ | |

---

### 19. simulation_credit
**Secteur(s) :** Banque | **Actions :** `simulate_credit`

| Step | Statut | Notes |
|---|---|---|
| a. Skill.md — Lire & Améliorer | ⏳ | |
| b. KB & données guide | ⏳ | N/A — calcul pur |
| c. Config bot | ⏳ | |
| d. Agent → lit | ⏳ | |
| e. Agent → écrit | ⏳ | Crée SimulationCredit en base |
| f. Résultats visibles | ⏳ | |
| g. E2E complet | ⏳ | |
| h. Validation Gabriel | ⏳ | |

---

## ── SANTÉ ────────────────────────────────────────────────────────────────────

### 20. orientation_patient
**Secteur(s) :** Santé | **Actions :** `get_specialites`, `get_specialite_par_symptomes`, `orientation`

| Step | Statut | Notes |
|---|---|---|
| a. Skill.md — Lire & Améliorer | ⏳ | |
| b. KB & données guide | ⏳ | |
| c. Config bot | ⏳ | |
| d. Agent → lit | ⏳ | |
| e. Agent → écrit | ⏳ | Crée OrientationPatient en base |
| f. Résultats visibles | ⏳ | |
| g. E2E complet | ⏳ | |
| h. Validation Gabriel | ⏳ | |

---

## ── ÉCOLE ────────────────────────────────────────────────────────────────────

### 21. inscription_admission
**Secteur(s) :** École | **Actions :** `get_programmes`, `create_inscription`, `get_inscription_statut`

| Step | Statut | Notes |
|---|---|---|
| a. Skill.md — Lire & Améliorer | ⏳ | |
| b. KB & données guide | ⏳ | |
| c. Config bot | ⏳ | |
| d. Agent → lit | ⏳ | |
| e. Agent → écrit | ⏳ | |
| f. Résultats visibles | ⏳ | |
| g. E2E complet | ⏳ | |
| h. Validation Gabriel | ⏳ | |

---

## ── PUBLIC / ADMINISTRATION ──────────────────────────────────────────────────

### 22. orientation_citoyens
**Secteur(s) :** Public | **Actions :** `get_services_publics`, `create_dossier`

| Step | Statut | Notes |
|---|---|---|
| a. Skill.md — Lire & Améliorer | ⏳ | |
| b. KB & données guide | ⏳ | |
| c. Config bot | ⏳ | |
| d. Agent → lit | ⏳ | |
| e. Agent → écrit | ⏳ | |
| f. Résultats visibles | ⏳ | |
| g. E2E complet | ⏳ | |
| h. Validation Gabriel | ⏳ | |

---

### 23. suivi_dossier
**Secteur(s) :** Public, Banque, École | **Actions :** `create_dossier`, `get_dossier_statut`, `create_dossier_banking`, `get_dossier_statut_banking`

| Step | Statut | Notes |
|---|---|---|
| a. Skill.md — Lire & Améliorer | ⏳ | |
| b. KB & données guide | ⏳ | |
| c. Config bot | ⏳ | |
| d. Agent → lit | ⏳ | |
| e. Agent → écrit | ⏳ | |
| f. Résultats visibles | ⏳ | |
| g. E2E complet | ⏳ | |
| h. Validation Gabriel | ⏳ | |

---

### 24. collecte_documents
**Secteur(s) :** Public, École | **Actions :** `list_documents_requis`, `confirmer_document`

| Step | Statut | Notes |
|---|---|---|
| a. Skill.md — Lire & Améliorer | ⏳ | |
| b. KB & données guide | ⏳ | |
| c. Config bot | ⏳ | |
| d. Agent → lit | ⏳ | |
| e. Agent → écrit | ⏳ | |
| f. Résultats visibles | ⏳ | |
| g. E2E complet | ⏳ | |
| h. Validation Gabriel | ⏳ | |

---

## ── BUGS ACTIFS ──────────────────────────────────────────────────────────────

| ID | Feature | Scope | Gravité | Description | Statut | Session |
|---|---|---|---|---|---|---|
| BUG-B5-001 | menu_digital | Backend | 🔴 | `create_commande` — LLM envoie item_id=nom au lieu d'UUID · skill get_menu ne précise pas que l'UUID doit être mémorisé | 🔄 En cours S67 | S67 |
| BUG-FAQ-01 | faq | Backend | 🟡 | `search_faq` jamais appelé dynamiquement — bot répond toujours depuis couche statique — ConsultationFAQ jamais créée | ⏳ À corriger | S75 |
| BUG-FAQ-02 | faq | Backend | 🟡 | Bot dit "je vais vérifier" sans exécuter l'action dans le même tour — nécessite relance client | ⏳ À corriger | S75 |
| BUG-CRM-01 | gestion_crm | Backend | 🟡 | `manage_contact` jamais déclenché pour correction de coordonnées — bot préfère transfer_to_human | ⏳ À corriger | S75 |
| BUG-CRM-02 | gestion_crm | Backend | 🟡 | LLM retourne réponse vide après transfert — ni reply ni action | ⏳ À diagnostiquer | S75 |
| BUG-CRM-03 | gestion_crm | Frontend | 🟢 | Liste Clients affiche created_at au lieu de derniere_visite | ⏳ À corriger | S75 |
| BUG-B5-002 | — | Backend | 🟡 | `agg_commande error: No module named 'apps.commandes'` — aggregator stats pointe vers un mauvais module | ⏳ À diagnostiquer | S67 |
| BUG-B5-003 | — | Backend | 🟡 | `agg_orientation_patient error: Cannot resolve keyword 'entreprise_id'` — champ absent sur OrientationPatient | ⏳ À diagnostiquer | S67 |
| BUG-B5-004 | — | Backend | 🟡 | `agg_simulation_credit error: No module named 'apps.banking'` — mauvais import dans aggregator | ⏳ À diagnostiquer | S67 |
| BUG-B5-005 | — | Backend | 🟡 | `agg_transfert_humain error: Unsupported lookup 'agent'` — join incorrect sur OneToOneField | ⏳ À diagnostiquer | S67 |
| BUG-B5-006 | menu_digital | Frontend | 🟡 | Cartes action inline (CardReservation, CardEmail) non affichées dans WhatsAppSimulator · dépend de step e menu_digital | ⏳ Après BUG-B5-001 | S67 |
| BUG-B5-007 | — | Frontend | 🟡 | Tri sessions non décroissant dans ConversationPanel · .order_by("-created_at") manquant | ⏳ À faire | S67 |
| BUG-B5-008 | — | Frontend | 🟡 | Suggestions WhatsAppSimulator incorrectes — non filtrées par features actives du bot | ⏳ À faire | S67 |

---

## ── HISTORIQUE ───────────────────────────────────────────────────────────────

| Session | Actions |
|---|---|
| S67 | Création document · fix AIAgentAction sync · fix response_format DeepSeek · menu_digital d✅ · BUG-B5-001 à 008 identifiés |
| S75 | faq ✅ (steps a-h) · gestion_crm ✅ (steps a-h) · manage_contact implémenté · fix crm_signals payload · BUG-FAQ-01/02 + BUG-CRM-01/02/03 identifiés |