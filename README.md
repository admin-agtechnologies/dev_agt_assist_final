# AGT PME Frontend

Interface PME de la plateforme AGT Bots.

**Port :** 3000 | **Backend :** agt-platform :8000

## Démarrage

```bash
npm install

# Mode production (agt-platform requis)
npm run dev

# Mode mock (JSON-Server — sans backend)
npm run dev:mock
```

## Comptes démo (mode mock)

- `pharmacie@example.com` / n'importe quel mot de passe
- `cabinet@example.com` / n'importe quel mot de passe

## Routes

| Route               | Description      |
| ------------------- | ---------------- |
| `/login`            | Connexion PME    |
| `/pme/dashboard`    | Tableau de bord  |
| `/pme/bots`         | Gestion des bots |
| `/pme/services`     | Services         |
| `/pme/appointments` | Rendez-vous      |
| `/pme/billing`      | Facturation      |
| `/pme/profile`      | Profil           |
