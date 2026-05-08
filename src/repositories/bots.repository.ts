// src/repositories/bots.repository.ts
import { api } from "@/lib/api-client";
import type {
    Bot, CreateBotPayload, BotFilters, NumeroTelephone,
    PaginatedResponse, WahaStatusResponse, WahaConnectResponse, WahaDisconnectResponse,
    ChatbotConfig, UpdateChatbotConfigPayload, ChatbotTestPayload, ChatbotTestResponse,
    TestSessionSummary, TestSessionDetail,
} from "@/types/api";

const p = (f?: object): Record<string, string> =>
    Object.fromEntries(
        Object.entries(f ?? {})
            .filter(([, v]) => v !== undefined && v !== "" && v !== null)
            .map(([k, v]) => [k, String(v)]),
    );

export const botsRepository = {
    getList: (f?: BotFilters): Promise<PaginatedResponse<Bot>> =>
        api.get("/api/v1/bots/", { params: p(f) }).then((data: unknown) =>
            Array.isArray(data)
                ? { results: data as Bot[], count: (data as Bot[]).length, next: null, previous: null }
                : (data as PaginatedResponse<Bot>),
        ),
    getById: (id: string): Promise<Bot> =>
        api.get(`/api/v1/bots/${id}/`),
    create: (payload: CreateBotPayload): Promise<Bot> =>
        api.post("/api/v1/bots/", payload),
    patch: (id: string, payload: Partial<CreateBotPayload> & Record<string, unknown>): Promise<Bot> =>
        api.patch(`/api/v1/bots/${id}/`, payload),
    delete: (id: string): Promise<void> =>
        api.delete(`/api/v1/bots/${id}/`),
};

export const phoneNumbersRepository = {
    getList: (f?: { entreprise?: string }): Promise<NumeroTelephone[]> =>
        api.get("/api/v1/bots/numeros/", { params: p(f) }).then((data: unknown) =>
            Array.isArray(data)
                ? (data as NumeroTelephone[])
                : ((data as PaginatedResponse<NumeroTelephone>).results ?? []),
        ),
    getById: (id: string): Promise<NumeroTelephone> =>
        api.get(`/api/v1/bots/numeros/${id}/`),
};

export const wahaRepository = {
    getStatus: (botId: string): Promise<WahaStatusResponse> =>
        api.get(`/api/v1/bots/${botId}/whatsapp/status/`),
    connect: (botId: string): Promise<WahaConnectResponse> =>
        api.post(`/api/v1/bots/${botId}/whatsapp/connect/`, {}),
    disconnect: (botId: string): Promise<WahaDisconnectResponse> =>
        api.post(`/api/v1/bots/${botId}/whatsapp/disconnect/`, {}),
};

export const chatbotRepository = {
    testChat: (payload: ChatbotTestPayload): Promise<ChatbotTestResponse> =>
        api.post<ChatbotTestResponse>("/api/v1/chatbot/test/", payload),
    getChatbotConfig: (botId: string): Promise<ChatbotConfig> =>
        api.get<ChatbotConfig>(`/api/v1/bots/${botId}/chatbot/`),
    updateChatbotConfig: (botId: string, payload: UpdateChatbotConfigPayload): Promise<ChatbotConfig> =>
        api.patch<ChatbotConfig>(`/api/v1/bots/${botId}/chatbot/`, payload),
    getSessions: (botId: string): Promise<PaginatedResponse<TestSessionSummary>> =>
        api.get("/api/v1/chatbot/sessions/", { params: { bot: botId, ordering: "-created_at" } })
            .then((data: unknown) =>
                Array.isArray(data)
                    ? { results: data as TestSessionSummary[], count: (data as TestSessionSummary[]).length, next: null, previous: null }
                    : (data as PaginatedResponse<TestSessionSummary>),
            ),
    getSessionDetail: (sessionId: string): Promise<TestSessionDetail> =>
        api.get<TestSessionDetail>(`/api/v1/chatbot/sessions/${sessionId}/`),
};