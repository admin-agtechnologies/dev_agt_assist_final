// src/app/pme/knowledge/components/HoursEditor.tsx
"use client";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Spinner } from "@/components/ui";
import { Save, ToggleLeft, ToggleRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HorairesOuverture, DaySchedule } from "@/types/api";

export const DAYS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"] as const;
export type DayKey = typeof DAYS[number];

export function HoursEditor({
    title,
    hours,
    dayLabels,
    onToggle,
    onTimeChange,
    onSave,
    d,
}: {
    title: string;
    hours: HorairesOuverture;
    dayLabels: Record<DayKey, string>;
    onToggle: (day: DayKey) => void;
    onTimeChange: (day: DayKey, field: "start" | "end", value: string) => void;
    onSave: () => void;
    d: ReturnType<typeof useLanguage>["dictionary"];
}) {
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try { await onSave(); } finally { setSaving(false); }
    };

    return (
        <div className="card p-5 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">{title}</h3>
            {DAYS.map(day => {
                const val = hours[day] as DaySchedule | undefined;
                const isOpen = val?.open ?? false;
                return (
                    <div
                        key={day}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-xl transition-colors",
                            isOpen ? "bg-[var(--bg)]" : "bg-[var(--bg)]/40 opacity-60"
                        )}
                    >
                        <span className="text-xs font-bold w-16 text-[var(--text-muted)]">{dayLabels[day]}</span>
                        <button type="button" onClick={() => onToggle(day)} className="flex-shrink-0">
                            {isOpen
                                ? <ToggleRight className="w-5 h-5 text-[#25D366]" />
                                : <ToggleLeft  className="w-5 h-5 text-[var(--text-muted)]" />}
                        </button>
                        {isOpen ? (
                            <>
                                <input
                                    type="time"
                                    value={val?.start ?? "08:00"}
                                    onChange={e => onTimeChange(day, "start", e.target.value)}
                                    className="input-base py-1 text-xs w-24 flex-shrink-0"
                                />
                                <span className="text-xs text-[var(--text-muted)]">→</span>
                                <input
                                    type="time"
                                    value={val?.end ?? "18:00"}
                                    onChange={e => onTimeChange(day, "end", e.target.value)}
                                    className="input-base py-1 text-xs w-24 flex-shrink-0"
                                />
                            </>
                        ) : (
                            <span className="text-xs text-[var(--text-muted)] italic">Fermé</span>
                        )}
                    </div>
                );
            })}
            <div className="flex justify-end pt-1">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary flex items-center gap-2 text-sm py-1.5 px-4"
                >
                    {saving
                        ? <Spinner className="border-white/30 border-t-white w-3 h-3" />
                        : <Save className="w-3.5 h-3.5" />}
                    {d.common.save}
                </button>
            </div>
        </div>
    );
}