// src/types/api/agent.types.ts
// Types pour l'app agent IA — endpoint /api/v1/agent/conversations/
// Aligné sur apps/agent/serializers.py + views.py (session 14)
// ⚠️ NE PAS exporter via le barrel types/api/index.ts
//    (conversation.types.ts a déjà AIConversation — conflit barrel)
//    → importer directement depuis "@/types/api/agent.types"

export type AIMessageRole = "user" | "assistant" | "status";

export type AIConversationStatut = "active" | "terminee" | "transferee";

export interface AIMessage {
  id: string;
  role: AIMessageRole;
  contenu: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AIConversation {
  id: string;
  agent: string;
  agence: string;
  contact: { id: string; nom: string; phone: string } | null;
  canal: "whatsapp" | "vocal" | "web";
  mode: "live" | "test";
  statut: AIConversationStatut;
  /** Données collectées par l'engine : contact, résumé, signaux CRM. */
  contexte: Record<string, unknown>;
  messages: AIMessage[];
  actions_declenchees?: Array<{
    action_slug: string;
    statut: "succes" | "echec";
    created_at: string;
  }>;
  created_at: string;
  updated_at: string;
}

/**
 * Payload pour POST /api/v1/agent/conversations/message/
 * Tous les champs sauf `message` sont optionnels.
 * Si conversation_id absent → nouvelle conversation.
 * Si agence_id absent → première agence active de l'entreprise.
 */
export interface HandleMessagePayload {
  conversation_id?: string;
  contact_id?: string;
  agence_id?: string;
  canal?: "whatsapp" | "vocal" | "web";
  mode?: "live" | "test";
  message: string;
}

/**
 * Réponse synchrone de POST /api/v1/agent/conversations/message/
 * L'engine tourne en synchrone — reply est disponible immédiatement.
 * Faire un GET /conversations/{conversation_id}/ pour les messages status.
 */
export interface AgentMessageResponse {
  conversation_id: string;
  message_id: string;
  reply: string;
  statut: AIConversationStatut;
}