// src/app/pme/bots/_components/whatsapp/QRCodeDisplay.tsx
"use client";
import { Smartphone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface QRCodeDisplayProps {
  qrBase64: string;
}

/**
 * Affiche le QR code WhatsApp (PNG base64) avec instructions de scan.
 * Le QR est rafraîchi automatiquement par le hook parent toutes les 2s
 * (pour éviter les expirations à ~20s côté WAHA).
 */
export function QRCodeDisplay({ qrBase64 }: QRCodeDisplayProps) {
  const { dictionary: d } = useLanguage();
  const t = d.bots.whatsapp;

  return (
    <div className="flex flex-col items-center gap-5">
      {/* QR */}
      <div className="p-3 bg-white rounded-2xl border border-[var(--border)] shadow-sm">
        <img
          src={`data:image/png;base64,${qrBase64}`}
          alt={t.qrAlt}
          width={224}
          height={224}
          className="block w-56 h-56"
        />
      </div>

      {/* Instructions */}
      <div className="w-full max-w-md bg-[var(--bg-soft)] border border-[var(--border)] rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Smartphone className="w-4 h-4 text-[#25D366]" />
          <h4 className="font-semibold text-sm text-[var(--text)]">
            {t.qrInstructionsTitle}
          </h4>
        </div>
        <ol className="space-y-1.5 text-xs text-[var(--text-muted)] list-decimal list-inside leading-relaxed">
          <li>{t.qrStep1}</li>
          <li>{t.qrStep2}</li>
          <li>{t.qrStep3}</li>
        </ol>
        <p className="mt-3 pt-3 border-t border-[var(--border)] text-[11px] text-[var(--text-muted)] italic">
          {t.qrExpireHint}
        </p>
      </div>
    </div>
  );
}
// END OF FILE: src/app/pme/bots/_components/whatsapp/QRCodeDisplay.tsx
