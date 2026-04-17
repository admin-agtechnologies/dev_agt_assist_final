// src/app/not-found.tsx
"use client";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { ROUTES } from "@/lib/constants";
import { SearchX } from "lucide-react";

export default function NotFound() {
  const { dictionary: d } = useLanguage();
  const t = d.errors;
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center mx-auto mb-6">
          <SearchX className="w-10 h-10 text-[var(--text-muted)]" strokeWidth={1.5} />
        </div>
        <p className="text-6xl font-black text-[var(--border)] mb-4">404</p>
        <h1 className="text-xl font-bold text-[var(--text)] mb-2">{t.notFoundTitle}</h1>
        <p className="text-sm text-[var(--text-muted)] mb-8">{t.notFoundSubtitle}</p>
        <Link href={ROUTES.home} className="btn-primary">
          {t.notFoundBtn}
        </Link>
      </div>
    </div>
  );
}
