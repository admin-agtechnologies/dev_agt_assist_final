// src/repositories/agent.repository.ts
// Repository pour l'agent IA — /api/v1/agent/conversations/
// Pattern : même convention que les autres repositories du projet.

import { api } from "@/lib/api-client";
import type {
  HandleMessagePayload,
  AgentMessageResponse,
  AIConversation,
} from "@/types/api/agent.types";
import type { PaginatedResponse } from "@/types/api/shared.types";

const BASE = "/api/v1/agent/conversations";

/**
 * Envoie un message à l'agent.
 * Retourne la réponse immédiatement (engine synchrone).
 * Penser à appeler getConversation() ensuite pour les messages status.
 */
async function sendMessage(
  payload: HandleMessagePayload,
): Promise<AgentMessageResponse> {
  return api.post(`${BASE}/message/`, {
    canal: "whatsapp",
    mode:  "test",
    ...payload,
  }) as Promise<AgentMessageResponse>;
}

/**
 * Récupère la conversation complète avec tous ses messages.
 * Inclut les messages role="status" (feedbacks d'action) créés pendant
 * l'exécution de l'engine.
 */
async function getConversation(id: string): Promise<AIConversation> {
  return api.get(`${BASE}/${id}/`) as Promise<AIConversation>;
}

interface ConversationFilters {
  statut?: string;
  canal?: string;
  agence_id?: string;
  mode?: "live" | "test";
}

async function listConversations(
  filters?: ConversationFilters,
):Promise<PaginatedResponse<AIConversation>> {
  const params = new URLSearchParams();
  if (filters?.statut)    params.set("statut",    filters.statut);
  if (filters?.canal)     params.set("canal",     filters.canal);
  if (filters?.agence_id) params.set("agence_id", filters.agence_id);
  if (filters?.mode)      params.set("mode",      filters.mode);
  const qs = params.toString();
  return api.get(`${BASE}/${qs ? `?${qs}` : ""}`) as Promise<PaginatedResponse<AIConversation>>;
}

export const agentRepository = {
  sendMessage,
  getConversation,
  listConversations,
};