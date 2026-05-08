// src/dictionaries/en/resetPassword.en.ts
export const resetPassword = {
  title: "Reset your password",
  subtitle: "Choose a new password for your account.",
  newPassword: "New password",
  confirmPassword: "Confirm password",
  passwordPlaceholder: "••••••••",
  submitBtn: "Update password",
  passwordTooShort: "Password must be at least 8 characters.",
  passwordsMismatch: "Passwords do not match.",
  successTitle: "Password updated ✓",
  successSubtitle: "Redirecting to your dashboard…",
  errorTitle: "Invalid link",
  errorMissingToken:
    "No reset token provided. Please request a new link.",
  errorGeneric:
    "Unable to reset your password. The link may have expired.",
  backToLogin: "Back to login",
} as const;
