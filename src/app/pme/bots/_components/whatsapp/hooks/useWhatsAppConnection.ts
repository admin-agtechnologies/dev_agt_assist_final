// src/app/pme/bots/_components/whatsapp/hooks/useWhatsAppConnection.ts
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { wahaRepository } from "@/repositories";
import { ApiError } from "@/lib/api-client";
import type { WahaSessionStatus } from "@/types/api";

const POLLING_INTERVAL_MS = 2000;
const MAX_POLLING_ATTEMPTS = 60; // 60 × 2s = 2 min max

interface WhatsAppConnectionState {
  status: WahaSessionStatus;
  qrBase64: string | null;
  phoneNumber: string;
  connectedAt: string | null;
  error: string | null;
  isLoading: boolean;
}

export interface WhatsAppConnectionApi extends WhatsAppConnectionState {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  cancel: () => Promise<void>;
  reload: () => Promise<void>;
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
    status: "STOPPED",
    qrBase64: null,
    phoneNumber: "",
    connectedAt: null,
    error: null,
    isLoading: false,
  });

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
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
        status: data.status,
        qrBase64: data.qr_base64 ?? null,
        phoneNumber: data.phone_number ?? "",
        connectedAt: data.connected_at ?? null,
        error: null,
      }));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Erreur réseau";
      setState((s) => ({ ...s, error: message }));
    }
  }, [botId]);

  const startPolling = useCallback((): void => {
    stopPolling();
    attemptsRef.current = 0;

    pollingRef.current = setInterval(async () => {
      attemptsRef.current += 1;

      if (attemptsRef.current > MAX_POLLING_ATTEMPTS) {
        stopPolling();
        setState((s) => ({
          ...s,
          status: "FAILED",
          isLoading: false,
          error: "Délai dépassé — QR code non scanné",
        }));
        return;
      }

      try {
        const data = await wahaRepository.getStatus(botId);
        setState((s) => ({
          ...s,
          status: data.status,
          qrBase64: data.qr_base64 ?? null,
          phoneNumber: data.phone_number ?? "",
          connectedAt: data.connected_at ?? null,
        }));

        if (data.status === "WORKING" || data.status === "FAILED") {
          stopPolling();
          setState((s) => ({ ...s, isLoading: false }));
        }
      } catch {
        // Erreur réseau ponctuelle : on continue à poller silencieusement
      }
    }, POLLING_INTERVAL_MS);
  }, [botId, stopPolling]);

  const connect = useCallback(async (): Promise<void> => {
    if (!botId) return;
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const data = await wahaRepository.connect(botId);
      setState((s) => ({
        ...s,
        status: data.status,
        qrBase64: null,
        phoneNumber: data.phone_number ?? "",
        connectedAt: data.connected_at ?? null,
      }));
      startPolling();
    } catch (err) {
      stopPolling();
      const message =
        err instanceof ApiError ? err.message : "Erreur de connexion";
      setState((s) => ({ ...s, isLoading: false, error: message }));
    }
  }, [botId, startPolling, stopPolling]);

  const disconnect = useCallback(async (): Promise<void> => {
    if (!botId) return;
    setState((s) => ({ ...s, isLoading: true, error: null }));
    stopPolling();
    try {
      await wahaRepository.disconnect(botId);
      setState({
        status: "STOPPED",
        qrBase64: null,
        phoneNumber: "",
        connectedAt: null,
        error: null,
        isLoading: false,
      });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Erreur de déconnexion";
      setState((s) => ({ ...s, isLoading: false, error: message }));
    }
  }, [botId, stopPolling]);

  // Annulation pendant le scan QR : on libère la session côté backend
  const cancel = useCallback(async (): Promise<void> => {
    await disconnect();
  }, [disconnect]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  return { ...state, connect, disconnect, cancel, reload };
}
// END OF FILE: src/app/pme/bots/_components/whatsapp/hooks/useWhatsAppConnection.ts
