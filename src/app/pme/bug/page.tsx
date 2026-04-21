// src/app/pme/bug/page.tsx
"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { AlertTriangle, Send, CheckCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ENV } from "@/lib/env";

// Catégories de problèmes
const CATEGORIES = [
    { value: "bot", label: "Bot / Assistant (WhatsApp ou Vocal)" },
    { value: "appointments", label: "Agenda / Rendez-vous" },
    { value: "billing", label: "Facturation / Paiement" },
    { value: "dashboard", label: "Tableau de bord / Statistiques" },
    { value: "login", label: "Connexion / Accès" },
    { value: "other", label: "Autre problème" },
];

const SEVERITIES = [
    { value: "low", label: "Mineur", color: "#25D366", desc: "Gêne légère, rien d'urgent" },
    { value: "medium", label: "Modéré", color: "#F59E0B", desc: "Impact sur mon activité" },
    { value: "critical", label: "Critique", color: "#EF4444", desc: "Je ne peux plus utiliser la plateforme" },
];

export default function BugPage() {
    const { user } = useAuth();
    const toast = useToast();

    const [category, setCategory] = useState("");
    const [severity, setSeverity] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [saving, setSaving] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const canSubmit = category && severity && title.trim().length >= 5 && description.trim().length >= 20;

    const handleSubmit = async () => {
        if (!canSubmit) return;
        setSaving(true);
        try {
            await fetch(`${ENV.API_URL}/api/v1/feedbacks/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tenant_id: user?.tenant_id,
                    author_name: user?.name,
                    type: "bug",
                    category,
                    severity,
                    title: title.trim(),
                    description: description.trim(),
                    status: "new",
                    created_at: new Date().toISOString(),
                }),
            });
            setSubmitted(true);
            toast.success("Signalement envoyé. Merci, nous allons investiguer !");
        } catch {
            toast.error("Erreur lors de l'envoi. Veuillez réessayer.");
        } finally {
            setSaving(false);
        }
    };

    // ── Confirmation ──────────────────────────────────────────────────────────
    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-[#25D366]/10 flex items-center justify-center mb-6">
                    <CheckCircle className="w-8 h-8 text-[#25D366]" />
                </div>
                <h2 className="text-xl font-black text-[var(--text)] mb-2">Signalement reçu !</h2>
                <p className="text-sm text-[var(--text-muted)] max-w-sm">
                    Notre équipe technique a été notifiée. Nous reviendrons vers vous dès que possible.
                </p>
                <button
                    onClick={() => { setSubmitted(false); setCategory(""); setSeverity(""); setTitle(""); setDescription(""); }}
                    className="mt-6 text-sm text-[#075E54] font-semibold hover:underline"
                >
                    Signaler un autre problème
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[var(--text)]">Signaler un problème</h1>
                <p className="text-sm text-[var(--text-muted)] mt-0.5">
                    Décrivez le problème rencontré. Notre équipe technique sera notifiée immédiatement.
                </p>
            </div>

            <div className="card p-8 space-y-6">

                {/* Catégorie */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-[var(--text)]">
                        Quelle partie de la plateforme est concernée ?
                    </label>
                    <div className="relative">
                        <select
                            className="input-base appearance-none pr-10"
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                        >
                            <option value="">Sélectionner une catégorie…</option>
                            {CATEGORIES.map(c => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
                    </div>
                </div>

                {/* Sévérité */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-[var(--text)]">
                        Quel est l&apos;impact de ce problème ?
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {SEVERITIES.map(s => (
                            <button
                                key={s.value}
                                type="button"
                                onClick={() => setSeverity(s.value)}
                                className={cn(
                                    "p-3 rounded-xl border-2 text-left transition-all",
                                    severity === s.value
                                        ? "border-current shadow-sm"
                                        : "border-[var(--border)] hover:border-[var(--text-muted)]"
                                )}
                                style={severity === s.value
                                    ? { borderColor: s.color, backgroundColor: `${s.color}10` }
                                    : {}
                                }
                            >
                                <p className="text-xs font-black" style={{ color: s.color }}>{s.label}</p>
                                <p className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-tight">{s.desc}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Titre */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-[var(--text)]">
                        Résumé du problème
                    </label>
                    <input
                        className="input-base"
                        placeholder="Ex: Le bot ne répond plus aux messages WhatsApp depuis ce matin"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        maxLength={200}
                    />
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-[var(--text)]">
                        Description détaillée
                    </label>
                    <textarea
                        className="input-base resize-none"
                        rows={5}
                        placeholder="Décrivez ce qui s'est passé, les étapes pour reproduire le problème, ce que vous attendiez et ce qui s'est produit à la place…"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        maxLength={2000}
                    />
                    <div className="flex justify-between">
                        <p className="text-[11px] text-[var(--text-muted)]">Minimum 20 caractères</p>
                        <p className="text-[11px] text-[var(--text-muted)]">{description.length} / 2000</p>
                    </div>
                </div>

                {/* Alerte sévérité critique */}
                {severity === "critical" && (
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-bold text-red-700 dark:text-red-400">Problème critique signalé</p>
                            <p className="text-xs text-red-600 dark:text-red-300 mt-0.5">
                                Notre équipe sera notifiée en priorité. Vous pouvez aussi nous contacter directement via WhatsApp.
                            </p>
                        </div>
                    </div>
                )}

                {/* Info expéditeur */}
                <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                    <div className="w-9 h-9 rounded-full bg-[#075E54]/10 flex items-center justify-center text-[#075E54] text-sm font-black flex-shrink-0">
                        {user?.name?.charAt(0).toUpperCase() ?? "?"}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-[var(--text)]">{user?.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">{user?.email}</p>
                    </div>
                </div>

                {/* Bouton */}
                <button
                    onClick={handleSubmit}
                    disabled={saving || !canSubmit}
                    className={cn(
                        "btn-primary w-full justify-center",
                        (saving || !canSubmit) && "opacity-50 cursor-not-allowed"
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
                            Envoyer le signalement
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
}