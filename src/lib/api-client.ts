// src/lib/api-client.ts
import { ENV } from "./env";
import { TOKEN_KEY, REFRESH_KEY } from "./constants";

const SECTOR             = process.env.NEXT_PUBLIC_SECTOR ?? "hub";
const SECTOR_TOKEN_KEY   = `${SECTOR}:${TOKEN_KEY}`;
const SECTOR_REFRESH_KEY = `${SECTOR}:${REFRESH_KEY}`;
const COOKIE_NAME        = `agt_auth_${SECTOR}`;

// ══════════════════════════════════════════════════════════════════════════════
// TOKEN STORAGE
// ══════════════════════════════════════════════════════════════════════════════
export const tokenStorage = {
  getAccess: (): string | null =>
    typeof window !== "undefined" ? localStorage.getItem(SECTOR_TOKEN_KEY) : null,
  getRefresh: (): string | null =>
    typeof window !== "undefined" ? localStorage.getItem(SECTOR_REFRESH_KEY) : null,
  set: (access: string, refresh: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(SECTOR_TOKEN_KEY, access);
    localStorage.setItem(SECTOR_REFRESH_KEY, refresh);
    document.cookie = `${COOKIE_NAME}=${access}; path=/; max-age=86400; SameSite=Lax`;
  },
  clear: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(SECTOR_TOKEN_KEY);
    localStorage.removeItem(SECTOR_REFRESH_KEY);
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// API ERROR — erreur structurée { status, body }
// ══════════════════════════════════════════════════════════════════════════════
export class ApiError extends Error {
  public readonly status: number;
  public readonly body: unknown;

  constructor(status: number, body: unknown, message?: string) {
    super(message ?? extractDetail(body) ?? `Erreur ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }

  isEmailNotVerified(): boolean {
    if (this.status !== 403) return false;
    const b = this.body as { detail?: string } | null;
    return b?.detail === "EMAIL_NOT_VERIFIED";
  }

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
let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

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
   const data = (await res.json()) as { access?: string; refresh?: string };
    if (!data.access) return null;
    tokenStorage.set(data.access, data.refresh ?? refresh);
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
      newToken = await waitForRefresh();
    } else {
      isRefreshing = true;
      newToken = await refreshAccessToken();
      isRefreshing = false;
      flushRefreshQueue(newToken);
    }

  if (newToken) {
        res = await doFetch();
      } else {
        tokenStorage.clear();
        window.dispatchEvent(new CustomEvent("auth:session-expired"));
        // On throw directement — pas la peine de relire res (toujours 401)
        throw new ApiError(401, { detail: "Session expirée" }, "Session expirée");
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