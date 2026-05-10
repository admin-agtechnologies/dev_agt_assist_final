// ============================================================
// FICHIER : src/app/_components/landing/SectorsSection.tsx
// Section "Solutions par secteur" — fond sombre, grille 9 cartes.
// ============================================================
"use client";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ROUTES } from "@/lib/constants";
import { SECTORS } from "./LandingData";
import { SectorCard } from "./SectorCard";

export function SectorsSection() {
  const { locale } = useLanguage();

  const miniStats = [
    { value: "9",    fr: "Secteurs couverts", en: "Industries covered" },
    { value: "500+", fr: "Clients actifs",    en: "Active clients" },
    { value: "24/7", fr: "Disponibilité",     en: "Availability" },
  ];

  return (
    <section id="secteurs" className="relative overflow-hidden">
      {/* Fond sombre */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(160deg, #0a3d30 0%, #0f2744 45%, #1e1040 100%)" }}
      />
      {/* Grille déco */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,.15) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.15) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Orbes */}
      <div
        className="absolute top-[-150px] left-[10%] w-[600px] h-[600px] rounded-full blur-3xl opacity-[0.12]"
        style={{ background: "radial-gradient(circle, #25D366 0%, transparent 65%)" }}
      />
      <div
        className="absolute bottom-[-100px] right-[5%] w-[500px] h-[500px] rounded-full blur-3xl opacity-[0.14]"
        style={{ background: "radial-gradient(circle, #6C3CE1 0%, transparent 65%)" }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-24">
        {/* En-tête */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold mb-6 uppercase tracking-widest backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#25D366]" />
            {locale === "fr" ? "Solutions par secteur" : "Industry solutions"}
          </div>

          <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight"
            style={{ textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}>
            {locale === "fr"
              ? <>Une solution <span className="text-[#25D366]">sur mesure</span><br />pour chaque secteur</>
              : <>A <span className="text-[#25D366]">tailored solution</span><br />for every industry</>}
          </h2>

          <p className="text-white/75 max-w-2xl mx-auto text-lg leading-relaxed">
            {locale === "fr"
              ? "AGT Platform s'adapte à votre métier. Choisissez votre secteur pour découvrir une solution conçue spécifiquement pour vos besoins."
              : "AGT Platform adapts to your business. Choose your industry to discover a solution specifically designed for your needs."}
          </p>

          {/* Mini stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-10">
            {miniStats.map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl font-black text-white">{s.value}</p>
                <p className="text-xs text-white/55 font-semibold uppercase tracking-widest mt-1">
                  {locale === "fr" ? s.fr : s.en}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Grille 9 cartes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SECTORS.map((sector) => (
            <SectorCard key={sector.id} sector={sector} />
          ))}
        </div>

        {/* CTA bas de section */}
        <div className="text-center mt-16">
          <p className="text-white/50 text-sm mb-6">
            {locale === "fr"
              ? "Votre secteur n'est pas listé ? Contactez-nous pour une solution personnalisée."
              : "Your industry isn't listed? Contact us for a custom solution."}
          </p>
          <Link
            href={ROUTES.onboarding}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#25D366] text-white font-black text-base hover:bg-[#128C7E] transition-all hover:scale-105 shadow-lg shadow-[#25D366]/20"
          >
            {locale === "fr" ? "Créer mon assistant maintenant" : "Create my assistant now"}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}