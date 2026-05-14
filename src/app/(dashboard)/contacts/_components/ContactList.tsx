// src/app/(dashboard)/contacts/_components/ContactList.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { Spinner } from "@/components/ui";
import { useDebounce } from "@/hooks/useDebounce";
import { contactsRepository } from "@/repositories/contacts.repository";
import type { Contact, ContactFilters, ContactStatut } from "@/types/api/crm.types";
import { StatusBadge, ScoreIndicator } from "./StatusBadge";

const STATUTS: { value: ContactStatut | ""; label_fr: string; label_en: string }[] = [
  { value: "",         label_fr: "Tous",      label_en: "All" },
  { value: "prospect", label_fr: "Prospects", label_en: "Prospects" },
  { value: "contact",  label_fr: "Contacts",  label_en: "Contacts" },
  { value: "client",   label_fr: "Clients",   label_en: "Clients" },
  { value: "inactif",  label_fr: "Inactifs",  label_en: "Inactive" },
];

const ORDERINGS = [
  { value: "-derniere_interaction", label_fr: "Récents",         label_en: "Recent" },
  { value: "-nb_conversations",     label_fr: "+ conversations",  label_en: "Most chats" },
  { value: "-nb_rdv",               label_fr: "+ RDV",            label_en: "Most appts" },
  { value: "nom",                   label_fr: "Nom A→Z",          label_en: "Name A→Z" },
];

function timeAgo(iso: string | null, locale: "fr" | "en"): string {
  if (!iso) return locale === "fr" ? "Jamais" : "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1)  return locale === "fr" ? "À l'instant" : "Just now";
  if (h < 24) return locale === "fr" ? `${h}h` : `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return locale === "fr" ? `${d}j` : `${d}d`;
  return new Date(iso).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", { day:"2-digit", month:"short" });
}

function Avatar({ name, primary }: { name: string; primary: string }) {
  const initials = name.split(" ").slice(0,2).map(w => w[0] ?? "").join("").toUpperCase() || "?";
  return (
    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold shrink-0 text-white"
         style={{ background: `linear-gradient(135deg, ${primary}cc, ${primary})` }}>
      {initials}
    </div>
  );
}

function ContactRow({ contact, selected, locale, theme, onSelect }: {
  contact: Contact; selected: boolean; locale: "fr"|"en";
  theme: { primary: string }; onSelect: (c: Contact) => void;
}) {
  return (
    <button
      onClick={() => onSelect(contact)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all duration-150 group ${
        selected
          ? "text-white shadow-md"
          : "hover:bg-[var(--bg)] text-[var(--text)]"
      }`}
      style={selected ? { background: `linear-gradient(135deg, ${theme.primary}dd, ${theme.primary})` } : {}}
    >
      <Avatar name={contact.nom_complet} primary={theme.primary} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate leading-tight ${selected ? "text-white" : "text-[var(--text)]"}`}>
          {contact.nom_complet}
        </p>
        <p className={`text-xs truncate mt-0.5 ${selected ? "text-white/70" : "text-[var(--text-muted)]"}`}>
          {contact.phone}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <StatusBadge statut={contact.statut} locale={locale} size="sm" selected={selected} />
        <div className="flex items-center gap-1.5">
          <ScoreIndicator score={contact.score} />
          <span className={`text-[10px] ${selected ? "text-white/60" : "text-[var(--text-muted)]"}`}>
            {timeAgo(contact.derniere_interaction, locale)}
          </span>
        </div>
      </div>
    </button>
  );
}

interface Props {
  locale: "fr"|"en"; theme: { primary: string };
  selectedId: string | null; onSelectContact: (c: Contact) => void;
}

export function ContactList({ locale, theme, selectedId, onSelectContact }: Props) {
  const [contacts, setContacts]   = useState<Contact[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [isLoading, setLoading]   = useState(true);
  const [search, setSearch]       = useState("");
  const [statut, setStatut]       = useState<ContactStatut|"">("");
  const [ordering, setOrdering]   = useState("-derniere_interaction");
  const [showFilters, setShowFilters] = useState(false);

  const dSearch = useDebounce(search, 350);
  const PAGE_SIZE = 20;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const load = useCallback(() => {
    setLoading(true);
    const f: ContactFilters = { search: dSearch||undefined, statut: statut||undefined, ordering, page, page_size: PAGE_SIZE };
    contactsRepository.getList(f)
      .then(r => { setContacts(r.results); setTotal(r.count); })
      .catch(() => { setContacts([]); setTotal(0); })
      .finally(() => setLoading(false));
  }, [dSearch, statut, ordering, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [dSearch, statut, ordering]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Search + filtres */}
      <div className="px-4 py-3 space-y-2 border-b border-[var(--border)]">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder={locale === "fr" ? "Rechercher…" : "Search…"}
              className="input-base pl-8 py-2 text-sm h-9"
            />
          </div>
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
              showFilters
                ? "text-white border-transparent"
                : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-muted)]"
            }`}
            style={showFilters ? { background: theme.primary } : {}}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>

        {showFilters && (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1">
              {STATUTS.map(s => (
                <button key={s.value} onClick={() => setStatut(s.value)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-medium border transition-all ${
                    statut === s.value
                      ? "text-white border-transparent"
                      : "text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--text-muted)]"
                  }`}
                  style={statut === s.value ? { background: theme.primary } : {}}>
                  {locale === "fr" ? s.label_fr : s.label_en}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
              <select value={ordering} onChange={e => setOrdering(e.target.value)}
                className="flex-1 input-base py-1 text-xs h-8">
                {ORDERINGS.map(o => (
                  <option key={o.value} value={o.value}>{locale === "fr" ? o.label_fr : o.label_en}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Count */}
      <div className="px-4 py-2 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wide">
          {total} {locale === "fr" ? "contact(s)" : "contact(s)"}
        </span>
      </div>

      {/* Liste */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-32"><Spinner /></div>
        ) : contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center px-4">
            <p className="text-sm text-[var(--text-muted)]">
              {locale === "fr" ? "Aucun contact trouvé" : "No contacts found"}
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {contacts.map(c => (
              <ContactRow key={c.id} contact={c} selected={selectedId === c.id}
                locale={locale} theme={theme} onSelect={onSelectContact} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-[var(--border)] shrink-0">
          <button disabled={page===1} onClick={() => setPage(p=>p-1)}
            className="w-8 h-8 rounded-xl border border-[var(--border)] flex items-center justify-center disabled:opacity-40 hover:border-[var(--text-muted)] transition-colors">
            <ChevronLeft className="w-4 h-4 text-[var(--text-muted)]" />
          </button>
          <span className="text-xs text-[var(--text-muted)]">{page} / {totalPages}</span>
          <button disabled={page===totalPages} onClick={() => setPage(p=>p+1)}
            className="w-8 h-8 rounded-xl border border-[var(--border)] flex items-center justify-center disabled:opacity-40 hover:border-[var(--text-muted)] transition-colors">
            <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
          </button>
        </div>
      )}
    </div>
  );
}