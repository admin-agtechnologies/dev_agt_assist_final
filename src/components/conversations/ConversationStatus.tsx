// src/components/conversations/ConversationStatus.tsx
"use client";

import React from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { StatusVariant } from "@/components/ui/StatusBadge";
import type { Conversation } from "@/types/api";

interface ConversationStatusProps {
  statut: Conversation["statut"];
  /** Labels — viennent du dictionnaire appelant */
  labels: {
    en_cours: string;
    terminee: string;
    abandonnee: string;
  };
  size?: "xs" | "sm" | "md";
}

const STATUT_VARIANT: Record<Conversation["statut"], StatusVariant> = {
  en_cours:   "en_cours",
  terminee:   "terminee",
  abandonnee: "abandonnee",
};

export function ConversationStatus({
  statut,
  labels,
  size = "sm",
}: ConversationStatusProps) {
  return (
    <StatusBadge
      variant={STATUT_VARIANT[statut]}
      label={labels[statut]}
      size={size}
    />
  );
}