// src/app/(dashboard)/contacts/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/hooks/useLanguage";
import { useSector } from "@/hooks/useSector";
import {
  clientsRepository,
  rendezVousRepository,
} from "@/repositories/contacts.repository";
import { conversationsRepository } from "@/repositories/conversations.repository";
import { PageHeader } from "@/components/ui/PageHeader";
import { DetailCard } from "@/components/ui/DetailCard";
import { InteractionTimeline } from "@/components/contacts/InteractionTimeline";
import { CRMSignalChart } from "@/components/contacts/CRMSignalChart";
import { contacts as contFr } from "@/dictionaries/fr/contacts.fr";
import { contacts as contEn } from "@/dictionaries/en/contacts.en";
import { common as commonFr } from "@/dictionaries/fr/common.fr";
import { common as commonEn } from "@/dictionaries/en/common.en";
import type { Client, RendezVous, Conversation } from "@/types/api";
import { StatusMessage } from "@/components/conversations/StatusMessage";

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { lang } = useLanguage();
  const { theme } = useSector();

  const d = lang === "fr" ? contFr : contEn;
  const c = lang === "fr" ? commonFr : commonEn;

  const contactId = typeof params.id === "string" ? params.id : null;

  const [contact, setContact] = useState<Client | null>(null);
  const [rdvs, setRdvs] = useState<RendezVous[]>([]);
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!contactId) return;
    setIsLoading(true);

    Promise.all([
      clientsRepository.getList().then((list) =>
        list.find((c) => c.id === contactId) ?? null,
      ),
      rendezVousRepository.getList({ page_size: 50 }).then((r) =>
        r.results.filter((rdv) => rdv.client === contactId),
      ),
      conversationsRepository.getList({ page_size: 50 }).then((r) =>
        r.results.filter((conv) => conv.client === contactId),
      ),
    ])
      .then(([c, r, convs]) => {
        setContact(c);
        setRdvs(r);
        setConvs(convs);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [contactId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <StatusMessage content={c.loading} isAnimated />
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="flex items-center justify-center h-64">
        <StatusMessage content={d.noData} />
      </div>
    );
  }

  const timelineItems = [
    ...rdvs.map((r) => ({ type: "rdv" as const, data: r })),
    ...convs.map((cv) => ({ type: "conversation" as const, data: cv })),
  ].sort((a, b) => {
    const dateA = a.type === "rdv" ? a.data.scheduled_at : a.data.created_at;
    const dateB = b.type === "rdv" ? b.data.scheduled_at : b.data.created_at;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title={contact.nom}
        subtitle={d.detail.title}
        backLabel={c.back}
        onBack={() => router.push("/contacts")}
      />

      {/* Fiche informations */}
      <DetailCard
        title={d.detail.title}
        sections={[
          {
            fields: [
              { label: d.table.name,  value: contact.nom },
              { label: d.table.phone, value: contact.telephone, hideIfEmpty: true },
              { label: d.table.email, value: contact.email,     hideIfEmpty: true },
              {
                label: d.table.date,
                value: new Date(contact.created_at).toLocaleDateString(
                  lang === "fr" ? "fr-FR" : "en-US",
                ),
              },
            ],
          },
        ]}
      />

      {/* CRM Signals */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <p
          className="text-xs font-semibold uppercase tracking-wide mb-4"
          style={{ color: theme.primary }}
        >
          CRM
        </p>
        <CRMSignalChart
          rdvCount={rdvs.length}
          conversationCount={convs.length}
          labels={{
            rdvCount: d.detail.rdvCount,
            conversationCount: d.detail.conversationCount,
          }}
        />
      </div>

      {/* Historique interactions */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <p
          className="text-xs font-semibold uppercase tracking-wide mb-4"
          style={{ color: theme.primary }}
        >
          {d.detail.history}
        </p>
        <InteractionTimeline
          items={timelineItems}
          labels={d.detail}
          lang={lang}
        />
      </div>
    </div>
  );
}