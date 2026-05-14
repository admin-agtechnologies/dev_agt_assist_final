# CDC — CRM / Fiches Clients
**Statut :** Prêt pour implémentation  
**Priorité :** Moyenne-Haute  
**Sessions estimées :** 1–2  
**Dépendances :** Backend contacts existant (`apps/contacts/`)

---

## Contexte & Objectif

La page actuelle `/contacts` affiche une liste basique avec une fiche latérale. Elle contient déjà des éléments solides (filtres, fiche latérale, stats, historique conversations) mais manque de profondeur CRM et de richesse visuelle.

**Objectif :** Transformer `/contacts` en un vrai CRM centralisé — fiches clients riches, actions rapides, timeline complète, scoring, notes et tags.

---

## État actuel (audit)

### Ce qui existe déjà ✅
- Liste clients avec colonnes : CLIENT, CONTACT, CONV., RDV, DERNIER CONTACT, BOT, RÉSUMÉ
- Filtres : par bot, "Avec RDV", "Avec transfert humain", "Inclure sans conversation"
- Recherche par nom/téléphone/email
- Fiche latérale droite avec :
  - Stats (conversations, RDV planifiés, emails envoyés, transferts humains)
  - Bots utilisés
  - Dernière fiche client (générée par le bot / IA)
  - Points clés (tags)
  - Historique des conversations

