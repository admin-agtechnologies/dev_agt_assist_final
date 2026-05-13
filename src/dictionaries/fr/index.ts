// src/dictionaries/fr/index.ts
import { common } from "./common.fr";
import { dashboard } from "./dashboard.fr";
import { auth } from "./auth.fr";
import { landing } from "./landing.fr";
import { onboarding } from "./onboarding.fr";
import { bots } from "./bots.fr";
import { services } from "./services.fr";
import { reservations } from "./reservations.fr";
import { billing } from "./billing.fr";
import { knowledge } from "./knowledge.fr";
import { contacts } from "./contacts.fr";
import { conversations } from "./conversations.fr";
import { catalogue } from "./catalogue.fr";
import { commandes } from "./commandes.fr";
import { profile } from "./profile.fr";
import { feedback } from "./feedback.fr";
import { dossiers } from "./dossiers.fr";
import { inscriptions } from "./inscriptions.fr";
import { nav } from "./nav.fr";
import { errors } from "./errors.fr";
import { plans } from "./plans.fr";
import { pending } from "./pending.fr";
import { verifyEmail } from "./verifyEmail.fr";
import { resetPassword } from "./resetPassword.fr";
import { magicLink } from "./magicLink.fr";
import { settings } from "./settings.fr";
import { faq } from "./faq.fr";
import { support } from "./support.fr";
import { help } from "./help.fr";
import { tutorial } from "./tutorial.fr";
import { bug } from "./bug.fr";
import { appointments } from "./appointments.fr";
import { restaurant } from "./restaurant.fr";
import { banking } from "./banking.fr"
import {school} from "./school.fr"

export const fr = {
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
  settings,
  faq,
  support,
  help,
  tutorial,
  bug,
  appointments,
  restaurant,
  banking,
  school,
} as const;

export type FrDict = typeof fr;

