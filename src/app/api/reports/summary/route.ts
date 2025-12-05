import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../../lib/auth";
import { db } from "../../../../lib/db";

export async function GET(req: NextRequest) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const month = searchParams.get("month");

  // Get all expenses for the user
  let expenses = db.listExpenses(user.id);
  
  // Filter by date range if provided
  if (start && end) {
    expenses = expenses.filter(e => {
      const expenseMonth = e.date.slice(0, 7); // YYYY-MM
      return expenseMonth >= start && expenseMonth <= end;
    });
  } else if (month) {
    expenses = expenses.filter(e => e.date.startsWith(month));
  }

  const byCategory: Record<string, number> = {};
  const byMerchant: Record<string, number> = {};
  let total = 0;

  for (const e of expenses) {
    total += e.amount;
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    if (e.merchant) {
      byMerchant[e.merchant] = (byMerchant[e.merchant] || 0) + e.amount;
    }
  }

  return NextResponse.json({ total, byCategory, byMerchant });
}
