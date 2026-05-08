// src/repositories/conversations.repository.ts
import { api } from "@/lib/api-client";
import type {
  Conversation,
  ConversationFilters,
  PaginatedResponse,
} from "@/types/api";

const toParams = (f?: object): Record<string, string> =>
  Object.fromEntries(
    Object.entries(f ?? {})
      .filter(([, v]) => v !== undefined && v !== "" && v !== null)
      .map(([k, v]) => [k, String(v)]),
  );

export const conversationsRepository = {
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
};