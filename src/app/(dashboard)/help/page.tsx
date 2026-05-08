// src/app/pme/help/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { SectionHeader } from "@/components/ui";
import {
  HelpCircle, ChevronDown, MessageCircle, ExternalLink,
  Search, Tag,
} from "lucide-react";
import { platformHelpRepository } from "@/repositories";
import type { HelpEntry } from "@/types/api";

function openSupportChat() {
  window.dispatchEvent(new CustomEvent("agt:open-chat"));
}

const CATEGORIE_LABELS: Record<string, { fr: string; en: string }> = {
  general:   { fr: "Général",     en: "General" },
  bots:      { fr: "Assistants",  en: "Assistants" },
  billing:   { fr: "Facturation", en: "Billing" },
  rdv:       { fr: "Rendez-vous", en: "Appointments" },
  technique: { fr: "Technique",   en: "Technical" },
};

function categoryLabel(cat: string, locale: string): string {
  return CATEGORIE_LABELS[cat]?.[locale as "fr" | "en"] ?? cat;
}

export default function PmeHelpPage() {
  const { dictionary: d, locale } = useLanguage();
  const t = d.help;

  const [entries, setEntries] = useState<HelpEntry[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    platformHelpRepository.getList().then(setEntries).catch(() => setEntries([]));
  }, []);

  const categories = ["all", ...Array.from(new Set(entries.map(e => e.categorie)))];

  const filtered = entries.filter(entry => {
    const matchCat = activeCategory === "all" || entry.categorie === activeCategory;
    const q = search.toLowerCase();
    const question = locale === "fr" ? entry.question_fr : entry.question_en;
    const reponse  = locale === "fr" ? entry.reponse_fr  : entry.reponse_en;
    const matchSearch = !q || question.toLowerCase().includes(q) || reponse.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const whatsappUrl = "https://wa.me/237600000000?text=Bonjour%20AGT%20Technologies%20!";

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl mx-auto">

      <SectionHeader title={t.title} subtitle={t.subtitle} />

      {/* ── Boutons contact ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={openSupportChat}
          className="group flex items-center gap-4 p-5 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] hover:border-[#075E54] hover:shadow-md transition-all text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#075E54]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#075E54]/20 transition-colors">
            <MessageCircle className="w-6 h-6 text-[#075E54]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-[var(--text)]">{t.chatBtn}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{t.contactSubtitle}</p>
          </div>
        </button>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-4 p-5 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] hover:border-[#25D366] hover:shadow-md transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#25D366]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#25D366]/20 transition-colors">
            <svg className="w-6 h-6 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-[var(--text)]">{t.whatsappBtn}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">+237 600 000 000</p>
          </div>
          <ExternalLink className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0 group-hover:text-[#25D366] transition-colors" />
        </a>
      </div>

      {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div>
          <p className="text-base font-bold text-[var(--text)]">{t.faqSection}</p>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">{t.faqSubtitle}</p>
        </div>

        {/* Recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            className="input-base pl-9 text-sm"
            placeholder={locale === "fr" ? "Rechercher dans la FAQ…" : "Search FAQ…"}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Filtres catégories */}
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all",
                activeCategory === cat
                  ? "bg-[#075E54] text-white border-[#075E54]"
                  : "bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border)] hover:border-[#075E54]"
              )}
            >
              {cat === "all"
                ? (t.categories?.all ?? "Toutes")
                : <><Tag className="w-3 h-3" />{categoryLabel(cat, locale)}</>
              }
            </button>
          ))}
        </div>

        {search && (
          <p className="text-xs text-[var(--text-muted)]">
            {filtered.length} {locale === "fr" ? "résultat(s)" : "result(s)"}
          </p>
        )}

        {/* Liste FAQ */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-10">
              <HelpCircle className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-3 opacity-40" />
              <p className="text-sm text-[var(--text-muted)]">{t.faqEmpty}</p>
            </div>
          ) : filtered.map(entry => {
            const question = locale === "fr" ? entry.question_fr : entry.question_en;
            const reponse  = locale === "fr" ? entry.reponse_fr  : entry.reponse_en;
            return (
              <div key={entry.id} className="card overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-[var(--bg)] transition-colors text-left"
                  onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#075E54]/10 flex items-center justify-center">
                      <HelpCircle className="w-3.5 h-3.5 text-[#075E54]" />
                    </span>
                    <span className="text-sm font-semibold text-[var(--text)] truncate">
                      {question}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)] font-medium flex-shrink-0 hidden sm:inline-flex">
                      {categoryLabel(entry.categorie, locale)}
                    </span>
                  </div>
                  <ChevronDown className={cn(
                    "w-4 h-4 text-[var(--text-muted)] transition-transform flex-shrink-0 ml-3",
                    expanded === entry.id && "rotate-180"
                  )} />
                </button>

                {expanded === entry.id && (
                  <div className="px-6 pb-5 pt-3 border-t border-[var(--border)]">
                    <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                      {reponse}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
