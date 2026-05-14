// src/app/(dashboard)/contacts/_components/fiche/FicheKPIs.tsx
"use client";
import { useEffect, useState } from "react";
import { MessageCircle, Mail, PhoneForwarded, Clock, Calendar, ShoppingBag, Bed, Utensils, Briefcase, Package, MapPin, UserPlus, Folder } from "lucide-react";
import { Spinner } from "@/components/ui";
import { contactsRepository } from "@/repositories/contacts.repository";
import type { ActiveFeature } from "@/repositories/features.repository";
import type { ContactKPIs } from "@/types/api/crm.types";

const FEATURE_ICONS: Record<string, React.ComponentType<{className?:string}>> = {
  prise_rdv:Calendar, reservation_table:Utensils, reservation_chambre:Bed,
  commande_paiement:ShoppingBag, catalogue_services:Briefcase, catalogue_produits:Package,
  catalogue_trajets:MapPin, inscription:UserPlus, dossier_administratif:Folder,
};

function formatLast(iso: string|null, locale:"fr"|"en"): string {
  if (!iso) return "—";
  const d = Math.floor((Date.now()-new Date(iso).getTime())/86400000);
  if (d===0) return locale==="fr"?"Aujourd'hui":"Today";
  if (d===1) return locale==="fr"?"Hier":"Yesterday";
  if (d<30) return locale==="fr"?`${d} j`:`${d}d`;
  return new Date(iso).toLocaleDateString(locale==="fr"?"fr-FR":"en-US",{day:"2-digit",month:"short"});
}

function KPICard({ icon:Icon, label, value, accent }: {
  icon:React.ComponentType<{className?:string}>; label:string; value:string|number; accent:string;
}) {
  return (
    <div className="bg-[var(--bg-card)] rounded-2xl p-4 border border-[var(--border)] flex items-center gap-3 hover:shadow-sm transition-shadow">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
           style={{background:`${accent}12`}}>
        <span style={{color:accent}}><Icon className="w-5 h-5" /></span>
      </div>
      <div>
        <p className="text-[11px] text-[var(--text-muted)] font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-black text-[var(--text)] leading-tight">{value}</p>
      </div>
    </div>
  );
}

interface Props { contactId:string; activeFeatures:ActiveFeature[]; locale:"fr"|"en"; theme:{primary:string}; }

export function FicheKPIs({ contactId, activeFeatures, locale, theme }: Props) {
  const [data, setData]     = useState<ContactKPIs|null>(null);
  const [loading, setLoad]  = useState(true);
  const slugs = new Set(activeFeatures.map(f=>f.slug));

  useEffect(() => {
    setLoad(true);
    contactsRepository.getAnalyse(contactId)
      .then(r=>setData(r.kpis)).catch(()=>setData(null))
      .finally(()=>setLoad(false));
  }, [contactId]);

  if (loading) return <div className="flex items-center justify-center h-32"><Spinner /></div>;
  if (!data)   return <p className="text-center text-sm text-[var(--text-muted)] py-8">—</p>;

  const t = data.transversaux;
  const accent = theme.primary;

  return (
    <div className="p-4 space-y-5">
      {/* KPIs globaux */}
      <div>
        <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3">
          {locale==="fr"?"Vue globale":"Overview"}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <KPICard icon={MessageCircle} label={locale==="fr"?"Conversations":"Conversations"} value={t._conversations} accent={accent} />
          <KPICard icon={Mail}          label={locale==="fr"?"Emails envoyés":"Emails sent"}   value={t._emails}         accent="#3B82F6" />
          <KPICard icon={PhoneForwarded}label={locale==="fr"?"Transferts":"Handoffs"}           value={t._transferts}     accent="#F59E0B" />
          <KPICard icon={Clock}         label={locale==="fr"?"Dernière int.":"Last interaction"} value={formatLast(t._derniere_inter,locale)} accent="#8B5CF6" />
        </div>
      </div>

      {/* KPIs features actives */}
      {Object.entries(data.features).some(([s])=>slugs.has(s)) && (
        <div>
          <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3">
            {locale==="fr"?"Par feature active":"By active feature"}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(data.features)
              .filter(([s])=>slugs.has(s))
              .map(([slug,kpi]) => {
                const Icon = FEATURE_ICONS[slug]??Calendar;
                return <KPICard key={slug} icon={Icon} label={locale==="fr"?kpi.label_fr:kpi.label_en} value={kpi.valeur} accent={accent} />;
              })}
          </div>
        </div>
      )}
    </div>
  );
}