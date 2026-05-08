// src/components/conversations/ConversationStatus.tsx
"use client";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { StatusVariant } from "@/components/ui/StatusBadge";
import type { AIConversation } from "@/types/api";

interface ConversationStatusProps {
  statut: AIConversation["statut"];
  labels: {
    active: string;
    terminee: string;
    transferee: string;
  };
  size?: "xs" | "sm" | "md";
}

const STATUT_VARIANT: Record<AIConversation["statut"], StatusVariant> = {
  active:     "en_cours",
  terminee:   "terminee",
  transferee: "abandonnee",
};

export function ConversationStatus({ statut, labels, size = "sm" }: ConversationStatusProps) {
  return (
    <StatusBadge
      variant={STATUT_VARIANT[statut]}
      label={labels[statut]}
      size={size}
    />
  );
}