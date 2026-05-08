// src/components/conversations/MessageBubble.tsx
"use client";
import type { MessageRole } from "@/types/api";

interface MessageBubbleProps {
  role: MessageRole;
  content: string;
  time?: string;
  roleLabel?: string;
}

export function MessageBubble({ role, content, time, roleLabel }: MessageBubbleProps) {
  const isAssistant = role === "assistant";
  const isStatus = role === "status";

  if (isStatus) {
    return (
      <div className="flex items-center justify-center py-1">
        <p className="text-xs italic text-[var(--text-muted)]">{content}</p>
      </div>
    );
  }

  return (
    <div className={[
      "flex gap-2 max-w-[85%]",
      isAssistant ? "self-start" : "self-end flex-row-reverse",
    ].join(" ")}>
      <div className={[
        "w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white mt-1",
        isAssistant ? "bg-[var(--color-primary)]" : "bg-gray-400",
      ].join(" ")}>
        {isAssistant ? "B" : "U"}
      </div>
      <div className="flex flex-col gap-1">
        {roleLabel && <span className="text-xs text-[var(--text-muted)] px-1">{roleLabel}</span>}
        <div
          className={[
            "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
            isAssistant
              ? "bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text)] rounded-tl-sm"
              : "text-white rounded-tr-sm",
          ].join(" ")}
          style={!isAssistant ? { backgroundColor: "var(--color-primary)" } : undefined}
        >
          {content}
        </div>
        {time && (
          <span className={["text-xs text-[var(--text-muted)] px-1", isAssistant ? "text-left" : "text-right"].join(" ")}>
            {time}
          </span>
        )}
      </div>
    </div>
  );
}