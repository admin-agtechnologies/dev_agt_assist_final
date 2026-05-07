// src/app/(dashboard)/conversations/page.tsx
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/hooks/useLanguage";
import { useSector } from "@/hooks/useSector";
import { conversationsRepository } from "@/repositories/conversations.repository";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { ConversationStatus } from "@/components/conversations/ConversationStatus";
import { conversations as convFr } from "@/dictionaries/fr/conversations.fr";
import { conversations as convEn } from "@/dictionaries/en/conversations.en";
import { common as commonFr } from "@/dictionaries/fr/common.fr";
import { common as commonEn } from "@/dictionaries/en/common.en";
import type { Conversation, ConversationFilters } from "@/types/api";
import type { DataTableColumn } from "@/components/ui/DataTable";
import type { FilterOption } from "@/components/ui/FilterBar";
import { useEffect } from "react";

const PAGE_SIZE = 20;

export default function ConversationsPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const { theme } = useSector();

  const d = lang === "fr" ? convFr : convEn;
  const c = lang === "fr" ? commonFr : commonEn;

  const [rows, setRows] = useState<Conversation[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statut, setStatut] = useState("");

  const load = useCallback(() => {
    setIsLoading(true);
    const filters: ConversationFilters = {
      statut: statut || undefined,
      page,
      page_size: PAGE_SIZE,
    };
    conversationsRepository
      .getList(filters)
      .then((res) => { setRows(res.results); setTotal(res.count); })
      .catch(() => { setRows([]); setTotal(0); })
      .finally(() => setIsLoading(false));
  }, [page, statut]);

  useEffect(() => { load(); }, [load]);

  const filtered = search
    ? rows.filter((r) =>
        r.client_nom.toLowerCase().includes(search.toLowerCase()) ||
        r.bot_nom.toLowerCase().includes(search.toLowerCase()),
      )
    : rows;

  const statutOptions: FilterOption[] = [
    { value: "en_cours",   label: d.statuses.en_cours },
    { value: "terminee",   label: d.statuses.terminee },
    { value: "abandonnee", label: d.statuses.abandonnee },
  ];

  const columns: DataTableColumn<Conversation>[] = [
    {
      key: "client",
      header: d.table.client,
      render: (r) => (
        <div>
          <p className="text-sm font-medium text-gray-900">{r.client_nom}</p>
          <p className="text-xs text-gray-400">{r.client_telephone}</p>
        </div>
      ),
    },
    {
      key: "bot",
      header: d.table.bot,
      render: (r) => <span className="text-sm text-gray-700">{r.bot_nom}</span>,
      hideOnMobile: true,
    },
    {
      key: "canal",
      header: d.table.canal,
      render: (r) => (
        <span className="text-xs capitalize text-gray-500">
          {r.bot_type === "whatsapp" ? d.statuses.en_cours : d.table.canal}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: "statut",
      header: d.table.statut,
      render: (r) => (
        <ConversationStatus statut={r.statut} labels={d.statuses} size="xs" />
      ),
    },
    {
      key: "messages",
      header: d.table.messages,
      align: "center",
      render: (r) => (
        <span className="text-sm text-gray-600">{r.nb_messages}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "date",
      header: d.table.date,
      render: (r) => (
        <span className="text-xs text-gray-400">
          {new Date(r.dernier_message_at).toLocaleDateString(
            lang === "fr" ? "fr-FR" : "en-US",
            { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" },
          )}
        </span>
      ),
      hideOnMobile: true,
    },
  ];

  const hasFilters = search !== "" || statut !== "";

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
            {total}
          </span>
        }
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={c.search}
        filters={[
          {
            key: "statut",
            placeholder: d.filters.allStatuses,
            options: statutOptions,
            value: statut,
            onChange: setStatut,
          },
        ]}
        resetLabel={c.all}
        onReset={() => { setSearch(""); setStatut(""); setPage(1); }}
        hasActiveFilters={hasFilters}
      />

      <DataTable
        rows={filtered}
        columns={columns}
        rowKey={(r) => r.id}
        onRowClick={(r) => router.push(`/conversations/${r.id}`)}
        isLoading={isLoading}
        emptyTitle={d.noData}
        pagination={{
          page,
          pageSize: PAGE_SIZE,
          total,
          onPageChange: setPage,
          labels: { previous: c.prev, next: c.next, of: "/", results: "" },
        }}
      />
    </div>
  );
}