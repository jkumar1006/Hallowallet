import { useEffect, useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import Link from "next/link";

type Expense = { description: string; amount: number };

type Props = {
  total: number;
  loading: boolean;
  expenses: Expense[];
};

type SpendingWatch = {
  id: string;
  category: string;
  threshold: number;
  currentSpending: number;
  percentUsed: number;
  shouldAlert: boolean;
};

export default function KeyStats({ total, loading, expenses }: Props) {
  const { t } = useLanguage();
  const [topWatch, setTopWatch] = useState<SpendingWatch | null>(null);
  const [watchError, setWatchError] = useState(false);
  const [currentMonth, setCurrentMonth] = useState("");

  useEffect(() => {
    async function loadWatch() {
      try {
        const url = new URL(window.location.href);
        const month = url.searchParams.get("month") || new Date().toISOString().slice(0, 7);
        setCurrentMonth(month);
        
        const res = await fetch(`/api/spending-watch?month=${month}`);
        if (res.ok) {
          const watches: SpendingWatch[] = await res.json();
          if (watches.length > 0) {
            const sorted = watches.sort((a, b) => b.percentUsed - a.percentUsed);
            setTopWatch(sorted[0]);
          } else {
            setTopWatch(null);
          }
          setWatchError(false);
        } else {
          setWatchError(true);
        }
      } catch (err) {
        console.error("[KeyStats] Error loading watch:", err);
        setWatchError(true);
      }
    }
    loadWatch();
    
    const interval = setInterval(loadWatch, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid md:grid-cols-4 gap-4">
      {/* Total Spent - Hero Card */}
      <div className="md:col-span-2 bg-gradient-to-br from-purple-900/30 via-pink-900/30 to-orange-900/30 border border-purple-700/50 rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-purple-500/20">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-lg">
            💰
          </div>
          <div className="text-xs text-purple-300 font-medium">{t("dashboard.totalSpent")} {t("dashboard.thisMonth")}</div>
        </div>
        <div className="text-4xl font-bold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
          {loading ? "…" : `$${total.toFixed(2)}`}
        </div>
        <div className="mt-2 text-xs text-purple-400">
          {expenses.length} transactions tracked
        </div>
      </div>

      {/* Spending Watch Card */}
      <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-700 rounded-2xl p-4 hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-blue-500/10">
        {watchError ? (
          <>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">📊</span>
              <div className="text-xs text-slate-400">Transactions</div>
            </div>
            <div className="text-2xl font-bold text-white">{expenses.length}</div>
            <div className="text-[10px] text-slate-500 mt-1">This month</div>
          </>
        ) : topWatch ? (
          <>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-lg">👀</span>
                <div className="text-xs text-slate-400">{topWatch.category}</div>
              </div>
              {topWatch.shouldAlert && (
                <span className="text-[9px] bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse font-bold">
                  ALERT
                </span>
              )}
            </div>
            <div className={`text-xl font-bold ${topWatch.shouldAlert ? 'text-red-400' : 'text-white'}`}>
              ${topWatch.currentSpending.toFixed(0)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              of ${topWatch.threshold.toFixed(0)} limit
            </div>
            {/* Progress Bar */}
            <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  topWatch.shouldAlert 
                    ? 'bg-gradient-to-r from-red-500 to-orange-500' 
                    : topWatch.percentUsed > 70
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500'
                }`}
                style={{ width: `${Math.min(topWatch.percentUsed, 100)}%` }}
              />
            </div>
            <Link 
              href={`/insights?month=${currentMonth}`}
              className="text-[10px] text-blue-400 hover:text-blue-300 mt-2 block"
            >
              Manage →
            </Link>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">👀</span>
              <div className="text-xs text-slate-400">Spending Watch</div>
            </div>
            <div className="text-sm text-slate-500 my-2">No watches set</div>
            <Link 
              href={`/insights?month=${currentMonth}`}
              className="text-[10px] text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
            >
              Add Watch →
            </Link>
          </>
        )}
      </div>

      {/* AI Insights Card */}
      <div className="bg-gradient-to-br from-green-950/50 to-emerald-950/50 border border-green-700/50 rounded-2xl p-4 hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-green-500/10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg animate-pulse">✨</span>
          <div className="text-xs text-green-400 font-medium">AI Insights</div>
        </div>
        <div className="text-2xl font-bold text-green-300">Live</div>
        <div className="text-[10px] text-green-400/80 mt-1 leading-relaxed">
          Smart suggestions appear below automatically
        </div>
      </div>
    </div>
  );
}
