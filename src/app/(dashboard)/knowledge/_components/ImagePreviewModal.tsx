// src/app/(dashboard)/knowledge/_components/ImagePreviewModal.tsx
// S71 — Lightbox réutilisable pour preview image plein écran sur tous les onglets KB
"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface ImagePreviewModalProps {
  src:     string;
  alt:     string;
  onClose: () => void;
}

export function ImagePreviewModal({ src, alt, onClose }: ImagePreviewModalProps) {
  // Fermeture avec Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
      onClick={onClose}
    >
      {/* Bouton fermer */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20
          flex items-center justify-center transition-colors text-white z-10"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Image centrée — stoppe la propagation pour ne pas fermer en cliquant l'image */}
      <div
        className="relative max-w-3xl w-full max-h-[80vh] rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-contain bg-black"
          style={{ maxHeight: "80vh" }}
        />
        {/* Label */}
        <div className="absolute bottom-0 inset-x-0 px-4 py-3
          bg-gradient-to-t from-black/60 to-transparent">
          <p className="text-white text-sm font-medium truncate">{alt}</p>
        </div>
      </div>
    </div>
  );
}