// src/dictionaries/en/feedback.en.ts
export const feedback = {
  subtitle: "Share your experience with AGT Platform.",
  ratingLabel: "Your overall rating",
  commentLabel: "Your testimonial",
  commentPlaceholder:
    "Describe your experience with AGT Platform. How has it helped your business?",
  minChars: "Minimum 10 characters",
  submitBtn: "Submit testimonial",
  successTitle: "Testimonial submitted!",
  successBody: "Thank you for helping improve the platform.",
  another: "Leave another testimonial",
  successToast: "Thank you for your testimonial!",
  errorRating: "Please select a rating before submitting.",
  errorComment: "Your testimonial must be at least 10 characters.",
  bug: {
    subtitle:
      "Describe the issue encountered. Our technical team will be notified immediately.",
    categoryLabel: "Which part of the platform is affected?",
    severityLabel: "What is the impact on your business?",
    titleLabel: "Issue summary",
    titlePlaceholder: "Ex: The bot stopped responding this morning",
    descLabel: "Detailed description",
    minChars: "Minimum 20 characters",
    submitBtn: "Submit report",
    successTitle: "Report received!",
    successBody:
      "Our technical team has been notified. We will get back to you as soon as possible.",
    another: "Report another issue",
    successToast: "Report submitted. Thank you, we will investigate!",
  },
} as const;