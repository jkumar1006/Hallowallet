# Quick Start: Financial Advisor Feature

## Overview
The Financial Advisor helps users decide whether they should buy something based on their income, savings goals, and current spending.

## Setup (First Time)

1. **Start the app**:
   ```bash
   npm run dev
   ```

2. **Login** to your account

3. **Go to Dashboard** - You'll see a new "💰 Spending Tracker & Advisor" section

4. **Setup Your Profile**:
   - Enter your monthly income after taxes (e.g., $5000)
   - Enter your yearly savings goal (e.g., $12000)
   - Click "Save Financial Profile"

## Using the Purchase Advisor

### Step 1: Check Your Financial Health
The dashboard shows:
- Your monthly income
- Your savings goal
- Current month spending
- Savings progress (with progress bar)
- Projected year-end savings

### Step 2: Get Purchase Advice
1. Scroll to "🛒 Smart Purchase Advisor"
2. Enter the item name (e.g., "iPhone 15")
3. Enter the price (e.g., 999)
4. Click "Should I Buy This? 🤔"

### Step 3: Review Recommendation
You'll get one of three recommendations:

**✅ Go Ahead! You Can Afford It** (Green)
- You have plenty of budget
- Savings goal is safe
- No alternatives shown

**⏳ Consider Waiting** (Yellow)
- Budget is tight but possible
- Shows 3 cheaper alternatives
- Suggests waiting until next month

**❌ Not Recommended Right Now** (Red)
- Would exceed your budget
- Impacts savings goal
- Shows 3 cheaper alternatives
- Recommends postponing

### Step 4: Explore Alternatives
If alternatives are shown:
- Click any alternative to search on Amazon
- Compare prices and features
- Make an informed decision

## Example Scenarios

### Scenario 1: Comfortable Purchase
```
Income: $5,000/month
Savings Goal: $12,000/year
Current Spending: $2,000
Item: Coffee Maker ($150)

Result: ✅ Buy
"You can afford this! After this purchase, you'll still have 
$1,850 remaining this month."
```

### Scenario 2: Tight Budget
```
Income: $3,000/month
Savings Goal: $12,000/year
Current Spending: $1,800
Item: Laptop ($800)

Result: ⏳ Wait
"This purchase is possible but will leave you with only $200 
for the rest of the month."

Alternatives shown:
- Lenovo IdeaPad 3 ($320)
- HP Pavilion 15 ($400)
- Acer Aspire 5 ($280)
```

### Scenario 3: Over Budget
```
Income: $4,000/month
Savings Goal: $18,000/year
Current Spending: $2,400
Item: iPhone 15 ($999)

Result: ❌ Reconsider
"This purchase would exceed your monthly budget by $399. 
It would impact your savings goal."

Alternatives shown:
- Samsung Galaxy A54 5G ($599)
- Google Pixel 7a ($499)
- OnePlus Nord N30 ($299)
```

## Understanding the Metrics

### Savings Rate
- **Excellent** (≥20%): You're saving 20%+ of income
- **Good** (≥10%): You're saving 10-20% of income
- **Needs Improvement** (<10%): You're saving less than 10%

### Disposable Income
- Income minus monthly savings target
- This is your "safe to spend" amount
- Purchase advisor uses this for recommendations

### Projected Year-End Savings
- Based on your average monthly spending
- Shows if you'll meet your yearly goal
- Updates as you add expenses

## Tips for Best Results

1. **Be Honest**: Enter accurate income and expenses
2. **Update Regularly**: Add expenses as they happen
3. **Review Monthly**: Check your progress at month-end
4. **Adjust Goals**: Update savings goals as needed
5. **Use Alternatives**: Consider cheaper options when suggested

## Multi-Language Support

The feature works in all supported languages:
- English
- Hindi (हिंदी)
- Telugu (తెలుగు)
- Kannada (ಕನ್ನಡ)
- Malayalam (മലയാളം)
- Tamil (தமிழ்)

Change language using the language selector in the top-right corner.

## Updating Your Profile

Click "⚙️ Update Profile" button to:
- Change your monthly income
- Adjust your savings goal
- Recalculate all metrics

## How It Works

1. **Tracks Expenses**: Uses your actual expense data
2. **Calculates Averages**: 3-month rolling average
3. **Projects Savings**: Estimates year-end based on current rate
4. **Analyzes Purchases**: Checks if item fits your budget
5. **Suggests Alternatives**: Finds cheaper options when needed

## Troubleshooting

**Q: I don't see the Financial Advisor section**
- Make sure you're logged in
- Navigate to the Dashboard page
- Scroll down below Quick Actions

**Q: It says "Financial profile not set up"**
- Click "⚙️ Update Profile"
- Enter your income and savings goal
- Click "Save Financial Profile"

**Q: Recommendations seem wrong**
- Check your income is correct (after taxes)
- Verify your savings goal is realistic
- Make sure you've added recent expenses
- Update your profile if circumstances changed

**Q: No alternatives shown**
- Alternatives only show for "Wait" or "Reconsider"
- If you get "Buy", no alternatives needed
- Some items may have generic alternatives

## API Endpoints (For Developers)

```typescript
// Get financial profile
GET /api/financial-profile

// Update financial profile
POST /api/financial-profile
{
  "monthlyIncome": 5000,
  "yearlySavingsGoal": 12000
}

// Check purchase decision
POST /api/purchase-advisor
{
  "itemName": "iPhone 15",
  "itemPrice": 999
}
```

## Data Storage

- Stored in `data/db.json` (development)
- Persists across server restarts
- Integrates with existing expense data
- No external API calls required

## Next Steps

1. Set up your financial profile
2. Add some expenses to see tracking
3. Test the purchase advisor with different items
4. Explore the financial health insights
5. Use it before making real purchases!

---

**Need Help?** Check `FINANCIAL_ADVISOR_FEATURE.md` for detailed documentation.
