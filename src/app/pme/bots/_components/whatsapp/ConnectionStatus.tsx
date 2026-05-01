// src/app/pme/bots/_components/whatsapp/ConnectionStatus.tsx
"use client";
import { CheckCircle2, Phone, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ConnectionStatusProps {
  phoneNumber: string;
  connectedAt: string | null;
}

/**
 * Affiche les infos de la session WhatsApp connectée :
 * numéro formaté, date de connexion, badge "Connecté".
 */
export function ConnectionStatus({
  phoneNumber,
  connectedAt,
}: ConnectionStatusProps) {
  const { dictionary: d, locale } = useLanguage();
  const t = d.bots.whatsapp;

  const formatPhone = (raw: string): string => {
    if (!raw) return "—";
    // 237699000001 → +237 699 000 001
    if (raw.length < 9) return `+${raw}`;
    return `+${raw.slice(0, 3)} ${raw.slice(3, 6)} ${raw.slice(6, 9)} ${raw.slice(9)}`.trim();
  };

  const formatDate = (iso: string | null): string => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString(locale === "fr" ? "fr-FR" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-4">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
        <CheckCircle2 className="w-4 h-4" />
        <span>{t.statusWorking}</span>
      </div>

      {/* Carte info */}
      <div className="bg-[var(--bg-soft)] border border-[var(--border)] rounded-2xl p-5 space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-semibold">
            <Phone className="w-3 h-3" />
            <span>{t.phoneLabel}</span>
          </div>
          <p className="text-base font-mono font-semibold text-[var(--text)]">
            {formatPhone(phoneNumber)}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1.5 text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-semibold">
            <Clock className="w-3 h-3" />
            <span>{t.connectedAtLabel}</span>
          </div>
          <p className="text-sm text-[var(--text)]">
            {formatDate(connectedAt)}
          </p>
        </div>
      </div>

      {/* Note */}
      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
        {t.workingNote}
      </p>
    </div>
  );
}
// END OF FILE: src/app/pme/bots/_components/whatsapp/ConnectionStatus.tsx
