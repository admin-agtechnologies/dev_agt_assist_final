// src/app/(dashboard)/knowledge/_components/tabs/CollecteDocumentsKbTab.tsx
"use client";

import { FileText, CheckSquare, Upload, List } from "lucide-react";
import { useSector } from "@/hooks/useSector";

export function CollecteDocumentsKbTab() {
  const { theme } = useSector();
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
            <p className="font-bold text-[var(--text)]">Collecte Documents</p>
            <p className="text-xs text-[var(--text-muted)]">Guide le client étape par étape dans les pièces à fournir</p>
          </div>
          <span className="ml-auto text-[10px] font-semibold px-2.5 py-1 rounded-full border"
            style={{ borderColor: theme.primary, color: theme.primary, backgroundColor: `${theme.primary}10` }}>
            Prochaine session
          </span>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: List,        title: "Documents requis",  desc: "Configurés sur chaque produit financier via DetailsFinanciers.documents_requis (JSONField)." },
            { icon: CheckSquare, title: "Validation manuelle", desc: "L'entreprise coche chaque pièce reçue depuis le dashboard. Le bot guide, l'humain valide." },
            { icon: Upload,      title: "Upload C2",         desc: "Upload réel de fichiers hors scope Chantier 1. Prévu Chantier 2 (stockage cloud S3/Cloudflare)." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
              <Icon className="w-5 h-5 mb-2 text-[var(--text-muted)]" />
              <p className="text-sm font-semibold text-[var(--text)] mb-1">{title}</p>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
        <div className="px-5 pb-5">
          <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-3">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Les documents requis se configurent dans l'onglet <strong>Produits financiers</strong>
              → chaque produit → champ <code className="font-mono">documents_requis</code>.
              L'interface de validation manuelle sera ajoutée à la prochaine session.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}