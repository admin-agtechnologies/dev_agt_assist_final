// src/hooks/useLanguage.ts
"use client";
import { useState, useCallback, useEffect } from "react";
import { LOCALE_KEY } from "@/lib/constants";

export type Lang = "fr" | "en";

export function useLanguage(): { lang: Lang; setLang: (l: Lang) => void } {
  const [lang, setLangState] = useState<Lang>("fr");

  useEffect(() => {
    const stored = localStorage.getItem(LOCALE_KEY) as Lang | null;
    if (stored === "fr" || stored === "en") setLangState(stored);
  }, []);

  const setLang = useCallback((l: Lang) => {
    localStorage.setItem(LOCALE_KEY, l);
    setLangState(l);
  }, []);

  return { lang, setLang };
}