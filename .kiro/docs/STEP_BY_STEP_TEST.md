# Step-by-Step Test - Financial Advisor

## Your Example: $100k income, $70k savings goal, $150 spent

### Step 1: Setup Your Profile

1. **Go to Financial Advisor**
   - Click "💰 Financial Advisor" in left sidebar

2. **Enter Your Information**:
   - Monthly Income (after taxes): `8333.33`
     - (This is $100k ÷ 12 months)
   - Yearly Savings Goal: `70000`
   - Click "Save Financial Profile"

3. **Verify It Saved**:
   - Page should refresh
   - You should see three cards:
     - Monthly Income: $8,333.33
     - Yearly Savings Goal: $70,000
     - This Month Spending: $0.00 (no expenses yet)

---

### Step 2: Add Your $150 in Expenses

1. **Go to Transactions Page**
   - Click "📓 Transactions" in left sidebar

2. **Add First Expense**:
   - Description: "Groceries"
   - Amount: `50`
   - Category: Food
   - Date: Today
   - Click "Add Expense"

3. **Add Second Expense**:
   - Description: "Gas"
   - Amount: `60`
   - Category: Transit
   - Date: Today
   - Click "Add Expense"

4. **Add Third Expense**:
   - Description: "Restaurant"
   - Amount: `40`
   - Category: Food
   - Date: Today
   - Click "Add Expense"

**Total Added**: $50 + $60 + $40 = **$150**

---

### Step 3: Refresh Financial Advisor

1. **Go Back to Financial Advisor**
   - Click "💰 Financial Advisor" in sidebar

2. **Click "🔄 Refresh Data" Button**
   - Located at top right
   - This reloads your expense data

3. **Verify Your $150 Shows Up**:
   - Look at "This Month Spending" card
   - Should now show: **$150.00**
   - Look at "Savings Progress This Month"
   - Should show: "Spent So Far: -$150.00"

---

### Step 4: Check Your Budget

After refreshing, you should see:

```
┌─────────────────────────────────────────────────────────┐
│ Monthly Income (After Tax)    │ $8,333.33              │
├─────────────────────────────────────────────────────────┤
│ Yearly Savings Goal           │ $70,000.00             │
│                               │ $5,833.33/month target │
├─────────────────────────────────────────────────────────┤
│ This Month Spending           │ $150.00  ← YOUR EXPENSES│
│                               │ Avg: $150.00/month     │
└─────────────────────────────────────────────────────────┘

Savings Progress This Month:
Income:              $8,333.33
Spent So Far:          -$150.00
─────────────────────────────────
Current Savings:     $8,183.33

Savings Target:      $5,833.33
Progress: ████████████████████░ 100% ✅ On track!

Your Monthly Budget: $8,333.33 - $5,833.33 = $2,500.00
You've Spent: $150.00
Remaining: $2,500.00 - $150.00 = $2,350.00
```

---

### Step 5: Test Purchase Decision

Now scroll down to "🛒 Smart Purchase Advisor"

#### Test 1: Small Purchase (Should Buy)
```
Item Name: Coffee Maker
Price: 100

Click "Should I Buy This? 🤔"

Expected Result: ✅ BUY
"You can afford this! After this purchase, you'll still 
have $2,250 remaining this month, which is 90% of your 
monthly budget. Your savings goal remains on track."
```

#### Test 2: Medium Purchase (Should Buy)
```
Item Name: iPhone 15
Price: 999

Click "Should I Buy This? 🤔"

Expected Result: ✅ BUY
"You can afford this! After this purchase, you'll still 
have $1,351 remaining this month, which is 54% of your 
monthly budget. Your savings goal remains on track."
```

#### Test 3: Large Purchase (Should Wait)
```
Item Name: Laptop
Price: 2000

Click "Should I Buy This? 🤔"

Expected Result: ⏳ WAIT
"This purchase is possible but will leave you with only 
$350 for the rest of the month. Consider waiting until 
next month or checking out these cheaper alternatives."

Alternatives:
- Lenovo IdeaPad 3 - $800
- HP Pavilion 15 - $1,000
- Acer Aspire 5 - $700
```

#### Test 4: Very Large Purchase (Should Reconsider)
```
Item Name: MacBook Pro
Price: 3000

Click "Should I Buy This? 🤔"

Expected Result: ❌ RECONSIDER
"This purchase would exceed your monthly budget by $650. 
It would impact your savings goal of $70,000. I strongly 
recommend postponing this purchase or exploring these 
budget-friendly alternatives."

Alternatives:
- Lenovo IdeaPad 3 - $1,200
- HP Pavilion 15 - $1,500
- Acer Aspire 5 - $1,050
```

---

### Step 6: Verify Calculations

The system calculates:

```
Your Profile:
- Yearly Income: $100,000
- Monthly Income: $8,333.33
- Yearly Savings Goal: $70,000
- Monthly Savings Target: $5,833.33
- Monthly Budget (Disposable): $2,500.00

Your Spending:
- This Month: $150.00
- Remaining Budget: $2,350.00

Purchase: iPhone 15 ($999)
- After Purchase: $2,350 - $999 = $1,351
- Percentage: 54% of budget remaining
- Decision: ✅ BUY (>20% buffer)
```

---

## Troubleshooting:

### If $150 Doesn't Show:

1. **Check Transactions Were Added**:
   - Go to Transactions page
   - Verify you see your 3 expenses
   - Total should be $150

2. **Click "🔄 Refresh Data"**:
   - Go to Financial Advisor
   - Click the refresh button at top right
   - Wait 1-2 seconds
   - Check if "This Month Spending" updates

3. **Hard Refresh Browser**:
   - Press Ctrl+Shift+R (Windows)
   - Or Cmd+Shift+R (Mac)
   - This clears cache

4. **Check Browser Console**:
   - Press F12
   - Look for any red errors
   - If you see errors, share them

5. **Verify Database**:
   ```bash
   cat data/db.json | grep -A 10 "expenses"
   ```
   Should show your 3 expenses

6. **Restart Server**:
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

---

## Quick Verification:

Run this in browser console (F12):
```javascript
fetch('/api/financial-profile')
  .then(r => r.json())
  .then(d => {
    console.log('Monthly Income:', d.monthlyIncome);
    console.log('Savings Goal:', d.yearlySavingsGoal);
    console.log('Current Month Spending:', d.currentMonthSpending);
    console.log('Remaining Budget:', d.disposableIncome - d.currentMonthSpending);
  });
```

Should output:
```
Monthly Income: 8333.33
Savings Goal: 70000
Current Month Spending: 150
Remaining Budget: 2350
```

---

## Summary:

✅ **Setup**: Income $8,333.33/month, Savings $70k/year
✅ **Budget**: $2,500/month disposable
✅ **Spent**: $150 this month
✅ **Remaining**: $2,350
✅ **Can Buy**: Items up to ~$2,000 comfortably
✅ **Should Wait**: Items over $2,000
✅ **Factors In**: Your expenses, goals, and savings target

**The system works!** Just make sure to:
1. Add your transactions
2. Click "🔄 Refresh Data" button
3. Check that spending updates
4. Test purchase decisions

If it's still not working, check the troubleshooting steps above!
