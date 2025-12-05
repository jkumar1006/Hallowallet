# Troubleshooting Financial Advisor

## Issue: "Financial Advisor not showing item name/price fields"

### Solution: Follow these steps in order

## Step 1: Access the Financial Advisor Page

1. **Login** to your account
2. Look at the **left sidebar**
3. Click on **"💰 Financial Advisor"** (or translated equivalent)
4. You should see the Financial Advisor page

**If you don't see "Financial Advisor" in sidebar:**
- Make sure you're logged in
- Check that you're on a dashboard page (not login/signup)
- Refresh the page

## Step 2: Setup Your Financial Profile (REQUIRED)

**IMPORTANT**: You MUST set up your profile before you can use the purchase advisor!

When you first visit the Financial Advisor page, you'll see:

```
┌─────────────────────────────────────────────────────────┐
│  💰 Financial Profile Setup                             │
│                                                         │
│  Set up your financial profile to get personalized     │
│  spending advice and purchase recommendations.          │
│                                                         │
│  Monthly Income (After Taxes) *                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ e.g., 5000                                        │ │
│  └───────────────────────────────────────────────────┘ │
│  Your monthly take-home pay after all taxes            │
│                                                         │
│  Yearly Savings Goal *                                  │
│  ┌───────────────────────────────────────────────────┐ │
│  │ e.g., 12000                                       │ │
│  └───────────────────────────────────────────────────┘ │
│  How much you want to save this year                   │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │         Save Financial Profile                    │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Fill in:**
1. **Monthly Income**: Your take-home pay (e.g., 5000)
2. **Yearly Savings Goal**: How much you want to save (e.g., 12000)
3. Click **"Save Financial Profile"**

## Step 3: Verify Profile is Saved

After saving, the page should refresh and show:

```
┌─────────────────────────────────────────────────────────┐
│  💰 Spending Tracker & Advisor                          │
│  ⚙️ Update Profile                                      │
├─────────────────────────────────────────────────────────┤
│  Financial Overview                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│  │ Income      │ │ Savings Goal│ │ Spending    │      │
│  │ $5,000      │ │ $12,000     │ │ $0          │      │
│  └─────────────┘ └─────────────┘ └─────────────┘      │
└─────────────────────────────────────────────────────────┘
```

**If you still see the setup form:**
- Check browser console for errors (F12)
- Make sure you entered valid numbers
- Try refreshing the page

## Step 4: Find the Purchase Advisor Section

Scroll down on the Financial Advisor page until you see:

```
┌─────────────────────────────────────────────────────────┐
│  🛒 Smart Purchase Advisor                              │
│                                                         │
│  Thinking of buying something? Let me analyze if it    │
│  fits your budget and savings goals.                    │
│                                                         │
│  Item Name              Price ($)                       │
│  ┌─────────────────┐   ┌─────────────────┐            │
│  │ e.g., iPhone 15 │   │ e.g., 999       │            │
│  └─────────────────┘   └─────────────────┘            │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │         Should I Buy This? 🤔                     │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**If you don't see this section:**
- Make sure you completed Step 2 (profile setup)
- Scroll down - it's below the financial overview
- Refresh the page

## Step 5: Test the Purchase Advisor

1. **Enter Item Name**: Type what you want to buy
   - Example: "iPhone 15"

2. **Enter Price**: Type the price
   - Example: 999

3. **Click "Should I Buy This? 🤔"**

4. **Wait for result** (should appear in 1-2 seconds)

## Step 6: View the Recommendation

You should see one of these results:

### ✅ BUY (Green)
```
┌─────────────────────────────────────────────────────────┐
│  ✅ Go Ahead! You Can Afford It                         │
│                                                         │
│  iPhone 15 - $999.00                                    │
│                                                         │
│  You can afford this! After this purchase, you'll      │
│  still have $X remaining this month...                  │
│                                                         │
│  Impact on Monthly Savings: $X remaining                │
│  After Purchase Balance: $X                             │
└─────────────────────────────────────────────────────────┘
```

