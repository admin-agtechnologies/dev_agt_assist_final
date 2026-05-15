// src/components/layout/Sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users,
  CreditCard, BookOpen, Bot,
  Sun, Moon, Globe, LogOut,
  HelpCircle, MessageCircle, Star, AlertTriangle,
  UserCircle, LayoutGrid, Lock,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/components/ui/ThemeProvider";
import { useSector } from "@/hooks/useSector";
import { DASHBOARD_ROUTES } from "./Sidebar.config";
import { cn, initials } from "@/lib/utils";

// Routes inaccessibles sans abonnement actif.
// Aligné sur FREE_PLAN_ALLOWED_PAGES dans apps/onboarding/engine.py :
//   autorisées : billing, tutorial, profile, help
//   tout le reste est verrouillé.
const ACTIVE_ONLY_ROUTES = new Set([
  "/",
  "/contacts",
  "/bots",
  "/knowledge",
  "/modules",
  "/feedback",
  "/report",
]);

interface Props {
  onClose?: () => void;
}

export function Sidebar({ onClose }: Props) {
  const { user, logout }                   = useAuth();
  const { dictionary: d, locale, setLocale } = useLanguage();
  const { theme: uiTheme, toggle }         = useTheme();
  const { theme: sectorTheme }             = useSector();
  const pathname                           = usePathname();

  const isSubscriptionActive =
    user?.onboarding?.abonnement_statut === "actif";

  const isLocked = (href: string): boolean =>
    !isSubscriptionActive && ACTIVE_ONLY_ROUTES.has(href);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const linkClass = (href: string) =>
    cn(
      "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
      isActive(href)
        ? "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)] font-semibold"
        : "text-[var(--text-sidebar)] hover:bg-[var(--bg)] hover:text-[var(--text)]",
    );

  const lockedClass = cn(
    "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium",
    "text-[var(--text-muted)] opacity-40 cursor-not-allowed select-none",
  );

  const STATIC_ITEMS = [
    { href: DASHBOARD_ROUTES.home,      icon: LayoutDashboard, label: d.nav.dashboard },
    { href: DASHBOARD_ROUTES.contacts,  icon: Users,           label: locale === "fr" ? "Mes Clients" : "My Clients" },
    { href: DASHBOARD_ROUTES.bots,      icon: Bot,             label: d.nav.bots },
    { href: DASHBOARD_ROUTES.knowledge, icon: BookOpen,        label: d.nav.knowledge },
    { href: DASHBOARD_ROUTES.billing,   icon: CreditCard,      label: d.nav.billing },
    { href: DASHBOARD_ROUTES.profile,   icon: UserCircle,      label: d.nav.profile },
  ];

  const SUPPORT_ITEMS = [
    { href: DASHBOARD_ROUTES.tutorial, icon: HelpCircle,    label: locale === "fr" ? "Tutoriel interface" : "Interface tutorial" },
    { href: DASHBOARD_ROUTES.help,     icon: MessageCircle, label: locale === "fr" ? "Demander de l'aide" : "Get help" },
    { href: DASHBOARD_ROUTES.feedback, icon: Star,          label: locale === "fr" ? "Laisser un témoignage" : "Leave a review" },
    { href: DASHBOARD_ROUTES.report,   icon: AlertTriangle, label: locale === "fr" ? "Signaler un problème" : "Report an issue" },
  ];

  const renderNavItem = (href: string, Icon: React.ElementType, label: string) => {
    if (isLocked(href)) {
      return (
        <span
          key={href}
          className={lockedClass}
          title={locale === "fr" ? "Abonnement actif requis" : "Active subscription required"}
        >
          <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
          <span className="flex-1 truncate">{label}</span>
          <Lock className="w-3 h-3 flex-shrink-0" />
        </span>
      );
    }
    return (
      <Link key={href} href={href} onClick={onClose} className={linkClass(href)}>
        <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={isActive(href) ? 2.5 : 2} />
        {label}
      </Link>
    );
  };

  return (
    <aside className="flex flex-col h-screen w-64 shrink-0 bg-[var(--bg-sidebar)] border-r border-[var(--border)] overflow-hidden">

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

      {/* Nav principale */}
      <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
        {STATIC_ITEMS.map(({ href, icon: Icon, label }) =>
          renderNavItem(href, Icon, label),
        )}

        {/* Séparateur + modules sectoriels */}
        <div className="border-t border-[var(--border)] my-2" />
        {renderNavItem("/modules", LayoutGrid, locale === "fr" ? "Mes modules" : "My modules")}

        {/* Séparateur + support */}
        <div className="border-t border-[var(--border)] my-2" />
        {SUPPORT_ITEMS.map(({ href, icon: Icon, label }) =>
          renderNavItem(href, Icon, label),
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--border)] space-y-0.5">
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
    </aside>
  );
}