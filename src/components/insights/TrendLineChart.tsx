"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

type PeriodKey = "7d" | "30d";
type DayRow = { key: string; label: string; amount: number };

function daysBackKeys(n: number, fromMonth?: string): string[] {
  const out: string[] = [];
  let startDate: Date;
  
  if (fromMonth) {
    // Get last day of the specified month
    const [year, month] = fromMonth.split('-').map(Number);
    startDate = new Date(year, month, 0); // Last day of month
  } else {
    startDate = new Date();
  }
  
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(startDate);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function daysInMonth(yearMonth: string): string[] {
  const [year, month] = yearMonth.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  const days: string[] = [];
  
  while (date.getMonth() === month - 1) {
    days.push(date.toISOString().slice(0, 10));
    date.setDate(date.getDate() + 1);
  }
  
  return days;
}

function fmtFull(n: number, locale = "en-US", currency = "USD") {
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 2 }).format(n);
  } catch {
    return `$${n.toLocaleString()}`;
  }
}

function niceCeil(max: number) {
  if (max <= 0) return 100; // Default minimum scale
  if (max < 10) return 10; // At least $10 scale
  
  // Round up to nice numbers
  if (max <= 100) return Math.ceil(max / 10) * 10;
  if (max <= 1000) return Math.ceil(max / 100) * 100;
  if (max <= 10000) return Math.ceil(max / 1000) * 1000;
  if (max <= 100000) return Math.ceil(max / 10000) * 10000;
  
  // For very large numbers
  const pow = Math.pow(10, Math.floor(Math.log10(max)));
  const n = max / pow;
  let m = 1;
  if (n > 1 && n <= 2) m = 2;
  else if (n > 2 && n <= 5) m = 5;
  else if (n > 5) m = 10;
  return m * pow;
}

