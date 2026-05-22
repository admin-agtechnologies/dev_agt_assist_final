"use client";
// src/app/(dashboard)/bots/_components/tabs/BotClientsTab.tsx
// Tab Clients — contacts ayant interagi avec ce bot (filtre via AIConversation.bot).

import { useState, useEffect, useCallback } from "react";
import { Users, User }                       from "lucide-react";
import { Loader2 }                           from "lucide-react";
import { useLanguage }                       from "@/contexts/LanguageContext";
import { ResultsEmptyState }                 from "@/app/(dashboard)/results/_components/ResultsEmptyState";
import { contactsResultRepository }          from "@/repositories/results.repository";
import { formatDateTime }                    from "@/lib/utils";
import { useSector }                         from "@/hooks/useSector";
import type { Contact }                      from "@/types/api/crm.types";

interface Props {
  botId: string;
}

export function BotClientsTab({ botId }: Props) {
  const { locale }   = useLanguage();
  const { theme }    = useSector();
  const [contacts,   setContacts]  = useState<Contact[]>([]);
  const [total,      setTotal]     = useState(0);
  const [loading,    setLoading]   = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await contactsResultRepository.getList({ page: 1, page_size: 20, bot_id: botId });
      setContacts(res.results);
      setTotal(res.count);
    } catch {
      // silencieux
    } finally {
      setLoading(false);
    }
  }, [botId]);

  useEffect(() => { fetch(); }, [fetch]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-2xl border border-[var(--border)] animate-pulse"
            style={{ background: "var(--bg-card)", animationDelay: `${i * 80}ms` }} />
        ))}
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <ResultsEmptyState
        icon={Users}
        message={locale === "fr" ? "Aucun client pour ce bot." : "No clients for this bot."}
        hint={locale === "fr"
          ? "Les clients qui ont interagi avec ce bot apparaîtront ici."
          : "Clients who interacted with this bot will appear here."}
      />
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Compteur */}
      <div className="flex items-center gap-2">
        <span
          className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold"
          style={{
            background: `color-mix(in srgb, ${theme.primary} 10%, transparent)`,
            color: theme.primary,
          }}
        >
          {total}
        </span>
        <span className="text-xs text-[var(--text-muted)]">
          {locale === "fr" ? "client(s)" : "client(s)"}
        </span>
      </div>

      {/* Liste */}
      <div className="space-y-2">
        {contacts.map((contact, idx) => (
          <div
            key={contact.id}
            className="flex items-center gap-3 p-3 rounded-2xl border border-[var(--border)]
              bg-[var(--bg-card)] hover:shadow-sm hover:-translate-y-0.5
              transition-all duration-200 animate-slide-up"
            style={{ animationDelay: `${Math.min(idx * 40, 300)}ms` }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `color-mix(in srgb, ${theme.primary} 12%, transparent)` }}
            >
              <User className="w-4 h-4" style={{ color: theme.primary }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[var(--text)] truncate">
                {contact.nom}
              </p>
              <p className="text-[11px] text-[var(--text-muted)]">
                {contact.phone}
              </p>
            </div>
            {contact.derniere_interaction && (
              <p className="text-[10px] text-[var(--text-muted)] flex-shrink-0">
                {formatDateTime(contact.derniere_interaction)}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}