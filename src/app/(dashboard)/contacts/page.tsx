// src/app/(dashboard)/contacts/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/hooks/useLanguage";
import { useSector } from "@/hooks/useSector";
import { clientsRepository } from "@/repositories/contacts.repository";
import { PageHeader } from "@/components/ui/PageHeader";
import { FilterBar } from "@/components/ui/FilterBar";
import { ContactCard } from "@/components/contacts/ContactCard";
import { contacts as contFr } from "@/dictionaries/fr/contacts.fr";
import { contacts as contEn } from "@/dictionaries/en/contacts.en";
import { common as commonFr } from "@/dictionaries/fr/common.fr";
import { common as commonEn } from "@/dictionaries/en/common.en";
import type { Client } from "@/types/api";

export default function ContactsPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const { theme } = useSector();

  const d = lang === "fr" ? contFr : contEn;
  const c = lang === "fr" ? commonFr : commonEn;

  const [rows, setRows] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
    setIsLoading(true);
    clientsRepository
      .getList()
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = search
    ? rows.filter(
        (r) =>
          r.nom.toLowerCase().includes(search.toLowerCase()) ||
          r.telephone?.toLowerCase().includes(search.toLowerCase()) ||
          r.email?.toLowerCase().includes(search.toLowerCase()),
      )
    : rows;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
      day: "2-digit",
      month: "short",
    });

  return (
    <div className="space-y-6">
      <PageHeader
        title={d.title}
        subtitle={d.subtitle}
        badge={
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${theme.primary}15`, color: theme.primary }}
          >
            {rows.length}
          </span>
        }
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={c.search}
        onReset={() => setSearch("")}
        resetLabel={c.all}
        hasActiveFilters={search !== ""}
      />

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-12">{d.noData}</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              labels={d.table}
              dateFormatted={formatDate(contact.created_at)}
              onClick={() => router.push(`/contacts/${contact.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}