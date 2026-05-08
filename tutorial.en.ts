// src/dictionaries/en/tutorial.en.ts
export const tutorial = {
  title: "Interface tutorial",
  subtitle:
    "Discover all the features of your AGT workspace, section by section.",
  startBtn: "Start tutorial",
  nextBtn: "Next",
  prevBtn: "Previous",
  finishBtn: "Finish",
  skipBtn: "Skip",
  stepOf: "of",
  sections: "sections",
  goToSection: "Go to this section",
  tabs: {
    essentials: "Essentials",
    management: "Management",
    personalization: "Personalization",
    support: "Support",
  },
  steps: {
    dashboard: {
      title: "Your dashboard",
      desc: "View your messages, calls, appointments and active conversations in real time. This is your control center.",
    },
    bots: {
      title: "Your Bots",
      desc: "Create and configure your WhatsApp and voice assistants. Test them before publishing to your customers.",
    },
    knowledge: {
      title: "Knowledge base",
      desc: "Enter your business information: hours, services, branches, FAQ. Your bot uses it to respond accurately.",
    },
    appointments: {
      title: "Agenda & Appointments",
      desc: "Track all appointments automatically booked by your bot. Configure available slots according to your schedule.",
    },
    services: {
      title: "Your Services",
      desc: "Create your services with name, price and duration. Your bot uses them to inform customers and book appointments.",
    },
    billing: {
      title: "Billing & Wallet",
      desc: "Top up your wallet via Orange Money or MTN MoMo, and manage your subscription with ease.",
    },
    profile: {
      title: "My Profile",
      desc: "Customize your account information and preferences for your PME workspace.",
    },
    test: {
      title: "Test your bot",
      desc: "Simulate a real WhatsApp conversation or voice call to verify your assistant's behavior before publishing.",
    },
    help: {
      title: "Help & Documentation",
      desc: "Access documentation, video tutorials and direct support. Our team is available to guide you.",
    },
    feedback: {
      title: "Leave a testimonial",
      desc: "Share your experience with AGT Platform. Your feedback helps other entrepreneurs discover the platform.",
    },
    bug: {
      title: "Report an issue",
      desc: "A bug or anomaly? Describe it here. Our technical team is notified immediately.",
    },
  },
} as const;
