// src/dictionaries/en/index.ts
import { common } from "./common.en";
import { dashboard } from "./dashboard.en";
import { auth } from "./auth.en";
import { landing } from "./landing.en";
import { onboarding } from "./onboarding.en";
import { bots } from "./bots.en";
import { services } from "./services.en";
import { reservations } from "./reservations.en";
import { billing } from "./billing.en";
import { knowledge } from "./knowledge.en";
import { contacts } from "./contacts.en";
import { conversations } from "./conversations.en";
import { catalogue } from "./catalogue.en";
import { commandes } from "./commandes.en";
import { profile } from "./profile.en";
import { feedback } from "./feedback.en";
import { dossiers } from "./dossiers.en";
import { inscriptions } from "./inscriptions.en";
import { nav } from "./nav.en";
import { errors } from "./errors.en";
import { plans } from "./plans.en";
import { pending } from "./pending.en";
import { verifyEmail } from "./verifyEmail.en";
import { resetPassword } from "./resetPassword.en";
import { magicLink } from "./magicLink.en";
import { faq } from "./faq.en";
import { support } from "./support.en";
import { help } from "./help.en";
import { tutorial } from "./tutorial.en";
import { bug } from "./bug.en";
import { appointments } from "./appointments.en";
import { settings } from "./settings.en";
import { restaurant } from "./restaurant.en";
import { banking } from "./banking.en"

export const en = {
  common,
  dashboard,
  auth,
  landing,
  onboarding,
  bots,
  services,
  reservations,
  billing,
  knowledge,
  contacts,
  conversations,
  catalogue,
  commandes,
  profile,
  feedback,
  dossiers,
  inscriptions,
  nav,
  errors,
  plans,
  pending,
  verifyEmail,
  resetPassword,
  magicLink,
  faq,
  support,
  help,
  tutorial,
  bug,
  appointments,
  settings,
  restaurant,
  banking,
} as const;

export type EnDict = typeof en;
