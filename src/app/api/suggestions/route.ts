// src/app/api/assistant/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../lib/auth";
import { db } from "../../../lib/db";

/* ========================= UTC & TZ DATE UTILS ========================= */
const MS_DAY = 86_400_000;

const toISO = (d: Date) =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
    .toISOString()
    .slice(0, 10); // YYYY-MM-DD

// Safely produce "today" in a specific IANA tz (fallback UTC)
function todayInTZ(tz?: string): string {
  try {
    if (!tz) return toISO(new Date());
    const now = new Date();
    const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" });
    const parts = fmt.formatToParts(now);
    const y = parts.find(p => p.type === "year")?.value ?? String(now.getUTCFullYear());
    const m = parts.find(p => p.type === "month")?.value ?? String(now.getUTCMonth() + 1).padStart(2, "0");
    const d = parts.find(p => p.type === "day")?.value ?? String(now.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  } catch {
    return toISO(new Date());
  }
}

const startOfMonthUTC = (y: number, m0: number) => toISO(new Date(Date.UTC(y, m0, 1)));
const endOfMonthUTC = (y: number, m0: number) => toISO(new Date(Date.UTC(y, m0 + 1, 0)));

const startOfWeekMonUTC = (iso: string) => {
  const d = new Date(iso + "T00:00:00.000Z");
  const day = d.getUTCDay(); // 0..6
  const diff = (day + 6) % 7; // Mon=0
  d.setUTCDate(d.getUTCDate() - diff);
  return toISO(d);
};
const endOfWeekMonUTC = (iso: string) => {
  const s = new Date(startOfWeekMonUTC(iso) + "T00:00:00.000Z");
  s.setUTCDate(s.getUTCDate() + 6);
  return toISO(s);
};

const addDaysISO = (iso: string, delta: number) => {
  const d = new Date(iso + "T00:00:00.000Z");
  d.setUTCDate(d.getUTCDate() + delta);
  return toISO(d);
};
const addMonthsISO = (iso: string, delta: number) => {
  const d = new Date(iso + "T00:00:00.000Z");
  d.setUTCMonth(d.getUTCMonth() + delta);
  return toISO(d);
};

/* ========================= RANGE PARSING ========================= */
type Range = { start: string; end: string };

const MONTHS = [
  // English full names
  "january","february","march","april","may","june",
  "july","august","september","october","november","december",
  // Spanish
  "enero","febrero","marzo","abril","mayo","junio",
  "julio","agosto","septiembre","setiembre","octubre","noviembre","diciembre",
];

const MONTH_ABBREV: Record<string, number> = {
  // English abbreviations
  "jan": 0, "feb": 1, "mar": 2, "apr": 3, "may": 4, "jun": 5,
  "jul": 6, "aug": 7, "sep": 8, "oct": 9, "nov": 10, "dec": 11,
  // Spanish abbreviations (only unique ones)
  "ene": 0, "abr": 3, "ago": 7, "dic": 11,
  // "sept" is also common
  "sept": 8,
};

const monthNameToIndex = (m: string): number | null => {
  const lower = m.toLowerCase();
  // Try abbreviation first
  if (MONTH_ABBREV[lower] !== undefined) return MONTH_ABBREV[lower];
  // Try full name
  const i = MONTHS.indexOf(lower);
  return i === -1 ? null : i % 12; // normalize EN/ES to 0..11
};

// “in May 2025”, “en mayo 2025”
function parseExplicitMonthRange(q: string): Range | null {
  // Try with year first: "May 2025", "in november 2025"
  let m = q.match(/\b(?:in\s+|en\s+|on\s+|for\s+)?([a-záéíóúüñ]+)\s+(\d{4})\b/i);
  if (m) {
    const mi = monthNameToIndex(m[1]);
    const y = parseInt(m[2], 10);
    if (mi != null && y) {
      console.log(`[Month Parse] Matched "${m[0]}" -> ${y}-${String(mi+1).padStart(2,'0')}`);
      return { start: startOfMonthUTC(y, mi), end: endOfMonthUTC(y, mi) };
    }
  }
  
  // Try month only - more flexible matching
  // Match any month name in the query, regardless of position
  const words = q.toLowerCase().split(/\s+/);
  for (const word of words) {
    const mi = monthNameToIndex(word);
    if (mi != null) {
      // Make sure it's not followed by a day number
      const wordIndex = q.toLowerCase().indexOf(word);
      const afterWord = q.slice(wordIndex + word.length).trim();
      if (!/^\d{1,2}\b/.test(afterWord)) {
        const y = new Date().getFullYear();
        console.log(`[Month Parse] Found month "${word}" -> ${y}-${String(mi+1).padStart(2,'0')}`);
        return { start: startOfMonthUTC(y, mi), end: endOfMonthUTC(y, mi) };
      }
    }
  }
  
  console.log(`[Month Parse] No month found in "${q}"`);
  return null;
}

function parseNamed(q: string):
  | "this-week" | "last-week"
  | "this-month" | "last-month"
  | "this-year" | "last-year" | null {
  const s = q.toLowerCase();
  if (/\bthis\s+week\b|\best[ea]\s+semana\b/.test(s)) return "this-week";
  if (/\blast\s+week\b|\bla\s+semana\s+pasada\b/.test(s)) return "last-week";
  if (/\bthis\s+month\b|\best[ea]\s+mes\b/.test(s)) return "this-month";
  if (/\blast\s+month\b|\bel\s+mes\s+pasado\b/.test(s)) return "last-month";
  if (/\bthis\s+year\b|\best[ea]\s+a(ñ|n)o\b/.test(s)) return "this-year";
  if (/\blast\s+year\b|\bel\s+a(ñ|n)o\s+pasado\b/.test(s)) return "last-year";
  return null;
}

function parseRolling(q: string): { n: number; unit: "d"|"w"|"m"|"y" } | null {
  const s = q.toLowerCase();
  const compact = s.match(/\b(\d+)\s*(d|w|m|y)\b/); // 7d/30d/6m/2y
  if (compact) return { n: parseInt(compact[1], 10), unit: compact[2] as any };
  const long = s.match(/\b(past|last)\s+(\d+)\s+(days?|weeks?|months?|years?)\b/);
  if (long) return { n: parseInt(long[2], 10), unit: long[3][0] as any };
  return null;
}

// IMPORTANT DEFAULT: if user picked a month in the left panel, default to that month range
function resolveRange(query: string, selectedMonth?: string, tz?: string): Range {
  console.log(`[resolveRange] query="${query}", selectedMonth="${selectedMonth}"`);
  // 1) explicit month (EN/ES)
  const explicit = parseExplicitMonthRange(query);
  if (explicit) {
    console.log(`[resolveRange] Using explicit month: ${explicit.start} to ${explicit.end}`);
    return explicit;
  }

  // 2) named windows
  const named = parseNamed(query);
  if (named) {
    const today = todayInTZ(tz);
    const y = parseInt(today.slice(0,4),10);
    const m0 = parseInt(today.slice(5,7),10) - 1;
    switch (named) {
      case "this-week":  return { start: startOfWeekMonUTC(today), end: endOfWeekMonUTC(today) };
      case "last-week": {
        const end = addDaysISO(startOfWeekMonUTC(today), -1);
        const start = addDaysISO(end, -6);
        return { start, end };
      }
      case "this-month": return { start: startOfMonthUTC(y, m0), end: today };
      case "last-month": {
        const prevEnd = startOfMonthUTC(y, m0); // first of this month
        const end = addDaysISO(prevEnd, -1);
        const yy = parseInt(end.slice(0,4),10);
        const mm0 = parseInt(end.slice(5,7),10) - 1;
        return { start: startOfMonthUTC(yy, mm0), end };
      }
      case "this-year": return { start: `${y}-01-01`, end: today };
      case "last-year": {
        const yr = y - 1;
        return { start: `${yr}-01-01`, end: `${yr}-12-31` };
      }
    }
  }

  // 3) rolling windows
  const rolling = parseRolling(query);
  if (rolling) {
    let end = todayInTZ(tz);
    let start = end;
    if (rolling.unit === "d") start = addDaysISO(end, -rolling.n + 1);
    if (rolling.unit === "w") start = addDaysISO(end, -(rolling.n * 7) + 1);
    if (rolling.unit === "m") start = addMonthsISO(end, -rolling.n);
    if (rolling.unit === "y") {
      const e = new Date(end + "T00:00:00.000Z");
      start = toISO(new Date(Date.UTC(e.getUTCFullYear() - rolling.n, e.getUTCMonth(), e.getUTCDate())));
    }
    if (new Date(start) > new Date(end)) [start, end] = [end, start];
    return { start, end };
  }

  // 4) DEFAULT: use selectedMonth from left panel (full month); if not given, use current month until "today"
  if (selectedMonth) {
    const y = parseInt(selectedMonth.slice(0,4),10);
    const m0 = parseInt(selectedMonth.slice(5,7),10) - 1;
    return { start: startOfMonthUTC(y, m0), end: endOfMonthUTC(y, m0) };
  }
  const today = todayInTZ(tz);
  const y = parseInt(today.slice(0,4),10);
  const m0 = parseInt(today.slice(5,7),10) - 1;
  return { start: startOfMonthUTC(y, m0), end: today };
}

/* ========================= AGGREGATION ========================= */
const inRange = (iso: string, r: Range) => iso >= r.start && iso <= r.end;

function filterByRange(all: any[], r: Range) {
  return all.filter(e => inRange(String(e.date).slice(0,10), r));
}
function dailySeries(expenses: any[], r: Range) {
  const start = new Date(r.start + "T00:00:00.000Z");
  const end = new Date(r.end + "T00:00:00.000Z");
  const days = Math.max(1, Math.round((+end - +start) / MS_DAY) + 1);
  const map = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    map.set(toISO(new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + i))), 0);
  }
  for (const e of expenses) {
    const k = String(e.date).slice(0, 10);
    if (map.has(k)) map.set(k, (map.get(k) || 0) + e.amount);
  }
  return Array.from(map.entries()).map(([date, amount]) => ({ date, amount }));
}
function weekdayBreakdown(expenses: any[], r: Range) {
  const totals = Array.from({ length: 7 }, () => 0);
  for (const e of expenses) {
    const k = String(e.date).slice(0,10);
    if (inRange(k, r)) {
      const wd = new Date(k + "T00:00:00.000Z").getUTCDay();
      totals[wd] += e.amount;
    }
  }
  const labels = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  return totals.map((amount, i) => ({ weekday: labels[i], amount }));
}
function topCats(expenses: any[]) {
  const byCat: Record<string, number> = {};
  let total = 0;
  for (const e of expenses) {
    total += e.amount;
    const key = e.category || "Other";
    byCat[key] = (byCat[key] || 0) + e.amount;
  }
  const sorted = Object.entries(byCat).sort((a,b)=>b[1]-a[1]);
  return { total, sorted, top: sorted[0] as [string, number] | undefined };
}

