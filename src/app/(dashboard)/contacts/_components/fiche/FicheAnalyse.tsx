// src/app/(dashboard)/contacts/_components/fiche/FicheAnalyse.tsx
"use client";
import { useEffect, useState } from "react";
import { Brain, TrendingUp, Heart, Wallet, Activity, Sparkles } from "lucide-react";
import { Spinner } from "@/components/ui";
import { contactsRepository } from "@/repositories/contacts.repository";
import type { ContactAnalyse } from "@/types/api/crm.types";

const TYPE_CFG = {
  interets:      { icon:Heart,      fr:"Intérêts",   en:"Interests",   color:"#EC4899", bg:"bg-pink-50 dark:bg-pink-950/30" },
  preferences:   { icon:TrendingUp, fr:"Préférences", en:"Preferences", color:"#3B82F6", bg:"bg-blue-50 dark:bg-blue-950/30" },
  budgets:       { icon:Wallet,     fr:"Budget",      en:"Budget",      color:"#10B981", bg:"bg-emerald-50 dark:bg-emerald-950/30" },
  comportements: { icon:Activity,   fr:"Comportement",en:"Behavior",    color:"#F59E0B", bg:"bg-amber-50 dark:bg-amber-950/30" },
} as const;

function poidsDots(poids:number) {
  return Array.from({length:3},(_,i)=>(
    <span key={i} className={`w-2 h-2 rounded-full inline-block ${i<Math.min(poids,3)?"opacity-100":"opacity-20"}`} />
  ));
}

interface Props { contactId:string; locale:"fr"|"en"; theme:{primary:string}; }

export function FicheAnalyse({ contactId, locale, theme }: Props) {
  const [data, setData]   = useState<ContactAnalyse|null>(null);
  const [loading, setLoad]= useState(true);

  useEffect(()=>{
    setLoad(true);
    contactsRepository.getAnalyse(contactId)
      .then(r=>setData(r.analyse)).catch(()=>setData(null))
      .finally(()=>setLoad(false));
  },[contactId]);

  if (loading) return <div className="flex items-center justify-center h-32"><Spinner /></div>;

  if (!data||data.total_signaux===0) return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
           style={{background:`${theme.primary}10`}}>
        <Brain className="w-6 h-6" style={{color:theme.primary,opacity:0.4}} />
      </div>
      <p className="text-sm font-medium text-[var(--text)]">
        {locale==="fr"?"Pas encore d'analyse":"No analysis yet"}
      </p>
      <p className="text-xs text-[var(--text-muted)] mt-1 max-w-48">
        {locale==="fr"
          ?"Le bot détecte automatiquement les signaux lors des conversations"
          :"The bot automatically detects signals during conversations"}
      </p>
    </div>
  );

  return (
    <div className="p-4 space-y-5">
      {/* Résumé */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]">
        <Sparkles className="w-4 h-4 shrink-0" style={{color:theme.primary}} />
        <p className="text-sm text-[var(--text)]">
          <span className="font-bold">{data.total_signaux}</span>{" "}
          {locale==="fr"?"signal(s) comportemental(aux) détecté(s)":"behavioral signal(s) detected"}
        </p>
      </div>

      {/* Top features */}
      {data.top_features.length>0 && (
        <div>
          <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">
            {locale==="fr"?"Features mentionnées":"Mentioned features"}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {data.top_features.map(f=>(
              <span key={f.slug}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white"
                style={{background:`${theme.primary}dd`}}>
                {f.slug}
                <span className="opacity-70 text-[10px]">×{f.poids_total}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Signaux par type */}
      {(Object.entries(TYPE_CFG) as [keyof typeof TYPE_CFG, typeof TYPE_CFG[keyof typeof TYPE_CFG]][]).map(([key,cfg])=>{
        const signals = data.par_type[key]||[];
        if (!signals.length) return null;
        const Icon = cfg.icon;
        return (
          <div key={key}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-3.5 h-3.5" style={{color:cfg.color}} />
              <p className="text-[11px] font-black uppercase tracking-widest" style={{color:cfg.color}}>
                {locale==="fr"?cfg.fr:cfg.en}
              </p>
            </div>
            <div className="space-y-1.5">
              {signals.map((s,i)=>(
                <div key={i} className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl ${cfg.bg}`}>
                  <p className="text-sm text-[var(--text)] flex-1">{s.valeur}</p>
                  <div className="flex items-center gap-0.5 shrink-0" style={{color:cfg.color}}>
                    {poidsDots(s.poids)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}