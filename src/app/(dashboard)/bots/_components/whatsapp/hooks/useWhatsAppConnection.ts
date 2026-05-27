"use client";
// src/app/(dashboard)/bots/_components/whatsapp/hooks/useWhatsAppConnection.ts

import { useState, useCallback, useEffect, useRef } from "react";
import { wahaRepository } from "@/repositories";
import { ApiError }       from "@/lib/api-client";
import type { WahaStatus } from "@/types/api/chatbot.types";

const POLLING_INTERVAL_MS  = 2000;
const MAX_POLLING_ATTEMPTS = 60; // 60 × 2s = 2 min max

interface WhatsAppConnectionState {
  status:      WahaStatus;
  qrBase64:    string | null;
  phoneNumber: string;
  connectedAt: string | null;
  error:       string | null;
  isLoading:   boolean;
}

export interface WhatsAppConnectionApi extends WhatsAppConnectionState {
  connect:    () => Promise<void>;
  disconnect: () => Promise<void>;
  cancel:     () => Promise<void>;
  reload:     () => Promise<void>;
}

/**
 * Gère le cycle de vie de la connexion WhatsApp d'un bot via WAHA.
 *
 * États : STOPPED → STARTING → SCAN_QR_CODE → WORKING (ou FAILED)
 *
 * Au montage : lit le statut courant.
 * connect()  : POST /connect/ + démarre polling 2s.
 * Polling    : rafraîchit qrBase64 + status. S'arrête sur WORKING/FAILED ou timeout 2 min.
 * disconnect(): POST /disconnect/.
 */
export function useWhatsAppConnection(botId: string): WhatsAppConnectionApi {
  const [state, setState] = useState<WhatsAppConnectionState>({
    status:      "STOPPED",
    qrBase64:    null,
    phoneNumber: "",
    connectedAt: null,
    error:       null,
    isLoading:   false,
  });

  const pollingRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const attemptsRef = useRef<number>(0);

  const stopPolling = useCallback((): void => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    attemptsRef.current = 0;
  }, []);

  const reload = useCallback(async (): Promise<void> => {
    if (!botId) return;
    try {
      const data = await wahaRepository.getStatus(botId);
      setState((s) => ({
        ...s,
        status:      data.status,
        qrBase64:    (data as unknown as { qr_base64?: string | null }).qr_base64
                     ?? (data as unknown as { qr_code?: string | null }).qr_code
                     ?? null,
        phoneNumber: data.phone_number ?? "",
        connectedAt: data.connected_at ?? null,
        error:       null,
      }));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Erreur de chargement";
      setState((s) => ({ ...s, error: message }));
    }
  }, [botId]);

  const startPolling = useCallback((): void => {
    stopPolling();
    pollingRef.current = setInterval(async () => {
      attemptsRef.current += 1;
      if (attemptsRef.current > MAX_POLLING_ATTEMPTS) {
        stopPolling();
        setState((s) => ({
          ...s,
          isLoading: false,
          error: "Délai d'attente dépassé. Veuillez réessayer.",
        }));
        return;
      }
      try {
        const data = await wahaRepository.getStatus(botId);
        const status: WahaStatus = data.status;
        setState((s) => ({
          ...s,
          status,
          qrBase64: (data as unknown as { qr_base64?: string | null }).qr_base64
                    ?? (data as unknown as { qr_code?: string | null }).qr_code
                    ?? null,
          phoneNumber: data.phone_number ?? "",
          connectedAt: data.connected_at ?? null,
        }));
        if (status === "WORKING" || status === "FAILED") {
          stopPolling();
          setState((s) => ({ ...s, isLoading: false }));
        }
      } catch {
        // polling silencieux — on continue
      }
    }, POLLING_INTERVAL_MS);
  }, [botId, stopPolling]);

  const connect = useCallback(async (): Promise<void> => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      await wahaRepository.connect(botId);
      startPolling();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Erreur de connexion";
      setState((s) => ({ ...s, isLoading: false, error: message }));
    }
  }, [botId, startPolling]);

  const disconnect = useCallback(async (): Promise<void> => {
    stopPolling();
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      await wahaRepository.disconnect(botId);
      setState((s) => ({
        ...s,
        status:      "STOPPED",
        qrBase64:    null,
        phoneNumber: "",
        connectedAt: null,
        isLoading:   false,
      }));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Erreur de déconnexion";
      setState((s) => ({ ...s, isLoading: false, error: message }));
    }
  }, [botId, stopPolling]);

  const cancel = useCallback(async (): Promise<void> => {
    await disconnect();
  }, [disconnect]);

  useEffect(() => { void reload(); }, [reload]);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  return { ...state, connect, disconnect, cancel, reload };
}