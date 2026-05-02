// src/app/pme/tutorial/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { tutorialRepository } from "@/repositories";
import {
  LayoutDashboard, Bot, BookOpen, CalendarDays,
  CreditCard, PlayCircle, ChevronRight, ChevronLeft,
  CheckCircle, X, Zap, ArrowRight, Briefcase,
  UserCircle, HelpCircle, Star, AlertTriangle,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

interface TutorialStep {
  key: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  route: string;
  illustration: React.ReactNode;
}

interface TutorialTab {
  key: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  steps: TutorialStep[];
}

// ── Helpers progression globale ────────────────────────────────────────────────

function toGlobalStep(tabIdx: number, stepIdx: number): number {
  let global = 0;
  for (let i = 0; i < tabIdx; i++) global += TABS[i].steps.length;
  return global + stepIdx;
}

function fromGlobalStep(globalStep: number): { tabIdx: number; stepIdx: number } {
  let remaining = globalStep;
  for (let i = 0; i < TABS.length; i++) {
    if (remaining < TABS[i].steps.length) return { tabIdx: i, stepIdx: remaining };
    remaining -= TABS[i].steps.length;
  }
  return { tabIdx: TABS.length - 1, stepIdx: TABS[TABS.length - 1].steps.length - 1 };
}

// ── Données ────────────────────────────────────────────────────────────────────

const TABS: TutorialTab[] = [
  {
    key: "essentials",
    icon: <Zap className="w-4 h-4" />,
    color: "#075E54",
    bg: "from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950",
    steps: [
      {
        key: "dashboard",
        icon: <LayoutDashboard className="w-6 h-6" />,
        color: "#075E54",
        bg: "from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950",
        route: ROUTES.dashboard,
        illustration: <DashboardIllustration />,
      },
      {
        key: "bots",
        icon: <Bot className="w-6 h-6" />,
        color: "#6C3CE1",
        bg: "from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950",
        route: ROUTES.bots,
        illustration: <BotsIllustration />,
      },
      {
        key: "knowledge",
        icon: <BookOpen className="w-6 h-6" />,
        color: "#0EA5E9",
        bg: "from-sky-50 to-blue-50 dark:from-sky-950 dark:to-blue-950",
        route: ROUTES.knowledge,
        illustration: <KnowledgeIllustration />,
      },
    ],
  },
  {
    key: "management",
    icon: <Briefcase className="w-4 h-4" />,
    color: "#F97316",
    bg: "from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950",
    steps: [
      {
        key: "appointments",
        icon: <CalendarDays className="w-6 h-6" />,
        color: "#F97316",
        bg: "from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950",
        route: ROUTES.appointments,
        illustration: <AppointmentsIllustration />,
      },
      {
        key: "services",
        icon: <Briefcase className="w-6 h-6" />,
        color: "#D97706",
        bg: "from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950",
        route: ROUTES.services,
        illustration: <ServicesIllustration />,
      },
      {
        key: "billing",
        icon: <CreditCard className="w-6 h-6" />,
        color: "#059669",
        bg: "from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950",
        route: ROUTES.billing,
        illustration: <BillingIllustration />,
      },
    ],
  },
  {
    key: "personalization",
    icon: <UserCircle className="w-4 h-4" />,
    color: "#EC4899",
    bg: "from-pink-50 to-rose-50 dark:from-pink-950 dark:to-rose-950",
    steps: [
      {
        key: "profile",
        icon: <UserCircle className="w-6 h-6" />,
        color: "#EC4899",
        bg: "from-pink-50 to-rose-50 dark:from-pink-950 dark:to-rose-950",
        route: ROUTES.profile,
        illustration: <ProfileIllustration />,
      },
      {
        key: "test",
        icon: <PlayCircle className="w-6 h-6" />,
        color: "#8B5CF6",
        bg: "from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950",
        route: ROUTES.bots,
        illustration: <TestIllustration />,
      },
    ],
  },
  {
    key: "support",
    icon: <HelpCircle className="w-4 h-4" />,
    color: "#0EA5E9",
    bg: "from-sky-50 to-blue-50 dark:from-sky-950 dark:to-blue-950",
    steps: [
      {
        key: "help",
        icon: <HelpCircle className="w-6 h-6" />,
        color: "#0EA5E9",
        bg: "from-sky-50 to-blue-50 dark:from-sky-950 dark:to-blue-950",
        route: ROUTES.help,
        illustration: <HelpIllustration />,
      },
      {
        key: "feedback",
        icon: <Star className="w-6 h-6" />,
        color: "#F59E0B",
        bg: "from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950",
        route: ROUTES.feedback,
        illustration: <FeedbackIllustration />,
      },
      {
        key: "bug",
        icon: <AlertTriangle className="w-6 h-6" />,
        color: "#EF4444",
        bg: "from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950",
        route: ROUTES.bug,
        illustration: <BugIllustration />,
      },
    ],
  },
];

// ── Illustrations SVG ──────────────────────────────────────────────────────────

function DashboardIllustration() {
  return (
    <svg viewBox="0 0 320 200" className="w-full h-full" fill="none">
      <rect x="10" y="10" width="300" height="180" rx="16" fill="var(--bg-card)" stroke="var(--border)" strokeWidth="1.5" />
      {[0, 1, 2, 3].map(i => (
        <g key={i}>
          <rect x={18 + i * 72} y="22" width="64" height="44" rx="10"
            fill={["#25D366", "#6C3CE1", "#F97316", "#0EA5E9"][i] + "15"}
            stroke={["#25D366", "#6C3CE1", "#F97316", "#0EA5E9"][i] + "40"} strokeWidth="1" />
          <rect x={28 + i * 72} y="32" width="24" height="4" rx="2"
            fill={["#25D366", "#6C3CE1", "#F97316", "#0EA5E9"][i]} opacity="0.6" />
          <rect x={28 + i * 72} y="42" width="36" height="6" rx="3"
            fill={["#25D366", "#6C3CE1", "#F97316", "#0EA5E9"][i]} opacity="0.9" />
          <rect x={28 + i * 72} y="52" width="20" height="3" rx="1.5" fill="var(--border)" />
        </g>
      ))}
      <rect x="18" y="76" width="190" height="80" rx="10" fill="var(--bg)" stroke="var(--border)" strokeWidth="1" />
      <polyline points="28,140 55,120 82,130 109,105 136,115 163,95 190,100"
        stroke="#25D366" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="28,140 55,120 82,130 109,105 136,115 163,95 190,100 190,156 28,156"
        fill="#25D366" opacity="0.08" />
      <rect x="216" y="76" width="84" height="80" rx="10" fill="var(--bg)" stroke="var(--border)" strokeWidth="1" />
      {[0, 1, 2].map(i => (
        <g key={i}>
          <circle cx="228" cy={91 + i * 22} r="7" fill="#075E54" opacity="0.2" />
          <rect x="240" y={87 + i * 22} width="44" height="4" rx="2" fill="var(--border)" />
          <rect x="240" y={95 + i * 22} width="30" height="3" rx="1.5" fill="var(--border)" opacity="0.5" />
        </g>
      ))}
      <rect x="18" y="164" width="284" height="16" rx="6" fill="var(--bg)" stroke="var(--border)" strokeWidth="1" />
      <rect x="24" y="168" width="60" height="8" rx="3" fill="#25D366" opacity="0.3" />
      <rect x="90" y="168" width="40" height="8" rx="3" fill="#6C3CE1" opacity="0.3" />
      <rect x="136" y="168" width="50" height="8" rx="3" fill="#F97316" opacity="0.3" />
    </svg>
  );
}

function BotsIllustration() {
  return (
    <svg viewBox="0 0 320 200" className="w-full h-full" fill="none">
      <rect x="10" y="10" width="300" height="180" rx="16" fill="var(--bg-card)" stroke="var(--border)" strokeWidth="1.5" />
      <rect x="20" y="20" width="130" height="160" rx="12" fill="#6C3CE1" opacity="0.08" stroke="#6C3CE1" strokeWidth="1" strokeDasharray="4 2" />
      <circle cx="85" cy="60" r="22" fill="#6C3CE1" opacity="0.15" />
      <circle cx="85" cy="60" r="14" fill="#6C3CE1" opacity="0.3" />
      <rect x="77" y="54" width="5" height="7" rx="2.5" fill="#6C3CE1" />
      <rect x="88" y="54" width="5" height="7" rx="2.5" fill="#6C3CE1" />
      <path d="M79 67 Q85 72 91 67" stroke="#6C3CE1" strokeWidth="2" strokeLinecap="round" />
      <rect x="30" y="88" width="110" height="6" rx="3" fill="#6C3CE1" opacity="0.4" />
      <rect x="40" y="100" width="90" height="4" rx="2" fill="var(--border)" />
      <rect x="40" y="110" width="70" height="4" rx="2" fill="var(--border)" opacity="0.6" />
      <rect x="30" y="130" width="50" height="18" rx="9" fill="#25D366" opacity="0.2" />
      <circle cx="43" cy="139" r="4" fill="#25D366" />
      <rect x="51" y="136" width="22" height="6" rx="3" fill="#25D366" opacity="0.6" />
      <rect x="30" y="154" width="110" height="18" rx="9" fill="#6C3CE1" opacity="0.8" />
      <rect x="58" y="159" width="54" height="8" rx="4" fill="white" opacity="0.6" />
      <rect x="160" y="20" width="140" height="160" rx="12" fill="var(--bg)" stroke="var(--border)" strokeWidth="1" />
      <rect x="160" y="20" width="140" height="32" rx="12" fill="#075E54" />
      <rect x="160" y="40" width="140" height="12" rx="0" fill="#075E54" />
      <circle cx="180" cy="36" r="10" fill="white" opacity="0.2" />
      <rect x="196" y="30" width="60" height="6" rx="3" fill="white" opacity="0.6" />
      <rect x="196" y="40" width="40" height="4" rx="2" fill="white" opacity="0.3" />
      <rect x="168" y="62" width="80" height="22" rx="10" fill="var(--bg-card)" stroke="var(--border)" strokeWidth="1" />
      <rect x="220" y="92" width="70" height="22" rx="10" fill="#075E54" opacity="0.8" />
      <rect x="168" y="122" width="90" height="22" rx="10" fill="var(--bg-card)" stroke="var(--border)" strokeWidth="1" />
    </svg>
  );
}

function KnowledgeIllustration() {
  return (
    <svg viewBox="0 0 320 200" className="w-full h-full" fill="none">
      <rect x="10" y="10" width="300" height="180" rx="16" fill="var(--bg-card)" stroke="var(--border)" strokeWidth="1.5" />
      {["Infos", "Agences", "FAQ", "Services"].map((tab, i) => (
        <g key={tab}>
          <rect x={18 + i * 72} y="18" width="64" height="24" rx="8"
            fill={i === 0 ? "#0EA5E9" : "var(--bg)"} opacity={i === 0 ? 0.9 : 1}
            stroke={i === 0 ? "#0EA5E9" : "var(--border)"} strokeWidth="1" />
          <rect x={28 + i * 72} y="26" width={[28, 36, 16, 36][i]} height="8" rx="4"
            fill={i === 0 ? "white" : "var(--border)"} opacity={i === 0 ? 0.8 : 1} />
        </g>
      ))}
      <rect x="18" y="52" width="190" height="130" rx="10" fill="var(--bg)" stroke="var(--border)" strokeWidth="1" />
      {[0, 1, 2, 3].map(i => (
        <g key={i}>
          <rect x="28" y={64 + i * 28} width="60" height="6" rx="3" fill="var(--border)" />
          <rect x="28" y={74 + i * 28} width="170" height="12" rx="6"
            fill="var(--bg-card)" stroke="var(--border)" strokeWidth="1" />
        </g>
      ))}
      <rect x="216" y="52" width="84" height="130" rx="10" fill="#0EA5E9" opacity="0.06" stroke="#0EA5E9" strokeWidth="1" strokeDasharray="4 2" />
      <rect x="226" y="64" width="64" height="8" rx="4" fill="#0EA5E9" opacity="0.4" />
      {[0, 1, 2].map(i => (
        <g key={i}>
          <circle cx="232" cy={84 + i * 22} r="5" fill="#0EA5E9" opacity="0.3" />
          <rect x="242" y={80 + i * 22} width="40" height="4" rx="2" fill="var(--border)" />
          <rect x="242" y={88 + i * 22} width="28" height="3" rx="1.5" fill="var(--border)" opacity="0.5" />
        </g>
      ))}
    </svg>
  );
}

function AppointmentsIllustration() {
  return (
    <svg viewBox="0 0 320 200" className="w-full h-full" fill="none">
      <rect x="10" y="10" width="300" height="180" rx="16" fill="var(--bg-card)" stroke="var(--border)" strokeWidth="1.5" />
      <rect x="18" y="18" width="284" height="30" rx="8" fill="#F97316" opacity="0.1" stroke="#F97316" strokeWidth="1" />
      <rect x="28" y="26" width="80" height="14" rx="7" fill="#F97316" opacity="0.4" />
      <rect x="252" y="26" width="14" height="14" rx="4" fill="#F97316" opacity="0.3" />
      <rect x="270" y="26" width="14" height="14" rx="4" fill="#F97316" opacity="0.3" />
      <rect x="18" y="54" width="284" height="20" rx="0" fill="var(--bg)" />
      {["L", "M", "M", "J", "V", "S", "D"].map((_, i) => (
        <g key={i}>
          <rect x={46 + i * 38} y="58" width="26" height="12" rx="6"
            fill={i === 0 ? "#F97316" : "transparent"} opacity={i === 0 ? 0.2 : 1} />
          <rect x={52 + i * 38} y="61" width="14" height="6" rx="3"
            fill={i === 0 ? "#F97316" : "var(--border)"} opacity={0.6} />
        </g>
      ))}
      {[0, 1, 2, 3].map(row => (
        <rect key={row} x="18" y={78 + row * 28} width="284" height="1" fill="var(--border)" opacity="0.5" />
      ))}
      <rect x="84" y="82" width="34" height="22" rx="5" fill="#25D366" opacity="0.25" stroke="#25D366" strokeWidth="1" />
      <rect x="160" y="82" width="34" height="44" rx="5" fill="#F97316" opacity="0.25" stroke="#F97316" strokeWidth="1" />
      <rect x="46" y="110" width="34" height="22" rx="5" fill="#6C3CE1" opacity="0.25" stroke="#6C3CE1" strokeWidth="1" />
      <rect x="236" y="82" width="34" height="22" rx="5" fill="#0EA5E9" opacity="0.25" stroke="#0EA5E9" strokeWidth="1" />
      <rect x="122" y="110" width="34" height="22" rx="5" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 2" />
      <rect x="130" y="116" width="18" height="4" rx="2" fill="#F59E0B" opacity="0.6" />
      <rect x="18" y="166" width="284" height="16" rx="6" fill="var(--bg)" />
      <circle cx="30" cy="174" r="4" fill="#25D366" opacity="0.5" />
      <rect x="38" y="171" width="30" height="6" rx="3" fill="var(--border)" />
      <circle cx="82" cy="174" r="4" fill="#F59E0B" opacity="0.5" />
      <rect x="90" y="171" width="36" height="6" rx="3" fill="var(--border)" />
    </svg>
  );
}

function ServicesIllustration() {
  return (
    <svg viewBox="0 0 320 200" className="w-full h-full" fill="none">
      <rect x="10" y="10" width="300" height="180" rx="16" fill="var(--bg-card)" stroke="var(--border)" strokeWidth="1.5" />
      {[0, 1, 2].map(i => (
        <g key={i}>
          <rect x={18 + i * 98} y="20" width="88" height="90" rx="12"
            fill={["#D97706", "#059669", "#6C3CE1"][i] + "10"}
            stroke={["#D97706", "#059669", "#6C3CE1"][i] + "40"} strokeWidth="1" />
          <rect x={28 + i * 98} y="30" width="48" height="6" rx="3"
            fill={["#D97706", "#059669", "#6C3CE1"][i]} opacity="0.6" />
          <rect x={28 + i * 98} y="44" width="68" height="10" rx="5"
            fill={["#D97706", "#059669", "#6C3CE1"][i]} opacity="0.25" />
          <rect x={28 + i * 98} y="60" width="44" height="5" rx="2.5" fill="var(--border)" />
          <rect x={28 + i * 98} y="70" width="34" height="5" rx="2.5" fill="var(--border)" opacity="0.6" />
          <rect x={28 + i * 98} y="88" width="68" height="14" rx="7"
            fill={["#D97706", "#059669", "#6C3CE1"][i]} opacity="0.8" />
          <rect x={44 + i * 98} y="92" width="36" height="6" rx="3" fill="white" opacity="0.7" />
        </g>
      ))}
      <rect x="18" y="120" width="284" height="60" rx="10" fill="var(--bg)" stroke="var(--border)" strokeWidth="1" />
      <rect x="28" y="130" width="60" height="6" rx="3" fill="var(--border)" opacity="0.7" />
      <rect x="150" y="130" width="40" height="6" rx="3" fill="var(--border)" opacity="0.5" />
      <rect x="220" y="130" width="30" height="6" rx="3" fill="var(--border)" opacity="0.5" />
      {[0, 1].map(i => (
        <g key={i}>
          <rect x="18" y={144 + i * 18} width="284" height="1" fill="var(--border)" opacity="0.4" />
          <rect x="28" y={148 + i * 18} width="80" height="6" rx="3" fill="var(--border)" opacity="0.4" />
          <rect x="150" y={148 + i * 18} width="40" height="6" rx="3" fill="#D97706" opacity="0.3" />
          <rect x="220" y={148 + i * 18} width="30" height="6" rx="3" fill="#059669" opacity="0.3" />
          <rect x="262" y={146 + i * 18} width="28" height="10" rx="5" fill="var(--bg-card)" stroke="var(--border)" strokeWidth="1" />
        </g>
      ))}
    </svg>
  );
}

function BillingIllustration() {
  return (
    <svg viewBox="0 0 320 200" className="w-full h-full" fill="none">
      <rect x="10" y="10" width="300" height="180" rx="16" fill="var(--bg-card)" stroke="var(--border)" strokeWidth="1.5" />
      <rect x="18" y="18" width="130" height="76" rx="12" fill="#059669" opacity="0.12" stroke="#059669" strokeWidth="1" />
      <rect x="28" y="28" width="50" height="8" rx="4" fill="#059669" opacity="0.5" />
      <rect x="28" y="44" width="90" height="14" rx="7" fill="#059669" opacity="0.7" />
      <rect x="28" y="64" width="60" height="8" rx="4" fill="var(--border)" />
      <rect x="100" y="64" width="40" height="20" rx="10" fill="#059669" opacity="0.8" />
      <rect x="112" y="70" width="16" height="8" rx="4" fill="white" opacity="0.7" />
      <rect x="156" y="18" width="144" height="76" rx="12" fill="#6C3CE1" opacity="0.08" stroke="#6C3CE1" strokeWidth="1" />
      <rect x="166" y="28" width="50" height="6" rx="3" fill="#6C3CE1" opacity="0.4" />
      <rect x="166" y="40" width="80" height="12" rx="6" fill="#6C3CE1" opacity="0.6" />
      {[0, 1, 2].map(i => (
        <g key={i}>
          <circle cx="171" cy={62 + i * 12} r="3" fill="#25D366" opacity="0.6" />
          <rect x="178" y={59 + i * 12} width="60" height="6" rx="3" fill="var(--border)" />
        </g>
      ))}
      <rect x="18" y="102" width="284" height="78" rx="10" fill="var(--bg)" stroke="var(--border)" strokeWidth="1" />
      <rect x="28" y="112" width="80" height="8" rx="4" fill="var(--border)" opacity="0.7" />
      {[0, 1, 2].map(i => (
        <g key={i}>
          <rect x="28" y={128 + i * 18} width="284" height="1" fill="var(--border)" opacity="0.4" />
          <rect x="28" y={132 + i * 18} width="80" height="6" rx="3" fill="var(--border)" opacity="0.5" />
          <rect x={200} y={132 + i * 18} width="50" height="6" rx="3"
            fill={["#25D366", "#EF4444", "#25D366"][i]} opacity="0.4" />
          <rect x="260" y={132 + i * 18} width="34" height="6" rx="3" fill="var(--border)" opacity="0.3" />
        </g>
      ))}
    </svg>
  );
}

function ProfileIllustration() {
  return (
    <svg viewBox="0 0 320 200" className="w-full h-full" fill="none">
      <rect x="10" y="10" width="300" height="180" rx="16" fill="var(--bg-card)" stroke="var(--border)" strokeWidth="1.5" />
      <circle cx="85" cy="70" r="40" fill="#EC4899" opacity="0.1" stroke="#EC4899" strokeWidth="1.5" strokeDasharray="4 2" />
      <circle cx="85" cy="62" r="20" fill="#EC4899" opacity="0.3" />
      <ellipse cx="85" cy="100" rx="30" ry="14" fill="#EC4899" opacity="0.2" />
      <rect x="138" y="26" width="162" height="10" rx="5" fill="#EC4899" opacity="0.5" />
      <rect x="138" y="44" width="120" height="7" rx="3.5" fill="var(--border)" />
      <rect x="138" y="58" width="100" height="7" rx="3.5" fill="var(--border)" opacity="0.7" />
      <rect x="138" y="76" width="54" height="18" rx="9" fill="#EC4899" opacity="0.15" stroke="#EC4899" strokeWidth="1" />
      <rect x="146" y="81" width="38" height="8" rx="4" fill="#EC4899" opacity="0.5" />
      <rect x="198" y="76" width="54" height="18" rx="9" fill="#25D366" opacity="0.15" stroke="#25D366" strokeWidth="1" />
      <rect x="206" y="81" width="38" height="8" rx="4" fill="#25D366" opacity="0.5" />
      <rect x="18" y="116" width="284" height="64" rx="10" fill="var(--bg)" stroke="var(--border)" strokeWidth="1" />
      <rect x="28" y="126" width="80" height="7" rx="3.5" fill="var(--border)" />
      {[0, 1].map(i => (
        <g key={i}>
          <rect x="28" y={140 + i * 22} width="116" height="14" rx="7"
            fill="var(--bg-card)" stroke="var(--border)" strokeWidth="1" />
          <rect x="152" y={140 + i * 22} width="116" height="14" rx="7"
            fill={i === 0 ? "#EC4899" : "var(--bg-card)"}
            opacity={i === 0 ? 0.15 : 1}
            stroke={i === 0 ? "#EC4899" : "var(--border)"} strokeWidth="1" />
        </g>
      ))}
    </svg>
  );
}

function TestIllustration() {
  return (
    <svg viewBox="0 0 320 200" className="w-full h-full" fill="none">
      <rect x="10" y="10" width="300" height="180" rx="16" fill="var(--bg-card)" stroke="var(--border)" strokeWidth="1.5" />
      <rect x="18" y="18" width="190" height="28" rx="14" fill="var(--bg)" stroke="var(--border)" strokeWidth="1" />
      <rect x="20" y="20" width="92" height="24" rx="12" fill="#075E54" opacity="0.9" />
      <rect x="32" y="26" width="68" height="12" rx="6" fill="white" opacity="0.5" />
      <rect x="118" y="26" width="68" height="12" rx="6" fill="var(--border)" />
      <rect x="18" y="54" width="190" height="120" rx="10" fill="var(--bg)" stroke="var(--border)" strokeWidth="1" />
      <rect x="18" y="54" width="190" height="28" rx="10" fill="#075E54" />
      <rect x="18" y="70" width="190" height="12" rx="0" fill="#075E54" />
      <circle cx="36" cy="68" r="8" fill="white" opacity="0.2" />
      <rect x="50" y="62" width="60" height="6" rx="3" fill="white" opacity="0.5" />
      <rect x="26" y="92" width="90" height="18" rx="8" fill="var(--bg-card)" stroke="var(--border)" strokeWidth="1" />
      <rect x="120" y="116" width="80" height="18" rx="8" fill="#075E54" opacity="0.8" />
      <rect x="26" y="140" width="110" height="18" rx="8" fill="var(--bg-card)" stroke="var(--border)" strokeWidth="1" />
      <rect x="216" y="18" width="94" height="156" rx="10" fill="var(--bg)" stroke="var(--border)" strokeWidth="1" />
      {[
        { color: "#0EA5E9", open: true },
        { color: "#25D366", open: false },
        { color: "#F59E0B", open: false },
      ].map((item, i) => (
        <g key={i}>
          <rect x="222" y={26 + i * 44} width="82" height={item.open ? 38 : 18} rx="6"
            fill={item.color} opacity={0.1} stroke={item.color} strokeWidth="1" />
          <rect x="228" y={32 + i * 44} width="40" height="6" rx="3" fill={item.color} opacity="0.6" />
          {item.open && (
            <>
              <rect x="228" y={44 + i * 44} width="60" height="4" rx="2" fill="var(--border)" />
              <rect x="228" y={52 + i * 44} width="44" height="4" rx="2" fill="var(--border)" opacity="0.6" />
            </>
          )}
        </g>
      ))}
    </svg>
  );
}

function HelpIllustration() {
  return (
    <svg viewBox="0 0 320 200" className="w-full h-full" fill="none">
      <rect x="10" y="10" width="300" height="180" rx="16" fill="var(--bg-card)" stroke="var(--border)" strokeWidth="1.5" />
      <circle cx="85" cy="70" r="38" fill="#0EA5E9" opacity="0.1" stroke="#0EA5E9" strokeWidth="1" strokeDasharray="4 2" />
      <circle cx="85" cy="70" r="22" fill="#0EA5E9" opacity="0.2" />
      <text x="79" y="78" fontSize="22" fill="#0EA5E9" opacity="0.8" fontWeight="bold">?</text>
      {[0, 1, 2].map(i => (
        <g key={i}>
          <rect x="136" y={18 + i * 52} width="164" height="44" rx="10"
            fill="var(--bg)" stroke="var(--border)" strokeWidth="1" />
          <rect x={156} y={30 + i * 52} width="28" height="28" rx="8"
            fill={["#0EA5E9", "#6C3CE1", "#25D366"][i]} opacity="0.15" />
          <rect x={162} y={36 + i * 52} width="16" height="16" rx="4"
            fill={["#0EA5E9", "#6C3CE1", "#25D366"][i]} opacity="0.4" />
          <rect x="192" y={30 + i * 52} width="80" height="7" rx="3.5"
            fill={["#0EA5E9", "#6C3CE1", "#25D366"][i]} opacity="0.5" />
          <rect x="192" y={42 + i * 52} width="60" height="5" rx="2.5" fill="var(--border)" />
        </g>
      ))}
      <rect x="18" y="120" width="106" height="60" rx="10" fill="#0EA5E9" opacity="0.08" stroke="#0EA5E9" strokeWidth="1" />
      <rect x="28" y="132" width="60" height="7" rx="3.5" fill="#0EA5E9" opacity="0.4" />
      <rect x="28" y="146" width="86" height="12" rx="6" fill="#0EA5E9" opacity="0.2" />
      <rect x="28" y="160" width="86" height="12" rx="6" fill="#0EA5E9" opacity="0.6" />
      <rect x="40" y="163" width="62" height="6" rx="3" fill="white" opacity="0.7" />
    </svg>
  );
}

function FeedbackIllustration() {
  return (
    <svg viewBox="0 0 320 200" className="w-full h-full" fill="none">
      <rect x="10" y="10" width="300" height="180" rx="16" fill="var(--bg-card)" stroke="var(--border)" strokeWidth="1.5" />
      {[0, 1, 2, 3, 4].map(i => (
        <g key={i}>
          <polygon
            points={`${54 + i * 46},22 ${58 + i * 46},34 ${70 + i * 46},34 ${62 + i * 46},42 ${64 + i * 46},54 ${54 + i * 46},48 ${44 + i * 46},54 ${46 + i * 46},42 ${38 + i * 46},34 ${50 + i * 46},34`}
            fill={i < 4 ? "#F59E0B" : "none"} stroke="#F59E0B" strokeWidth="1.5"
            opacity={i < 4 ? 0.8 : 0.4}
          />
        </g>
      ))}
      <rect x="18" y="66" width="284" height="80" rx="10" fill="var(--bg)" stroke="var(--border)" strokeWidth="1" />
      <rect x="28" y="78" width="244" height="6" rx="3" fill="var(--border)" opacity="0.6" />
      <rect x="28" y="92" width="200" height="6" rx="3" fill="var(--border)" opacity="0.5" />
      <rect x="28" y="106" width="220" height="6" rx="3" fill="var(--border)" opacity="0.4" />
      <rect x="28" y="120" width="140" height="6" rx="3" fill="var(--border)" opacity="0.3" />
      <rect x="18" y="158" width="284" height="24" rx="12" fill="#F59E0B" opacity="0.8" />
      <rect x="106" y="163" width="108" height="14" rx="7" fill="white" opacity="0.6" />
    </svg>
  );
}

function BugIllustration() {
  return (
    <svg viewBox="0 0 320 200" className="w-full h-full" fill="none">
      <rect x="10" y="10" width="300" height="180" rx="16" fill="var(--bg-card)" stroke="var(--border)" strokeWidth="1.5" />
      <polygon points="100,20 160,20 190,70 130,70" fill="#EF4444" opacity="0.1" stroke="#EF4444" strokeWidth="1.5" />
      <rect x="126" y="36" width="8" height="20" rx="4" fill="#EF4444" opacity="0.7" />
      <circle cx="130" cy="62" r="4" fill="#EF4444" opacity="0.7" />
      <rect x="18" y="86" width="284" height="18" rx="9" fill="var(--bg)" stroke="var(--border)" strokeWidth="1" />
      <rect x="24" y="92" width="100" height="6" rx="3" fill="#EF4444" opacity="0.3" />
      <rect x="272" y="90" width="22" height="10" rx="5" fill="var(--border)" opacity="0.5" />
      <rect x="18" y="112" width="284" height="18" rx="9" fill="var(--bg)" stroke="var(--border)" strokeWidth="1" />
      {["#EF4444", "#F97316", "#F59E0B"].map((c, i) => (
        <rect key={i} x={24 + i * 96} y="116" width="86" height="10" rx="5"
          fill={c} opacity={i === 0 ? 0.3 : 0.1} stroke={c} strokeWidth="1" />
      ))}
      <rect x="18" y="138" width="284" height="42" rx="10" fill="var(--bg)" stroke="var(--border)" strokeWidth="1" />
      <rect x="28" y="150" width="200" height="5" rx="2.5" fill="var(--border)" opacity="0.5" />
      <rect x="28" y="162" width="160" height="5" rx="2.5" fill="var(--border)" opacity="0.4" />
    </svg>
  );
}

// ── Page principale ────────────────────────────────────────────────────────────

type StepKey =
  | "dashboard" | "bots" | "knowledge"
  | "appointments" | "services" | "billing"
  | "profile" | "test"
  | "help" | "feedback" | "bug";

export default function PmeTutorialPage() {
  const { dictionary: d } = useLanguage();
  const t = d.tutorial;
  const router = useRouter();

  const [started, setStarted] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [completedTabs, setCompletedTabs] = useState<Set<number>>(new Set());
  const [tutorialCompleted, setTutorialCompleted] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(true);

  // ── Charger la progression au démarrage ──────────────────────────────────
  useEffect(() => {
    tutorialRepository.getProgress()
      .then(res => {
        if (res.has_completed_tutorial) {
          setTutorialCompleted(true);
          setStarted(true);
        } else if (res.last_step > 0) {
          const { tabIdx, stepIdx } = fromGlobalStep(res.last_step);
          setActiveTab(tabIdx);
          setActiveStep(stepIdx);
          setStarted(true);
          const done = new Set<number>();
          for (let i = 0; i < tabIdx; i++) done.add(i);
          setCompletedTabs(done);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingProgress(false));
  }, []);

  const tab = TABS[activeTab];
  const step = tab.steps[activeStep];
  const stepT = t.steps[step.key as StepKey];

  const isLastStepOfTab = activeStep === tab.steps.length - 1;
  const isLastTab = activeTab === TABS.length - 1;
  const isVeryLast = isLastStepOfTab && isLastTab;
  const isFirst = activeTab === 0 && activeStep === 0;

  // Marquer tab comme complété quand on le termine
  useEffect(() => {
    if (started && isLastStepOfTab) {
      setCompletedTabs(prev => new Set([...prev, activeTab]));
    }
  }, [activeTab, activeStep, started, isLastStepOfTab]);

  const handleNext = () => {
    if (isVeryLast) {
      tutorialRepository.complete().catch(() => {});
      setTutorialCompleted(true);
      router.push(ROUTES.dashboard);
    } else {
      let nextTab = activeTab;
      let nextStep = activeStep;
      if (isLastStepOfTab) {
        nextTab = activeTab + 1;
        nextStep = 0;
        setActiveTab(nextTab);
        setActiveStep(0);
      } else {
        nextStep = activeStep + 1;
        setActiveStep(nextStep);
      }
      tutorialRepository.saveStep(toGlobalStep(nextTab, nextStep)).catch(() => {});
    }
  };

  const handlePrev = () => {
    if (activeStep > 0) {
      setActiveStep(s => s - 1);
    } else if (activeTab > 0) {
      const prevTab = activeTab - 1;
      setActiveTab(prevTab);
      setActiveStep(TABS[prevTab].steps.length - 1);
    }
  };

  const handleTabClick = (tabIdx: number) => {
    setActiveTab(tabIdx);
    setActiveStep(0);
  };

  // ── Écran de chargement ──────────────────────────────────────────────────
  if (loadingProgress) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#075E54] border-t-transparent animate-spin" />
      </div>
    );
  }

  // ── Écran tutoriel terminé ───────────────────────────────────────────────
  if (tutorialCompleted) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center animate-fade-in px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-[#25D366]/10 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-[#25D366]" />
          </div>
          <h1 className="text-3xl font-black text-[var(--text)]">Tutoriel terminé !</h1>
          <p className="text-[var(--text-muted)]">
            Vous maîtrisez maintenant toutes les fonctionnalités d&apos;AGT Platform.
          </p>
          <button
            onClick={() => router.push(ROUTES.dashboard)}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-white font-bold text-sm mx-auto transition-all hover:scale-105 shadow-lg"
            style={{ backgroundColor: "#075E54" }}
          >
            Retour au dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setTutorialCompleted(false); setActiveTab(0); setActiveStep(0); setStarted(true); }}
            className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          >
            Revoir le tutoriel
          </button>
        </div>
      </div>
    );
  }

  // ── Écran d'accueil ──────────────────────────────────────────────────────────
  if (!started) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center animate-fade-in px-4">
        <div className="max-w-2xl w-full text-center space-y-8">
          <div className="w-20 h-20 rounded-3xl bg-[#075E54]/10 flex items-center justify-center mx-auto">
            <Zap className="w-10 h-10 text-[#075E54]" />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-black text-[var(--text)]">{t.title}</h1>
            <p className="text-[var(--text-muted)] leading-relaxed">{t.subtitle}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TABS.map((tab) => {
              const tabT = t.tabs[tab.key as keyof typeof t.tabs];
              return (
                <div
                  key={tab.key}
                  className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] text-center space-y-3"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto"
                    style={{ backgroundColor: tab.color + "20", color: tab.color }}
                  >
                    {tab.icon}
                  </div>
                  <p className="text-xs font-bold text-[var(--text)]">{tabT}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">{tab.steps.length} {t.sections}</p>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setStarted(true)}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-white font-bold text-sm mx-auto transition-all hover:scale-105 active:scale-95 shadow-lg"
            style={{ backgroundColor: "#075E54" }}
          >
            {t.startBtn}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ── Tutoriel principal ───────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-5">

      {/* Tabs de navigation */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map((tb, idx) => {
          const tabT = t.tabs[tb.key as keyof typeof t.tabs];
          const isActive = idx === activeTab;
          const isDone = completedTabs.has(idx);
          return (
            <button
              key={tb.key}
              onClick={() => handleTabClick(idx)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                isActive
                  ? "text-white shadow-md"
                  : isDone
                    ? "bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20"
                    : "bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border)] hover:text-[var(--text)]"
              )}
              style={isActive ? { backgroundColor: tb.color } : {}}
            >
              {isDone && !isActive
                ? <CheckCircle className="w-4 h-4" />
                : <span style={{ color: isActive ? "white" : tb.color }}>{tb.icon}</span>
              }
              <span>{tabT}</span>
            </button>
          );
        })}
      </div>

      {/* Mini-stepper de l'onglet courant */}
      <div className="flex items-center gap-2">
        {tab.steps.map((s, idx) => {
          const isStepActive = idx === activeStep;
          const isStepDone = idx < activeStep || (completedTabs.has(activeTab) && !isStepActive);
          return (
            <button
              key={s.key}
              onClick={() => setActiveStep(idx)}
              className={cn(
                "flex items-center justify-center transition-all",
                isStepActive ? "flex-1" : "w-8 flex-shrink-0"
              )}
            >
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl transition-all w-full",
                  isStepActive
                    ? "text-white shadow-md"
                    : isStepDone
                      ? "bg-[#25D366]/10 text-[#25D366]"
                      : "bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border)]"
                )}
                style={isStepActive ? { backgroundColor: s.color } : {}}
              >
                {isStepDone && !isStepActive
                  ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  : <span className="flex-shrink-0" style={{ color: isStepActive ? "white" : s.color }}>
                      {s.icon}
                    </span>
                }
                {isStepActive && (
                  <span className="text-xs font-bold text-white truncate">
                    {stepT.title}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Compteur */}
      <p className="text-xs text-[var(--text-muted)] text-center">
        {activeStep + 1} {t.stepOf} {tab.steps.length}
      </p>

      {/* Carte principale */}
      <div className={cn(
        "rounded-3xl border border-[var(--border)] overflow-hidden bg-gradient-to-br shadow-sm",
        step.bg
      )}>
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[360px]">
          <div className="p-8 flex flex-col justify-center space-y-6">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg"
              style={{ backgroundColor: step.color }}
            >
              {step.icon}
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-black text-[var(--text)]">{stepT.title}</h2>
              <p className="text-[var(--text-muted)] leading-relaxed text-sm">{stepT.desc}</p>
            </div>

            <button
              onClick={() => router.push(step.route)}
              className="flex items-center gap-2 text-sm font-bold transition-colors self-start"
              style={{ color: step.color }}
            >
              {t.goToSection}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 flex items-center justify-center min-h-[200px]">
            <div className="w-full max-w-sm">
              {step.illustration}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={isFirst}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all",
            isFirst
              ? "opacity-0 pointer-events-none"
              : "bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg)]"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
          {t.prevBtn}
        </button>

        <button
          onClick={() => router.push(ROUTES.dashboard)}
          className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors flex items-center gap-1"
        >
          <X className="w-3 h-3" />
          {t.skipBtn}
        </button>

        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-md"
          style={{ backgroundColor: step.color }}
        >
          {isVeryLast ? t.finishBtn : t.nextBtn}
          {isVeryLast
            ? <CheckCircle className="w-4 h-4" />
            : <ChevronRight className="w-4 h-4" />
          }
        </button>
      </div>

    </div>
  );
}