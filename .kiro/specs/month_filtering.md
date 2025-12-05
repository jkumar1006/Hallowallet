---
title: Global Month Filtering System
status: implemented
priority: high
---

# Global Month Filtering System

## Overview
A unified month filtering system that persists across all pages in the application.

## How It Works

### 1. Month Selector (Sidebar)
- Shows 20 years of months (past 10 + future 10)
- Updates URL parameter: `?month=2025-11`
- Formatted display: "November 2025"

### 2. URL Parameter Persistence
When you change the month selector:
- URL updates: `/dashboard?month=2025-11`
- All navigation links preserve the month parameter
- Switching pages maintains the selected month

### 3. Auto-Reload Components
All components automatically reload when month changes:

**Dashboard** (`DashboardHero.tsx`)
- Fetches expenses for selected month
- Updates charts and stats
- Reloads every 1 second to detect URL changes

**Transactions** (`TransactionTable.tsx`)
- Shows only transactions for selected month
- Auto-refreshes on month change

**Insights** (`InsightsView.tsx`)
- Category breakdown for selected month
- Spending trends for selected month

**Goals** (`GoalsView.tsx` & `GoalsWidget.tsx`)
- Monthly goals: Show only in their specific month
- Yearly goals: Show in all 12 months of that year
- Tracks spending against goals for selected month

**Reports** (`ReportsView.tsx`)
- Summary data for selected month
- CSV export for selected month

**Financial Advisor** (`SpendingTracker.tsx`)
- Budget calculations based on selected month
- Purchase recommendations using current month data

## Navigation Flow

### Example User Journey:
1. User is on Dashboard (November 2025)
2. User changes month to December 2025
3. Dashboard reloads → Shows December data
4. User clicks "Transactions" link
5. Transactions page opens with December 2025 data
6. User clicks "Goals" link
7. Goals page shows December 2025 goals
8. User changes month back to November 2025
9. All November data reappears

## Technical Implementation

### URL Structure
```
/dashboard?month=2025-11&cat=All
/transactions?month=2025-11&cat=Food
/goals?month=2025-11
```

### Navigation Links (Sidebar)
```typescript
const currentParams = searchParams.toString();
const queryString = currentParams ? `?${currentParams}` : '';

const nav = [
  { href: `/dashboard${queryString}`, ... },
  { href: `/transactions${queryString}`, ... },
  // ... preserves month and category
];
```

### Component Reload Pattern
```typescript
async function load() {
  const url = new URL(window.location.href);
  const month = url.searchParams.get("month") || new Date().toISOString().slice(0, 7);
  // Fetch data for selected month
}

useEffect(() => {
  load();
  
  // Listen for URL changes
  window.addEventListener('popstate', () => load());
  
  // Poll for changes
  const interval = setInterval(() => load(), 1000);
  
  return () => {
    window.removeEventListener('popstate', load);
    clearInterval(interval);
  };
}, []);
```

## Goals Filtering Logic

### Monthly Goals
```typescript
// Show only in exact month
if (goal.period === "monthly") {
  return goal.month === selectedMonth; // "2025-11" === "2025-11"
}
```

### Yearly Goals
```typescript
// Show in all months of the same year
if (goal.period === "yearly") {
  const goalYear = goal.month.slice(0, 4); // "2025"
  const filterYear = selectedMonth.slice(0, 4); // "2025"
  return goalYear === filterYear;
}
```

## Benefits

✅ **Consistent Experience** - Same month across all pages
✅ **Data Isolation** - Each month's data is separate
✅ **Easy Navigation** - Month persists when switching pages
✅ **Historical Analysis** - Access 10 years of past data
✅ **Future Planning** - Plan up to 10 years ahead
✅ **Real-time Updates** - Components auto-reload on changes

## Future Enhancements
- Date range selection (from-to)
- Quick filters (This Month, Last Month, This Year)
- Comparison mode (compare two months)
- Custom date ranges
- Fiscal year support
