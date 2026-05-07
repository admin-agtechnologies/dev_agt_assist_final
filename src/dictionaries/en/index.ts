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
} as const;

export type EnDict = typeof en;