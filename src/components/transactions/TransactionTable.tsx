"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";

type Expense = {
  id: string;
  date: string;
  description: string;
  category: string;
  merchant?: string;
  amount: number;
  isSubscription?: boolean;
  notes?: string;
};

const categoryIcons: Record<string, string> = {
  Food: "🍔",
  Transit: "🚌",
  Shopping: "🛍️",
  Bills: "📄",
  Subscriptions: "📱",
  Entertainment: "🎬",
  Health: "🏥",
  Other: "📦"
};

const categoryColors: Record<string, string> = {
  Food: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  Transit: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  Shopping: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  Bills: "bg-red-500/10 text-red-400 border-red-500/30",
  Subscriptions: "bg-pink-500/10 text-pink-400 border-pink-500/30",
  Entertainment: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
  Health: "bg-green-500/10 text-green-400 border-green-500/30",
  Other: "bg-slate-500/10 text-slate-400 border-slate-500/30"
};

export default function TransactionTable() {
  const { t } = useLanguage();
  const [data, setData] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const url = new URL(window.location.href);
    const params = new URLSearchParams({
      month: url.searchParams.get("month") || new Date().toISOString().slice(0, 7),
      category: url.searchParams.get("cat") || "All"
    });
    const res = await fetch(`/api/expenses?${params.toString()}`);
    if (res.ok) {
      setData(await res.json());
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    
    const handleUpdate = () => load();
    document.addEventListener("hw:expenses-updated", handleUpdate);
    window.addEventListener('popstate', handleUpdate);
    
    const interval = setInterval(() => load(), 1000);
    
    return () => {
      document.removeEventListener("hw:expenses-updated", handleUpdate);
      window.removeEventListener('popstate', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  async function deleteExpense(id: string) {
    setDeleting(id);
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error(`Failed to delete: ${res.status}`);
      }
      setData(d => d.filter(x => x.id !== id));
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Failed to delete expense. Please try again.");
    } finally {
      setDeleting(null);
    }
  }

  // Group by date
  const groupedByDate = data.reduce((acc, expense) => {
    const date = expense.date.slice(0, 10);
    if (!acc[date]) acc[date] = [];
    acc[date].push(expense);
    return acc;
  }, {} as Record<string, Expense[]>);

  const dates = Object.keys(groupedByDate).sort().reverse();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold">💳 Transactions</h3>
          <p className="text-xs text-slate-400">
            {data.length} transaction{data.length !== 1 ? 's' : ''} • Total: ${data.reduce((s, e) => s + e.amount, 0).toFixed(2)}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="px-4 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 transition-all disabled:opacity-50 font-medium"
        >
          {loading ? "⏳ Loading..." : "🔄 Refresh"}
        </button>
      </div>

      {/* Transactions grouped by date */}
      <div className="space-y-4">
        {dates.map(date => {
          const dayExpenses = groupedByDate[date];
          const dayTotal = dayExpenses.reduce((s, e) => s + e.amount, 0);
          const dateObj = new Date(date + "T00:00:00");
          const isToday = date === new Date().toISOString().slice(0, 10);
          
          return (
            <div key={date} className="space-y-2">
              {/* Date header */}
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">
                    {isToday ? "Today" : dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  {isToday && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-medium">
                      TODAY
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400">
                  ${dayTotal.toFixed(2)}
                </span>
              </div>

              {/* Transactions for this date */}
              <div className="space-y-2">
                {dayExpenses.map(expense => {
                  const icon = categoryIcons[expense.category] || categoryIcons.Other;
                  const colorClass = categoryColors[expense.category] || categoryColors.Other;
                  
                  return (
                    <div
                      key={expense.id}
                      className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 hover:bg-slate-900/60 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        {/* Left: Icon + Details */}
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {/* Category icon */}
                          <div className={`w-10 h-10 rounded-lg ${colorClass} border flex items-center justify-center text-lg flex-shrink-0`}>
                            {icon}
                          </div>
                          
                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate flex items-center gap-2">
                              {expense.description}
                              {expense.isSubscription && (
                                <span className="text-xs bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/30" title="Recurring Subscription">
                                  🔄
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                              <span className={`px-2 py-0.5 rounded-full ${colorClass} border text-[10px] font-medium`}>
                                {expense.category}
                              </span>
                              {expense.merchant && (
                                <>
                                  <span>•</span>
                                  <span className="truncate">{expense.merchant}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Amount + Delete */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-right">
                            <div className="text-base font-bold text-white">
                              ${expense.amount.toFixed(2)}
                            </div>
                          </div>
                          <button
                            onClick={() => deleteExpense(expense.id)}
                            disabled={deleting === expense.id}
                            className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/30 disabled:opacity-50"
                            title="Delete transaction"
                          >
                            {deleting === expense.id ? "⏳" : "🗑️"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {!data.length && !loading && (
          <div className="text-center py-12 bg-slate-950/40 border border-slate-800 rounded-2xl">
            <div className="text-4xl mb-3">💸</div>
            <div className="text-sm font-medium text-slate-300 mb-1">No transactions yet</div>
            <div className="text-xs text-slate-500">
              Try: "Add 10 dollars coffee" in the AI assistant
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
