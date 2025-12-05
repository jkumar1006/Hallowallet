"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Subscription = {
  id: string;
  description: string;
  amount: number;
  category: string;
  merchant?: string;
  lastCharge: string;
  frequency: string;
  totalPaid: number;
  count: number;
};

type SubscriptionData = {
  subscriptions: Subscription[];
  summary: {
    count: number;
    monthlyTotal: number;
    yearlyTotal: number;
  };
};

type ReminderSettings = {
  [subscriptionId: string]: number; // days before renewal
};

const categoryIcons: Record<string, string> = {
  Food: "🍔",
  Transit: "🚗",
  Bills: "📄",
  Subscriptions: "📱",
  Entertainment: "🎬",
  Other: "📦"
};

export default function SubscriptionsView() {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>({});
  const [editingReminder, setEditingReminder] = useState<string | null>(null);
  const [tempReminderDays, setTempReminderDays] = useState<number>(3);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/subscriptions");
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (err) {
        console.error("Failed to load subscriptions:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
    
    // Load reminder settings from localStorage
    const saved = localStorage.getItem("subscriptionReminders");
    if (saved) {
      try {
        setReminderSettings(JSON.parse(saved));
      } catch (err) {
        console.error("Failed to parse reminder settings:", err);
      }
    }
  }, []);

  const saveReminderSetting = (subscriptionId: string, days: number) => {
    const updated = { ...reminderSettings, [subscriptionId]: days };
    setReminderSettings(updated);
    localStorage.setItem("subscriptionReminders", JSON.stringify(updated));
    setEditingReminder(null);
  };

  const removeReminderSetting = (subscriptionId: string) => {
    const updated = { ...reminderSettings };
    delete updated[subscriptionId];
    setReminderSettings(updated);
    localStorage.setItem("subscriptionReminders", JSON.stringify(updated));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">🔄 Subscriptions</h2>
        <div className="text-sm text-slate-500">Loading...</div>
      </div>
    );
  }

  if (!data || data.subscriptions.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">🔄 Subscriptions</h2>
          <Link href="/dashboard">
            <button className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800">
              ← Back to Dashboard
            </button>
          </Link>
        </div>
        
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-3">🔄</div>
          <h3 className="text-lg font-semibold mb-2">No Subscriptions Yet</h3>
          <p className="text-sm text-slate-400 mb-4">
            Mark expenses as subscriptions to track your recurring payments
          </p>
          <Link href="/transactions">
            <button className="px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700">
              View Transactions
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const { subscriptions, summary } = data;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">🔄 Subscription Management</h2>
        <Link href="/dashboard">
          <button className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800">
            ← Back
          </button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-700/50 rounded-2xl p-4">
          <div className="text-xs text-purple-300 mb-1">Monthly Total</div>
          <div className="text-2xl font-bold text-purple-200">
            ${summary.monthlyTotal.toFixed(2)}
          </div>
          <div className="text-xs text-purple-400 mt-1">per month</div>
        </div>

        <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-700/50 rounded-2xl p-4">
          <div className="text-xs text-blue-300 mb-1">Yearly Total</div>
          <div className="text-2xl font-bold text-blue-200">
            ${summary.yearlyTotal.toFixed(2)}
          </div>
          <div className="text-xs text-blue-400 mt-1">per year</div>
        </div>

        <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-700/50 rounded-2xl p-4">
          <div className="text-xs text-green-300 mb-1">Active Subscriptions</div>
          <div className="text-2xl font-bold text-green-200">
            {summary.count}
          </div>
          <div className="text-xs text-green-400 mt-1">services</div>
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-sm font-semibold mb-4">All Subscriptions</h3>
        
        <div className="space-y-3">
          {subscriptions.map((sub) => {
            const icon = categoryIcons[sub.category] || "📦";
            const nextRenewal = new Date(sub.lastCharge);
            nextRenewal.setMonth(nextRenewal.getMonth() + 1);
            const daysUntil = Math.ceil((nextRenewal.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            
            return (
              <div
                key={sub.id}
                className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:bg-slate-900/70 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-2xl">{icon}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm mb-1">{sub.description}</div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          {sub.category}
                        </span>
                        {sub.merchant && (
                          <>
                            <span>•</span>
                            <span>{sub.merchant}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{sub.count} payments</span>
                      </div>
                      <div className="mt-2 text-xs text-slate-500">
                        Last charged: {new Date(sub.lastCharge).toLocaleDateString()}
                        {daysUntil > 0 && daysUntil < 31 && (
                          <span className="ml-2 text-yellow-400">
                            • Next renewal in {daysUntil} days
                          </span>
                        )}
                      </div>
                      
                      {/* Reminder Settings */}
                      <div className="mt-3">
                        {editingReminder === sub.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              max="30"
                              value={tempReminderDays}
                              onChange={(e) => setTempReminderDays(parseInt(e.target.value) || 3)}
                              className="w-16 px-2 py-1 text-xs rounded bg-slate-800 border border-slate-700 text-white"
                              placeholder="Days"
                            />
                            <span className="text-xs text-slate-400">days before</span>
                            <button
                              onClick={() => saveReminderSetting(sub.id, tempReminderDays)}
                              className="px-2 py-1 text-xs rounded bg-green-600 hover:bg-green-700 text-white"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingReminder(null)}
                              className="px-2 py-1 text-xs rounded bg-slate-700 hover:bg-slate-600 text-white"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : reminderSettings[sub.id] ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                              🔔 Reminder: {reminderSettings[sub.id]} days before
                            </span>
                            <button
                              onClick={() => {
                                setTempReminderDays(reminderSettings[sub.id]);
                                setEditingReminder(sub.id);
                              }}
                              className="text-xs text-blue-400 hover:text-blue-300"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => removeReminderSetting(sub.id)}
                              className="text-xs text-red-400 hover:text-red-300"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setTempReminderDays(3);
                              setEditingReminder(sub.id);
                            }}
                            className="text-xs px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300"
                          >
                            🔔 Set Reminder
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">
                      ${sub.amount.toFixed(2)}
                    </div>
                    <div className="text-xs text-slate-400">/{sub.frequency}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Total: ${sub.totalPaid.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-br from-blue-950/50 to-purple-950/50 border border-blue-700/50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">💡</span>
          <div className="text-sm font-semibold text-blue-300">Smart Subscription Tips</div>
        </div>
        <ul className="text-xs text-blue-200 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-green-400 font-bold">✓</span>
            <span><strong className="text-blue-100">Set Reminders:</strong> Click "Set Reminder" on any subscription to get popup alerts before renewal dates</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400">•</span>
            <span>Review your subscriptions monthly to cancel unused services</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400">•</span>
            <span>Look for annual plans to save money on frequently used services</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400">•</span>
            <span>Reminders appear as popup notifications at the bottom-right of your screen</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
