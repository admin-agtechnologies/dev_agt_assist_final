// src/app/pme/bots/_components/BotPairCard.tsx
"use client";
import {
  Bot, ChevronDown, ChevronUp, Pencil, Trash2,
  Globe, GlobeLock, FlaskConical, Phone, MessageSquare,
} from "lucide-react";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { type BotPair, getSectorColor } from "./bots.types";
import { BotPairDetailPanel } from "./BotPairDetailPanel";

// ── Props ─────────────────────────────────────────────────────────────────────
interface BotPairCardProps {
  pair: BotPair;
  isExpanded: boolean;
  sector: string;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onPublishToggle: () => void;
  onTest: () => void;
  onRefresh: () => void;
  d: ReturnType<typeof useLanguage>["dictionary"];
}

// ─────────────────────────────────────────────────────────────────────────────

export function BotPairCard({
  pair, isExpanded, sector,
  onToggleExpand, onEdit, onDelete, onPublishToggle, onTest, onRefresh, d,
}: BotPairCardProps) {
  const t = d.bots;
  const colors       = getSectorColor(sector);
  const isActive     = pair.waBot.statut === "actif";
  const mainName     = pair.waBot.nom;
  const phoneDisplay = pair.waBot.numero_value ?? null;

  return (
    <div className="card overflow-hidden">
      {/* ── En-tête ── */}
      <div className="px-5 py-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${colors.primary}18` }}>
          <Bot className="w-6 h-6" style={{ color: colors.primary }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="text-sm font-bold text-[var(--text)]">{mainName}</p>
            <Badge variant={isActive ? "green" : "amber"}>
              {isActive ? t.statusActive : t.statusPaused}
            </Badge>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {phoneDisplay ? (
              <span className="flex items-center gap-1 text-xs text-[var(--text-muted)] font-mono">
                <Phone className="w-3 h-3" /> {phoneDisplay}
              </span>
            ) : (
              <span className="text-xs text-[var(--text-muted)] italic">Numéro non configuré</span>
            )}
            <span className="flex items-center gap-1 text-xs">
              <MessageSquare className="w-3 h-3 text-[#25D366]" />
              <span className="text-[#25D366] font-semibold">WhatsApp</span>
            </span>
            {pair.voiceBot && (
              <span className="flex items-center gap-1 text-xs">
                <Phone className="w-3 h-3 text-[#6C3CE1]" />
                <span className="text-[#6C3CE1] font-semibold">Vocal IA</span>
              </span>
            )}
            <span className="text-xs text-[var(--text-muted)]">
              {pair.waBot.langues.join(", ")}
            </span>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button onClick={onTest}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-[var(--border)] hover:border-[#6C3CE1] hover:text-[#6C3CE1] transition-colors">
            <FlaskConical className="w-3.5 h-3.5" /> {t.testBtn}
          </button>

          <button onClick={onPublishToggle}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors",
              isActive
                ? "bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)] hover:border-red-400 hover:text-red-400"
                : "bg-[#25D366] text-white hover:bg-[#128C7E]",
            )}>
            {isActive
              ? <><GlobeLock className="w-3.5 h-3.5" /> {t.unpublish}</>
              : <><Globe     className="w-3.5 h-3.5" /> {t.publish}</>
            }
          </button>

          <button onClick={onEdit}
            className="p-1.5 rounded-lg hover:bg-[var(--bg)] text-[var(--text-muted)] transition-colors">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={onDelete}
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={onToggleExpand}
            className="p-1.5 rounded-lg hover:bg-[var(--bg)] text-[var(--text-muted)] transition-colors">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <BotPairDetailPanel
          pair={pair}
          d={d}
          colors={colors}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
}