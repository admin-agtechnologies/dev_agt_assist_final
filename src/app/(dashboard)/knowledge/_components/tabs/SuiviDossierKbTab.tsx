// src/app/(dashboard)/knowledge/_components/tabs/SuiviDossierKbTab.tsx
"use client";

import { FolderOpen, Hash, Bell, ShieldCheck } from "lucide-react";
import { useSector } from "@/hooks/useSector";

export function SuiviDossierKbTab() {
  const { theme } = useSector();
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
            <p className="font-bold text-[var(--text)]">Suivi Dossier</p>
            <p className="text-xs text-[var(--text-muted)]">Suivi des demandes bancaires par le bot</p>
          </div>
          <span className="ml-auto text-[10px] font-semibold px-2.5 py-1 rounded-full border"
            style={{ borderColor: theme.primary, color: theme.primary, backgroundColor: `${theme.primary}10` }}>
            Prochaine session
          </span>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Hash,        title: "Numéro dossier",    desc: "Format BNK-YYYYMMDD-XXXX. Le bot permet au client de retrouver son dossier par numéro." },
            { icon: ShieldCheck, title: "Vérification sécurité", desc: "Le bot valide que le numéro de téléphone du demandeur correspond au dossier avant toute info." },
            { icon: Bell,        title: "Notifications",     desc: "Email automatique à chaque changement de statut : ouverture compte, crédit, renouvellement carte." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
              <Icon className="w-5 h-5 mb-2 text-[var(--text-muted)]" />
              <p className="text-sm font-semibold text-[var(--text)] mb-1">{title}</p>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
        <div className="px-5 pb-5">
          <div className="rounded-xl bg-[var(--bg)] border border-[var(--border)] px-4 py-3">
            <p className="text-xs text-[var(--text-muted)]">
              Types de dossiers supportés :
              <strong className="text-[var(--text)]"> ouverture_compte · demande_credit · renouvellement_carte · changement_conseiller · reclamation · autre</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}