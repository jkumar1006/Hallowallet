import { Expense, Goal, User } from "./types";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

const DB_FILE = path.join(process.cwd(), ".data", "db.json");

// Load data from file if it exists
function loadData() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
      console.log("[DB] Loaded from file:", data.users.length, "users");
      return data;
    }
  } catch (err) {
    console.error("[DB] Error loading data:", err);
  }
  return { users: [], expenses: [], goals: [], spendingWatches: [] };
}

// Save data to file
function saveData() {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify({ users, expenses, goals, spendingWatches }, null, 2));
  } catch (err) {
    console.error("[DB] Error saving data:", err);
  }
}

type SpendingWatch = {
  id: string;
  userId: string;
  category: string;
  threshold: number;
  period: "weekly" | "monthly" | "yearly" | "custom";
  month: string;
  rangeStart?: string;
  rangeEnd?: string;
  createdAt: string;
};

const initialData = loadData();
const users: User[] = initialData.users;
const expenses: Expense[] = initialData.expenses;
const goals: Goal[] = initialData.goals;
const spendingWatches: SpendingWatch[] = initialData.spendingWatches || [];

export const db = {
  createUser(data: Omit<User, "id">): User {
    const user: User = { id: randomUUID(), ...data };
    users.push(user);
    console.log("[DB] User created:", user.email, "Total users:", users.length);
    saveData();
    return user;
  },
  findUserByEmail(email: string) {
    const found = users.find(u => u.email === email) || null;
    console.log("[DB] Finding user by email:", email, "Found:", !!found, "Total users:", users.length);
    return found;
  },
  getUserById(id: string) {
    return users.find(u => u.id === id) || null;
  },
  updateUserPassword(userId: string, newHashedPassword: string) {
    const user = users.find(u => u.id === userId);
    if (!user) return false;
    user.password = newHashedPassword;
    console.log("[DB] Password updated for user:", user.email);
    saveData();
    return true;
  },
  createExpense(data: Omit<Expense, "id">): Expense {
    const e: Expense = { id: randomUUID(), ...data };
    expenses.push(e);
    saveData();
    return e;
  },
  updateExpense(id: string, userId: string, patch: Partial<Expense>) {
    const idx = expenses.findIndex(e => e.id === id && e.userId === userId);
    if (idx === -1) return null;
    expenses[idx] = { ...expenses[idx], ...patch };
    saveData();
    return expenses[idx];
  },
  deleteExpense(id: string, userId: string) {
    const idx = expenses.findIndex(e => e.id === id && e.userId === userId);
    if (idx === -1) return false;
    expenses.splice(idx, 1);
    saveData();
    return true;
  },
  listExpenses(userId: string, filters?: { month?: string; category?: string }) {
    return expenses.filter(e => {
      if (e.userId !== userId) return false;
      if (filters?.month && !e.date.startsWith(filters.month)) return false;
      if (filters?.category && filters.category !== "All" && e.category !== filters.category) return false;
      return true;
    });
  },
  createGoal(data: Omit<Goal, "id">): Goal {
    const g: Goal = { id: randomUUID(), ...data };
    goals.push(g);
    saveData();
    return g;
  },
  listGoals(userId: string, month?: string) {
    return goals.filter(g => {
      if (g.userId !== userId) return false;
      if (!month) return true;
      
      // For yearly goals, show them in all months of the same year
      if (g.period === "yearly") {
        const goalYear = g.month.slice(0, 4);
        const filterYear = month.slice(0, 4);
        return goalYear === filterYear;
      }
      
      // For weekly goals, show them in the month they were created
      if (g.period === "weekly") {
        const goalMonth = g.month.slice(0, 7);
        return goalMonth === month;
      }
      
      // For monthly goals, exact month match
      return g.month === month;
    });
  },
  deleteGoal(id: string, userId: string) {
    const idx = goals.findIndex(g => g.id === id && g.userId === userId);
    if (idx === -1) return false;
    goals.splice(idx, 1);
    saveData();
    return true;
  },
  createSpendingWatch(data: Omit<SpendingWatch, "id">): SpendingWatch {
    const watch: SpendingWatch = { id: randomUUID(), ...data };
    spendingWatches.push(watch);
    console.log("[DB] Spending watch created:", watch, "Total watches:", spendingWatches.length);
    saveData();
    return watch;
  },
  listSpendingWatches(userId: string) {
    return spendingWatches.filter(w => w.userId === userId);
  },
  deleteSpendingWatch(id: string, userId: string) {
    const idx = spendingWatches.findIndex(w => w.id === id && w.userId === userId);
    if (idx === -1) return false;
    spendingWatches.splice(idx, 1);
    saveData();
    return true;
  }
};
