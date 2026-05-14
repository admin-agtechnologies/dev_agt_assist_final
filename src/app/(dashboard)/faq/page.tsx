// src/app/(dashboard)/faq/page.tsx
// Redirect permanent vers /knowledge
// Conserve la compatibilité avec les anciens bookmarks et liens engine.py

import { redirect } from "next/navigation";

export default function FaqRedirectPage() {
  redirect("/knowledge");
}