/* ========================= CATEGORY INFERENCE ========================= */
function inferCategory(desc: string): string {
  const d = (desc||"").toLowerCase();
  if (/food|coffee|lunch|dinner|breakfast|grocer/.test(d)) return "Food";
  if (/uber|taxi|bus|path|metro|train|transit|ride/.test(d)) return "Transit";
  if (/netflix|spotify|subscription|suscrip/.test(d)) return "Subscriptions";
  if (/rent|bill|electric|water|internet|utility|servicios|luz|agua/.test(d)) return "Bills";
  if (/cloth|shirt|pant|shoe|dress|shop|ropa|zapatos|tienda/.test(d)) return "Shopping";
  return "Other";
}

/* ========================= AMOUNT & DATE EXTRACTION ========================= */
const extractAmount = (q: string): number | null => {
  const lower = q.toLowerCase();
  
  // Try word numbers: "thousand dollars", "five hundred", etc.
  if (/\bthousand\b/.test(lower)) {
    const numMatch = lower.match(/\b(one|two|three|four|five|six|seven|eight|nine|ten)\s+thousand/i);
    const multiplier = numMatch ? parseWordNumber(numMatch[1]) : 1;
    return multiplier * 1000;
  }
  
  if (/\bhundred\b/.test(lower)) {
    const numMatch = lower.match(/\b(one|two|three|four|five|six|seven|eight|nine|ten)\s+hundred/i);
    const multiplier = numMatch ? parseWordNumber(numMatch[1]) : 1;
    return multiplier * 100;
  }
  
  // Try numeric: "100", "$50", "20 dollars"
  const m = q.match(/(?:\$?\s*)(\d+(?:\.\d+)?)(?:\s*\$)?(?:\s*(?:dollars?|dólares|dolares))?/i);
  return m ? parseFloat(m[1]) : null;
};

