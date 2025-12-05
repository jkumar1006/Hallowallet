"use client";

import { useEffect, useState } from "react";

type Goal = {
  id: string;
  label: string;
  category?: string;
  limit: number;
  month: string;
  period?: "weekly" | "monthly" | "yearly";
};

type GoalWithTracking = Goal & {
  currentSpend: number;
  projectedSpend: number;
  remaining: number;
  percentUsed: number;
  status: "on-track" | "warning" | "exceeded";
  daysInPeriod: number;
  daysElapsed: number;
};

export default function GoalsView() {
  const [goals, setGoals] = useState<GoalWithTracking[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [newGoal, setNewGoal] = useState({
    label: "",
    limit: "",
    period: "monthly" as "weekly" | "monthly" | "yearly",
    category: ""
  });

  async function load() {
    // Get month from URL parameter
    const url = new URL(window.location.href);
    const month = url.searchParams.get("month") || new Date().toISOString().slice(0, 7);
    
    const res = await fetch(`/api/goals?month=${month}`);
    if (res.ok) {
      const goalsData = await res.json();
      
      // Fetch expenses for the selected month (for monthly goals)
      const monthExpensesRes = await fetch(`/api/expenses?month=${month}&category=All`);
      const monthExpenses = monthExpensesRes.ok ? await monthExpensesRes.json() : [];
      
      // Fetch ALL expenses (for yearly goals to calculate year-to-date)
      const allExpensesRes = await fetch(`/api/expenses?category=All`);
      const allExpenses = allExpensesRes.ok ? await allExpensesRes.json() : [];
      
      const enrichedGoals = goalsData.map((goal: Goal) => {
        // Use all expenses for yearly goals, month expenses for monthly goals
        const expensesToUse = goal.period === "yearly" ? allExpenses : monthExpenses;
        return calculateGoalTracking(goal, expensesToUse, month);
      });
      
      setGoals(enrichedGoals);
    }
  }

  function calculateGoalTracking(goal: Goal, expenses: any[], selectedMonth: string): GoalWithTracking {
    const now = new Date();
    const period = goal.period || "monthly";
    
    let startDate: Date;
    let endDate: Date;
    let daysInPeriod: number;
    
    if (period === "weekly") {
      // Weekly goals: Sunday to Saturday (UTC)
      const nowUTC = new Date();
      const dayOfWeek = nowUTC.getUTCDay(); // 0 = Sunday, 6 = Saturday
      const startOfWeek = new Date(Date.UTC(nowUTC.getUTCFullYear(), nowUTC.getUTCMonth(), nowUTC.getUTCDate() - dayOfWeek, 0, 0, 0));
      const endOfWeek = new Date(Date.UTC(nowUTC.getUTCFullYear(), nowUTC.getUTCMonth(), nowUTC.getUTCDate() - dayOfWeek + 6, 23, 59, 59));
      startDate = startOfWeek;
      endDate = endOfWeek;
      daysInPeriod = 7;
    } else if (period === "yearly") {
      // For yearly goals, use the year from the goal's month (UTC)
      const goalYear = parseInt(goal.month.slice(0, 4));
      startDate = new Date(Date.UTC(goalYear, 0, 1, 0, 0, 0));
      endDate = new Date(Date.UTC(goalYear, 11, 31, 23, 59, 59));
      daysInPeriod = 365;
    } else {
      // For monthly goals, use the selected month from URL (UTC)
      const [year, month] = selectedMonth.split('-').map(Number);
      startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
      endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));
      daysInPeriod = endDate.getUTCDate();
    }
    
    const daysElapsed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Filter expenses for this period (UTC)
    const periodExpenses = expenses.filter((e: any) => {
      const expenseDate = new Date(e.date + "T00:00:00.000Z");
      return expenseDate >= startDate && expenseDate <= endDate;
    });
    
    // Filter by category or description if specified
    let relevantExpenses = periodExpenses;
    
    if (goal.category && goal.category !== "All") {
      const searchTerm = goal.category.toLowerCase();
      relevantExpenses = periodExpenses.filter((e: any) => {
        const category = (e.category || "").toLowerCase();
        const description = (e.description || "").toLowerCase();
        
        // Match if category or description contains the search term
        // e.g., "Clothes" matches "clothes", "clothing", "cloth"
        return category.includes(searchTerm) || 
               description.includes(searchTerm) ||
               searchTerm.includes(category) ||
               searchTerm.includes(description);
      });
    }
    
    const currentSpend = relevantExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);
    const dailyAverage = currentSpend / daysElapsed;
    const projectedSpend = dailyAverage * daysInPeriod;
    const remaining = goal.limit - currentSpend;
    const percentUsed = (currentSpend / goal.limit) * 100;
    
    let status: "on-track" | "warning" | "exceeded";
    if (currentSpend > goal.limit) {
      status = "exceeded";
    } else if (projectedSpend > goal.limit) {
      status = "warning";
    } else {
      status = "on-track";
    }
    
    return {
      ...goal,
      currentSpend,
      projectedSpend,
      remaining,
      percentUsed,
      status,
      daysInPeriod,
      daysElapsed
    };
  }

  useEffect(() => {
    load();
    
    // Auto-refresh every 2 seconds to pick up new transactions
    const interval = setInterval(() => {
      load();
    }, 2000);
    
    // Listen for expense updates
    const handleUpdate = () => load();
    document.addEventListener("hw:expenses-updated", handleUpdate);
    
    // Reload when URL changes (month filter)
    const handleUrlChange = () => load();
    window.addEventListener('popstate', handleUrlChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener("hw:expenses-updated", handleUpdate);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  async function handleAddGoal(e: React.FormEvent) {
    e.preventDefault();
    
    // Get the selected month from URL (the month user is currently viewing)
    const url = new URL(window.location.href);
    const selectedMonth = url.searchParams.get("month") || new Date().toISOString().slice(0, 7);
    
    let month = selectedMonth;
    
    if (newGoal.period === "yearly") {
      month = selectedMonth.slice(0, 4); // Use year from selected month
    } else if (newGoal.period === "weekly") {
      month = selectedMonth + "-01"; // Use first day of selected month
    }
    
    const category = showCustomCategory && customCategory 
      ? customCategory 
      : newGoal.category;
    
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: newGoal.label,
        limit: parseFloat(newGoal.limit),
        month,
        period: newGoal.period,
        category: category || undefined
      })
    });
    
    if (res.ok) {
      setShowAddForm(false);
      setShowCustomCategory(false);
      setCustomCategory("");
      setNewGoal({ label: "", limit: "", period: "monthly", category: "" });
      load();
    }
  }

  async function handleDeleteGoal(goalId: string) {
    if (!confirm("Are you sure you want to delete this goal?")) return;
    
    const res = await fetch(`/api/goals/${goalId}`, {
      method: "DELETE"
    });
    
    if (res.ok) {
      setGoals(goals.filter(g => g.id !== goalId));
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case "on-track": return "✅";
      case "warning": return "⚠️";
      case "exceeded": return "❌";
      default: return "📊";
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "on-track": return "text-green-400";
      case "warning": return "text-yellow-400";
      case "exceeded": return "text-red-400";
      default: return "text-slate-400";
    }
  }

  function getProgressBarColor(status: string) {
    switch (status) {
      case "on-track": return "bg-green-500";
      case "warning": return "bg-yellow-500";
      case "exceeded": return "bg-red-500";
      default: return "bg-slate-500";
    }
  }

  function getPeriodLabel(period: string) {
    switch (period) {
      case "weekly": return "This Week";
      case "yearly": return "This Year";
      default: return "This Month";
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Spending Goals</h2>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            if (showAddForm) {
              setShowCustomCategory(false);
              setCustomCategory("");
              setNewGoal({ label: "", limit: "", period: "monthly", category: "" });
            }
          }}
          className="px-4 py-2 rounded-2xl bg-white text-black text-xs font-semibold hw-btn-primary transition-all"
        >
          {showAddForm ? "Cancel" : "+ Add Goal"}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddGoal} className="bg-slate-950/90 hw-bg-card border border-slate-800 hw-border rounded-2xl p-4 space-y-3">
          <div>
            <label className="block text-xs text-slate-300 mb-1">Goal Description</label>
            <input
              type="text"
              required
              value={newGoal.label}
              onChange={(e) => setNewGoal({ ...newGoal, label: e.target.value })}
              placeholder="e.g., Stay under budget for November"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs hw-input"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-300 mb-1">Spending Limit ($)</label>
              <input
                type="number"
                required
                step="0.01"
                value={newGoal.limit}
                onChange={(e) => setNewGoal({ ...newGoal, limit: e.target.value })}
                placeholder="1200"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs hw-input"
              />
            </div>
            
            <div>
              <label className="block text-xs text-slate-300 mb-1">Period</label>
              <select
                value={newGoal.period}
                onChange={(e) => setNewGoal({ ...newGoal, period: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs hw-input"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-xs text-slate-300 mb-1">Category (Optional)</label>
            {!showCustomCategory ? (
              <div className="space-y-2">
                <select
                  value={newGoal.category}
                  onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs hw-input"
                >
                  <option value="">All Categories</option>
                  <option value="Food">Food</option>
                  <option value="Transit">Transit</option>
                  <option value="Bills">Bills</option>
                  <option value="Subscriptions">Subscriptions</option>
                  <option value="Other">Other</option>
                </select>
                <button
                  type="button"
                  onClick={() => setShowCustomCategory(true)}
                  className="text-xs text-blue-400 hover:text-blue-300 hw-text-primary"
                >
                  + Add custom category
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter custom category"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs hw-input"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomCategory(false);
                    setCustomCategory("");
                  }}
                  className="text-xs text-slate-400 hover:text-slate-300"
                >
                  ← Back to preset categories
                </button>
              </div>
            )}
          </div>
          
          <button
            type="submit"
            className="w-full py-2 rounded-xl bg-white text-black text-xs font-semibold hw-btn-primary transition-all"
          >
            Create Goal
          </button>
        </form>
      )}

      <div className="space-y-3">
        {goals.map(goal => (
          <div
            key={goal.id}
            className="bg-slate-950/90 hw-bg-card border border-slate-800 hw-border rounded-2xl p-4 space-y-3"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="font-semibold text-slate-100 text-sm">{goal.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {getPeriodLabel(goal.period || "monthly")}
                  {goal.category && ` • ${goal.category}`}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`text-2xl ${getStatusColor(goal.status)}`}>
                  {getStatusIcon(goal.status)}
                </div>
                <button
                  onClick={() => handleDeleteGoal(goal.id)}
                  className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded hover:bg-red-950/30 transition-all"
                  title="Delete goal"
                >
                  🗑️
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Progress</span>
                <span className={getStatusColor(goal.status)}>
                  ${goal.currentSpend.toFixed(2)} / ${goal.limit.toFixed(2)}
                </span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className={`h-3 transition-all ${getProgressBarColor(goal.status)}`}
                  style={{ width: `${Math.min(goal.percentUsed, 100)}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-500">
                {goal.percentUsed.toFixed(1)}% used • Day {goal.daysElapsed} of {goal.daysInPeriod}
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-lg p-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Current Spending:</span>
                <span className="text-white font-semibold">${goal.currentSpend.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Remaining Budget:</span>
                <span className={goal.remaining < 0 ? "text-red-400" : "text-green-400"}>
                  ${Math.abs(goal.remaining).toFixed(2)} {goal.remaining < 0 ? "over" : "under"}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <div className={`font-semibold ${getStatusColor(goal.status)}`}>
                  {goal.status === "on-track" && "✅ On Track - Goal will be met at current pace"}
                  {goal.status === "warning" && "⚠️ Warning - Projected to exceed goal"}
                  {goal.status === "exceeded" && "❌ Over Budget - Goal exceeded"}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {!goals.length && !showAddForm && (
          <div className="text-center py-8 text-slate-500 text-sm">
            <div className="text-4xl mb-2">🎯</div>
            <div>No goals yet. Create one to track your spending!</div>
          </div>
        )}
      </div>
    </div>
  );
}
