"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Expense = { category: string; amount: number };

const categoryColors: Record<string, string> = {
  Food: "bg-gradient-to-r from-orange-500 to-red-500",
  Transit: "bg-gradient-to-r from-blue-500 to-cyan-500",
  Bills: "bg-gradient-to-r from-purple-500 to-pink-500",
  Subscriptions: "bg-gradient-to-r from-green-500 to-emerald-500",
  Shopping: "bg-gradient-to-r from-yellow-500 to-orange-500",
  Other: "bg-gradient-to-r from-slate-500 to-slate-600"
};

const categoryIcons: Record<string, string> = {
  Food: "🍔",
  Transit: "🚗",
  Bills: "📄",
  Subscriptions: "📱",
  Shopping: "🛍️",
  Other: "📦"
};

export default function CategoryPie({ expenses }: { expenses: Expense[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("cat") || "All";
  
  const totals: Record<string, number> = {};
  expenses.forEach(e => {
    totals[e.category] = (totals[e.category] || 0) + e.amount;
  });
  const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  const sum = entries.reduce((s, [, v]) => s + v, 0);
  
  const handleCategoryClick = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("cat", category);
    router.push(`?${params.toString()}`);
  };
  
  if (!sum) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-3 opacity-50">📊</div>
        <div className="text-sm text-slate-400 mb-2">No expenses yet</div>
        <div className="text-xs text-slate-500">Add expenses to see breakdown</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Category Filter Chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleCategoryClick("All")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            currentCategory === "All"
              ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg"
              : "bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          All
        </button>
        {entries.map(([cat]) => (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              currentCategory === cat
                ? `${categoryColors[cat] || "bg-slate-700"} text-white shadow-lg scale-105`
                : "bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <span>{categoryIcons[cat] || "📦"}</span>
            <span>{cat}</span>
          </button>
        ))}
      </div>
      
      {/* Progress Bar */}
      <div className="flex h-4 overflow-hidden rounded-full bg-slate-900 shadow-inner">
        {entries.map(([cat, val]) => (
          <div
            key={cat}
            style={{ width: `${(val / sum) * 100}%` }}
            className={`h-full ${categoryColors[cat] || "bg-slate-700"} hover:opacity-80 transition-opacity cursor-pointer`}
            onClick={() => handleCategoryClick(cat)}
            title={`${cat}: $${val.toFixed(2)}`}
          />
        ))}
      </div>
      
      {/* Category List */}
      <div className="space-y-2">
        {entries.map(([cat, val]) => {
          const percentage = ((val / sum) * 100).toFixed(1);
          return (
            <div
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                currentCategory === cat
                  ? "bg-slate-800 border border-slate-700 scale-105"
                  : "bg-slate-900/50 hover:bg-slate-800/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${categoryColors[cat] || "bg-slate-700"} flex items-center justify-center text-xl shadow-lg`}>
                  {categoryIcons[cat] || "📦"}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{cat}</div>
                  <div className="text-xs text-slate-400">{percentage}% of total</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-400">${val.toLocaleString()}</div>
                <div className="text-xs text-slate-500">{expenses.filter(e => e.category === cat).length} items</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
