// src/components/billing/PlanGatingBadge.tsx
// Composant réutilisable — badge d'avertissement plan insuffisant
// Utilisé dans WelcomeScreen3 et ModuleCartCheckout
import { Lock } from "lucide-react";

interface Props {
  moduleName: string;
  requiredPlan: string; // ex: "Business", "Pro"
  locale?: string;
}

export function PlanGatingBadge({ moduleName, requiredPlan, locale = "fr" }: Props) {
  const msg =
    locale === "fr"
      ? `${moduleName} — accessible à partir du plan ${requiredPlan}`
      : `${moduleName} — available from the ${requiredPlan} plan`;

  return (
    <div
      className="flex items-start gap-2 px-3 py-2.5 rounded-xl
                 bg-amber-50 border border-amber-200 text-amber-800"
    >
      <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-500" />
      <p className="text-xs font-semibold leading-snug">{msg}</p>
    </div>
  );
}