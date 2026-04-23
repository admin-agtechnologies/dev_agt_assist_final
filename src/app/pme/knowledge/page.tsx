// src/app/pme/knowledge/page.tsx
"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { SectionHeader } from "@/components/ui";
import { cn } from "@/lib/utils";
import { Building2, MapPin, BookOpen, Wrench } from "lucide-react";
import { TabGeneral }   from "./components/TabGeneral";
import { TabLocations } from "./components/TabLocations";
import { TabFaq }       from "./components/TabFaq";
import { TabServices }  from "./components/TabServices";

type Tab = "general" | "locations" | "faq" | "services";

export default function PmeKnowledgePage() {
    const { user } = useAuth();
    const { dictionary: d, locale } = useLanguage();
    const t = d.knowledge;
    const [activeTab, setActiveTab] = useState<Tab>("general");

    const entrepriseId = user?.entreprise?.id ?? "";

    const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
        { id: "general",   label: t.tabGeneral,  icon: Building2 },
        { id: "locations", label: t.tabLocations, icon: MapPin    },
        { id: "faq",       label: t.tabFaq,       icon: BookOpen  },
        { id: "services",  label: t.tabServices,  icon: Wrench    },
    ];

    if (!user || !entrepriseId) return null;

    return (
        <div className="space-y-6 animate-fade-in">
            <SectionHeader title={t.title} subtitle={t.subtitle} />

            {/* Onglets */}
            <div className="flex gap-1 p-1 bg-[var(--bg)] rounded-xl border border-[var(--border)] w-fit overflow-x-auto">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap",
                                activeTab === tab.id
                                    ? "bg-[var(--bg-card)] text-[var(--text)] shadow-sm"
                                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Contenu onglet actif */}
            {activeTab === "general"   && <TabGeneral   entrepriseId={entrepriseId} d={d} locale={locale} />}
            {activeTab === "locations" && <TabLocations entrepriseId={entrepriseId} d={d} />}
            {activeTab === "faq"       && <TabFaq       entrepriseId={entrepriseId} d={d} />}
            {activeTab === "services"  && <TabServices  entrepriseId={entrepriseId} d={d} />}
        </div>
    );
}