// src/app/(dashboard)/bots/[id]/test/_components/data/demo-transcript.ts
// Données SRT horodatées de la démo vocale AGT.
// Séparées de VoiceDemoPlayer : remplacer la démo ne touche pas au composant.

export type TranscriptSpeaker = "bot" | "client";

export interface TranscriptLine {
  id: number;
  startSec: number;
  speaker: TranscriptSpeaker;
  text: string;
}

// Conversion timestamp SRT → secondes
function t(h: number, m: number, s: number, ms: number): number {
  return h * 3600 + m * 60 + s + ms / 1000;
}

export const TRANSCRIPT_DATA: TranscriptLine[] = [
  { id: 1,  startSec: t(0, 0, 2,  670), speaker: "client", text: "J'aimerais que nous parlions en français, s'il vous plaît." },
  { id: 2,  startSec: t(0, 0, 13, 410), speaker: "client", text: "J'aimerais faire une réservation." },
  { id: 3,  startSec: t(0, 0, 18, 70),  speaker: "bot",    text: "Merveilleux ! Pour commencer, pour quelle date souhaitez-vous réserver et pour combien de personnes ?" },
  { id: 4,  startSec: t(0, 0, 23, 690), speaker: "bot",    text: "Avez-vous également une préférence pour le type de chambre ?" },
  { id: 5,  startSec: t(0, 0, 26, 950), speaker: "client", text: "Oui, j'aimerais que la réservation commence à partir d'après-demain." },
  { id: 6,  startSec: t(0, 0, 33, 290), speaker: "client", text: "Nous sommes cinq personnes et nous voulons prendre une suite." },
  { id: 7,  startSec: t(0, 0, 49, 310), speaker: "client", text: "Nous voulons séjourner pour trois nuits." },
  { id: 8,  startSec: t(0, 1, 2,  160), speaker: "client", text: "Oui, je confirme." },
  { id: 9,  startSec: t(0, 1, 20, 990), speaker: "client", text: "Oui, en ce qui concerne la gastronomie, j'aimerais que vous nous fassiez des plats africains, en particulier camerounais." },
  { id: 10, startSec: t(0, 1, 32, 390), speaker: "client", text: "J'aimerais que vous nous fassiez du ndolé, ça me ferait vraiment plaisir." },
  { id: 11, startSec: t(0, 1, 41, 370), speaker: "bot",    text: "Quelle excellente idée ! Notre chef sera ravi de vous préparer cette spécialité camerounaise." },
  { id: 12, startSec: t(0, 1, 46, 890), speaker: "bot",    text: "Pourriez-vous me dire combien de personnes souhaitent déguster ce plat et pour quel repas ?" },
  { id: 13, startSec: t(0, 1, 50, 990), speaker: "bot",    text: "Comme cela, je pourrais faire la demande spéciale au chef." },
  { id: 14, startSec: t(0, 1, 54, 370), speaker: "client", text: "Oui, le plat sera pour trois personnes, tout au juste, trois personnes." },
  { id: 15, startSec: t(0, 2, 3,  280), speaker: "bot",    text: "Entendu ! Donc, du ndolé pour trois personnes." },
  { id: 16, startSec: t(0, 2, 6,  320), speaker: "bot",    text: "Pour quel repas souhaitez-vous que ce soit préparé ? Le dîner, par exemple ?" },
  { id: 17, startSec: t(0, 2, 10, 300), speaker: "client", text: "Oui, le dîner." },
  { id: 18, startSec: t(0, 2, 15, 220), speaker: "bot",    text: "Très bien, le message est passé au chef. Le ndolé sera prêt pour le dîner de trois personnes." },
  { id: 19, startSec: t(0, 2, 20, 640), speaker: "bot",    text: "Nous nous réjouissons de vous faire découvrir cette saveur. Y a-t-il autre chose que je puisse faire pour vous ?" },
  { id: 20, startSec: t(0, 2, 25, 820), speaker: "client", text: "Je pense que là nous avons fait le tour. Merci beaucoup." },
  { id: 21, startSec: t(0, 2, 32, 260), speaker: "bot",    text: "Il n'y a pas, ce fut un plaisir de vous aider. Nous avons hâte de vous accueillir très bientôt. Excellente journée !" },
  { id: 22, startSec: t(0, 2, 38, 480), speaker: "client", text: "Merci." },
];