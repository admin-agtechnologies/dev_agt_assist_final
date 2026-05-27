// src/app/(dashboard)/knowledge/_components/tabs/CommunicationKbTab.tsx
"use client";

import { Megaphone, Mail, Users, Clock, Sparkles } from "lucide-react";
import { useSector }   from "@/hooks/useSector";
import { useLanguage } from "@/contexts/LanguageContext";

export function CommunicationKbTab() {
  const { theme }  = useSector();
  const { locale } = useLanguage();

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
            <p className="font-bold text-[var(--text)]">
              {locale === "fr" ? "Communication Établissement" : "Establishment Communication"}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              {locale === "fr"
                ? "Gérez vos modèles d'emails et annonces"
                : "Manage your email templates and announcements"}
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
            {
              icon: Mail,
              title: locale === "fr" ? "Modèles d'emails" : "Email templates",
              desc:  locale === "fr"
                ? "Créez des templates pour vos communications : rappels, confirmations, annonces."
                : "Create templates for your communications: reminders, confirmations, announcements.",
            },
            {
              icon: Users,
              title: locale === "fr" ? "Ciblage clients" : "Client targeting",
              desc:  locale === "fr"
                ? "Envoyez à tous vos contacts ou filtrez par segment (actifs, prospects, etc.)."
                : "Send to all your contacts or filter by segment (active, prospects, etc.).",
            },
            {
              icon: Clock,
              title: locale === "fr" ? "Envoi planifié" : "Scheduled sending",
              desc:  locale === "fr"
                ? "Programmez vos communications à l'avance. Le bot répond aux questions sur les annonces."
                : "Schedule your communications in advance. The bot answers questions about announcements.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 space-y-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${theme.primary}15` }}>
                <Icon className="w-4 h-4" style={{ color: theme.primary }} />
              </div>
              <p className="text-sm font-semibold text-[var(--text)]">{title}</p>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
        {/* Note backend */}
        <div className="px-5 pb-5">
          <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-3 flex items-start gap-2">
            <span className="text-amber-500 text-sm mt-0.5">⚠</span>
            <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
              {locale === "fr"
                ? <>Règle absolue — Email uniquement, jamais WhatsApp proactif. Le backend <code className="font-mono">ModeleCommunication</code> + <code className="font-mono">Annonce</code> sera implémenté à la prochaine mise à jour.</>
                : <>Absolute rule — Email only, never proactive WhatsApp. The <code className="font-mono">ModeleCommunication</code> + <code className="font-mono">Annonce</code> backend will be implemented in the next update.</>}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}