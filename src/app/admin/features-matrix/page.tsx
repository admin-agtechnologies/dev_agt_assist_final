"use client";

import { useState } from "react";
import BooleansMatrix from "./BooleansMatrix";
import SectorMatrix from "./SectorMatrix";

export const DEV_TOKEN = process.env.NEXT_PUBLIC_DEV_TOKEN ?? "";
export const API_BASE  = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8011";

type Tab = "booleans" | "sectors";

export default function FeaturesMatrixPage() {
  const [tab, setTab]           = useState<Tab>("booleans");
  const [unlocked, setUnlocked] = useState(DEV_TOKEN === "");
  const [input, setInput]       = useState("");
  const [error, setError]       = useState("");

  function handleUnlock() {
    if (input === DEV_TOKEN) { setUnlocked(true); setError(""); }
    else setError("Token invalide.");
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-sm shadow-card">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-xs font-mono text-red-500 uppercase tracking-widest">DEV ONLY</span>
          </div>
          <h1 className="text-gray-900 text-xl font-semibold mb-1">Features Matrix</h1>
          <p className="text-gray-500 text-sm mb-6">Interface d'administration temporaire B5.</p>
          <input
            type="password"
            placeholder="DEV_ADMIN_TOKEN"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleUnlock()}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm
                       text-gray-900 placeholder-gray-400 outline-none mb-3
                       focus:border-[#6C3CE1] focus:ring-1 focus:ring-[#6C3CE1]"
          />
          {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
          <button
            onClick={handleUnlock}
            className="w-full bg-[#6C3CE1] hover:bg-[#5a30c5] text-white text-sm
                       font-medium py-2.5 rounded-lg transition-colors"
          >
            Accéder
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Bandeau DEV */}
      <div className="bg-red-50 border-b border-red-200 px-6 py-2 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-red-400" />
        <span className="text-xs font-mono text-red-500">
          [DEV] Interface temporaire — À retirer après livraison B6
        </span>
      </div>

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <h1 className="text-gray-900 text-xl font-semibold">Features Matrix</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Configuration des 29 features B5 — booléens KB/Result et attribution sectorielle
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6 flex gap-1">
        {(["booleans", "sectors"] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? "border-[#6C3CE1] text-[#6C3CE1]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            {t === "booleans" ? "Booléens KB / Result" : "Attribution secteurs"}
          </button>
        ))}
      </div>

      {/* Contenu */}
      <div className="p-6">
        {tab === "booleans"
          ? <BooleansMatrix token={DEV_TOKEN} apiBase={API_BASE} />
          : <SectorMatrix   token={DEV_TOKEN} apiBase={API_BASE} />
        }
      </div>
    </div>
  );
}