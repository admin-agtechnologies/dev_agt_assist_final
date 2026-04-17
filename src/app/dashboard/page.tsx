// src/app/dashboard/page.tsx
// Redirect vers /pme/dashboard — le dashboard PME reste dans /pme/dashboard
// Cette page est le point d'entrée post-login, elle redirige proprement.
import { redirect } from "next/navigation";

export default function DashboardRedirect() {
  redirect("/pme/dashboard");
}
