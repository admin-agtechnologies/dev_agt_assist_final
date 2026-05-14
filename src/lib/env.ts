// src/lib/env.ts
// Variables d'environnement typées — toujours passer par ENV, jamais process.env direct

import type { SectorSlug } from './sector-config';

export const ENV = {
  API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000',
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME ?? 'AGT Platform',
  SECTOR: (process.env.NEXT_PUBLIC_SECTOR ?? '') as SectorSlug | '',

  /**
   * Base URL du frontend en prod (ex: `https://agt-bot.com`).
   * Vide en dev → fallback ports localhost via `getSectorUrl()`.
   * Introduit en S5 (refactor multi-secteur), utilisé par `sector-urls.ts`.
   */
  FRONTEND_BASE: process.env.NEXT_PUBLIC_FRONTEND_BASE ?? '',

  IS_DEV: process.env.NODE_ENV === 'development',
  IS_PROD: process.env.NODE_ENV === 'production',
} as const;