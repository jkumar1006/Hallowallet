# Smart Purchase Advisor - Multi-Item Comparison

## Overview
Enhanced Purchase Advisor that compares 2-3 items simultaneously and provides intelligent recommendations based on monthly or yearly budget analysis.

## Features

### 1. Multiple Item Comparison
- Compare up to 3 items at once
- Each item analyzed independently
- Ranked by affordability score (0-100)
- Visual ranking with medals (🥇🥈🥉)

### 2. Time Period Selection
- **Monthly Budget**: Analyzes against current month's disposable income
- **Yearly Budget**: Analyzes against full year's disposable income
- Toggle between periods with visual buttons

### 3. Intelligent Scoring
Items are scored based on:
- **Monthly Mode**:
  - 100: Comfortable (>20% budget remaining)
  - 70: Tight but affordable
  - 50: Wait recommended
  - 30: Reconsider
  - 10: Not recommended

- **Yearly Mode**:
  - 100: Excellent (>50% yearly budget remaining)
  - 70: Good (>30% remaining)
  - 40: Tight
  - 10: Cuts into savings

### 4. Best Choice Highlight
- Top-ranked item highlighted with gold border
- Shows recommendation (Buy/Wait/Reconsider)
- Displays detailed reasoning
- Budget-friendly alternatives provided

### 5. Comparison View
All items displayed with:
- Ranking position
- Affordability score
- Recommendation status
- Detailed analysis

## How to Use

### Step 1: Select Time Period
Choose your analysis period:
- **📅 Monthly Budget**: For regular monthly purchases
- **📆 Yearly Budget**: For big-ticket items or annual planning

### Step 2: Enter Items
Fill in up to 3 items:
- **Item 1**: Required (name + price)
- **Item 2**: Optional (name + price)
- **Item 3**: Optional (name + price)

### Step 3: Compare
Click "Compare & Get Recommendation 🤔"

### Step 4: Review Results
- **Best Choice**: Top recommendation with gold star
- **All Items**: Ranked comparison of all entries
- **Alternatives**: Budget-friendly options for best choice
- **Budget Impact**: Remaining budget after purchase

## Example Scenarios

### Scenario 1: Phone Comparison (Monthly)
```
Time Period: Monthly Budget
Item 1: iPhone 15 Pro - $999
Item 2: Samsung S24 - $899
Item 3: Google Pixel 8 - $699

Result:
🥇 Google Pixel 8 (Score: 100) - ✓ Affordable
🥈 Samsung S24 (Score: 70) - ✓ Affordable but tight
🥉 iPhone 15 Pro (Score: 30) - ✗ Reconsider

Recommendation: Buy Google Pixel 8
```

### Scenario 2: Laptop Purchase (Yearly)
```
Time Period: Yearly Budget
Item 1: MacBook Pro - $2499
Item 2: Dell XPS 15 - $1799
Item 3: Lenovo ThinkPad - $1299

Result:
🥇 Lenovo ThinkPad (Score: 100) - ✓ Affordable
🥈 Dell XPS 15 (Score: 70) - ✓ Good choice
🥉 MacBook Pro (Score: 40) - ⏳ Wait

Recommendation: Buy Lenovo ThinkPad
Budget remaining: $8,701 for year
```

## API Changes

### Request Format
```json
{
  "items": [
    { "name": "iPhone 15", "price": 999 },
    { "name": "Samsung S24", "price": 899 },
    { "name": "Pixel 8", "price": 699 }
  ],
  "timePeriod": "monthly" // or "yearly"
}
```

### Response Format
```json
{
  "timePeriod": "monthly",
  "items": [
    {
      "itemName": "Pixel 8",
      "itemPrice": 699,
      "score": 100,
      "recommendation": "buy",
      "reason": "✅ Monthly: Comfortable. $301 left this month.",
      "afterPurchaseBalance": 301,
      "alternativeSuggestions": [...]
    },
    // ... other items ranked by score
  ],
  "bestChoice": { /* top item */ },
  "recommendation": "buy",
  "reason": "...",
  "remainingBudget": 1000,
  "afterPurchaseBalance": 301
}
```

## Benefits

1. **Better Decisions**: Compare multiple options before buying
2. **Budget Awareness**: See impact on monthly vs yearly budget
3. **Smart Rankings**: AI-powered scoring helps prioritize
4. **Alternatives**: Discover budget-friendly options
5. **Flexibility**: Choose analysis period that fits your needs

## Technical Details

- **Frontend**: React component with state management
- **Backend**: TypeScript API with scoring algorithm
- **Scoring**: Multi-factor analysis based on budget impact
- **Alternatives**: Category-based suggestions from Amazon, Best Buy, Walmart
- **Real-time**: Instant analysis and comparison

## Future Enhancements

- [ ] Save comparison history
- [ ] Share comparisons with family
- [ ] Price tracking over time
- [ ] Deal alerts for alternatives
- [ ] Category-specific recommendations
- [ ] Seasonal purchase timing suggestions
