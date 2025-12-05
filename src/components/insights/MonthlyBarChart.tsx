"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
  Brush,
} from "recharts";
import { useLanguage } from "../../contexts/LanguageContext";

type PeriodKey = "6m" | "1y" | "2y" | "5y";
type MonthPoint = { key: string; label: string; amount: number; count: number; ma?: number };

function monthsBackKeys(n: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return out;
}

function monthLabel(key: string, locale: string, shortYear = false) {
  const [y, m] = key.split("-");
  const d = new Date(parseInt(y), parseInt(m) - 1, 1);
  return d.toLocaleDateString(locale, { month: "short", ...(shortYear ? { year: "2-digit" } : {}) });
}

function fmtCurrencyFull(n: number, locale: string, currency = "USD") {
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 2 }).format(n);
  } catch {
    return `$${n.toLocaleString()}`;
  }
}

function fmtCurrencyCompact(n: number, locale: string) {
  try {
    return new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(n);
  } catch {
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
  }
}

function currencySymbol(currency = "USD") {
  try {
    const p = (0).toLocaleString(undefined, { style: "currency", currency });
    const sym = p.replace(/[\d\s.,]/g, "");
    return sym || "$";
  } catch {
    return "$";
  }
}

function niceCeil(max: number) {
  if (max <= 0) return 10000;
  // Use increments of 10k, 25k, 50k, 75k, 100k, etc.
  const increments = [10000, 25000, 50000, 75000, 100000, 250000, 500000, 750000, 1000000];
  for (const inc of increments) {
    if (max <= inc) return inc;
  }
  // For very large numbers, round up to nearest million
  return Math.ceil(max / 1000000) * 1000000;
}

function movingAverage(points: number[], windowSize: number) {
  if (windowSize <= 1) return points.map(v => v);
  const out: number[] = [];
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    sum += points[i];
    if (i >= windowSize) sum -= points[i - windowSize];
    out[i] = i + 1 >= windowSize ? sum / windowSize : NaN;
  }
  return out;
}

