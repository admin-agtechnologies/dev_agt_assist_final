"use client";
// src/app/(dashboard)/conversations/page.tsx

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSector } from "@/hooks/useSector";
import { agentRepository } from "@/repositories/agent.repository";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { ConversationStatus } from "@/components/conversations/ConversationStatus";
import type { AIConversation, AIConversationFilters, PaginatedResponse } from "@/types/api";
import type { DataTableColumn } from "@/components/ui/DataTable";
import type { FilterOption } from "@/components/ui/FilterBar";

const PAGE_SIZE = 20;

export default function ConversationsPage() {
  const router = useRouter();
  const { dictionary: d } = useLanguage();
  const { theme } = useSector();

  const cv = d.conversations;
  const c = d.common;

  const [rows, setRows] = useState<AIConversation[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statut, setStatut] = useState("");

  const load = useCallback(() => {
    setIsLoading(true);
    const filters: AIConversationFilters = {
      statut: (statut as AIConversationFilters["statut"]) || undefined,
      page,
      page_size: PAGE_SIZE,
    };
    agentRepository
      .listConversations(filters)
      .then((res: PaginatedResponse<AIConversation>) => {
        setRows(res.results);
        setTotal(res.count);
      })
      .catch(() => { setRows([]); setTotal(0); })
      .finally(() => setIsLoading(false));
  }, [page, statut]);

  useEffect(() => { load(); }, [load]);

  const filtered = search
    ? rows.filter((r) =>
        r.contact?.nom?.toLowerCase().includes(search.toLowerCase()) ||
        r.contact?.phone?.toLowerCase().includes(search.toLowerCase()),
      )
    : rows;

  const statutOptions: FilterOption[] = [
    { value: "active",    label: cv.statuses.active },
    { value: "terminee",  label: cv.statuses.terminee },
    { value: "transferee", label: cv.statuses.transferee },
  ];

  const columns: DataTableColumn<AIConversation>[] = [
    {
      key: "contact",
      header: cv.table.contact,
      render: (r) => (
        <div>
          <p className="text-sm font-medium text-[var(--text)]">{r.contact?.nom ?? "—"}</p>
          <p className="text-xs text-[var(--text-muted)]">{r.contact?.phone ?? "—"}</p>
        </div>
      ),
    },
    {
      key: "canal",
      header: cv.table.canal,
      render: (r) => (
        <span className="text-xs capitalize text-[var(--text-muted)]">{r.canal}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "statut",
      header: cv.table.statut,
      render: (r) => <ConversationStatus statut={r.statut} labels={cv.statuses} size="xs" />,
    },
    {
      key: "messages",
      header: cv.table.messages,
      align: "center",
      render: (r) => (
        <span className="text-sm text-[var(--text-muted)]">{r.messages?.length ?? 0}</span>
      ),
      hideOnMobile: true,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={cv.title}
        subtitle={cv.subtitle}
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
            placeholder: cv.filters.allStatuses,
            options: statutOptions,
            value: statut,
            onChange: setStatut,
          },
        ]}
        resetLabel={c.all}
        onReset={() => { setSearch(""); setStatut(""); setPage(1); }}
        hasActiveFilters={search !== "" || statut !== ""}
      />

      <DataTable
        rows={filtered}
        columns={columns}
        rowKey={(r) => r.id}
        onRowClick={(r) => router.push(`/conversations/${r.id}`)}
        isLoading={isLoading}
        emptyTitle={cv.noData}
        pagination={{
          page,
          pageSize: PAGE_SIZE,
          total,
          onPageChange: setPage,
          labels: {
            previous: c.prev,
            next: c.next,
            of: "/",
            results: c.noData,
          },
        }}
      />
    </div>
  );
}