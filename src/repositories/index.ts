// src/repositories/index.ts
export * from "./auth.repository";
export * from "./users.repository";
export * from "./tenants.repository";
export * from "./bots.repository";
export * from "./feedback.repository";
export * from "./features.repository";
export * from "./conversations.repository";
export * from "./contacts.repository";
export * from "./reservations.repository";
export * from "./agences.repository";
export * from "./catalogues.repository";
export * from "./commandes.repository";
export * from "./knowledge.repository";
export * from "./public-features.repository";
export * from "./agent.repository";
export * from "./appointments.repository"; // horairesRepository + agendasRepository — S21
export * from "./services.repository";     // servicesRepository — S21

// Alias de compatibilité — billingRepository → billingActionsRepository
export { billingActionsRepository as billingRepository } from "./commandes.repository";