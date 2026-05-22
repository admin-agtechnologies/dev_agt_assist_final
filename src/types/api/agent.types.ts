// src/types/api/agent.types.ts
// Types pour l'app agent IA — endpoint /api/v1/agent/conversations/
// Aligné sur apps/agent/serializers.py + views.py (session 14)
// S50 : AIActionDeclenchee enrichi — id, response_recue, duree_ms, nouveaux statuts
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

// S50 — aligné sur AIActionLogSerializer (apps/agent/serializers.py)
export interface AIActionDeclenchee {
  id: string;
  action_slug: string;
  statut: "succes" | "echec" | "timeout" | "validation_error" | "context_corrected";
  response_recue?: Record<string, unknown>;
  duree_ms?: number;
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
  contexte: Record<string, unknown>;
  messages: AIMessage[];
  actions_declenchees: AIActionDeclenchee[];
  created_at: string;
  updated_at: string;
}

export interface HandleMessagePayload {
  conversation_id?: string;
  contact_id?: string;
  agence_id?: string;
  canal?: "whatsapp" | "vocal" | "web";
  mode?: "live" | "test";
  message: string;
}

export interface AgentMessageResponse {
  conversation_id: string;
  message_id: string;
  reply: string;
  statut: AIConversationStatut;
}