const parseWordNumber = (word: string): number => {
  const map: Record<string, number> = {
    one: 1, two: 2, three: 3, four: 4, five: 5,
    six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
    sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
    twenty: 20, thirty: 30, forty: 40, fifty: 50,
    sixty: 60, seventy: 70, eighty: 80, ninety: 90
  };
  return map[word.toLowerCase()] || 1;
};

// if client sends exact date, trust it; else: use today's date
function chooseExpenseDate(bodyDate?: string, selectedMonth?: string, tz?: string): string {
  if (bodyDate && /^\d{4}-\d{2}-\d{2}$/.test(bodyDate)) return bodyDate;

  // Always use today's date when no explicit date is provided
  return todayInTZ(tz);
}

// Parse "September 10 to 17", "Sep 10-17", "10–17 Sep", "09/10 to 09/17", etc.
// Returns an inclusive ISO range or null.
function parseWatchDateRange(q: string, selectedMonth?: string, tz?: string): { start: string; end: string } | null {
  const s = q.toLowerCase();

  // 1) Month-name + day to day: "september 10 to 17" / "sep 10-17"
  let m = s.match(/\b([a-záéíóúüñ]{3,})\s+(\d{1,2})\s*(?:to|-|–)\s*(\d{1,2})\b/i);
  if (m) {
    const mi = monthNameToIndex(m[1]);
    if (mi != null) {
      const { year } = resolveYearForMonth(mi, selectedMonth, tz);
      const d1 = clampDay(year, mi, parseInt(m[2], 10));
      const d2 = clampDay(year, mi, parseInt(m[3], 10));
      const start = toISO(new Date(Date.UTC(year, mi, Math.min(d1, d2))));
      const end = toISO(new Date(Date.UTC(year, mi, Math.max(d1, d2))));
      return { start, end };
    }
  }

  // 2) Day range + month-name at end: "10 to 17 september"
  m = s.match(/\b(\d{1,2})\s*(?:to|-|–)\s*(\d{1,2})\s+([a-záéíóúüñ]{3,})\b/i);
  if (m) {
    const mi = monthNameToIndex(m[3]);
    if (mi != null) {
      const { year } = resolveYearForMonth(mi, selectedMonth, tz);
      const d1 = clampDay(year, mi, parseInt(m[1], 10));
      const d2 = clampDay(year, mi, parseInt(m[2], 10));
      const start = toISO(new Date(Date.UTC(year, mi, Math.min(d1, d2))));
      const end = toISO(new Date(Date.UTC(year, mi, Math.max(d1, d2))));
      return { start, end };
    }
  }

  // 3) Month day to month day: "aug 1 to aug 7" / "august 1 to august 7"
  m = s.match(/\b([a-záéíóúüñ]{3,})\s+(\d{1,2})\s*(?:to|-|–)\s*([a-záéíóúüñ]{3,})\s+(\d{1,2})\b/i);
  if (m) {
    const mi1 = monthNameToIndex(m[1]);
    const mi2 = monthNameToIndex(m[3]);
    if (mi1 != null && mi2 != null) {
      const { year: year1 } = resolveYearForMonth(mi1, selectedMonth, tz);
      const { year: year2 } = resolveYearForMonth(mi2, selectedMonth, tz);
      const d1 = clampDay(year1, mi1, parseInt(m[2], 10));
      const d2 = clampDay(year2, mi2, parseInt(m[4], 10));
      const start = toISO(new Date(Date.UTC(year1, mi1, d1)));
      const end = toISO(new Date(Date.UTC(year2, mi2, d2)));
      return { start: start < end ? start : end, end: end > start ? end : start };
    }
  }

  // 4) Numeric "mm/dd to mm/dd" (or dd/mm based on heuristic is overkill; assume mm/dd)
  m = s.match(/\b(\d{1,2})[\/\-](\d{1,2})\s*(?:to|-|–)\s*(\d{1,2})[\/\-](\d{1,2})\b/);
  if (m) {
    const y = (selectedMonth || todayInTZ(tz)).slice(0,4);
    const m1 = parseInt(m[1],10) - 1, d1 = parseInt(m[2],10);
    const m2 = parseInt(m[3],10) - 1, d2 = parseInt(m[4],10);
    const start = toISO(new Date(Date.UTC(+y, m1, d1)));
    const end   = toISO(new Date(Date.UTC(+y, m2, d2)));
    return { start: start < end ? start : end, end: end > start ? end : start };
  }

  return null;
}

