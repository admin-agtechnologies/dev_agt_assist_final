// src/contexts/AuthContext.tsx
// ══════════════════════════════════════════════════════════════════════════════
// REMPLACER le fichier complet src/contexts/AuthContext.tsx par ceci
// ══════════════════════════════════════════════════════════════════════════════
"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { tokenStorage } from "@/lib/api-client";
import { authRepository } from "@/repositories";
import type { User, LoginPayload, AuthResponse } from "@/types/api";

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
  logout: () => void;
  isAdmin: boolean;
  isPme: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = tokenStorage.getAccess();
    if (token) {
      // Avec Django JWT réel : appeler /me/ directement avec le Bearer token
      // Pas besoin de décoder le token localement
      authRepository.me()
        .then(setUser)
        .catch(() => tokenStorage.clear())
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (payload: LoginPayload) => {
    const res = await authRepository.login(payload);
    tokenStorage.set(res.access, res.refresh ?? "");
    setUser(res.user);
  };

  const loginWithGoogle = async (googleUser: GoogleUserInfo): Promise<AuthResponse> => {
    const res = await authRepository.loginWithGoogle(googleUser.email, googleUser.name);
    tokenStorage.set(res.access, res.refresh ?? "");
    setUser(res.user);
    return res;
  };

  const logout = () => {
    const refresh = tokenStorage.getRefresh();
    if (refresh) {
      authRepository.logout(refresh).catch(() => {});
    }
    tokenStorage.clear();
    setUser(null);
    window.location.href = "/login";
  };

  // Django renvoie user_type ("entreprise" | "admin" | "superadmin")
  // Le frontend utilise role ("pme" | "admin") — on adapte
const isAdmin = false; // Espace client PME uniquement — jamais d'admin ici
const isPme = user !== null;

  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginWithGoogle, logout, isAdmin, isPme }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}