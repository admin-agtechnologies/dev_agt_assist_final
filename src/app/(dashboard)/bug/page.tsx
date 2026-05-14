// src/app/(dashboard)/bug/page.tsx
"use client";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/Toast";
import { useSector } from "@/hooks/useSector";
import { AlertTriangle, Send, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { feedbackRepository } from "@/repositories";

const CATEGORIES = [
  { value: "bot",          label: "Bot / Assistant (WhatsApp ou Vocal)" },
  { value: "appointments", label: "Agenda / Rendez-vous" },
  { value: "billing",      label: "Facturation / Paiement" },
  { value: "dashboard",    label: "Tableau de bord / Statistiques" },
  { value: "login",        label: "Connexion / Accès" },
  { value: "other",        label: "Autre problème" },
] as const;

const SEVERITIES = [
  { value: "low",      label: "Mineur",   color: "#25D366", desc: "Gêne légère, rien d'urgent" },
  { value: "medium",   label: "Modéré",   color: "#F59E0B", desc: "Impact sur mon activité" },
  { value: "critical", label: "Critique", color: "#EF4444", desc: "Je ne peux plus utiliser la plateforme" },
] as const;

type CategoryValue = typeof CATEGORIES[number]["value"];
type SeverityValue = typeof SEVERITIES[number]["value"];

export default function BugPage() {
  const { dictionary: d } = useLanguage();
  const toast = useToast();
  const { theme } = useSector();

  const [category, setCategory]       = useState<CategoryValue | "">("");
  const [severity, setSeverity]       = useState<SeverityValue | "">("");
  const [title, setTitle]             = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving]           = useState(false);
  const [submitted, setSubmitted]     = useState(false);

  const canSubmit =
    category !== "" &&
    severity !== "" &&
    title.trim().length >= 5 &&
    description.trim().length >= 20;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    try {
      await feedbackRepository.createProbleme({
        categorie: category,
        severite: severity,
        titre: title.trim(),
        contenu: description.trim(),
      });
      setSubmitted(true);
      toast.success(d.bug?.successToast ?? "Signalement envoyé !");
    } catch {
      toast.error(d.common.error);
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setSubmitted(false);
    setCategory("");
    setSeverity("");
    setTitle("");
    setDescription("");
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-in">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
          style={{ backgroundColor: `${theme.primary}18` }}
        >
          <CheckCircle className="w-8 h-8" style={{ color: theme.primary }} />
        </div>
        <h2 className="text-xl font-black text-[var(--text)] mb-2">
          {d.bug?.successTitle ?? "Signalement reçu !"}
        </h2>
        <p className="text-sm text-[var(--text-muted)] max-w-sm">
          {d.bug?.successBody ?? "Notre équipe technique a été notifiée. Nous reviendrons vers vous dès que possible."}
        </p>
        <button
          onClick={reset}
          className="mt-6 text-sm font-semibold hover:underline"
          style={{ color: theme.primary }}
        >
          {d.bug?.another ?? "Signaler un autre problème"}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)]">{d.nav.bug}</h1>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">
          {d.bug?.subtitle ?? "Décrivez le problème rencontré. Notre équipe technique sera notifiée immédiatement."}
        </p>
      </div>

      <div className="card p-8 space-y-6">
        {/* Catégorie */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-[var(--text)]">
            {d.bug?.categoryLabel ?? "Quelle partie de la plateforme est concernée ?"}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={cn(
                  "p-3 rounded-xl border text-sm text-left transition-all",
                  category === cat.value
                    ? "font-semibold"
                    : "border-[var(--border)] text-[var(--text-muted)]"
                )}
                style={
                  category === cat.value
                    ? {
                        borderColor: theme.primary,
                        backgroundColor: `${theme.primary}10`,
                        color: theme.primary,
                      }
                    : {}
                }
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sévérité — couleurs sémantiques conservées (vert=mineur, jaune=modéré, rouge=critique) */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-[var(--text)]">
            {d.bug?.severityLabel ?? "Quel est l'impact sur votre activité ?"}
          </label>
          <div className="flex gap-3">
            {SEVERITIES.map((sev) => (
              <button
                key={sev.value}
                type="button"
                onClick={() => setSeverity(sev.value)}
                className={cn(
                  "flex-1 p-3 rounded-xl border text-sm text-center transition-all",
                  severity === sev.value
                    ? "font-semibold"
                    : "border-[var(--border)] text-[var(--text-muted)]"
                )}
                style={
                  severity === sev.value
                    ? { borderColor: sev.color, backgroundColor: `${sev.color}10`, color: sev.color }
                    : {}
                }
              >
                <span className="block font-semibold">{sev.label}</span>
                <span className="block text-[11px] mt-0.5 opacity-70">{sev.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Titre */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-[var(--text)]">
            {d.bug?.titleLabel ?? "Résumé du problème"}
          </label>
          <input
            type="text"
            className="input-base"
            placeholder={d.bug?.titlePlaceholder ?? "Ex: Le bot ne répond plus depuis ce matin"}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={150}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-[var(--text)]">
            {d.bug?.descLabel ?? "Description détaillée"}
          </label>
          <textarea
            className="input-base resize-none"
            rows={5}
            placeholder={d.bug?.descPlaceholder ?? "Décrivez précisément ce qui se passe, les étapes pour reproduire le problème..."}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={2000}
          />
          <div className="flex justify-between">
            <p className="text-[11px] text-[var(--text-muted)]">
              {d.bug?.minChars ?? "Minimum 20 caractères"}
            </p>
            <p className="text-[11px] text-[var(--text-muted)]">{description.length} / 2000</p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving || !canSubmit}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <AlertTriangle className="w-4 h-4" />
          {saving ? d.common.loading : (d.bug?.submitBtn ?? "Envoyer le signalement")}
        </button>
      </div>
    </div>
  );
}