// src/app/(dashboard)/contacts/_components/fiche/ClientFiche.tsx
"use client";
import { useEffect, useState } from "react";
import { BarChart2, MessageCircle, FileText, Brain } from "lucide-react";
import { Spinner } from "@/components/ui";
import { contactsRepository } from "@/repositories/contacts.repository";
import { useActiveFeatures } from "@/hooks/useFeatures";
import type { ContactDetail, ContactNote } from "@/types/api/crm.types";
import { FicheHeader }        from "./FicheHeader";
import { FicheKPIs }          from "./FicheKPIs";
import { FicheConversations } from "./FicheConversations";
import { FicheNotes }         from "./FicheNotes";
import { FicheAnalyse }       from "./FicheAnalyse";

type Tab = "kpis"|"conversations"|"notes"|"analyse";

const TABS: { id: Tab; fr: string; en: string; icon: React.ComponentType<{className?:string}> }[] = [
  { id:"kpis",          fr:"KPIs",          en:"KPIs",          icon:BarChart2 },
  { id:"conversations", fr:"Conversations", en:"Conversations", icon:MessageCircle },
  { id:"notes",         fr:"Notes",         en:"Notes",         icon:FileText },
  { id:"analyse",       fr:"Analyse",       en:"Analysis",      icon:Brain },
];

interface Props {
  contactId: string; locale: "fr"|"en";
  theme: { primary: string }; onClose?: () => void;
}

export function ClientFiche({ contactId, locale, theme, onClose }: Props) {
  const [contact, setContact] = useState<ContactDetail|null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState<Tab>("kpis");
  const { features }          = useActiveFeatures();

  useEffect(() => {
    setLoading(true); setTab("kpis");
    contactsRepository.getById(contactId)
      .then(setContact).catch(() => setContact(null))
      .finally(() => setLoading(false));
  }, [contactId]);

  if (loading) return <div className="flex items-center justify-center h-full"><Spinner /></div>;
  if (!contact) return (
    <div className="flex items-center justify-center h-full">
      <p className="text-sm text-[var(--text-muted)]">{locale==="fr"?"Introuvable":"Not found"}</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[var(--bg-card)]">
      <div className="overflow-y-auto flex-1">
        {/* Header avec bannière */}
        <FicheHeader contact={contact} locale={locale} theme={theme}
          onUpdate={setContact} onClose={onClose} />

        {/* Tabs */}
        <div className="flex border-b border-[var(--border)] px-2 bg-[var(--bg-card)] sticky top-0 z-10">
          {TABS.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-3 text-xs font-semibold border-b-2 transition-all ${
                  active ? "border-current" : "border-transparent text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
                style={active ? { color: theme.primary, borderColor: theme.primary } : {}}>
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{locale==="fr"?t.fr:t.en}</span>
              </button>
            );
          })}
        </div>

        {/* Contenu tab */}
        <div className="bg-[var(--bg)]">
          {tab==="kpis"          && <FicheKPIs contactId={contact.id} activeFeatures={features} locale={locale} theme={theme} />}
          {tab==="conversations" && <FicheConversations contactId={contact.id} locale={locale} theme={theme} />}
          {tab==="notes"         && <FicheNotes contactId={contact.id} notes={Array.isArray(contact.notes)?contact.notes:[]} locale={locale} onUpdate={n=>setContact({...contact,notes:n})} theme={theme} />}
          {tab==="analyse"       && <FicheAnalyse contactId={contact.id} locale={locale} theme={theme} />}
        </div>
      </div>
    </div>
  );
}