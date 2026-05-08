// src/repositories/feedback.repository.ts
import { api } from "@/lib/api-client";
import type { ClaimBonusResponse, OnboardingCheckRequest, OnboardingResponse } from "@/types/onboarding";

export interface CreateTemoignagePayload {
    note: number;
    contenu: string;
}

export interface CreateProblemePayload {
    categorie: string;
    severite: string;
    titre: string;
    contenu: string;
}

const p = (f?: object): Record<string, string> =>
    Object.fromEntries(
        Object.entries(f ?? {})
            .filter(([, v]) => v !== undefined && v !== "" && v !== null)
            .map(([k, v]) => [k, String(v)]),
    );

export const feedbackRepository = {
    createTemoignage: (payload: CreateTemoignagePayload): Promise<unknown> =>
        api.post("/api/v1/feedback/temoignages/", payload),
    createProbleme: (payload: CreateProblemePayload): Promise<unknown> =>
        api.post("/api/v1/feedback/problemes/", payload),
    getTemoignages: (params?: { featured_landing?: boolean; featured_login?: boolean }): Promise<unknown[]> =>
        api.get("/api/v1/feedback/temoignages/", { params: p(params) }).then((data: unknown) =>
            Array.isArray(data) ? data : ((data as { results?: unknown[] }).results ?? []),
        ),
};

export const onboardingRepository = {
    check: (payload: OnboardingCheckRequest): Promise<OnboardingResponse> =>
        api.post<OnboardingResponse>("/api/v1/onboarding/check/", payload),
    claimBonus: (): Promise<ClaimBonusResponse> =>
        api.post<ClaimBonusResponse>("/api/v1/onboarding/claim-bonus/", {}),
};

export const tutorialRepository = {
    getProgress: (): Promise<{ last_step: number; has_completed_tutorial: boolean }> =>
        api.get("/api/v1/onboarding/tutorial/"),
    saveStep: (last_step: number): Promise<{ last_step: number; has_completed_tutorial: boolean }> =>
        api.patch("/api/v1/onboarding/tutorial/", { last_step }),
    complete: (): Promise<{ last_step: number; has_completed_tutorial: boolean }> =>
        api.patch("/api/v1/onboarding/tutorial/", { completed: true }),
};