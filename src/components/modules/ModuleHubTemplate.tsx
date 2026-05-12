// src/components/modules/ModuleHubTemplate.tsx
"use client";
import {
  UtensilsCrossed, BedDouble, BookOpen, ShoppingCart, CalendarDays,
  Package, Wrench, Bus, GraduationCap, Building2, Sparkles, Bell, Target,
  RefreshCw, Plus, Clock, LayoutList, Edit3,
} from "lucide-react";
import type { HubModule } from "@/lib/hub-modules";
import { useLanguage } from "@/contexts/LanguageContext";

const ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  UtensilsCrossed, BedDouble, BookOpen, ShoppingCart, CalendarDays,
  Package, Wrench, Bus, GraduationCap, Building2, Sparkles, Bell, Target,
};

interface Props {
  module: HubModule;
  items: Record<string, unknown>[];
  total: number;
  loading: boolean;
  onRefresh: () => void;
  onAdd?: () => void;
  renderItem?: (item: Record<string, unknown>, i: number) => React.ReactNode;
}

function Skeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3].map((k) => (
        <div key={k} className="h-16 rounded-xl bg-[var(--border)] opacity-50" />
      ))}
    </div>
  );
}

function EmptyState({ module, locale }: { module: HubModule; locale: string }) {
  const Icon = ICONS[module.iconName] ?? LayoutList;
  const isWriter = module.type === "user_writes";
  const fr = isWriter
    ? { t: "Aucun élément pour l'instant", s: "Commencez par ajouter votre premier contenu.", cta: "Ajouter" }
    : { t: "En attente de données", s: "Votre assistant collecte les données automatiquement. Configurez-le pour commencer.", cta: "Voir les bots" };
  const en = isWriter
    ? { t: "Nothing here yet", s: "Start by adding your first item.", cta: "Add" }
    : { t: "Waiting for data", s: "Your assistant collects data automatically. Set it up to get started.", cta: "View bots" };
  const t = locale === "fr" ? fr : en;

  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
        style={{ backgroundColor: `${module.color}18` }}>
        <Icon className="w-10 h-10" style={{ color: module.color }} />
      </div>
      <div>
        <p className="text-lg font-bold text-[var(--text)]">{t.t}</p>
        <p className="text-sm text-[var(--text-muted)] mt-1 max-w-xs">{t.s}</p>
      </div>
    </div>
  );
}

function GenericItemCard({ item, color }: { item: Record<string, unknown>; color: string }) {
  const fields = Object.entries(item)
    .filter(([k, v]) => !k.endsWith("_id") && !k.startsWith("_") && typeof v !== "object" && v !== null)
    .slice(0, 4);

  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)]
      hover:border-[var(--color-primary)]/30 hover:shadow-sm transition-all group">
      <div className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ backgroundColor: color }} />
      <div className="flex-1 min-w-0">
        {fields.map(([k, v]) => (
          <div key={k} className="flex items-center gap-2 text-sm">
            <span className="text-[var(--text-muted)] capitalize">{k.replace(/_/g, " ")}:</span>
            <span className="font-medium text-[var(--text)] truncate">{String(v)}</span>
          </div>
        ))}
      </div>
      <Clock className="w-3.5 h-3.5 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
    </div>
  );
}

export function ModuleHubTemplate({ module, items, total, loading, onRefresh, onAdd, renderItem }: Props) {
  const { locale } = useLanguage();
  const Icon = ICONS[module.iconName] ?? LayoutList;
  const isWriter = module.type === "user_writes";

  const label    = locale === "fr" ? module.labelFr    : module.labelEn;
  const desc     = locale === "fr" ? module.descFr     : module.descEn;
  const addLabel = locale === "fr" ? "Ajouter" : "Add";
  const refreshLabel = locale === "fr" ? "Actualiser" : "Refresh";

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="relative rounded-2xl overflow-hidden p-6"
        style={{ background: `linear-gradient(135deg, ${module.color}18 0%, ${module.color}08 100%)` }}>
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: `radial-gradient(circle at 80% 20%, ${module.color}, transparent 60%)` }} />
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm"
              style={{ backgroundColor: `${module.color}22`, border: `1.5px solid ${module.color}40` }}>
              <Icon className="w-7 h-7" style={{ color: module.color }} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--text)]">{label}</h1>
              <p className="text-sm text-[var(--text-muted)] mt-0.5">{desc}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={onRefresh}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-[var(--text-muted)]
                border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg)] transition-all">
              <RefreshCw className="w-3.5 h-3.5" />{refreshLabel}
            </button>
            {isWriter && onAdd && (
              <button onClick={onAdd}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 shadow-sm"
                style={{ backgroundColor: module.color }}>
                <Plus className="w-3.5 h-3.5" />{addLabel}
              </button>
            )}
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative flex gap-3 mt-5">
          {[
            { label: locale === "fr" ? "Total" : "Total", value: total },
            { label: locale === "fr" ? "Ce mois" : "This month", value: items.length },
          ].map((s) => (
            <div key={s.label}
              className="flex-1 rounded-xl p-3 bg-[var(--bg-card)]/80 backdrop-blur border border-[var(--border)]">
              <p className="text-2xl font-bold text-[var(--text)]">{s.value}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{s.label}</p>
            </div>
          ))}
          <div className="flex-1 rounded-xl p-3 bg-[var(--bg-card)]/80 backdrop-blur border border-[var(--border)]
            flex items-center gap-2">
            {isWriter
              ? <><Edit3 className="w-4 h-4" style={{ color: module.color }} /><span className="text-xs font-semibold text-[var(--text-muted)]">{locale === "fr" ? "Vous gérez" : "You manage"}</span></>
              : <><Icon className="w-4 h-4" style={{ color: module.color }} /><span className="text-xs font-semibold text-[var(--text-muted)]">{locale === "fr" ? "Agent actif" : "Agent active"}</span></>}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-5 min-h-[320px]">
        {loading ? (
          <Skeleton />
        ) : items.length === 0 ? (
          <EmptyState module={module} locale={locale} />
        ) : (
          <div className="space-y-2">
            {items.map((item, i) =>
              renderItem ? renderItem(item, i) : (
                <GenericItemCard key={i} item={item} color={module.color} />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}