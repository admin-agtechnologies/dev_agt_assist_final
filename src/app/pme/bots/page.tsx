// src/app/pme/bots/page.tsx
"use client";
import { useState, useEffect, useCallback, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Bot, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/Toast";
import { botsRepository } from "@/repositories";
import { Badge, SectionHeader, EmptyState, ConfirmDeleteModal } from "@/components/ui";
import type { Bot as BotData, BotStatut } from "@/types/api";

import { type BotPair }   from "./_components/bots.types";
import { BotPairCard }    from "./_components/BotPairCard";
import { BotFormModal }   from "./_components/BotFormModal";

// ─────────────────────────────────────────────────────────────────────────────

export default function PmeBotsPage() {
  const { user } = useAuth();
  const { dictionary: d } = useLanguage();
  const t = d.bots;
  const toast = useToast();
  const router = useRouter();

  const [bots, setBots]         = useState<BotData[]>([]);
  const [loading, setLoading]   = useState(true);
  const [mounted, setMounted]   = useState(false);
  const [, startTransition]     = useTransition();

  const [formModal, setFormModal]     = useState<{ open: boolean; editId: string | null }>({ open: false, editId: null });
  const [deleteId, setDeleteId]       = useState<string | null>(null);
  const [isDeleting, setIsDeleting]   = useState(false);
  const [expandedPairId, setExpandedPairId] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  // ── Chargement ─────────────────────────────────────────────────────────────
  const fetchBots = useCallback(async () => {
    setLoading(true);
    try {
      const res = await botsRepository.getList();
      setBots(res.results ?? []);
    } catch {
      toast.error(t.errorLoad);
    } finally {
      setLoading(false);
    }
  }, [t.errorLoad, toast]);

  useEffect(() => { fetchBots(); }, [fetchBots]);

  // ── Construction des paires WA / Vocal ────────────────────────────────────
  const botPairs: BotPair[] = bots
    .filter(b => b.bot_type === "whatsapp")
    .map(waBot => ({
      waBot,
      voiceBot: bots.find(b => b.id === waBot.bot_paire && b.bot_type === "vocal") ?? null,
    }));

  // ── Publish / Unpublish ───────────────────────────────────────────────────
  const handlePublishToggle = async (pair: BotPair) => {
    const isActive  = pair.waBot.statut === "actif";
    const newStatut: BotStatut = isActive ? "en_pause" : "actif";
    try {
      await Promise.all([
        botsRepository.patch(pair.waBot.id, { is_active: !isActive, statut: newStatut }),
        pair.voiceBot
          ? botsRepository.patch(pair.voiceBot.id, { is_active: !isActive, statut: newStatut })
          : Promise.resolve(),
      ]);
      toast.success(isActive ? t.unpublishSuccess : t.publishSuccess);
      startTransition(() => { fetchBots(); });
    } catch {
      toast.error(t.publishError);
    }
  };

  // ── Suppression ───────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await botsRepository.delete(deleteId);
      toast.success(t.deleteSuccess);
      setDeleteId(null);
      fetchBots();
    } catch {
      toast.error(t.deleteError);
    } finally {
      setIsDeleting(false);
    }
  };

  const sector = user?.entreprise?.secteur?.slug ?? "";

  // ── Rendu ─────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="space-y-4 animate-pulse">
      {[...Array(2)].map((_, i) => <div key={i} className="h-28 card bg-[var(--bg)]" />)}
    </div>
  );

  return (
    <>
      <div className="space-y-4 animate-fade-in">
        <SectionHeader
          title={t.title}
          subtitle={t.subtitle}
          action={
            <button onClick={() => setFormModal({ open: true, editId: null })} className="btn-primary">
              <Plus className="w-4 h-4" /> {t.newBtn}
            </button>
          }
        />

        {botPairs.length === 0 ? (
          <div className="card"><EmptyState message={t.noData} icon={Bot} /></div>
        ) : (
          <div className="space-y-3">
            {botPairs.map(pair => (
              <BotPairCard
                key={pair.waBot.id}
                pair={pair}
                isExpanded={expandedPairId === pair.waBot.id}
                sector={sector}
                onToggleExpand={() =>
                  setExpandedPairId(expandedPairId === pair.waBot.id ? null : pair.waBot.id)
                }
                onEdit={() => setFormModal({ open: true, editId: pair.waBot.id })}
                onDelete={() => setDeleteId(pair.waBot.id)}
                onPublishToggle={() => handlePublishToggle(pair)}
                onTest={() => router.push(`/pme/bots/${pair.waBot.id}/test`)}
                onRefresh={fetchBots}
                d={d}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modale création / édition */}
      {mounted && formModal.open && createPortal(
        <BotFormModal
          editId={formModal.editId}
          onClose={() => setFormModal({ open: false, editId: null })}
          onSave={fetchBots}
        />,
        document.body,
      )}

      {/* Modale suppression */}
      <ConfirmDeleteModal
        isOpen={!!deleteId}
        isLoading={isDeleting}
        onClose={() => !isDeleting && setDeleteId(null)}
        onConfirm={handleDelete}
        message={t.confirmDelete}
      />
    </>
  );
}