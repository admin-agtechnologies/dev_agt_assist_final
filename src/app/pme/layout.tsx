// src/app/pme/layout.tsx
"use client";
import { useState, ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/components/ui/ThemeProvider";
import { cn, initials } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import {
  LayoutDashboard, Bot, CalendarDays, CreditCard,
  UserCircle, HelpCircle, Sun, Moon, Globe, LogOut, Menu, X, RefreshCw,
  BookOpen, GraduationCap, Star, AlertTriangle,
} from "lucide-react";
import { SupportWidgets } from "@/components/SupportWidgets";

const navItems = (t: ReturnType<typeof useLanguage>["dictionary"]) => [
  { href: ROUTES.dashboard, icon: LayoutDashboard, label: t.nav.dashboard },
  { href: ROUTES.bots, icon: Bot, label: t.nav.bots },
  { href: ROUTES.knowledge, icon: BookOpen, label: t.nav.knowledge },
  { href: ROUTES.appointments, icon: CalendarDays, label: t.nav.appointments },
  { href: ROUTES.billing, icon: CreditCard, label: t.nav.billing },
  { href: ROUTES.profile, icon: UserCircle, label: t.nav.profile },
];

export default function PmeLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { dictionary: d, locale, setLocale } = useLanguage();
  const { theme, toggle } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const items = navItems(d);

  const Sidebar = ({ mobile = false }) => (
    <aside className={cn(
      "flex flex-col h-full bg-[var(--bg-sidebar)] border-r border-[var(--border)]",
      mobile ? "w-64" : "w-64 hidden lg:flex"
    )}>
      {/* Logo */}
      <div className="p-6 border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#075E54] flex items-center justify-center text-white font-black text-sm">
            A
          </div>
          <div>
            <p className="font-bold text-sm text-[var(--text)]">AGT Platform</p>
            <p className="text-[10px] text-[var(--text-muted)] font-medium">Espace PME</p>
          </div>
        </div>
        {user && (
          <div className="mt-4 flex items-center gap-2.5 bg-[var(--bg)] rounded-xl p-3">
            <div className="w-8 h-8 rounded-full bg-[#075E54]/10 flex items-center justify-center text-[#075E54] text-xs font-bold flex-shrink-0">
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
        {items.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)] font-semibold"
                  : "text-[var(--text-sidebar)] hover:bg-[var(--bg)] hover:text-[var(--text)]"
              )}>
              <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={active ? 2.5 : 2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--border)] space-y-1">

        {/* Configuration rapide */}
        <button
          onClick={() => { setSidebarOpen(false); router.push(ROUTES.onboarding); }}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-[var(--text-sidebar)] hover:bg-[var(--bg)] transition-colors"
        >
          <RefreshCw className="w-4 h-4 flex-shrink-0" />
          {d.nav.quickSetup}
        </button>

        {/* Tutoriel interface */}
        <Link
          href={ROUTES.tutorial}
          onClick={() => setSidebarOpen(false)}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors",
            pathname === ROUTES.tutorial
              ? "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)] font-semibold"
              : "text-[var(--text-sidebar)] hover:bg-[var(--bg)]"
          )}
        >
          <GraduationCap className="w-4 h-4 flex-shrink-0" />
          {d.nav.tutorial}
        </Link>

        {/* Demander de l'aide */}
        <Link
          href={ROUTES.help}
          onClick={() => setSidebarOpen(false)}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors",
            pathname === ROUTES.help
              ? "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)] font-semibold"
              : "text-[var(--text-sidebar)] hover:bg-[var(--bg)]"
          )}
        >
          <HelpCircle className="w-4 h-4 flex-shrink-0" />
          {d.nav.help}
        </Link>

        {/* Laisser un témoignage */}
        <Link
          href={ROUTES.feedback}
          onClick={() => setSidebarOpen(false)}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors",
            pathname === ROUTES.feedback
              ? "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)] font-semibold"
              : "text-[var(--text-sidebar)] hover:bg-[var(--bg)]"
          )}
        >
          <Star className="w-4 h-4 flex-shrink-0" />
          {d.nav.feedback}
        </Link>

        {/* Signaler un problème */}
        <Link
          href={ROUTES.bug}
          onClick={() => setSidebarOpen(false)}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors",
            pathname === ROUTES.bug
              ? "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)] font-semibold"
              : "text-[var(--text-sidebar)] hover:bg-[var(--bg)]"
          )}
        >
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {d.nav.bug}
        </Link>

        {/* Séparateur */}
        <div className="border-t border-[var(--border)] my-1" />

        {/* Thème */}
        <button onClick={toggle}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-[var(--text-sidebar)] hover:bg-[var(--bg)] transition-colors">
          {theme === "dark"
            ? <Sun className="w-4 h-4 flex-shrink-0" />
            : <Moon className="w-4 h-4 flex-shrink-0" />}
          {theme === "dark" ? "Mode clair" : "Mode sombre"}
        </button>

        {/* Langue */}
        <button onClick={() => setLocale(locale === "fr" ? "en" : "fr")}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-[var(--text-sidebar)] hover:bg-[var(--bg)] transition-colors">
          <Globe className="w-4 h-4 flex-shrink-0" />
          {locale === "fr" ? "English" : "Français"}
        </button>

        {/* Logout */}
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {d.common.logout}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)]">
      <Sidebar />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10"><Sidebar mobile /></div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-card)]">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl hover:bg-[var(--bg)] transition-colors">
            {sidebarOpen
              ? <X className="w-5 h-5 text-[var(--text)]" />
              : <Menu className="w-5 h-5 text-[var(--text)]" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#075E54] flex items-center justify-center text-white font-black text-xs">A</div>
            <span className="font-bold text-sm text-[var(--text)]">AGT Platform</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Widgets support */}
      <SupportWidgets />
    </div>
  );
}