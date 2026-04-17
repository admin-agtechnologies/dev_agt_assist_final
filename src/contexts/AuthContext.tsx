// src/contexts/AuthContext.tsx
"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { tokenStorage } from "@/lib/api-client";
import { authRepository } from "@/repositories";
import type { User, LoginPayload, AuthResponse } from "@/types/api";

interface GoogleUserInfo {
  email: string;
  name: string;
  sub: string; // Google user ID
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
      try {
        const payload = JSON.parse(atob(token)) as { id: string; role: string; exp: number };
        if (payload.exp > Date.now()) {
          authRepository.me(payload.id)
            .then(setUser)
            .catch(() => tokenStorage.clear())
            .finally(() => setIsLoading(false));
          return;
        }
      } catch { tokenStorage.clear(); }
    }
    setIsLoading(false);
  }, []);

  // ── Login classique ──────────────────────────────────────────────────────
  const login = async (payload: LoginPayload) => {
    const res = await authRepository.login(payload);
    tokenStorage.set(res.access, res.refresh);
    setUser(res.user);
  };

  // ── Login Google ─────────────────────────────────────────────────────────
  // En mock : on cherche un user avec cet email dans JSON Server.
  // En production : envoyer le credential JWT au backend Django pour vérification.
const loginWithGoogle = async (googleUser: GoogleUserInfo): Promise<AuthResponse> => {
  const res = await authRepository.loginWithGoogle(googleUser.email, googleUser.name);
  tokenStorage.set(res.access, res.refresh);
  setUser(res.user);
  return res;
};
  const logout = () => {
    tokenStorage.clear();
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{
      user, isLoading, login, loginWithGoogle, logout,
      isAdmin: user?.role === "admin",
      isPme: user?.role === "pme",
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
