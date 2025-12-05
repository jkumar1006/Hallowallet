import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "db.json");
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const SESSION_COOKIE = "hallowallet_token";

async function getDb() {
  try {
    const data = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    return { users: [], expenses: [], goals: [], financialProfiles: [] };
  }
}

async function saveDb(db: any) {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
}

function calculateFinancialMetrics(profile: any, expenses: any[], goals: any[]) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Calculate current month spending
  const currentMonthSpending = expenses
    .filter((e) => {
      const expDate = new Date(e.date);
      return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
    })
    .reduce((sum, e) => sum + e.amount, 0);

  // Calculate average monthly spending (last 3 months or available data)
  const threeMonthsAgo = new Date(now);
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
  const recentExpenses = expenses.filter((e) => new Date(e.date) >= threeMonthsAgo);
  const monthsOfData = Math.max(1, Math.ceil((now.getTime() - threeMonthsAgo.getTime()) / (1000 * 60 * 60 * 24 * 30)));
  const averageMonthlySpending = recentExpenses.reduce((sum, e) => sum + e.amount, 0) / monthsOfData;

  // Calculate monthly spending goals total
  const monthlyGoals = goals.filter((g: any) => g.period === "monthly");
  const totalMonthlyGoals = monthlyGoals.reduce((sum: number, g: any) => sum + g.limit, 0);

  // Calculate projected yearly savings
  const projectedYearlySpending = averageMonthlySpending * 12;
  const projectedYearlyIncome = profile.monthlyIncome * 12;
  const projectedYearlySavings = projectedYearlyIncome - projectedYearlySpending;

  // Calculate savings rate
  const savingsRate = (projectedYearlySavings / projectedYearlyIncome) * 100;

  // Calculate disposable income (income - savings target - expected monthly expenses from profile)
  const monthlySavingsTarget = profile.yearlySavingsGoal / 12;
  const expectedMonthlyExpenses = profile.expectedMonthlyExpenses || 0;
  const disposableIncome = profile.monthlyIncome - monthlySavingsTarget - expectedMonthlyExpenses;

  return {
    monthlyIncome: profile.monthlyIncome,
    yearlySavingsGoal: profile.yearlySavingsGoal,
    expectedMonthlyExpenses,
    currentMonthSpending,
    averageMonthlySpending,
    projectedYearlySavings,
    savingsRate,
    disposableIncome,
    totalMonthlyGoals,
    monthlyGoals: monthlyGoals.map((g: any) => ({
      description: g.description,
      limit: g.limit,
      spent: expenses
        .filter((e) => {
          const expDate = new Date(e.date);
          return expDate.getMonth() === currentMonth && 
                 expDate.getFullYear() === currentYear &&
                 e.category === g.description;
        })
        .reduce((sum, e) => sum + e.amount, 0)
    }))
  };
}

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
    const userId = payload.sub;
    const db = await getDb();

    console.log("User ID:", userId);
    console.log("Total expenses in DB:", db.expenses?.length || 0);
    console.log("Total goals in DB:", db.goals?.length || 0);

    const profile = db.financialProfiles?.find((p: any) => p.userId === userId);
    const userExpenses = db.expenses?.filter((e: any) => e.userId === userId) || [];
    const userGoals = db.goals?.filter((g: any) => g.userId === userId) || [];

    console.log("User expenses:", userExpenses.length);
    console.log("User goals:", userGoals.length);

    if (!profile) {
      return NextResponse.json({
        monthlyIncome: 0,
        yearlySavingsGoal: 0,
        expectedMonthlyExpenses: 0,
        currentMonthSpending: 0,
        averageMonthlySpending: 0,
        projectedYearlySavings: 0,
        savingsRate: 0,
        disposableIncome: 0,
        totalMonthlyGoals: 0,
        monthlyGoals: []
      });
    }

    const metrics = calculateFinancialMetrics(profile, userExpenses, userGoals);
    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Error in GET /api/financial-profile:", error);
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
    const userId = payload.sub;
    
    const body = await req.json();
    const { monthlyIncome, yearlySavingsGoal, expectedMonthlyExpenses } = body;

    if (!monthlyIncome || !yearlySavingsGoal) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = await getDb();
    if (!db.financialProfiles) {
      db.financialProfiles = [];
    }

    const existingIndex = db.financialProfiles.findIndex((p: any) => p.userId === userId);
    
    const profileData = {
      userId,
      monthlyIncome: parseFloat(monthlyIncome),
      yearlySavingsGoal: parseFloat(yearlySavingsGoal),
      expectedMonthlyExpenses: expectedMonthlyExpenses ? parseFloat(expectedMonthlyExpenses) : 0,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      db.financialProfiles[existingIndex] = profileData;
    } else {
      db.financialProfiles.push(profileData);
    }

    await saveDb(db);

    const userExpenses = db.expenses?.filter((e: any) => e.userId === userId) || [];
    const userGoals = db.goals?.filter((g: any) => g.userId === userId) || [];
    const metrics = calculateFinancialMetrics(profileData, userExpenses, userGoals);

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Error in POST /api/financial-profile:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