// Pick the year to use for "September …" based on the selected month or today.
function resolveYearForMonth(monthIndex0: number, selectedMonth?: string, tz?: string): { year: number } {
  if (selectedMonth) return { year: parseInt(selectedMonth.slice(0,4), 10) };
  return { year: parseInt(todayInTZ(tz).slice(0,4), 10) };
}

function clampDay(y: number, m0: number, d: number) {
  const end = endOfMonthUTC(y, m0);
  const last = parseInt(end.slice(8,10), 10);
  return Math.min(Math.max(1, d), last);
}

/* ========================= INTENT DETECTORS ========================= */
const isChartIntent = (q: string) =>
  /\b(chart|graph|trend|plot|gr[áa]fic[oa])\b/i.test(q) ||
  /^\s*\d+\s*[dwmy]\s*chart$/i.test(q) || /^chart$/i.test(q);

const isMonthlyIntent = (q: string) =>
  /(summary|report|this month|month)\b/i.test(q) ||
  /\b(resumen|reporte|este\s+mes|mes)\b/i.test(q);

const isYearlyIntent = (q: string) =>
  (/\byear(ly)?\b/i.test(q) && /(summary|report|total)/i.test(q)) ||
  (/\b(a(ñ|n)o)\b/i.test(q) && /(resumen|reporte|total)/i.test(q));

const isMostSpentIntent = (q: string) =>
  (/\bmost\b/i.test(q) && /\b(spent|spending)\b/i.test(q)) || /\bm[aá]s\s+gastad/i.test(q);

const isInsightsIntent = (q: string) => /(insight|analysis|analy|ideas)/i.test(q);

// Add, Delete, Goal, Watch
const isAddIntent = (q: string) => {
  // Don't match if it's clearly a "most spent" query
  if (/\b(most|top|highest|biggest|largest)\b/i.test(q)) return false;
  // Don't match if it's clearly an insights/summary query
  if (/\b(insight|summary|report)\b/i.test(q)) return false;
  return /\b(add|spent|spend|agrega|añade|anade|sumar|registrar|add expense|gaste|gasté)\b/i.test(q) || /^\s*\$?\d/.test(q);
};
const isDeleteIntent = (q: string) => /\b(delete|remove|eliminar|borrar|quitar)\b/i.test(q);
const isGoalIntent = (q: string) => /\b(goal|meta)\b/i.test(q) && /\b(set|create|crear|establecer|add|agrega|añade|anade)\b/i.test(q);
const isWatchIntent = (q: string) => /\b(watch|alert|notify|alerta|aviso)\b/i.test(q);

