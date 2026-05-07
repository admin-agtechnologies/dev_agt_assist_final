// src/repositories/reservations.repository.ts
// Les réservations sont gérées dans contacts.repository.ts (rendezVousRepository)
// Ce fichier re-exporte pour compatibilité avec la structure cible
export {
  rendezVousRepository,
  clientsRepository,
  politiquesRappelRepository,
} from "./contacts.repository";