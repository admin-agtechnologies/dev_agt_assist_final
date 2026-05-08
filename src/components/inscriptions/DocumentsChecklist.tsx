"use client";
// src/components/inscriptions/DocumentsChecklist.tsx
// Utilisé aussi bien pour les Inscriptions que les Dossiers (même pattern backend)

import { CheckCircle2, Circle, AlertCircle } from "lucide-react";
import type { Locale } from "@/contexts/LanguageContext";

interface DocumentsChecklistProps {
  documentsRequis: string[];
  documentsFournis: string[];
  locale: Locale;
}

export function DocumentsChecklist({
  documentsRequis,
  documentsFournis,
  locale,
}: DocumentsChecklistProps) {
  if (documentsRequis.length === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)] italic">
        {locale === "fr" ? "Aucun document requis." : "No documents required."}
      </p>
    );
  }

  const fournis = new Set(documentsFournis);
  const manquants = documentsRequis.filter((d) => !fournis.has(d));
  const complet = manquants.length === 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
          {locale === "fr" ? "Documents" : "Documents"}
        </span>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            complet
              ? "bg-green-100 text-green-700"
              : "bg-orange-100 text-orange-700"
          }`}
        >
          {documentsFournis.length}/{documentsRequis.length}
          {!complet && (
            <span className="ml-1">
              <AlertCircle size={11} className="inline" />
            </span>
          )}
        </span>
      </div>

      <ul className="flex flex-col gap-1.5">
        {documentsRequis.map((doc) => {
          const estFourni = fournis.has(doc);
          return (
            <li key={doc} className="flex items-center gap-2 text-sm">
              {estFourni ? (
                <CheckCircle2 size={15} className="text-green-500 flex-shrink-0" />
              ) : (
                <Circle size={15} className="text-[var(--text-muted)] flex-shrink-0" />
              )}
              <span
                className={
                  estFourni
                    ? "text-[var(--text)] line-through opacity-60"
                    : "text-[var(--text)]"
                }
              >
                {doc}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}