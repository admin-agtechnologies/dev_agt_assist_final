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
} as const;

export type FrDict = typeof fr;