"use client";

import SpendingTracker from "../../../components/tracker/SpendingTracker";

export default function AdvisorPage() {
  return (
    <div className="space-y-4">
      <div className="bg-slate-950/90 hw-bg-card border border-slate-800 hw-border rounded-2xl p-6">
        <h1 className="text-2xl font-bold mb-2">💰 Financial Advisor</h1>
        <p className="text-sm text-slate-400">
          Get personalized spending advice and smart purchase recommendations based on your income, savings goals, and actual spending patterns.
        </p>
      </div>
      <SpendingTracker />
    </div>
  );
}