### ⏳ WAIT (Yellow) - WITH ALTERNATIVES
```
┌─────────────────────────────────────────────────────────┐
│  ⏳ Consider Waiting                                     │
│                                                         │
│  Laptop - $800.00                                       │
│                                                         │
│  This purchase is possible but will leave you with...   │
│                                                         │
│  💡 Cheaper Alternatives:                               │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Lenovo IdeaPad 3                        $320.00   │ │
│  │ Click to view on Amazon                           │ │
│  └───────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────┐ │
│  │ HP Pavilion 15                          $400.00   │ │
│  │ Click to view on Amazon                           │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### ❌ RECONSIDER (Red) - WITH ALTERNATIVES
```
┌─────────────────────────────────────────────────────────┐
│  ❌ Not Recommended Right Now                           │
│                                                         │
│  Gaming Console - $500.00                               │
│                                                         │
│  This purchase would exceed your monthly budget...      │
│                                                         │
│  💡 Cheaper Alternatives:                               │
│  (3 alternatives with Amazon links)                     │
└─────────────────────────────────────────────────────────┘
```

## Common Issues and Solutions

### Issue 1: "I don't see the Financial Advisor in sidebar"

**Solution:**
1. Make sure you're logged in
2. Check you're on a dashboard page (URL should be `/dashboard`, `/transactions`, etc.)
3. Look for "💰 Financial Advisor" between "Goals" and "Reports"
4. Try refreshing the page
5. Check browser console for errors (F12)

### Issue 2: "I only see the setup form, not the purchase advisor"

**Solution:**
This is normal! You need to:
1. Fill in Monthly Income (e.g., 5000)
2. Fill in Yearly Savings Goal (e.g., 12000)
3. Click "Save Financial Profile"
4. Wait for page to refresh
5. Then you'll see the purchase advisor

### Issue 3: "I filled the form but nothing happens"

**Solution:**
1. Check both fields are filled with numbers
2. Make sure numbers are positive (no negative values)
3. Check browser console for errors (F12)
4. Try refreshing and filling again
5. Make sure you're connected to the internet

### Issue 4: "I click 'Should I Buy This?' but no result appears"

**Solution:**
1. Make sure both Item Name and Price are filled
2. Check Price is a valid number
3. Wait 2-3 seconds for the API response
4. Check browser console for errors (F12)
5. Check network tab to see if API call is made

### Issue 5: "No cheaper alternatives showing"

**Solution:**
This is normal! Alternatives only show when:
- Recommendation is "WAIT" (yellow) or "RECONSIDER" (red)
- If recommendation is "BUY" (green), no alternatives needed
- You can afford it comfortably, so no alternatives shown

### Issue 6: "Monthly expenses showing $0"

**Solution:**
This is normal if you haven't added any transactions yet!
1. Go to "📓 Transactions" page
2. Add some expenses (or use voice assistant)
3. Go back to Financial Advisor
4. Refresh the page
5. Monthly expenses will update automatically

## Verification Checklist

Use this checklist to verify everything is working:

- [ ] Can login to the app
- [ ] Can see "💰 Financial Advisor" in sidebar
- [ ] Can click on Financial Advisor link
- [ ] Financial Advisor page loads
- [ ] Can see "Financial Profile Setup" form
- [ ] Can enter Monthly Income
- [ ] Can enter Yearly Savings Goal
- [ ] Can click "Save Financial Profile"
- [ ] Profile saves successfully
- [ ] Page shows financial overview cards
- [ ] Can scroll down to see "🛒 Smart Purchase Advisor"
- [ ] Can see "Item Name" input field
- [ ] Can see "Price ($)" input field
- [ ] Can see "Should I Buy This? 🤔" button
- [ ] Can enter item name (e.g., "iPhone 15")
- [ ] Can enter price (e.g., 999)
- [ ] Can click "Should I Buy This?"
- [ ] Recommendation appears (Buy/Wait/Reconsider)
- [ ] Can see detailed reasoning
- [ ] Can see impact on savings
- [ ] Can see cheaper alternatives (if applicable)
- [ ] Can click Amazon links (if alternatives shown)

## Still Not Working?

If you've tried everything above and it's still not working:

1. **Check Browser Console** (F12 → Console tab)
   - Look for red error messages
   - Take a screenshot

2. **Check Network Tab** (F12 → Network tab)
   - Click "Should I Buy This?"
   - Look for `/api/purchase-advisor` request
   - Check if it returns 200 OK or an error

3. **Verify Files Exist**
   ```bash
   ls src/app/\(dashboard\)/advisor/page.tsx
   ls src/components/tracker/SpendingTracker.tsx
   ls src/app/api/purchase-advisor/route.ts
   ls src/app/api/financial-profile/route.ts
   ```

4. **Check Server is Running**
   ```bash
   npm run dev
   ```
   Should show: `ready - started server on 0.0.0.0:3000`

5. **Clear Browser Cache**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or clear cache in browser settings

6. **Try Different Browser**
   - Test in Chrome, Firefox, or Safari
   - Disable browser extensions

## Quick Test

To quickly test if everything is working:

1. Login
2. Click "💰 Financial Advisor"
3. Enter: Income = 5000, Savings = 12000
4. Click "Save Financial Profile"
5. Scroll down to "🛒 Smart Purchase Advisor"
6. Enter: Item = "Test Item", Price = 100
7. Click "Should I Buy This?"
8. Should see: ✅ "Go Ahead! You Can Afford It"

If this works, the feature is working correctly!

## Contact Information

If you're still having issues after trying all the above:
- Check the documentation files
- Review the code in the files listed above
- Check for any TypeScript/JavaScript errors in console
