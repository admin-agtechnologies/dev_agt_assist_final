// src/components/contacts/InteractionTimeline.tsx
"use client";

import React from "react";
import { MessageSquare, Calendar, Phone } from "lucide-react";
import type { RendezVous, Conversation } from "@/types/api";

type TimelineItem =
  | { type: "rdv"; data: RendezVous }
  | { type: "conversation"; data: Conversation };

interface InteractionTimelineProps {
  items: TimelineItem[];
  /** Labels — viennent du dictionnaire appelant */
  labels: {
    history: string;
    noHistory: string;
    rdvCount: string;
    conversationCount: string;
  };
  lang: "fr" | "en";
}

function ItemIcon({ type }: { type: TimelineItem["type"] }) {
  if (type === "rdv") return <Calendar size={14} style={{ color: "var(--color-primary)" }} />;
  if (type === "conversation") return <MessageSquare size={14} style={{ color: "var(--color-accent)" }} />;
  return <Phone size={14} className="text-gray-400" />;
}

function formatDate(dateStr: string, lang: "fr" | "en") {
  return new Date(dateStr).toLocaleDateString(
    lang === "fr" ? "fr-FR" : "en-US",
    { day: "2-digit", month: "short", year: "numeric" },
  );
}

export function InteractionTimeline({ items, labels, lang }: InteractionTimelineProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-4 text-center">
        {labels.noHistory}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const date =
          item.type === "rdv"
            ? formatDate(item.data.scheduled_at, lang)
            : formatDate(item.data.created_at, lang);

        const label =
          item.type === "rdv"
            ? item.data.agenda_nom
            : item.data.bot_nom;

        return (
          <div key={i} className="flex items-start gap-3">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ backgroundColor: "var(--color-bg)" }}
            >
              <ItemIcon type={item.type} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800 font-medium truncate">{label}</p>
              <p className="text-xs text-gray-400">{date}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}