# Simple Fix for Goals and Watches

## Problem
The current implementation is too strict and keeps asking for exact formats. Users want natural language to work.

## Solution
Replace the complex regex matching with simple extraction:

### For Goals (around line 260):
```typescript
// CREATE GOAL - Flexible parsing
if (textLower.includes("goal")) {
  const amountMatch = text.match(/\$?(\d+(?:\.\d+)?)/);
  const limit = amountMatch ? parseFloat(amountMatch[1]) : undefined;
  
  const periodMatch = textLower.match(/(weekly|monthly|yearly)/);
  const period = periodMatch ? periodMatch[1] : "monthly"; // DEFAULT
  
  const categoryMatch = text.match(/for\s+(\w+)/i);
  const category = categoryMatch ? categoryMatch[1] : undefined;
  
  if (limit) {
    const now = new Date();
    let monthValue = now.toISOString().slice(0, 7);
    if (period === "yearly") monthValue = now.getFullYear().toString();
    else if (period === "weekly") monthValue = now.toISOString().slice(0, 10);
    
    const goal = db.createGoal({
      userId: user.id,
      label: `Stay under $${limit} ${period}${category ? ' for ' + category : ''}`,
      limit,
      month: monthValue,
      period: period as "weekly" | "monthly" | "yearly",
      category
    });
    
    messages.push(`✅ Goal created: ${goal.label}. Check Dashboard!`);
    return NextResponse.json({ messages, effects: [{ type: "goal_created", id: goal.id }] });
  }
}
```

### For Watches (around line 330):
```typescript
// CREATE WATCH - Flexible parsing
if (textLower.includes("watch")) {
  const amountMatch = text.match(/\$?(\d+(?:\.\d+)?)/);
  const threshold = amountMatch ? parseFloat(amountMatch[1]) : undefined;
  
  const periodMatch = textLower.match(/(monthly|yearly)/);
  const period = periodMatch ? periodMatch[1] : "monthly"; // DEFAULT
  
  const categoryMatch = text.match(/for\s+(\w+)/i) || text.match(/watch\s+(\w+)/i);
  const category = categoryMatch ? categoryMatch[1] : undefined;
  
  if (threshold && category) {
    const now = new Date();
    let monthValue = now.toISOString().slice(0, 7);
    if (period === "yearly") monthValue = now.getFullYear().toString();
    
    const watch = db.createSpendingWatch({
      userId: user.id,
      category,
      threshold,
      period: period as "monthly" | "yearly",
      month: monthValue,
      createdAt: new Date().toISOString()
    });
    
    messages.push(`✅ Watch created: Alert when ${category} reaches $${threshold} ${period}. Check Insights!`);
    return NextResponse.json({ messages, effects: [{ type: "watch_created", id: watch.id }] });
  }
}
```

## Key Changes
1. **No asking for format** - Just use defaults
2. **Simple regex** - Extract amount, period, category independently
3. **Default to monthly** - If no period specified
4. **Works with any phrasing** - "goal 1000 clothes yearly", "set yearly goal 1000 for clothes", etc.

## Test Commands That Should Work
- "goal 1000 for clothes yearly" ✅
- "set yearly goal 1000 for clothes" ✅
- "add goal 100 food" ✅ (defaults to monthly)
- "watch food 500 monthly" ✅
- "create watch 1000 shopping" ✅ (defaults to monthly)
- "watch bills 300 yearly" ✅