### Ce qui manque ❌
- Statut CRM du client (prospect → contact → client → inactif)
- Notes libres sur le client (saisies manuellement par l'entreprise)
- Tags/labels personnalisés par l'entreprise
- Timeline unifiée (conversations + RDV + emails + transferts + notes)
- Actions rapides depuis la fiche (créer RDV, envoyer email, démarrer conversation WhatsApp)
- Score/valeur client (nombre total interactions, RDV honorés, valeur générée)
- Filtres avancés (statut CRM, score, date première/dernière interaction)
- Vue liste vs vue kanban (par statut CRM)
- Export CSV
- Pagination correcte (infinite scroll ou numérotée)

---

## Design de la page

### Layout principal

```
┌─────────────────────────────────────────────────────────────────┐
│ CRM Clients                                    [+ Nouveau]  [↑] │
│ N clients • Filtrés par: [bot ▼] [Statut ▼] [Tag ▼]  [Trier ▼]│
├─────────────────┬───────────────────────────────────────────────┤
│                 │                                               │
│   LISTE         │   FICHE CLIENT                                │
│   (40%)         │   (60%)                                       │
│                 │                                               │
└─────────────────┴───────────────────────────────────────────────┘
```

Sur mobile : liste seule → tap ouvre fiche en plein écran.

---

## Spécifications détaillées

### 1. Liste clients — améliorations

**Colonnes :**
```
Avatar | Nom + téléphone | Statut CRM | Dernier contact | Score | Bot | →
```

**Statut CRM** : badge coloré
- 🔵 Prospect (first contact, pas encore qualifié)
- 🟡 Contact (a interagi, pas encore converti)
- 🟢 Client (a effectué un achat/RDV)
- ⚫ Inactif (>90 jours sans interaction)

**Score** : indicateur simple ★☆☆ à ★★★ basé sur fréquence interactions

**Filtres avancés :**
- Statut CRM (multi-select)
- Bot utilisé (dropdown)
- Tag (multi-select)
- Date dernière interaction (range)
- "Avec RDV" / "Avec transfert" / "Jamais répondu"

**Tri :** Date contact, Nom, Score, Conversations

**Pagination :** 20 par page + infinite scroll ou numérotée

### 2. Fiche client — enrichissement

**En-tête :**
```
[Avatar initiales]  NOM COMPLET
                    +237 xxx xxx xxx
                    client@email.com
                    [Prospect ▼]    [tag1] [tag2] [+ tag]
                    Client depuis : 12 mai 2026
```

**Stats rapides (4 cards) :**
- Conversations | RDV planifiés | Emails envoyés | Transferts humains

**Actions rapides :**
```
[💬 WhatsApp]  [📅 RDV]  [✉️ Email]  [⋮ Plus]
```
- WhatsApp → ouvre `wa.me/{phone}` dans nouvel onglet
- RDV → ouvre modal création RDV pré-rempli avec ce client
- Email → ouvre modal envoi email
- Plus → menu dropdown (Marquer inactif, Exporter, Supprimer)

**Onglets fiche :**

**Onglet Aperçu :**
- Résumé IA (dernière fiche générée par le bot)
- Points clés (tags générés + tags manuels)
- Notes libres (textarea + historique des notes avec auteur + date)

**Onglet Timeline :**
- Vue chronologique de TOUTES les interactions :
  - 💬 Conversation WhatsApp (avec résumé)
  - 📅 RDV créé / confirmé / annulé
  - ✉️ Email envoyé
  - 👤 Transfert humain
  - 📝 Note ajoutée manuellement
- Filtre par type d'interaction
- Infinite scroll

**Onglet Bots :**
- Liste des bots qui ont interagi avec ce client
- Dernière interaction par bot

---

## Backend — Ce qui manque

### Modèle Contact — enrichissement

```python
# apps/contacts/models.py — ajouter :
class Contact(models.Model):
    # ... champs existants ...
    
    # CRM
    statut = models.CharField(
        max_length=20,
        choices=[
            ('prospect', 'Prospect'),
            ('contact', 'Contact'),
            ('client', 'Client'),
            ('inactif', 'Inactif'),
        ],
        default='prospect'
    )
    tags = models.JSONField(default=list)  # ["vip", "fidele", ...]
    notes = models.JSONField(default=list)  # [{text, created_at, author_name}]
    score = models.IntegerField(default=0)  # calculé automatiquement
    
    # Computed / cached
    derniere_interaction = models.DateTimeField(null=True, blank=True)
    nb_conversations = models.IntegerField(default=0)
    nb_rdv = models.IntegerField(default=0)
```

**Migration :** `python manage.py makemigrations contacts`

### Endpoints à créer/compléter

```python
# PATCH /api/v1/contacts/{id}/  — déjà partiellement existant
# Ajouter dans payload accepté : statut, tags, notes (append)

# POST /api/v1/contacts/{id}/notes/  — ajouter une note
# {text: string} → append dans contacts.notes avec timestamp + user.name

# GET /api/v1/contacts/{id}/timeline/  — timeline unifiée
# Agrège : AIConversation + RendezVous + emails + transferts + notes
# Retourne : [{type, date, résumé, metadata}] trié desc

# GET /api/v1/contacts/?statut=client&tag=vip&score_min=2 — filtres avancés
# Ajouter ces query params au ContactViewSet existant
```

### Serializer Contact — compléter

```python
class ContactSerializer(serializers.ModelSerializer):
    score = serializers.SerializerMethodField()
    
    def get_score(self, obj):
        # Simple scoring : 1★ si ≥1 conv, 2★ si ≥3 conv ou 1 RDV, 3★ si ≥5 conv + RDV
        score = 0
        if obj.nb_conversations >= 1: score += 1
        if obj.nb_conversations >= 3 or obj.nb_rdv >= 1: score += 1
        if obj.nb_conversations >= 5 and obj.nb_rdv >= 1: score += 1
        return score
    
    class Meta:
        model = Contact
        fields = [
            "id", "nom", "prenom", "phone", "email", "statut", "tags", 
            "notes", "score", "source", "agence_id",
            "nb_conversations", "nb_rdv", "derniere_interaction", "created_at"
        ]
```

---

## Frontend — Structure fichiers

```
src/app/(dashboard)/contacts/
├── page.tsx                      # Layout liste + fiche
├── _components/
│   ├── ContactList.tsx           # Table/liste avec pagination
│   ├── ContactFilters.tsx        # Barre filtres avancés
│   ├── ContactRow.tsx            # Ligne de liste avec statut + score
│   ├── fiche/
│   │   ├── ClientFiche.tsx       # Fiche latérale complète
│   │   ├── FicheHeader.tsx       # Avatar + infos + statut + tags + actions
│   │   ├── FicheStats.tsx        # 4 cards stats rapides
│   │   ├── FicheApercu.tsx       # Résumé IA + notes
│   │   ├── FicheTimeline.tsx     # Timeline unifiée
│   │   └── FicheBots.tsx         # Bots utilisés
│   ├── NoteEditor.tsx            # Ajout note inline
│   ├── StatusBadge.tsx           # Badge statut CRM coloré
│   └── ScoreIndicator.tsx        # ★☆☆ score client
```

### Types TypeScript

```typescript
// src/types/api/contact.types.ts — ENRICHIR

export type ContactStatut = 'prospect' | 'contact' | 'client' | 'inactif';

export interface ContactNote {
  text: string;
  created_at: string;
  author_name: string;
}

export interface TimelineEvent {
  id: string;
  type: 'conversation' | 'rdv' | 'email' | 'transfert' | 'note';
  date: string;
  resume: string;
  metadata?: Record<string, unknown>;
}

export interface Contact {
  id: string;
  nom: string;
  prenom: string | null;
  phone: string;
  email: string | null;
  statut: ContactStatut;
  tags: string[];
  notes: ContactNote[];
  score: 0 | 1 | 2 | 3;
  source: 'whatsapp' | 'vocal' | 'web' | 'manuel';
  agence_id: string;
  nb_conversations: number;
  nb_rdv: number;
  derniere_interaction: string | null;
  created_at: string;
}
```

### Repository à mettre à jour

```typescript
// src/repositories/contacts.repository.ts
export const contactsRepository = {
  // existant — ajouter params filtres
  getList: (filters?: ContactFilters): Promise<PaginatedResponse<Contact>> =>
    api.get("/api/v1/contacts/", { params: p(filters) }),
  
  getById: (id: string): Promise<Contact> =>
    api.get(`/api/v1/contacts/${id}/`),
  
  update: (id: string, payload: Partial<Contact>): Promise<Contact> =>
    api.patch(`/api/v1/contacts/${id}/`, payload),
  
  // NOUVEAU
  addNote: (id: string, text: string): Promise<Contact> =>
    api.post(`/api/v1/contacts/${id}/notes/`, { text }),
  
  getTimeline: (id: string): Promise<TimelineEvent[]> =>
    api.get(`/api/v1/contacts/${id}/timeline/`),
};
```

---

## Sur la page Conversations

**Question ouverte :** La page `/conversations` est-elle nécessaire en plus des CRM contacts ?

**Recommandation :**
- Conserver comme **vue cross-bots** : toutes les conversations de tous les bots, filtrables par bot/date/statut
- Différence avec CRM contacts : conversations = vue côté BOT ; contacts = vue côté CLIENT
- Si jugée redondante → fusionner dans onglet Timeline du CRM et supprimer `/conversations`
- **Décision à prendre en S20 avant implémentation**

---

## Ordre d'implémentation recommandé

### Phase 1 — Backend
1. Migration Contact (statut, tags, notes, score, nb_conversations, nb_rdv)
2. Mise à jour `ContactSerializer`
3. Mise à jour `ContactViewSet` — filtres avancés + endpoint notes
4. Créer `GET /api/v1/contacts/{id}/timeline/`
5. Tests : vérifier scoring + timeline

### Phase 2 — Frontend
1. Types + repository mis à jour
2. `ContactList` + `ContactFilters` + `ContactRow` avec `StatusBadge` + `ScoreIndicator`
3. `FicheHeader` + `FicheStats` + actions rapides
4. `FicheApercu` + `NoteEditor`
5. `FicheTimeline`
6. `FicheBots`
7. Tests E2E : ajout note, changement statut, tag, timeline

---

## Critères de validation

- [ ] `GET /api/v1/contacts/?statut=client` retourne les clients filtrés
- [ ] `PATCH /api/v1/contacts/{id}/` accepte `statut`, `tags`
- [ ] `POST /api/v1/contacts/{id}/notes/` ajoute une note dans le tableau `notes`
- [ ] `GET /api/v1/contacts/{id}/timeline/` retourne les événements triés
- [ ] Statut CRM modifiable depuis la fiche (dropdown dans FicheHeader)
- [ ] Tags ajoutables/supprimables inline
- [ ] Notes s'affichent dans l'onglet Aperçu avec timestamp
- [ ] Timeline affiche tous les types d'événements
- [ ] Filtres fonctionnels (statut, bot, tag, date)
- [ ] Score calculé et affiché correctement
- [ ] Actions rapides (WhatsApp, RDV) opérationnelles
- [ ] `npx tsc --noEmit` → 0 erreurs
- [ ] Design cohérent avec design system (couleurs sectorielles)