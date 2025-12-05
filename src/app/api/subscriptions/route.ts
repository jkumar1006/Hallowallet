import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../lib/auth";
import { db } from "../../../lib/db";

export async function GET(req: NextRequest) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get all expenses for the user
  const allExpenses = db.listExpenses(user.id);
  
  // Filter for subscriptions only
  const subscriptions = allExpenses.filter(e => e.isSubscription);
  
  // Group by description to get unique subscriptions
  const subscriptionMap = new Map();
  
  subscriptions.forEach(sub => {
    const key = `${sub.description}-${sub.amount}`;
    if (!subscriptionMap.has(key)) {
      subscriptionMap.set(key, {
        id: sub.id,
        description: sub.description,
        amount: sub.amount,
        category: sub.category,
        merchant: sub.merchant,
        lastCharge: sub.date,
        frequency: 'monthly', // Default to monthly
        totalPaid: sub.amount,
        count: 1
      });
    } else {
      const existing = subscriptionMap.get(key);
      existing.totalPaid += sub.amount;
      existing.count += 1;
      if (sub.date > existing.lastCharge) {
        existing.lastCharge = sub.date;
      }
    }
  });
  
  const uniqueSubscriptions = Array.from(subscriptionMap.values());
  
  // Calculate totals
  const monthlyTotal = uniqueSubscriptions.reduce((sum, sub) => sum + sub.amount, 0);
  const yearlyTotal = monthlyTotal * 12;
  
  return NextResponse.json({
    subscriptions: uniqueSubscriptions,
    summary: {
      count: uniqueSubscriptions.length,
      monthlyTotal,
      yearlyTotal
    }
  });
}
