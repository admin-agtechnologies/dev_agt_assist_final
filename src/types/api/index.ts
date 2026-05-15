// src/types/api/index.ts
// Point d'entrée unique — re-exporte tous les domaines
// S25 — ajout export './tenant.types' (fix DETTE-S24-01)

export * from './shared.types';
export * from './user.types';
export * from './tenants.types';
export * from './feature.types';
export * from './agence.types';
export * from './contact.types';
export * from './commande.types';
export * from './catalogue.types';
export * from './conversation.types';
export * from './reservation.types';
export * from './crm.types';
export * from './bot.types';
export * from './knowledge.types';
export * from './tenant.types';

// ⚠️ agent.types.ts n'est PAS exporté ici —
//    conversation.types.ts déclare déjà AIConversation (conflit barrel).
//    → importer directement depuis "@/types/api/agent.types"