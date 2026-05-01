// src/app/pme/bots/_components/whatsapp/QRCodeDisplay.tsx
"use client";
import { Smartphone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface QRCodeDisplayProps {
  qrBase64: string;
}

/**
 * Affiche le QR code WhatsApp (PNG base64) avec instructions de scan.
 * Version compacte pour la colonne droite (5/12).
 */
export function QRCodeDisplay({ qrBase64 }: QRCodeDisplayProps) {
  const { dictionary: d } = useLanguage();
  const t = d.bots.whatsapp;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* QR */}
      <div className="p-2.5 bg-white rounded-2xl border border-[var(--border)] shadow-sm">
        <img
          src={`data:image/png;base64,${qrBase64}`}
          alt={t.qrAlt}
          width={192}
          height={192}
          className="block w-48 h-48"
        />
      </div>

      {/* Instructions */}
      <div className="w-full bg-[var(--bg-soft)] border border-[var(--border)] rounded-xl p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Smartphone className="w-3.5 h-3.5 text-[#25D366]" />
          <h4 className="font-semibold text-xs text-[var(--text)]">
            {t.qrInstructionsTitle}
          </h4>
        </div>
        <ol className="space-y-1 text-[11px] text-[var(--text-muted)] list-decimal list-inside leading-snug">
          <li>{t.qrStep1}</li>
          <li>{t.qrStep2}</li>
          <li>{t.qrStep3}</li>
        </ol>
        <p className="mt-2 pt-2 border-t border-[var(--border)] text-[10px] text-[var(--text-muted)] italic">
          {t.qrExpireHint}
        </p>
      </div>
    </div>
  );
}
// END OF FILE: src/app/pme/bots/_components/whatsapp/QRCodeDisplay.tsx