export default function SpendingOverviewSimple({ currency = "USD" }: { currency?: string }) {
  const [period, setPeriod] = useState<PeriodKey>("30d");
  const [rows, setRows] = useState<DayRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const daysToShow = period === "7d" ? 7 : 30;
  const locale = typeof navigator !== "undefined" ? navigator.language : "en-US";
  
  // Get current month from URL or use current month
  const getCurrentMonth = () => {
    if (typeof window === "undefined") return new Date().toISOString().slice(0, 7);
    const params = new URLSearchParams(window.location.search);
    return params.get("month") || new Date().toISOString().slice(0, 7);
  };

  // ---- load window data ----
  async function loadWindow() {
    setLoading(true);
    setErr(null);
    try {
      const currentMonth = getCurrentMonth();
      const res = await fetch("/api/expenses?category=All", { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const expenses = await res.json(); // [{date, amount, ...}]

      // Use month-based keys for 30d, last 7 days of selected month for 7d
      const keys = period === "30d" ? daysInMonth(currentMonth) : daysBackKeys(daysToShow, currentMonth);
      const map = new Map<string, number>();
      keys.forEach((k) => map.set(k, 0));

      for (const e of expenses) {
        if (!e?.date || typeof e.amount !== "number") continue;
        const day = String(e.date).slice(0, 10);
        if (map.has(day)) map.set(day, (map.get(day) || 0) + e.amount);
      }

      const labelFor = (k: string, idx: number) => {
        const d = new Date(k);
        if (period === "7d") return d.toLocaleDateString(locale, { weekday: "short" }); // Mon, Tue…
        return String(d.getDate()); // 1..31 for 30d
      };

      const built: DayRow[] = keys.map((k, i) => ({
        key: k,
        label: labelFor(k, i),
        amount: map.get(k) || 0,
      }));

      setRows(built);
    } catch (e: any) {
      console.error("[SpendingOverviewSimple] loadWindow error", e);
      setErr(e?.message || "load_error");
    } finally {
      setLoading(false);
    }
  }

  // initial + on period change + on month change
  useEffect(() => {
    loadWindow();
    
    // Listen for month changes from URL
    const handleMonthChange = () => loadWindow();
    window.addEventListener('popstate', handleMonthChange);
    return () => window.removeEventListener('popstate', handleMonthChange);
  }, [period]);

  // refresh when expenses change elsewhere
  useEffect(() => {
    const onUpd = () => loadWindow();
    document.addEventListener("hw:expenses-updated", onUpd);
    return () => document.removeEventListener("hw:expenses-updated", onUpd);
  }, []);

  // ---- insights for current window ----
  const total = useMemo(() => rows.reduce((s, r) => s + r.amount, 0), [rows]);
  const avgPerDay = useMemo(() => (rows.length ? total / rows.length : 0), [rows, total]);
  const maxAmount = Math.max(...rows.map((r) => r.amount), avgPerDay * 1.3, 1);
  const yMax = niceCeil(maxAmount);
  const peak = rows.length ? rows.reduce((a, b) => (b.amount > a.amount ? b : a), rows[0]) : null;

  // ---- previous window comparison (same length right before current) ----
  const [prevTotal, setPrevTotal] = useState<number | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/expenses?category=All", { credentials: "include" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const expenses = await res.json();

        if (!rows.length) return setPrevTotal(null);
        const startCur = new Date(rows[0].key); // first day in current window
        const prevStart = new Date(startCur);
        prevStart.setDate(prevStart.getDate() - daysToShow);
        const prevEnd = new Date(startCur);
        prevEnd.setDate(prevEnd.getDate() - 1);

        const sKey = prevStart.toISOString().slice(0, 10);
        const eKey = prevEnd.toISOString().slice(0, 10);

        let sum = 0;
        for (const e of expenses) {
          const d = String(e.date).slice(0, 10);
          if (d >= sKey && d <= eKey) sum += e.amount || 0;
        }
        setPrevTotal(sum);
      } catch {
        setPrevTotal(null);
      }
    })();
  }, [rows.length, daysToShow]);

  const changePct =
    prevTotal != null && prevTotal !== 0 ? (((total - prevTotal) / prevTotal) * 100) : (prevTotal === 0 ? 100 : 0);

  // ---- weekday totals (which day is highest) ----
  const weekdayTotals = useMemo(() => {
    const arr = Array.from({ length: 7 }, () => 0);
    rows.forEach((r) => {
      const d = new Date(r.key).getDay(); // 0..6
      arr[d] += r.amount;
    });
    return arr;
  }, [rows]);

  const weekdayLabels = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) =>
        new Date(2025, 0, 5 + i).toLocaleDateString(locale, { weekday: "short" })
      ),
    [locale]
  );

  const weekdayData = weekdayTotals.map((v, i) => ({ name: weekdayLabels[i], value: v }));
  const topDayIdx = weekdayTotals.length ? weekdayTotals.indexOf(Math.max(...weekdayTotals)) : 0;
  const topDayName = weekdayLabels[topDayIdx] || "-";
  const topDayValue = weekdayTotals[topDayIdx] || 0;

  // ---- UI states ----
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-56 bg-slate-800/60 rounded animate-pulse" />
        <div className="h-72 bg-slate-900/40 rounded-xl border border-slate-800 animate-pulse" />
        <div className="h-28 bg-slate-900/40 rounded-xl border border-slate-800 animate-pulse" />
      </div>
    );
  }
  if (err) {
    return (
      <div className="rounded-xl border border-red-800/60 bg-red-950/30 p-4 text-sm">
        <div className="font-semibold text-red-300">Could not load spending</div>
        <div className="text-red-400/80">{err}</div>
      </div>
    );
  }
  if (!rows.length) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
        No spending yet for this period.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header + Range */}
      <div className="flex items-center justify-end gap-3 flex-wrap">
        <div className="flex gap-2" role="tablist" aria-label="Spending period">
          {(["7d", "30d"] as PeriodKey[]).map((k) => (
            <button
              key={k}
              role="tab"
              aria-selected={period === k}
              onClick={() => setPeriod(k)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/60 ${
                period === k
                  ? "bg-gradient-to-r from-orange-500 to-fuchsia-500 text-white shadow-lg"
                  : "bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-700/60"
              }`}
            >
              {k === "7d" ? "7 Days" : "30 Days"}
            </button>
          ))}
        </div>
      </div>

      {/* Area chart (simple + avg line) */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={rows} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="areaSoft" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fb923c" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#fb923c" stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke="rgba(148,163,184,0.18)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "rgba(226,232,240,0.9)", fontSize: 11 }}
                axisLine={{ stroke: "rgba(148,163,184,0.35)" }}
                tickLine={false}
              />
              <YAxis
                domain={[0, yMax]}
                tick={{ fill: "rgba(226,232,240,0.9)", fontSize: 11 }}
                tickFormatter={(v) => {
                  if (v === 0) return "$0";
                  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
                  if (v >= 1000) return `$${(v / 1000).toFixed(0)}k`;
                  if (v >= 100) return `$${Math.round(v)}`;
                  return `$${v.toFixed(0)}`;
                }}
                width={65}
                axisLine={{ stroke: "rgba(148,163,184,0.35)" }}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const data = payload[0].payload;
                  const date = new Date(data.key);
                  const dateStr = date.toLocaleDateString(locale, { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  });
                  return (
                    <div style={{
                      background: "rgba(2,6,23,0.98)",
                      border: "1px solid rgba(71,85,105,0.9)",
                      borderRadius: 12,
                      padding: "8px 12px"
                    }}>
                      <div style={{ color: "#e2e8f0", fontWeight: 600, marginBottom: 4 }}>
                        {dateStr}
                      </div>
                      <div style={{ color: "#fb923c", fontSize: 14 }}>
                        Spent: {fmtFull(data.amount, locale, currency)}
                      </div>
                    </div>
                  );
                }}
              />

              <ReferenceLine
                y={avgPerDay}
                stroke="rgba(250,204,21,0.95)"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{
                  value: `Avg: ${fmtFull(avgPerDay, locale, currency)}`,
                  position: "insideTopRight",
                  fill: "rgba(250,204,21,0.98)",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              />

              <Area
                type="monotone"
                dataKey="amount"
                stroke="#fb923c"
                strokeWidth={2.25}
                fill="url(#areaSoft)"
                dot={false}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekday: which day costs most */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold">Spending by Weekday</h4>
          <span className="text-xs text-slate-400">
            Highest: <span className="font-semibold text-slate-200">{topDayName}</span> (
            {fmtFull(topDayValue, locale, currency)})
          </span>
        </div>
        <div className="h-28 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekdayData} margin={{ top: 0, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid stroke="rgba(100,116,139,0.15)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "rgba(226,232,240,0.85)", fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis hide />
              <Tooltip
                labelStyle={{ color: "#e2e8f0" }}
                formatter={(v: any) => fmtFull(v, locale, currency)}
                contentStyle={{
                  background: "rgba(2,6,23,0.95)",
                  border: "1px solid rgba(51,65,85,0.7)",
                  borderRadius: 12,
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#a78bfa" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3 simple insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-sm">
          <div className="font-semibold mb-1">This period</div>
          <div className="text-slate-300">You spent <b>{fmtFull(total, locale, currency)}</b> in the last {daysToShow} days.</div>
        </div>
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-sm">
          <div className="font-semibold mb-1">Change vs previous</div>
          <div className="text-slate-300">
            {prevTotal == null
              ? "—"
              : `That’s ${changePct >= 0 ? "up" : "down"} ${Math.abs(changePct).toFixed(1)}% vs the prior ${daysToShow} days.`}
          </div>
        </div>
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-sm">
          <div className="font-semibold mb-1">Top weekday</div>
          <div className="text-slate-300 break-words">
            You spend the most on <b>{topDayName}</b> (~<span className="whitespace-nowrap">{fmtFull(topDayValue, locale, currency)}</span>).
          </div>
        </div>
      </div>
    </div>
  );
}
