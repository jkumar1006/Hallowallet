"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;

    const res = await fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Email not found");
      return;
    }

    setSuccess(true);
    // Redirect to reset password page after 1 second
    setTimeout(() => {
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    }, 1000);
  }

  return (
    <main className="flex items-center justify-center min-h-screen relative">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-slate-900/80 hw-bg-card p-8 rounded-2xl border border-slate-800 hw-border space-y-4 shadow-2xl"
      >
        <div>
          <h2 className="text-2xl font-semibold text-white hw-text-accent">Forgot Password? 🔑</h2>
          <p className="text-sm text-slate-400 mt-1">Enter your email to reset your password</p>
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
        
        {error && (
          <div className="bg-red-950/30 border border-red-800/50 rounded-lg p-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-950/30 border border-green-800/50 rounded-lg p-3">
            <p className="text-sm text-green-400">✅ Email verified! Redirecting...</p>
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading || success}
          className="w-full py-2.5 rounded-xl bg-white text-black font-semibold hover:bg-slate-100 hw-btn-primary transition-all disabled:opacity-50"
        >
          {loading ? "Verifying..." : success ? "Verified!" : "Continue"}
        </button>
        
        <div className="text-center">
          <p className="text-xs text-slate-400">
            Remember your password?{" "}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 underline">
              Back to login
            </Link>
          </p>
        </div>
      </form>
    </main>
  );
}
