// src/lib/plan-priority.ts
// Helper partagé — priorité des plans et gating module
// Utilisé par WelcomeScreen3 et ModuleCartCheckout

export const PLAN_PRIORITY: Record<string, number> = {
  decouverte: 0,
  starter:    1,
  business:   2,
  pro:        3,
};

/**
 * Retourne true si le module nécessite un plan supérieur à celui sélectionné.
 * @param minPlanNom  - Nom du plan minimum requis (ex: "Business") — peut être null
 * @param selectedPlanSlug - Slug du plan actuellement sélectionné (ex: "starter")
 */
export function isPlanInsufficient(
  minPlanNom: string | null | undefined,
  selectedPlanSlug: string,
): boolean {
  if (!minPlanNom) return false;
  const minSlug = minPlanNom.toLowerCase();
  return (PLAN_PRIORITY[minSlug] ?? 0) > (PLAN_PRIORITY[selectedPlanSlug] ?? 0);
}