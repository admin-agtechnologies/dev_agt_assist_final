// src/lib/image-placeholder.ts
// S45 — Banque d'images Unsplash par type de contenu (Option B)
// Logique : si image_url remplie → utiliser l'URL réelle
//           si vide → retourner un placeholder Unsplash stable et beau
//
// Usage :
//   import { getPlaceholderImage, resolveImage } from "@/lib/image-placeholder";
//   const src = resolveImage(item.image_url, "plat");

export type ImageType =
  | "plat"
  | "chambre"
  | "produit"
  | "service"
  | "trajet"
  | "financier"
  | "default";

// ── Banque d'images Unsplash stables ──────────────────────────────────────────
// Format : ?w=400&q=80 → poids léger, qualité correcte
const PLACEHOLDERS: Record<ImageType, string[]> = {
  plat: [
    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80",
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&q=80",
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80",
  ],
  chambre: [
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80",
    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&q=80",
    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400&q=80",
  ],
  produit: [
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
    "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&q=80",
    "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&q=80",
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&q=80",
  ],
  service: [
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80",
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&q=80",
    "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&q=80",
  ],
  trajet: [
    "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&q=80",
    "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400&q=80",
    "https://images.unsplash.com/photo-1465447142348-e9952c393450?w=400&q=80",
  ],
  financier: [
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80",
    "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&q=80",
  ],
  default: [
    "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&q=80",
  ],
};

/**
 * Retourne un placeholder Unsplash stable pour un type donné.
 * Utilise le nom pour choisir de façon déterministe dans la liste
 * (même nom = même image à chaque rendu).
 */
export function getPlaceholderImage(type: ImageType, seed = ""): string {
  const list = PLACEHOLDERS[type] ?? PLACEHOLDERS.default;
  // Déterministe : hash simple du seed pour toujours la même image
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) % list.length;
  }
  return list[Math.abs(hash) % list.length];
}

/**
 * Résout l'URL d'image finale :
 * - Si image_url est remplie → l'utiliser
 * - Sinon → placeholder Unsplash selon le type
 */
export function resolveImage(
  imageUrl: string | null | undefined,
  type: ImageType,
  seed = "",
): string {
  if (imageUrl && imageUrl.trim().length > 0) return imageUrl;
  return getPlaceholderImage(type, seed);
}