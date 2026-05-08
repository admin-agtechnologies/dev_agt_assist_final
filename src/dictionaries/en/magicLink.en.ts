// src/dictionaries/en/magicLink.en.ts
export const magicLink = {
  loading: "Signing in…",
  loadingSubtitle: "Please wait a moment.",
  successTitle: "Welcome ✓",
  successSubtitle: "You are signed in. Redirecting…",
  errorTitle: "Invalid link",
  errorSubtitle:
    "Magic links expire after 15 minutes. Request a new one from the login page.",
  errorMissingToken: "No magic token provided.",
  errorGeneric: "This magic link is no longer valid.",
  backToLogin: "Back to login",
} as const;
