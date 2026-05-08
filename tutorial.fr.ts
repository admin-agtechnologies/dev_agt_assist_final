// src/dictionaries/fr/tutorial.fr.ts
export const tutorial = {
  title: "Tutoriel interface",
  subtitle:
    "Découvrez toutes les fonctionnalités de votre espace AGT, section par section.",
  startBtn: "Commencer le tutoriel",
  nextBtn: "Suivant",
  prevBtn: "Précédent",
  finishBtn: "Terminer",
  skipBtn: "Passer",
  stepOf: "sur",
  sections: "sections",
  goToSection: "Accéder à cette section",
  tabs: {
    essentials: "Essentiels",
    management: "Gestion",
    personalization: "Personnalisation",
    support: "Support",
  },
  steps: {
    dashboard: {
      title: "Votre tableau de bord",
      desc: "Visualisez en temps réel vos messages, appels, rendez-vous et conversations actives. C'est votre centre de contrôle.",
    },
    bots: {
      title: "Vos Bots",
      desc: "Créez et configurez vos assistants WhatsApp et vocaux. Testez-les avant de les publier pour vos clients.",
    },
    knowledge: {
      title: "Base de connaissance",
      desc: "Renseignez les informations de votre entreprise : horaires, services, agences, FAQ. Votre bot s'en sert pour répondre précisément.",
    },
    appointments: {
      title: "Agenda & Rendez-vous",
      desc: "Suivez tous les rendez-vous pris automatiquement par votre bot. Configurez les créneaux disponibles selon vos horaires.",
    },
    services: {
      title: "Vos Services",
      desc: "Créez vos prestations avec nom, tarif et durée. Votre bot les utilise pour informer vos clients et prendre des rendez-vous.",
    },
    billing: {
      title: "Facturation & Wallet",
      desc: "Rechargez votre portefeuille via Orange Money ou MTN MoMo, et gérez votre abonnement en toute simplicité.",
    },
    profile: {
      title: "Mon Profil",
      desc: "Personnalisez vos informations de compte et les préférences de votre espace PME.",
    },
    test: {
      title: "Tester votre bot",
      desc: "Simulez une vraie conversation WhatsApp ou un appel vocal pour vérifier le comportement de votre assistant avant publication.",
    },
    help: {
      title: "Aide & Documentation",
      desc: "Accédez à la documentation, aux tutoriels vidéo et au support direct. Notre équipe est disponible pour vous accompagner.",
    },
    feedback: {
      title: "Laisser un témoignage",
      desc: "Partagez votre expérience avec AGT Platform. Votre avis aide d'autres entrepreneurs à découvrir la plateforme.",
    },
    bug: {
      title: "Signaler un problème",
      desc: "Un bug ou une anomalie ? Décrivez-le ici. Notre équipe technique est notifiée immédiatement.",
    },
  },
} as const;
