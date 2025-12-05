# Purchase Advisor Improvements Needed

## Current Problem
When disposable income is $3,000 and user asks about a $4,000 laptop:
- Shows "cheaper" alternatives like Lenovo IdeaPad, HP Pavilion, Acer Aspire
- But these are still expensive options
- Doesn't consider that user CAN afford the $4,000 laptop with $3k disposable income

## Solution: Smarter Recommendations

### Update Logic in `src/app/api/purchase-advisor/route.ts` (line 303-326)

Replace the recommendation logic with:

```typescript
// Can afford comfortably (more than 30% buffer remaining)
if (afterPurchaseBalance > disposableIncome * 0.3) {
  recommendation = "buy";
  reason = `✅ You can afford this! After this purchase, you'll still have $${afterPurchaseBalance.toFixed(2)} remaining. Your savings goal remains on track.`;
}
// Affordable but tight (10-30% buffer)
else if (afterPurchaseBalance > disposableIncome * 0.1 && afterPurchaseBalance > 0) {
  recommendation = "buy";
  reason = `✅ This fits your budget. After this purchase, you'll have $${afterPurchaseBalance.toFixed(2)} left. Be mindful of additional expenses.`;
}
// Very tight (0-10% buffer)
else if (afterPurchaseBalance > 0 && afterPurchaseBalance <= disposableIncome * 0.1) {
  recommendation = "wait";
  reason = `🟡 This will leave you with only $${afterPurchaseBalance.toFixed(2)} for the month. Consider these better-value alternatives.`;
  alternativeSuggestions = getAlternativeSuggestions(itemName, itemPrice);
}
// Exceeds disposable income
else if (afterPurchaseBalance < 0 && afterPurchaseBalance > -monthlySavingsTarget * 0.3) {
  recommendation = "reconsider";
  reason = `🔴 This exceeds your disposable income by $${Math.abs(afterPurchaseBalance).toFixed(2)}. Consider these more affordable options.`;
  alternativeSuggestions = getAlternativeSuggestions(itemName, itemPrice);
}
// Seriously impacts savings
else {
  recommendation = "reconsider";
  reason = `🔴 This would seriously impact your savings. You'd be $${Math.abs(afterPurchaseBalance).toFixed(2)} over budget. Try these budget-friendly alternatives.`;
  alternativeSuggestions = getAlternativeSuggestions(itemName, itemPrice);
}
```

## Key Changes

1. **More generous "buy" threshold** - If you have 30%+ buffer left, it's a clear "buy"
2. **New "buy" tier** - 10-30% buffer is still "buy" but with caution
3. **Only show alternatives when needed** - Don't show alternatives if user can afford it
4. **Clearer messaging** - Use emojis and specific dollar amounts

## Example Scenarios

### Scenario 1: $4,000 laptop, $3,000 disposable income
- After purchase: -$1,000
- **Result:** "reconsider" with alternatives
- **Message:** "This exceeds your disposable income by $1,000"

### Scenario 2: $2,000 laptop, $3,000 disposable income  
- After purchase: $1,000 (33% buffer)
- **Result:** "buy"
- **Message:** "✅ You can afford this! You'll still have $1,000 remaining"

### Scenario 3: $2,700 laptop, $3,000 disposable income
- After purchase: $300 (10% buffer)
- **Result:** "buy" with caution
- **Message:** "✅ This fits your budget. You'll have $300 left. Be mindful..."

### Scenario 4: $2,900 laptop, $3,000 disposable income
- After purchase: $100 (3% buffer)
- **Result:** "wait" with alternatives
- **Message:** "🟡 This will leave you with only $100 for the month..."

## Benefits

✅ More realistic recommendations
✅ Respects user's actual budget
✅ Only shows alternatives when truly needed
✅ Clearer decision-making guidance
✅ Better user experience
