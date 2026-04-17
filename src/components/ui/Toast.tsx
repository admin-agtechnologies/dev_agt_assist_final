"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { createPortal } from "react-dom";
import { TOAST_DURATION } from "@/lib/constants";

type ToastType = "success" | "error" | "info" | "warning";
interface ToastItem { id: string; message: string; type: ToastType; }
interface ToastContextType {
  toast: {
    success: (m: string) => void;
    error: (m: string) => void;
    info: (m: string) => void;
    warning: (m: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | null>(null);

const icons: Record<ToastType, string> = { success: "✅", error: "❌", info: "ℹ️", warning: "⚠️" };
const colors: Record<ToastType, string> = {
  success: "border-l-4 border-[#25D366] bg-[var(--bg-card)]",
  error: "border-l-4 border-red-500 bg-[var(--bg-card)]",
  info: "border-l-4 border-[#6C3CE1] bg-[var(--bg-card)]",
  warning: "border-l-4 border-amber-400 bg-[var(--bg-card)]",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  // ── Clé du fix hydration : monter le portal uniquement côté client ──
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const add = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), TOAST_DURATION);
  }, []);

  const toast = {
    success: (m: string) => add(m, "success"),
    error: (m: string) => add(m, "error"),
    info: (m: string) => add(m, "info"),
    warning: (m: string) => add(m, "warning"),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Portal monté uniquement après hydration client */}
      {mounted && createPortal(
        <div className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-2 w-80">
          {toasts.map(t => (
            <div key={t.id}
              className={`${colors[t.type]} rounded-xl px-4 py-3 shadow-lg flex items-start gap-3 animate-slide-up border border-[var(--border)]`}>
              <span>{icons[t.type]}</span>
              <p className="text-sm text-[var(--text)] font-medium leading-snug">{t.message}</p>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be inside ToastProvider");
  return ctx.toast;
}