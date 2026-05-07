// src/dictionaries/index.ts
import { fr } from "./fr";
import { en } from "./en";
import type { Lang } from "@/hooks/useLanguage";

export { fr } from "./fr";
export { en } from "./en";
export type { FrDict } from "./fr/index";
export type { EnDict } from "./en/index";

export type Dict = typeof fr;

const DICTS = { fr, en } as const;

/**
 * Retourne le dictionnaire complet pour une langue.
 * Usage : const d = getDict(lang); d.common.save
 */
export function getDict(lang: Lang): Dict {
  return DICTS[lang] as unknown as Dict;
}

/**
 * Accès par chemin pointé — pour les cas dynamiques uniquement.
 * Préférer getDict() + accès direct pour le typage.
 * Usage : t("fr", "common.save") → "Enregistrer"
 */
export function t(lang: Lang, path: string): string {
  const parts = path.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = DICTS[lang];
  for (const part of parts) {
    if (current == null || typeof current !== "object") return path;
    current = current[part];
  }
  return typeof current === "string" ? current : path;
}