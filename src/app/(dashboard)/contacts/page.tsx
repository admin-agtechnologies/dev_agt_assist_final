// src/app/(dashboard)/contacts/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useActiveFeatures } from "@/hooks/useFeatures";
import { getFeatureLabel } from "@/lib/sector-labels";
import { ContactCard } from "@/components/contacts/ContactCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Spinner } from "@/components/ui";
import type { Contact, ContactStatut, ContactFilters } from "@/types/api/crm.types";
import { api } from "@/lib/api-client";
import type { PaginatedResponse } from "@/types/api";

const STATUTS: { value: ContactStatut | ""; label: { fr: string; en: string } }[] = [
  { value: "",         label: { fr: "Tous",      en: "All" } },
  { value: "prospect", label: { fr: "Prospects", en: "Prospects" } },
  { value: "contact",  label: { fr: "Contacts",  en: "Contacts" } },
  { value: "client",   label: { fr: "Clients",   en: "Clients" } },
  { value: "inactif",  label: { fr: "Inactifs",  en: "Inactive" } },
];

export default function ContactsPage() {
  const { locale } = useLanguage();
  const { features } = useActiveFeatures();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [statut, setStatut] = useState<ContactStatut | "">("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const activeFeature = features.find(
    (f) => ["conversion_prospects", "orientation_patient"].includes(f.slug) && f.is_active,
  );
  const pageTitle = activeFeature
    ? getFeatureLabel(activeFeature.slug, locale).pageTitle
    : locale === "fr" ? "Contacts" : "Contacts";

  const load = useCallback(() => {
    setLoading(true);
    const filters: ContactFilters = {};
    if (statut) filters.statut = statut;
    if (search) filters.search = search;

    api
      .get("/api/v1/contacts/", { params: filters })
      .then((data: unknown) => {
        const res = data as PaginatedResponse<Contact>;
        setContacts(Array.isArray(data) ? (data as Contact[]) : res.results ?? []);
      })
      .catch(() => setContacts([]))
      .finally(() => setLoading(false));
  }, [statut, search]);

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <PageHeader title={pageTitle} />

      <input
        type="text"
        placeholder={locale === "fr" ? "Rechercher un contact…" : "Search a contact…"}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input-base w-full"
      />

      <div className="flex gap-2 flex-wrap">
        {STATUTS.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => setStatut(s.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              statut === s.value
                ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                : "bg-transparent text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--primary)]"
            }`}
          >
            {s.label[locale]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32"><Spinner /></div>
      ) : contacts.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-[var(--text-muted)] text-sm">
            {locale === "fr" ? "Aucun contact trouvé" : "No contacts found"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {contacts.map((c) => (
            <ContactCard key={c.id} contact={c} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}