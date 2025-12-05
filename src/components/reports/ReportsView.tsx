"use client";

import { useEffect, useState } from "react";

type Summary = {
  total: number;
  byCategory: Record<string, number>;
  byMerchant: Record<string, number>;
};

type TimePeriod = "1month" | "3months" | "6months" | "1year";

export default function ReportsView() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("1month");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Calculate date range based on period
  function getDateRange(period: TimePeriod, year: number) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    let startDate: Date;
    let endDate: Date;

    if (year === currentYear) {
      // For current year, use current date as end
      endDate = now;
    } else {
      // For past years, use Dec 31 as end
      endDate = new Date(year, 11, 31);
    }

    switch (period) {
      case "1month":
        startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
        break;
      case "3months":
        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 2, 1);
        break;
      case "6months":
        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 5, 1);
        break;
      case "1year":
        startDate = new Date(year, 0, 1);
        endDate = new Date(year, 11, 31);
        break;
    }

    return {
      start: startDate.toISOString().slice(0, 7),
      end: endDate.toISOString().slice(0, 7)
    };
  }

  async function load() {
    const { start, end } = getDateRange(selectedPeriod, selectedYear);
    const r = await fetch(`/api/reports/summary?start=${start}&end=${end}`);
    if (r.ok) {
      setSummary(await r.json());
    }
  }

  useEffect(() => {
    load();
  }, [selectedPeriod, selectedYear]);

  async function downloadPDF() {
    const { start, end } = getDateRange(selectedPeriod, selectedYear);
    window.location.href = `/api/reports/export?start=${start}&end=${end}&format=pdf`;
  }

  async function downloadCSV() {
    const { start, end } = getDateRange(selectedPeriod, selectedYear);
    window.location.href = `/api/reports/export?start=${start}&end=${end}&format=csv`;
  }

  const currentYear = new Date().getFullYear();

  const periodLabels = {
    "1month": "Last 1 Month",
    "3months": "Last 3 Months",
    "6months": "Last 6 Months",
    "1year": "Full Year"
  };

  const handlePreviousYear = () => {
    setSelectedYear(selectedYear - 1);
  };

  const handleNextYear = () => {
    if (selectedYear < currentYear + 10) {
      setSelectedYear(selectedYear + 1);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">📊 Reports</h2>
      
      {/* Time Period & Year Selection */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-sm font-semibold">📅 Report Period</h3>
        
        <div className="space-y-3">
          {/* Period Selection */}
          <div>
            <label className="text-xs text-slate-400 mb-2 block">Time Period</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {(Object.keys(periodLabels) as TimePeriod[]).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    selectedPeriod === period
                      ? "bg-blue-600 text-white border-2 border-blue-400"
                      : "bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {periodLabels[period]}
                </button>
              ))}
            </div>
          </div>
          
          {/* Year Selection with Navigation */}
          <div>
            <label className="text-xs text-slate-400 mb-2 block">Year</label>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePreviousYear}
                className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-blue-500 transition-all flex items-center justify-center font-bold text-lg"
                title="Previous Year"
              >
                ◀
              </button>
              
              <div className="flex-1 flex justify-center">
                <div className="px-8 py-3 rounded-lg font-bold text-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white border-2 border-blue-400 shadow-lg min-w-[120px] text-center">
                  {selectedYear}
                </div>
              </div>
              
              <button
                onClick={handleNextYear}
                disabled={selectedYear >= currentYear + 10}
                className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-blue-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-slate-900 disabled:hover:border-slate-700 flex items-center justify-center font-bold text-lg"
                title="Next Year"
              >
                ▶
              </button>
            </div>
            <div className="text-center mt-2 text-[10px] text-slate-500">
              Navigate through years (2000 - {currentYear + 10})
            </div>
          </div>
        </div>
      </div>
      
      {/* Summary */}
      {summary && summary.total > 0 ? (
        <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-300">
              📊 Summary for {periodLabels[selectedPeriod]} ({selectedYear})
            </h3>
          </div>
          
          {/* Total Amount - Large Display */}
          <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-700/50 rounded-xl p-4 text-center">
            <div className="text-xs text-green-300 mb-1">Total Expenses</div>
            <div className="text-3xl font-bold text-green-400">
              ${summary.total.toFixed(2)}
            </div>
            <div className="text-[10px] text-green-300/70 mt-1">
              {Object.keys(summary.byCategory).length} categories
            </div>
          </div>
          
          {/* Category Breakdown */}
          <div>
            <div className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-2">
              <span>💰</span>
              <span>Breakdown by Category</span>
            </div>
            <div className="space-y-2">
              {Object.entries(summary.byCategory)
                .sort(([, a], [, b]) => b - a) // Sort by amount descending
                .map(([cat, amount]) => {
                  const percentage = (amount / summary.total) * 100;
                  const categoryIcons: Record<string, string> = {
                    Food: "🍔",
                    Transit: "🚗",
                    Bills: "📄",
                    Subscriptions: "📱",
                    Shopping: "🛍️",
                    Entertainment: "🎬",
                    Health: "🏥",
                    Other: "📦"
                  };
                  
                  return (
                    <div key={cat} className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 hover:bg-slate-900/70 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{categoryIcons[cat] || "📦"}</span>
                          <span className="text-xs font-semibold text-slate-200">{cat}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-slate-100">
                            ${amount.toFixed(2)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-6 text-center">
          <div className="text-4xl mb-3">📭</div>
          <div className="text-sm font-semibold text-slate-300 mb-1">No Data Available</div>
          <div className="text-xs text-slate-500">
            No expenses found for {periodLabels[selectedPeriod]} ({selectedYear})
          </div>
        </div>
      )}
      
      {/* Data Export Section */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-sm font-semibold">📥 Data Export</h3>
        <div>
          <div className="text-slate-400 text-[10px] mb-3">
            Export data for {periodLabels[selectedPeriod]} ({selectedYear}) as PDF or CSV format.
          </div>
          <div className="flex gap-3">
            <button
              onClick={downloadPDF}
              className="px-4 py-2 rounded-xl bg-red-600 border border-red-500 text-white text-xs font-semibold hover:bg-red-700 transition-all"
            >
              📄 Export PDF
            </button>
            <button
              onClick={downloadCSV}
              className="px-4 py-2 rounded-xl bg-green-600 border border-green-500 text-white text-xs font-semibold hover:bg-green-700 transition-all"
            >
              📊 Export CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
