// src/components/contacts/ContactCard.tsx
"use client";
import { User, Phone, Mail } from "lucide-react";
import type { Contact, ContactStatut } from "@/types/api/crm.types";
import type { Locale } from "@/contexts/LanguageContext";

const STATUT_STYLES: Record<ContactStatut, string> = {
  prospect: "bg-yellow-100 text-yellow-800",
  contact:  "bg-blue-100 text-blue-800",
  client:   "bg-green-100 text-green-800",
  inactif:  "bg-gray-100 text-gray-500",
};

const STATUT_LABELS: Record<ContactStatut, { fr: string; en: string }> = {
  prospect: { fr: "Prospect",  en: "Prospect" },
  contact:  { fr: "Contact",   en: "Contact" },
  client:   { fr: "Client",    en: "Client" },
  inactif:  { fr: "Inactif",   en: "Inactive" },
};

interface Props {
  contact: Contact;
  locale: Locale;
  onClick?: () => void;
}

export function ContactCard({ contact, locale, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left card p-4 hover:shadow-md transition-all flex items-start gap-3"
    >
      <div className="w-9 h-9 rounded-full bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
        <User size={16} className="text-[var(--primary)]" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-sm font-semibold text-[var(--text)] truncate">
            {contact.nom}
          </p>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUT_STYLES[contact.statut]}`}>
            {STATUT_LABELS[contact.statut][locale]}
          </span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <Phone size={11} />
            {contact.phone}
          </span>
          {contact.email && (
            <span className="flex items-center gap-1 text-xs text-[var(--text-muted)] truncate">
              <Mail size={11} />
              {contact.email}
            </span>
          )}
        </div>

        {(contact.crm_signals?.length ?? 0) > 0 && (
          <p className="text-xs text-[var(--primary)] mt-1.5 font-medium">
            {contact.crm_signals!.length} signal{contact.crm_signals!.length > 1 ? "s" : ""}
          </p>
        )}
      </div>
    </button>
  );
}