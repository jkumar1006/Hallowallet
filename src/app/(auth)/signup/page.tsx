"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const form = new FormData(e.currentTarget);
    const password = form.get("password") as string;
    const confirmPassword = form.get("confirmPassword") as string;
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }
    
    const payload = {
      email: form.get("email"),
      password: form.get("password"),
      name: form.get("name")
    };
    
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    setLoading(false);
    
    if (!res.ok) {
      setError(data.error || "Signup failed");
      return;
    }
    
    // Redirect to dashboard after successful signup
    window.location.href = "/dashboard";
  }

  return (
    <main className="flex items-center justify-center min-h-screen relative">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-slate-900/80 hw-bg-card p-8 rounded-2xl border border-slate-800 hw-border space-y-4 shadow-2xl"
      >
        <div>
          <h2 className="text-2xl font-semibold text-white hw-text-accent">Create Account 🎃</h2>
          <p className="text-sm text-slate-400 mt-1">Join HalloWallet and start tracking your finances</p>
        </div>
        
        <div>
          <label className="block text-sm text-slate-300 mb-1">Full Name</label>
          <input
            name="name"
            type="text"
            required
            placeholder="John Doe"
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 hw-input text-white"
          />
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
          <label className="block text-sm text-slate-300 mb-1">Password</label>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            placeholder="At least 6 characters"
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 hw-input text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm text-slate-300 mb-1">Confirm Password</label>
          <input
            name="confirmPassword"
            type="password"
            required
            minLength={6}
            placeholder="Re-enter password"
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
          {loading ? "Creating Account..." : "Sign Up"}
        </button>
        
        <div className="text-center">
          <p className="text-xs text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 underline">
              Login here
            </Link>
          </p>
        </div>
      </form>
    </main>
  );
}
