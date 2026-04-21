// src/app/pme/feedback/page.tsx
"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/Toast";
import { Star, Send, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ENV } from "@/lib/env";

export default function FeedbackPage() {
    const { user } = useAuth();
    const { dictionary: d } = useLanguage();
    const toast = useToast();

    const [rating, setRating] = useState(0);
    const [hovered, setHovered] = useState(0);
    const [comment, setComment] = useState("");
    const [saving, setSaving] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error("Veuillez sélectionner une note avant d'envoyer.");
            return;
        }
        if (comment.trim().length < 10) {
            toast.error("Votre témoignage doit contenir au moins 10 caractères.");
            return;
        }

        setSaving(true);
        try {
            await fetch(`${ENV.API_URL}/api/v1/feedbacks/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tenant_id: user?.tenant_id,
                    author_name: user?.name,
                    rating,
                    comment: comment.trim(),
                    status: "new",
                    created_at: new Date().toISOString(),
                }),
            });
            setSubmitted(true);
            toast.success("Merci pour votre témoignage !");
        } catch {
            toast.error("Erreur lors de l'envoi. Veuillez réessayer.");
        } finally {
            setSaving(false);
        }
    };

    // ── Écran de confirmation ─────────────────────────────────────────────────
    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-[#25D366]/10 flex items-center justify-center mb-6">
                    <CheckCircle className="w-8 h-8 text-[#25D366]" />
                </div>
                <h2 className="text-xl font-black text-[var(--text)] mb-2">Merci pour votre témoignage !</h2>
                <p className="text-sm text-[var(--text-muted)] max-w-sm">
                    Votre avis nous aide à améliorer AGT Platform pour toutes les PME camerounaises.
                </p>
                <button
                    onClick={() => { setSubmitted(false); setRating(0); setComment(""); }}
                    className="mt-6 text-sm text-[#075E54] font-semibold hover:underline"
                >
                    Laisser un autre témoignage
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[var(--text)]">Votre témoignage</h1>
                <p className="text-sm text-[var(--text-muted)] mt-0.5">
                    Partagez votre expérience avec AGT Platform. Votre avis compte.
                </p>
            </div>

            {/* Card formulaire */}
            <div className="card p-8 space-y-8">

                {/* Étoiles */}
                <div className="space-y-3">
                    <p className="text-sm font-bold text-[var(--text)]">
                        Quelle note donnez-vous à AGT Platform ?
                    </p>
                    <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHovered(star)}
                                onMouseLeave={() => setHovered(0)}
                                className="transition-transform hover:scale-110 active:scale-95"
                                aria-label={`${star} étoile${star > 1 ? "s" : ""}`}
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
                                {["", "Mauvais", "Passable", "Bien", "Très bien", "Excellent !"][rating]}
                            </span>
                        )}
                    </div>
                </div>

                {/* Commentaire */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-[var(--text)]">
                        Votre témoignage
                    </label>
                    <textarea
                        className="input-base resize-none"
                        rows={5}
                        placeholder="Décrivez votre expérience avec AGT Platform. Comment la plateforme vous a-t-elle aidé dans votre activité ?"
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        maxLength={1000}
                    />
                    <div className="flex justify-between">
                        <p className="text-[11px] text-[var(--text-muted)]">
                            Minimum 10 caractères
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)]">
                            {comment.length} / 1000
                        </p>
                    </div>
                </div>

                {/* Auteur */}
                <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                    <div className="w-10 h-10 rounded-full bg-[#075E54]/10 flex items-center justify-center text-[#075E54] text-sm font-black flex-shrink-0">
                        {user?.name?.charAt(0).toUpperCase() ?? "?"}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-[var(--text)]">{user?.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">
                            Ce témoignage sera publié sous votre nom d&apos;entreprise.
                        </p>
                    </div>
                </div>

                {/* Bouton */}
                <button
                    onClick={handleSubmit}
                    disabled={saving || rating === 0 || comment.trim().length < 10}
                    className={cn(
                        "btn-primary w-full justify-center",
                        (saving || rating === 0 || comment.trim().length < 10) && "opacity-50 cursor-not-allowed"
                    )}
                >
                    {saving ? (
                        <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Envoi en cours…
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <Send className="w-4 h-4" />
                            Envoyer mon témoignage
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
}