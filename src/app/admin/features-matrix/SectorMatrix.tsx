"use client";

import { useEffect, useState, useCallback } from "react";

interface Secteur   { slug: string; label_fr: string }
interface FeatureRow{ slug: string; nom_fr: string; categorie: string }
type Matrix = Record<string, Record<string, { is_default: boolean; is_mandatory: boolean } | undefined>>;

interface Props { token: string; apiBase: string }

function Cell({ active, mandatory, loading, onChange }: {
  active: boolean; mandatory: boolean; loading: boolean; onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      disabled={loading || mandatory}
      title={mandatory ? "Obligatoire — non modifiable" : undefined}
      className={`w-6 h-6 rounded flex items-center justify-center transition-all mx-auto
        ${loading    ? "opacity-40 cursor-wait" : ""}
        ${mandatory  ? "cursor-not-allowed" : "cursor-pointer"}
        ${active
          ? mandatory
            ? "bg-[#2D1B69]/80 border border-[#6C3CE1]"
            : "bg-[#6C3CE1] hover:bg-[#5a30c5]"
          : "bg-white border border-gray-300 hover:border-[#6C3CE1]"
        }`}
    >
      {active && (
        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  );
}

export default function SectorMatrix({ token, apiBase }: Props) {
  const [secteurs, setSecteurs] = useState<Secteur[]>([]);
  const [features, setFeatures] = useState<FeatureRow[]>([]);
  const [matrix, setMatrix]     = useState<Matrix>({});
  const [loading, setLoading]   = useState(true);
  const [patching, setPatching] = useState<string | null>(null);
  const [error, setError]       = useState("");

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${apiBase}/api/v1/features/admin/sector-matrix/`, { headers });
      const data = await res.json();
      setSecteurs(data.secteurs ?? []);
      setFeatures(data.features ?? []);
      setMatrix(data.matrix    ?? {});
    } catch { setError("Impossible de charger la matrice."); }
    finally { setLoading(false); }
  }, [apiBase]); // eslint-disable-line

  useEffect(() => { load(); }, [load]);

  async function toggle(featureSlug: string, secteurSlug: string) {
    const key = `${featureSlug}.${secteurSlug}`;
    setPatching(key);
    try {
      const res  = await fetch(`${apiBase}/api/v1/features/admin/sector-matrix/`, {
        method: "PATCH", headers,
        body: JSON.stringify({ feature_slug: featureSlug, secteur_slug: secteurSlug, action: "toggle" }),
      });
      const data = await res.json();
      setMatrix(prev => {
        const next = { ...prev };
        if (!next[featureSlug]) next[featureSlug] = {};
        if (data.status === "removed") delete next[featureSlug][secteurSlug];
        else next[featureSlug][secteurSlug] = { is_default: data.is_default, is_mandatory: data.is_mandatory };
        return next;
      });
    } catch { setError(`Erreur toggle ${featureSlug}/${secteurSlug}`); }
    finally { setPatching(null); }
  }

  const grouped = features.reduce<Record<string, FeatureRow[]>>((acc, f) => {
    (acc[f.categorie] = acc[f.categorie] || []).push(f);
    return acc;
  }, {});

  if (loading) return <p className="text-gray-400 text-sm animate-pulse">Chargement de la matrice…</p>;
  if (error)   return <p className="text-red-500 text-sm">{error}</p>;

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-card">
      <table className="text-sm" style={{ minWidth: `${200 + secteurs.length * 80}px` }}>
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left px-4 py-3 font-medium text-gray-700 w-52 sticky left-0 bg-gray-50 z-10">
              Feature
            </th>
            {secteurs.map(s => (
              <th key={s.slug} className="px-2 py-3 text-center font-medium text-gray-700 min-w-[80px]">
                <span className="block text-[#6C3CE1] text-xs font-mono font-semibold">{s.slug}</span>
                <span className="block text-gray-400 text-[11px] font-normal leading-tight truncate max-w-[72px] mx-auto">
                  {s.label_fr.split(" ")[0]}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(grouped).map(([cat, feats]) => (
            <>
              <tr key={`cat-${cat}`} className="border-b border-gray-100 bg-[#EDE7F9]/40">
                <td colSpan={secteurs.length + 1}
                    className="px-4 py-1.5 text-xs font-mono text-[#6C3CE1] uppercase tracking-widest sticky left-0">
                  {cat}
                </td>
              </tr>
              {feats.map(f => {
                const rowMatrix = matrix[f.slug] ?? {};
                return (
                  <tr key={f.slug} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2 sticky left-0 bg-white z-10 border-r border-gray-100">
                      <span className="block text-gray-900 text-sm font-medium">{f.nom_fr}</span>
                      <span className="block text-gray-400 text-xs font-mono">{f.slug}</span>
                    </td>
                    {secteurs.map(s => {
                      const sf       = rowMatrix[s.slug];
                      return (
                        <td key={s.slug} className="px-2 py-2 text-center">
                          <Cell
                            active={sf !== undefined}
                            mandatory={sf?.is_mandatory ?? false}
                            loading={patching === `${f.slug}.${s.slug}`}
                            onChange={() => toggle(f.slug, s.slug)}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </>
          ))}
        </tbody>
      </table>

      {/* Légende */}
      <div className="flex items-center gap-6 px-4 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-[#6C3CE1] flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
          Activé
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-[#2D1B69]/80 border border-[#6C3CE1]" />
          Obligatoire
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-white border border-gray-300" />
          Non attribué
        </span>
      </div>
    </div>
  );
}