// src/app/pme/tutorial/_components/tutorial.types.ts
import { ROUTES } from "@/lib/constants";
import {
  LayoutDashboard, Bot, BookOpen, CalendarDays,
  CreditCard, PlayCircle, Briefcase, UserCircle,
  HelpCircle, Star, AlertTriangle, Zap,
} from "lucide-react";
import {
  DashboardIllustration,
  BotsIllustration,
  KnowledgeIllustration,
  AppointmentsIllustration,
  ServicesIllustration,
  BillingIllustration,
  ProfileIllustration,
  TestIllustration,
  HelpIllustration,
  FeedbackIllustration,
  BugIllustration,
} from "./TutorialIllustrations";

export interface TutorialStep {
  key: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  route: string;
  illustration: React.ReactNode;
}

export interface TutorialTab {
  key: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  steps: TutorialStep[];
}

export type StepKey =
  | "dashboard" | "bots" | "knowledge"
  | "appointments" | "services" | "billing"
  | "profile" | "test"
  | "help" | "feedback" | "bug";

export const TABS: TutorialTab[] = [
  {
    key: "essentials",
    icon: <Zap className="w-4 h-4" />,
    color: "#075E54",
    bg: "from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950",
    steps: [
      { key: "dashboard", icon: <LayoutDashboard className="w-6 h-6" />, color: "#075E54", bg: "from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950", route: ROUTES.dashboard, illustration: <DashboardIllustration /> },
      { key: "bots", icon: <Bot className="w-6 h-6" />, color: "#6C3CE1", bg: "from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950", route: ROUTES.bots, illustration: <BotsIllustration /> },
      { key: "knowledge", icon: <BookOpen className="w-6 h-6" />, color: "#0EA5E9", bg: "from-sky-50 to-blue-50 dark:from-sky-950 dark:to-blue-950", route: ROUTES.knowledge, illustration: <KnowledgeIllustration /> },
    ],
  },
  {
    key: "management",
    icon: <Briefcase className="w-4 h-4" />,
    color: "#F97316",
    bg: "from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950",
    steps: [
      { key: "appointments", icon: <CalendarDays className="w-6 h-6" />, color: "#F97316", bg: "from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950", route: ROUTES.appointments, illustration: <AppointmentsIllustration /> },
      { key: "services", icon: <Briefcase className="w-6 h-6" />, color: "#D97706", bg: "from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950", route: ROUTES.services, illustration: <ServicesIllustration /> },
      { key: "billing", icon: <CreditCard className="w-6 h-6" />, color: "#059669", bg: "from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950", route: ROUTES.billing, illustration: <BillingIllustration /> },
    ],
  },
  {
    key: "personalization",
    icon: <UserCircle className="w-4 h-4" />,
    color: "#EC4899",
    bg: "from-pink-50 to-rose-50 dark:from-pink-950 dark:to-rose-950",
    steps: [
      { key: "profile", icon: <UserCircle className="w-6 h-6" />, color: "#EC4899", bg: "from-pink-50 to-rose-50 dark:from-pink-950 dark:to-rose-950", route: ROUTES.profile, illustration: <ProfileIllustration /> },
      { key: "test", icon: <PlayCircle className="w-6 h-6" />, color: "#8B5CF6", bg: "from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950", route: ROUTES.bots, illustration: <TestIllustration /> },
    ],
  },
  {
    key: "support",
    icon: <HelpCircle className="w-4 h-4" />,
    color: "#0EA5E9",
    bg: "from-sky-50 to-blue-50 dark:from-sky-950 dark:to-blue-950",
    steps: [
      { key: "help", icon: <HelpCircle className="w-6 h-6" />, color: "#0EA5E9", bg: "from-sky-50 to-blue-50 dark:from-sky-950 dark:to-blue-950", route: ROUTES.help, illustration: <HelpIllustration /> },
      { key: "feedback", icon: <Star className="w-6 h-6" />, color: "#F59E0B", bg: "from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950", route: ROUTES.feedback, illustration: <FeedbackIllustration /> },
      { key: "bug", icon: <AlertTriangle className="w-6 h-6" />, color: "#EF4444", bg: "from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950", route: ROUTES.bug, illustration: <BugIllustration /> },
    ],
  },
];

export function toGlobalStep(tabIdx: number, stepIdx: number): number {
  let global = 0;
  for (let i = 0; i < tabIdx; i++) global += TABS[i].steps.length;
  return global + stepIdx;
}

export function fromGlobalStep(globalStep: number): { tabIdx: number; stepIdx: number } {
  let remaining = globalStep;
  for (let i = 0; i < TABS.length; i++) {
    if (remaining < TABS[i].steps.length) return { tabIdx: i, stepIdx: remaining };
    remaining -= TABS[i].steps.length;
  }
  return { tabIdx: TABS.length - 1, stepIdx: TABS[TABS.length - 1].steps.length - 1 };
}