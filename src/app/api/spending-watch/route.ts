import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../lib/auth";
import { db } from "../../../lib/db";

export async function GET(req: NextRequest) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month") || new Date().toISOString().slice(0, 7);

  // Get watches and filter by month/period
  const allWatches = db.listSpendingWatches(user.id);
  const watches = allWatches.filter(watch => {
    // For monthly watches, only show in the month they were created
    if (watch.period === "monthly") {
      return watch.month === month;
    }
    // For yearly watches, show in all months of that year
    if (watch.period === "yearly") {
      const watchYear = watch.month.slice(0, 4);
      const filterYear = month.slice(0, 4);
      return watchYear === filterYear;
    }
    // For weekly watches, show if the current month overlaps with the watch's week
    if (watch.period === "weekly") {
      const w = watch as any;
      if (w.rangeStart && w.rangeEnd) {
        const watchMonth = w.rangeStart.slice(0, 7);
        return watchMonth === month;
      }
      return watch.month.slice(0, 7) === month;
    }
    // For custom watches, show if the current month overlaps with the custom range
    if (watch.period === "custom") {
      const w = watch as any;
      if (w.rangeStart && w.rangeEnd) {
        const startMonth = w.rangeStart.slice(0, 7);
        const endMonth = w.rangeEnd.slice(0, 7);
        return month >= startMonth && month <= endMonth;
      }
      return false;
    }
    return false;
  });
  
  // Fetch expenses to calculate current spending
  const expenses = db.listExpenses(user.id, {});
  
  // Enrich watches with spending data
  const enrichedWatches = watches.map(watch => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    const w = watch as any;
    
    if (watch.period === "weekly" && w.rangeStart && w.rangeEnd) {
      // For weekly watches with explicit range
      startDate = new Date(w.rangeStart + "T00:00:00.000Z");
      endDate = new Date(w.rangeEnd + "T23:59:59.999Z");
    } else if (watch.period === "custom" && w.rangeStart && w.rangeEnd) {
      // For custom date range watches
      startDate = new Date(w.rangeStart + "T00:00:00.000Z");
      endDate = new Date(w.rangeEnd + "T23:59:59.999Z");
    } else if (watch.period === "yearly") {
      // For yearly watches, use the year from the watch's month (UTC)
      const watchYear = parseInt(watch.month.slice(0, 4));
      startDate = new Date(Date.UTC(watchYear, 0, 1, 0, 0, 0));
      endDate = new Date(Date.UTC(watchYear, 11, 31, 23, 59, 59));
    } else {
      // For monthly watches, use the watch's specific month (UTC)
      const [year, monthNum] = watch.month.split('-').map(Number);
      startDate = new Date(Date.UTC(year, monthNum - 1, 1, 0, 0, 0));
      endDate = new Date(Date.UTC(year, monthNum, 0, 23, 59, 59));
    }
    
    // Filter expenses by period and category
    const relevantExpenses = expenses.filter(e => {
      const expenseDate = new Date(e.date + "T00:00:00.000Z");
      const inDateRange = expenseDate >= startDate && expenseDate <= endDate;
      
      const searchTerm = watch.category.toLowerCase();
      const category = (e.category || "").toLowerCase();
      const description = (e.description || "").toLowerCase();
      
      const categoryMatch = category.includes(searchTerm) || 
                           description.includes(searchTerm) ||
                           searchTerm.includes(category) ||
                           searchTerm.includes(description);
      
      console.log(`[Watch] Expense: ${e.description} ($${e.amount}) on ${e.date} | Category: ${e.category} | InDateRange: ${inDateRange} | Match: ${categoryMatch}`);
      
      return inDateRange && categoryMatch;
    });
    
    const currentSpending = relevantExpenses.reduce((sum, e) => sum + e.amount, 0);
    const percentUsed = (currentSpending / watch.threshold) * 100;
    const shouldAlert = currentSpending >= watch.threshold;
    
    return {
      ...watch,
      currentSpending,
      percentUsed,
      shouldAlert
    };
  });

  return NextResponse.json(enrichedWatches);
}

export async function POST(req: NextRequest) {
  const user = getCurrentUser();
  if (!user) {
    console.log("[SpendingWatch] Unauthorized - no user");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { category, threshold, period, month, rangeStart, rangeEnd } = body;

  console.log("[SpendingWatch] Creating watch:", { category, threshold, period, month, rangeStart, rangeEnd, userId: user.id });

  if (!category || !threshold || !period) {
    console.log("[SpendingWatch] Missing required fields");
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Use provided month or current month
  const watchMonth = month || new Date().toISOString().slice(0, 7);

  const watch = (db as any).createSpendingWatch({
    userId: user.id,
    category,
    threshold: parseFloat(threshold),
    period,
    month: watchMonth,
    rangeStart,
    rangeEnd,
    createdAt: new Date().toISOString()
  });

  console.log("[SpendingWatch] Watch created:", watch);
  return NextResponse.json(watch);
}
