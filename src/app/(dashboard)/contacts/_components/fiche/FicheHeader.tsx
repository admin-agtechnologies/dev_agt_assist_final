// src/app/(dashboard)/contacts/_components/fiche/FicheHeader.tsx
"use client";
import { useState } from "react";
import { MessageCircle, Mail, ChevronDown, Plus, X, ArrowLeft } from "lucide-react";
import { StatusBadge, ScoreIndicator } from "../StatusBadge";
import { contactsRepository } from "@/repositories/contacts.repository";
import { useToast } from "@/components/ui/Toast";
import type { ContactDetail, ContactStatut } from "@/types/api/crm.types";

const STATUT_NEXT: Record<ContactStatut, ContactStatut[]> = {
  prospect: ["contact","client","inactif"],
  contact:  ["client","inactif"],
  client:   ["inactif"],
  inactif:  [],
};
const STATUT_LABELS: Record<ContactStatut, {fr:string;en:string}> = {
  prospect:{fr:"Prospect",en:"Prospect"}, contact:{fr:"Contact",en:"Contact"},
  client:{fr:"Client",en:"Client"}, inactif:{fr:"Inactif",en:"Inactive"},
};

interface Props {
  contact: ContactDetail; locale: "fr"|"en";
  theme: { primary: string }; onUpdate: (c: ContactDetail) => void; onClose?: () => void;
}

export function FicheHeader({ contact, locale, theme, onUpdate, onClose }: Props) {
  const toast = useToast();
  const [statutOpen, setStatutOpen] = useState(false);
  const [newTag, setNewTag]         = useState("");
  const [tagOpen, setTagOpen]       = useState(false);
  const [saving, setSaving]         = useState(false);

  const initials = contact.nom_complet.split(" ").slice(0,2).map(w=>w[0]??"").join("").toUpperCase()||"?";
  const nexts = STATUT_NEXT[contact.statut] ?? [];

  async function changeStatut(s: ContactStatut) {
    setSaving(true); setStatutOpen(false);
    try {
      const u = await contactsRepository.patch(contact.id, { statut: s });
      onUpdate(u);
      toast.success(locale==="fr"?"Statut mis à jour":"Status updated");
    } catch { toast.error(locale==="fr"?"Erreur":"Error"); }
    finally { setSaving(false); }
  }

  async function addTag() {
    if (!newTag.trim()) return;
    setSaving(true);
    try {
      const r = await contactsRepository.addTag(contact.id, newTag.trim());
      onUpdate({ ...contact, tags: r.tags });
      setNewTag(""); setTagOpen(false);
    } catch { toast.error(locale==="fr"?"Erreur":"Error"); }
    finally { setSaving(false); }
  }

  async function removeTag(tag: string) {
    try {
      const r = await contactsRepository.removeTag(contact.id, tag);
      onUpdate({ ...contact, tags: r.tags });
    } catch { toast.error(locale==="fr"?"Erreur":"Error"); }
  }

  return (
    <div className="shrink-0">
      {/* Bannière colorée + avatar */}
      <div className="relative h-24 rounded-t-none"
           style={{ background: `linear-gradient(135deg, ${theme.primary}22, ${theme.primary}08)` }}>
        {onClose && (
          <button onClick={onClose}
            className="absolute top-3 left-3 lg:hidden w-8 h-8 rounded-xl bg-white/80 backdrop-blur flex items-center justify-center shadow-sm">
            <ArrowLeft className="w-4 h-4 text-[var(--text)]" />
          </button>
        )}
        {/* Avatar positionné en bas de la bannière */}
        <div className="absolute -bottom-7 left-5">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white ring-4 ring-[var(--bg-card)] shadow-lg"
               style={{ background: `linear-gradient(135deg, ${theme.primary}cc, ${theme.primary})` }}>
            {initials}
          </div>
        </div>
      </div>

      {/* Infos principales */}
      <div className="px-5 pt-10 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-[var(--text)] truncate leading-tight">
              {contact.nom_complet}
            </h2>
            <p className="text-sm text-[var(--text-muted)]">{contact.phone}</p>
            {contact.email && (
              <p className="text-xs text-[var(--text-muted)] truncate">{contact.email}</p>
            )}
          </div>
          <ScoreIndicator score={contact.score} showLabel locale={locale} />
        </div>

        {/* Statut + score */}
        <div className="flex items-center gap-2 mt-3">
          <div className="relative">
            <button disabled={saving||nexts.length===0} onClick={() => setStatutOpen(v=>!v)}
              className="flex items-center gap-1.5 disabled:cursor-not-allowed">
              <StatusBadge statut={contact.statut} locale={locale} />
              {nexts.length > 0 && <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />}
            </button>
            {statutOpen && nexts.length > 0 && (
              <div className="absolute top-full left-0 mt-1.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-xl z-20 overflow-hidden min-w-[140px]">
                {nexts.map(s => (
                  <button key={s} onClick={() => changeStatut(s)}
                    className="w-full px-4 py-2.5 text-left text-sm text-[var(--text)] hover:bg-[var(--bg)] transition-colors flex items-center gap-2">
                    <span className="text-[var(--text-muted)]">→</span>
                    {locale==="fr"?STATUT_LABELS[s].fr:STATUT_LABELS[s].en}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {(contact.tags||[]).map(tag => (
            <span key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] bg-[var(--bg)] group">
              {tag}
              <button onClick={() => removeTag(tag)}
                className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {tagOpen ? (
            <div className="flex items-center gap-1.5">
              <input autoFocus type="text" value={newTag} onChange={e=>setNewTag(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter")addTag();if(e.key==="Escape"){setTagOpen(false);setNewTag("");}}}
                placeholder={locale==="fr"?"Tag…":"Tag…"}
                className="input-base py-0.5 px-2.5 text-xs h-7 w-24" />
              <button onClick={addTag} disabled={!newTag.trim()}
                className="text-xs font-semibold disabled:opacity-40"
                style={{color:theme.primary}}>OK</button>
              <button onClick={()=>{setTagOpen(false);setNewTag("");}}
                className="text-xs text-[var(--text-muted)]">✕</button>
            </div>
          ) : (
            <button onClick={() => setTagOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-dashed border-[var(--border)] text-xs text-[var(--text-muted)] hover:border-current transition-colors"
              style={{}} onMouseEnter={e=>(e.currentTarget.style.color=theme.primary)}
              onMouseLeave={e=>(e.currentTarget.style.color="")}>
              <Plus className="w-3 h-3" /> {locale==="fr"?"Tag":"Tag"}
            </button>
          )}
        </div>

        {/* Actions rapides */}
        <div className="flex gap-2 mt-4">
          <a href={`https://wa.me/${contact.phone.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-semibold text-white shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background:"linear-gradient(135deg,#25D366,#128C7E)" }}>
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
          {contact.email && (
            <a href={`mailto:${contact.email}`}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-semibold border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text)] transition-all">
              <Mail className="w-4 h-4" />
              Email
            </a>
          )}
        </div>
      </div>
    </div>
  );
}