# Authentication Fix - Financial Advisor

## Issue Found:
The Financial Advisor APIs were looking for a cookie named `"session"`, but the authentication system uses `"hallowallet_token"`.

## Error:
```
Error response: {error: 'Unauthorized'}
```

## Root Cause:
```typescript
// WRONG - Looking for "session" cookie
const sessionCookie = cookieStore.get("session");

// CORRECT - Should look for "hallowallet_token" cookie
const sessionCookie = cookieStore.get("hallowallet_token");
```

## Files Fixed:

### 1. src/app/api/financial-profile/route.ts
- Changed `get("session")` to `get("hallowallet_token")` in GET handler
- Changed `get("session")` to `get("hallowallet_token")` in POST handler

### 2. src/app/api/purchase-advisor/route.ts
- Changed `get("session")` to `get("hallowallet_token")` in POST handler

## How to Test:

1. **Make sure you're logged in**
   - Go to `/login`
   - Login with your credentials

2. **Go to Financial Advisor**
   - Click "💰 Financial Advisor" in sidebar

3. **Fill the form**
   - Monthly Income: `5000`
   - Yearly Savings Goal: `12000`

4. **Click "Save Financial Profile"**
   - Should now work!
   - No more "Unauthorized" error
   - Page should refresh and show financial overview

5. **Scroll down**
   - You should see "🛒 Smart Purchase Advisor"
   - With item name and price inputs

## Expected Result:

After clicking "Save Financial Profile", you should see:

```
Console output:
Submitting profile: {income: "5000", savingsGoal: "12000"}
Response status: 200
Profile saved successfully: {monthlyIncome: 5000, ...}
```

Then the page shows:
```
┌─────────────────────────────────────────────────────────────────┐
│  💰 Spending Tracker & Advisor              ⚙️ Update Profile  │
└─────────────────────────────────────────────────────────────────┘

Financial Overview Cards (Income, Savings Goal, Spending)

[Scroll down...]

┌─────────────────────────────────────────────────────────────────┐
│  🛒 Smart Purchase Advisor                                      │
│                                                                 │
│  Item Name                    Price ($)                         │
│  ┌─────────────────────────┐ ┌─────────────────────────────┐   │
│  │ [Type here]             │ │ [Type here]                 │   │
│  └─────────────────────────┘ └─────────────────────────────┘   │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │         [Should I Buy This? 🤔]                           │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Summary:

✅ **Fixed**: Cookie name mismatch
✅ **Changed**: `"session"` → `"hallowallet_token"`
✅ **Result**: Authentication now works correctly

**The "Save Financial Profile" button should now work!**

Just make sure you're logged in first, then try saving your profile again.
