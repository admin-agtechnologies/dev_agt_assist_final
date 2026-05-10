// ============================================================
// FICHIER : src/app/_components/landing/CtaSection.tsx
// Section CTA finale — fond vert sombre, bot icon, bouton inscription.
// ============================================================
"use client";
import Link from "next/link";
import { Bot, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ROUTES } from "@/lib/constants";

export function CtaSection() {
  const { dictionary: d, locale } = useLanguage();
  const t = d.landing;

  return (
    <section className="max-w-6xl mx-auto px-4 py-20">
      <div
        className="card p-12 text-center relative overflow-hidden border-0"
        style={{ background: "linear-gradient(135deg, #022c22 0%, #075E54 60%, #0a3d30 100%)" }}
      >
        {/* Orbes déco */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, #25D366 0%, transparent 50%), radial-gradient(circle at 80% 50%, #6C3CE1 0%, transparent 50%)",
          }}
        />

        <div className="relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-[#25D366]/20 flex items-center justify-center mx-auto mb-6 border border-[#25D366]/30">
            <Bot className="w-8 h-8 text-[#25D366]" />
          </div>

          <h2 className="text-3xl font-black text-white mb-4">
            {t.ctaTitle}
          </h2>

          <p className="text-white/60 text-sm mb-8 max-w-lg mx-auto">
            {t.ctaSubtitle}
          </p>

          <Link
            href={ROUTES.onboarding}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#25D366] text-white font-black text-base hover:bg-[#128C7E] transition-all hover:scale-105 shadow-lg shadow-[#25D366]/30"
          >
            {t.ctaBtn}
            <ArrowRight className="w-4 h-4" />
          </Link>

          <p className="mt-6 text-white/40 text-xs">
            {locale === "fr" ? "Sans carte bancaire requise · Annulable à tout moment" : "No credit card required · Cancel anytime"}
          </p>
        </div>
      </div>
    </section>
  );
}