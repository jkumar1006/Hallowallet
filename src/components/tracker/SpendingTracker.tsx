"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";

type FinancialProfile = {
  monthlyIncome: number;
  yearlySavingsGoal: number;
  expectedMonthlyExpenses: number;
  currentMonthSpending: number;
  averageMonthlySpending: number;
  projectedYearlySavings: number;
  savingsRate: number;
  disposableIncome: number;
  totalMonthlyGoals?: number;
  monthlyGoals?: Array<{
    description: string;
    limit: number;
    spent: number;
  }>;
};

export default function SpendingTracker() {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<FinancialProfile | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [income, setIncome] = useState("");
  const [savingsGoal, setSavingsGoal] = useState("");
  const [monthlyExpenses, setMonthlyExpenses] = useState("");
  const [suggestedExpenses, setSuggestedExpenses] = useState(0);
  const [items, setItems] = useState<Array<{ name: string; price: string }>>([
    { name: "", price: "" }
  ]);
  const [timePeriod, setTimePeriod] = useState<"monthly" | "yearly">("monthly");
  const [decision, setDecision] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadProfile() {
    try {
      console.log("Loading financial profile...");
      
      // Get expenses from Dashboard to suggest monthly spending
      const month = new Date().toISOString().slice(0, 7);
      const expensesRes = await fetch(`/api/expenses?month=${month}&category=All`);
      let currentMonthSpending = 0;
      
      if (expensesRes.ok) {
        const expenses = await expensesRes.json();
        currentMonthSpending = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);
        setSuggestedExpenses(currentMonthSpending);
        console.log("Dashboard expenses total:", currentMonthSpending);
      }
      
      // Get profile data
      const profileRes = await fetch("/api/financial-profile");
      if (!profileRes.ok) {
        console.error("Failed to load profile:", profileRes.status);
        setShowSetup(true);
        return;
      }
      
      const profileData = await profileRes.json();
      console.log("Profile loaded:", profileData);
      
      // Override with Dashboard's calculation
      profileData.currentMonthSpending = currentMonthSpending;
      
      setProfile(profileData);
      if (!profileData.monthlyIncome) {
        setShowSetup(true);
      }
    } catch (err) {
      console.error("Error loading profile:", err);
      setShowSetup(true);
    }
  }

  useEffect(() => {
    loadProfile();
    
    // Auto-refresh every 5 seconds to pick up new transactions/goals
    const interval = setInterval(() => {
      if (!showSetup && profile?.monthlyIncome) {
        loadProfile();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [showSetup, profile?.monthlyIncome]);

  async function handleSetup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    console.log("Submitting profile:", { income, savingsGoal });
    
    try {
      const res = await fetch("/api/financial-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthlyIncome: parseFloat(income),
          yearlySavingsGoal: parseFloat(savingsGoal),
          expectedMonthlyExpenses: parseFloat(monthlyExpenses)
        })
      });
      
      console.log("Response status:", res.status);
      console.log("Response headers:", res.headers.get("content-type"));
      
      // Get response text first to see what we're getting
      const responseText = await res.text();
      console.log("Response text:", responseText);
      
      if (res.ok) {
        try {
          const data = JSON.parse(responseText);
          console.log("Profile saved successfully:", data);
          setProfile(data);
          setShowSetup(false);
          await loadProfile();
        } catch (parseErr) {
          console.error("Failed to parse response:", parseErr);
          setError("Server returned invalid response. Check server logs.");
        }
      } else {
        try {
          const errorData = JSON.parse(responseText);
          console.error("Error response:", errorData);
          setError(errorData.error || "Failed to save profile");
        } catch (parseErr) {
          console.error("Failed to parse error response:", parseErr);
          setError(`Server error (${res.status}): ${responseText || "No response"}`);
        }
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function checkPurchase(e: React.FormEvent) {
    e.preventDefault();
    
    // Build items array from dynamic items, filtering out empty ones
    const validItems = items
      .filter(item => item.name.trim() && item.price.trim())
      .map(item => ({
        name: item.name,
        price: parseFloat(item.price)
      }));
    
    if (validItems.length === 0) {
      return;
    }
    
    const res = await fetch("/api/purchase-advisor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: validItems,
        timePeriod
      })
    });
    if (res.ok) {
      const data = await res.json();
      setDecision(data);
    }
  }

  function addItem() {
    setItems([...items, { name: "", price: "" }]);
  }

  function removeItem(index: number) {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  }

  function updateItem(index: number, field: "name" | "price", value: string) {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  }

  if (showSetup || !profile?.monthlyIncome) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">💰 Financial Profile Setup</h2>
        <form onSubmit={handleSetup} className="bg-slate-950/90 hw-bg-card border border-slate-800 hw-border rounded-2xl p-6 space-y-4">
          <p className="text-sm text-slate-300">
            Set up your financial profile to get personalized spending advice and purchase recommendations.
          </p>
          
          <div>
            <label className="block text-sm text-slate-300 mb-2">
              Monthly Income (After Taxes) *
            </label>
            <input
              type="number"
              required
              step="0.01"
              min="0"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              placeholder="e.g., 5000"
              className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white hw-input"
              disabled={loading}
            />
            <p className="text-xs text-slate-500 mt-1">
              Your monthly take-home pay after all taxes and deductions
            </p>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">
              Yearly Savings Goal *
            </label>
            <input
              type="number"
              required
              step="0.01"
              value={savingsGoal}
              onChange={(e) => setSavingsGoal(e.target.value)}
              placeholder="e.g., 12000"
              className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white hw-input"
              disabled={loading}
            />
            <p className="text-xs text-slate-500 mt-1">
              How much you want to save this year (e.g., $12,000 = $1,000/month)
            </p>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">
              Expected Monthly Expenses (Rent, Bills, EMIs, etc.) *
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                required
                step="0.01"
                min="0"
                value={monthlyExpenses}
                onChange={(e) => setMonthlyExpenses(e.target.value)}
                placeholder="e.g., 1000"
                className="flex-1 px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white hw-input"
                disabled={loading}
              />
              {suggestedExpenses > 0 && (
                <button
                  type="button"
                  onClick={() => setMonthlyExpenses(suggestedExpenses.toFixed(2))}
                  className="px-4 py-2 rounded-lg bg-blue-900 border border-blue-700 text-blue-200 text-xs hover:bg-blue-800 transition-all"
                  disabled={loading}
                >
                  Use ${suggestedExpenses.toFixed(2)}
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Your regular monthly expenses (rent, utilities, EMIs, subscriptions, etc.)
              {suggestedExpenses > 0 && (
                <span className="text-blue-400">
                  {" "}• Based on your current spending: ${suggestedExpenses.toFixed(2)}/month
                </span>
              )}
            </p>
          </div>

          {income && savingsGoal && monthlyExpenses && (
            <div className="bg-blue-950/30 border border-blue-800/50 rounded-lg p-4 space-y-2">
              <div className="text-sm font-semibold text-blue-300">💡 Budget Breakdown</div>
              <div className="text-xs text-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span>Yearly Income:</span>
                  <span className="font-semibold">${(parseFloat(income) * 12).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-red-300">
                  <span>- Yearly Savings:</span>
                  <span className="font-semibold">-${parseFloat(savingsGoal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-orange-300">
                  <span>- Yearly Expenses:</span>
                  <span className="font-semibold">-${(parseFloat(monthlyExpenses) * 12).toFixed(2)}</span>
                </div>
                <div className="border-t border-blue-800/30 pt-2 flex justify-between font-semibold text-green-300">
                  <span>= Remaining for Year:</span>
                  <span>${(parseFloat(income) * 12 - parseFloat(savingsGoal) - parseFloat(monthlyExpenses) * 12).toFixed(2)}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-2">
                  Monthly: ${((parseFloat(income) * 12 - parseFloat(savingsGoal) - parseFloat(monthlyExpenses) * 12) / 12).toFixed(2)}/month for other needs
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-950/30 border border-red-800/50 rounded-lg p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-white text-black font-semibold hw-btn-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save Financial Profile"}
          </button>
        </form>
      </div>
    );
  }

  const monthlySavingsTarget = profile.yearlySavingsGoal / 12;
  // Use expected monthly expenses from profile (user input)
  const monthlySpending = profile.expectedMonthlyExpenses || 0;
  
  // Disposable Income = Income - Savings Target - Monthly Spending
  const disposableIncome = profile.monthlyIncome - monthlySavingsTarget - monthlySpending;
  
  // Current Savings = Income - Monthly Spending
  const currentSavings = profile.monthlyIncome - monthlySpending;
  
  // Check if on track for savings
  const onTrackForSavings = currentSavings >= monthlySavingsTarget;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">💰 Spending Tracker & Advisor</h2>
        <div className="flex gap-2">
          <button
            onClick={() => loadProfile()}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 hw-btn-secondary"
          >
            🔄 Refresh Data
          </button>
          <button
            onClick={() => setShowSetup(true)}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 hw-btn-secondary"
          >
            ⚙️ Update Profile
          </button>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-slate-950/90 hw-bg-card border border-slate-800 hw-border rounded-2xl p-4">
          <div className="text-xs text-slate-400 mb-1">Income</div>
          <div className="text-2xl font-semibold text-green-400">
            ${profile.monthlyIncome.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Monthly after tax</div>
        </div>

        <div className="bg-slate-950/90 hw-bg-card border border-slate-800 hw-border rounded-2xl p-4">
          <div className="text-xs text-slate-400 mb-1">Savings Target</div>
          <div className="text-2xl font-semibold text-blue-400">
            -${monthlySavingsTarget.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            ${profile.yearlySavingsGoal.toFixed(2)}/year
          </div>
        </div>

        <div className="bg-slate-950/90 hw-bg-card border border-slate-800 hw-border rounded-2xl p-4">
          <div className="text-xs text-slate-400 mb-1">Month Spending</div>
          <div className="text-2xl font-semibold text-orange-400">
            -${monthlySpending.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">From profile</div>
        </div>

        <div className="bg-slate-950/90 hw-bg-card border border-slate-800 hw-border rounded-2xl p-4">
          <div className="text-xs text-slate-400 mb-1">Disposable Income</div>
          <div className={`text-2xl font-semibold ${disposableIncome >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${disposableIncome.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Available after savings goal</div>
        </div>
      </div>

      {/* Savings Progress */}
      <div className="bg-slate-950/90 hw-bg-card border border-slate-800 hw-border rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold">📊 Monthly Budget Breakdown</h3>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Income</span>
            <span className="text-green-400">${profile.monthlyIncome.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Savings Target</span>
            <span className="text-blue-400">-${monthlySavingsTarget.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Month Spending</span>
            <span className="text-orange-400">-${monthlySpending.toFixed(2)}</span>
          </div>
          <div className="border-t border-slate-800 pt-2 flex justify-between text-sm font-semibold">
            <span className="text-slate-300">Disposable Income</span>
            <span className={disposableIncome >= 0 ? "text-green-400" : "text-red-400"}>
              ${disposableIncome.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs text-slate-400 mb-1">Savings Progress</div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Current Savings</span>
            <span className="text-slate-300">${currentSavings.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-slate-400">Savings Target</span>
            <span className="text-slate-300">${monthlySavingsTarget.toFixed(2)}</span>
          </div>
          <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden">
            <div
              className={`h-4 transition-all ${
                onTrackForSavings ? "bg-green-500" : "bg-yellow-500"
              }`}
              style={{ width: `${Math.min((currentSavings / monthlySavingsTarget) * 100, 100)}%` }}
            />
          </div>
          <div className="text-xs text-slate-500">
            {onTrackForSavings ? "✅ On track for savings goal!" : "⚠️ Below savings target"}
          </div>
        </div>


      </div>

      {/* Purchase Advisor */}
      <div className="bg-slate-950/90 hw-bg-card border border-slate-800 hw-border rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold">🛒 Smart Purchase Advisor</h3>
        <p className="text-xs text-slate-400">
          Compare multiple items and get AI recommendations on what to buy based on your budget.
        </p>

        <form onSubmit={checkPurchase} className="space-y-3">
          {/* Time Period Selector */}
          <div>
            <label className="block text-xs text-slate-300 mb-2">Budget Analysis Period</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTimePeriod("monthly")}
                className={`flex-1 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  timePeriod === "monthly"
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                📅 Monthly Budget
              </button>
              <button
                type="button"
                onClick={() => setTimePeriod("yearly")}
                className={`flex-1 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  timePeriod === "yearly"
                    ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                📆 Yearly Budget
              </button>
            </div>
          </div>

          {/* Dynamic Items */}
          {items.map((item, index) => (
            <div key={index} className="flex gap-2 items-end">
              <div className="flex-1 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    Item {index + 1} Name {index === 0 && "*"}
                  </label>
                  <input
                    type="text"
                    required={index === 0}
                    value={item.name}
                    onChange={(e) => updateItem(index, "name", e.target.value)}
                    placeholder={`e.g., ${index === 0 ? "iPhone 15" : index === 1 ? "Samsung S24" : "Google Pixel 8"}`}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs hw-input"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Price ($)</label>
                  <input
                    type="number"
                    required={index === 0 && !!item.name}
                    step="0.01"
                    value={item.price}
                    onChange={(e) => updateItem(index, "price", e.target.value)}
                    placeholder={`e.g., ${index === 0 ? "999" : index === 1 ? "899" : "699"}`}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs hw-input"
                  />
                </div>
              </div>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="px-3 py-2 rounded-lg bg-red-900/30 border border-red-700 text-red-400 text-xs hover:bg-red-900/50 transition-all"
                  title="Remove item"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          {/* Add Item Button */}
          <button
            type="button"
            onClick={addItem}
            className="w-full py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
          >
            <span className="text-lg">+</span> Add Another Item
          </button>

          <button
            type="submit"
            className="w-full py-2 rounded-xl bg-white text-black text-xs font-semibold hw-btn-primary transition-all"
          >
            Compare & Get Recommendation 🤔
          </button>
        </form>

        {decision && (
          <div className="space-y-3">
            {/* Time Period Badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Analysis Period:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                decision.timePeriod === "monthly" 
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
              }`}>
                {decision.timePeriod === "monthly" ? "📅 Monthly Budget" : "📆 Yearly Budget"}
              </span>
            </div>

            {/* Best Choice Highlight */}
            <div className={`rounded-lg p-4 space-y-3 ${
              decision.bestChoice.recommendation === "buy" 
                ? "bg-green-950/30 border-2 border-green-500/50" 
                : decision.bestChoice.recommendation === "wait"
                ? "bg-yellow-950/30 border-2 border-yellow-500/50"
                : "bg-red-950/30 border-2 border-red-500/50"
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-yellow-400">⭐ BEST CHOICE</span>
                <span className="text-xs text-slate-400">Score: {decision.bestChoice.score}/100</span>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="text-3xl">
                  {decision.bestChoice.recommendation === "buy" ? "✅" : decision.bestChoice.recommendation === "wait" ? "⏳" : "❌"}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm mb-1">
                    {decision.bestChoice.recommendation === "buy" && "Go Ahead! You Can Afford It"}
                    {decision.bestChoice.recommendation === "wait" && "Consider Waiting"}
                    {decision.bestChoice.recommendation === "reconsider" && "Not Recommended Right Now"}
                  </div>
                  <div className="text-xs text-slate-300 mb-2">
                    {decision.bestChoice.itemName} - ${decision.bestChoice.itemPrice.toFixed(2)}
                  </div>
                  <div className="text-xs text-slate-400 leading-relaxed">
                    {decision.bestChoice.reason}
                  </div>
                </div>
              </div>
            </div>

            {/* All Items Comparison */}
            {decision.items && decision.items.length > 1 && (
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-300">📊 All Items Comparison:</div>
                {decision.items.map((item: any, index: number) => (
                  <div key={index} className="space-y-2">
                    <div 
                      className={`rounded-lg p-3 border ${
                        index === 0 
                          ? "bg-green-950/20 border-green-800/30" 
                          : "bg-slate-900/50 border-slate-800"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                          </span>
                          <div>
                            <div className="text-xs font-medium text-slate-200">{item.itemName}</div>
                            <div className="text-[10px] text-slate-400">${item.itemPrice.toFixed(2)}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-semibold text-slate-300">Score: {item.score}/100</div>
                          <div className={`text-[10px] ${
                            item.recommendation === "buy" ? "text-green-400" : 
                            item.recommendation === "wait" ? "text-yellow-400" : "text-red-400"
                          }`}>
                            {item.recommendation === "buy" ? "✓ Affordable" : 
                             item.recommendation === "wait" ? "⏳ Wait" : "✗ Reconsider"}
                          </div>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-400 leading-relaxed">
                        {item.reason}
                      </div>
                    </div>

                    {/* Show alternatives for items that exceed budget */}
                    {item.alternativeSuggestions && 
                     item.alternativeSuggestions.length > 0 && 
                     (item.recommendation === "wait" || item.recommendation === "reconsider") && (
                      <div className="ml-4 space-y-2">
                        <div className="text-[10px] font-semibold text-slate-400">💡 Budget-Friendly Alternatives:</div>
                        {item.alternativeSuggestions.map((alt: any, i: number) => (
                          <div key={i} className="bg-slate-900/30 rounded p-2 border border-slate-800 space-y-1">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="text-[10px] text-slate-200 font-medium">{alt.name}</div>
                                <div className="text-[9px] text-green-400 mt-0.5">~${alt.price.toFixed(2)}</div>
                              </div>
                              <div className="text-[9px] text-slate-400">
                                Save ${(item.itemPrice - alt.price).toFixed(2)}
                              </div>
                            </div>
                            {alt.retailers && alt.retailers.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {alt.retailers.map((retailer: any, j: number) => (
                                  <a
                                    key={j}
                                    href={retailer.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700 hover:border-green-500/50"
                                  >
                                    {retailer.name} →
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="bg-slate-900/50 rounded p-3 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Budget Remaining ({decision.timePeriod}):</span>
                <span className={decision.afterPurchaseBalance < 0 ? "text-red-400" : "text-green-400"}>
                  ${Math.abs(decision.afterPurchaseBalance).toFixed(2)} {decision.afterPurchaseBalance < 0 ? "over budget" : "remaining"}
                </span>
              </div>
            </div>


          </div>
        )}
      </div>

      {/* Financial Insights */}
      <div className="bg-slate-950/90 hw-bg-card border border-slate-800 hw-border rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold">📈 Financial Health</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-xs text-slate-400">Savings Progress</div>
            <div className={`text-xl font-semibold ${
              currentSavings >= monthlySavingsTarget ? "text-green-400" : "text-red-400"
            }`}>
              {monthlySavingsTarget > 0 
                ? `${((currentSavings / monthlySavingsTarget) * 100).toFixed(0)}%`
                : "N/A"
              }
            </div>
            <div className="text-[10px] text-slate-500">
              {currentSavings >= monthlySavingsTarget 
                ? "✅ On track!" 
                : `⚠️ $${(monthlySavingsTarget - currentSavings).toFixed(0)} short`
              }
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-slate-400">Disposable Income</div>
            <div className="text-xl font-semibold text-green-400">
              ${profile.disposableIncome.toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-500">
              Available after savings goal
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 rounded-lg p-3 space-y-2 text-xs">
          <div className="font-semibold text-slate-300">💡 Smart Recommendations:</div>
          {currentSavings < monthlySavingsTarget && (
            <div className="text-red-400">
              ⚠️ You're ${(monthlySavingsTarget - currentSavings).toFixed(2)} below your savings target. Reduce expected expenses to meet your goal.
            </div>
          )}
          {currentSavings >= monthlySavingsTarget && currentSavings < monthlySavingsTarget * 1.5 && (
            <div className="text-green-400">
              ✅ You're on track to meet your savings target! Keep it up.
            </div>
          )}
          {currentSavings >= monthlySavingsTarget * 1.5 && (
            <div className="text-green-400">
              ✅ Excellent! You're exceeding your savings target by ${(currentSavings - monthlySavingsTarget).toFixed(2)}.
            </div>
          )}
          {disposableIncome > 0 && (
            <div className="text-green-400">
              💵 You have ${disposableIncome.toFixed(2)} left to spend this month after meeting your savings target.
            </div>
          )}
          {disposableIncome < 0 && (
            <div className="text-red-400">
              🚨 You've spent ${Math.abs(disposableIncome).toFixed(2)} more than your budget allows. Avoid new purchases.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
