// src/app/(dashboard)/contacts/page.tsx
"use client";
import { useState, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSector } from "@/hooks/useSector";
import { Users } from "lucide-react";
import type { Contact } from "@/types/api/crm.types";
import { ContactList }  from "./_components/ContactList";
import { ClientFiche }  from "./_components/fiche/ClientFiche";

export default function ContactsPage() {
  const { locale }     = useLanguage();
  const { theme }      = useSector();
  const [selected, setSelected] = useState<Contact | null>(null);

  const handleSelect = useCallback((c: Contact) => setSelected(c), []);
  const handleClose  = useCallback(() => setSelected(null), []);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* ── Colonne gauche — liste ─────────────────────────────────── */}
      <div className={`
        flex flex-col border-r border-[var(--border)] bg-[var(--bg-sidebar)]
        transition-all duration-300 shrink-0
        ${selected ? "hidden lg:flex lg:w-[380px]" : "w-full lg:w-[380px] flex"}
      `}>
        {/* Header liste */}
        <div className="px-5 pt-5 pb-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                 style={{ background: `${theme.primary}15` }}>
              <Users className="w-4 h-4" style={{ color: theme.primary }} />
            </div>
            <div>
              <h1 className="text-base font-bold text-[var(--text)]">
                {locale === "fr" ? "CRM Clients" : "Client CRM"}
              </h1>
              <p className="text-[11px] text-[var(--text-muted)]">
                {locale === "fr" ? "Fiches · Conversations · Analyses" : "Profiles · Conversations · Analytics"}
              </p>
            </div>
          </div>
        </div>

        <ContactList
          locale={locale as "fr" | "en"}
          theme={theme}
          selectedId={selected?.id ?? null}
          onSelectContact={handleSelect}
        />
      </div>

      {/* ── Colonne droite — fiche ─────────────────────────────────── */}
      <div className={`
        flex-1 overflow-hidden bg-[var(--bg)]
        ${selected ? "flex flex-col" : "hidden lg:flex lg:flex-col"}
      `}>
        {selected ? (
          <ClientFiche
            contactId={selected.id}
            locale={locale as "fr" | "en"}
            theme={theme}
            onClose={handleClose}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-8 gap-4">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
                 style={{ background: `${theme.primary}10` }}>
              <Users className="w-9 h-9" style={{ color: theme.primary, opacity: 0.5 }} />
            </div>
            <div>
              <p className="text-base font-semibold text-[var(--text)]">
                {locale === "fr" ? "Sélectionnez un client" : "Select a client"}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {locale === "fr"
                  ? "Cliquez sur un contact pour voir sa fiche complète"
                  : "Click a contact to see the full profile"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}