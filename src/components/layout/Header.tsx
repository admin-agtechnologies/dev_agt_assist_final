// src/components/layout/Header.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, User, Globe } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { useSector } from "@/hooks/useSector";
import { ROUTES } from "@/lib/constants";
import { common as commonFr } from "@/dictionaries/fr/common.fr";
import { common as commonEn } from "@/dictionaries/en/common.en";

// ── LangSwitcher ─────────────────────────────────────────────────────────────
function LangSwitcher() {
  const { lang, setLang } = useLanguage();
  const common = lang === "fr" ? commonFr : commonEn;

  return (
    <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1">
      <button
        onClick={() => setLang("fr")}
        className={[
          "px-2 py-0.5 rounded text-xs font-medium transition-colors",
          lang === "fr"
            ? "bg-gray-900 text-white"
            : "text-gray-500 hover:text-gray-800",
        ].join(" ")}
      >
        {common.fr}
      </button>
      <button
        onClick={() => setLang("en")}
        className={[
          "px-2 py-0.5 rounded text-xs font-medium transition-colors",
          lang === "en"
            ? "bg-gray-900 text-white"
            : "text-gray-500 hover:text-gray-800",
        ].join(" ")}
      >
        {common.en}
      </button>
    </div>
  );
}

// ── ProfileMenu ───────────────────────────────────────────────────────────────
function ProfileMenu() {
  const { user, logout } = useAuth();
  const { lang } = useLanguage();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const common = lang === "fr" ? commonFr : commonEn;

  // Fermer si clic extérieur
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
  };

  const handleProfile = () => {
    setOpen(false);
    router.push(ROUTES.profile);
  };

  const displayName = user?.entreprise?.name ?? user?.name ?? "—";
  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
      >
        {/* Avatar initiales */}
        <span className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-700">
          {initials || <User size={14} />}
        </span>
        <span className="text-sm font-medium text-gray-700 max-w-[140px] truncate hidden sm:block">
          {displayName}
        </span>
        <ChevronDown
          size={14}
          className={[
            "text-gray-400 transition-transform",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
          <button
            onClick={handleProfile}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <User size={15} className="text-gray-400" />
            {common.profile}
          </button>
          <div className="h-px bg-gray-100 my-1" />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={15} className="text-red-400" />
            {common.logout}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Header principal ──────────────────────────────────────────────────────────
export function Header() {
  const { user } = useAuth();
  const { theme } = useSector();
  const { lang } = useLanguage();
  const common = lang === "fr" ? commonFr : commonEn;

  const entrepriseName = user?.entreprise?.name ?? common.espacePME;

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-100">
      {/* Nom de l'entreprise */}
      <div className="flex items-center gap-2">
        <Globe size={16} style={{ color: theme.accent }} />
        <span
          className="text-sm font-semibold truncate max-w-[200px]"
          style={{ color: theme.primary }}
        >
          {entrepriseName}
        </span>
      </div>

      {/* Actions droite */}
      <div className="flex items-center gap-3">
        <LangSwitcher />
        <ProfileMenu />
      </div>
    </header>
  );
}