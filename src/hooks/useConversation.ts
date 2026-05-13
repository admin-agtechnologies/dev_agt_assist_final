// src/hooks/useConversation.ts
"use client";
import { useState, useEffect, useRef } from "react";
import type { AIConversation } from "@/types/api/agent.types";
import { agentRepository } from "@/repositories/agent.repository";

interface UseConversationReturn {
  conversation: AIConversation | null;
  isLoading: boolean;
  error: string | null;
}

export function useConversation(conversationId: string | null): UseConversationReturn {
  const [conversation, setConversation] = useState<AIConversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!conversationId) {
      setConversation(null);
      return;
    }

    const fetch = () => {
      agentRepository
        .getConversation(conversationId)
        .then((data) => {
          setConversation(data);
          setError(null);
          // Stopper le polling si conversation terminée ou transférée
          if (data.statut === "terminee" || data.statut === "transferee") {
            if (intervalRef.current) clearInterval(intervalRef.current);
          }
        })
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