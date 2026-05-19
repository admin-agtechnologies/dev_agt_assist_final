// src/app/(dashboard)/knowledge/_components/tabs/CommunicationKbTab.tsx
"use client";

import { Megaphone, Mail, Users, Clock } from "lucide-react";
import { useSector } from "@/hooks/useSector";

export function CommunicationKbTab() {
  const { theme } = useSector();
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
        <div className="h-20 flex items-center px-6 gap-4"
          style={{ background: `linear-gradient(135deg, ${theme.primary}15, ${theme.primary}35)` }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: `${theme.primary}25` }}>
            <Megaphone className="w-6 h-6" style={{ color: theme.primary }} />
          </div>
          <div>
            <p className="font-bold text-[var(--text)]">Communication Établissement</p>
            <p className="text-xs text-[var(--text-muted)]">Gérez vos modèles d'emails et annonces</p>
          </div>
          <span className="ml-auto text-[10px] font-semibold px-2.5 py-1 rounded-full border"
            style={{ borderColor: theme.primary, color: theme.primary, backgroundColor: `${theme.primary}10` }}>
            Prochaine session
          </span>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Mail,  title: "Modèles d'emails", desc: "Créez des templates pour vos communications : rappels, confirmations, annonces." },
            { icon: Users, title: "Ciblage clients",  desc: "Envoyez à tous vos contacts ou filtrez par segment (actifs, prospects, etc.)." },
            { icon: Clock, title: "Envoi planifié",   desc: "Programmez vos communications à l'avance. Le bot répond aux questions sur les annonces." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
              <Icon className="w-5 h-5 mb-2 text-[var(--text-muted)]" />
              <p className="text-sm font-semibold text-[var(--text)] mb-1">{title}</p>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
        <div className="px-5 pb-5">
          <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-3">
            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
              ⚠️ Règle absolue — Email uniquement, jamais WhatsApp proactif.
              Le backend <code className="font-mono">ModeleCommunication</code> + <code className="font-mono">Annonce</code> sera implémenté à la prochaine session.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}