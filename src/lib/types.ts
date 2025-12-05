export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  currency?: string;
  country?: string;
  city?: string;
  monthlyIncome?: number;
  yearlySavingsGoal?: number;
  createdAt: string;
};

export type ExpenseCategory = "Food" | "Transit" | "Bills" | "Subscriptions" | "Other" | string;

export type Expense = {
  id: string;
  userId: string;
  date: string;
  description: string;
  category: ExpenseCategory;
  merchant?: string;
  amount: number;
  isSubscription?: boolean;
  notes?: string;
};

export type Goal = {
  id: string;
  userId: string;
  label: string;
  category?: ExpenseCategory;
  limit: number;
  month: string;
  period?: "weekly" | "monthly" | "yearly";
};

export type PurchaseDecision = {
  itemName: string;
  itemPrice: number;
  canAfford: boolean;
  recommendation: "buy" | "wait" | "reconsider";
  reason: string;
  impactOnSavings: number;
  alternativeSuggestions?: {
    name: string;
    price: number;
    link: string;
  }[];
};

export type FinancialProfile = {
  monthlyIncome: number;
  yearlySavingsGoal: number;
  currentMonthSpending: number;
  averageMonthlySpending: number;
  projectedYearlySavings: number;
  savingsRate: number;
  disposableIncome: number;
};

export type ReportSummary = {
  total: number;
  byCategory: Record<string, number>;
  byMerchant: Record<string, number>;
};

export type AssistantEffect =
  | { type: "expense_created"; id: string }
  | { type: "expense_deleted"; id: string }
  | { type: "goal_created"; id: string }
  | { type: "noop" };

export type AssistantResponse = {
  messages: string[];
  effects?: AssistantEffect[];
};
