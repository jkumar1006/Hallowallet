"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type SubscriptionSummary = {
  count: number;
  monthlyTotal: number;
  yearlyTotal: number;
};

export default function SubscriptionWidget() {
  const [summary, setSummary] = useState<SubscriptionSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/subscriptions");
        if (res.ok) {
          const data = await res.json();
          setSummary(data.summary);
        }
      } catch (err) {
        console.error("Failed to load subscriptions:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4">
        <div className="text-xs text-slate-500">Loading subscriptions...</div>
      </div>
    );
  }

  if (!summary || summary.count === 0) {
    return (
      <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🔄</span>
          <h3 className="text-sm font-semibold">Subscriptions</h3>
        </div>
        <p className="text-xs text-slate-500">No active subscriptions</p>
      </div>
    );
  }

  return (
    <Link href="/subscriptions">
      <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-700/50 rounded-2xl p-4 hover:border-purple-600 transition-all cursor-pointer group">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔄</span>
            <h3 className="text-sm font-semibold text-purple-300">Subscriptions</h3>
          </div>
          <span className="text-xs text-purple-400 group-hover:text-purple-300">
            View all →
          </span>
        </div>
        
        <div className="space-y-2">
          <div>
            <div className="text-2xl font-bold text-purple-200">
              ${summary.monthlyTotal.toFixed(2)}
            </div>
            <div className="text-xs text-purple-400">per month</div>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-purple-300">{summary.count} active</span>
            <span className="text-purple-400">${summary.yearlyTotal.toFixed(2)}/year</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
