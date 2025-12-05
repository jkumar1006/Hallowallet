"use client";

import { useState, useEffect } from "react";
import { ExpenseCategory } from "../../lib/types";

const CATEGORIES: ExpenseCategory[] = ["Food", "Transit", "Bills", "Subscriptions", "Other"];

export default function AddExpenseModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    document.addEventListener("hw:add-expense-open", handleOpen);
    return () => document.removeEventListener("hw:add-expense-open", handleOpen);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const category = showCustomCategory && customCategory 
      ? customCategory 
      : form.get("category");

    const payload = {
      date: form.get("date"),
      description: form.get("description"),
      category,
      merchant: form.get("merchant") || undefined,
      amount: parseFloat(form.get("amount") as string),
      isSubscription: form.get("isSubscription") === "on",
      notes: form.get("notes") || undefined
    };

    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to add expense");
      return;
    }

    // Success - close modal and refresh
    setIsOpen(false);
    setShowCustomCategory(false);
    setCustomCategory("");
    window.location.reload();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 hw-bg-card rounded-2xl border border-slate-800 hw-border w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-slate-800 hw-border flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white hw-text-accent">Add Expense 💸</h2>
          <button
            onClick={() => {
              setIsOpen(false);
              setShowCustomCategory(false);
              setCustomCategory("");
            }}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Description / Title *
            </label>
            <input
              name="description"
              required
              placeholder="e.g., Coffee at Starbucks"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white hw-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Amount *
              </label>
              <input
                name="amount"
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white hw-input"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">
                Date *
              </label>
              <div className="relative">
                <input
                  name="date"
                  type="date"
                  required
                  defaultValue={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2 pr-10 rounded-lg bg-slate-950 border border-slate-700 text-white hw-input"
                  style={{ colorScheme: 'dark' }}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  📅
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Category *
            </label>
            {!showCustomCategory ? (
              <div className="space-y-2">
                <select
                  name="category"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white hw-input"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
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
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white hw-input"
                  required
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

          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Merchant (optional)
            </label>
            <input
              name="merchant"
              placeholder="e.g., Starbucks"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white hw-input"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Notes (optional)
            </label>
            <textarea
              name="notes"
              rows={3}
              placeholder="Any additional details..."
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white resize-none hw-input"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isSubscription"
              id="isSubscription"
              className="rounded"
            />
            <label htmlFor="isSubscription" className="text-sm text-slate-300">
              This is a recurring subscription
            </label>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-950/30 px-3 py-2 rounded">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setShowCustomCategory(false);
                setCustomCategory("");
              }}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-700 hw-btn-secondary transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-white text-black font-semibold hover:bg-slate-100 disabled:opacity-50 hw-btn-primary transition-all"
            >
              {loading ? "Adding..." : "Add Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
