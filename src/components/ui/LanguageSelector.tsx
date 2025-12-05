"use client";

import { useLanguage } from "../../contexts/LanguageContext";

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "hi", name: "हिंदी", flag: "🇮🇳" },
    { code: "te", name: "తెలుగు", flag: "🇮🇳" },
    { code: "kn", name: "ಕನ್ನಡ", flag: "🇮🇳" },
    { code: "ml", name: "മലയാളം", flag: "🇮🇳" },
    { code: "ta", name: "தமிழ்", flag: "🇮🇳" }
  ];

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as any)}
      className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs hw-input"
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.flag} {lang.name}
        </option>
      ))}
    </select>
  );
}
