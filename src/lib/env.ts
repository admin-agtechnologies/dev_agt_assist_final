// src/lib/env.ts
// Variables d'environnement typées — toujours passer par ENV, jamais process.env direct

export const ENV = {
  API_URL:      process.env.NEXT_PUBLIC_API_URL      ?? 'http://localhost:4000',
  BACKEND_URL:  process.env.NEXT_PUBLIC_BACKEND_URL  ?? 'http://localhost:4000',
  APP_NAME:     process.env.NEXT_PUBLIC_APP_NAME     ?? 'AGT Platform',
  SECTOR:       (process.env.NEXT_PUBLIC_SECTOR      ?? '') as string,
  IS_DEV:       process.env.NODE_ENV === 'development',
  IS_PROD:      process.env.NODE_ENV === 'production',
} as const;