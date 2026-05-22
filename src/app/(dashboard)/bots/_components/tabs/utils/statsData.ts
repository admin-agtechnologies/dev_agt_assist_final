// src/app/(dashboard)/bots/_components/tabs/utils/statsData.ts
// Fonctions pures de calcul des données stats — séparées pour testabilité.

import type { Conversation } from "@/types/api";

const JOURS_FR = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

export function buildWeekData(
  conversations: Conversation[],
  days: number,
  offsetDays: number,
) {
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i - offsetDays * days);
    const dateStr = d.toISOString().split("T")[0];
    const dayLabel = JOURS_FR[d.getDay()];
    const dayConvs = conversations.filter(c => c.created_at?.startsWith(dateStr));
    result.push({
      day:          dayLabel,
      messages:     dayConvs.reduce((acc, c) => acc + c.nb_messages, 0),
      calls:        dayConvs.filter(c => c.bot_type === "vocal").length,
      appointments: dayConvs.reduce((acc, c) => acc + (c.rapport?.rdv_planifies ?? 0), 0),
      emails:       dayConvs.reduce((acc, c) => acc + (c.rapport?.emails_envoyes ?? 0), 0),
      handoffs:     dayConvs.filter(c => c.human_handoff).length,
    });
  }
  return result;
}

export type StatsDataPoint = ReturnType<typeof buildWeekData>[number];