/* ========================= ROUTE ========================= */
export async function POST(req: NextRequest) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) || {};
  const query: string = String(body.query || "").trim();
  const selectedMonth: string | undefined = body.month; // "YYYY-MM" from left panel
  const explicitDate: string | undefined = body.date;   // "YYYY-MM-DD" (optional exact)
  const tz: string | undefined = body.tz;               // e.g. "America/New_York" (optional)

  const allExpenses = db.listExpenses(user.id, {});

  /* ---------- CHART ---------- */
  if (isChartIntent(query)) {
    const range = resolveRange(query, selectedMonth, tz);
    // optional category: "chart last week on food"
    const catMatch = query.match(/\b(on|for|en|para)\s+([a-záéíóúüñ][\w\s-]*)$/i);
    const cat = catMatch ? catMatch[2].trim() : null;

    const within = filterByRange(allExpenses, range);
    const filtered = cat
      ? within.filter((e: any) =>
          e.category.toLowerCase() === cat.toLowerCase() ||
          e.description.toLowerCase().includes(cat.toLowerCase())
        )
      : within;

    const series = dailySeries(filtered, range);
    const weekday = weekdayBreakdown(filtered, range);
    const total = filtered.reduce((s: number, e: any) => s + e.amount, 0);
    const days = Math.max(1, Math.round((+new Date(range.end) - +new Date(range.start)) / MS_DAY) + 1);
    const avg = total / days;
    const peak = series.reduce((m, p) => (p.amount > m.amount ? p : m), { date: range.start, amount: 0 });

    return NextResponse.json({
      chart: {
        range,
        category: cat || "All",
        summary: { total, avg, peak },
        series,                   // [{ date, amount }]
        weekdayBreakdown: weekday // [{ weekday, amount }]
      }
    });
  }

  /* ---------- ADD EXPENSE ---------- */
  if (isAddIntent(query)) {
    const amount = extractAmount(query);
    if (!amount) {
      return NextResponse.json({ messages: ["❌ Please include an amount. Example: 'Add 12 coffee' or '$20 for groceries'."] });
    }

    // Extract date from query FIRST (before description extraction)
    let dateToUse = explicitDate;
    
    if (!dateToUse) {
      // Try slash date format: MM/DD/YYYY or DD/MM/YYYY
      const slashDateMatch = query.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/);
      if (slashDateMatch) {
        const p1 = parseInt(slashDateMatch[1], 10);
        const p2 = parseInt(slashDateMatch[2], 10);
        const year = slashDateMatch[3];
        
        // Assume MM/DD/YYYY format (US standard)
        const month = p1.toString().padStart(2, '0');
        const day = p2.toString().padStart(2, '0');
        dateToUse = `${year}-${month}-${day}`;
        console.log(`[Expense] Parsed slash date "${slashDateMatch[0]}" as ${dateToUse}`);
      }
    }
    
    if (!dateToUse) {
      // Try month + day + year format: "nov 1, 2025", "november 1 2025", "sept 23,2025" (with or without space after comma)
      const monthDayYearMatch = query.match(/\b(?:on\s+)?([a-záéíóúüñ]+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s*(\d{4})?\b/i);
      if (monthDayYearMatch) {
        const monthName = monthDayYearMatch[1];
        const day = parseInt(monthDayYearMatch[2], 10);
        const year = monthDayYearMatch[3] ? parseInt(monthDayYearMatch[3], 10) : (selectedMonth ? parseInt(selectedMonth.slice(0,4), 10) : new Date().getFullYear());
        const monthIndex = monthNameToIndex(monthName);
        console.log(`[Expense] Matched: "${monthDayYearMatch[0]}", month="${monthName}", monthIndex=${monthIndex}, day=${day}, year=${year}`);
        if (monthIndex !== null) {
          const clampedDay = clampDay(year, monthIndex, day);
          dateToUse = toISO(new Date(Date.UTC(year, monthIndex, clampedDay)));
          console.log(`[Expense] Parsed "${monthDayYearMatch[0]}" as ${dateToUse} (monthIndex=${monthIndex}, clampedDay=${clampedDay})`);
        } else {
          console.log(`[Expense] ERROR: monthNameToIndex returned null for "${monthName}"`);
        }
      }
    }
    
    if (!dateToUse) {
      // Try month name format: "in August 2025", "in may"
      const monthYearMatch = query.match(/\b(?:in|on)\s+([a-záéíóúüñ]+)\s+(\d{4})\b/i);
      if (monthYearMatch) {
        const monthName = monthYearMatch[1];
        const year = parseInt(monthYearMatch[2], 10);
        const monthIndex = monthNameToIndex(monthName);
        if (monthIndex !== null) {
          // Use last day of that month
          dateToUse = endOfMonthUTC(year, monthIndex);
          console.log(`[Expense] Parsed "${monthYearMatch[0]}" as ${dateToUse}`);
        }
      }
    }
    
    // Extract description (after date parsing, so we can remove date from description)
    let description = "";
    
    // Pattern 1: "add swimming for $100" or "add $100 for swimming"
    const forMatch = query.match(/\b(for|para)\s+([^\$\d]+?)(?:\s+on\s+|\s+in\s+|$)/i);
    if (forMatch) {
      description = forMatch[2].trim();
    } else {
      // Pattern 2: "add 100 swimming" - extract after amount
      description = query
        .replace(/^(add|agrega|añade|anade|sumar|registrar)\s+/i, "")
        .replace(/\b(hundred|thousand|million)\s+(?:dollars?|dólares|dolares)?\s*/i, "")
        .replace(/^\$?\s*\d+(?:\.\d+)?\s*(?:\$)?\s*(?:dollars?|dólares|dolares)?\s*/i, "")
        .replace(/\s+on\s+[a-záéíóúüñ]+\s+\d{1,2},?\s*\d{4}/i, "")
        .replace(/\s+in\s+[a-záéíóúüñ]+\s+\d{4}/i, "")
        .replace(/\s+\d{1,2}\/\d{1,2}\/\d{4}/i, "")
        .trim();
    }
    
    if (!description) description = "Expense";
    
    // choose date inside selectedMonth if provided
    const date = chooseExpenseDate(dateToUse, selectedMonth, tz);
    console.log(`[Expense] Final date: ${date} (dateToUse: ${dateToUse}, selectedMonth: ${selectedMonth}, explicitDate: ${explicitDate})`);
    const category = inferCategory(description);

    const e = db.createExpense({
      userId: user.id,
      amount,
      description,
      category,
      date
    });

    return NextResponse.json({
      messages: [`✅ Added: ${e.description} – $${e.amount.toFixed(2)} (${e.category}) on ${e.date}`],
      effects: [{ type: "expense_created", id: e.id }]
    });
  }

  /* ---------- DELETE WATCH ---------- */
  if (isDeleteIntent(query) && /\b(watch|alert|alerta)\b/i.test(query)) {
    // Parse: "delete watch shoes" or "delete watch for food"
    let category = "";
    const catMatch = query.match(/\b(watch|alert|alerta)\s+(?:for\s+)?([a-záéíóúüñ]\w+)/i);
    if (catMatch) {
      category = catMatch[2];
    }

    if (!category) {
      return NextResponse.json({ messages: ["❌ Please specify the category. Example: 'delete watch food' or 'delete watch for shoes'."] });
    }

    // Find matching watch
    const allWatches = db.listSpendingWatches(user.id);
    const matchingWatch = allWatches.find((w: any) => 
      w.category.toLowerCase() === category.toLowerCase()
    );

    if (matchingWatch) {
      db.deleteSpendingWatch(matchingWatch.id, user.id);
      const periodLabel = matchingWatch.period === "custom" && (matchingWatch as any).rangeStart && (matchingWatch as any).rangeEnd
        ? `${(matchingWatch as any).rangeStart} to ${(matchingWatch as any).rangeEnd}`
        : matchingWatch.period === "weekly" ? "weekly"
        : matchingWatch.period === "yearly" ? "yearly"
        : "monthly";
      return NextResponse.json({
        messages: [`✅ Deleted watch: ${matchingWatch.category} - $${matchingWatch.threshold} ${periodLabel}`],
        effects: [{ type: "watch_deleted", id: matchingWatch.id }]
      });
    } else {
      const available = allWatches.map((w: any) => `• ${w.category} - $${w.threshold} ${w.period}`).join("\n");
      return NextResponse.json({ 
        messages: [`❌ Could not find watch for "${category}".\n\nAvailable watches:\n${available || "None"}`] 
      });
    }
  }

  /* ---------- DELETE EXPENSE (simple) ---------- */
  if (isDeleteIntent(query)) {
    const amount = extractAmount(query);
    // Parse exact date from query
    let targetDate: string | undefined;
    let targetMonth: string | undefined;
    const fullDateMatch = query.match(/\b(?:on|in)\s+([a-záéíóúüñ]+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s*(\d{4})?\b/i);
    if (fullDateMatch) {
      const monthName = fullDateMatch[1];
      const day = parseInt(fullDateMatch[2], 10);
      const year = fullDateMatch[3] ? parseInt(fullDateMatch[3], 10) : (selectedMonth ? parseInt(selectedMonth.slice(0,4), 10) : new Date().getFullYear());
      const mi = monthNameToIndex(monthName);
      if (mi !== null) {
        const clampedDay = clampDay(year, mi, day);
        targetDate = toISO(new Date(Date.UTC(year, mi, clampedDay)));
        targetMonth = `${year}-${String(mi + 1).padStart(2, '0')}`;
      }
    }
    if (!targetMonth) {
      const monthOnlyMatch = query.match(/\b(?:on|in)\s+([a-záéíóúüñ]+)\b/i);
      if (monthOnlyMatch) {
        const mi = monthNameToIndex(monthOnlyMatch[1]);
        if (mi !== null) {
          const year = selectedMonth ? selectedMonth.slice(0, 4) : new Date().getFullYear();
          targetMonth = `${year}-${String(mi + 1).padStart(2, '0')}`;
        }
      }
    }
    
    let after = query
      .replace(/\b(delete|remove|eliminar|borrar|quitar)\b/i, "")
      .replace(/\$?\s*\d+(?:\.\d+)?\s*\$?\s*(?:dollars?|dólares|dolares)?/i, "")
      .replace(/\b(?:on|in)\s+[a-záéíóúüñ]+(?:\s+\d{1,2}(?:st|nd|rd|th)?,?\s*\d{4})?\b/i, "")
      .replace(/\b(for|para)\s+/i, "")
      .trim();

    const monthISO = targetMonth || selectedMonth || todayInTZ(tz).slice(0,7);
    const monthExpenses = db.listExpenses(user.id, { month: monthISO });

    if (!amount || !after) {
      return NextResponse.json({ messages: ["❌ Please say amount and description. Example: 'delete 30 for path on december 3'."] });
    }

    let candidates = monthExpenses.filter((e: any) => e.amount === amount);
    
    // If we have a specific date, filter by that date
    if (targetDate && candidates.length > 0) {
      const dateFiltered = candidates.filter((e: any) => String(e.date).slice(0,10) === targetDate);
      if (dateFiltered.length > 0) {
        candidates = dateFiltered;
      }
    }
    
    if (candidates.length === 0) {
      const list = monthExpenses.map((e: any) => `• ${e.description} - ${e.amount.toFixed(2)} on ${String(e.date).slice(0,10)}`).join("\n");
      return NextResponse.json({ messages: [`❌ Not found ${amount} for "${after}"${targetDate ? ` on ${targetDate}` : ` in ${monthISO}`}.\n\nAvailable:\n${list || "None"}`] });
    }

    const keys = after.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    let chosen = candidates[0];
    const better = candidates.find((e: any) =>
      keys.some(w => e.description.toLowerCase().includes(w) || e.category.toLowerCase().includes(w))
    );
    if (better) chosen = better;

    db.deleteExpense(chosen.id, user.id);
    return NextResponse.json({
      messages: [`✅ Deleted: ${chosen.description} – ${chosen.amount.toFixed(2)} on ${String(chosen.date).slice(0,10)}`],
      effects: [{ type: "expense_deleted", id: chosen.id }]
    });
  }

  /* ---------- GOAL ---------- */
  if (isGoalIntent(query)) {
    const amount = extractAmount(query);
    let period: "weekly"|"monthly"|"yearly"|undefined;
    if (/\bweekly|semanal\b/i.test(query)) period = "weekly";
    else if (/\bmonthly|mensual\b/i.test(query)) period = "monthly";
    else if (/\byearly|yearly|anual\b/i.test(query)) period = "yearly";
    else if (/\bmonth|mes\b/i.test(query)) period = "monthly";

    const catMatch = query.match(/\b(for|para)\s+([a-záéíóúüñ][\w\s-]*)$/i);
    const category = catMatch ? catMatch[2].trim() : undefined;

    if (!amount || !period) {
      return NextResponse.json({ messages: ["❌ Please include amount and period. Example: 'Set monthly goal 300 for food'."] });
    }

    // Extract month from query if specified (e.g., "in December 2025")
    let monthValue = selectedMonth || todayInTZ(tz).slice(0,7);
    const monthYearMatch = query.match(/\b(?:in|for)\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{4})\b/i);
    if (monthYearMatch) {
      const monthName = monthYearMatch[1];
      const year = monthYearMatch[2];
      const monthIndex = monthNameToIndex(monthName);
      if (monthIndex !== null) {
        monthValue = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
        console.log(`[Goal] Parsed "${monthYearMatch[0]}" as ${monthValue}`);
      }
    }
    
    if (period === "yearly") monthValue = monthValue.slice(0,4);
    if (period === "weekly") monthValue = monthValue + "-01";

    const label = `Stay under $${amount} ${period}${category ? ` for ${category}` : ""}`;
    const goal = db.createGoal({
      userId: user.id,
      label,
      limit: amount,
      month: monthValue,
      period,
      category
    });

    return NextResponse.json({
      messages: [`✅ Goal created: ${goal.label}.`],
      effects: [{ type: "goal_created", id: goal.id }]
    });
  }

  /* ---------- WATCH (ALERT) — weekly + custom date ranges ---------- */
  if (isWatchIntent(query)) {
    const amount = extractAmount(query);

    // Period: now supports weekly/monthly/yearly (EN/ES)
    // Use looser matching to handle "500weekly" (no space)
    let period: "weekly" | "monthly" | "yearly" | "custom" | undefined;
    if (/(weekly|semanal)/i.test(query)) period = "weekly";
    else if (/(monthly|mensual|mes)/i.test(query)) period = "monthly";
    else if (/(yearly|annual|anual|year)/i.test(query)) period = "yearly";

    // Custom explicit date range like "september 10 to 17"
    const dateRange = parseWatchDateRange(query, selectedMonth, tz); // -> {start,end}|null
    if (dateRange) period = "custom";

    if (!amount) {
      return NextResponse.json({
        messages: ["❌ Please include an amount. Example: 'watch food 500 weekly' or 'watch 500 for food monthly'."]
      });
    }

    // Category: extract before amount, excluding dates and keywords
    // Pattern: "watch CATEGORY amount period [for date]"
    let category: string | undefined;
    
    // Try to match: watch [category] [amount]
    const catBeforeAmount = query.match(/\b(?:watch|alert|notify|alerta|aviso)\s+([a-záéíóúüñ]\w+)\s+\$?\d/i);
    if (catBeforeAmount && catBeforeAmount[1]) {
      const word = catBeforeAmount[1].toLowerCase();
      // Make sure it's not a keyword
      if (!/(weekly|monthly|yearly|semanal|mensual|anual|for|on|en|para)/i.test(word)) {
        category = catBeforeAmount[1];
      }
    }
    
    // If not found, try "for category" pattern
    if (!category) {
      const catAfterFor = query.match(/\b(for|on|en|para)\s+([a-záéíóúüñ]\w+)/i);
      if (catAfterFor && catAfterFor[2]) {
        const word = catAfterFor[2].toLowerCase();
        // Make sure it's not a date word
        if (!/(january|february|march|april|may|june|july|august|september|october|november|december|enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/i.test(word)) {
          category = catAfterFor[2];
        }
      }
    }
    
    // Fallback: guess from remaining words
    if (!category) {
      const cleaned = query.replace(/\$?\s*\d+(?:\.\d+)?/g, "");
      const words = cleaned.split(/\s+/).filter(w => 
        w.length > 2 && 
        !/(watch|alert|notify|alerta|aviso|weekly|monthly|yearly|semanal|mensual|anual|for|on|en|para|january|february|march|april|may|june|july|august|september|october|november|december|enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre|\d{4})/i.test(w)
      );
      category = (words[0] || "General").trim();
    }

    // Anchor to selected month/year so "monthly/yearly" is deterministic.
    let monthValue = selectedMonth || todayInTZ(tz).slice(0, 7);
    if (period === "yearly") monthValue = monthValue.slice(0, 4);
    if (!period) period = "monthly"; // sensible default if user omitted it

    // For weekly: store the ISO week start so it's reproducible.
    let rangeStart: string | undefined, rangeEnd: string | undefined;
    if (period === "weekly" && !dateRange) {
      // Use TODAY's date for the current week (not selected month)
      const today = todayInTZ(tz);
      rangeStart = startOfWeekMonUTC(today);
      rangeEnd = endOfWeekMonUTC(today);
    }
    if (period === "custom" && dateRange) {
      rangeStart = dateRange.start;
      rangeEnd = dateRange.end;
    }

    // Create the watch. We pass rangeStart/rangeEnd as optional fields —
    // safe even if your db layer ignores unknown keys.
    const watch = (db as any).createSpendingWatch({
      userId: user.id,
      category,
      threshold: amount,
      period: period === "custom" ? "custom" : period,         // "weekly" | "monthly" | "yearly" | "custom"
      month: monthValue,                                       // keep existing schema happy
      rangeStart,                                              // optional (weekly/custom)
      rangeEnd,                                                // optional (weekly/custom)
      createdAt: new Date().toISOString()
    });

    // Friendly confirmation text
    let when =
      period === "weekly" && rangeStart && rangeEnd
        ? `this week (${rangeStart} → ${rangeEnd})`
        : period === "monthly"
        ? `monthly (${monthValue})`
        : period === "yearly"
        ? `year ${monthValue}`
        : period === "custom" && rangeStart && rangeEnd
        ? `${rangeStart} → ${rangeEnd}`
        : period;

    return NextResponse.json({
      messages: [
        `✅ Watch created: Alert when ${category} reaches $${amount} ${when}.`
      ],
      effects: [{ type: "watch_created", id: watch?.id }]
    });
  }

  /* ---------- INSIGHTS (DEFAULT = SELECTED MONTH) ---------- */
  if (isInsightsIntent(query)) {
    const range = resolveRange(query, selectedMonth, tz);
    const within = filterByRange(allExpenses, range);
    const total = within.reduce((s: number, e: any) => s + e.amount, 0);
    const days = Math.max(1, Math.round((+new Date(range.end) - +new Date(range.start)) / MS_DAY) + 1);
    const avgPerDay = total / days;
    const projected = avgPerDay * days;

    const { sorted } = topCats(within);
    const top3 = sorted.slice(0,3).map(([c,a],i)=>`${i+1}. ${c}: $${a.toFixed(2)}`).join("\n");

    const byCat: Record<string, number> = {};
    within.forEach((e: any) => (byCat[e.category || "Other"] = (byCat[e.category || "Other"] || 0) + e.amount));
    const tips: string[] = [];
    if (byCat["Food"] > 300) tips.push("💡 Food is high — meal prep could help.");
    if (byCat["Transit"] > 150) tips.push("💡 Consider a weekly/monthly transit pass.");
    if (byCat["Subscriptions"] > 100) tips.push("💡 Review and cancel unused subscriptions.");

    return NextResponse.json({
      messages: [
        `🔍 Insights ${range.start} → ${range.end}`,
        `• Total: $${total.toFixed(2)} • Daily avg: $${avgPerDay.toFixed(2)} • Projected: ~$${projected.toFixed(2)}`,
        sorted.length ? `• Top categories:\n${top3}` : "• No categorized spending.",
        ...(tips.length ? ["", ...tips] : [])
      ]
    });
  }

  /* ---------- MOST SPENT (PERIOD-AWARE) ---------- */
  if (isMostSpentIntent(query)) {
    const range = resolveRange(query, selectedMonth, tz);
    const within = filterByRange(allExpenses, range);
    if (!within.length) return NextResponse.json({ messages: [`No expenses from ${range.start} to ${range.end}.`] });

    const { total, sorted, top } = topCats(within);
    const msgs: string[] = [];
    if (top) {
      msgs.push(`💰 From ${range.start} to ${range.end}, you spent the most on ${top[0]}: $${top[1].toFixed(2)} (${total ? ((top[1] / total) * 100).toFixed(1) : "0.0"}%)`);
      msgs.push(`\nTop 3 Categories:\n` + sorted.slice(0,3).map(([c,a],i)=>`${i+1}. ${c}: $${a.toFixed(2)}`).join("\n"));
    } else {
      msgs.push("No categorized spending in that range.");
    }
    return NextResponse.json({ messages: msgs });
  }

  /* ---------- MONTHLY SUMMARY (ALWAYS USE SELECTED MONTH IF PROVIDED) ---------- */
  if (isMonthlyIntent(query)) {
    // Try to parse month from query first
    const explicitRange = parseExplicitMonthRange(query);
    const monthISO = explicitRange ? explicitRange.start.slice(0, 7) : (selectedMonth || todayInTZ(tz).slice(0,7));
    const monthExpenses = db.listExpenses(user.id, { month: monthISO });
    const total = monthExpenses.reduce((s:number,e:any)=>s+e.amount,0);
    const byCat: Record<string, number> = {};
    for (const e of monthExpenses) byCat[e.category || "Other"] = (byCat[e.category || "Other"] || 0) + e.amount;
    const sorted = Object.entries(byCat).sort((a,b)=>b[1]-a[1]);
    const top = sorted[0];

    const msgs: string[] = [];
    msgs.push(`📊 Monthly Summary for ${monthISO}:\nTotal Spent: $${total.toFixed(2)}\nTransactions: ${monthExpenses.length}`);
    if (top) msgs.push(`💰 Most spent on: ${top[0]} ($${top[1].toFixed(2)} - ${total ? ((top[1] / total) * 100).toFixed(1) : "0.0"}%)`);
    if (sorted.length) msgs.push(`\nBreakdown by Category:\n` + sorted.map(([c,a])=>`• ${c}: $${a.toFixed(2)}`).join("\n"));
    return NextResponse.json({ messages: msgs });
  }

  /* ---------- YEARLY SUMMARY ---------- */
  if (isYearlyIntent(query)) {
    const y = (selectedMonth ? selectedMonth.slice(0,4) : todayInTZ(tz).slice(0,4));
    const yearExpenses = allExpenses.filter((e:any)=> String(e.date).startsWith(y));
    const total = yearExpenses.reduce((s:number,e:any)=>s+e.amount,0);
    const byCat: Record<string, number> = {};
    const byMonth: Record<string, number> = {};
    for (const e of yearExpenses) {
      const cat = e.category || "Other";
      byCat[cat] = (byCat[cat] || 0) + e.amount;
      const mk = String(e.date).slice(0,7);
      byMonth[mk] = (byMonth[mk] || 0) + e.amount;
    }
    const top = Object.entries(byCat).sort((a,b)=>b[1]-a[1])[0];
    const avgMonthly = total / Math.max(Object.keys(byMonth).length, 1);

    const msgs: string[] = [];
    msgs.push(`📊 Yearly Summary for ${y}:\nTotal Spent: $${total.toFixed(2)}\nTransactions: ${yearExpenses.length}\nAverage Monthly: $${avgMonthly.toFixed(2)}`);
    if (top) msgs.push(`💰 Most spent on: ${top[0]} ($${top[1].toFixed(2)} - ${total ? ((top[1] / total) * 100).toFixed(1) : "0.0"}%)`);
    const breakdown = Object.entries(byCat).sort((a,b)=>b[1]-a[1]).map(([c,a])=>`• ${c}: $${a.toFixed(2)}`).join("\n");
    if (breakdown) msgs.push(`\nBreakdown by Category:\n${breakdown}`);
    return NextResponse.json({ messages: msgs });
  }

  /* ---------- FALLBACK HELP ---------- */
  return NextResponse.json({
    messages: [
      "Try:",
      "• Add: 'Add 20 dollars for path' (+ optional { date: 'YYYY-MM-DD', month: 'YYYY-MM' })",
      "• Delete: 'delete 100 for coffee'",
      "• Goal: 'Set monthly goal 300 for food'",
      "• Watch: 'Watch food 500 weekly/monthly/yearly'",
      "• Chart: 'chart 7d', 'chart last week', 'chart May 2025', 'chart last month on food'",
      "• Insights: 'insights' (uses selected month by default)",
      "• Most spent: 'Most spent on this week?' / 'Most spent on May 2025'",
      "• Summary: 'monthly summary', 'yearly summary'",
    ]
  });
}
