"use client";

import { useEffect, useState } from "react";

type Watch = {
  id: string;
  userId: string;
  category: string;
  threshold: number;
  period: "weekly" | "monthly" | "yearly" | "custom";
  month: string;
  rangeStart?: string;
  rangeEnd?: string;
  createdAt: string;
};

type WatchWithSpending = Watch & {
  currentSpending: number;
  percentUsed: number;
  shouldAlert: boolean;
};

export default function SpendingWatch() {
  const [watches, setWatches] = useState<WatchWithSpending[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWatch, setNewWatch] = useState({
    category: "",
    threshold: "",
    period: "monthly" as "weekly" | "monthly" | "yearly"
  });

  async function loadWatches() {
    try {
      const url = new URL(window.location.href);
      const month = url.searchParams.get("month") || new Date().toISOString().slice(0, 7);
      
      console.log("[SpendingWatch] Loading watches for month:", month);
      
      const res = await fetch(`/api/spending-watch?month=${month}`);
      console.log("[SpendingWatch] Load response status:", res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log("[SpendingWatch] Loaded watches:", data);
        setWatches(data);
      } else {
        const error = await res.text();
        console.error("[SpendingWatch] Failed to load watches:", res.status, error);
      }
    } catch (err) {
      console.error("[SpendingWatch] Error loading watches:", err);
    }
  }

  useEffect(() => {
    loadWatches();
    
    // Auto-refresh every 2 seconds for faster updates
    const interval = setInterval(() => loadWatches(), 2000);
    
    // Listen for expense and watch updates
    const handleUpdate = () => loadWatches();
    document.addEventListener("hw:expenses-updated", handleUpdate);
    document.addEventListener("hw:watches-updated", handleUpdate);
    window.addEventListener('popstate', handleUpdate);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener("hw:expenses-updated", handleUpdate);
      document.removeEventListener("hw:watches-updated", handleUpdate);
      window.removeEventListener('popstate', handleUpdate);
    };
  }, []);

  async function handleAddWatch(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      // Get month from URL (the month user is currently viewing)
      const url = new URL(window.location.href);
      const urlMonth = url.searchParams.get("month");
      const currentMonth = new Date().toISOString().slice(0, 7);
      const month = urlMonth || currentMonth;
      
      console.log("[SpendingWatch] URL:", window.location.href);
      console.log("[SpendingWatch] URL month param:", urlMonth);
      console.log("[SpendingWatch] Current month:", currentMonth);
      console.log("[SpendingWatch] Using month:", month);
      console.log("[SpendingWatch] Submitting watch:", {
        category: newWatch.category,
        threshold: parseFloat(newWatch.threshold),
        period: newWatch.period,
        month: month
      });
      
      const res = await fetch("/api/spending-watch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: newWatch.category,
          threshold: parseFloat(newWatch.threshold),
          period: newWatch.period,
          month: month
        })
      });
      
      console.log("[SpendingWatch] Response status:", res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log("[SpendingWatch] Watch created successfully:", data);
        setShowAddForm(false);
        setNewWatch({ category: "", threshold: "", period: "monthly" });
        loadWatches();
      } else {
        const error = await res.text();
        console.error("[SpendingWatch] Failed to create watch:", res.status, error);
        alert(`Failed to create watch: ${error}`);
      }
    } catch (err) {
      console.error("[SpendingWatch] Error creating watch:", err);
      alert(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async function handleDeleteWatch(id: string) {
    const res = await fetch(`/api/spending-watch/${id}`, {
      method: "DELETE"
    });
    
    if (res.ok) {
      setWatches(watches.filter(w => w.id !== id));
    }
  }

  function getPeriodLabel(watch: WatchWithSpending) {
    if (watch.period === "custom" && watch.rangeStart && watch.rangeEnd) {
      return `${watch.rangeStart} to ${watch.rangeEnd}`;
    }
    if (watch.period === "yearly") return "This Year";
    if (watch.period === "weekly") return "This Week";
    return "This Month";
  }

  return (
    <div className="bg-slate-950/90 hw-bg-card border border-slate-800 hw-border rounded-2xl p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-sm font-semibold">👀 Spending Watch</div>
          <div className="text-[10px] text-slate-500">
            Get alerts when you hit spending thresholds
            {watches.length > 0 && <span className="ml-2 text-blue-400">({watches.length} active)</span>}
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-xs hw-btn-secondary transition-all"
        >
          {showAddForm ? "Cancel" : "+ Add Watch"}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddWatch} className="bg-slate-900/50 rounded-lg p-3 space-y-3">
          <div>
            <label className="block text-xs text-slate-300 mb-1">Category to Watch</label>
            <input
              type="text"
              required
              value={newWatch.category}
              onChange={(e) => setNewWatch({ ...newWatch, category: e.target.value })}
              placeholder="e.g., Coffee, Clothes, Groceries, Slippers"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs hw-input"
            />
            <div className="text-[9px] text-slate-500 mt-1">
              Can be anything: food, coffee, shopping, entertainment, etc.
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-300 mb-1">Alert Threshold ($)</label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                value={newWatch.threshold}
                onChange={(e) => setNewWatch({ ...newWatch, threshold: e.target.value })}
                placeholder="80"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs hw-input"
              />
            </div>
            
            <div>
              <label className="block text-xs text-slate-300 mb-1">Period</label>
              <select
                value={newWatch.period}
                onChange={(e) => setNewWatch({ ...newWatch, period: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs hw-input"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={!newWatch.category || !newWatch.threshold}
            className="w-full py-2 rounded-lg bg-white text-black text-xs font-semibold hw-btn-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Watch
          </button>
          <div className="text-[9px] text-slate-500 text-center">
            Check browser console (F12) for debug info
          </div>
        </form>
      )}

      <div className="space-y-2">
        {watches.map(watch => (
          <div
            key={watch.id}
            className={`rounded-lg p-3 border transition-all ${
              watch.shouldAlert
                ? "bg-red-950/30 border-red-800/50"
                : watch.percentUsed > 70
                ? "bg-yellow-950/30 border-yellow-800/50"
                : "bg-slate-900/50 border-slate-800"
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold capitalize">{watch.category}</span>
                  {watch.shouldAlert && (
                    <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                      ALERT!
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {getPeriodLabel(watch)}
                  {watch.period === "monthly" && (
                    <span className="ml-1 text-slate-600">
                      • Created: {new Date(watch.month + '-01T00:00:00Z').toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDeleteWatch(watch.id)}
                className="text-slate-500 hover:text-red-400 text-xs transition-all"
                title="Remove watch"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Current Spending</span>
                <span className={watch.shouldAlert ? "text-red-400 font-semibold" : "text-white"}>
                  ${watch.currentSpending.toFixed(2)} / ${watch.threshold.toFixed(2)}
                </span>
              </div>
              
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className={`h-2 transition-all ${
                    watch.shouldAlert
                      ? "bg-red-500"
                      : watch.percentUsed > 70
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                  style={{ width: `${Math.min(watch.percentUsed, 100)}%` }}
                />
              </div>
              
              <div className="text-[10px] text-slate-500">
                {watch.percentUsed.toFixed(0)}% of threshold
              </div>
            </div>

            {watch.shouldAlert && (
              <div className="mt-2 pt-2 border-t border-red-800/30">
                <div className="text-xs text-red-300">
                  ⚠️ You've hit ${watch.threshold}! Time to chill on {watch.category} spending.
                </div>
              </div>
            )}
            
            {!watch.shouldAlert && watch.percentUsed > 70 && (
              <div className="mt-2 pt-2 border-t border-yellow-800/30">
                <div className="text-xs text-yellow-300">
                  ⚡ Getting close! ${(watch.threshold - watch.currentSpending).toFixed(2)} left before alert.
                </div>
              </div>
            )}
          </div>
        ))}
        
        {watches.length === 0 && !showAddForm && (
          <div className="text-center py-6 text-slate-500 text-xs">
            <div className="text-2xl mb-2">👀</div>
            <div>No spending watches yet.</div>
            <div className="text-[10px] mt-1">Add one to get alerts when you hit thresholds!</div>
          </div>
        )}
      </div>
    </div>
  );
}
