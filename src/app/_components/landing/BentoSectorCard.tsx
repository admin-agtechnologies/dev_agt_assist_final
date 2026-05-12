// ============================================================
// FICHIER : src/app/_components/landing/BentoSectorCard.tsx
// Carte Bento individuelle — effet spot lumineux souris,
// lévitation Framer Motion, micro-features au hover.
// ============================================================
"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { type Sector, SECTOR_ICON_MAP, getSectorUrl } from "./LandingData";

interface Props {
  sector:   Sector;
  featured?: boolean; // col-span-2 row-span-2
  tall?:     boolean; // row-span-2
  wide?:     boolean; // col-span-2
}

export function BentoSectorCard({ sector, featured, tall, wide }: Props) {
  const { locale }                      = useLanguage();
  const cardRef                         = useRef<HTMLDivElement>(null);
  const [spot, setSpot]                 = useState({ x: 50, y: 50 });
  const [hovered, setHovered]           = useState(false);
  const Icon                            = SECTOR_ICON_MAP[sector.id];
  const name                            = locale === "fr" ? sector.nameFr  : sector.nameEn;
  const desc                            = locale === "fr" ? sector.descFr  : sector.descEn;
  const tag                             = locale === "fr" ? sector.tagFr   : sector.tagEn;
  const features                        = locale === "fr" ? sector.featuresFr : sector.featuresEn;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setSpot({
      x: ((e.clientX - rect.left) / rect.width)  * 100,
      y: ((e.clientY - rect.top)  / rect.height) * 100,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -8, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="relative rounded-3xl overflow-hidden cursor-pointer"
      style={{
        background:   "rgba(255,255,255,0.04)",
        backdropFilter: "blur(20px)",
        border:       hovered
          ? `1px solid ${sector.primary}60`
          : "1px solid rgba(255,255,255,0.08)",
        boxShadow:    hovered
          ? `0 30px 80px ${sector.primary}30, 0 8px 24px rgba(0,0,0,0.4)`
          : "0 4px 24px rgba(0,0,0,0.3)",
        transition:   "border-color 0.3s, box-shadow 0.3s",
        minHeight:    featured ? 360 : tall ? 300 : 200,
      }}
    >
      {/* Spot lumineux souris */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          opacity:    hovered ? 1 : 0,
          background: `radial-gradient(circle 200px at ${spot.x}% ${spot.y}%, ${sector.primary}22, transparent 70%)`,
        }}
      />

      {/* Image de fond */}
      <div className="absolute inset-0">
        <img
          src={sector.image}
          alt={name}
          className="w-full h-full object-cover"
          style={{ opacity: featured ? 0.18 : 0.12, transition: "opacity 0.4s" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: featured
              ? `linear-gradient(135deg, ${sector.primary}40 0%, #020617EE 60%)`
              : `linear-gradient(160deg, ${sector.primary}20 0%, #020617F0 70%)`,
          }}
        />
      </div>

      {/* Contenu */}
      <Link href={getSectorUrl(sector.id)} className="relative z-10 flex flex-col h-full p-6">

        {/* Header */}
        <div className="flex items-start justify-between mb-auto">
          <div>
            <span
              className="inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3"
              style={{ background: `${sector.primary}25`, color: sector.accent, border: `1px solid ${sector.primary}30` }}
            >
              {tag}
            </span>
            <h3
              className="font-black text-white leading-tight"
              style={{ fontSize: featured ? "1.75rem" : wide ? "1.4rem" : "1.1rem" }}
            >
              {name}
            </h3>
          </div>

          {/* Icône */}
          <motion.div
            animate={{ rotate: hovered ? 10 : 0, scale: hovered ? 1.15 : 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ml-3"
            style={{
              background: `${sector.primary}30`,
              border:     `1px solid ${sector.primary}50`,
              boxShadow:  hovered ? `0 0 20px ${sector.primary}40` : "none",
            }}
          >
            {Icon && <Icon className="w-6 h-6" style={{ color: sector.accent }} />}
          </motion.div>
        </div>

        {/* Description — visible si featured ou wide */}
        {(featured || wide) && (
          <p className="text-white/55 text-sm leading-relaxed mt-3 mb-4">{desc}</p>
        )}

        {/* Micro-features — apparaissent au hover */}
        <motion.div
          animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 8 }}
          transition={{ duration: 0.25 }}
          className="mt-4 space-y-1.5"
        >
          {features.slice(0, featured ? 4 : 3).map((f, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: sector.accent }} />
              <span className="text-xs text-white/65 font-medium">{f}</span>
            </div>
          ))}
        </motion.div>

        {/* Footer CTA */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/10">
          <span className="text-xs font-bold" style={{ color: sector.accent }}>
            {locale === "fr" ? "Découvrir" : "Explore"}
          </span>
          <motion.div
            animate={{ x: hovered ? 3 : 0, y: hovered ? -3 : 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: `${sector.primary}30`, border: `1px solid ${sector.primary}40` }}
          >
            <ArrowUpRight className="w-4 h-4" style={{ color: sector.accent }} />
          </motion.div>
        </div>
      </Link>
    </motion.div>
  );
}

// END OF FILE: src/app/_components/landing/BentoSectorCard.tsx