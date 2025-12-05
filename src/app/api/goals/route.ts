import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../lib/auth";
import { db } from "../../../lib/db";

export async function GET(req: NextRequest) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month") || undefined;
  const goals = db.listGoals(user.id, month);
  return NextResponse.json(goals);
}

export async function POST(req: NextRequest) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const g = db.createGoal({
    userId: user.id,
    label: body.label,
    category: body.category,
    limit: Number(body.limit),
    month: body.month,
    period: body.period || "monthly"
  });
  return NextResponse.json(g);
}
