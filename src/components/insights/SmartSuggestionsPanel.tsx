"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Suggestion = {
  id: string;
  type: "warning" | "tip" | "opportunity" | "achievement";
  title: string;
  message: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  priority: number;
  icon: string;
};

export default function SmartSuggestionsPanel() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const router = useRouter();

  useEffect(() => {
    async function generateSuggestions() {
      try {
        // Fetch all necessary data
        const [expensesRes, goalsRes, subsRes, profileRes] = await Promise.all([
          fetch("/api/expenses?month=" + new Date().toISOString().slice(0, 7)),
          fetch("/api/goals?month=" + new Date().toISOString().slice(0, 7)),
          fetch("/api/subscriptions"),
          fetch("/api/financial-profile")
        ]);

        const expenses = expensesRes.ok ? await expensesRes.json() : [];
        const goals = goalsRes.ok ? await goalsRes.json() : [];
        const subs = subsRes.ok ? await subsRes.json() : { subscriptions: [], summary: {} };
        const profile = profileRes.ok ? await profileRes.json() : null;

        const newSuggestions: Suggestion[] = [];

        // 1. Spending Pattern Analysis
        const categorySpending = expenses.reduce((acc: any, exp: any) => {
          acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
          return acc;
        }, {});

        const topCategory = Object.entries(categorySpending).sort((a: any, b: any) => b[1] - a[1])[0] as [string, number] | undefined;
        if (topCategory && topCategory[1] > 500) {
          newSuggestions.push({
            id: "top-spending",
            type: "tip",
            title: "Top Spending Category",
            message: `You've spent $${topCategory[1].toFixed(2)} on ${topCategory[0]} this month. Consider setting a budget goal.`,
            action: {
              label: "Set Goal",
              href: "/goals"
            },
            priority: 8,
            icon: "📊"
          });
        }

        // 2. Subscription Optimization
        if (subs.summary.monthlyTotal > 100) {
          const potentialSavings = subs.summary.monthlyTotal * 0.2;
          newSuggestions.push({
            id: "sub-optimize",
            type: "opportunity",
            title: "Subscription Savings Opportunity",
            message: `You're spending $${subs.summary.monthlyTotal.toFixed(2)}/month on subscriptions. Review unused services to save up to $${potentialSavings.toFixed(2)}/month.`,
            action: {
              label: "Review Subscriptions",
              href: "/subscriptions"
            },
            priority: 9,
            icon: "💰"
          });
        }

        // 3. Goal Progress Tracking
        goals.forEach((goal: any) => {
          const spent = categorySpending[goal.category] || 0;
          const remaining = goal.limit - spent;
          const percentUsed = (spent / goal.limit) * 100;

          if (percentUsed > 90 && percentUsed < 100) {
            newSuggestions.push({
              id: `goal-warning-${goal.id}`,
              type: "warning",
              title: "Budget Alert",
              message: `You've used ${percentUsed.toFixed(0)}% of your ${goal.category} budget. Only $${remaining.toFixed(2)} remaining.`,
              priority: 10,
              icon: "⚠️"
            });
          } else if (percentUsed > 100) {
            newSuggestions.push({
              id: `goal-exceeded-${goal.id}`,
              type: "warning",
              title: "Budget Exceeded",
              message: `You've exceeded your ${goal.category} budget by $${Math.abs(remaining).toFixed(2)}. Consider adjusting your spending.`,
              priority: 10,
              icon: "🚨"
            });
          }
        });

        // 4. Savings Rate Analysis
        if (profile) {
          const totalSpent = expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);
          const savingsRate = profile.monthlyIncome > 0 
            ? ((profile.monthlyIncome - totalSpent) / profile.monthlyIncome) * 100 
            : 0;

          if (savingsRate < 10 && savingsRate > 0) {
            newSuggestions.push({
              id: "low-savings",
              type: "warning",
              title: "Low Savings Rate",
              message: `Your savings rate is ${savingsRate.toFixed(1)}%. Financial experts recommend saving at least 20% of income.`,
              action: {
                label: "View Insights",
                href: "/insights"
              },
              priority: 9,
              icon: "📉"
            });
          } else if (savingsRate >= 20) {
            newSuggestions.push({
              id: "good-savings",
              type: "achievement",
              title: "Great Savings!",
              message: `You're saving ${savingsRate.toFixed(1)}% of your income. Keep up the excellent work!`,
              priority: 5,
              icon: "🎉"
            });
          }
        }

        // 5. Transit & Commute Optimization
        const transitExpenses = expenses.filter((exp: any) => 
          exp.category === "Transit" || 
          exp.description.toLowerCase().includes("uber") ||
          exp.description.toLowerCase().includes("lyft") ||
          exp.description.toLowerCase().includes("taxi") ||
          exp.description.toLowerCase().includes("metro") ||
          exp.description.toLowerCase().includes("bus") ||
          exp.description.toLowerCase().includes("train") ||
          exp.description.toLowerCase().includes("subway") ||
          exp.description.toLowerCase().includes("auto")
        );

        if (transitExpenses.length >= 10) {
          const totalTransit = transitExpenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);
          const avgPerTrip = totalTransit / transitExpenses.length;
          
          // Suggest monthly pass if frequent small trips
          if (avgPerTrip < 5 && totalTransit > 50) {
            const monthlyPassCost = 50; // Typical metro pass
            const potentialSavings = totalTransit - monthlyPassCost;
            
            if (potentialSavings > 0) {
              newSuggestions.push({
                id: "transit-pass",
                type: "opportunity",
                title: "Transit Pass Savings",
                message: `You spent $${totalTransit.toFixed(2)} on ${transitExpenses.length} transit trips (avg $${avgPerTrip.toFixed(2)}/trip). A monthly pass (~$${monthlyPassCost}) could save you $${potentialSavings.toFixed(2)}/month!`,
                action: {
                  label: "View Transit Expenses",
                  href: "/transactions"
                },
                priority: 9,
                icon: "🚇"
              });
            }
          }
          
          // Suggest carpooling/rideshare for expensive trips
          const expensiveTrips = transitExpenses.filter((exp: any) => exp.amount > 15);
          if (expensiveTrips.length >= 5) {
            const expensiveTotal = expensiveTrips.reduce((sum: number, exp: any) => sum + exp.amount, 0);
            const carpoolSavings = expensiveTotal * 0.5; // 50% savings with carpooling
            
            newSuggestions.push({
              id: "carpool-suggestion",
              type: "opportunity",
              title: "Carpool to Save Money",
              message: `You have ${expensiveTrips.length} expensive transit trips totaling $${expensiveTotal.toFixed(2)}. Consider carpooling or using public transit to save up to $${carpoolSavings.toFixed(2)}/month.`,
              action: {
                label: "View Trips",
                href: "/transactions"
              },
              priority: 8,
              icon: "🚗"
            });
          }
        }

        // 6. Bill Payment Patterns & Optimization
        const billExpenses = expenses.filter((exp: any) => 
          exp.category === "Bills" ||
          exp.description.toLowerCase().includes("electric") ||
          exp.description.toLowerCase().includes("water") ||
          exp.description.toLowerCase().includes("gas") ||
          exp.description.toLowerCase().includes("internet") ||
          exp.description.toLowerCase().includes("phone") ||
          exp.description.toLowerCase().includes("utility")
        );

        if (billExpenses.length > 0) {
          const totalBills = billExpenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);
          const avgBill = totalBills / billExpenses.length;
          
          // High utility bills suggestion
          if (avgBill > 100) {
            newSuggestions.push({
              id: "high-bills",
              type: "tip",
              title: "High Utility Bills Detected",
              message: `Your average bill is $${avgBill.toFixed(2)}. Consider energy-saving measures, comparing providers, or bundling services to reduce costs by 15-30%.`,
              action: {
                label: "View Bills",
                href: "/transactions"
              },
              priority: 7,
              icon: "💡"
            });
          }
          
          // Late payment detection (if multiple bills in short period)
          const recentBills = billExpenses.filter((exp: any) => {
            const daysSince = (Date.now() - new Date(exp.date).getTime()) / (1000 * 60 * 60 * 24);
            return daysSince <= 7;
          });
          
          if (recentBills.length >= 3) {
            newSuggestions.push({
              id: "bill-autopay",
              type: "tip",
              title: "Set Up Auto-Pay",
              message: `You paid ${recentBills.length} bills recently. Set up auto-pay to avoid late fees and improve your credit score.`,
              priority: 6,
              icon: "📅"
            });
          }
        }

        // 7. Recurring Expense Detection
        const expenseFrequency: any = {};
        expenses.forEach((exp: any) => {
          const key = `${exp.description}-${exp.amount}`;
          expenseFrequency[key] = (expenseFrequency[key] || 0) + 1;
        });

        Object.entries(expenseFrequency).forEach(([key, count]: any) => {
          if (count >= 2 && !key.includes("subscription")) {
            const [desc] = key.split("-");
            newSuggestions.push({
              id: `recurring-${key}`,
              type: "tip",
              title: "Recurring Expense Detected",
              message: `"${desc}" appears ${count} times. Consider marking it as a subscription for better tracking.`,
              action: {
                label: "View Transactions",
                href: "/transactions"
              },
              priority: 6,
              icon: "🔄"
            });
          }
        });

        // 8. Food & Dining Optimization
        const foodExpenses = expenses.filter((exp: any) => 
          exp.category === "Food" ||
          exp.description.toLowerCase().includes("restaurant") ||
          exp.description.toLowerCase().includes("cafe") ||
          exp.description.toLowerCase().includes("coffee") ||
          exp.description.toLowerCase().includes("lunch") ||
          exp.description.toLowerCase().includes("dinner")
        );

        if (foodExpenses.length >= 15) {
          const totalFood = foodExpenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);
          const avgMeal = totalFood / foodExpenses.length;
          
          if (avgMeal > 15) {
            const mealPrepSavings = totalFood * 0.6; // 60% savings with meal prep
            newSuggestions.push({
              id: "meal-prep",
              type: "opportunity",
              title: "Meal Prep Savings",
              message: `You spent $${totalFood.toFixed(2)} on ${foodExpenses.length} meals (avg $${avgMeal.toFixed(2)}/meal). Meal prepping could save you $${mealPrepSavings.toFixed(2)}/month!`,
              action: {
                label: "View Food Expenses",
                href: "/transactions"
              },
              priority: 8,
              icon: "🍱"
            });
          }
        }

        // 9. Weekend Spending Pattern
        const weekendSpending = expenses.filter((exp: any) => {
          const day = new Date(exp.date).getDay();
          return day === 0 || day === 6;
        }).reduce((sum: number, exp: any) => sum + exp.amount, 0);

        const weekdaySpending = expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0) - weekendSpending;
        
        if (weekendSpending > weekdaySpending * 0.5) {
          newSuggestions.push({
            id: "weekend-spending",
            type: "tip",
            title: "Weekend Spending Pattern",
            message: `You spend significantly more on weekends ($${weekendSpending.toFixed(2)}). Plan weekend activities to reduce impulse purchases.`,
            priority: 7,
            icon: "📅"
          });
        }

        // 10. No Expenses Recently
        const recentExpenses = expenses.filter((exp: any) => {
          const daysSince = (Date.now() - new Date(exp.date).getTime()) / (1000 * 60 * 60 * 24);
          return daysSince <= 3;
        });

        if (recentExpenses.length === 0 && expenses.length > 0) {
          newSuggestions.push({
            id: "no-recent",
            type: "tip",
            title: "Track Your Expenses",
            message: "No expenses logged in the last 3 days. Remember to track your spending regularly for accurate insights.",
            action: {
              label: "Add Expense",
              href: "/dashboard"
            },
            priority: 4,
            icon: "📝"
          });
        }

        // 11. Milestone Achievement
        if (expenses.length >= 50) {
          newSuggestions.push({
            id: "milestone-50",
            type: "achievement",
            title: "Tracking Milestone!",
            message: `You've tracked ${expenses.length} expenses! Consistent tracking leads to better financial decisions.`,
            priority: 3,
            icon: "🏆"
          });
        }

        // Sort by priority (highest first)
        newSuggestions.sort((a, b) => b.priority - a.priority);

        // Load dismissed suggestions
        const dismissedData = localStorage.getItem("dismissedSuggestions");
        if (dismissedData) {
          const parsed = JSON.parse(dismissedData);
          setDismissed(new Set(parsed));
        }

        setSuggestions(newSuggestions);
      } catch (err) {
        console.error("Failed to generate suggestions:", err);
      } finally {
        setLoading(false);
      }
    }

    generateSuggestions();

    // Refresh suggestions every 5 minutes
    const interval = setInterval(generateSuggestions, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const dismissSuggestion = (id: string) => {
    const newDismissed = new Set(dismissed);
    newDismissed.add(id);
    setDismissed(newDismissed);
    localStorage.setItem("dismissedSuggestions", JSON.stringify(Array.from(newDismissed)));
  };

  const visibleSuggestions = suggestions.filter(s => !dismissed.has(s.id)).slice(0, 5);

  if (loading) {
    return (
      <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">✨</span>
          <h3 className="text-sm font-semibold">Smart Suggestions</h3>
        </div>
        <div className="text-xs text-slate-500">Analyzing your finances...</div>
      </div>
    );
  }

  if (visibleSuggestions.length === 0) {
    return (
      <div className="bg-gradient-to-br from-green-950/30 to-emerald-950/30 border border-green-800/50 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">✨</span>
          <h3 className="text-sm font-semibold text-green-300">Smart Suggestions</h3>
        </div>
        <div className="text-xs text-green-200">
          You're doing great! Keep tracking your expenses for personalized insights.
        </div>
      </div>
    );
  }

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "warning":
        return "from-red-950/40 to-orange-950/40 border-red-700/50";
      case "opportunity":
        return "from-green-950/40 to-emerald-950/40 border-green-700/50";
      case "achievement":
        return "from-purple-950/40 to-pink-950/40 border-purple-700/50";
      default:
        return "from-blue-950/40 to-cyan-950/40 border-blue-700/50";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg animate-pulse">✨</span>
          <h3 className="text-sm font-semibold">Smart Suggestions</h3>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
          Live
        </span>
      </div>

      <div className="space-y-2">
        {visibleSuggestions.map((suggestion, index) => (
          <div
            key={suggestion.id}
            className={`bg-gradient-to-br ${getTypeStyles(suggestion.type)} border rounded-xl p-3 transition-all hover:scale-[1.02]`}
            style={{
              animation: `fadeIn 0.3s ease-out ${index * 0.1}s both`
            }}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-start gap-2 flex-1">
                <span className="text-lg">{suggestion.icon}</span>
                <div className="flex-1">
                  <h4 className="text-xs font-semibold mb-1">{suggestion.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {suggestion.message}
                  </p>
                </div>
              </div>
              <button
                onClick={() => dismissSuggestion(suggestion.id)}
                className="text-slate-500 hover:text-slate-300 transition-colors text-sm"
                title="Dismiss"
              >
                ✕
              </button>
            </div>

            {suggestion.action && (
              <button
                onClick={() => {
                  if (suggestion.action?.href) {
                    router.push(suggestion.action.href);
                  } else if (suggestion.action?.onClick) {
                    suggestion.action.onClick();
                  }
                }}
                className="w-full mt-2 text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
              >
                {suggestion.action.label} →
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="text-xs text-slate-500 text-center pt-2">
        AI-powered insights update every 5 minutes
      </div>
    </div>
  );
}
