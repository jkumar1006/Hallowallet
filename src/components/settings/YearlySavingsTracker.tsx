"use client";

import { useEffect, useState } from "react";

type MonthData = {
  month: string;
  expenses: number;
  allowedBudget: number;
  status: "good" | "warning" | "over";
};

type YearlyProfile = {
  year: number;
  monthlyIncome: number;
  yearlySavingsGoal: number;
  effectiveMonth?: string; // When this profile became active (e.g., "2025-03")
};

export default function YearlySavingsTracker() {
  const [profile, setProfile] = useState<any>(null);
  const [yearlyData, setYearlyData] = useState<MonthData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editIncome, setEditIncome] = useState("");
  const [editSavings, setEditSavings] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number | "all">("all");

  async function loadData() {
    try {
      // Load financial profile
      const profileRes = await fetch("/api/financial-profile");
      if (!profileRes.ok) return;
      const profileData = await profileRes.json();
      setProfile(profileData);
      
      // Set edit values
      setEditIncome(profileData.monthlyIncome?.toString() || "");
      setEditSavings(profileData.yearlySavingsGoal?.toString() || "");

      // Load all expenses to find available years
      const allExpensesRes = await fetch("/api/expenses?category=All");
      let years = new Set<number>();
      years.add(new Date().getFullYear()); // Always include current year
      
      if (allExpensesRes.ok) {
        const allExpenses = await allExpensesRes.json();
        allExpenses.forEach((e: any) => {
          const year = new Date(e.date).getFullYear();
          years.add(year);
        });
      }
      
      const sortedYears = Array.from(years).sort((a, b) => b - a);
      setAvailableYears(sortedYears);

      // Load yearly profiles (stored in localStorage)
      const storedProfiles = localStorage.getItem("yearlyProfiles");
      let profiles: YearlyProfile[] = storedProfiles ? JSON.parse(storedProfiles) : [];
      
      // Add current profile if not exists for selected year
      const existingProfile = profiles.find(p => p.year === selectedYear);
      if (!existingProfile && profileData.monthlyIncome) {
        profiles.push({
          year: selectedYear,
          monthlyIncome: profileData.monthlyIncome,
          yearlySavingsGoal: profileData.yearlySavingsGoal
        });
        localStorage.setItem("yearlyProfiles", JSON.stringify(profiles));
      }

      // Get profile for selected year (use current if not found)
      const yearProfile = profiles.find(p => p.year === selectedYear) || {
        year: selectedYear,
        monthlyIncome: profileData.monthlyIncome,
        yearlySavingsGoal: profileData.yearlySavingsGoal
      };

      // Calculate yearly budget for selected year
      const yearlyIncome = yearProfile.monthlyIncome * 12;
      const yearlySavingsGoal = yearProfile.yearlySavingsGoal;
      const yearlyAllowedExpenses = yearlyIncome - yearlySavingsGoal;
      const monthlyAllowedBudget = yearlyAllowedExpenses / 12;

      // Load expenses for each month of selected year
      const months = [];
      
      for (let i = 0; i < 12; i++) {
        const monthStr = `${selectedYear}-${String(i + 1).padStart(2, "0")}`;
        const expensesRes = await fetch(`/api/expenses?month=${monthStr}&category=All`);
        
        let monthExpenses = 0;
        if (expensesRes.ok) {
          const expenses = await expensesRes.json();
          monthExpenses = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);
        }

        let status: "good" | "warning" | "over" = "good";
        if (monthExpenses > monthlyAllowedBudget * 1.1) {
          status = "over";
        } else if (monthExpenses > monthlyAllowedBudget * 0.9) {
          status = "warning";
        }

        months.push({
          month: monthStr,
          expenses: monthExpenses,
          allowedBudget: monthlyAllowedBudget,
          status
        });
      }

      setYearlyData(months);
    } catch (err) {
      console.error("Error loading yearly data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    
    try {
      const res = await fetch("/api/financial-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthlyIncome: parseFloat(editIncome),
          yearlySavingsGoal: parseFloat(editSavings),
          expectedMonthlyExpenses: 0
        })
      });
      
      if (res.ok) {
        // Save to yearly profiles history with effective month
        const storedProfiles = localStorage.getItem("yearlyProfiles");
        let profiles: YearlyProfile[] = storedProfiles ? JSON.parse(storedProfiles) : [];
        
        // Current month in YYYY-MM format
        const now = new Date();
        const effectiveMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        
        // Update or add profile for selected year
        const existingIndex = profiles.findIndex(p => p.year === selectedYear);
        const newProfile: YearlyProfile = {
          year: selectedYear,
          monthlyIncome: parseFloat(editIncome),
          yearlySavingsGoal: parseFloat(editSavings),
          effectiveMonth: effectiveMonth
        };
        
        if (existingIndex >= 0) {
          // Keep the original effectiveMonth if updating same year
          if (!profiles[existingIndex].effectiveMonth) {
            profiles[existingIndex] = newProfile;
          } else {
            profiles[existingIndex] = {
              ...newProfile,
              effectiveMonth: profiles[existingIndex].effectiveMonth
            };
          }
        } else {
          profiles.push(newProfile);
        }
        
        localStorage.setItem("yearlyProfiles", JSON.stringify(profiles));
        
        await loadData();
        setEditing(false);
      }
    } catch (err) {
      console.error("Error saving profile:", err);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [selectedYear]);

  if (loading) {
    return (
      <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-6">
        <div className="text-sm text-slate-400">Loading yearly savings tracker...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-6">
        <div className="text-sm text-slate-400">
          Set up your financial profile in the Advisor tab to track yearly savings.
        </div>
      </div>
    );
  }

  // Get profile for selected year
  const storedProfiles = localStorage.getItem("yearlyProfiles");
  const profiles: YearlyProfile[] = storedProfiles ? JSON.parse(storedProfiles) : [];
  const yearProfile = profiles.find(p => p.year === selectedYear) || {
    year: selectedYear,
    monthlyIncome: profile.monthlyIncome,
    yearlySavingsGoal: profile.yearlySavingsGoal
  };

  const yearlyIncome = yearProfile.monthlyIncome * 12;
  const yearlySavingsGoal = yearProfile.yearlySavingsGoal;
  const yearlyAllowedExpenses = yearlyIncome - yearlySavingsGoal;
  const monthlyAllowedBudget = yearlyAllowedExpenses / 12;

  const currentMonth = selectedYear === new Date().getFullYear() ? new Date().getMonth() : 11;
  const totalSpentSoFar = yearlyData
    .slice(0, currentMonth + 1)
    .reduce((sum, m) => sum + m.expenses, 0);
  const allowedSoFar = monthlyAllowedBudget * (currentMonth + 1);
  const remainingForYear = yearlyAllowedExpenses - totalSpentSoFar;
  const monthsLeft = 12 - (currentMonth + 1);
  const suggestedMonthlyBudget = monthsLeft > 0 ? remainingForYear / monthsLeft : 0;

  const isOnTrack = totalSpentSoFar <= allowedSoFar;
  const savingsProgress = ((yearlyIncome - totalSpentSoFar) / yearlySavingsGoal) * 100;

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="space-y-4">
      {/* Yearly Overview */}
      <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        {/* Header with Year Navigation */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h3 className="text-lg font-semibold">📊 Yearly Savings Tracker</h3>
          
          <div className="flex gap-2">
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-xs px-3 py-1.5 rounded-lg bg-blue-900 border border-blue-700 text-blue-200 hover:bg-blue-800 transition-all"
              >
                ✏️ Edit Profile
              </button>
            )}
            <button
              onClick={loadData}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 transition-all"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Year Selector - Prominent */}
        <div className="flex items-center justify-center gap-3 bg-gradient-to-r from-slate-900/50 via-slate-800/50 to-slate-900/50 rounded-xl p-4 border border-slate-700">
          <button
            onClick={() => setSelectedYear(selectedYear - 1)}
            className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-blue-500 transition-all flex items-center justify-center font-bold text-lg shadow-lg hover:shadow-blue-500/20"
            title="Previous Year"
          >
            ◀
          </button>
          
          <div className="flex items-center gap-2">
            {availableYears.length > 1 ? (
              availableYears.map(year => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-6 py-2.5 rounded-lg font-bold text-base transition-all shadow-lg ${
                    selectedYear === year
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white border-2 border-blue-400 shadow-blue-500/50 scale-110"
                      : "bg-slate-900 text-slate-400 border border-slate-700 hover:text-white hover:bg-slate-800 hover:border-slate-600"
                  }`}
                >
                  {year}
                </button>
              ))
            ) : (
              <div className="px-8 py-3 rounded-lg font-bold text-2xl bg-gradient-to-r from-blue-600 to-blue-500 text-white border-2 border-blue-400 shadow-lg shadow-blue-500/50">
                {selectedYear}
              </div>
            )}
          </div>
          
          <button
            onClick={() => setSelectedYear(selectedYear + 1)}
            disabled={selectedYear >= 2035}
            className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-blue-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-slate-900 disabled:hover:border-slate-700 flex items-center justify-center font-bold text-lg shadow-lg hover:shadow-blue-500/20"
            title="Next Year"
          >
            ▶
          </button>
        </div>

        {editing ? (
          /* Edit Form */
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800 space-y-3">
              <div className="text-xs text-blue-300 mb-2">
                💡 Editing profile for {selectedYear}
              </div>
              
              <div>
                <label className="block text-xs text-slate-300 mb-2">
                  Monthly Income (After Taxes) *
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={editIncome}
                  onChange={(e) => setEditIncome(e.target.value)}
                  placeholder="e.g., 5000"
                  className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-sm"
                  disabled={saving}
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Your monthly take-home pay after all taxes
                </p>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-2">
                  Yearly Savings Goal *
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={editSavings}
                  onChange={(e) => setEditSavings(e.target.value)}
                  placeholder="e.g., 12000"
                  className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-sm"
                  disabled={saving}
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  How much you want to save this year
                </p>
              </div>

              {editIncome && editSavings && (
                <div className="bg-blue-950/30 border border-blue-800/50 rounded-lg p-3 space-y-1">
                  <div className="text-xs font-semibold text-blue-300">💡 Budget Preview</div>
                  <div className="text-[10px] text-slate-300 space-y-1">
                    <div className="flex justify-between">
                      <span>Yearly Income:</span>
                      <span className="font-semibold">${(parseFloat(editIncome) * 12).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-red-300">
                      <span>- Savings Goal:</span>
                      <span className="font-semibold">-${parseFloat(editSavings).toLocaleString()}</span>
                    </div>
                    <div className="border-t border-blue-800/30 pt-1 flex justify-between font-semibold text-green-300">
                      <span>= Allowed Expenses:</span>
                      <span>${(parseFloat(editIncome) * 12 - parseFloat(editSavings)).toLocaleString()}/year</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Monthly budget: ${((parseFloat(editIncome) * 12 - parseFloat(editSavings)) / 12).toFixed(0)}/month
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm font-semibold transition-all disabled:opacity-50"
              >
                {saving ? "Saving..." : "💾 Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setEditIncome(yearProfile.monthlyIncome?.toString() || "");
                  setEditSavings(yearProfile.yearlySavingsGoal?.toString() || "");
                }}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-sm hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          /* Key Metrics Display */
          <>
            <div className="space-y-3">
              {(yearProfile as any).effectiveMonth && (
                <div className="text-xs text-blue-400 bg-blue-950/30 border border-blue-800/50 rounded-lg px-3 py-2">
                  💡 Profile settings effective from {new Date((yearProfile as any).effectiveMonth + "-01").toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
              )}
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                  <div className="text-xs text-slate-400 mb-1">Yearly Income</div>
                  <div className="text-2xl font-bold text-green-400">${yearlyIncome.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    ${yearProfile.monthlyIncome.toLocaleString()}/month
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                  <div className="text-xs text-slate-400 mb-1">Savings Goal</div>
                  <div className="text-2xl font-bold text-blue-400">${yearlySavingsGoal.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    ${(yearlySavingsGoal / 12).toFixed(0)}/month
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                  <div className="text-xs text-slate-400 mb-1">Allowed Expenses</div>
                  <div className="text-2xl font-bold text-orange-400">${yearlyAllowedExpenses.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    ${monthlyAllowedBudget.toFixed(0)}/month
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Savings Progress</span>
                <span className={isOnTrack ? "text-green-400" : "text-red-400"}>
                  {savingsProgress.toFixed(1)}% {isOnTrack ? "✅" : "⚠️"}
                </span>
              </div>
              <div className="w-full h-6 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-6 transition-all ${
                    isOnTrack ? "bg-gradient-to-r from-green-500 to-green-400" : "bg-gradient-to-r from-red-500 to-orange-400"
                  }`}
                  style={{ width: `${Math.min(savingsProgress, 100)}%` }}
                />
              </div>
            </div>
          </>
        )}

        {/* Status Message */}
        {!editing && (
          <div className={`rounded-xl p-4 border ${
            isOnTrack 
              ? "bg-green-950/30 border-green-800/50" 
              : "bg-red-950/30 border-red-800/50"
          }`}>
            <div className="text-sm font-semibold mb-2">
              {isOnTrack ? "✅ On Track!" : "⚠️ Over Budget"}
            </div>
            <div className="text-xs text-slate-300 space-y-1">
              <div>• Spent so far: <span className="font-semibold">${totalSpentSoFar.toLocaleString()}</span> of ${allowedSoFar.toFixed(0)} allowed</div>
              <div>• Remaining for year: <span className="font-semibold">${remainingForYear.toFixed(0)}</span></div>
              {monthsLeft > 0 && selectedYear === new Date().getFullYear() && (
                <div>• Suggested budget for next {monthsLeft} months: <span className="font-semibold">${suggestedMonthlyBudget.toFixed(0)}/month</span></div>
              )}
              {!isOnTrack && (
                <div className="text-red-400 mt-2">
                  💡 You're ${(totalSpentSoFar - allowedSoFar).toFixed(0)} over budget. Reduce spending to meet your savings goal!
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Monthly Breakdown */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h4 className="text-sm font-semibold">📅 Monthly Breakdown - {selectedYear}</h4>
          
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">View:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value === "all" ? "all" : parseInt(e.target.value))}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs hover:border-blue-500 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="all">All Months</option>
              <option disabled>──────────</option>
              {monthNames.map((name, i) => (
                <option key={i} value={i}>{name} {selectedYear}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {yearlyData
            .filter((_, i) => selectedMonth === "all" || i === selectedMonth)
            .map((monthData, idx) => {
            const i = selectedMonth === "all" ? idx : selectedMonth as number;
            const isFuture = selectedYear === new Date().getFullYear() && i > currentMonth;
            const percentage = (monthData.expenses / monthData.allowedBudget) * 100;
            
            return (
              <div
                key={monthData.month}
                className={`rounded-lg p-3 border transition-all ${
                  selectedMonth !== "all" ? "md:col-span-2 lg:col-span-3" : ""
                } ${
                  isFuture
                    ? "bg-slate-900/30 border-slate-800/50 opacity-50"
                    : monthData.status === "good"
                    ? "bg-green-950/20 border-green-800/30"
                    : monthData.status === "warning"
                    ? "bg-yellow-950/20 border-yellow-800/30"
                    : "bg-red-950/20 border-red-800/30"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`font-semibold text-slate-300 ${selectedMonth !== "all" ? "text-base" : "text-xs"}`}>
                    {monthNames[i]}
                  </div>
                  {!isFuture && (
                    <div className={selectedMonth !== "all" ? "text-2xl" : "text-lg"}>
                      {monthData.status === "good" ? "✅" : monthData.status === "warning" ? "⚠️" : "❌"}
                    </div>
                  )}
                </div>
                
                {!isFuture ? (
                  <>
                    <div className={`text-slate-400 mb-1 ${selectedMonth !== "all" ? "text-sm" : "text-xs"}`}>
                      ${monthData.expenses.toFixed(0)} / ${monthData.allowedBudget.toFixed(0)}
                    </div>
                    <div className={`w-full bg-slate-900 rounded-full overflow-hidden ${selectedMonth !== "all" ? "h-3" : "h-2"}`}>
                      <div
                        className={`transition-all ${selectedMonth !== "all" ? "h-3" : "h-2"} ${
                          monthData.status === "good"
                            ? "bg-green-500"
                            : monthData.status === "warning"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <div className={`text-slate-500 mt-1 ${selectedMonth !== "all" ? "text-xs" : "text-[10px]"}`}>
                      {percentage.toFixed(0)}% used
                    </div>
                    {selectedMonth !== "all" && (
                      <div className="mt-3 pt-3 border-t border-slate-800 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Spent:</span>
                          <span className="font-semibold text-slate-200">${monthData.expenses.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Budget:</span>
                          <span className="font-semibold text-slate-200">${monthData.allowedBudget.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Remaining:</span>
                          <span className={`font-semibold ${monthData.expenses <= monthData.allowedBudget ? "text-green-400" : "text-red-400"}`}>
                            ${(monthData.allowedBudget - monthData.expenses).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className={`text-slate-500 ${selectedMonth !== "all" ? "text-xs" : "text-[10px]"}`}>
                    Budget: ${monthData.allowedBudget.toFixed(0)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-6 space-y-3">
        <h4 className="text-sm font-semibold">💡 Smart Recommendations</h4>
        
        <div className="space-y-2 text-xs text-slate-300">
          {isOnTrack ? (
            <>
              <div className="flex items-start gap-2">
                <span className="text-green-400">✅</span>
                <span>Great job! You're on track to meet your ${yearlySavingsGoal.toLocaleString()} savings goal for {selectedYear}.</span>
              </div>
              {selectedYear === new Date().getFullYear() && monthsLeft > 0 && (
                <div className="flex items-start gap-2">
                  <span className="text-blue-400">💰</span>
                  <span>Keep spending under ${suggestedMonthlyBudget.toFixed(0)}/month for the rest of the year.</span>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-start gap-2">
                <span className="text-red-400">⚠️</span>
                <span>You're ${(totalSpentSoFar - allowedSoFar).toFixed(0)} over budget. Your savings goal is at risk.</span>
              </div>
              {selectedYear === new Date().getFullYear() && monthsLeft > 0 && (
                <>
                  <div className="flex items-start gap-2">
                    <span className="text-orange-400">💡</span>
                    <span>Reduce spending to ${suggestedMonthlyBudget.toFixed(0)}/month to get back on track.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400">📉</span>
                    <span>Review your expenses and cut non-essential spending.</span>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
