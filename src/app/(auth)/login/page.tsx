"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Login failed");
      return;
    }
    window.location.href = "/dashboard";
  }

  return (
    <main className="flex items-center justify-center min-h-screen relative">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-slate-900/80 hw-bg-card p-8 rounded-2xl border border-slate-800 hw-border space-y-4 shadow-2xl"
      >
        <div>
          <h2 className="text-2xl font-semibold text-white hw-text-accent">Welcome back 👋</h2>
          <p className="text-sm text-slate-400 mt-1">Login to your HalloWallet account</p>
        </div>
        
        <div>
          <label className="block text-sm text-slate-300 mb-1">Email</label>
          <input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 hw-input text-white"
          />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm text-slate-300">Password</label>
            <Link href="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300 underline">
              Forgot password?
            </Link>
          </div>
          <input
            name="password"
            type="password"
            required
            placeholder="Enter your password"
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 hw-input text-white"
          />
        </div>
        
        {error && (
          <div className="bg-red-950/30 border border-red-800/50 rounded-lg p-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-white text-black font-semibold hover:bg-slate-100 hw-btn-primary transition-all disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        
        <div className="text-center">
          <p className="text-xs text-slate-400">
            Don't have an account?{" "}
            <Link href="/signup" className="text-blue-400 hover:text-blue-300 underline">
              Sign up here
            </Link>
          </p>
        </div>
      </form>
    </main>
  );
}
