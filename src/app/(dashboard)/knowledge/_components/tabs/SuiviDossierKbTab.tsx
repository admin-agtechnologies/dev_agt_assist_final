// src/app/(dashboard)/knowledge/_components/tabs/SuiviDossierKbTab.tsx
// B5 S39 — Badge "Bientôt disponible" FR/EN explicite
"use client";

import { FolderOpen, Hash, Bell, ShieldCheck, Sparkles } from "lucide-react";
import { useSector }   from "@/hooks/useSector";
import { useLanguage } from "@/contexts/LanguageContext";

export function SuiviDossierKbTab() {
  const { theme }  = useSector();
  const { locale } = useLanguage();
  const soon = locale === "fr"
    ? "Bientôt disponible — dès la prochaine mise à jour"
    : "Available soon — in the next project update";

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
        <div className="h-20 flex items-center px-6 gap-4"
          style={{ background: `linear-gradient(135deg, ${theme.primary}15, ${theme.primary}35)` }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: `${theme.primary}25` }}>
            <FolderOpen className="w-6 h-6" style={{ color: theme.primary }} />
          </div>
          <div>
            <p className="font-bold text-[var(--text)]">
              {locale === "fr" ? "Suivi Dossier" : "File Tracking"}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              {locale === "fr" ? "Suivi des demandes bancaires par le bot" : "Bot-driven banking request tracking"}
            </p>
          </div>
          <span className="ml-auto flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full border"
            style={{ borderColor: theme.primary, color: theme.primary, backgroundColor: `${theme.primary}10` }}>
            <Sparkles className="w-3 h-3" />
            {locale === "fr" ? "Bientôt disponible" : "Coming soon"}
          </span>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Hash,        title: locale === "fr" ? "Numéro dossier" : "File number",
              desc: locale === "fr"
                ? "Format BNK-YYYYMMDD-XXXX. Le bot permet au client de retrouver son dossier par numéro."
                : "Format BNK-YYYYMMDD-XXXX. The bot lets clients retrieve their file by number." },
            { icon: ShieldCheck, title: locale === "fr" ? "Vérification sécurité" : "Security check",
              desc: locale === "fr"
                ? "Le bot valide que le numéro de téléphone du demandeur correspond au dossier avant toute info."
                : "The bot verifies the requester's phone number matches the file before sharing any info." },
            { icon: Bell,        title: locale === "fr" ? "Notifications" : "Notifications",
              desc: locale === "fr"
                ? "Email automatique à chaque changement de statut : ouverture compte, crédit, renouvellement carte."
                : "Automatic email at each status change: account opening, credit, card renewal." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
              <Icon className="w-5 h-5 mb-2 text-[var(--text-muted)]" />
              <p className="text-sm font-semibold text-[var(--text)] mb-1">{title}</p>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
        <div className="px-5 pb-5 space-y-3">
          <div className="rounded-xl bg-[var(--bg)] border border-[var(--border)] px-4 py-3">
            <p className="text-xs text-[var(--text-muted)]">
              {locale === "fr" ? "Types de dossiers supportés :" : "Supported file types:"}
              {" "}<strong className="text-[var(--text)]">
                ouverture_compte · demande_credit · renouvellement_carte · changement_conseiller · reclamation · autre
              </strong>
            </p>
          </div>
          <div className="rounded-xl bg-[var(--bg)] border border-[var(--border)] px-4 py-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 flex-shrink-0" style={{ color: theme.primary }} />
            <p className="text-xs font-medium" style={{ color: theme.primary }}>{soon}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// END OF FILE: src/app/(dashboard)/knowledge/_components/tabs/SuiviDossierKbTab.tsx