// src/types/api/chambre.types.ts
// Types — module reservation_chambre (hotel)

export interface ChambreType {
  id:             string;
  entreprise:     string;
  nom_fr:         string;
  nom_en:         string;
  description_fr: string;
  description_en: string;
  capacite:       number;
  prix_nuit:      number;   // XAF
  equipements:    string[]; // ["WiFi", "Clim", "TV"]
  image_url:      string;
  is_available:   boolean;
  ordre:          number;
  created_at:     string;
  updated_at:     string;
}

export type CreateChambreTypePayload = {
  nom_fr:          string;
  nom_en?:         string;
  description_fr?: string;
  description_en?: string;
  capacite:        number;
  prix_nuit:       number;
  equipements?:    string[];
  image_url?:      string;
  is_available?:   boolean;
  ordre?:          number;
};

export type UpdateChambreTypePayload = Partial<CreateChambreTypePayload>;