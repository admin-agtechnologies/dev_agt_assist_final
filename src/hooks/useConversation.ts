// src/hooks/useConversation.ts
"use client";
import { useState, useEffect, useRef } from "react";
import type { Conversation } from "@/types/api";
import { conversationsRepository } from "@/repositories/conversations.repository";

interface UseConversationReturn {
  conversation: Conversation | null;
  isLoading: boolean;
  error: string | null;
}

export function useConversation(conversationId: string | null): UseConversationReturn {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!conversationId) {
      setConversation(null);
      return;
    }

    const fetch = () => {
      conversationsRepository
        .getById(conversationId)
        .then((data) => { setConversation(data); setError(null); })
        .catch(() => setError("Erreur de chargement"))
        .finally(() => setIsLoading(false));
    };

    setIsLoading(true);
    fetch();
    intervalRef.current = setInterval(fetch, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [conversationId]);

  return { conversation, isLoading, error };
}