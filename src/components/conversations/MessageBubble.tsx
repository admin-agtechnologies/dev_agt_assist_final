// src/components/conversations/MessageBubble.tsx
"use client";

import React from "react";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  /** Heure formatée — fournie par le parent */
  time?: string;
  /** Label du rôle — vient du dictionnaire appelant */
  roleLabel?: string;
}

export function MessageBubble({
  role,
  content,
  time,
  roleLabel,
}: MessageBubbleProps) {
  const isAssistant = role === "assistant";

  return (
    <div
      className={[
        "flex gap-2 max-w-[85%]",
        isAssistant ? "self-start" : "self-end flex-row-reverse",
      ].join(" ")}
    >
      {/* Avatar */}
      <div
        className={[
          "w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white mt-1",
          isAssistant ? "bg-[var(--color-primary)]" : "bg-gray-400",
        ].join(" ")}
      >
        {isAssistant ? "B" : "U"}
      </div>

      {/* Bulle */}
      <div className="flex flex-col gap-1">
        {roleLabel && (
          <span className="text-xs text-gray-400 px-1">{roleLabel}</span>
        )}
        <div
          className={[
            "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
            isAssistant
              ? "bg-white border border-gray-100 text-gray-800 rounded-tl-sm"
              : "text-white rounded-tr-sm",
          ].join(" ")}
          style={!isAssistant ? { backgroundColor: "var(--color-primary)" } : undefined}
        >
          {content}
        </div>
        {time && (
          <span
            className={[
              "text-xs text-gray-400 px-1",
              isAssistant ? "text-left" : "text-right",
            ].join(" ")}
          >
            {time}
          </span>
        )}
      </div>
    </div>
  );
}