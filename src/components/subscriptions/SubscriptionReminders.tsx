"use client";

import { useEffect, useState } from "react";

type RenewalReminder = {
  id: string;
  description: string;
  amount: number;
  renewalDate: string;
  daysUntil: number;
  reminderDays: number;
};

type ReminderSettings = {
  [subscriptionId: string]: number;
};

export default function SubscriptionReminders() {
  const [reminders, setReminders] = useState<RenewalReminder[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function checkRenewals() {
      try {
        const res = await fetch("/api/subscriptions");
        if (!res.ok) return;
        
        const data = await res.json();
        const now = new Date();
        
        // Convert to EST timezone
        const estNow = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
        
        // Load user's reminder settings
        const savedSettings = localStorage.getItem("subscriptionReminders");
        const reminderSettings: ReminderSettings = savedSettings ? JSON.parse(savedSettings) : {};
        
        const upcomingRenewals: RenewalReminder[] = [];
        
        data.subscriptions.forEach((sub: any) => {
          // Only show reminders for subscriptions that have reminder settings
          const reminderDays = reminderSettings[sub.id];
          if (!reminderDays) return;
          
          const lastCharge = new Date(sub.lastCharge);
          const nextRenewal = new Date(lastCharge);
          nextRenewal.setMonth(nextRenewal.getMonth() + 1);
          
          const daysUntil = Math.ceil((nextRenewal.getTime() - estNow.getTime()) / (1000 * 60 * 60 * 24));
          
          // Show reminder if renewal is within the user's specified days
          if (daysUntil >= 0 && daysUntil <= reminderDays) {
            upcomingRenewals.push({
              id: sub.id,
              description: sub.description,
              amount: sub.amount,
              renewalDate: nextRenewal.toLocaleDateString("en-US", { 
                timeZone: "America/New_York",
                month: "short",
                day: "numeric",
                year: "numeric"
              }),
              daysUntil,
              reminderDays
            });
          }
        });
        
        setReminders(upcomingRenewals);
      } catch (err) {
        console.error("Failed to check renewals:", err);
      }
    }
    
    // Check immediately
    checkRenewals();
    
    // Check every 30 minutes
    const interval = setInterval(checkRenewals, 30 * 60 * 1000);
    
    // Listen for storage changes (when user updates reminder settings)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "subscriptionReminders") {
        checkRenewals();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const visibleReminders = reminders.filter(r => !dismissed.has(r.id));

  const dismissReminder = (id: string) => {
    setDismissed(prev => {
      const newSet = new Set(prev);
      newSet.add(id);
      // Save dismissed reminders to localStorage (expires after 24 hours)
      const dismissedData = {
        ids: Array.from(newSet),
        timestamp: Date.now()
      };
      localStorage.setItem("dismissedReminders", JSON.stringify(dismissedData));
      return newSet;
    });
  };

  // Load dismissed reminders on mount
  useEffect(() => {
    const saved = localStorage.getItem("dismissedReminders");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const hoursSinceDismissed = (Date.now() - data.timestamp) / (1000 * 60 * 60);
        // Clear dismissed reminders after 24 hours
        if (hoursSinceDismissed < 24) {
          setDismissed(new Set(data.ids));
        } else {
          localStorage.removeItem("dismissedReminders");
        }
      } catch (err) {
        console.error("Failed to parse dismissed reminders:", err);
      }
    }
  }, []);

  if (visibleReminders.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-3 max-w-sm">
      {visibleReminders.map((reminder) => (
        <div
          key={reminder.id}
          className="bg-gradient-to-br from-orange-900/95 to-red-900/95 backdrop-blur-lg border-2 border-orange-500/50 rounded-2xl p-4 shadow-2xl animate-fadeIn"
          style={{
            animation: "fadeIn 0.3s ease-out, slideInRight 0.3s ease-out"
          }}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl animate-pulse">🔔</span>
              <h3 className="text-sm font-bold text-orange-200">Subscription Renewal Alert</h3>
            </div>
            <button
              onClick={() => dismissReminder(reminder.id)}
              className="text-orange-300 hover:text-white transition-colors text-lg leading-none"
              title="Dismiss for 24 hours"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-2">
            <div className="text-white font-semibold text-base">
              {reminder.description}
            </div>
            
            <div className="text-sm text-orange-200 space-y-1">
              <div className="flex items-center justify-between">
                <span>Amount:</span>
                <span className="font-bold">${reminder.amount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Renewal Date:</span>
                <span className="font-bold">{reminder.renewalDate}</span>
              </div>
            </div>
            
            <div className={`text-center py-2 px-3 rounded-lg font-bold ${
              reminder.daysUntil === 0 
                ? "bg-red-600 text-white shadow-lg shadow-red-500/50" 
                : reminder.daysUntil === 1
                ? "bg-orange-600 text-white shadow-lg shadow-orange-500/50"
                : "bg-yellow-600 text-white shadow-lg shadow-yellow-500/50"
            }`}>
              {reminder.daysUntil === 0 
                ? "⚠️ Renews TODAY!" 
                : reminder.daysUntil === 1
                ? "⚠️ Renews TOMORROW"
                : `Renews in ${reminder.daysUntil} days`}
            </div>
            
            <div className="text-xs text-orange-300 bg-orange-950/50 rounded-lg p-2 text-center">
              💡 You set a reminder for {reminder.reminderDays} days before renewal
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-orange-700/50 flex items-center justify-between text-xs text-orange-300">
            <span>
              {new Date().toLocaleString("en-US", { 
                timeZone: "America/New_York",
                hour: "numeric",
                minute: "2-digit",
                hour12: true
              })} EST
            </span>
            <button
              onClick={() => dismissReminder(reminder.id)}
              className="text-orange-400 hover:text-orange-200 underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
