"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";

type Goal = {
  id: string;
  label: string;
  category?: string;
  limit: number;
  month: string;
  period?: "weekly" | "monthly" | "yearly";
};

export default function GoalsWidget() {
  const { t } = useLanguage();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    console.log("[GoalsWidget] Loading goals...");
    // Get current month from URL
    const url = new URL(window.location.href);
    const month = url.searchParams.get("month") || new Date().toISOString().slice(0, 7);
    
    // Fetch goals for the selected month (yearly goals will show for all months in that year)
    const res = await fetch(`/api/goals?month=${month}`);
    if (res.ok) {
      const data = await res.json();
      console.log("[GoalsWidget] Loaded goals for", month, ":", data);
      setGoals(data);
    } else {
      console.error("[GoalsWidget] Failed to load goals:", res.status);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    
    // Listen for goal updates from assistant
    const handleUpdate = () => {
      console.log("[GoalsWidget] Received update event, reloading...");
      load();
    };
    document.addEventListener("hw:goals-updated", handleUpdate);
    document.addEventListener("hw:expenses-updated", handleUpdate);
    
    // Reload when URL changes (month filter)
    const handleUrlChange = () => load();
    window.addEventListener('popstate', handleUrlChange);
    
    // Check for URL changes periodically
    const interval = setInterval(() => {
      load();
    }, 1000);
    
    return () => {
      document.removeEventListener("hw:goals-updated", handleUpdate);
      document.removeEventListener("hw:expenses-updated", handleUpdate);
      window.removeEventListener('popstate', handleUrlChange);
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-950/80 hw-bg-card border border-slate-800 hw-border rounded-2xl p-4">
        <div className="text-xs text-slate-400 mb-2">{t("dashboard.yourGoals")}</div>
        <div className="text-xs text-slate-500">{t("common.loading")}</div>
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="hw-bg-card border hw-border rounded-2xl p-6 hover:scale-[1.01] transition-all">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <span className="text-sm font-bold">{t("dashboard.yourGoals")}</span>
          </div>
          <a 
            href="/goals" 
            className="hw-btn-secondary px-3 py-1.5 rounded-lg text-xs font-medium hover:scale-105 transition-all"
          >
            {t("dashboard.createGoal")} →
          </a>
        </div>
        <div className="text-center py-8">
          <div className="text-4xl mb-3 opacity-50">🎯</div>
          <div className="text-sm text-slate-400 mb-2">{t("dashboard.noGoals")}</div>
          <div className="text-xs text-slate-500">Set goals to track your spending</div>
        </div>
      </div>
    );
  }

  const categoryIcons: Record<string, string> = {
    Food: "🍔",
    Transit: "🚗",
    Shopping: "🛍️",
    Bills: "📄",
    Subscriptions: "📱",
    Other: "📦"
  };

  const periodColors: Record<string, string> = {
    weekly: "from-green-500 to-emerald-500",
    monthly: "from-blue-500 to-cyan-500",
    yearly: "from-purple-500 to-pink-500"
  };

  return (
    <div className="hw-bg-card border hw-border rounded-2xl p-4 hover:scale-[1.01] transition-all">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎯</span>
          <div className="text-sm font-bold text-white">{t("dashboard.yourGoals")} ({goals.length})</div>
        </div>
        <a 
          href="/goals" 
          className="hw-btn-secondary px-3 py-1.5 rounded-lg text-xs font-medium hover:scale-105 transition-all"
        >
          {t("dashboard.viewAll")} →
        </a>
      </div>
      
      {/* Goals List */}
      <div className="space-y-2">
        {goals.slice(0, 3).map((goal, index) => {
          const period = goal.period || "monthly";
          const categoryIcon = goal.category ? categoryIcons[goal.category] || "📦" : "🎯";
          
          return (
            <div 
              key={goal.id} 
              className="group relative bg-slate-900/50 border border-slate-700/50 rounded-xl p-3 hover:border-orange-500/50 transition-all cursor-pointer"
            >
              {/* Period badge */}
              <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full bg-gradient-to-r ${periodColors[period]} text-white text-[10px] font-bold`}>
                {period === "yearly" ? "Yearly" : period === "weekly" ? "Weekly" : "Monthly"}
              </div>
              
              <div className="flex items-center gap-3">
                {/* Icon */}
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-xl flex-shrink-0">
                  {categoryIcon}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Goal Name */}
                  <div className="text-sm font-semibold text-white mb-1 truncate">
                    {goal.label}
                  </div>
                  
                  {/* Category & Target in one line */}
                  <div className="flex items-center gap-2 text-xs">
                    {goal.category && (
                      <>
                        <span className="text-slate-400">{goal.category}</span>
                        <span className="text-slate-600">•</span>
                      </>
                    )}
                    <span className="text-green-400 font-bold">${goal.limit.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* More goals indicator */}
        {goals.length > 3 && (
          <div className="text-center pt-1">
            <a 
              href="/goals"
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              +{goals.length - 3} more →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
