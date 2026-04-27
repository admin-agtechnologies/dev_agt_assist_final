// src/types/onboarding.ts

export type OnboardingAction = "SHOW_POPUP" | "NONE";

export interface OnboardingCta {
  label: string;
  href?: string;
  action?: string;
  note?: string;
}

export interface OnboardingPayload {
  title: string;
  message: string;
  cta_primary?: OnboardingCta;
  cta_secondary?: OnboardingCta;
}

export interface OnboardingResponse {
  action: OnboardingAction;
  popup_key?: string;
  payload?: OnboardingPayload;
}

export interface OnboardingCheckRequest {
  page: string;
  context?: Record<string, unknown>;
}

export interface ClaimBonusResponse {
  success: boolean;
  already_claimed: boolean;
  montant: number;
  nouveau_solde: number;
  devise: string;
}