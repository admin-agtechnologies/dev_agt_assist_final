// src/components/layout/Sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, MessageSquare, Users,
  CreditCard, BookOpen, Bot, Settings,
  Sun, Moon, Globe, LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/components/ui/ThemeProvider";
import { useSector } from "@/hooks/useSector";
import { SidebarDynamicNav } from "./SidebarDynamicNav";
import { DASHBOARD_ROUTES } from "./Sidebar.config";
import { cn, initials } from "@/lib/utils";

interface Props {
  onClose?: () => void;
}

export function Sidebar({ onClose }: Props) {
  const { user, logout } = useAuth();
  const { dictionary: d, locale, setLocale } = useLanguage();
  const { theme: uiTheme, toggle } = useTheme();
  const { theme: sectorTheme } = useSector();
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const linkClass = (href: string) =>
    cn(
      "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
      isActive(href)
        ? "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)] font-semibold"
        : "text-[var(--text-sidebar)] hover:bg-[var(--bg)] hover:text-[var(--text)]",
    );

  const STATIC_ITEMS = [
    { href: DASHBOARD_ROUTES.home,          icon: LayoutDashboard, label: d.nav.dashboard },
    // Remplacer les deux lignes concernées par :
    { href: DASHBOARD_ROUTES.conversations, icon: MessageSquare, label: d.nav.conversations },
    { href: DASHBOARD_ROUTES.contacts,      icon: Users,         label: d.nav.contacts },
    { href: DASHBOARD_ROUTES.bots,          icon: Bot,             label: d.nav.bots },
    { href: DASHBOARD_ROUTES.knowledge,     icon: BookOpen,        label: d.nav.knowledge },
    { href: DASHBOARD_ROUTES.billing,       icon: CreditCard,      label: d.nav.billing },
    { href: DASHBOARD_ROUTES.settings,      icon: Settings,        label: d.common.settings },
  ];

  return (
    <>
      {/* Logo + Secteur */}
      <div className="p-6 border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm"
            style={{ backgroundColor: sectorTheme.primary }}
          >A</div>
          <div>
            <p className="font-bold text-sm text-[var(--text)]">AGT Platform</p>
            <p className="text-[10px] text-[var(--text-muted)] font-medium">{sectorTheme.label}</p>
          </div>
        </div>

        {/* User card */}
        {user && (
          <div className="mt-4 flex items-center gap-2.5 bg-[var(--bg)] rounded-xl p-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: `${sectorTheme.primary}18`, color: sectorTheme.primary }}
            >{initials(user.name)}</div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[var(--text)] truncate">{user.name}</p>
              <p className="text-[10px] text-[var(--text-muted)] truncate">{user.email}</p>
            </div>
          </div>
        )}
      </div>

      {/* Nav principale + modules dynamiques */}
      <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
        {STATIC_ITEMS.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href} onClick={onClose} className={linkClass(href)}>
            <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={isActive(href) ? 2.5 : 2} />
            {label}
          </Link>
        ))}

        {/* Séparateur + modules sectoriels */}
        <div className="border-t border-[var(--border)] my-2" />
        <SidebarDynamicNav locale={locale} onClose={onClose} />
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--border)] space-y-0.5">
        <div className="border-t border-[var(--border)] my-1" />
        <button
          onClick={toggle}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-[var(--text-sidebar)] hover:bg-[var(--bg)] transition-colors"
        >
          {uiTheme === "dark"
            ? <Sun className="w-4 h-4 flex-shrink-0" />
            : <Moon className="w-4 h-4 flex-shrink-0" />}
          {uiTheme === "dark" ? d.common.lightMode : d.common.darkMode}
        </button>
        <button
          onClick={() => setLocale(locale === "fr" ? "en" : "fr")}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-[var(--text-sidebar)] hover:bg-[var(--bg)] transition-colors"
        >
          <Globe className="w-4 h-4 flex-shrink-0" />
          {locale === "fr" ? "English" : "Français"}
        </button>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {d.common.logout}
        </button>
      </div>
    </>
  );
}