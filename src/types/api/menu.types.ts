// src/types/api/menu.types.ts
// Types — module menu_digital (secteur restaurant)

export interface MenuPlat {
  id:             string;
  categorie:      string;   // UUID de MenuCategorie
  nom_fr:         string;
  nom_en:         string;
  description_fr: string;
  description_en: string;
  prix:           number;   // XAF entier
  image_url:      string;
  is_available:   boolean;
  ordre:          number;
  created_at:     string;
  updated_at:     string;
}

export interface MenuCategorie {
  id:         string;
  entreprise: string;
  nom_fr:     string;
  nom_en:     string;
  ordre:      number;
  is_active:  boolean;
  plats:      MenuPlat[];
  created_at: string;
  updated_at: string;
}

export type CreateMenuCategoriePayload = {
  nom_fr:    string;
  nom_en?:   string;
  ordre?:    number;
  is_active?: boolean;
};

export type UpdateMenuCategoriePayload = Partial<CreateMenuCategoriePayload>;

export type CreateMenuPlatPayload = {
  categorie:      string;   // UUID catégorie
  nom_fr:         string;
  nom_en?:        string;
  description_fr?: string;
  description_en?: string;
  prix:           number;
  image_url?:     string;
  is_available?:  boolean;
  ordre?:         number;
};

export type UpdateMenuPlatPayload = Partial<Omit<CreateMenuPlatPayload, "categorie">>;