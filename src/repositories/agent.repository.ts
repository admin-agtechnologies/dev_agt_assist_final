// src/repositories/agent.repository.ts
import { api } from "@/lib/api-client";
import type { PaginatedResponse } from "@/types/api";
import type {
  AIConversation,
  AIConversationFilters,
  SendMessagePayload,
  SendMessageResponse,
} from "@/types/api/conversation.types";

const p = (f?: object): Record<string, string> =>
  Object.fromEntries(
    Object.entries(f ?? {})
      .filter(([, v]) => v !== undefined && v !== "" && v !== null)
      .map(([k, v]) => [k, String(v)]),
  );

export const agentRepository = {
  sendMessage: (payload: SendMessagePayload): Promise<SendMessageResponse> =>
    api.post("/api/v1/agent/message/", payload),

  getConversation: (id: string): Promise<AIConversation> =>
    api.get(`/api/v1/agent/conversations/${id}/`),

  listConversations: (f?: AIConversationFilters): Promise<PaginatedResponse<AIConversation>> =>
    api.get("/api/v1/agent/conversations/", { params: p(f) }).then((data: unknown) =>
      Array.isArray(data)
        ? { results: data as AIConversation[], count: (data as AIConversation[]).length, next: null, previous: null }
        : (data as PaginatedResponse<AIConversation>),
    ),
};