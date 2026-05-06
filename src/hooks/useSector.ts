// src/hooks/useSector.ts
import { useMemo } from "react";
import { getCurrentSector } from "@/lib/sector-config";
import { SECTOR_THEMES } from "@/lib/sector-theme";
import type { SectorSlug } from "@/lib/sector-config";
import type { SectorTheme } from "@/lib/sector-theme";

interface UseSectorReturn {
  sector: SectorSlug;
  theme: SectorTheme;
}

export function useSector(): UseSectorReturn {
  return useMemo(() => {
    const sector = getCurrentSector();
    const theme = SECTOR_THEMES[sector];
    return { sector, theme };
  }, []);
}