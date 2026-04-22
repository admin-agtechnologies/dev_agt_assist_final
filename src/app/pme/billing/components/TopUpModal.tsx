"use client";
import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Smartphone, Wallet, Send } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/Toast";
import { Spinner } from "@/components/ui";
import { billingRepository } from "@/repositories";
import type { Wallet as WalletType } from "@/types/api";

interface TopUpModalProps {
  wallet: WalletType;
  tenantId: string;
  onClose: () => void;
  onSuccess: () => void;
  setPollingTxnId: (id: string) => void;
}

export function TopUpModal({
  wallet,
  tenantId,
  onClose,
  onSuccess,
  setPollingTxnId,
}: TopUpModalProps) {
  const { dictionary: d } = useLanguage();
  const t = d.billing;
  const toast = useToast();
  const [operator, setOperator] = useState<"orange" | "mtn">("orange");
  const [amount, setAmount] = useState<number>(10000);
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const txn = (await billingRepository.initiateRecharge(wallet.id, {
        amount,
        service_paiement_id: operator === "orange" ? "ID_ORANGE" : "ID_MTN",
        phone: phone,
        idempotency_key: crypto.randomUUID(),
      })) as any;

      onClose();
      setPollingTxnId(txn.id);
      toast.info("Validation en cours...");
    } catch {
      toast.error("Erreur lors de l'initiation");
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div
        className="absolute inset-0"
        onClick={!saving ? onClose : undefined}
      />
      <form
        onSubmit={handleSubmit}
        className="relative bg-[var(--bg-card)] rounded-3xl w-full max-w-md shadow-2xl border border-[var(--border)] animate-zoom-in"
      >
        <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
          <h2 className="text-lg font-bold text-[var(--text)]">
            {t.topUpTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--bg)] flex items-center justify-center text-[var(--text-muted)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          {/* Ton code JSX actuel pour la recharge ici */}
          <div>
            <label className="label-base">{t.topUpOperator}</label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {(["orange", "mtn"] as const).map((op) => (
                <button
                  key={op}
                  type="button"
                  onClick={() => setOperator(op)}
                  className={cn(
                    "p-4 rounded-2xl border-2",
                    operator === op
                      ? "border-[#075E54]"
                      : "border-[var(--border)]",
                  )}
                >
                  {op === "orange" ? t.operatorOrange : t.operatorMtn}
                </button>
              ))}
            </div>
          </div>
          {/* ... reste du formulaire ... */}
        </div>
        <div className="p-5 border-t border-[var(--border)] flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-ghost">
            Annuler
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <Spinner /> : "Recharger"}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}
