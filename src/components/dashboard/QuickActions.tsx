"use client";

import { useLanguage } from "../../contexts/LanguageContext";

export default function QuickActions() {
  const { t } = useLanguage();
  
  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={() =>
          document.dispatchEvent(
            new CustomEvent("hw:add-expense-open")
          )
        }
        className="px-4 py-2 rounded-2xl bg-white text-black text-xs font-semibold hw-btn-primary transition-all"
      >
        + {t("dashboard.addExpense")}
      </button>
      <button
        onClick={() =>
          document.dispatchEvent(
            new CustomEvent("hw:assistant-focus")
          )
        }
        className="px-4 py-2 rounded-2xl bg-slate-900 border border-slate-700 text-xs hw-btn-secondary"
      >
        🎙 {t("dashboard.talkToAssistant")}
      </button>
      <a
        href="/insights"
        className="px-4 py-2 rounded-2xl bg-slate-900 border border-slate-700 text-xs hw-btn-secondary"
      >
        📊 {t("dashboard.viewInsights")}
      </a>
    </div>
  );
}
