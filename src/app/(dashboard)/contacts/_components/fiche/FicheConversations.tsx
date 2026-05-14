// src/app/(dashboard)/contacts/_components/fiche/FicheConversations.tsx
"use client";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, MessageCircle, PhoneForwarded, Zap, Calendar, Mail } from "lucide-react";
import { Spinner } from "@/components/ui";
import { contactsRepository } from "@/repositories/contacts.repository";
import type { ConversationCRM } from "@/types/api/crm.types";

const ACTION_ICONS: Record<string,React.ComponentType<{className?:string}>> = {
  appointment:Calendar, handoff:PhoneForwarded, faq:MessageCircle, service_info:Mail,
};

function ConvCard({ conv, locale, accent }: { conv:ConversationCRM; locale:"fr"|"en"; accent:string }) {
  const [open, setOpen] = useState(false);
  const r = conv.rapport;
  const date = new Date(conv.created_at).toLocaleDateString(locale==="fr"?"fr-FR":"en-US",
    {day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});

  const statutColor: Record<string,string> = {terminee:"text-emerald-600",en_cours:"text-blue-500",abandonnee:"text-gray-400"};
  const statutLabel: Record<string,{fr:string;en:string}> = {
    terminee:{fr:"Terminée",en:"Ended"},en_cours:{fr:"En cours",en:"Active"},abandonnee:{fr:"Abandonnée",en:"Abandoned"}
  };

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all ${open?"border-[var(--border)] shadow-sm":"border-[var(--border)]"}`}>
      <button onClick={()=>setOpen(v=>!v)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-card)] text-left transition-colors">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
             style={{background:`${accent}12`}}>
          <MessageCircle className="w-4 h-4" style={{color:accent}} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-[var(--text)]">{conv.bot_nom}</p>
            <span className={`text-xs font-medium ${statutColor[conv.statut]??"text-[var(--text-muted)]"}`}>
              {(statutLabel[conv.statut]??{fr:"?",en:"?"})[locale]}
            </span>
            {conv.human_handoff && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-orange-500 font-medium">
                <PhoneForwarded className="w-3 h-3" />{locale==="fr"?"Transfert":"Handoff"}
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{date} · {conv.nb_messages} msg</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {r && r.rdv_planifies>0 && <span className="text-xs font-bold text-emerald-600">{r.rdv_planifies} RDV</span>}
          {open ? <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" /> : <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-[var(--border)] px-4 py-4 bg-[var(--bg-card)] space-y-4">
          {r ? (
            <>
              {r.resume && (
                <div>
                  <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1.5">
                    {locale==="fr"?"Résumé IA":"AI Summary"}
                  </p>
                  <p className="text-sm text-[var(--text)] leading-relaxed">{r.resume}</p>
                </div>
              )}
              {r.points_cles?.length>0 && (
                <div>
                  <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1.5">
                    {locale==="fr"?"Points clés":"Key points"}
                  </p>
                  <ul className="space-y-1">
                    {r.points_cles.map((pt,i) => (
                      <li key={i} className="text-sm text-[var(--text)] flex items-start gap-1.5">
                        <span style={{color:accent}} className="mt-0.5 font-bold">·</span>{pt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {r.actions?.length>0 && (
                <div>
                  <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1.5">
                    {locale==="fr"?"Actions":"Actions"}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {r.actions.map((a,i) => {
                      const Icon = ACTION_ICONS[a.type]??Zap;
                      return (
                        <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)]">
                          <Icon className="w-3 h-3" />{a.label||a.detail||a.type}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="flex gap-4 text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border)]">
                <span>{r.tokens_utilises} tokens</span>
                {r.rdv_planifies>0 && <span className="text-emerald-600 font-semibold">{r.rdv_planifies} RDV</span>}
                {r.emails_envoyes>0 && <span>{r.emails_envoyes} emails</span>}
              </div>
            </>
          ) : (
            <p className="text-sm text-[var(--text-muted)] italic">
              {locale==="fr"?"Pas de rapport pour cette conversation.":"No report for this conversation."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

interface Props { contactId:string; locale:"fr"|"en"; theme:{primary:string}; }

export function FicheConversations({ contactId, locale, theme }: Props) {
  const [convs, setConvs]   = useState<ConversationCRM[]>([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [loading, setLoad]  = useState(true);

  useEffect(() => {
    setLoad(true);
    contactsRepository.getConversations(contactId,{page,page_size:10})
      .then(r=>{setConvs(r.results);setTotal(r.count);})
      .catch(()=>{setConvs([]);setTotal(0);})
      .finally(()=>setLoad(false));
  },[contactId,page]);

  if (loading) return <div className="flex items-center justify-center h-32"><Spinner /></div>;

  if (!convs.length) return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
           style={{background:`${theme.primary}10`}}>
        <MessageCircle className="w-6 h-6" style={{color:theme.primary,opacity:0.4}} />
      </div>
      <p className="text-sm font-medium text-[var(--text)]">
        {locale==="fr"?"Aucune conversation":"No conversations yet"}
      </p>
      <p className="text-xs text-[var(--text-muted)] mt-1">
        {locale==="fr"?"Les conversations avec le bot apparaîtront ici":"Bot conversations will appear here"}
      </p>
    </div>
  );

  const totalPages = Math.ceil(total/10);
  return (
    <div className="p-4 space-y-3">
      <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest">
        {total} {locale==="fr"?"conversation(s)":"conversation(s)"}
      </p>
      <div className="space-y-2">
        {convs.map(c => <ConvCard key={c.id} conv={c} locale={locale} accent={theme.primary} />)}
      </div>
      {totalPages>1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button disabled={page===1} onClick={()=>setPage(p=>p-1)}
            className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-medium text-[var(--text-muted)] disabled:opacity-40 hover:border-[var(--text-muted)] transition-colors">
            {locale==="fr"?"Préc.":"Prev"}
          </button>
          <span className="text-xs text-[var(--text-muted)]">{page}/{totalPages}</span>
          <button disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}
            className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-medium text-[var(--text-muted)] disabled:opacity-40 hover:border-[var(--text-muted)] transition-colors">
            {locale==="fr"?"Suiv.":"Next"}
          </button>
        </div>
      )}
    </div>
  );
}