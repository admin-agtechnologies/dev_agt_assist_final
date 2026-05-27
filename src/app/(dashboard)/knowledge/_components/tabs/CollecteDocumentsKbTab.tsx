// src/app/(dashboard)/knowledge/_components/tabs/CollecteDocumentsKbTab.tsx
// B5 S39 — Badge "Bientôt disponible" FR/EN explicite
"use client";

import { FileText, CheckSquare, Upload, List, Sparkles } from "lucide-react";
import { useSector }   from "@/hooks/useSector";
import { useLanguage } from "@/contexts/LanguageContext";

export function CollecteDocumentsKbTab() {
  const { theme }  = useSector();
  const { locale } = useLanguage();
  const soon = locale === "fr"
    ? "Bientôt disponible — dès la prochaine mise à jour"
    : "Available soon — in the next project update";

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
        <div className="h-20 flex items-center px-6 gap-4"
          style={{ background: `linear-gradient(135deg, ${theme.primary}15, ${theme.primary}35)` }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: `${theme.primary}25` }}>
            <FileText className="w-6 h-6" style={{ color: theme.primary }} />
          </div>
          <div>
            <p className="font-bold text-[var(--text)]">
              {locale === "fr" ? "Collecte Documents" : "Document Collection"}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              {locale === "fr"
                ? "Guide le client étape par étape dans les pièces à fournir"
                : "Guides the client step by step through required documents"}
            </p>
          </div>
          <span className="ml-auto flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full border"
            style={{ borderColor: theme.primary, color: theme.primary, backgroundColor: `${theme.primary}10` }}>
            <Sparkles className="w-3 h-3" />
            {locale === "fr" ? "Bientôt disponible" : "Coming soon"}
          </span>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: List,        title: locale === "fr" ? "Documents requis" : "Required documents",
              desc: locale === "fr"
                ? "Configurés sur chaque produit financier via DetailsFinanciers.documents_requis (JSONField)."
                : "Configured on each financial product via DetailsFinanciers.documents_requis (JSONField)." },
            { icon: CheckSquare, title: locale === "fr" ? "Validation manuelle" : "Manual validation",
              desc: locale === "fr"
                ? "L'entreprise coche chaque pièce reçue depuis le dashboard. Le bot guide, l'humain valide."
                : "The company checks each received document from the dashboard. Bot guides, human validates." },
            { icon: Upload,      title: locale === "fr" ? "Upload C2" : "Upload C2",
              desc: locale === "fr"
                ? "Upload réel de fichiers hors scope Chantier 1. Prévu Chantier 2 (stockage cloud S3/Cloudflare)."
                : "Real file upload out of scope for Project 1. Planned for Project 2 (S3/Cloudflare cloud storage)." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
              <Icon className="w-5 h-5 mb-2 text-[var(--text-muted)]" />
              <p className="text-sm font-semibold text-[var(--text)] mb-1">{title}</p>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
        <div className="px-5 pb-5 space-y-3">
          <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-3">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              {locale === "fr"
                ? <>Les documents requis se configurent dans l'onglet <strong>Produits financiers</strong> → chaque produit → champ <code className="font-mono">documents_requis</code>.</>
                : <>Required documents are configured in the <strong>Financial Products</strong> tab → each product → <code className="font-mono">documents_requis</code> field.</>}
            </p>
          </div>
          <div className="rounded-xl bg-[var(--bg)] border border-[var(--border)] px-4 py-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 flex-shrink-0" style={{ color: theme.primary }} />
            <p className="text-xs font-medium" style={{ color: theme.primary }}>{soon}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// END OF FILE: src/app/(dashboard)/knowledge/_components/tabs/CollecteDocumentsKbTab.tsx