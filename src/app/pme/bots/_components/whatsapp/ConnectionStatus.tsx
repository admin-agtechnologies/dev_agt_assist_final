// src/app/pme/bots/_components/whatsapp/ConnectionStatus.tsx
"use client";
import { CheckCircle2, Phone, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ConnectionStatusProps {
  phoneNumber: string;
  connectedAt: string | null;
}

/**
 * Affiche les infos d'une session WhatsApp connectée.
 * Version compacte pour la colonne droite.
 */
export function ConnectionStatus({
  phoneNumber,
  connectedAt,
}: ConnectionStatusProps) {
  const { dictionary: d, locale } = useLanguage();
  const t = d.bots.whatsapp;

  const formatPhone = (raw: string): string => {
    if (!raw) return "—";
    if (raw.length < 9) return `+${raw}`;
    return `+${raw.slice(0, 3)} ${raw.slice(3, 6)} ${raw.slice(6, 9)} ${raw.slice(9)}`.trim();
  };

  const formatDate = (iso: string | null): string => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString(locale === "fr" ? "fr-FR" : "en-US", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-2.5">
      {/* Badge */}
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-[11px] font-medium">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>{t.statusWorking}</span>
      </div>

      {/* Carte info compacte */}
      <div className="bg-[var(--bg-soft)] border border-[var(--border)] rounded-xl p-3 space-y-2.5">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5 text-[9px] text-[var(--text-muted)] uppercase tracking-widest font-semibold">
            <Phone className="w-2.5 h-2.5" />
            <span>{t.phoneLabel}</span>
          </div>
          <p className="text-sm font-mono font-semibold text-[var(--text)]">
            {formatPhone(phoneNumber)}
          </p>
        </div>

        <div className="pt-2 border-t border-[var(--border)]">
          <div className="flex items-center gap-1.5 mb-0.5 text-[9px] text-[var(--text-muted)] uppercase tracking-widest font-semibold">
            <Clock className="w-2.5 h-2.5" />
            <span>{t.connectedAtLabel}</span>
          </div>
          <p className="text-xs text-[var(--text)]">
            {formatDate(connectedAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
// END OF FILE: src/app/pme/bots/_components/whatsapp/ConnectionStatus.tsx
