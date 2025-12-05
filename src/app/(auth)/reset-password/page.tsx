"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (!emailParam) {
      router.push("/forgot-password");
      return;
    }
    setEmail(emailParam);
  }, [searchParams, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const form = new FormData(e.currentTarget);
    const newPassword = form.get("password") as string;
    const confirmPassword = form.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, newPassword })
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Failed to reset password");
      return;
    }

    // Success - redirect to login
    alert("✅ Password reset successful! Please login with your new password.");
    router.push("/login");
  }

  if (!email) {
    return null;
  }

  return (
    <main className="flex items-center justify-center min-h-screen relative">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-slate-900/80 hw-bg-card p-8 rounded-2xl border border-slate-800 hw-border space-y-4 shadow-2xl"
      >
        <div>
          <h2 className="text-2xl font-semibold text-white hw-text-accent">Reset Password 🔐</h2>
          <p className="text-sm text-slate-400 mt-1">Enter your new password for {email}</p>
        </div>
        
        <div>
          <label className="block text-sm text-slate-300 mb-1">New Password</label>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            placeholder="Enter new password (min 6 characters)"
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
            placeholder="Confirm new password"
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
          {loading ? "Resetting..." : "Reset Password"}
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
