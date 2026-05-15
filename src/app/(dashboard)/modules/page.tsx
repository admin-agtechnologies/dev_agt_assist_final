// src/app/(dashboard)/modules/page.tsx
// S27 : remplace le redirect vers le premier hub.
// Affiche désormais la marketplace complète des modules.
import { ModuleMarketplace } from "@/components/modules/ModuleMarketplace";

export default function ModulesPage() {
  return <ModuleMarketplace />;
}