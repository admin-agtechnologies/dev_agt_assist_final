// src/app/(dashboard)/billing/_components/TopUpModal.tsx
// Migration de src/app/pme/billing/components/TopUpModal.tsx
// Adaptation : useLanguage hook + import direct fr/en
"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import {
  X, QrCode, Smartphone, CheckCircle2,
  Loader2, ShieldCheck, Info, ArrowRight,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/components/ui/Toast";
import { billingActionsRepository } from "@/repositories/commandes.repository";
import { fr } from "@/dictionaries/fr";
import { en } from "@/dictionaries/en";
import type { Wallet as WalletType } from "@/types/api";

interface TopUpModalProps {
  wallet: WalletType;
  onClose: () => void;
  onSuccess: () => void;
  setPollingTxnId: (id: string) => void;
}

interface ApplyCodeResult {
  detail: string;
  montant: string;
  devise: string;
  nouveau_solde: string;
}

type Tab = "code" | "mobile";
const AGT_WHATSAPP = "https://wa.me/237600000000";

export function TopUpModal({ wallet, onClose, onSuccess }: TopUpModalProps) {
  const { lang } = useLanguage();
  const d = lang === "fr" ? fr : en;
  const t = d.billing;
  const toast = useToast();

  const [tab, setTab]       = useState<Tab>("code");
  const [code, setCode]     = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<ApplyCodeResult | null>(null);

  const handleApplyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setSaving(true);
    try {
      const res = await billingActionsRepository.applyCode(code.trim().toUpperCase());
      setSuccess(res as ApplyCodeResult);
      toast.success((res as ApplyCodeResult).detail);
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : d.common.error);
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-[var(--bg-card)] rounded-2xl shadow-2xl border border-[var(--border)] overflow-hidden animate-fade-in">

        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)]">
          <div>
            <h2 className="text-lg font-black text-[var(--text)]">{t.topUpModalTitle}</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {t.topUpCurrentBalance}{" "}
              <span className="font-bold text-[#075E54]">{formatCurrency(wallet.solde)} {wallet.devise}</span>
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--bg)] transition-colors">
            <X className="w-4 h-4 text-[var(--text-muted)]" />
          </button>
        </div>

        <div className="flex border-b border-[var(--border)]">
          {(["code", "mobile"] as Tab[]).map((tabKey) => (
            <button key={tabKey} onClick={() => setTab(tabKey)}
              className={cn("flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors",
                tab === tabKey ? "border-b-2 border-[#075E54] text-[#075E54]" : "text-[var(--text-muted)] hover:text-[var(--text)]")}>
              {tabKey === "code"
                ? <><QrCode className="w-4 h-4" />{t.tabCode}</>
                : <><Smartphone className="w-4 h-4" />{t.tabMobile}</>}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === "code" && (
            <div className="space-y-5">
              {success ? (
                <div className="flex flex-col items-center text-center py-4 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-[#25D366]/10 flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7 text-[#25D366]" />
                  </div>
                  <div>
                    <p className="text-xl font-black text-[#075E54]">+{formatCurrency(Number(success.montant))} {success.devise}</p>
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                      {t.codeSuccessNewBalance}{" "}
                      <span className="font-bold text-[var(--text)]">{formatCurrency(Number(success.nouveau_solde))} {success.devise}</span>
                    </p>
                  </div>
                  <button onClick={onClose} className="btn-primary px-8">{d.common.close}</button>
                </div>
              ) : (
                <form onSubmit={handleApplyCode} className="space-y-5">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-[#075E54]/5 border border-[#075E54]/20">
                    <Info className="w-4 h-4 text-[#075E54] mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-[var(--text-muted)] leading-relaxed space-y-1">
                      <p className="font-semibold text-[var(--text)]">{t.codeHowToTitle}</p>
                      <p>{t.codeHowToDesc}</p>
                      <a href={AGT_WHATSAPP} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#075E54] font-semibold hover:underline mt-1">
                        {t.codeContactBtn} <ArrowRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[var(--text)]">{t.codeLabel}</label>
                    <input type="text" className="input-base w-full font-mono text-lg tracking-widest uppercase text-center"
                      placeholder={t.codePlaceholder} value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      maxLength={20} autoFocus required />
                    <p className="text-[11px] text-[var(--text-muted)] text-center">{t.codeHint}</p>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                    <ShieldCheck className="w-4 h-4 text-[#25D366] mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">{t.codeSecurityMsg}</p>
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={onClose} className="btn-ghost flex-1">{d.common.cancel}</button>
                    <button type="submit" disabled={saving || code.trim().length < 4}
                      className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
                      {saving ? <><Loader2 className="w-4 h-4 animate-spin" />{t.codeVerifying}</>
                               : <><CheckCircle2 className="w-4 h-4" />{t.codeApplyBtn}</>}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {tab === "mobile" && (
            <div className="space-y-5">
              <div className="flex flex-col items-center text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                  <Smartphone className="w-7 h-7 text-amber-600" />
                </div>
                <div>
                  <p className="text-base font-black text-[var(--text)]">{t.mobileSoonTitle}</p>
                  <p className="text-sm text-[var(--text-muted)] mt-1 max-w-xs">{t.mobileSoonDesc}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full mt-2">
                  {[{ label: t.operatorOrange, color: "#FF6600" }, { label: t.operatorMtn, color: "#FFCC00" }].map((op) => (
                    <div key={op.label} className="flex items-center justify-center gap-2 p-4 rounded-xl border border-[var(--border)] opacity-40 cursor-not-allowed">
                      <Smartphone className="w-5 h-5" style={{ color: op.color }} />
                      <span className="text-sm font-semibold text-[var(--text-muted)]">{op.label}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  {t.mobileSoonRedirect}{" "}
                  <button onClick={() => setTab("code")} className="text-[#075E54] font-semibold hover:underline">
                    {t.mobileSoonRedirectLink}
                  </button>
                </p>
              </div>
              <button onClick={onClose} className="btn-ghost w-full">{d.common.close}</button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}