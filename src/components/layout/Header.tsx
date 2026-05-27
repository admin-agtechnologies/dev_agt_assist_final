// src/components/layout/Header.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, User } from "lucide-react";
import { useAuth }     from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext"; // ← CORRECT : même contexte que la Sidebar
import { useTheme }    from "@/components/ui/ThemeProvider";
import { useSector }   from "@/hooks/useSector";
import { ROUTES }      from "@/lib/constants";
import { initials }    from "@/lib/utils";

// ── LangSwitcher ──────────────────────────────────────────────────────────────
// Utilise setLocale du LanguageContext — même état que la Sidebar → changement
// instantané et global dans toute l'app.
function LangSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="flex items-center gap-0.5 border border-[var(--border)] rounded-lg p-1 bg-[var(--bg-sidebar)]">
      <button
        onClick={() => setLocale("fr")}
        className={[
          "px-2.5 py-0.5 rounded text-xs font-bold transition-all",
          locale === "fr"
            ? "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)]"
            : "text-[var(--text-muted)] hover:text-[var(--text)]",
        ].join(" ")}
      >
        FR
      </button>
      <button
        onClick={() => setLocale("en")}
        className={[
          "px-2.5 py-0.5 rounded text-xs font-bold transition-all",
          locale === "en"
            ? "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)]"
            : "text-[var(--text-muted)] hover:text-[var(--text)]",
        ].join(" ")}
      >
        EN
      </button>
    </div>
  );
}

// ── ThemeSwitcher ─────────────────────────────────────────────────────────────
// Même toggle que la Sidebar — cohérence totale.
function ThemeSwitcher() {
  const { theme, toggle } = useTheme();
  const { dictionary: d } = useLanguage();

  return (
    <button
      onClick={toggle}
      title={theme === "dark" ? d.common.lightMode : d.common.darkMode}
      className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg)] hover:text-[var(--text)] transition-all"
    >
      {theme === "dark" ? (
        // Icône soleil inline — évite import supplémentaire
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
        </svg>
      )}
    </button>
  );
}

// ── ProfileMenu ───────────────────────────────────────────────────────────────
// Toutes les couleurs via CSS vars — s'adapte automatiquement light/dark
// et aux couleurs sectorielles via sectorTheme.primary.
function ProfileMenu() {
  const { user, logout }  = useAuth();
  const { dictionary: d } = useLanguage();
  const { theme: sectorTheme } = useSector();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const displayName = user?.entreprise?.name ?? user?.name ?? "—";
  const userInitials = initials(user?.name ?? "");

  const handleLogout = async () => { setOpen(false); await logout(); };
  const handleProfile = () => { setOpen(false); router.push(ROUTES.profile); };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[var(--bg)] transition-colors"
      >
        {/* Avatar couleur sectorielle — cohérent avec la sidebar */}
        <span
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
          style={{ backgroundColor: sectorTheme.primary }}
        >
          {userInitials || <User size={13} />}
        </span>
        <span className="text-sm font-medium text-[var(--text)] max-w-[140px] truncate hidden sm:block">
          {displayName}
        </span>
        <ChevronDown
          size={14}
          className={["text-[var(--text-muted)] transition-transform duration-200", open ? "rotate-180" : ""].join(" ")}
        />
      </button>

      {/* Dropdown — mêmes variables que sidebar */}
      {open && (
        <div className="absolute right-0 mt-1 w-48 bg-[var(--bg-sidebar)] rounded-xl shadow-lg border border-[var(--border)] py-1 z-50">
          <button
            onClick={handleProfile}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-[var(--text)] hover:bg-[var(--bg)] transition-colors"
          >
            <User size={15} className="text-[var(--text-muted)] flex-shrink-0" />
            {d.common.profile}
          </button>
          <div className="h-px bg-[var(--border)] my-1" />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={15} className="text-red-400 flex-shrink-0" />
            {d.common.logout}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Header principal ──────────────────────────────────────────────────────────
// bg-[var(--bg-sidebar)] : même fond que la sidebar → cohérence visuelle
// border-[var(--border)]  : s'adapte au thème light/dark automatiquement
export function Header() {
  const { user } = useAuth();
  const { theme: sectorTheme } = useSector();
  const { dictionary: d, locale } = useLanguage();

  const entrepriseName = user?.entreprise?.name ?? d.common.espacePME;

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-[var(--bg-sidebar)] border-b border-[var(--border)] flex-shrink-0">

      {/* Nom entreprise + indicateur secteur */}
      <div className="flex items-center gap-2 min-w-0">
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: sectorTheme.accent }}
        />
        <span
          className="text-sm font-semibold truncate max-w-[220px]"
          style={{ color: sectorTheme.primary }}
        >
          {entrepriseName}
        </span>
        <span className="text-xs text-[var(--text-muted)] hidden md:block flex-shrink-0">
          — {sectorTheme.label}
        </span>
      </div>

      {/* Actions droite */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <ThemeSwitcher />
        <div className="w-px h-5 bg-[var(--border)]" />
        <LangSwitcher />
        <div className="w-px h-5 bg-[var(--border)]" />
        <ProfileMenu />
      </div>
    </header>
  );
}