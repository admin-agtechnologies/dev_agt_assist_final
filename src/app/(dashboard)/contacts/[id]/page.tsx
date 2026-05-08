// src/app/(dashboard)/contacts/[id]/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { api } from "@/lib/api-client";
import { PageHeader } from "@/components/ui/PageHeader";
import { Spinner } from "@/components/ui";
import type { Contact } from "@/types/api/crm.types";

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { dictionary: d } = useLanguage();
  const t = d.contacts.detail;

  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .get(`/api/v1/contacts/${id}/`)
      .then((data: unknown) => setContact(data as Contact))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("fr-FR", { dateStyle: "medium" });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  if (notFound || !contact) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <p className="text-[var(--text-muted)] text-sm">{t.notFound}</p>
        <button
          type="button"
          onClick={() => router.back()}
          className="mt-4 text-sm text-[var(--primary)] underline"
        >
          {d.common.back}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHeader title={contact.nom} onBack={() => router.back()} />

      <div className="card p-4 space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-[var(--text-muted)]">{d.contacts.table.phone}</span>
          <span className="font-medium text-[var(--text)]">{contact.phone}</span>
        </div>
        {contact.email && (
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-muted)]">{t.email}</span>
            <span className="font-medium text-[var(--text)]">{contact.email}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-[var(--text-muted)]">{t.since}</span>
          <span className="font-medium text-[var(--text)]">{formatDate(contact.created_at)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[var(--text-muted)]">{t.source}</span>
          <span className="font-medium text-[var(--text)]">{contact.statut}</span>
        </div>
      </div>

      {contact.crm_signals.length > 0 ? (
        <div className="card p-4">
          <h2 className="font-semibold text-[var(--text)] text-sm mb-3">{t.history}</h2>
          <ul className="space-y-2">
            {contact.crm_signals.map((signal) => (
              <li key={signal.id} className="flex justify-between text-xs">
                <span className="text-[var(--text)]">{signal.type}</span>
                <span className="text-[var(--text-muted)]">{formatDate(signal.created_at)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="card p-12 text-center">
          <p className="text-[var(--text-muted)] text-sm">{t.noHistory}</p>
        </div>
      )}
    </div>
  );
}