# Test Goals API

## Step 1: Restart Server
```bash
# Stop server (Ctrl+C)
npm run dev
```

## Step 2: Test in Browser Console

Open browser console (F12) and run:

```javascript
// Test expenses API
fetch('/api/expenses?month=2025-11')
  .then(r => r.json())
  .then(d => {
    console.log('Total expenses:', d.length);
    console.log('Clothes expenses:', d.filter(e => e.category === 'Clothes'));
    console.log('Total amount:', d.reduce((sum, e) => sum + e.amount, 0));
  });

// Test goals API
fetch('/api/goals?month=2025-11')
  .then(r => r.json())
  .then(d => {
    console.log('Goals:', d);
  });
```

## Expected Output:

```
Total expenses: 4
Clothes expenses: [{amount: 1000, category: "Clothes", ...}]
Total amount: 1180
Goals: [{label: "Stay under $1000 monthly for clothes", category: "Clothes", limit: 1000, ...}]
```

## Step 3: Force Refresh Goals Page

1. Go to `/goals`
2. Hard refresh: **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac)
3. Check if it shows $1,000 spent

## Step 4: Check Server Console

Look at your terminal where `npm run dev` is running. You should see:
- No errors
- API requests being made
- Data being loaded

## If Still Not Working:

### Option 1: Clear Browser Cache
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### Option 2: Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Refresh the Goals page
4. Look for `/api/goals` and `/api/expenses` requests
5. Click on them to see the response data

### Option 3: Add Transaction via UI
Instead of manually editing the database:
1. Go to Transactions page
2. Click "Add Expense"
3. Fill in:
   - Description: "Clothes Shopping"
   - Amount: 1000
   - Category: Select "Other" or add "Clothes"
   - Date: Today
4. Click "Add Expense"
5. Go to Goals page
6. Should update automatically

## Troubleshooting:

### Issue: Category "Clothes" not in dropdown
**Solution**: The default categories are Food, Transit, Bills, Subscriptions, Other. You need to either:
- Use "Other" category
- Or add "Clothes" as a custom category in the goal

### Issue: Goal not matching transactions
**Solution**: Make sure:
- Goal category = "Clothes"
- Transaction category = "Clothes"
- They must match exactly (case-sensitive)

### Issue: Still showing $100 instead of $1000
**Possible causes**:
1. Browser cache - Hard refresh
2. Server not restarted - Restart `npm run dev`
3. Wrong month - Check date is 2025-11
4. Category mismatch - Check goal.category === expense.category

## Quick Fix:

Run this in browser console to see what the Goals page is calculating:

```javascript
fetch('/api/expenses?month=2025-11')
  .then(r => r.json())
  .then(expenses => {
    const clothesExpenses = expenses.filter(e => e.category === 'Clothes');
    const total = clothesExpenses.reduce((sum, e) => sum + e.amount, 0);
    console.log('Clothes expenses found:', clothesExpenses.length);
    console.log('Total clothes spending:', total);
    console.log('Details:', clothesExpenses);
  });
```

This will show you exactly what the Goals page sees.
