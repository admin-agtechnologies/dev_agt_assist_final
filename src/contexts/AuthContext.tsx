// src/contexts/AuthContext.tsx
"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { tokenStorage } from "@/lib/api-client";
import { authRepository } from "@/repositories";
import { ROUTES } from "@/lib/constants";
import type { User, LoginPayload, AuthResponse } from "@/types/api";

// ── Info Google OAuth renvoyée par @react-oauth/google ───────────────────────
interface GoogleUserInfo {
  email: string;
  name: string;
  sub: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  loginWithGoogle: (googleUser: GoogleUserInfo) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isPme: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Guard runtime : le frontend client PME ne traite que les users "entreprise".
 * Le backend peut techniquement renvoyer un admin/superadmin si ses credentials
 * sont valides — on rejette alors explicitement ici.
 */
function ensureEntreprise(u: User): void {
  if (u.user_type !== "entreprise") {
    throw new Error("Accès réservé aux comptes entreprise.");
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Reprise de session : GET /auth/me/ si token présent ──────────────────
  useEffect(() => {
    const token = tokenStorage.getAccess();
    if (!token) {
      setIsLoading(false);
      return;
    }
    authRepository.me()
      .then((u) => {
        try {
          ensureEntreprise(u);
          setUser(u);
        } catch {
          tokenStorage.clear();
          setUser(null);
        }
      })
      .catch(() => {
        tokenStorage.clear();
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // ── Connexion classique email/password ───────────────────────────────────
  const login = async (payload: LoginPayload): Promise<void> => {
    const res = await authRepository.login(payload);
    ensureEntreprise(res.user);
    tokenStorage.set(res.access, res.refresh);
    setUser(res.user);
  };

  // ── Connexion/inscription via Google OAuth ───────────────────────────────
  const loginWithGoogle = async (googleUser: GoogleUserInfo): Promise<AuthResponse> => {
    const res = await authRepository.google({
      email: googleUser.email,
      name: googleUser.name,
      google_id: googleUser.sub,
    });
    ensureEntreprise(res.user);
    tokenStorage.set(res.access, res.refresh);
    setUser(res.user);
    return res;
  };

  // ── Déconnexion : blacklist backend (best effort) + clear local ──────────
  const logout = async (): Promise<void> => {
    const refresh = tokenStorage.getRefresh();
    if (refresh) {
      try {
        await authRepository.logout(refresh);
      } catch {
        // Token expiré ou backend injoignable : on clear quand même en local
      }
    }
    tokenStorage.clear();
    setUser(null);
    window.location.href = ROUTES.login;
  };

  // Espace client PME uniquement — jamais d'admin ici
  // Recharge le user depuis /auth/me/ — utile après une mise à jour de profil
  const refreshUser = async (): Promise<void> => {
    try {
      const u = await authRepository.me();
      ensureEntreprise(u);
      setUser(u);
    } catch {
      // Token invalide → on ne déconnecte pas, on laisse le refresh auto gérer
    }
  };

  // Espace client PME uniquement — jamais d'admin ici
  const isAdmin = false;
  const isPme = user !== null;
  
  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginWithGoogle, logout, isAdmin, isPme , refreshUser}}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}