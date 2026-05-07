// src/app/(dashboard)/layout.tsx
"use client";

import { useSector } from "@/hooks/useSector";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

// ── Shell sectorisé ───────────────────────────────────────────────────────────
// "use client" requis car useSector() lit NEXT_PUBLIC_SECTOR côté client
// AuthProvider + LanguageProvider sont déjà dans app/layout.tsx (root)

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useSector();

  return (
    <div
      className="flex min-h-screen"
      style={{
        // CSS variables sectorielles — disponibles pour tous les enfants
        "--color-primary": theme.primary,
        "--color-accent":  theme.accent,
        "--color-bg":      theme.bg,
        backgroundColor:   theme.bg,
      } as React.CSSProperties}
    >
      {/* Sidebar — navigation dynamique par features */}
      <Sidebar />

      {/* Zone principale */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header — entreprise + langue + profil */}
        <Header />

        {/* Contenu de la page */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}