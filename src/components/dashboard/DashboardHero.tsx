"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import KeyStats from "./KeyStats";
import QuickActions from "./QuickActions";
import GoalsWidget from "./GoalsWidget";
import SubscriptionWidget from "./SubscriptionWidget";
import CategoryPie from "../charts/CategoryPie";
import SmartSuggestionsPanel from "../insights/SmartSuggestionsPanel";

type Expense = {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
};

export default function DashboardHero() {
  const { t } = useLanguage();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const url = new URL(window.location.href);
    const month = url.searchParams.get("month") || new Date().toISOString().slice(0, 7);
    const cat = url.searchParams.get("cat") || "All";
    const params = new URLSearchParams({ month, category: cat });
    const res = await fetch(`/api/expenses?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setExpenses(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    
    // Reload when URL changes (month/category filter)
    const handleUrlChange = () => load();
    window.addEventListener('popstate', handleUrlChange);
    
    // Also check for URL changes periodically
    const interval = setInterval(() => {
      const url = new URL(window.location.href);
      const currentMonth = url.searchParams.get("month") || new Date().toISOString().slice(0, 7);
      // Reload if month changed
      load();
    }, 1000);
    
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      clearInterval(interval);
    };
  }, []);

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome Header with Animation */}
      <div className="animate-fadeIn">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent mb-2">
          Welcome Back! 👋
        </h1>
        <p className="text-slate-400 text-sm">
          Here's your financial overview for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Key Stats - Full Width with Animation */}
      <div className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
        <KeyStats total={total} loading={loading} expenses={expenses} />
      </div>
      
      {/* Quick Actions - Full Width with Animation */}
      <div className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
        <QuickActions />
      </div>
      
      {/* Smart Suggestions - AI-Powered Insights with Highlight */}
      <div className="animate-fadeIn" style={{ animationDelay: '0.3s' }}>
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 rounded-3xl blur-lg opacity-20"></div>
          <div className="relative bg-gradient-to-br from-slate-950/95 to-slate-900/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-2xl animate-pulse">✨</span>
                <h2 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  AI-Powered Insights
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold animate-pulse">
                Live
              </span>
            </div>
            <SmartSuggestionsPanel />
          </div>
        </div>
      </div>
      
      {/* Widgets Grid - 2 Columns with Staggered Animation */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="animate-fadeIn" style={{ animationDelay: '0.4s' }}>
          <GoalsWidget />
        </div>
        <div className="animate-fadeIn" style={{ animationDelay: '0.5s' }}>
          <SubscriptionWidget />
        </div>
      </div>
      
      {/* Category Breakdown - Full Width with Enhanced Design */}
      <div className="animate-fadeIn" style={{ animationDelay: '0.6s' }}>
        <div className="bg-gradient-to-br from-slate-950 to-slate-900 hw-bg-card border border-slate-800 hw-border rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xl">
                📊
              </div>
              <div>
                <h3 className="text-base font-bold">{t("dashboard.categoryBreakdown")}</h3>
                <p className="text-xs text-slate-400">Visual spending analysis</p>
              </div>
            </div>
            <div className="text-xs text-slate-500">
              {expenses.length} transactions
            </div>
          </div>
          <CategoryPie expenses={expenses} />
        </div>
      </div>

    </div>
  );
}
