// src/lib/api-client.ts
import { ENV } from "./env";
import { TOKEN_KEY, REFRESH_KEY } from "./constants";

// ══════════════════════════════════════════════════════════════════════════════
// TOKEN STORAGE
// ══════════════════════════════════════════════════════════════════════════════
export const tokenStorage = {
  getAccess: (): string | null =>
    typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null,
  getRefresh: (): string | null =>
    typeof window !== "undefined" ? localStorage.getItem(REFRESH_KEY) : null,
  set: (access: string, refresh: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
    document.cookie = `agt_auth=${access}; path=/; max-age=86400; SameSite=Lax`;
  },
  clear: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    document.cookie = "agt_auth=; path=/; max-age=0";
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// API ERROR — erreur structurée { status, body }
// ══════════════════════════════════════════════════════════════════════════════
/**
 * Erreur levée par le client API pour toute réponse non-ok (status >= 400).
 * Porte le code HTTP et le body JSON du backend pour permettre aux consommateurs
 * de détecter des cas précis (ex: EMAIL_NOT_VERIFIED sur login).
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly body: unknown;

  constructor(status: number, body: unknown, message?: string) {
    super(message ?? extractDetail(body) ?? `Erreur ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }

  /**
   * True si le backend a répondu 403 avec detail=EMAIL_NOT_VERIFIED.
   * Utilisé par login/page.tsx pour rediriger vers /pending.
   */
  isEmailNotVerified(): boolean {
    if (this.status !== 403) return false;
    const b = this.body as { detail?: string } | null;
    return b?.detail === "EMAIL_NOT_VERIFIED";
  }

  /**
   * Email associé à l'erreur (ex: renvoyé avec EMAIL_NOT_VERIFIED).
   * Retourne null si le backend ne l'a pas inclus.
   */
  getEmail(): string | null {
    if (typeof this.body !== "object" || this.body === null) return null;
    const b = this.body as { email?: unknown };
    return typeof b.email === "string" ? b.email : null;
  }
}

function extractDetail(body: unknown): string | null {
  if (typeof body !== "object" || body === null) return null;
  const b = body as { detail?: unknown };
  return typeof b.detail === "string" ? b.detail : null;
}

// ══════════════════════════════════════════════════════════════════════════════
// REFRESH AUTO — queue thread-safe
// ══════════════════════════════════════════════════════════════════════════════
// Si N requêtes reçoivent 401 simultanément, une seule déclenche le refresh.
// Les autres attendent la fin via refreshQueue, puis retry avec le nouveau token.

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

/**
 * Appelle /auth/token/refresh/ via fetch direct (pas via request() pour éviter
 * toute récursion). Retourne le nouveau access token ou null en cas d'échec.
 */
async function refreshAccessToken(): Promise<string | null> {
  const refresh = tokenStorage.getRefresh();
  if (!refresh) return null;

  try {
    const res = await fetch(`${ENV.API_URL}/api/v1/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { access?: string };
    if (!data.access) return null;
    // Le backend ne rotate pas le refresh — on réutilise l'existant.
    tokenStorage.set(data.access, refresh);
    return data.access;
  } catch {
    return null;
  }
}

function waitForRefresh(): Promise<string | null> {
  return new Promise((resolve) => {
    refreshQueue.push(resolve);
  });
}

function flushRefreshQueue(token: string | null): void {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
}

// ══════════════════════════════════════════════════════════════════════════════
// REQUEST HELPER
// ══════════════════════════════════════════════════════════════════════════════
interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
  /**
   * Si true, ne tente PAS de refresh automatique sur 401.
   * À utiliser sur les endpoints d'auth publics (login, register, forgot-password,
   * token/refresh lui-même, etc.) pour éviter les boucles.
   */
  skipAuthRefresh?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { params, skipAuthRefresh, ...fetchOptions } = options;
  const url = new URL(`${ENV.API_URL}${path}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const doFetch = async (): Promise<Response> => {
    const token = tokenStorage.getAccess();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(fetchOptions.headers as Record<string, string>),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return fetch(url.toString(), { ...fetchOptions, headers });
  };

  let res = await doFetch();

  // ── Refresh auto sur 401 ──────────────────────────────────────────────────
  if (res.status === 401 && !skipAuthRefresh && tokenStorage.getRefresh()) {
    let newToken: string | null;

    if (isRefreshing) {
      // Un refresh est déjà en cours — on attend son résultat
      newToken = await waitForRefresh();
    } else {
      isRefreshing = true;
      newToken = await refreshAccessToken();
      isRefreshing = false;
      flushRefreshQueue(newToken);
    }

    if (newToken) {
      // Retry avec le nouveau token
      res = await doFetch();
    } else {
      // Refresh échoué — nettoyage, on laisse l'ApiError 401 remonter
      tokenStorage.clear();
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: "Erreur réseau" }));
    throw new ApiError(res.status, body);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ══════════════════════════════════════════════════════════════════════════════
// API
// ══════════════════════════════════════════════════════════════════════════════
interface ApiGetOptions {
  params?: Record<string, string>;
  skipAuthRefresh?: boolean;
}
interface ApiBodyOptions {
  skipAuthRefresh?: boolean;
}

export const api = {
  get: <T>(path: string, opts?: ApiGetOptions): Promise<T> =>
    request<T>(path, { method: "GET", ...opts }),

  post: <T>(path: string, body: unknown, opts?: ApiBodyOptions): Promise<T> =>
    request<T>(path, { method: "POST", body: JSON.stringify(body), ...opts }),

  put: <T>(path: string, body: unknown, opts?: ApiBodyOptions): Promise<T> =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body), ...opts }),

  patch: <T>(path: string, body: unknown, opts?: ApiBodyOptions): Promise<T> =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body), ...opts }),

  delete: <T>(path: string, opts?: ApiBodyOptions): Promise<T> =>
    request<T>(path, { method: "DELETE", ...opts }),
};