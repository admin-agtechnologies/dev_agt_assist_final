// src/components/conversations/StatusMessage.tsx
"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface StatusMessageProps {
  /** Texte du message de statut — vient du dictionnaire appelant */
  content: string;
  /** Afficher une animation de chargement */
  isAnimated?: boolean;
}

export function StatusMessage({ content, isAnimated = false }: StatusMessageProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-2">
      {isAnimated && (
        <Loader2
          size={13}
          className="animate-spin flex-shrink-0"
          style={{ color: "var(--color-accent)" }}
        />
      )}
      <p
        className="text-xs italic text-gray-400"
        style={{ color: isAnimated ? "var(--color-accent)" : undefined }}
      >
        {content}
      </p>
    </div>
  );
}