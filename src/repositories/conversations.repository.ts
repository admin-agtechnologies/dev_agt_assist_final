// src/repositories/conversations.repository.ts
import { api } from "@/lib/api-client";
import type {
  Conversation,
  ConversationFilters,
  PaginatedResponse,
  AIConversation,
  AIConversationFilters,
  SendMessagePayload,
  SendMessageResponse,
} from "@/types/api";

// Utilitaire : convertit un objet de filtres en Record<string, string>
// pour les query params — filtre les valeurs vides/undefined/null
const toParams = (f?: object): Record<string, string> =>
  Object.fromEntries(
    Object.entries(f ?? {})
      .filter(([, v]) => v !== undefined && v !== "" && v !== null)
      .map(([k, v]) => [k, String(v)]),
  );

export const conversationsRepository = {

  // ── Ancien backend (pme/bots) — NE PAS MODIFIER ───────────────────────────

  getList: (f?: ConversationFilters): Promise<PaginatedResponse<Conversation>> =>
    api.get("/api/v1/conversations/", { params: toParams(f) }).then((data: unknown) =>
      Array.isArray(data)
        ? {
            results: data as Conversation[],
            count: (data as Conversation[]).length,
            next: null,
            previous: null,
          }
        : (data as PaginatedResponse<Conversation>),
    ),

  getById: (id: string): Promise<Conversation> =>
    api.get(`/api/v1/conversations/${id}/`),

  getMessages: (conversationId: string): Promise<unknown[]> =>
    api
      .get(`/api/v1/conversations/${conversationId}/messages/`)
      .then((data: unknown) => (Array.isArray(data) ? data : [])),

  getRapport: (conversationId: string): Promise<unknown> =>
    api
      .get(`/api/v1/conversations/${conversationId}/rapport/`)
      .catch(() => null),

  // ── Nouveau backend AGT v2 — Agent IA ─────────────────────────────────────

  // POST /api/v1/agent/message/
  // Envoie un message à l'agent. Retourne un conversation_id pour le polling.
  sendMessage: (payload: SendMessagePayload): Promise<SendMessageResponse> =>
    api.post("/api/v1/agent/message/", payload),

  // GET /api/v1/conversations/ — liste v2 avec filtres canal/statut
  // Retourne AIConversation[] (messages inclus inline dans chaque conversation)
  getAIList: (f?: AIConversationFilters): Promise<PaginatedResponse<AIConversation>> =>
    api.get("/api/v1/conversations/", { params: toParams(f) }).then((data: unknown) =>
      Array.isArray(data)
        ? {
            results: data as AIConversation[],
            count: (data as AIConversation[]).length,
            next: null,
            previous: null,
          }
        : (data as PaginatedResponse<AIConversation>),
    ),

  // GET /api/v1/conversations/{id}/ — polling v2
  // Les messages sont inclus dans la réponse, pas besoin d'un endpoint séparé.
  getAIById: (id: string): Promise<AIConversation> =>
    api.get(`/api/v1/conversations/${id}/`),
};