---
title: Financial Assistant & Purchase Advisor
status: implemented
priority: high
---

# Financial Assistant & Purchase Advisor

## Overview
An intelligent financial assistant that helps users make informed purchase decisions based on their income, savings goals, and spending patterns.

## Features

### 1. Financial Profile Setup
- Monthly income (after tax)
- Yearly savings goal
- Expected monthly expenses (rent, bills, EMIs)
- Smart suggestions based on actual spending

### 2. Real-time Budget Tracking
- Current month spending
- Average monthly spending
- Projected year-end savings
- Savings rate calculation

### 3. Smart Purchase Advisor
**Input:**
- Item name
- Item price

**Output:**
- Recommendation: Buy / Wait / Reconsider
- Reasoning based on budget
- Impact on savings
- Alternative suggestions (cheaper options)

**Decision Logic:**
```
Available Budget = Income - Savings Target - Expected Expenses - Monthly Goals - Current Spending

If purchase > available budget: RECONSIDER
If purchase > 50% of available: WAIT
Else: BUY
```

### 4. Financial Health Metrics
- Savings rate percentage
- Disposable income
- Monthly goal tracking
- Smart recommendations

## API Endpoints

### GET /api/financial-profile
Returns user's financial profile and calculated metrics

### POST /api/financial-profile
Creates/updates financial profile
```json
{
  "monthlyIncome": 8000,
  "yearlySavingsGoal": 70000,
  "expectedMonthlyExpenses": 2000
}
```

### POST /api/purchase-advisor
Analyzes purchase decision
```json
{
  "itemName": "iPhone 15",
  "itemPrice": 999
}
```

## Implementation Files
- `src/components/tracker/SpendingTracker.tsx` - Main UI component
- `src/app/api/financial-profile/route.ts` - Profile management
- `src/app/api/purchase-advisor/route.ts` - Purchase analysis

## Future Enhancements
- AI-powered spending insights
- Category-wise budget recommendations
- Bill payment reminders
- Investment suggestions
- Debt payoff calculator
