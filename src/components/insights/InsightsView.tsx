"use client";

import SpendingWatch from "./SpendingWatch";
import MonthlyBarChart from "./MonthlyBarChart";
import TrendLineChart from "./TrendLineChart";
import SmartSuggestionsPanel from "./SmartSuggestionsPanel";

export default function InsightsView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">📊 Insights & Analytics</h2>
        <div className="text-xs text-slate-400">AI-powered insights with real-time analysis</div>
      </div>
      
      {/* Smart Suggestions - Prominent Position */}
      <div className="bg-gradient-to-br from-purple-950/20 to-blue-950/20 border border-purple-700/30 rounded-2xl p-6">
        <SmartSuggestionsPanel />
      </div>
      
      {/* Spending Alerts */}
      <SpendingWatch />
      
      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="hw-bg-card border hw-border rounded-2xl p-6">
          <MonthlyBarChart />
        </div>
        
        {/* Line Chart */}
        <div className="hw-bg-card border hw-border rounded-2xl p-6">
          <TrendLineChart />
        </div>
      </div>
    </div>
  );
}
