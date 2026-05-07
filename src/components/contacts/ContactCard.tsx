// src/components/contacts/ContactCard.tsx
"use client";

import React from "react";
import { User, Phone, Mail } from "lucide-react";
import type { Client } from "@/types/api";

interface ContactCardProps {
  contact: Client;
  onClick?: () => void;
  /** Labels — viennent du dictionnaire appelant */
  labels: {
    phone: string;
    email: string;
    date: string;
  };
  /** Date formatée — fournie par le parent */
  dateFormatted: string;
}

export function ContactCard({
  contact,
  onClick,
  labels,
  dateFormatted,
}: ContactCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-white rounded-xl border border-gray-100 p-4 hover:border-gray-200 hover:shadow-sm transition-all flex items-start gap-3"
    >
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-[var(--color-primary)] bg-opacity-10 flex items-center justify-center flex-shrink-0">
        <User size={16} style={{ color: "var(--color-primary)" }} />
      </div>

      {/* Infos */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {contact.nom}
        </p>
        <div className="flex flex-col gap-0.5 mt-1">
          {contact.telephone && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Phone size={11} />
              {contact.telephone}
            </span>
          )}
          {contact.email && (
            <span className="flex items-center gap-1 text-xs text-gray-500 truncate">
              <Mail size={11} />
              {contact.email}
            </span>
          )}
        </div>
      </div>

      {/* Date */}
      <span className="text-xs text-gray-400 flex-shrink-0 mt-0.5">
        {dateFormatted}
      </span>
    </button>
  );
}