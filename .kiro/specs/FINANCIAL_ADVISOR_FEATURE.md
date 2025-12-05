# Financial Advisor & Purchase Decision System

## Overview
Production-ready financial advisor system that helps users make smart purchase decisions based on their income, savings goals, and spending patterns.

## Features Implemented

### 1. Financial Profile Setup
- **Monthly Income (After Taxes)**: User enters their take-home pay
- **Yearly Savings Goal**: User sets annual savings target
- **Automatic Calculations**: System calculates monthly savings target automatically

### 2. Real-Time Financial Tracking
- **Current Month Spending**: Tracks expenses for the current month
- **Average Monthly Spending**: Calculates average based on last 3 months
- **Projected Year-End Savings**: Estimates annual savings based on current spending rate
- **Savings Rate**: Percentage of income being saved
- **Disposable Income**: Income minus savings target

### 3. Smart Purchase Advisor
Users can check if they should buy an item by entering:
- Item name
- Item price

The system provides:
- **Buy Recommendation**: "Buy", "Wait", or "Reconsider"
- **Detailed Reasoning**: Explains the financial impact
- **Impact Analysis**: Shows effect on monthly savings
- **After-Purchase Balance**: Remaining budget after purchase

### 4. Cheaper Alternatives System
When a purchase is not recommended or tight on budget, the system suggests 3 cheaper alternatives with:
- Alternative product name
- Estimated price (30-60% of original)
- Direct Amazon search link

**Categories with alternatives:**
- Electronics (phones, laptops, tablets, watches, headphones)
- Clothing (shoes, jackets)
- Home & Kitchen (coffee makers, vacuums)
- Gaming (consoles)
- Generic fallback for unknown items

### 5. Financial Health Insights
- **Savings Rate Analysis**: Excellent (≥20%), Good (≥10%), Needs Improvement (<10%)
- **Smart Recommendations**: Personalized advice based on spending patterns
- **Progress Tracking**: Visual progress bars for savings goals
- **Spending Alerts**: Warnings when spending exceeds averages

## Decision Logic

### Purchase Recommendations:
1. **Buy** (Green): After purchase, >20% buffer remains
   - User can comfortably afford it
   - Savings goal remains on track

2. **Wait** (Yellow): After purchase, 5-20% buffer remains
   - Possible but tight
   - Shows cheaper alternatives
   - Suggests waiting until next month

3. **Reconsider** (Red): After purchase, <5% buffer or negative
   - Would exceed budget
   - Impacts savings goal
   - Shows cheaper alternatives
   - Strongly recommends postponing

## API Endpoints

### GET /api/financial-profile
Returns user's financial metrics:
```json
{
  "monthlyIncome": 5000,
  "yearlySavingsGoal": 12000,
  "currentMonthSpending": 2500,
  "averageMonthlySpending": 2800,
  "projectedYearlySavings": 26400,
  "savingsRate": 44,
  "disposableIncome": 4000
}
```

### POST /api/financial-profile
Creates/updates financial profile:
```json
{
  "monthlyIncome": 5000,
  "yearlySavingsGoal": 12000
}
```

### POST /api/purchase-advisor
Analyzes purchase decision:
```json
{
  "itemName": "iPhone 15",
  "itemPrice": 999
}
```

Returns:
```json
{
  "recommendation": "buy|wait|reconsider",
  "reason": "Detailed explanation...",
  "itemName": "iPhone 15",
  "itemPrice": 999,
  "impactOnSavings": 1001,
  "remainingBudget": 2000,
  "afterPurchaseBalance": 1001,
  "alternativeSuggestions": [
    {
      "name": "Samsung Galaxy A54 5G",
      "price": 599.40,
      "link": "https://www.amazon.com/s?k=Samsung+Galaxy+A54"
    }
  ]
}
```

## Multi-Language Support

All strings are translated in 6 languages:
- English (en)
- Hindi (hi)
- Telugu (te)
- Kannada (kn)
- Malayalam (ml)
- Tamil (ta)

Translation keys under `financialAdvisor` namespace in all locale files.

## Database Schema

### financialProfiles table
```typescript
{
  userId: string;
  monthlyIncome: number;
  yearlySavingsGoal: number;
  updatedAt: string;
}
```

Stored in `data/db.json` for development (production should use PostgreSQL/MongoDB).

## UI Components

### SpendingTracker Component
Location: `src/components/tracker/SpendingTracker.tsx`

**Sections:**
1. Financial Profile Setup (first-time users)
2. Financial Overview Cards (Income, Savings Goal, Monthly Spending)
3. Savings Progress Tracker (with visual progress bar)
4. Smart Purchase Advisor (item input and recommendation)
5. Financial Health Dashboard (savings rate, insights)

**Styling:**
- Dark theme with Halloween mode support
- Responsive grid layout
- Color-coded recommendations (green/yellow/red)
- Interactive forms with validation

## Integration

The SpendingTracker is integrated into the main dashboard:
```typescript
// src/components/dashboard/DashboardHero.tsx
import SpendingTracker from "../tracker/SpendingTracker";

// Rendered between QuickActions and GoalsWidget
<SpendingTracker />
```

## Production Considerations

### Current Implementation (Development):
- File-based JSON storage (`data/db.json`)
- Static alternative suggestions
- Basic Amazon search links

### Production Recommendations:
1. **Database**: Migrate to PostgreSQL/MongoDB
2. **Alternative Products API**: 
   - Integrate Amazon Product Advertising API
   - Use price comparison APIs (PriceAPI, Rainforest API)
   - Real-time price fetching
3. **Caching**: Cache alternative suggestions for 24 hours
4. **Analytics**: Track purchase decisions and outcomes
5. **Machine Learning**: Personalize recommendations based on user behavior
6. **Security**: Add rate limiting on purchase advisor endpoint
7. **Notifications**: Alert users when approaching budget limits

## Testing

To test the feature:
1. Login to the app
2. Navigate to Dashboard
3. Set up financial profile (e.g., $5000 income, $12000 yearly savings)
4. Add some expenses to see tracking
5. Test purchase advisor with different items and prices
6. Observe recommendations and alternatives

## Example Scenarios

### Scenario 1: Affordable Purchase
- Income: $5000/month
- Savings Goal: $12000/year ($1000/month)
- Current Spending: $2000
- Item: Coffee Maker ($150)
- **Result**: ✅ Buy - Plenty of budget remaining

### Scenario 2: Tight Budget
- Income: $3000/month
- Savings Goal: $12000/year ($1000/month)
- Current Spending: $1800
- Item: Laptop ($800)
- **Result**: ⏳ Wait - Shows cheaper alternatives

### Scenario 3: Over Budget
- Income: $4000/month
- Savings Goal: $18000/year ($1500/month)
- Current Spending: $2400
- Item: iPhone 15 ($999)
- **Result**: ❌ Reconsider - Strongly recommends postponing

## Future Enhancements

1. **Recurring Expenses**: Factor in subscriptions and bills
2. **Emergency Fund**: Recommend building 3-6 months emergency fund
3. **Debt Tracking**: Include debt payments in calculations
4. **Investment Suggestions**: Recommend investing surplus savings
5. **Price Alerts**: Notify when desired items drop in price
6. **Wishlist**: Save items for future purchase when budget allows
7. **Family Budgets**: Support multiple users/family members
8. **Export Reports**: PDF/CSV export of financial analysis
