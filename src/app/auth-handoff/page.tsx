"use client";
// ============================================================
// FICHIER : src/app/auth-handoff/page.tsx
// Session 8 — Filet de sécurité B06 (cross-origin token propagation)
//
// Pourquoi cette page :
//   localStorage est isolé par origine. Quand un flow d'auth s'exécute sur
//   :3000 (le hub) puis redirige vers :3001 (sectoriel), le localStorage
//   de :3001 reste vide, donc le client API n'envoie pas de Bearer → 401.
//
// Pour le flow nominal verify-email, le backend route directement vers
// le port sectoriel (fix B05 / cause profonde B06). Cette page sert pour :
//   - Google OAuth qui revient toujours sur :3000
//   - Magic-link inter-secteurs
//   - Tout futur flow qui ne peut pas éviter le saut cross-origin
//
// Sécurité :
//   - Token en query string ⇒ trace dans l'historique nav.
//   - Mitigation : router.replace('/dashboard') immédiat après écriture.
//   - HTTPS en prod chiffre la query.
//   - Risque résiduel : logs serveur Next.js. À durcir avant prod
//     (postMessage + page intermédiaire sur le hub).
// ============================================================

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, XCircle } from "lucide-react";
import { tokenStorage } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
import { useSector } from "@/hooks/useSector";
import { ROUTES } from "@/lib/constants";

type Status = "loading" | "error";

function AuthHandoffContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const { theme } = useSector();
  const accentColor = theme.accent;

  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const access = searchParams.get("access");
    const refresh = searchParams.get("refresh") ?? "";
    const next = searchParams.get("next") || ROUTES.dashboard;

    if (!access) {
      setStatus("error");
      setErrorMsg("Lien de connexion invalide.");
      return;
    }

    // Écriture dans le localStorage de l'origine COURANTE.
    // C'est l'intérêt unique de cette page : exécuter tokenStorage.set()
    // sur :3001 (et non :3000) pour que les futurs appels API y trouvent
    // le token.
    tokenStorage.set(access, refresh);

    // Hydrater le contexte Auth puis rediriger, en effaçant les tokens
    // de l'URL (replace, pas push).
    refreshUser()
      .then(() => router.replace(next))
      .catch(() => router.replace(next)); // même en cas d'échec on continue,
                                          // le dashboard relancera /auth/me/
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
      <div className="card p-12 text-center max-w-md w-full">
        {status === "loading" && (
          <>
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: `${accentColor}1a` }}
            >
              <Loader2 className="w-10 h-10 animate-spin" style={{ color: accentColor }} />
            </div>
            <h1 className="text-2xl font-black text-[var(--text)] mb-2">
              Connexion en cours…
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              Vous allez être redirigé vers votre tableau de bord.
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-20 h-20 rounded-3xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-black text-[var(--text)] mb-2">
              Connexion impossible
            </h1>
            <p className="text-sm text-[var(--text-muted)] mb-6">{errorMsg}</p>
            <button
              onClick={() => router.push(ROUTES.login)}
              className="w-full py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: accentColor }}
            >
              Aller à la connexion
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthHandoffPage() {
  return (
    <Suspense>
      <AuthHandoffContent />
    </Suspense>
  );
}