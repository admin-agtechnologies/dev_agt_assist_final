// src/types/api/service.types.ts
// Re-export depuis agence.types — Service et Agence vivent dans le même fichier
// car ils partagent le même app backend (apps/services/)

export type {
  Service,
  CreateServicePayload,
  ServiceFilters,
  Agence,
  CreateAgencePayload,
  HorairesOuverture,
  DaySchedule,
  UpdateHorairesPayload,
  Agenda,
  CreateAgendaPayload,
} from './agence.types';