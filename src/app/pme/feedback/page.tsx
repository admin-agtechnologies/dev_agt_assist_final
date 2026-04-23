// src/app/pme/feedback/page.tsx
"use client";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/Toast";
import { Star, Send, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { feedbackRepository } from "@/repositories";

export default function FeedbackPage() {
  const { dictionary: d } = useLanguage();
  const toast = useToast();

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const LABELS = ["", "Mauvais", "Passable", "Bien", "Très bien", "Excellent !"] as const;

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error(d.feedback?.errorRating ?? "Veuillez sélectionner une note.");
      return;
    }
    if (comment.trim().length < 10) {
      toast.error(d.feedback?.errorComment ?? "Votre témoignage doit contenir au moins 10 caractères.");
      return;
    }
    setSaving(true);
    try {
      await feedbackRepository.createTemoignage({ note: rating, contenu: comment.trim() });
      setSubmitted(true);
      toast.success(d.feedback?.successToast ?? "Merci pour votre témoignage !");
    } catch {
      toast.error(d.common.error);
    } finally {
      setSaving(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-[#25D366]/10 flex items-center justify-center mb-6">
          <CheckCircle className="w-8 h-8 text-[#25D366]" />
        </div>
        <h2 className="text-xl font-black text-[var(--text)] mb-2">
          {d.feedback?.successTitle ?? "Témoignage envoyé !"}
        </h2>
        <p className="text-sm text-[var(--text-muted)] max-w-sm">
          {d.feedback?.successBody ?? "Merci de contribuer à l'amélioration de la plateforme."}
        </p>
        <button
          onClick={() => { setSubmitted(false); setRating(0); setComment(""); }}
          className="mt-6 text-sm text-[#075E54] font-semibold hover:underline"
        >
          {d.feedback?.another ?? "Laisser un autre témoignage"}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)]">
          {d.nav.feedback}
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">
          {d.feedback?.subtitle ?? "Partagez votre expérience avec AGT Platform."}
        </p>
      </div>

      <div className="card p-8 space-y-6">
        {/* Note */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-[var(--text)]">
            {d.feedback?.ratingLabel ?? "Votre note globale"}
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(star)}
                className={cn("transition-transform hover:scale-110", rating === star ? "scale-110" : "")}
              >
                <Star
                  className="w-10 h-10 transition-colors"
                  style={{
                    fill: star <= (hovered || rating) ? "#F59E0B" : "transparent",
                    color: star <= (hovered || rating) ? "#F59E0B" : "var(--border)",
                    strokeWidth: 1.5,
                  }}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-sm font-semibold text-[var(--text-muted)]">
                {LABELS[rating]}
              </span>
            )}
          </div>
        </div>

        {/* Commentaire */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-[var(--text)]">
            {d.feedback?.commentLabel ?? "Votre témoignage"}
          </label>
          <textarea
            className="input-base resize-none"
            rows={5}
            placeholder={d.feedback?.commentPlaceholder ?? "Décrivez votre expérience avec AGT Platform..."}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
          />
          <div className="flex justify-between">
            <p className="text-[11px] text-[var(--text-muted)]">
              {d.feedback?.minChars ?? "Minimum 10 caractères"}
            </p>
            <p className="text-[11px] text-[var(--text-muted)]">{comment.length} / 1000</p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving || rating === 0 || comment.trim().length < 10}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          {saving ? (d.common.loading) : (d.feedback?.submitBtn ?? "Envoyer mon témoignage")}
        </button>
      </div>
    </div>
  );
}