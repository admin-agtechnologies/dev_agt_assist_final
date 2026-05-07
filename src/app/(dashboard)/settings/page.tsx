// src/app/(dashboard)/settings/page.tsx
"use client";

import { useLanguage } from "@/hooks/useLanguage";
import { useSector } from "@/hooks/useSector";
import { useActiveFeatures } from "@/hooks/useFeatures";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectorBadge } from "@/components/sector/SectorBadge";
import { getFeatureLabel } from "@/lib/sector-labels";
import { common as commonFr } from "@/dictionaries/fr/common.fr";
import { common as commonEn } from "@/dictionaries/en/common.en";
import { Zap, Building2, User } from "lucide-react";

export default function SettingsPage() {
  const { lang } = useLanguage();
  const { theme } = useSector();
  const { user } = useAuth();
  const { features, isLoading } = useActiveFeatures();

  const c = lang === "fr" ? commonFr : commonEn;

  const entreprise = user?.entreprise;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader title={c.settings} />

      {/* Infos entreprise */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 size={15} style={{ color: theme.primary }} />
            <h3 className="text-sm font-bold" style={{ color: theme.primary }}>
              {c.profile}
            </h3>
          </div>
          <SectorBadge size="sm" />
        </div>
        <div className="px-5 py-4 grid grid-cols-2 gap-4">
          {[
            { label: c.profile, value: entreprise?.name ?? "—" },
            { label: "Email",   value: user?.email ?? "—" },
            { label: "Slug",    value: entreprise?.slug ?? "—" },
            { label: c.active,  value: entreprise?.is_active ? c.active : c.inactive },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-gray-400 mb-0.5">{label}</p>
              <p className="text-sm font-medium text-gray-800 truncate">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features actives */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Zap size={15} style={{ color: theme.accent }} />
          <h3 className="text-sm font-bold" style={{ color: theme.primary }}>
            {lang === "fr" ? "Modules actifs" : "Active modules"}
          </h3>
        </div>

        {isLoading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 rounded-lg bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : features.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">{c.noData}</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {features.map((f) => {
              const label = getFeatureLabel(f.slug, lang);
              return (
                <li
                  key={f.slug}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {label.nav}
                    </p>
                    <p className="text-xs text-gray-400">{f.slug}</p>
                  </div>
                  <span
                    className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: f.is_active
                        ? `${theme.primary}15`
                        : "#f3f4f6",
                      color: f.is_active ? theme.primary : "#9ca3af",
                    }}
                  >
                    {f.is_active ? c.active : c.inactive}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Compte utilisateur */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <User size={15} style={{ color: theme.primary }} />
          <h3 className="text-sm font-bold" style={{ color: theme.primary }}>
            {c.profile}
          </h3>
        </div>
        <div className="px-5 py-4 grid grid-cols-2 gap-4">
          {[
            { label: "Nom",   value: user?.name ?? "—" },
            { label: "Email", value: user?.email ?? "—" },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-gray-400 mb-0.5">{label}</p>
              <p className="text-sm font-medium text-gray-800 truncate">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}