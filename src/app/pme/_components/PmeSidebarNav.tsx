"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Bot, CalendarDays, CreditCard, UserCircle,
  HelpCircle, Sun, Moon, Globe, LogOut, BookOpen,
  GraduationCap, Star, AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/components/ui/ThemeProvider";
import { cn, initials } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import type { SectorTheme } from "@/lib/sector-theme";

interface Props {
  sectorTheme: SectorTheme;
  tutorialDone: boolean;
  onClose?: () => void;
}

const getNavItems = (t: ReturnType<typeof useLanguage>["dictionary"]) => [
  { href: ROUTES.dashboard, icon: LayoutDashboard, label: t.nav.dashboard },
  { href: ROUTES.bots, icon: Bot, label: t.nav.bots },
  { href: ROUTES.knowledge, icon: BookOpen, label: t.nav.knowledge },
  { href: ROUTES.appointments, icon: CalendarDays, label: t.nav.appointments },
  { href: ROUTES.billing, icon: CreditCard, label: t.nav.billing },
  { href: ROUTES.profile, icon: UserCircle, label: t.nav.profile },
];

export function PmeSidebarNav({ sectorTheme, tutorialDone, onClose }: Props) {
  const { user, logout } = useAuth();
  const { dictionary: d, locale, setLocale } = useLanguage();
  const { theme: uiTheme, toggle } = useTheme();
  const pathname = usePathname();
  const items = getNavItems(d);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const linkClass = (href: string) => cn(
    "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
    isActive(href)
      ? "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)] font-semibold"
      : "text-[var(--text-sidebar)] hover:bg-[var(--bg)] hover:text-[var(--text)]",
  );

  return (
    <>
      {/* Logo + User */}
      <div className="p-6 border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm"
            style={{ backgroundColor: sectorTheme.primary }}>A</div>
          <div>
            <p className="font-bold text-sm text-[var(--text)]">AGT Platform</p>
            <p className="text-[10px] text-[var(--text-muted)] font-medium">{sectorTheme.label}</p>
          </div>
        </div>
        {user && (
          <div className="mt-4 flex items-center gap-2.5 bg-[var(--bg)] rounded-xl p-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: `${sectorTheme.primary}18`, color: sectorTheme.primary }}>
              {initials(user.name)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[var(--text)] truncate">{user.name}</p>
              <p className="text-[10px] text-[var(--text-muted)] truncate">{user.email}</p>
            </div>
          </div>
        )}
      </div>

      {/* Nav principale */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href} onClick={onClose} className={linkClass(item.href)}>
              <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={active ? 2.5 : 2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--border)] space-y-1">
        {([
          { href: ROUTES.tutorial, icon: GraduationCap, label: d.nav.tutorial, badge: !tutorialDone },
          { href: ROUTES.help, icon: HelpCircle, label: d.nav.help },
          { href: ROUTES.feedback, icon: Star, label: d.nav.feedback },
          { href: ROUTES.bug, icon: AlertTriangle, label: d.nav.bug },
        ] as const).map(({ href, icon: Icon, label, ...rest }) => (
          <Link key={href} href={href} onClick={onClose} className={linkClass(href)}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
            {"badge" in rest && rest.badge && <span className="ml-auto w-2 h-2 rounded-full bg-[#F97316] flex-shrink-0" />}
          </Link>
        ))}

        <div className="border-t border-[var(--border)] my-1" />

        <button onClick={toggle}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-[var(--text-sidebar)] hover:bg-[var(--bg)] transition-colors">
          {uiTheme === "dark" ? <Sun className="w-4 h-4 flex-shrink-0" /> : <Moon className="w-4 h-4 flex-shrink-0" />}
          {uiTheme === "dark" ? d.common.lightMode : d.common.darkMode}
        </button>
        <button onClick={() => setLocale(locale === "fr" ? "en" : "fr")}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-[var(--text-sidebar)] hover:bg-[var(--bg)] transition-colors">
          <Globe className="w-4 h-4 flex-shrink-0" />
          {locale === "fr" ? "English" : "Français"}
        </button>
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {d.common.logout}
        </button>
      </div>
    </>
  );
}