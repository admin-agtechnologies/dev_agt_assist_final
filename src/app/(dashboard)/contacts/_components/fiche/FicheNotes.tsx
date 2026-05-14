// src/app/(dashboard)/contacts/_components/fiche/FicheNotes.tsx
"use client";
import { useState } from "react";
import { Plus, FileText, User, Clock } from "lucide-react";
import { contactsRepository } from "@/repositories/contacts.repository";
import { useToast } from "@/components/ui/Toast";
import type { ContactNote } from "@/types/api/crm.types";

interface Props {
  contactId:string; notes:ContactNote[];
  locale:"fr"|"en"; onUpdate:(notes:ContactNote[])=>void; theme:{primary:string};
}

function formatDate(iso:string, locale:"fr"|"en"): string {
  try {
    const n = iso.replace(" ","T").replace("+00:00","Z");
    const d = new Date(n);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString(locale==="fr"?"fr-FR":"en-US",
      {day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});
  } catch { return "—"; }
}

function initials(name:string): string {
  return name.split(" ").slice(0,2).map(w=>w[0]??"").join("").toUpperCase()||"?";
}

export function FicheNotes({ contactId, notes, locale, onUpdate, theme }: Props) {
  const toast = useToast();
  const [text, setText]   = useState("");
  const [open, setOpen]   = useState(false);
  const [saving, setSave] = useState(false);

  const safeNotes = Array.isArray(notes) ? notes.filter(n=>n&&typeof n==="object"&&n.text) : [];

  async function handleAdd() {
    if (!text.trim()) return;
    setSave(true);
    try {
      const r = await contactsRepository.addNote(contactId, text.trim());
      onUpdate(r.notes as ContactNote[]);
      setText(""); setOpen(false);
      toast.success(locale==="fr"?"Note ajoutée":"Note added");
    } catch { toast.error(locale==="fr"?"Erreur":"Error"); }
    finally { setSave(false); }
  }

  return (
    <div className="p-4 space-y-4">
      {/* Bouton / éditeur */}
      {!open ? (
        <button onClick={()=>setOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-[var(--border)] rounded-2xl text-sm text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--text-muted)] transition-all">
          <Plus className="w-4 h-4" />
          {locale==="fr"?"Ajouter une note":"Add a note"}
        </button>
      ) : (
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm">
          <textarea autoFocus value={text} onChange={e=>setText(e.target.value)}
            placeholder={locale==="fr"?"Saisissez votre note…":"Enter your note…"}
            rows={4} maxLength={2000}
            className="w-full px-4 pt-4 pb-2 text-sm text-[var(--text)] bg-transparent outline-none resize-none placeholder:text-[var(--text-muted)]" />
          <div className="flex items-center justify-between px-4 pb-3">
            <span className="text-[10px] text-[var(--text-muted)]">{text.length}/2000</span>
            <div className="flex gap-2">
              <button onClick={()=>{setOpen(false);setText("");}}
                className="px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                {locale==="fr"?"Annuler":"Cancel"}
              </button>
              <button onClick={handleAdd} disabled={!text.trim()||saving}
                className="px-4 py-1.5 text-xs font-semibold rounded-xl text-white disabled:opacity-50 transition-all"
                style={{background:theme.primary}}>
                {saving?(locale==="fr"?"…":"…"):(locale==="fr"?"Enregistrer":"Save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste des notes */}
      {safeNotes.length===0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-2"
               style={{background:`${theme.primary}10`}}>
            <FileText className="w-5 h-5" style={{color:theme.primary,opacity:0.4}} />
          </div>
          <p className="text-sm font-medium text-[var(--text)]">
            {locale==="fr"?"Aucune note":"No notes yet"}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {locale==="fr"?"Ajoutez des informations sur ce client":"Add information about this client"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {safeNotes.map((note,i) => (
            <div key={i} className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-4 hover:shadow-sm transition-shadow">
              <p className="text-sm text-[var(--text)] whitespace-pre-wrap leading-relaxed">{note.text}</p>
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[var(--border)]">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white"
                     style={{background:theme.primary}}>
                  {initials(note.author_name)}
                </div>
                <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                  <User className="w-3 h-3" />{note.author_name}
                </div>
                <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] ml-auto">
                  <Clock className="w-3 h-3" />{formatDate(note.created_at,locale)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}