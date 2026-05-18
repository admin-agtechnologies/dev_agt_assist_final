"use client";

import { useEffect, useState, useCallback } from "react";

interface Feature {
  slug: string;
  nom_fr: string;
  categorie: string;
  entreprise_configure_kb:       boolean;
  bot_lit_kb:                    boolean;
  bot_ecrit_result:              boolean;
  entreprise_peut_ecrire_result: boolean;
}

interface Props { token: string; apiBase: string }

const BOOL_COLS: { field: keyof Feature; label: string; abbr: string }[] = [
  { field: "entreprise_configure_kb",       label: "Entreprise configure KB",   abbr: "KB config"  },
  { field: "bot_lit_kb",                    label: "Bot lit la KB",              abbr: "Bot lit KB" },
  { field: "bot_ecrit_result",              label: "Bot écrit un Result",        abbr: "Bot→Result" },
  { field: "entreprise_peut_ecrire_result", label: "Entreprise édite le Result", abbr: "Ent→Result" },
];

function Toggle({ value, loading, onChange }: { value: boolean; loading: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      disabled={loading}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors
        ${value ? "bg-[#6C3CE1]" : "bg-gray-300"}
        ${loading ? "opacity-50 cursor-wait" : "cursor-pointer hover:opacity-80"}`}
    >
      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform
        ${value ? "translate-x-4" : "translate-x-1"}`} />
    </button>
  );
}

export default function BooleansMatrix({ token, apiBase }: Props) {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading]   = useState(true);
  const [patching, setPatching] = useState<string | null>(null);
  const [error, setError]       = useState("");

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/v1/features/admin/features/`, { headers });
      const data = await res.json();
      setFeatures(data.features ?? []);
    } catch { setError("Impossible de charger les features."); }
    finally { setLoading(false); }
  }, [apiBase]); // eslint-disable-line

  useEffect(() => { load(); }, [load]);

  async function toggle(slug: string, field: keyof Feature, current: boolean) {
    const key = `${slug}.${field}`;
    setPatching(key);
    try {
      await fetch(`${apiBase}/api/v1/features/admin/features/${slug}/`, {
        method: "PATCH", headers,
        body: JSON.stringify({ field, value: !current }),
      });
      setFeatures(prev => prev.map(f => f.slug === slug ? { ...f, [field]: !current } : f));
    } catch { setError(`Erreur mise à jour ${slug}.${String(field)}`); }
    finally { setPatching(null); }
  }

  const grouped = features.reduce<Record<string, Feature[]>>((acc, f) => {
    (acc[f.categorie] = acc[f.categorie] || []).push(f);
    return acc;
  }, {});

  if (loading) return <p className="text-gray-400 text-sm animate-pulse">Chargement…</p>;
  if (error)   return <p className="text-red-500 text-sm">{error}</p>;

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left px-4 py-3 font-medium text-gray-700 w-64">Feature</th>
            {BOOL_COLS.map(c => (
              <th key={String(c.field)} className="px-4 py-3 text-center font-medium text-gray-700 min-w-[120px]">
                <span className="block text-[#6C3CE1] text-xs font-mono font-semibold">{c.abbr}</span>
                <span className="block text-gray-400 text-[11px] font-normal leading-tight">{c.label}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(grouped).map(([cat, feats]) => (
            <>
              <tr key={`cat-${cat}`} className="border-b border-gray-100 bg-[#EDE7F9]/40">
                <td colSpan={5} className="px-4 py-1.5 text-xs font-mono text-[#6C3CE1] uppercase tracking-widest">
                  {cat}
                </td>
              </tr>
              {feats.map(f => (
                <tr key={f.slug} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2.5">
                    <span className="block text-gray-900 text-sm font-medium">{f.nom_fr}</span>
                    <span className="block text-gray-400 text-xs font-mono">{f.slug}</span>
                  </td>
                  {BOOL_COLS.map(c => (
                    <td key={String(c.field)} className="px-4 py-2.5 text-center">
                      <Toggle
                        value={f[c.field] as boolean}
                        loading={patching === `${f.slug}.${String(c.field)}`}
                        onChange={() => toggle(f.slug, c.field, f[c.field] as boolean)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}