export default function MonthlySpendingTrend({ currency = "USD" }: { currency?: string }) {
  const { t, language: lang } = useLanguage();
  const [period, setPeriod] = useState<PeriodKey>("1y");
  const [data, setData] = useState<MonthPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [maWindow, setMaWindow] = useState(3); // 3-month moving average
  const [showMA, setShowMA] = useState(true);

  const monthsToShow = useMemo(() => {
    switch (period) {
      case "6m": return 6;
      case "1y": return 12;
      case "2y": return 24;
      case "5y": return 60;
      default: return 12;
    }
  }, [period]);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/expenses?category=All`, { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const expenses = await res.json(); // [{date, amount, ...}]
      const keys = monthsBackKeys(monthsToShow);

      const bucket = new Map<string, { amount: number; count: number }>();
      keys.forEach(k => bucket.set(k, { amount: 0, count: 0 }));

      for (const e of expenses) {
        if (!e?.date || typeof e.amount !== "number") continue;
        const k = String(e.date).slice(0, 7);
        if (bucket.has(k)) {
          const b = bucket.get(k)!;
          b.amount += e.amount;
          b.count += 1;
        }
      }

      const pts: MonthPoint[] = keys.map(k => ({
        key: k,
        label: monthLabel(k, lang, period === "2y" || period === "5y"),
        amount: Math.max(0, bucket.get(k)?.amount ?? 0),
        count: bucket.get(k)?.count ?? 0,
      }));

      // compute moving average
      const ma = movingAverage(pts.map(p => p.amount), maWindow);
      const final = pts.map((p, i) => ({ ...p, ma: ma[i] }));

      setData(final);
    } catch (e: any) {
      console.error("[MonthlySpendingTrend] load error", e);
      setErr(e?.message || "load_error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [period, lang, maWindow]);

  useEffect(() => {
    const onUpd = () => load();
    document.addEventListener("hw:expenses-updated", onUpd);
    return () => document.removeEventListener("hw:expenses-updated", onUpd);
  }, []);

  const values = data.map(d => d.amount);
  const sum = values.reduce((s, v) => s + v, 0);
  const avg = data.length ? sum / data.length : 0;
  const yMax = niceCeil(Math.max(...values, avg * 1.3, 1));
  const sym = currencySymbol(currency);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-7 w-52 bg-slate-800/60 rounded animate-pulse" />
        <div className="h-80 bg-slate-900/40 rounded-xl border border-slate-800 animate-pulse" />
      </div>
    );
  }

  if (err) {
    return (
      <div className="rounded-xl border border-red-800/60 bg-red-950/30 p-4 text-sm">
        <div className="font-semibold text-red-300">{t("charts.loadError") || "Could not load chart"}</div>
        <div className="text-red-400/80">{err}</div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
        {t("charts.noData") || "No spending data yet."}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 md:p-4 space-y-4">
      {/* Header + Controls */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-base font-bold">📊 Spending Trend</h3>
          <p className="text-xs text-slate-400">
            Total: <span className="font-semibold text-slate-200">
              {fmtCurrencyFull(sum, lang, currency)}
            </span>{" "}
            • Average: <span className="font-semibold text-slate-200">
              {fmtCurrencyFull(avg, lang, currency)}/month
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {(["6m", "1y", "2y", "5y"] as PeriodKey[]).map(k => (
            <button
              key={k}
              onClick={() => setPeriod(k)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                period === k
                  ? "bg-gradient-to-r from-orange-500 to-fuchsia-500 text-white shadow-lg"
                  : "bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-700/60"
              }`}
            >
              {k.toUpperCase()}
            </button>
          ))}

          <button
            onClick={() => setShowMA(v => !v)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              showMA ? "bg-emerald-700/80 text-white" : "bg-slate-800/60 text-slate-300 hover:text-white"
            }`}
            title="Shows a smoothed average line to reveal spending patterns over time"
          >
            {showMA ? "Trend ON" : "Trend OFF"}
          </button>

          <select
            value={maWindow}
            onChange={e => setMaWindow(parseInt(e.target.value, 10))}
            className="px-2 py-1.5 rounded-lg text-xs bg-slate-800/60 text-slate-200 border border-slate-700"
          >
            {[3, 6, 12].map(w => (
              <option key={w} value={w}>
                {w} Month Trend
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fb923c" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke="rgba(100,116,139,0.2)" vertical={false} />
              <XAxis

                dataKey="label"
                tick={{ fill: "rgba(226,232,240,0.85)", fontSize: 10 }}
                axisLine={{ stroke: "rgba(100,116,139,0.35)" }}
                tickLine={false}
              />
              <YAxis
                domain={[0, yMax]}
                tickCount={6}
                tickFormatter={(v) => {
                  if (v === 0) return '$0';
                  if (v >= 1000) return `$${(v / 1000).toFixed(0)}k`;
                  return `$${v}`;
                }}
                width={68}
                tick={{ fill: "rgba(226,232,240,0.85)", fontSize: 10 }}
                axisLine={{ stroke: "rgba(100,116,139,0.35)" }}
                tickLine={false}
              />
              <Tooltip
                labelStyle={{ color: "#e2e8f0" }}
                formatter={(v: any) => fmtCurrencyFull(v, lang, currency)}
                contentStyle={{
                  background: "rgba(2,6,23,0.95)",
                  border: "1px solid rgba(51,65,85,0.7)",
                  borderRadius: 12,
                }}
              />

              {/* Average ref line */}
              <ReferenceLine
                y={avg}
                stroke="rgba(250,204,21,0.85)"
                strokeDasharray="4 4"
                label={{
                  value: `${t("charts.average") || "Average"}: ${fmtCurrencyFull(avg, lang, currency)}`,
                  position: "insideTopRight",
                  fill: "rgba(250,204,21,0.95)",
                  fontSize: 10,
                }}
              />

              {/* Filled area (monthly totals) */}
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#fb923c"
                fill="url(#areaFill)"
                strokeWidth={2}
                dot={{ r: 2, strokeWidth: 0 }}
                activeDot={{ r: 4 }}
              />

              {/* Moving average line */}
              {showMA && (
                <Line
                  type="monotone"
                  dataKey="ma"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              )}

              <Brush
                dataKey="label"
                height={22}
                travellerWidth={10}
                stroke="rgba(148,163,184,0.6)"
                fill="rgba(15,23,42,0.4)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

      {/* Info Box */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <span className="text-lg">💡</span>
          <div className="flex-1 text-xs">
            <div className="font-semibold text-white mb-1">Understanding the Trend Line</div>
            <p className="text-slate-400 mb-2">The blue line shows your average spending pattern by smoothing out one-time spikes.</p>
            <div className="grid grid-cols-3 gap-2 text-[10px]">
              <div className="bg-slate-900/50 p-2 rounded">
                <div className="font-semibold text-slate-200">3 Month</div>
                <div className="text-slate-400">Quick to show recent changes</div>
              </div>
              <div className="bg-slate-900/50 p-2 rounded">
                <div className="font-semibold text-slate-200">6 Month</div>
                <div className="text-slate-400">Balanced view</div>
              </div>
              <div className="bg-slate-900/50 p-2 rounded">
                <div className="font-semibold text-slate-200">12 Month</div>
                <div className="text-slate-400">Long-term pattern</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
