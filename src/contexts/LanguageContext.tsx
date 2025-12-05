"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "hi" | "te" | "kn" | "ml" | "ta";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, any> = {
  en: require("../i18n/locales/en.json"),
  hi: require("../i18n/locales/hi.json"),
  te: require("../i18n/locales/te.json"),
  kn: require("../i18n/locales/kn.json"),
  ml: require("../i18n/locales/ml.json"),
  ta: require("../i18n/locales/ta.json")
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("hallowallet-language") as Language;
    if (saved && translations[saved]) {
      setLanguageState(saved);
    } else {
      // Detect browser language
      const browserLang = navigator.language.split("-")[0];
      if (translations[browserLang as Language]) {
        setLanguageState(browserLang as Language);
      }
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("hallowallet-language", lang);
  };

  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  if (!mounted) return null;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
