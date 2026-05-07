// src/components/ui/StatusFlow.tsx
// Progression visuelle des statuts — stepper horizontal
// Utilisé dans : commandes, réservations, dossiers, inscriptions
// Zéro texte en dur — toutes les étapes fournies par le parent

import React from "react";
import { Check, X } from "lucide-react";
import type { StatusVariant } from "./StatusBadge";

// ─── Types ────────────────────────────────────────────────────────────────────

export type StepState = "done" | "current" | "upcoming" | "cancelled";

export interface StatusStep {
  /** Identifiant de l'étape (slug du statut) */
  key: string;
  /** Label affiché — vient du dictionnaire appelant */
  label: string;
  /** État de cette étape */
  state: StepState;
  /** Variante de couleur (optionnel — surcharge l'état) */
  variant?: StatusVariant;
}

export interface StatusFlowProps {
  /** Étapes ordonnées du flux */
  steps: StatusStep[];
  /** Affichage compact (sans labels) */
  compact?: boolean;
  /** Classes additionnelles */
  className?: string;
}

// ─── Config couleurs par état ─────────────────────────────────────────────────

const STATE_CIRCLE: Record<StepState, string> = {
  done:      "bg-emerald-500 border-emerald-500 text-white",
  current:   "bg-[var(--color-primary,#075E54)] border-[var(--color-primary,#075E54)] text-white",
  upcoming:  "bg-white border-slate-200 text-slate-300",
  cancelled: "bg-red-500 border-red-500 text-white",
};

const STATE_LABEL: Record<StepState, string> = {
  done:      "text-emerald-600 font-semibold",
  current:   "text-[var(--color-primary,#075E54)] font-bold",
  upcoming:  "text-slate-400",
  cancelled: "text-red-500 font-semibold",
};

const STATE_LINE: Record<StepState, string> = {
  done:      "bg-emerald-400",
  current:   "bg-slate-200",
  upcoming:  "bg-slate-200",
  cancelled: "bg-red-300",
};

// ─── Sous-composant StepCircle ────────────────────────────────────────────────

function StepCircle({
  step,
  index,
}: {
  step: StatusStep;
  index: number;
}): React.ReactElement {
  const circleClass = STATE_CIRCLE[step.state];

  return (
    <div
      className={[
        "w-7 h-7 rounded-full border-2 flex items-center justify-center",
        "flex-shrink-0 transition-colors",
        circleClass,
      ].join(" ")}
      aria-current={step.state === "current" ? "step" : undefined}
    >
      {step.state === "done" && (
        <Check className="w-3.5 h-3.5" strokeWidth={3} aria-hidden="true" />
      )}
      {step.state === "cancelled" && (
        <X className="w-3.5 h-3.5" strokeWidth={3} aria-hidden="true" />
      )}
      {(step.state === "current" || step.state === "upcoming") && (
        <span className="text-[10px] font-bold leading-none">
          {index + 1}
        </span>
      )}
    </div>
  );
}

// ─── Sous-composant ConnectorLine ─────────────────────────────────────────────

function ConnectorLine({ state }: { state: StepState }): React.ReactElement {
  return (
    <div
      className={[
        "flex-1 h-0.5 mx-1 transition-colors",
        STATE_LINE[state],
      ].join(" ")}
      aria-hidden="true"
    />
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export function StatusFlow({
  steps,
  compact = false,
  className = "",
}: StatusFlowProps): React.ReactElement {
  return (
    <div
      className={["w-full", className].join(" ")}
      role="list"
      aria-label="progression"
    >
      {/* Ligne de cercles + connecteurs */}
      <div className="flex items-center">
        {steps.map((step, i) => (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center" role="listitem">
              <StepCircle step={step} index={i} />
            </div>
            {i < steps.length - 1 && (
              <ConnectorLine
                state={steps[i + 1].state === "upcoming" ? "upcoming" : step.state}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Labels sous les cercles — masqués en compact */}
      {!compact && (
        <div className="flex items-start mt-2">
          {steps.map((step, i) => (
            <React.Fragment key={step.key}>
              {/* Label centré sous le cercle */}
              <div className="flex flex-col items-center" style={{ minWidth: 0 }}>
                <span
                  className={[
                    "text-[10px] text-center leading-tight max-w-[60px] truncate",
                    STATE_LABEL[step.state],
                  ].join(" ")}
                  title={step.label}
                >
                  {step.label}
                </span>
              </div>
              {/* Espace connecteur */}
              {i < steps.length - 1 && (
                <div className="flex-1" aria-hidden="true" />
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

export default StatusFlow;