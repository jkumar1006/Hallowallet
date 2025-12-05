import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../lib/auth";
import { db } from "../../../lib/db";

export async function GET(req: NextRequest) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month") || undefined;
  const category = searchParams.get("category") || undefined;

  const list = db.listExpenses(user.id, { month, category: category || undefined });
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const e = db.createExpense({
    userId: user.id,
    date: body.date || new Date().toISOString(),
    description: body.description,
    category: body.category,
    merchant: body.merchant,
    amount: Number(body.amount),
    isSubscription: body.isSubscription,
    notes: body.notes
  });

  return NextResponse.json(e);
}
