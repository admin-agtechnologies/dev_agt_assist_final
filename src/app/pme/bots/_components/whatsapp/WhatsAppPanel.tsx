// src/app/pme/bots/_components/whatsapp/WhatsAppPanel.tsx
"use client";
import { useState, useEffect } from "react";
import {
  MessageCircle,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Power,
  Link as LinkIcon,
  X,
  RefreshCw,
} from "lucide-react";
import { Spinner } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

import { useWhatsAppConnection } from "./hooks/useWhatsAppConnection";
import { QRCodeDisplay } from "./QRCodeDisplay";
import { ConnectionStatus } from "./ConnectionStatus";

interface WhatsAppPanelProps {
  /** UUID du bot WhatsApp */
  botId: string;
  /** Le bot est-il publié (statut === "actif") ? */
  isBotPublished: boolean;
  /** Callback optionnel quand l'état de connexion devient WORKING ou STOPPED */
  onConnectionChange?: (connected: boolean) => void;
}

/**
 * Panneau de connexion WhatsApp d'un bot via WAHA.
 *
 * États rendus :
 *  - STOPPED / FAILED   : Bouton "Connecter" (ou "Réessayer")
 *  - STARTING           : Spinner + message
 *  - SCAN_QR_CODE       : QR code + instructions + bouton Annuler
 *  - WORKING            : Infos connexion + bouton Déconnecter
 *
 * Garde-fou : la connexion est désactivée si `isBotPublished === false`.
 */
export function WhatsAppPanel({
  botId,
  isBotPublished,
  onConnectionChange,
}: WhatsAppPanelProps) {
  const { dictionary: d } = useLanguage();
  const t = d.bots.whatsapp;
  const toast = useToast();

  const {
    status,
    qrBase64,
    phoneNumber,
    connectedAt,
    error,
    isLoading,
    connect,
    disconnect,
    cancel,
  } = useWhatsAppConnection(botId);

  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  // Notifier le parent sur transitions WORKING ↔ non-WORKING
  useEffect(() => {
    if (!onConnectionChange) return;
    onConnectionChange(status === "WORKING");
  }, [status, onConnectionChange]);

  const handleConnect = async (): Promise<void> => {
    if (!isBotPublished) {
      toast.error(t.errorBotNotPublished);
      return;
    }
    await connect();
  };

  const handleConfirmDisconnect = async (): Promise<void> => {
    setShowDisconnectConfirm(false);
    await disconnect();
    toast.success(t.disconnectSuccess);
  };

  const isWorking = status === "WORKING";
  const canConnect =
    isBotPublished && (status === "STOPPED" || status === "FAILED");

  return (
    <div className="bg-[var(--bg)] border border-[var(--border)] rounded-3xl p-6 space-y-5">
      {/* ─── En-tête ─────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-5 h-5 text-[#25D366]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[var(--text)]">
              {t.panelTitle}
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {t.panelSubtitle}
            </p>
          </div>
        </div>

        {isWorking && (
          <span className="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold rounded-full uppercase tracking-widest">
            {t.statusWorking}
          </span>
        )}
      </div>

      {/* ─── Avertissement bot non publié (sauf si déjà connecté) ─── */}
      {!isBotPublished && !isWorking && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
            <strong className="font-semibold block mb-1">
              {t.notPublishedTitle}
            </strong>
            <p>{t.notPublishedMessage}</p>
          </div>
        </div>
      )}

      {/* ─── Erreur backend ────────────────────────────────────── */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 dark:text-red-300 leading-relaxed">
            {error}
          </p>
        </div>
      )}

      {/* ═══════════════════ ÉTATS ═══════════════════ */}

      {/* STOPPED ou FAILED → Bouton de connexion */}
      {(status === "STOPPED" || status === "FAILED") && !isLoading && (
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            {t.descriptionStopped}
          </p>

          <button
            onClick={handleConnect}
            disabled={!canConnect}
            className={cn(
              "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all",
              canConnect
                ? "bg-[#25D366] hover:bg-[#1FBA5A] text-white shadow-sm"
                : "bg-[var(--bg-soft)] text-[var(--text-muted)] cursor-not-allowed",
            )}
          >
            {status === "FAILED" ? (
              <RefreshCw className="w-4 h-4" />
            ) : (
              <LinkIcon className="w-4 h-4" />
            )}
            <span>{status === "FAILED" ? t.retryButton : t.connectButton}</span>
          </button>

          <p className="text-xs text-[var(--text-muted)] bg-[var(--bg-soft)] border border-[var(--border)] rounded-xl p-3 leading-relaxed">
            <strong className="text-[var(--text)]">{t.infoLabel}</strong>{" "}
            {t.singleSessionInfo}
          </p>
        </div>
      )}

      {/* STARTING → Spinner */}
      {status === "STARTING" && (
        <div className="flex flex-col items-center justify-center py-10 gap-4">
          <Loader2 className="w-10 h-10 text-[#25D366] animate-spin" />
          <p className="text-sm text-[var(--text-muted)] text-center">
            {t.startingMessage}
          </p>
        </div>
      )}

      {/* SCAN_QR_CODE → QR + Annuler */}
      {status === "SCAN_QR_CODE" && qrBase64 && (
        <div className="space-y-5">
          <QRCodeDisplay qrBase64={qrBase64} />
          <div className="flex justify-center">
            <button
              onClick={() => void cancel()}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border)] text-sm text-[var(--text)] hover:bg-[var(--bg-soft)] transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              <span>{d.common.cancel}</span>
            </button>
          </div>
        </div>
      )}

      {/* SCAN_QR_CODE sans QR (juste avant la première réponse de polling) */}
      {status === "SCAN_QR_CODE" && !qrBase64 && (
        <div className="flex flex-col items-center justify-center py-10 gap-4">
          <Spinner />
          <p className="text-sm text-[var(--text-muted)]">{t.qrGenerating}</p>
        </div>
      )}

      {/* WORKING → Infos + Déconnecter */}
      {status === "WORKING" && (
        <div className="space-y-5">
          <ConnectionStatus
            phoneNumber={phoneNumber}
            connectedAt={connectedAt}
          />

          {!showDisconnectConfirm ? (
            <button
              onClick={() => setShowDisconnectConfirm(true)}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
            >
              <Power className="w-4 h-4" />
              <span>{t.disconnectButton}</span>
            </button>
          ) : (
            <div className="bg-[var(--bg-soft)] border border-[var(--border)] rounded-xl p-4 space-y-3">
              <p className="text-sm text-[var(--text)] font-medium">
                {t.disconnectConfirmTitle}
              </p>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                {t.disconnectConfirmBody}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => void handleConfirmDisconnect()}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium disabled:opacity-50 transition-colors inline-flex items-center gap-2"
                >
                  {isLoading && <Spinner />}
                  <span>{t.disconnectConfirmButton}</span>
                </button>
                <button
                  onClick={() => setShowDisconnectConfirm(false)}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm text-[var(--text)] hover:bg-[var(--bg)] transition-colors disabled:opacity-50"
                >
                  {d.common.cancel}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
// END OF FILE: src/app/pme/bots/_components/whatsapp/WhatsAppPanel.tsx
